package app.buptle.web

import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.core.error.ErrorCode
import org.slf4j.LoggerFactory
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.web.ErrorResponse
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.AuthenticationException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler

/**
 * 모든 오류를 RFC 9457 ProblemDetail 로 응답한다.
 * 공통 속성: code(오류 코드), 검증 오류는 errors[{field, message}]
 */
@RestControllerAdvice
class GlobalExceptionHandler : ResponseEntityExceptionHandler() {

	private val log = LoggerFactory.getLogger(javaClass)

	@ExceptionHandler(BusinessException::class)
	fun handleBusiness(e: BusinessException): ResponseEntity<Any> {
		log.warn("업무 오류 [{}] {}", e.errorCode.code, e.message)
		return problem(e.errorCode, e.message)
	}

	@ExceptionHandler(AuthenticationException::class)
	fun handleAuthentication(e: AuthenticationException): ResponseEntity<Any> = problem(CommonErrorCode.UNAUTHORIZED)

	@ExceptionHandler(AccessDeniedException::class)
	fun handleAccessDenied(e: AccessDeniedException): ResponseEntity<Any> = problem(CommonErrorCode.FORBIDDEN)

	/** 예상하지 못한 오류. 내부 정보는 응답에 노출하지 않는다. */
	@ExceptionHandler(Exception::class)
	fun handleUnexpected(e: Exception): ResponseEntity<Any> {
		log.error("예상하지 못한 오류", e)
		return problem(CommonErrorCode.INTERNAL_ERROR)
	}

	override fun handleMethodArgumentNotValid(
		ex: MethodArgumentNotValidException,
		headers: HttpHeaders,
		status: HttpStatusCode,
		request: WebRequest,
	): ResponseEntity<Any>? {
		val errors = ex.bindingResult.fieldErrors.map { mapOf("field" to it.field, "message" to (it.defaultMessage ?: "")) }
		ex.body.setProperty("errors", errors)
		return super.handleMethodArgumentNotValid(ex, headers, status, request)
	}

	/** 프레임워크가 만든 오류(404, 405, 본문 파싱 실패 등)에도 code 를 붙인다. */
	override fun handleExceptionInternal(
		ex: Exception,
		body: Any?,
		headers: HttpHeaders,
		statusCode: HttpStatusCode,
		request: WebRequest,
	): ResponseEntity<Any>? {
		// body 는 null 일 수 있어(프레임워크가 뒤에서 채움) ErrorResponse 의 본문을 직접 사용한다.
		val problem = body as? ProblemDetail ?: (ex as? ErrorResponse)?.body
		if (problem != null && problem.properties?.containsKey("code") != true) {
			problem.setProperty("code", codeFor(statusCode).code)
		}
		return super.handleExceptionInternal(ex, body, headers, statusCode, request)
	}

	private fun problem(errorCode: ErrorCode, detail: String? = null): ResponseEntity<Any> {
		val body = ProblemDetail.forStatusAndDetail(HttpStatusCode.valueOf(errorCode.status), detail ?: errorCode.message)
		body.title = HttpStatus.resolve(errorCode.status)?.reasonPhrase
		body.setProperty("code", errorCode.code)
		return ResponseEntity.status(errorCode.status).body(body)
	}

	private fun codeFor(status: HttpStatusCode): ErrorCode =
		CommonErrorCode.entries.firstOrNull { it.status == status.value() }
			?: if (status.is4xxClientError) CommonErrorCode.INVALID_REQUEST else CommonErrorCode.INTERNAL_ERROR
}
