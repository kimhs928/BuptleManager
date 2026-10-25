package app.buptle.infra

import app.buptle.company.domain.ConfigScope
import app.buptle.company.domain.ServicePlatform
import app.buptle.infra.batch.BatchRunEntity
import app.buptle.infra.batch.NoticeEntity
import app.buptle.infra.batch.NoticeItemEntity
import app.buptle.infra.company.CompanyEntity
import app.buptle.infra.config.CompanyConfigEntity
import app.buptle.infra.config.ConfigEntity
import app.buptle.infra.operation.OperationLogEntity
import app.buptle.infra.operation.OperationTargetEntity
import app.buptle.infra.user.ManagementRoleEntity
import app.buptle.infra.user.ManagementUserEntity
import app.buptle.operation.batch.BatchStatus
import app.buptle.operation.batch.BatchType
import app.buptle.operation.batch.NoticeType
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationType
import app.buptle.operation.user.ManagementRole
import app.buptle.support.IntegrationTest
import jakarta.persistence.EntityManager
import java.time.Clock
import java.time.Instant
import java.util.UUID
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue
import org.hibernate.exception.ConstraintViolationException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

/** Flyway 마이그레이션과 JPA 엔티티가 실제 PostgreSQL 에서 맞물리는지 확인한다. (ddl-auto: validate 는 기동 시 검증) */
@IntegrationTest
@Transactional
class SchemaMappingTest(
	@Autowired private val em: EntityManager,
	@Autowired private val clock: Clock,
) {

	private fun role(code: ManagementRole) = em
		.createQuery("select r from ManagementRoleEntity r where r.roleCode = :code", ManagementRoleEntity::class.java)
		.setParameter("code", code).singleResult

	private fun flushAndClear() {
		em.flush()
		em.clear()
	}

	private fun newUser(email: String = "dev@buptle.test") = ManagementUserEntity("sso-$email", email, "개발자", role(ManagementRole.DEVELOPER))
		.also { em.persist(it) }

	private fun newCompany(schema: String = "acetech") =
		CompanyEntity(schema, "$schema.buptle.app", "에이스테크놀로지(주)", ServicePlatform.BUPTLE_BIZ).also { em.persist(it) }

	@Test
	fun `권한 기초 데이터가 마이그레이션으로 들어간다`() {
		val names = ManagementRole.entries.associateWith { role(it).roleName }

		assertEquals(
			mapOf(
				ManagementRole.VIEWER to "조회자",
				ManagementRole.CS to "CS 담당자",
				ManagementRole.DEVELOPER to "운영개발자",
				ManagementRole.ADMIN to "관리자",
			),
			names,
		)
	}

	@Test
	fun `사용자와 고객사를 저장하면 생성·수정 시각이 채워진다`() {
		val user = newUser()
		val company = newCompany()
		flushAndClear()

		val savedUser = em.find(ManagementUserEntity::class.java, user.id)
		val savedCompany = em.find(CompanyEntity::class.java, company.id)

		assertEquals(ManagementRole.DEVELOPER, savedUser.role.roleCode)
		assertTrue(savedUser.active)
		assertEquals(clock.instant().epochSecond, savedUser.createdAt.epochSecond)
		assertEquals(savedUser.createdAt, savedUser.updatedAt)
		assertEquals(ServicePlatform.BUPTLE_BIZ, savedCompany.servicePlatform)
		assertNotNull(savedCompany.createdAt)
	}

	@Test
	fun `같은 컨피그명도 타입이 다르면 등록할 수 있고 같은 타입이면 거부된다`() {
		val user = newUser()
		em.persist(ConfigEntity("ENABLE_PDF_UPLOAD", ConfigScope.MODULES, user))
		em.persist(ConfigEntity("ENABLE_PDF_UPLOAD", ConfigScope.COMPONENT, user))
		em.persist(ConfigEntity("PUBLIC_SERVICE_NOTICE", ConfigScope.PUBLIC, user))
		flushAndClear()

		// IDENTITY 키라 persist 시점에 바로 INSERT 가 실행된다.
		assertFailsWith<ConstraintViolationException> {
			em.persist(ConfigEntity("ENABLE_PDF_UPLOAD", ConfigScope.MODULES, em.find(ManagementUserEntity::class.java, user.id)))
		}
	}

	@Test
	fun `고객사에 컨피그를 적용하면 복합키로 저장된다`() {
		val user = newUser()
		val company = newCompany()
		val config = ConfigEntity("SESSION_TIMEOUT_MINUTES", ConfigScope.STANDALONE, user).also { it.defaultValue = "30" }
		em.persist(config)
		em.persist(CompanyConfigEntity(company, config, user, Instant.parse("2024-03-15T00:00:00Z")).also { it.configValue = "60" })
		flushAndClear()

		val saved = em.createQuery("select c from CompanyConfigEntity c", CompanyConfigEntity::class.java).resultList.single()

		assertEquals(company.id, saved.id.companyId)
		assertEquals(config.id, saved.id.configId)
		assertEquals("60", saved.configValue)
		assertNotNull(saved.updatedAt)
	}

	@Test
	fun `작업 이력은 고객사·대상·JSON 데이터와 함께 저장된다`() {
		val user = newUser()
		val company = newCompany()
		val log = OperationLogEntity(UUID.randomUUID(), user, OperationCategory.CONTRACT, OperationType.UPDATE, Instant.parse("2024-05-23T05:35:00Z")).apply {
			ticketNumber = "TKT-2024-0523-001"
			zendeskTicketId = "#458310"
			reason = "고객사 요청으로 계약 만료일을 연장했습니다."
			requestData = mapOf("keyword" to "CT-2024-0402", "range" to mapOf("from" to "2024-05-01"))
			companies += company
			targets += OperationTargetEntity(this, OperationCategory.CONTRACT).also {
				it.externalTargetId = "CT-2024-0402"
				it.beforeData = mapOf("계약 종료일" to "2024-12-31", "tags" to listOf("a", "b"))
				it.afterData = mapOf("계약 종료일" to "2025-03-31", "count" to 3)
			}
		}
		em.persist(log)
		flushAndClear()

		val saved = em.find(OperationLogEntity::class.java, log.id)
		val target = saved.targets.single()

		assertEquals("TKT-2024-0523-001", saved.ticketNumber)
		assertEquals("#458310", saved.zendeskTicketId)
		assertEquals(mapOf("keyword" to "CT-2024-0402", "range" to mapOf("from" to "2024-05-01")), saved.requestData)
		assertNull(saved.resultData)
		assertEquals(listOf("acetech"), saved.companies.map { it.schemaName })
		assertEquals("CT-2024-0402", target.externalTargetId)
		assertEquals(mapOf("계약 종료일" to "2024-12-31", "tags" to listOf("a", "b")), target.beforeData)
		assertEquals(mapOf("계약 종료일" to "2025-03-31", "count" to 3), target.afterData)
		assertNotNull(target.createdAt)
	}

	@Test
	fun `배치 실행과 미등록 컨피그 알림이 저장된다`() {
		val run = BatchRunEntity(BatchType.CONFIG_SYNC, ServicePlatform.BUPTLE_BIZ, Instant.parse("2024-05-23T08:30:00Z")).apply {
			status = BatchStatus.SUCCEEDED
			finishedAt = Instant.parse("2024-05-23T08:30:05Z")
			scannedCount = 120
			mismatchCount = 3
		}
		em.persist(run)
		val notice = NoticeEntity(run, NoticeType.MISSING_CONFIG, "컨피그 불일치", "미등록 3건")
		notice.items += NoticeItemEntity(notice, "NEW_CONFIG").also { it.detectedData = mapOf("scope" to "MODULES") }
		em.persist(notice)
		flushAndClear()

		val saved = em.find(NoticeEntity::class.java, notice.id)

		assertEquals(3, em.find(BatchRunEntity::class.java, run.id).mismatchCount)
		assertNull(saved.resolvedAt)
		assertEquals("NEW_CONFIG", saved.items.single().missingConfigName)
		assertEquals(mapOf("scope" to "MODULES"), saved.items.single().detectedData)
		assertNull(saved.items.single().registeredConfig)
	}
}
