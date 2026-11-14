package app.buptle.buptlebiz.contract

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.operation.enums.EnumCatalogRepository
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.sql.ResultSet
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

/**
 * 계약에 걸린 workflow 를 Biz DB 에서 읽는다 (조회 전용).
 * 단계(process)는 BuptleManager enum 표의 계약 상태 분류(CONT_GRP_STS_*)로 만들고, 단계 안의 사람은 역할 코드로 나눈다.
 * 설정 항목의 이름과 선택지는 BuptleManager enum 표(BIZ_WORKFLOW_ITEM)에서 읽는다. 표에 없는 항목은 키 이름을 그대로 보여 준다.
 */
@Component
class BizWorkflowReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
	private val json: ObjectMapper,
) {

	/** 계약(view_code)이 없으면 null. workflow 가 연결되지 않은 계약은 이름과 목록이 비어 있다 */
	fun workflow(schema: String, viewCode: String): WorkflowResponse? {
		val db = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")
		val status = enums.findDetail("BIZ_CONTRACT_STATUS")
		val items = workflowItems()
		val roleLabels = enums.findDetail("BIZ_CONTRACTOR_ROLE")?.values?.associate { it.code to it.label }.orEmpty()
		return db.forTenant(schema) { jdbc ->
			val head = jdbc.query(
				"""
				select c.id, c.status_on_workflow, c.workflow_id, c.workflow_rev_num::text as rev, w.name
				from contract_bcontract c
				left join workflows_bworkflow w on w.id = c.workflow_id
				where c.view_code = :code
				order by c.isdeleted, c.id desc
				limit 1
				""".trimIndent(),
				mapOf("code" to viewCode),
			) { rs, _ -> Head(rs.getLong("id"), rs.getInt("status_on_workflow"), rs.getObject("workflow_id") as? Number, rs.getString("rev"), rs.getString("name")) }
				.firstOrNull() ?: return@forTenant null

			val params = mapOf("wid" to head.workflowId?.toLong(), "rev" to head.rev)

			val attrs = if (head.workflowId == null || head.rev == null) emptyList() else jdbc.query(
				"""
				select p.classification, p.view_data::text as view_data from workflows_bworkflow_process p
				where p.workflow_id = :wid and p.rev_num::text = :rev and p.isdeleted = false
				order by p.process_sort, p.id
				""".trimIndent(),
				params,
			) { rs, _ -> attr(rs.getInt("classification"), rs.getString("view_data"), items) }.filterNotNull().distinctBy { it.key }

			val users = if (head.workflowId == null || head.rev == null) emptyList() else jdbc.query(
				"""
				select wc.classification, u.first_name as name, u.email, p.department as dept, p.legacy_department_id
				from workflows_bworkflow_contractor wc
				left join users_user u on u.id = wc.user_id
				left join main_userprofile p on p.user_id = wc.user_id
				where wc.workflow_id = :wid and wc.rev_num::text = :rev and wc.isdeleted = false
				order by wc.id
				""".trimIndent(),
				params,
			) { rs, _ ->
				ints(rs, "classification").mapNotNull { role ->
					val groupCode = ROLE_GROUP[role] ?: return@mapNotNull null
					Member(role, groupCode, rs.getString("name").orEmpty(), rs.getString("email").orEmpty(), rs.getString("dept").orEmpty())
				}
			}.flatten()

			val groups = status?.groups?.sortedBy { it.sortOrder }.orEmpty().filter { it.code != STOP_GROUP }
			val valuesByGroup = status?.values?.filter { it.active }?.groupBy { it.groupCode }.orEmpty()
			val groupNames = status?.groups?.associate { it.code to it.name }.orEmpty()
			val currentGroup = status?.values?.firstOrNull { it.code == head.status.toString() }?.groupCode

			WorkflowResponse(
				name = head.name.orEmpty(),
				rev = head.rev.orEmpty(),
				attrs = attrs,
				users = users.map { WorkflowUser(roleLabels[it.role.toString()] ?: it.role.toString(), it.name, it.email, it.dept, groupNames[it.groupCode].orEmpty(), null) },
				process = groups.map { g ->
					WorkflowStage(
						name = g.name,
						substages = valuesByGroup[g.code]?.sortedBy { it.sortOrder }?.map { it.label }.orEmpty(),
						people = users.filter { it.groupCode == g.code && it.role !in PREDECESSOR_ROLES }.map { WorkflowPerson(it.name, it.dept) },
					)
				},
				currentStage = currentGroup?.let { groupNames[it] }.orEmpty(),
			)
		}
	}

	/** 워크플로우 항목(classification)별 이름과 선택값. BuptleManager enum 표(BIZ_WORKFLOW_ITEM, 항목의 child_set_id 가 가리키는 선택값 표)에서 읽는다 */
	private fun workflowItems(): Map<Int, Item> {
		val detail = enums.findDetail("BIZ_WORKFLOW_ITEM") ?: return emptyMap()
		return detail.values.mapNotNull { v ->
			val cls = v.code.toIntOrNull() ?: return@mapNotNull null
			val choices = v.childSetCode?.let { enums.findDetail(it)?.values }.orEmpty()
			cls to Item(v.label, choices.filter { it.active }.sortedBy { it.sortOrder }.map { it.label }.distinct(), choices.associate { it.code to it.label })
		}.toMap()
	}

	private fun attr(classification: Int, raw: String?, items: Map<Int, Item>): WorkflowAttr? {
		val node = raw?.let { runCatching { json.readTree(it) }.getOrNull() } ?: return null
		val keyName = node.get("key_name")?.asText()?.takeIf { it.isNotBlank() } ?: return null
		val item = items[classification]
		// 같은 key_name 이 여러 항목에 쓰이므로(user_confirm) 항목 번호와 함께 구분한다
		val key = if (keyName in SHARED_KEYS) "${keyName}_$classification" else keyName
		val value = node.get("key_value")
		val values: List<String> = when {
			value == null || value.isNull -> emptyList()
			value.isArray -> value.values().map { text(it) }
			else -> listOf(text(value))
		}.map { item?.byCode?.get(it) ?: it }
		val type = node.get("type")?.asText()
		val multi = type == "check" || (type == null && value?.isArray == true)
		return WorkflowAttr(key, item?.label ?: ATTR_LABEL[keyName] ?: keyName, if (multi) "multi" else "single", item?.options.orEmpty(), values)
	}

	private fun text(n: JsonNode) = if (n.isString) n.asText() else n.toString()

	private fun ints(rs: ResultSet, column: String): List<Int> = (rs.getArray(column)?.array as? Array<*>)?.mapNotNull { (it as? Number)?.toInt() }.orEmpty()

	private data class Item(val label: String, val options: List<String>, val byCode: Map<String, String>)

	private data class Head(val id: Long, val status: Int, val workflowId: Number?, val rev: String?, val name: String?)

	private data class Member(val role: Int, val groupCode: String, val name: String, val email: String, val dept: String)

	private companion object {
		const val STOP_GROUP = "CONT_GRP_STS_STOP"

		/** 서로 다른 항목(5번, 9번)이 같은 key_name 을 쓰는 키 */
		val SHARED_KEYS = setOf("user_confirm")

		/** 역할 코드 → 담당 단계(상태 분류). 데이터 매핑 엑셀의 제안을 따른 것이라 확인이 필요하다 */
		val ROLE_GROUP = mapOf(
			0 to "CONT_GRP_STS_DRAFT",
			6 to "CONT_GRP_STS_DEP_PRC",
			3 to "CONT_GRP_STS_REVIEW", 19 to "CONT_GRP_STS_REVIEW", 20 to "CONT_GRP_STS_REVIEW",
			23 to "CONT_GRP_STS_REVIEW", 24 to "CONT_GRP_STS_REVIEW", 25 to "CONT_GRP_STS_REVIEW", 26 to "CONT_GRP_STS_REVIEW",
			4 to "CONT_GRP_STS_LEGAL_PRC",
			7 to "CONT_GRP_STS_SIGN", 12 to "CONT_GRP_STS_SIGN",
			8 to "CONT_GRP_STS_DOC_CONTRACT_POST_PROC",
		)

		/** 전임자 역할. 단계의 담당자로는 보여 주지 않는다 */
		val PREDECESSOR_ROLES = setOf(9, 10, 11, 14, 27)

		val ATTR_LABEL = mapOf(
			"contract_type" to "계약 형태",
			"sign_type" to "서명 방식",
			"legal_review" to "법무 검토",
			"dept_confirm" to "부서장 승인",
			"user_confirm" to "최종 승인",
		)
	}
}
