package app.buptle.buptlebiz.company

import app.buptle.buptlebiz.db.BizWriteDatabase
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

/** 강제 로그아웃으로 끊은 세션 한 건 */
data class EndedSession(val loginInfoId: Long, val name: String, val email: String, val sessionId: String)

/**
 * 실시간 접속 유저의 세션을 끊는다. Biz 로그아웃과 같이 login_info.active 를 false 로 바꾸고 logout_time 을 남긴다.
 * Biz DB 에 쓰는 유일한 곳이라 쓰기 전용 연결을 쓴다.
 */
@Component
class BizLiveUserWriter(
	private val write: ObjectProvider<BizWriteDatabase>,
) {

	/** 지금 접속 중(active)인 세션만 끊고, 끊은 세션을 돌려준다. 이미 끝난 세션 ID 는 건너뛴다 */
	fun forceLogout(schema: String, sessionIds: List<String>): List<EndedSession> {
		val db = write.ifAvailable ?: throw IllegalStateException("Biz DB 쓰기 연결이 없습니다 (BIZ_DB_URL).")
		val ids = sessionIds.map { it.trim() }.filter { it.isNotEmpty() }.distinct()
		if (ids.isEmpty()) return emptyList()
		return db.forTenant(schema) { jdbc ->
			val targets = jdbc.query(
				"""
				select l.id, l.session_id, l.email, u.first_name
				from login_info l
				left join users_user u on u.id = l.user_id
				where l.active = true and l.session_id in (:ids)
				order by l.id
				""".trimIndent(),
				mapOf("ids" to ids),
			) { rs, _ ->
				EndedSession(rs.getLong("id"), rs.getString("first_name").orEmpty(), rs.getString("email").orEmpty(), rs.getString("session_id").orEmpty())
			}
			if (targets.isNotEmpty()) {
				jdbc.update(
					"update login_info set active = false, logout_time = now(), modified_time = now() where active = true and id in (:rows)",
					mapOf("rows" to targets.map { it.loginInfoId }),
				)
			}
			targets
		}
	}
}
