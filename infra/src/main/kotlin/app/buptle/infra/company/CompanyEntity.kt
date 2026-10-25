package app.buptle.infra.company

import app.buptle.company.domain.ServicePlatform
import app.buptle.infra.jpa.BaseTimeEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/** Buptle Cloud 고객사의 식별·기본 정보 (원본은 Biz/Nova 운영 DB, 여기에는 동기화한 사본) */
@Entity
@Table(name = "companies")
class CompanyEntity(
	/** 고객사 검색 기준인 DB 스키마명 */
	@Column(name = "schema_name", nullable = false, unique = true, length = 100)
	val schemaName: String,

	@Column(name = "domain", nullable = false, unique = true)
	var domain: String,

	@Column(name = "company_name", nullable = false, length = 200)
	var companyName: String,

	@Enumerated(EnumType.STRING)
	@Column(name = "service_platform", nullable = false, length = 30)
	val servicePlatform: ServicePlatform,
) : BaseTimeEntity() {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	@Column(name = "ceo_name", length = 100)
	var ceoName: String? = null

	@Column(name = "business_number", length = 30)
	var businessNumber: String? = null

	@Column(name = "address", columnDefinition = "text")
	var address: String? = null

	@Column(name = "telephone_number", length = 30)
	var telephoneNumber: String? = null

	@Column(name = "user_limit")
	var userLimit: Int? = null

	@Column(name = "current_user_count")
	var currentUserCount: Int? = null

	@Column(name = "is_active", nullable = false)
	var active: Boolean = true

	/** Buptle Cloud 에서 고객사가 생성된 시각 */
	@Column(name = "source_created_at")
	var sourceCreatedAt: Instant? = null

	/** 운영관리 DB 에 마지막으로 동기화한 시각 */
	@Column(name = "synced_at")
	var syncedAt: Instant? = null
}
