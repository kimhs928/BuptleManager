package app.buptle.buptlebiz.contract

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.operation.enums.EnumCatalogRepository
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper
import java.sql.ResultSet
import java.time.Instant
import org.springframework.beans.factory.ObjectProvider
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component

/**
 * 계약 진행 히스토리(contract_bcontract_history)와 이메일 발송 내역(main_bmailrequesthistory)을 Biz DB 에서 읽는다 (조회 전용).
 * 단계 이름은 BuptleManager 의 enum 표(BIZ_CONTRACT_STATUS)에서 가져온다.
 */
@Component
class BizHistoryReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
	private val json: ObjectMapper,
) {

	/** 계약(view_code)이 없으면 null */
	fun history(schema: String, viewCode: String, includeDeleted: Boolean, docOnly: Boolean, user: String?, action: String?): ContractHistoryListResponse? {
		val statusLabels = enums.findDetail("BIZ_CONTRACT_STATUS")?.values?.associate { it.code to it.label }.orEmpty()
		return db().forTenant(schema) { jdbc ->
			val contractId = contractId(jdbc, viewCode) ?: return@forTenant null
			val all = jdbc.query(
				"""
				select h.id, h.action_type, h.action_text, h.create_time, h.isdeleted, h.comment, h.extra_info::text as extra_info, h.file,
				       coalesce(nullif(u.first_name, ''), nullif(ct.name, ''), nullif(h.name, ''), '') as user_name
				from contract_bcontract_history h
				left join users_user u on u.id = h.create_user_id
				left join contract_bcontractor ct on ct.id = h.contractor_id
				where h.contract_id = :cid
				order by h.create_time, h.id
				""".trimIndent(),
				mapOf("cid" to contractId),
			) { rs, _ -> toRow(jdbc, rs, statusLabels) }
			val shown = all.filter { includeDeleted || !it.deleted }
				.filter { !docOnly || it.extra.docId != null }
				.filter { user == null || it.user == user }
				.filter { action == null || it.action == action }
			ContractHistoryListResponse(
				items = shown,
				users = all.map { it.user }.filter { it.isNotEmpty() }.distinct(),
				actions = all.map { it.action }.distinct(),
			)
		}
	}

	fun emails(schema: String, viewCode: String): List<ContractEmailResponse>? =
		db().forTenant(schema) { jdbc ->
			val contractId = contractId(jdbc, viewCode) ?: return@forTenant null
			jdbc.query(
				"""
				select m.id, m.created_time, m.modified_time, m.user_name, m.from_email, m.target_email, m.link,
				       m.params_all ->> 'title' as title, m.params_all ->> 'content' as content,
				       (select ct.name from contract_bcontractor ct
				         where ct.contract_id = :cid and lower(ct.email) = lower(m.target_email) order by ct.id limit 1) as receiver
				from main_bmailrequesthistory m
				where m.params_all ->> 'conid' = :cidText
				order by m.created_time desc, m.id desc
				""".trimIndent(),
				mapOf("cid" to contractId, "cidText" to contractId.toString()),
			) { rs, _ ->
				ContractEmailResponse(
					id = "e${rs.getLong("id")}",
					createdAt = rs.instant("created_time") ?: Instant.EPOCH,
					updatedAt = rs.instant("modified_time") ?: Instant.EPOCH,
					sender = rs.getString("user_name").orEmpty(),
					senderMail = rs.getString("from_email").orEmpty(),
					receiver = rs.getString("receiver").orEmpty(),
					receiverMail = rs.getString("target_email").orEmpty(),
					subject = rs.getString("title").orEmpty(),
					link = rs.getString("link").orEmpty(),
					body = htmlToText(rs.getString("content").orEmpty()),
					contractId = viewCode,
				)
			}
		}

	private fun toRow(jdbc: NamedParameterJdbcTemplate, rs: ResultSet, statusLabels: Map<String, String>): ContractHistoryResponse {
		val actionType = rs.getInt("action_type")
		val extra = rs.getString("extra_info")?.let { runCatching { json.readTree(it) }.getOrNull() }
		val origin = extra?.get("origin_status_on_workflow")?.asText().orEmpty()
		val target = extra?.get("status_on_workflow")?.asText().orEmpty()
		val userName = rs.getString("user_name")
		val textVar = extra?.get("text_variable")
		val htmlType = (extra?.get("html_type")?.asInt() ?: 1).coerceIn(1, 9)
		return ContractHistoryResponse(
			id = "h${rs.getLong("id")}",
			action = rs.getString("action_text").orEmpty(),
			actionType = actionType,
			at = rs.instant("create_time") ?: Instant.EPOCH,
			user = userName,
			deleted = rs.getBoolean("isdeleted"),
			comment = rs.getString("comment").orEmpty(),
			from = statusLabels[origin] ?: origin,
			to = statusLabels[target] ?: target,
			stageMove = origin.isNotEmpty() && target.isNotEmpty() && origin != target,
			extra = ContractHistoryExtra(
				htmlType = htmlType,
				compareDoc = extra?.get("compare_doc")?.asBoolean() ?: false,
				docId = extra?.get("doc_id")?.takeUnless { it.isNull }?.asText(),
				signCls = extra?.get("sign_cls")?.takeIf { it.isNumber }?.asInt(),
				signMethod = extra?.get("sign_type")?.takeIf { it.isNumber }?.asInt(),
				commenter = if (htmlType == 2) userName else null,
				email = if (htmlType == 4) HistoryEmail(extra?.get("subject")?.asText().orEmpty(), emailBody(jdbc, rs.getLong("id")), emptyList()) else null,
				result = if (htmlType == 5) resultOf(actionType) else null,
				participants = if (htmlType == 7) listOf(participant(textVar, actionType)) else null,
				attachments = if (htmlType == 8) attachments(jdbc, rs, actionType) else null,
				transfer = if (htmlType == 9) transfer(extra, textVar, rs.getString("action_text").orEmpty()) else null,
			),
		)
	}

	private fun resultOf(actionType: Int) = when (actionType) {
		23 -> "승인"
		24, 73 -> "반려"
		else -> null
	}

	private fun participant(textVar: JsonNode?, actionType: Int) = HistoryParticipant(
		name = textVar?.get("대상유저")?.asText().orEmpty(),
		role = when (actionType) {
			2004, 2005 -> "서명인"
			1004, 1005 -> "관련인"
			else -> "참여자"
		},
		change = when (actionType) {
			4, 1004, 2004, 46 -> "추가"
			5, 1005, 2005, 47 -> "삭제"
			else -> "권한 변경"
		},
	)

	private fun attachments(jdbc: NamedParameterJdbcTemplate, rs: ResultSet, actionType: Int): List<HistoryAttachment> {
		val ids = (rs.getArray("file")?.array as? Array<*>)?.mapNotNull { (it as? Number)?.toLong() }.orEmpty()
		if (ids.isEmpty()) return emptyList()
		val change = when (actionType) {
			8 -> "추가"
			9 -> "삭제"
			171 -> "외부 발송"
			172 -> "발송 취소"
			else -> "추가"
		}
		return jdbc.query("select name from main_battachment where id in (:ids) order by id", mapOf("ids" to ids)) { r, _ -> HistoryAttachment(r.getString(1).orEmpty(), change) }
	}

	/** 구조화된 키가 확실한 것은 담당자 이관(29)과 변호사 전환(2030) 정도다. 나머지는 빈 값으로 둔다 */
	private fun transfer(extra: JsonNode?, textVar: JsonNode?, actionText: String): HistoryTransfer {
		fun pick(vararg keys: String): String = keys.firstNotNullOfOrNull { k -> (extra?.get(k) ?: textVar?.get(k))?.takeUnless { it.isNull }?.asText()?.takeIf { it.isNotBlank() } }.orEmpty()
		return HistoryTransfer(actionText, pick("source_user", "old_lawyer"), pick("target_user", "new_lawyer"))
	}

	private fun emailBody(jdbc: NamedParameterJdbcTemplate, historyId: Long): String =
		jdbc.query(
			"select coalesce(email_info ->> 'message_txt', email_info ->> 'message', '') from main_smart_email_content where app_code = 'CONTRACT' and history_id = :id and isdeleted = false order by id limit 1",
			mapOf("id" to historyId),
		) { r, _ -> htmlToText(r.getString(1).orEmpty()) }.firstOrNull().orEmpty()

	private fun contractId(jdbc: NamedParameterJdbcTemplate, viewCode: String): Long? =
		jdbc.query("select id from contract_bcontract where view_code = :code order by isdeleted, id desc limit 1", mapOf("code" to viewCode)) { rs, _ -> rs.getLong(1) }.firstOrNull()

	private fun htmlToText(html: String): String =
		html.replace(Regex("(?i)<br\\s*/?>|</p>|</div>"), "\n").replace(Regex("<[^>]+>"), "").replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").trim()

	private fun db(): BizDatabase = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()
}
