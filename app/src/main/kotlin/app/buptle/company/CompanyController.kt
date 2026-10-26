package app.buptle.company

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/companies")
class CompanyController(
	private val companies: CompanyRepository,
) {

	@Tag(name = "메인")
	@Operation(summary = "고객사 목록·검색", description = "스키마명 또는 고객사명 일부로 검색한다. 고객사명 순, 최대 limit 건.")
	@GetMapping
	fun search(
		@RequestParam(required = false) platform: ServicePlatform?,
		@RequestParam(name = "q", required = false) keyword: String?,
		@RequestParam(defaultValue = "100") @Min(1) @Max(MAX_LIMIT) limit: Int,
	): List<CompanySummaryResponse> = companies.search(platform, keyword, limit).map(CompanySummaryResponse::from)

	private companion object {
		const val MAX_LIMIT = 200L
	}
}
