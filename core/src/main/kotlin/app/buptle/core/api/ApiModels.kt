package app.buptle.core.api

import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank

/**
 * 모든 변경 요청(POST/PATCH/DELETE)이 본문에 담는 작업 기록.
 * 서버가 처리 내역(operation_logs)에 티켓, 요청자, 사유를 남긴다.
 */
data class AuditRequest(
	@field:NotBlank
	@Schema(description = "Zendesk 티켓 번호", example = "TKT-2024-0523-001")
	val ticket: String,
	@field:NotBlank
	@Schema(description = "작업 요청자(고객사 담당자) 이름", example = "김00")
	val requester: String,
	@field:NotBlank
	@Schema(description = "작업 사유", example = "계약 기간 정정")
	val reason: String,
)

/** 건수만 함께 주는 목록 응답 */
data class ListResponse<T>(
	@Schema(description = "목록")
	val items: List<T>,
	@Schema(description = "전체 건수", example = "4")
	val total: Long,
)

/** 페이지 목록 응답 */
data class PageResponse<T>(
	@Schema(description = "현재 페이지의 목록")
	val items: List<T>,
	@Schema(description = "페이지 번호(1부터)", example = "1")
	val page: Int,
	@Schema(description = "페이지 크기", example = "10")
	val size: Int,
	@Schema(description = "전체 건수", example = "6")
	val total: Long,
)

/** 수정 응답: 바뀐 객체와 처리 내역 */
data class ChangeResponse<T>(
	@Schema(description = "수정 후 객체")
	val item: T,
	@Schema(description = "실제로 바뀐 항목 수", example = "2")
	val changeCount: Int,
	@Schema(description = "기록된 처리 내역 ID", example = "[10231]")
	val historyIds: List<Long>,
)

/** 추가 응답: 만들어진 객체와 처리 내역 */
data class CreatedResponse<T>(
	@Schema(description = "추가된 객체")
	val item: T,
	@Schema(description = "기록된 처리 내역 ID", example = "[10232]")
	val historyIds: List<Long>,
)

fun notImplemented(): Nothing = throw BusinessException(CommonErrorCode.NOT_IMPLEMENTED)
