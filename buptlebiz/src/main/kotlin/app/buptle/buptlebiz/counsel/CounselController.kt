package app.buptle.buptlebiz.counsel

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.ListResponse
import app.buptle.core.api.PageResponse
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationHistoryRepository
import app.buptle.operation.log.OperationType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/** Biz 고객사의 자문 조회. Biz DB 를 읽기만 한다. 수정은 아직 연결하지 않았다. */
@Tag(name = "특정 고객사 > 자문 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}/counsels")
class CounselController(
	private val companies: CompanyRepository,
	private val reader: BizCounselReader,
	private val process: BizCounselProcessReader,
	private val history: OperationHistoryRepository,
) {

	private fun requireBizCompany(schemaName: String) =
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")

	private fun notFoundCounsel(): Nothing = throw BusinessException(CommonErrorCode.NOT_FOUND, "자문을 찾을 수 없습니다.")

	@Operation(summary = "자문 검색", description = "자문 ID 또는 자문명 검색. 최근 작업한 자문은 GET /recent 로 따로 조회한다.")
	@GetMapping
	fun search(
		@PathVariable schemaName: String,
		@Parameter(description = "자문 ID 또는 자문명 부분 일치") @RequestParam(required = false) q: String?,
		@Parameter(description = "삭제된 자문 포함") @RequestParam(defaultValue = "false") includeDeleted: Boolean,
		@RequestParam(defaultValue = "1") @Min(1) page: Int,
		@RequestParam(defaultValue = "10") @Min(1) @Max(100) size: Int,
	): PageResponse<CounselSummaryResponse> {
		requireBizCompany(schemaName)
		return reader.search(schemaName, q, includeDeleted, page, size)
	}

	@Operation(summary = "최근 작업한 자문", description = "BuptleManager 작업 이력에서 이 고객사의 자문 대상 작업을 자문별 가장 최근 작업 하나씩, 최신순으로 준다.")
	@GetMapping("/recent")
	fun recent(
		@PathVariable schemaName: String,
		@Parameter(description = "가져올 건수 (기본 10, 최대 50)") @RequestParam(defaultValue = "10") @Min(1) @Max(50) limit: Int,
	): ListResponse<RecentCounselResponse> {
		requireBizCompany(schemaName)
		val items = history.findRecentTargets(ServicePlatform.BUPTLE_BIZ, schemaName, OperationCategory.COUNSEL, limit).map {
			RecentCounselResponse(it.targetId, it.name.orEmpty(), it.lastType, it.lastOperatedAt, it.operatorName)
		}
		return ListResponse(items, items.size.toLong())
	}

	@Operation(summary = "자문 기본 정보")
	@GetMapping("/{id}")
	fun detail(@PathVariable schemaName: String, @PathVariable id: String): CounselDetailResponse {
		requireBizCompany(schemaName)
		return reader.detail(schemaName, id) ?: notFoundCounsel()
	}

	@Operation(summary = "자문 참여 유저", description = "요청자·승인자·관련인·회람인·외부 변호사를 사람 단위로 합쳐 준다. 삭제된 참여자도 deleted 로 구분해 포함한다.")
	@GetMapping("/{id}/members")
	fun members(@PathVariable schemaName: String, @PathVariable id: String): ListResponse<CounselMemberResponse> {
		val company = requireBizCompany(schemaName)
		val items = reader.members(schemaName, id, company.name) ?: notFoundCounsel()
		return ListResponse(items, items.size.toLong())
	}

	@Operation(summary = "자문 프로세스 설정과 단계 안내")
	@GetMapping("/{id}/process")
	fun process(@PathVariable schemaName: String, @PathVariable id: String): CounselProcessResponse {
		requireBizCompany(schemaName)
		return process.process(schemaName, id) ?: notFoundCounsel()
	}

	@Operation(summary = "자문 진행 히스토리", description = "시간 오름차순. 이메일 수신 이력은 /emails 로 따로 준다.")
	@GetMapping("/{id}/history")
	fun history(@PathVariable schemaName: String, @PathVariable id: String): ListResponse<CounselHistoryResponse> {
		requireBizCompany(schemaName)
		val items = process.history(schemaName, id) ?: notFoundCounsel()
		return ListResponse(items, items.size.toLong())
	}

	@Operation(summary = "자문 이메일 정보", description = "최신순. 스마트 이메일로 수신한 메일이다.")
	@GetMapping("/{id}/emails")
	fun emails(@PathVariable schemaName: String, @PathVariable id: String): ListResponse<CounselEmailResponse> {
		requireBizCompany(schemaName)
		val items = process.emails(schemaName, id) ?: notFoundCounsel()
		return ListResponse(items, items.size.toLong())
	}
}

data class RecentCounselResponse(
	val counselId: String,
	@Schema(description = "작업 당시 기록된 자문명. 기록이 없으면 빈 문자열")
	val name: String,
	@Schema(description = "그 자문에 한 가장 최근 작업", example = "UPDATE")
	val lastOperation: OperationType,
	@Schema(description = "가장 최근 작업 시각(UTC)")
	val operatedAt: java.time.Instant,
	@Schema(description = "작업자 이름")
	val operator: String,
)
