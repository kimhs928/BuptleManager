package app.buptle.buptlebiz.contract

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.ListResponse
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationHistoryRepository
import app.buptle.operation.log.OperationType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import java.time.Instant
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@Schema(description = "최근 작업한 계약 1건")
data class RecentContractResponse(
	@Schema(description = "계약 ID", example = "CT-2024-0315")
	val contractId: String,
	@Schema(description = "작업 당시 기록된 계약명. 기록이 없으면 빈 문자열", example = "2024 클라우드 서비스 이용계약 (갱신)")
	val name: String,
	@Schema(description = "그 계약에 한 가장 최근 작업", example = "UPDATE")
	val lastOperation: OperationType,
	@Schema(description = "가장 최근 작업 시각(UTC)", example = "2026-11-01T09:30:00Z")
	val operatedAt: Instant,
	@Schema(description = "작업자 이름", example = "홍길동")
	val operator: String,
)

/** 계약 중 BuptleManager DB(작업 이력)로 보는 부분. Biz 계약 데이터 자체는 Biz DB 에서 읽는다. */
@Tag(name = "특정 고객사 > 계약서 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}/contracts")
class RecentContractController(
	private val companies: CompanyRepository,
	private val history: OperationHistoryRepository,
) {

	@Operation(
		summary = "최근 작업한 계약",
		description = "BuptleManager 작업 이력에서 이 고객사의 계약 대상 작업을 계약별 가장 최근 작업 하나씩, 최신순으로 준다. 이력이 없으면 빈 목록. 없는 스키마명이면 404.",
	)
	@ApiResponse(responseCode = "404", description = "고객사를 찾을 수 없음")
	@GetMapping("/recent")
	fun recent(
		@PathVariable schemaName: String,
		@Parameter(description = "가져올 건수 (기본 10, 최대 50)") @RequestParam(defaultValue = "10") @Min(1) @Max(50) limit: Int,
	): ListResponse<RecentContractResponse> {
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")
		val items = history.findRecentTargets(ServicePlatform.BUPTLE_BIZ, schemaName, OperationCategory.CONTRACT, limit).map {
			RecentContractResponse(it.targetId, it.name.orEmpty(), it.lastType, it.lastOperatedAt, it.operatorName)
		}
		return ListResponse(items, items.size.toLong())
	}
}
