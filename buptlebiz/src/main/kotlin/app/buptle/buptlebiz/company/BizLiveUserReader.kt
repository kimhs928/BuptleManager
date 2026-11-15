package app.buptle.buptlebiz.company

import app.buptle.buptlebiz.db.BizDatabase
import java.time.Instant
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

/**
 * Biz 고객사의 실시간 접속 유저를 Biz DB(login_info)에서 읽는다 (조회 전용).
 * Biz 의 current_active_login_info 와 같은 조건이다: active 이고 마지막 활동(last_touch)이 세션 유지 시간 안인 행.
 * 세션 유지 시간(분)은 고객사 컨피그 SESSION_MAINTAIN_TIME 이 있으면 그 값, 없으면 기본값(auto_logout_delay)을 쓴다.
 */
@Component
class BizLiveUserReader(
	private val biz: ObjectProvider<BizDatabase>,
	@Value("\${buptle.biz.auto-logout-delay-minutes:30}") private val defaultSessionMinutes: Int,
) {

	fun liveUsers(schema: String): LiveUsersResponse {
		val db = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")
		val minutes = sessionMinutes(db, schema)
		val items = db.forTenant(schema) { jdbc ->
			jdbc.query(
				"""
				select l.id, l.session_id, l.last_touch, l.login_time, l.email, l.employee_no, l.ip, u.first_name
				from login_info l
				left join users_user u on u.id = l.user_id
				where l.active = true and l.last_touch > now() - (:minutes * interval '1 minute')
				order by l.modified_time desc, l.id desc
				""".trimIndent(),
				mapOf("minutes" to minutes),
			) { rs, _ ->
				LiveUserResponse(
					id = "u${rs.getLong("id")}",
					name = rs.getString("first_name").orEmpty(),
					email = rs.getString("email").orEmpty(),
					employeeNo = rs.getString("employee_no").orEmpty(),
					ip = rs.getString("ip").orEmpty(),
					sessionId = rs.getString("session_id").orEmpty(),
					lastActiveAt = rs.getTimestamp("last_touch")?.toInstant() ?: Instant.EPOCH,
					loginAt = rs.getTimestamp("login_time")?.toInstant() ?: Instant.EPOCH,
				)
			}
		}
		return LiveUsersResponse(refreshedAt = Instant.now(), items = items, total = items.size.toLong())
	}

	/** 고객사 컨피그(공용 스키마)의 SESSION_MAINTAIN_TIME. 없거나 숫자가 아니면 기본값 */
	private fun sessionMinutes(db: BizDatabase, schema: String): Int {
		val configured = db.forTenant(schema) { jdbc ->
			jdbc.query(
				"""
				select c.config_value
				from public.companies_bsysconfig c
				join public.companies_bcompany co on co.id = c.company_id
				where co.schema_name = :schema and c.system_type = :system and c.config_name = :name
				order by c.id desc
				limit 1
				""".trimIndent(),
				mapOf("schema" to schema, "system" to SYSTEM_TYPE, "name" to SESSION_MAINTAIN_TIME),
			) { rs, _ -> rs.getString("config_value") }.firstOrNull()
		}
		return configured?.trim()?.toIntOrNull()?.takeIf { it > 0 } ?: defaultSessionMinutes
	}

	private companion object {
		const val SYSTEM_TYPE = "buptleBiz"
		const val SESSION_MAINTAIN_TIME = "SESSION_MAINTAIN_TIME"
	}
}
