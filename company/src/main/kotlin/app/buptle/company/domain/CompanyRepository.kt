package app.buptle.company.domain

interface CompanyRepository {
	/** 서비스 구분과 검색어(스키마명 또는 고객사명 일부, 대소문자 무시)로 찾는다. 고객사명 순. */
	fun search(platform: ServicePlatform?, keyword: String?, limit: Int): List<Company>

	fun findBySchemaName(schemaName: String): Company?
}
