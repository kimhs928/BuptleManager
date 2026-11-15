package app.buptle.company.domain

import java.time.Instant

/** 서비스(Biz/Nova) 운영 DB 에서 읽어 온 고객사 한 곳의 기본 정보 */
data class CompanySnapshot(
	val schemaName: String,
	val name: String,
	val domain: String,
	val representative: String?,
	val businessNumber: String?,
	val telephoneNumber: String?,
	val address: String?,
	val userLimit: Int?,
	/** 유저 수를 세지 못했으면 null (기존 값을 유지한다) */
	val userCount: Int?,
	val sourceCreatedAt: Instant?,
)

data class CompanySyncResult(
	/** 운영 DB 에서 읽은 고객사 수 */
	val total: Int,
	val created: Int,
	val updated: Int,
	/** 운영 DB 에 없어서 비활성으로 바꾼 고객사의 스키마명 */
	val deactivated: List<String>,
	/** 도메인이 겹치는 등 반영하지 못한 고객사의 스키마명 */
	val skipped: List<String>,
)

/** 운영 DB 의 고객사를 BuptleManager DB 의 사본(companies)에 반영한다 */
interface CompanySyncRepository {
	/**
	 * 서비스 구분(platform)의 고객사를 snapshots 기준으로 맞춘다.
	 * 없던 고객사는 만들고, 있던 고객사는 값을 고치고, snapshots 에 없는 고객사는 비활성으로 바꾼다(삭제하지 않는다).
	 */
	fun sync(platform: ServicePlatform, snapshots: List<CompanySnapshot>, syncedAt: Instant): CompanySyncResult
}
