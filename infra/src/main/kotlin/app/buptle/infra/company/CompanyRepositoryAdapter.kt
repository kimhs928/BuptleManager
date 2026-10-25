package app.buptle.infra.company

import app.buptle.company.domain.Company
import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import jakarta.persistence.EntityManager
import jakarta.persistence.criteria.Predicate
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
class CompanyRepositoryAdapter(
	private val em: EntityManager,
	private val jpa: CompanyJpaRepository,
) : CompanyRepository {

	override fun search(platform: ServicePlatform?, keyword: String?, limit: Int): List<Company> {
		val cb = em.criteriaBuilder
		val query = cb.createQuery(CompanyEntity::class.java)
		val root = query.from(CompanyEntity::class.java)

		val conditions = mutableListOf<Predicate>()
		platform?.let { conditions += cb.equal(root.get<ServicePlatform>("servicePlatform"), it) }
		keyword?.trim()?.takeIf { it.isNotEmpty() }?.let {
			val pattern = "%${escapeLike(it.lowercase())}%"
			conditions += cb.or(
				cb.like(cb.lower(root.get("schemaName")), pattern, '\\'),
				cb.like(cb.lower(root.get("companyName")), pattern, '\\'),
			)
		}
		query.select(root).where(*conditions.toTypedArray()).orderBy(cb.asc(root.get<String>("companyName")), cb.asc(root.get<String>("schemaName")))

		return em.createQuery(query).setMaxResults(limit).resultList.map { it.toDomain() }
	}

	override fun findBySchemaName(schemaName: String): Company? = jpa.findBySchemaName(schemaName)?.toDomain()

	/** LIKE 와일드카드(%, _)와 이스케이프 문자를 검색어 그대로 찾도록 이스케이프한다. */
	private fun escapeLike(value: String) = value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

	private fun CompanyEntity.toDomain() = Company(
		schemaName = schemaName,
		name = companyName,
		domain = domain,
		platform = servicePlatform,
		active = active,
		representative = ceoName,
		businessNumber = businessNumber,
		telephoneNumber = telephoneNumber,
		address = address,
		userCount = currentUserCount,
		userLimit = userLimit,
		sourceCreatedAt = sourceCreatedAt,
		syncedAt = syncedAt,
	)
}
