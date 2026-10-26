package app.buptle.company.biz

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ConfigScope
import app.buptle.core.api.ListResponse
import app.buptle.core.api.notImplemented
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

/** Biz 고객사 정보 중 BuptleManager DB 에 저장된 데이터(기본 정보, 운영 현황, 최근 작업, 적용된 컨피그) */
@Tag(name = "특정 고객사 > 고객사 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}")
class BizCompanyController(
	private val companies: CompanyRepository,
) {

	@Operation(summary = "고객사 기본 정보", description = "조회 전용. 없는 스키마명이면 404.")
	@ApiResponse(responseCode = "404", description = "고객사를 찾을 수 없음")
	@GetMapping
	fun detail(@PathVariable schemaName: String): CompanyDetailResponse {
		val company = companies.findBySchemaName(schemaName)
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")
		return CompanyDetailResponse.from(company)
	}

	@Operation(summary = "운영 현황")
	@GetMapping("/ops")
	fun ops(@PathVariable schemaName: String): OpsResponse = notImplemented()

	@Operation(
		summary = "이 고객사의 최근 작업(최근 히스토리)",
		description = "- 최신순으로 최대 10건 화면에 노출\n " +
			"- total 은 이 고객사의 전체 히스토리 건수이고, 10건을 넘으면 10개 이외의 내역은 '전체 보기'로 확인 가능.\n" +
			"- 최근 작업 = 2일 이내 처리내역.",
	)
	@GetMapping("/recent-jobs")
	fun recentJobs(
		@PathVariable schemaName: String,
		@Parameter(description = "가져올 건수 (기본 10, 최대 10)") @RequestParam(defaultValue = "10") @Min(1) @Max(10) limit: Int,
	): ListResponse<RecentJobResponse> = notImplemented()

	@Operation(summary = "적용된 컨피그")
	@GetMapping("/configs")
	fun configs(
		@PathVariable schemaName: String,
		@Parameter(description = "컨피그명 부분 일치") @RequestParam(required = false) q: String?,
		@Parameter(description = "생략하면 전체") @RequestParam(required = false) scope: ConfigScope?,
	): CompanyConfigsResponse = notImplemented()
}
