package app.buptle.company

import app.buptle.company.domain.Company
import app.buptle.company.domain.ServicePlatform
import java.time.Instant

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

/** 고객사 기본 정보 */
data class CompanyDetailResponse(
	val schemaName: String,
	val name: String,
	val domain: String,
	val platform: ServicePlatform,
	val active: Boolean,
	val representative: String?,
	val businessNumber: String?,
	val telephoneNumber: String?,
	val address: String?,
	val userCount: Int?,
	val userLimit: Int?,
	/** Buptle Cloud 에서 고객사가 생성된 시각 */
	val createdAt: Instant?,
	/** 운영관리 시스템에 마지막으로 동기화된 시각 */
	val syncedAt: Instant?,
) {
	companion object {
		fun from(company: Company) = CompanyDetailResponse(
			schemaName = company.schemaName,
			name = company.name,
			domain = company.domain,
			platform = company.platform,
			active = company.active,
			representative = company.representative,
			businessNumber = company.businessNumber,
			telephoneNumber = company.telephoneNumber,
			address = company.address,
			userCount = company.userCount,
			userLimit = company.userLimit,
			createdAt = company.sourceCreatedAt,
			syncedAt = company.syncedAt,
		)
	}
}
