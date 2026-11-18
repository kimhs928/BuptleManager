package app.buptle.buptlebiz.user

import app.buptle.buptlebiz.db.BizWriteDatabase
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.Timestamp
import org.springframework.beans.factory.ObjectProvider
import org.springframework.dao.DuplicateKeyException
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component

/**
 * Biz DB 의 유저(users_user, main_userprofile)를 고친다 (쓰기 연결 사용). Django 의 저장 로직은 거치지 않고 컬럼 값만 바꾼다.
 * 컬럼명은 코드에 정해 둔 것만 쓰고 값은 모두 바인딩한다.
 */
@Component
class BizUserWriter(
	private val write: ObjectProvider<BizWriteDatabase>,
	private val enums: EnumCatalogRepository,
) {

	/** 바뀐 항목 수. 유저가 없으면 null */
	fun update(schema: String, pk: Long, r: UserUpdateRequest): Int? {
		val db = write.ifAvailable ?: throw IllegalStateException("Biz DB 쓰기 연결이 없습니다 (BIZ_DB_URL).")
		return try {
			db.forTenant(schema) { jdbc -> apply(jdbc, pk, r) }
		} catch (e: DuplicateKeyException) {
			throw BusinessException(CommonErrorCode.CONFLICT, "이미 다른 유저가 쓰는 이메일 또는 사번입니다.")
		}
	}

	private fun apply(jdbc: NamedParameterJdbcTemplate, pk: Long, r: UserUpdateRequest): Int? {
		val exists = jdbc.queryForObject("select count(*) from users_user u join main_userprofile p on p.user_id = u.id where u.id = :pk", mapOf("pk" to pk), Int::class.java) ?: 0
		if (exists == 0) return null

		val user = Sets()
		r.name?.let { user.set("first_name", it.trim()) }
		r.email?.let { user.set("email", it.trim()) }
		r.active?.let { user.set("is_active", it) }
		r.joinedAt?.let { user.set("date_joined", Timestamp.from(it)) }

		val profile = Sets()
		r.phone?.let { profile.set("tel_num", it) }
		r.dept?.let { profile.set("department", it) }
		r.title?.let { profile.set("role_name", it) }
		r.desc?.let { profile.set("description", it) }
		r.empNo?.let { profile.set("employee_no", it.trim().ifEmpty { null }) }
		r.createdAt?.let { profile.set("create_time", Timestamp.from(it)) }
		r.roles?.let { labels ->
			val byLabel = enums.findDetail(ROLE_SET)?.values.orEmpty().associate { it.label to it.code }
			val codes = labels.map { byLabel[it] ?: throw BusinessException(CommonErrorCode.INVALID_REQUEST, "알 수 없는 역할입니다: $it") }.toSet()
			profile.set("\"isAdmin\"", ADMIN in codes)
			profile.set("\"isViewer\"", VIEWER in codes)
			profile.set("\"isLawyer\"", LAWYER in codes)
		}
		val changed = user.count + profile.count
		if (r.updatedAt != null) profile.set("update_time", Timestamp.from(r.updatedAt)) else profile.raw("update_time", "now()")
		if (changed == 0) return 0

		if (user.count > 0) user.run(jdbc, "users_user", "id = :pk", mapOf("pk" to pk))
		profile.run(jdbc, "main_userprofile", "user_id = :pk", mapOf("pk" to pk))
		return changed
	}

	private class Sets {
		private val parts = mutableListOf<String>()
		private val params = mutableMapOf<String, Any?>()
		val count get() = parts.size

		fun set(column: String, value: Any?) {
			val key = "p" + parts.size
			parts += "$column = :$key"
			params[key] = value
		}

		fun raw(column: String, expression: String) {
			parts += "$column = $expression"
		}

		fun run(jdbc: NamedParameterJdbcTemplate, table: String, where: String, whereParams: Map<String, Any?>) {
			jdbc.update("update $table set ${parts.joinToString(", ")} where $where", params + whereParams)
		}
	}

	private companion object {
		const val ROLE_SET = "BIZ_USER_SYSTEM_ROLE"
		const val ADMIN = "ADMIN"
		const val VIEWER = "VIEWER"
		const val LAWYER = "LAWYER"
	}
}
