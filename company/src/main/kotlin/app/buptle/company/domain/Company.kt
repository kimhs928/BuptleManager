package app.buptle.company.domain

import java.time.Instant

/** 운영관리 시스템이 다루는 고객사 (Buptle Cloud 에서 동기화한 정보) */
data class Company(
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
	val sourceCreatedAt: Instant?,
	val syncedAt: Instant?,
)
