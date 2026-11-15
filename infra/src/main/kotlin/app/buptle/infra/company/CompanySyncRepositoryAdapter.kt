package app.buptle.infra.company

import app.buptle.company.domain.CompanySnapshot
import app.buptle.company.domain.CompanySyncRepository
import app.buptle.company.domain.CompanySyncResult
import app.buptle.company.domain.ServicePlatform
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class CompanySyncRepositoryAdapter(
	private val companies: CompanyJpaRepository,
) : CompanySyncRepository {

	private val log = LoggerFactory.getLogger(javaClass)

	@Transactional
	override fun sync(platform: ServicePlatform, snapshots: List<CompanySnapshot>, syncedAt: Instant): CompanySyncResult {
		val existing = companies.findAll().filter { it.servicePlatform == platform }.associateBy { it.schemaName }
		// 도메인은 유일해야 한다. 이미 다른 고객사가 쓰는 도메인이면 그 고객사는 반영하지 않는다
		val domainOwner = companies.findAll().associate { it.domain to it.schemaName }.toMutableMap()
		var created = 0
		var updated = 0
		val skipped = mutableListOf<String>()

		for (s in snapshots) {
			val owner = domainOwner[s.domain]
			if (owner != null && owner != s.schemaName) {
				log.warn("고객사 동기화 건너뜀: {} (도메인 {} 을 {} 이(가) 쓰는 중)", s.schemaName, s.domain, owner)
				skipped += s.schemaName
				continue
			}
			val entity = existing[s.schemaName]
			if (entity == null) {
				companies.save(CompanyEntity(s.schemaName, s.domain, s.name, platform).also { apply(it, s, syncedAt) })
				domainOwner[s.domain] = s.schemaName
				created++
			} else {
				domainOwner.remove(entity.domain)
				entity.domain = s.domain
				entity.companyName = s.name
				apply(entity, s, syncedAt)
				domainOwner[s.domain] = s.schemaName
				updated++
			}
		}

		val live = snapshots.map { it.schemaName }.toSet()
		val deactivated = existing.values.filter { it.schemaName !in live && it.active }.onEach {
			it.active = false
			it.syncedAt = syncedAt
		}.map { it.schemaName }
		if (deactivated.isNotEmpty()) log.warn("운영 DB 에 없는 {} 고객사를 비활성으로 바꿈: {}", platform, deactivated)
		return CompanySyncResult(snapshots.size, created, updated, deactivated, skipped)
	}

	private fun apply(e: CompanyEntity, s: CompanySnapshot, syncedAt: Instant) {
		e.ceoName = s.representative
		e.businessNumber = s.businessNumber
		e.address = s.address
		e.telephoneNumber = s.telephoneNumber
		e.userLimit = s.userLimit
		if (s.userCount != null) e.currentUserCount = s.userCount
		e.sourceCreatedAt = s.sourceCreatedAt
		e.active = true
		e.syncedAt = syncedAt
	}
}
