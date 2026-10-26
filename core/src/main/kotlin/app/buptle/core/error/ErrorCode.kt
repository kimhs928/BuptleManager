package app.buptle.core.error

/** API 오류 코드. status 는 HTTP 상태 코드 */
interface ErrorCode {
	val code: String
	val status: Int
	val message: String
}

enum class CommonErrorCode(override val status: Int, override val message: String) : ErrorCode {
	INVALID_REQUEST(400, "잘못된 요청입니다."),
	UNAUTHORIZED(401, "로그인이 필요합니다."),
	FORBIDDEN(403, "접근 권한이 없습니다."),
	NOT_FOUND(404, "요청한 정보를 찾을 수 없습니다."),
	METHOD_NOT_ALLOWED(405, "허용되지 않는 요청 방식입니다."),
	CONFLICT(409, "이미 처리된 요청이거나 충돌이 발생했습니다."),
	INTERNAL_ERROR(500, "서버 오류가 발생했습니다."),
	NOT_IMPLEMENTED(501, "아직 구현되지 않은 API 입니다."),
	;

	override val code: String get() = name
}
