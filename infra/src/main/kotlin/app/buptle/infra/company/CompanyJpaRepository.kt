package app.buptle.infra.company

import org.springframework.data.jpa.repository.JpaRepository

interface CompanyJpaRepository : JpaRepository<CompanyEntity, Long> {
	fun findBySchemaName(schemaName: String): CompanyEntity?
}
