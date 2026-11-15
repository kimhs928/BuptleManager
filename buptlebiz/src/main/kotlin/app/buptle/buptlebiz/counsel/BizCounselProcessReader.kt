package app.buptle.buptlebiz.counsel

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.ResultSet
import java.time.Instant
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper

/**
 * 자문의 프로세스(설정 · 단계 안내), 진행 히스토리, 이메일을 Biz DB 에서 읽는다 (조회 전용).
 * 프로세스 설정은 고객사 컨피그(COUNSEL_*_SETTING)가 자문을 만들 때 counsel_bcounsel 컬럼으로 복사된 값을 쓴다.
 * 단계(분류)와 상태 이름은 BuptleManager 의 enum 표(BIZ_COUNSEL_STATUS)에서 가져온다.
 */
@Component
class BizCounselProcessReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
	private val reader: BizCounselReader,
	private val json: ObjectMapper,
) {

	/** 자문이 없으면 null */
	fun process(schema: String, viewCode: String): CounselProcessResponse? = db().forTenant(schema) { jdbc ->
		val id = reader.counselId(jdbc, viewCode) ?: return@forTenant null
		val cfg = jdbc.query(
			"select config_manage, ismanaged, is_circulation, is_que_reply, is_ans_reply from counsel_bcounsel where id = :id",
			mapOf("id" to id),
		) { rs, _ ->
			Settings(
				dept = rs.getString("config_manage") == "True",
				final = rs.getString("ismanaged") == BizCounselReader.FINAL_APPROVAL_REQUIRED,
				circulation = rs.getBoolean("is_circulation"),
				queReply = rs.getBoolean("is_que_reply"),
				ansReply = rs.getBoolean("is_ans_reply"),
			)
		}.first()

		val attrs = listOf(
			attr("deptApproval", "부서장 승인", cfg.dept, NEED),
			attr("finalApproval", "최종 승인", cfg.final, NEED),
			attr("circulation", "회람", cfg.circulation, NEED),
			attr("queReply", "질문 댓글", cfg.queReply, USE),
			attr("ansReply", "답변 댓글", cfg.ansReply, USE),
		)

		val roleLabels = reader.labels(BizCounselReader.ROLE_SET)
		val sources = reader.sources(jdbc, id).filter { !it.deleted }
		val profiles = reader.profiles(jdbc, sources.mapNotNull { it.profileId }.distinct())
		val lawyers = reader.lawyers(jdbc, sources.mapNotNull { it.lawyerId }.distinct())
		fun people(roles: List<String>) = sources.filter { it.role in roles }.distinctBy { it.key + it.role }.map { s ->
			val profile = s.profileId?.let { profiles[it] }
			val name = profile?.name ?: s.lawyerId?.let { lawyers[it]?.name }.orEmpty()
			val dept = profile?.dept.orEmpty()
			CounselGuidePerson(name, listOf(dept, (roleLabels[s.role] ?: s.role)).filter { it.isNotEmpty() }.joinToString(" · "))
		}

		val detail = enums.findDetail(STATUS_SET)
		val guide = detail?.groups.orEmpty().sortedBy { it.sortOrder }.filter { it.code != STOP_GROUP }.map { g ->
			CounselGuideStageResponse(g.name, STAGE_OPTION[g.code], people(STAGE_ROLES[g.code].orEmpty()))
		}
		CounselProcessResponse(attrs, guide)
	}

	fun history(schema: String, viewCode: String): List<CounselHistoryResponse>? {
		val stages = stageNames()
		return db().forTenant(schema) { jdbc ->
			val id = reader.counselId(jdbc, viewCode) ?: return@forTenant null
			val rows = jdbc.query(
				"""
				select h.id, h.action_type, h.action_text, h.create_time, h.isdeleted, h.comment, h.extra_info::text as extra_info,
				       coalesce(nullif(h.name, ''), u.first_name, '') as user_name
				from counsel_bcounsel_history h
				left join users_user u on u.id = h.create_user_id
				where h.counsel_id = :id and h.action_type <> :receive
				order by h.create_time, h.id
				""".trimIndent(),
				mapOf("id" to id, "receive" to ACTION_BCC_RECEIVE),
			) { rs, _ ->
				val extra = parse(rs.getString("extra_info"))
				val origin = extra?.get("origin_status")?.asText().orEmpty()
				val target = extra?.get("status")?.asText().orEmpty()
				HistoryRow(
					rs.getLong("id"),
					rs.getString("action_type").orEmpty(),
					rs.getTimestamp("create_time")?.toInstant() ?: Instant.EPOCH,
					CounselHistoryResponse(
						id = "h${rs.getLong("id")}",
						action = rs.getString("action_text").orEmpty(),
						at = rs.getTimestamp("create_time")?.toInstant() ?: Instant.EPOCH,
						deleted = rs.getBoolean("isdeleted"),
						comment = rs.getString("comment").orEmpty(),
						body = "",
						from = stages[origin] ?: origin,
						to = stages[target] ?: target,
						stageMove = origin.isNotEmpty() && target.isNotEmpty() && origin != target,
						user = rs.getString("user_name").orEmpty(),
					),
				)
			}
			val bodies = bodies(jdbc, id, rows)
			rows.map {
				val body = bodies[it.id].orEmpty()
				val comment = it.response.comment
				// 답변 등록 이력은 코멘트 칸에도 답변 내용이 그대로 들어 있다. 본문과 같으면 코멘트로는 보여 주지 않는다
				val duplicated = body.isNotEmpty() && squash(comment) == squash(body)
				it.response.copy(body = body, comment = if (duplicated) "" else comment)
			}
		}
	}

	/**
	 * 본문(counsel_bccontent)은 이력과 직접 연결된 컬럼이 없다. 본문이 만들어지는 이력(질문=자문 생성, 답변=검토자 답변 완료/수정)에서
	 * 본문이 만들어진 시각과 가장 가까운 이력 한 줄에 붙인다. 삭제된 본문은 제외한다.
	 */
	private fun bodies(jdbc: org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate, counselId: Long, rows: List<HistoryRow>): Map<Long, String> {
		val contents = jdbc.query(
			"select status, content_text, create_time from counsel_bccontent where counsel_id = :id and isdeleted = false and coalesce(content_text, '') <> '' order by id",
			mapOf("id" to counselId),
		) { rs, _ -> Content(rs.getString("status").orEmpty(), rs.getString("content_text").orEmpty(), rs.getTimestamp("create_time")?.toInstant() ?: Instant.EPOCH) }
		val out = mutableMapOf<Long, String>()
		for (c in contents) {
			val types = CONTENT_ACTIONS[c.status] ?: continue
			val target = rows.filter { it.actionType in types }.minByOrNull { kotlin.math.abs(java.time.Duration.between(it.at, c.at).toMillis()) } ?: continue
			out[target.id] = cleanText(c.text)
		}
		return out
	}

	/** content_text 에는 &nbsp; 같은 HTML 글자와 줄바꿈 문자(CR)가 섞여 있어 읽기 좋게 정리한다 */
	private fun cleanText(raw: String): String =
		raw.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"")
			.replace(CRLF, "\n").replace(CR, "\n").lines().joinToString("\n") { it.trim() }.replace(BLANK_LINES, "\n\n").trim()

	/** 같은 내용인지 비교하려고 공백과 줄바꿈을 모두 뺀 글자 */
	private fun squash(text: String): String = cleanText(text).filter { !it.isWhitespace() }

	private data class HistoryRow(val id: Long, val actionType: String, val at: Instant, val response: CounselHistoryResponse)

	private data class Content(val status: String, val text: String, val at: Instant)

	/** 이메일 탭 = 스마트 이메일 수신 이력(action_type 'BCCRECEIVE'). 본문은 main_smart_email_content 에서 읽는다 */
	fun emails(schema: String, viewCode: String): List<CounselEmailResponse>? = db().forTenant(schema) { jdbc ->
		val id = reader.counselId(jdbc, viewCode) ?: return@forTenant null
		jdbc.query(
			"""
			select h.id, h.create_time, h.update_time, h.name, h.extra_info::text as extra_info,
			       coalesce(c.email_info ->> 'message_txt', c.email_info ->> 'message', '') as body
			from counsel_bcounsel_history h
			left join main_smart_email_content c on c.app_code = 'COUNSEL' and c.history_id = h.id and c.isdeleted = false
			where h.counsel_id = :id and h.action_type = :receive and h.isdeleted = false
			order by h.create_time desc, h.id desc
			""".trimIndent(),
			mapOf("id" to id, "receive" to ACTION_BCC_RECEIVE),
		) { rs, _ ->
			val extra = parse(rs.getString("extra_info"))
			val from = person(extra?.get("from")) ?: Person(rs.getString("name").orEmpty(), "")
			val to = person(extra?.get("to")) ?: Person("", "")
			CounselEmailResponse(
				id = "e${rs.getLong("id")}",
				createdAt = rs.instant("create_time") ?: Instant.EPOCH,
				updatedAt = rs.instant("update_time") ?: Instant.EPOCH,
				sender = from.name,
				senderMail = from.mail,
				receiver = to.name,
				receiverMail = to.mail,
				subject = extra?.get("subject")?.asText().orEmpty(),
				link = "",
				body = htmlToText(rs.getString("body").orEmpty()),
			)
		}
	}

	private fun attr(key: String, label: String, on: Boolean, options: Pair<String, String>) =
		CounselWorkflowAttrResponse(key, label, "single", listOf(options.first, options.second), listOf(if (on) options.first else options.second))

	/** 상태 코드 → 단계(분류) 이름. 히스토리의 이전/이후 단계 표시에 쓴다 */
	private fun stageNames(): Map<String, String> {
		val detail = enums.findDetail(STATUS_SET) ?: return emptyMap()
		val groups = detail.groups.associate { it.code to it.name }
		return detail.values.mapNotNull { v -> v.groupCode?.let { g -> groups[g]?.let { v.code to it } } }.toMap()
	}

	private data class Settings(val dept: Boolean, val final: Boolean, val circulation: Boolean, val queReply: Boolean, val ansReply: Boolean)

	private data class Person(val name: String, val mail: String)

	/** "이름 <주소>" 문자열 또는 그 목록(첫 번째 사람)을 이름과 주소로 나눈다 */
	private fun person(node: JsonNode?): Person? {
		val raw = when {
			node == null || node.isNull -> return null
			node.isArray -> node.values().firstOrNull()?.asText() ?: return null
			else -> node.asText()
		}.trim()
		if (raw.isEmpty()) return null
		val m = ADDRESS.matchEntire(raw)
		return if (m != null) Person(m.groupValues[1].trim().trim('"'), m.groupValues[2].trim()) else Person("", raw)
	}

	private fun parse(raw: String?): JsonNode? = raw?.let { runCatching { json.readTree(it) }.getOrNull() }

	private fun htmlToText(html: String): String =
		html.replace(Regex("(?i)<br\\s*/?>|</p>|</div>"), "\n").replace(Regex("<[^>]+>"), "").replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").trim()

	private fun db(): BizDatabase = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()

	private companion object {
		const val STATUS_SET = "BIZ_COUNSEL_STATUS"
		const val STOP_GROUP = "CNS_GRP_STOP"
		const val ACTION_BCC_RECEIVE = "BCCRECEIVE"
		const val CR = "\r"
		const val CRLF = "\r\n"
		val BLANK_LINES = Regex("\n{3,}")

		/** 본문 종류(counsel_bccontent.status) → 그 본문이 만들어지는 이력의 action_type */
		val CONTENT_ACTIONS = mapOf(
			"REQUESTED" to setOf("CREATE"),
			"ANSWERED" to setOf("ANSWER_REVIEWER", "EDIT_ANSWER"),
		)
		val NEED = "필요" to "불필요"
		val USE = "사용" to "미사용"
		val ADDRESS = Regex("(.*)<([^>]*)>")

		/** 단계 → 거기서 일하는 사람의 출처 */
		val STAGE_ROLES = mapOf(
			"CNS_GRP_DRAFT" to listOf(BizCounselReader.CREATOR),
			"CNS_GRP_DEPT" to listOf(BizCounselReader.DEPT),
			"CNS_GRP_REVIEW" to listOf(BizCounselReader.REVIEW, BizCounselReader.EXTERNAL),
			"CNS_GRP_CIRCULATION" to listOf(BizCounselReader.CIRCULATION),
			"CNS_GRP_FINAL" to listOf(BizCounselReader.FINAL),
			"CNS_GRP_DONE" to listOf(BizCounselReader.CREATOR),
		)

		/** 단계가 어느 프로세스 설정을 따르는지. 그 설정이 '불필요'면 단계는 흐리게 보인다 */
		val STAGE_OPTION = mapOf(
			"CNS_GRP_DEPT" to "deptApproval",
			"CNS_GRP_CIRCULATION" to "circulation",
			"CNS_GRP_FINAL" to "finalApproval",
		)
	}
}
