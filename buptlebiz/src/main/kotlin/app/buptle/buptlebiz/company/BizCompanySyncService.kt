package app.buptle.buptlebiz.company

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.company.domain.CompanySnapshot
import app.buptle.company.domain.CompanySyncRepository
import app.buptle.company.domain.CompanySyncResult
import app.buptle.company.domain.ServicePlatform
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Service

/**
 * 실제 Biz DB 의 고객사(공용 스키마 companies_bcompany + 도메인 companies_domain)를 읽어
 * BuptleManager DB 의 고객사 사본에 반영한다. Biz DB 는 읽기만 한다.
 * 고객사별 유저 수는 각 테넌트 스키마의 users_user 에서 세고, 세지 못하면 기존 값을 유지한다.
 */
@Service
class BizCompanySyncService(
	private val biz: ObjectProvider<BizDatabase>,
	private val repository: CompanySyncRepository,
) {

	private val log = LoggerFactory.getLogger(javaClass)

	/** Biz DB 가 연결되어 있지 않으면 null */
	fun sync(): CompanySyncResult? {
		val db = biz.ifAvailable ?: return null
		val snapshots = readCompanies(db)
		val result = repository.sync(ServicePlatform.BUPTLE_BIZ, snapshots, Instant.now())
		log.info("Biz 고객사 동기화: 전체 {}, 생성 {}, 수정 {}, 비활성 {}, 건너뜀 {}", result.total, result.created, result.updated, result.deactivated.size, result.skipped.size)
		return result
	}

	private fun readCompanies(db: BizDatabase): List<CompanySnapshot> {
		val rows = db.forTenant(PUBLIC) { jdbc ->
			jdbc.query(
				"""
				select c.schema_name, c.name, c.ceo_name, c.biz_regnum, c.address, c.contact_tel, c.user_limit, c.create_time,
				       (select d.domain from public.companies_domain d where d.tenant_id = c.id order by d.is_primary desc, d.id limit 1) as domain
				from public.companies_bcompany c
				where c.isdeleted = false and c.schema_name <> 'public'
				order by c.id
				""".trimIndent(),
				emptyMap<String, Any>(),
			) { rs, _ ->
				Row(
					schema = rs.getString("schema_name"),
					name = rs.getString("name").orEmpty(),
					ceo = rs.getString("ceo_name"),
					bizNo = rs.getString("biz_regnum"),
					address = rs.getString("address"),
					tel = rs.getString("contact_tel"),
					userLimit = (rs.getObject("user_limit") as? Number)?.toInt(),
					created = rs.getTimestamp("create_time")?.toInstant(),
					domain = rs.getString("domain"),
				)
			}
		}
		return rows.map { r ->
			CompanySnapshot(
				schemaName = r.schema,
				name = r.name,
				domain = r.domain?.takeIf { it.isNotBlank() } ?: "${r.schema}.biz.invalid",
				representative = r.ceo?.takeIf { it.isNotBlank() },
				businessNumber = r.bizNo?.takeIf { it.isNotBlank() },
				telephoneNumber = r.tel?.takeIf { it.isNotBlank() },
				address = r.address?.takeIf { it.isNotBlank() },
				userLimit = r.userLimit,
				userCount = countUsers(db, r.schema),
				sourceCreatedAt = r.created,
			)
		}
	}

	/** 테넌트 스키마가 없거나 읽지 못하면 null */
	private fun countUsers(db: BizDatabase, schema: String): Int? = try {
		db.forTenant(schema) { jdbc -> jdbc.queryForObject("select count(*) from users_user where is_active = true", emptyMap<String, Any>(), Int::class.java) }
	} catch (e: Exception) {
		log.warn("Biz 고객사 {} 의 유저 수를 세지 못했습니다: {}", schema, e.message)
		null
	}

	private data class Row(
		val schema: String,
		val name: String,
		val ceo: String?,
		val bizNo: String?,
		val address: String?,
		val tel: String?,
		val userLimit: Int?,
		val created: Instant?,
		val domain: String?,
	)

	private companion object {
		const val PUBLIC = "public"
	}
}
