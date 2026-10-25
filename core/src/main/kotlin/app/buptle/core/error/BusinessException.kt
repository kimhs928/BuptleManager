package app.buptle.core.error

/** 업무 규칙 위반 등 예상 가능한 오류. 전역 예외 처리기가 ErrorCode 에 맞는 응답으로 변환한다. */
open class BusinessException(
	val errorCode: ErrorCode,
	message: String = errorCode.message,
	cause: Throwable? = null,
) : RuntimeException(message, cause)
