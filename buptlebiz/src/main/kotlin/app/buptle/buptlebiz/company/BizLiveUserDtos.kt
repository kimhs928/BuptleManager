package app.buptle.buptlebiz.company

import app.buptle.core.api.AuditRequest
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotEmpty
import java.time.Instant

data class LiveUserResponse(
	@Schema(description = "유저 행 ID", example = "u1")
	val id: String,
	@Schema(example = "홍길동")
	val name: String,
	@Schema(example = "minsu.kim@acetech.co.kr")
	val email: String,
	@Schema(description = "사번", example = "A00123")
	val employeeNo: String,
	@Schema(example = "211.34.12.8")
	val ip: String,
	@Schema(example = "sess_8f2a…c91d")
	val sessionId: String,
	val lastActiveAt: Instant,
	val loginAt: Instant,
)

data class LiveUsersResponse(
	@Schema(description = "마지막 새로 고침 시각")
	val refreshedAt: Instant,
	val items: List<LiveUserResponse>,
	@Schema(example = "6")
	val total: Long,
)

data class ForceLogoutRequest(
	@field:NotEmpty
	@Schema(description = "로그아웃시킬 세션 ID", example = "[\"\twhpbb4hf....ml1k7bj1p4af\"]")
	val sessionIds: List<String>,
	@field:Valid
	val audit: AuditRequest,
)

data class LoggedOutUser(val id: String, val name: String)

data class ForceLogoutResponse(
	val loggedOut: List<LoggedOutUser>,
	@Schema(example = "[10233]")
	val historyIds: List<Long>,
)
