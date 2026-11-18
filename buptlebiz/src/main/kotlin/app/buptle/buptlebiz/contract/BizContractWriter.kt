package app.buptle.buptlebiz.contract

import app.buptle.buptlebiz.db.BizWriteDatabase
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.enums.EnumCatalogRepository
import java.math.BigDecimal
import java.sql.Timestamp
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId
import org.springframework.beans.factory.ObjectProvider
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper

/**
 * Biz DB 의 계약 데이터를 고친다 (쓰기 연결 사용). Django 의 저장 로직(이력 기록, 캐시, 시그널)은 거치지 않고 컬럼 값만 바꾼다.
 * 쿼리에는 코드에 정해 둔 컬럼명만 쓰고 값은 모두 바인딩으로 넘긴다.
 * 값의 이름(역할, 서명 방식 등)은 BuptleManager enum 표에서 코드로 바꾼다.
 */
@Component
class BizContractWriter(
	private val write: ObjectProvider<BizWriteDatabase>,
	private val enums: EnumCatalogRepository,
	private val json: ObjectMapper,
) {

	/** 계약 기본 정보를 고친다. 바뀐 항목 수. 계약이 없으면 null */
	fun updateBasic(schema: String, viewCode: String, r: ContractUpdateRequest): Int? = db().forTenant(schema) { jdbc ->
		val id = contractId(jdbc, viewCode) ?: return@forTenant null
		val s = Sets()
		r.name?.let { s.set("name", it) }
		r.summary?.let { s.set("description", it) }
		r.amount?.let { s.set("amount_finance", BigDecimal.valueOf(it)) }
		r.lang?.let { s.set("language_type", LANG_TO_BIZ[it] ?: throw invalid("지원하지 않는 언어입니다: $it")) }
		r.statusCode?.let { s.set("status_on_workflow", it) }
		r.startDate?.let { s.set("valid_from", ts(it.atStartOfDay(KST).toInstant())) }
		r.endDate?.let { s.set("valid_until", ts(it.atTime(LocalTime.of(23, 59, 59)).atZone(KST).toInstant())) }
		r.createdAt?.let { s.set("create_time", ts(it)) }
		r.autoRenew?.let { s.set("\"isAutoUpdateValid\"", it) }
		r.deleted?.let {
			s.set("isdeleted", it)
			if (r.deletedAt == null) if (it) s.raw("delete_time", "now()") else s.set("delete_time", null)
		}
		r.deletedAt?.let { s.set("delete_time", ts(it)) }
		if (r.updatedAt != null) s.set("update_time", ts(r.updatedAt)) else s.raw("update_time", "now()")
		val changed = s.count - if (r.updatedAt == null) 1 else 0
		if (changed > 0) s.run(jdbc, "contract_bcontract", "id = :id", mapOf("id" to id))
		changed
	}

	/** 참여 유저(contract_bcontractor)를 고친다. memberId 는 "m" + id. 바뀐 항목 수. 없으면 null */
	fun updateMember(schema: String, viewCode: String, memberId: String, r: ContractMemberUpdateRequest): Int? = db().forTenant(schema) { jdbc ->
		val contractId = contractId(jdbc, viewCode) ?: return@forTenant null
		val id = memberId.removePrefix("m").toLongOrNull() ?: return@forTenant null
		val row = jdbc.query(
			"select id, user_id, classification, responsibility from contract_bcontractor where id = :id and contract_id = :cid",
			mapOf("id" to id, "cid" to contractId),
		) { rs, _ -> Member(rs.getLong("id"), (rs.getObject("user_id") as? Number)?.toLong(), rs.getInt("responsibility")) }.firstOrNull() ?: return@forTenant null
		val external = row.userId == null

		val s = Sets()
		if (external) {
			r.name?.let { s.set("name", it.trim()) }
			r.email?.let {
				val dup = jdbc.queryForObject(
					"select count(*) from contract_bcontractor where contract_id = :cid and id <> :id and isdeleted = false and lower(email) = lower(:email)",
					mapOf("cid" to contractId, "id" to id, "email" to it.trim()), Int::class.java,
				) ?: 0
				if (dup > 0) throw BusinessException(CommonErrorCode.CONFLICT, "DUPLICATE_MEMBER: 같은 이메일이 이미 참여 중입니다.")
				s.set("email", it.trim())
			}
			r.company?.let { s.set("company_name", it) }
		}
		r.dept?.let { s.set("dept_name", it) }
		r.phone?.let { s.set("mobile", it) }
		r.lang?.let { s.set("language", it) }
		if (!external) {
			r.roles?.let { s.set("classification", intArray(roleCodes(it)), "int[]") }
			r.perm?.let { s.set("responsibility", responsibility(it, row.responsibility)) }
		}
		r.signMethod?.let { s.set("sig_classification_restrict", intArray(signClassCodes(it)), "int[]") }
		r.signType?.let { s.set("sig_method_restrict", intArray(signMethodCodes(it)), "int[]") }
		r.joinedAt?.let { s.set("create_time", ts(it)) }
		r.deleted?.let {
			s.set("isdeleted", it)
			if (r.deletedAt == null) if (it) s.raw("delete_time", "now()") else s.set("delete_time", null)
		}
		r.deletedAt?.let { s.set("delete_time", ts(it)) }
		if (r.updatedAt != null) s.set("update_time", ts(r.updatedAt)) else s.raw("update_time", "now()")
		var changed = s.count - if (r.updatedAt == null) 1 else 0

		// 서명 상태는 이 화면에서 완료로 만들 수 없고, 완료된 서명을 취소(대기)하는 것만 가능하다.
		if (r.signStatus != null) {
			if (r.signStatus != SIGN_PENDING) throw invalid("서명 상태는 서명 취소(대기)로만 바꿀 수 있습니다.")
			val cancelled = jdbc.update(
				"update contract_bsignature set isdeleted = true, delete_time = now() where contractor_id = :id and isdeleted = false",
				mapOf("id" to id),
			)
			if (cancelled > 0) changed++
		}
		if (changed > 0) s.run(jdbc, "contract_bcontractor", "id = :id", mapOf("id" to id))
		changed
	}

	/** 참여 유저를 추가한다. 만든 참여 유저의 id("m" + id). 계약이 없으면 null */
	fun addMember(schema: String, viewCode: String, r: ContractMemberCreateRequest): String? = db().forTenant(schema) { jdbc ->
		val contractId = contractId(jdbc, viewCode) ?: return@forTenant null
		val external = r.kind == "external"
		val email = r.email.trim()
		val dup = jdbc.queryForObject(
			"select count(*) from contract_bcontractor where contract_id = :cid and isdeleted = false and lower(email) = lower(:email)",
			mapOf("cid" to contractId, "email" to email), Int::class.java,
		) ?: 0
		if (dup > 0) throw BusinessException(CommonErrorCode.CONFLICT, "DUPLICATE_MEMBER: 같은 이메일이 이미 참여 중입니다.")

		var userId: Long? = null
		var dept = r.dept.orEmpty()
		var phone = r.phone.orEmpty()
		if (!external) {
			val user = jdbc.query(
				"""
				select u.id, p.department, p.tel_num from users_user u left join main_userprofile p on p.user_id = u.id
				where lower(u.email) = lower(:email) and u.is_active = true order by u.id limit 1
				""".trimIndent(),
				mapOf("email" to email),
			) { rs, _ -> Triple(rs.getLong("id"), rs.getString("department").orEmpty(), rs.getString("tel_num").orEmpty()) }.firstOrNull()
				?: throw BusinessException(CommonErrorCode.NOT_FOUND, "사내 유저를 찾을 수 없습니다. 이메일을 확인해 주세요.")
			userId = user.first
			if (dept.isEmpty()) dept = user.second
			if (phone.isEmpty()) phone = user.third
		}
		val roles = if (external) listOf(EXTERNAL_ROLE_CODE) else roleCodes(r.roles ?: throw invalid("내부 유저는 역할이 필요합니다."))
		val resp = if (external) 0 else responsibility(r.perm.orEmpty(), 0)
		val params = mapOf(
			"cid" to contractId, "uid" to userId, "name" to r.name.trim(), "email" to email, "company" to r.company.orEmpty(), "mobile" to phone,
			"resp" to resp, "lang" to r.lang, "sigMethod" to intArray(signMethodCodes(r.signType)), "sigClass" to intArray(signClassCodes(r.signMethod)),
			"cls" to intArray(roles), "dept" to dept,
		)
		jdbc.queryForObject(
			"""
			insert into contract_bcontractor
			  (create_time, update_time, isdeleted, name, email, company_name, company_reg, mobile, responsibility, language,
			   sig_method_restrict, sig_classification_restrict, classification, user_id, contract_id, dept_name)
			values (now(), now(), false, :name, :email, :company, '', :mobile, :resp, :lang,
			   cast(:sigMethod as int[]), cast(:sigClass as int[]), cast(:cls as int[]), :uid, :cid, :dept)
			returning id
			""".trimIndent(),
			params, Long::class.java,
		)?.let { "m$it" }
	}

	/** 진행 히스토리를 고친다. historyId 는 "h" + id. 바뀐 항목 수. 없으면 null */
	fun updateHistory(schema: String, viewCode: String, historyId: String, r: ContractHistoryUpdateRequest): Int? = db().forTenant(schema) { jdbc ->
		val contractId = contractId(jdbc, viewCode) ?: return@forTenant null
		val id = historyId.removePrefix("h").toLongOrNull() ?: return@forTenant null
		val exists = jdbc.queryForObject("select count(*) from contract_bcontract_history where id = :id and contract_id = :cid", mapOf("id" to id, "cid" to contractId), Int::class.java) ?: 0
		if (exists == 0) return@forTenant null

		val s = Sets()
		r.comment?.let { s.set("comment", it) }
		r.at?.let { s.set("create_time", ts(it)) }
		r.deleted?.let {
			s.set("isdeleted", it)
			if (it) s.raw("delete_time", "now()") else s.set("delete_time", null)
		}
		r.user?.let { name ->
			// 이 계약의 참여 유저 이름만 허용한다
			val member = jdbc.query(
				"select ct.id, ct.user_id from contract_bcontractor ct left join users_user u on u.id = ct.user_id where ct.contract_id = :cid and coalesce(nullif(u.first_name, ''), ct.name) = :name order by ct.id limit 1",
				mapOf("cid" to contractId, "name" to name),
			) { rs, _ -> rs.getLong("id") to (rs.getObject("user_id") as? Number)?.toLong() }.firstOrNull() ?: throw invalid("이 계약의 참여 유저가 아닙니다: $name")
			s.set("contractor_id", member.first)
			s.set("create_user_id", member.second)
		}
		val changed = s.count
		s.raw("update_time", "now()")
		if (changed > 0) s.run(jdbc, "contract_bcontract_history", "id = :id", mapOf("id" to id))
		changed
	}

	/**
	 * 워크플로우 설정 항목 값을 고친다(workflows_bworkflow_process.view_data.key_value). 바뀐 항목 수. 계약이 없으면 null.
	 * 주의: 워크플로우(rev)는 여러 계약이 같이 쓰므로 같은 워크플로우를 쓰는 다른 계약의 설정도 함께 바뀐다.
	 */
	fun updateWorkflow(schema: String, viewCode: String, r: WorkflowUpdateRequest): Int? = db().forTenant(schema) { jdbc ->
		val head = jdbc.query(
			"select workflow_id, workflow_rev_num::text as rev from contract_bcontract where view_code = :code order by isdeleted, id desc limit 1",
			mapOf("code" to viewCode),
		) { rs, _ -> (rs.getObject("workflow_id") as? Number)?.toLong() to rs.getString("rev") }.firstOrNull() ?: return@forTenant null
		val (workflowId, rev) = head
		if (workflowId == null || rev == null) throw invalid("워크플로우가 연결되지 않은 계약입니다.")

		val rows = jdbc.query(
			"select id, classification, view_data::text as view_data from workflows_bworkflow_process where workflow_id = :wid and rev_num::text = :rev and isdeleted = false order by process_sort, id",
			mapOf("wid" to workflowId, "rev" to rev),
		) { rs, _ -> ProcessRow(rs.getLong("id"), rs.getInt("classification"), json.readTree(rs.getString("view_data"))) }
		val items = enums.findDetail("BIZ_WORKFLOW_ITEM")?.values.orEmpty().associateBy { it.code }

		var changed = 0
		for (u in r.attrs) {
			val row = rows.firstOrNull { attrKey(it) == u.key } ?: throw invalid("워크플로우 항목을 찾을 수 없습니다: ${u.key}")
			val item = items[row.classification.toString()]
			val choices = item?.childSetCode?.let { enums.findDetail(it)?.values }.orEmpty().sortedBy { it.sortOrder }
			val codes = u.value.map { label -> choices.firstOrNull { it.label == label }?.code ?: throw invalid("선택할 수 없는 값입니다: ${u.key} = $label") }
			val current = row.data.get("key_value")
			val next = if (current != null && current.isArray) json.writeValueAsString(codes.map { asOriginalType(it, current) }) else json.writeValueAsString(codes.firstOrNull() ?: "")
			val same = if (current != null && current.isArray) current.values().map { it.asText() } == codes else (current?.asText().orEmpty() == (codes.firstOrNull() ?: ""))
			if (same) continue
			jdbc.update(
				"update workflows_bworkflow_process set view_data = jsonb_set(view_data, '{key_value}', cast(:v as jsonb)) where id = :id",
				mapOf("v" to next, "id" to row.id),
			)
			changed++
		}
		changed
	}

	private fun attrKey(r: ProcessRow): String {
		val name = r.data.get("key_name")?.asText().orEmpty()
		return if (name in SHARED_KEYS) "${name}_${r.classification}" else name
	}

	/** 배열 안의 값이 원래 숫자였으면 숫자로 쓴다 (예: template_edit [1, 0]) */
	private fun asOriginalType(code: String, original: JsonNode): Any {
		val first = original.values().firstOrNull()
		return if (first != null && first.isNumber) code.toIntOrNull() ?: code else code
	}

	private fun roleCodes(labels: List<String>): List<Int> {
		val byLabel = enums.findDetail("BIZ_CONTRACTOR_ROLE")?.values.orEmpty().associate { it.label to it.code }
		return labels.map { (byLabel[it] ?: throw invalid("알 수 없는 역할입니다: $it")).toInt() }
	}

	private fun signClassCodes(text: String): List<Int> =
		split(text).map { SIGN_CLASS_LABELS[it] ?: throw invalid("알 수 없는 서명 방식입니다: $it") }

	private fun signMethodCodes(text: String): List<Int> {
		val byLabel = enums.findDetail("BIZ_SIGN_METHOD")?.values.orEmpty().associate { it.label to it.code }
		return split(text).map { (byLabel[it] ?: throw invalid("알 수 없는 서명 종류입니다: $it")).toInt() }
	}

	/** ", " 로 이어 붙인 값을 나눈다. "-" 이거나 비면 빈 목록 */
	private fun split(text: String): List<String> = if (text.isBlank() || text == "-") emptyList() else text.split(", ").map { it.trim() }

	/** 권한 이름 → responsibility 비트마스크(2 조회, 1 서명, 4096 관리). 이 화면이 다루지 않는 비트는 그대로 둔다 */
	private fun responsibility(perm: List<String>, current: Int): Int {
		val managed = RES_WATCH or RES_SIGN or RES_MASTER
		var bits = current and managed.inv()
		if ("조회" in perm) bits = bits or RES_WATCH
		if ("서명" in perm) bits = bits or RES_SIGN
		if ("관리" in perm || "관리자" in perm) bits = bits or RES_MASTER
		return bits
	}

	private fun intArray(list: List<Int>) = "{" + list.joinToString(",") + "}"

	private fun ts(instant: Instant) = Timestamp.from(instant)

	private fun contractId(jdbc: NamedParameterJdbcTemplate, viewCode: String): Long? =
		jdbc.query("select id from contract_bcontract where view_code = :code order by isdeleted, id desc limit 1", mapOf("code" to viewCode)) { rs, _ -> rs.getLong(1) }.firstOrNull()

	private fun invalid(message: String) = BusinessException(CommonErrorCode.INVALID_REQUEST, message)

	private fun db(): BizWriteDatabase = write.ifAvailable ?: throw IllegalStateException("Biz DB 쓰기 연결이 없습니다 (BIZ_DB_URL).")

	/** UPDATE 의 SET 절을 모은다. 컬럼명은 코드에 정해 둔 것만 넣고 값은 바인딩한다 */
	private class Sets {
		private val parts = mutableListOf<String>()
		private val params = mutableMapOf<String, Any?>()
		val count get() = parts.size

		fun set(column: String, value: Any?, cast: String? = null) {
			val key = "p" + parts.size
			parts += if (cast != null) "$column = cast(:$key as $cast)" else "$column = :$key"
			params[key] = value
		}

		fun raw(column: String, expression: String) {
			parts += "$column = $expression"
		}

		fun run(jdbc: NamedParameterJdbcTemplate, table: String, where: String, whereParams: Map<String, Any?>) {
			jdbc.update("update $table set ${parts.joinToString(", ")} where $where", params + whereParams)
		}
	}

	private data class Member(val id: Long, val userId: Long?, val responsibility: Int)

	private data class ProcessRow(val id: Long, val classification: Int, val data: JsonNode)

	private companion object {
		val KST: ZoneId = ZoneId.of("Asia/Seoul")
		val LANG_TO_BIZ = mapOf("ko" to "KOR", "en" to "ENG", "ja" to "JPN")
		val SIGN_CLASS_LABELS = mapOf("개인 서명" to 0, "회사 서명" to 1, "수기 서명" to 2)
		const val SIGN_PENDING = "대기"
		const val EXTERNAL_ROLE_CODE = 1
		const val RES_SIGN = 1
		const val RES_WATCH = 2
		const val RES_MASTER = 4096
		val SHARED_KEYS = setOf("user_confirm")
	}
}
