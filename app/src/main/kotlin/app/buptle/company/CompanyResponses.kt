package app.buptle.company

import app.buptle.company.domain.Company
import app.buptle.company.domain.ServicePlatform

/** 고객사 목록·검색 결과의 한 건 */
data class CompanySummaryResponse(
	val schemaName: String,
	val name: String,
	val domain: String,
	val platform: ServicePlatform,
	val active: Boolean,
	val userCount: Int?,
) {
	companion object {
		fun from(company: Company) = CompanySummaryResponse(
			schemaName = company.schemaName,
			name = company.name,
			domain = company.domain,
			platform = company.platform,
			active = company.active,
			userCount = company.userCount,
		)
	}
}
