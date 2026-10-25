package app.buptle.infra.dev

import app.buptle.company.domain.ServicePlatform
import app.buptle.infra.company.CompanyEntity
import app.buptle.infra.company.CompanyJpaRepository
import app.buptle.infra.user.ManagementRoleJpaRepository
import app.buptle.infra.user.ManagementUserEntity
import app.buptle.infra.user.ManagementUserJpaRepository
import app.buptle.operation.user.ManagementRole
import java.time.Instant
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

/**
 * 로컬 개발용 기초 데이터: 작업 유저 1개와 고객사 샘플.
 * buptle.dev-seed.enabled=true 일 때만 동작하고, 이미 있는 데이터는 건너뛴다.
 * TODO: 로그인 구현 후 작업 유저 시드 제거, Biz/Nova 동기화 구현 후 고객사 시드 제거
 */
@Component
@Order(1)
@ConditionalOnProperty("buptle.dev-seed.enabled", havingValue = "true")
class DevDataSeeder(
	private val users: ManagementUserJpaRepository,
	private val roles: ManagementRoleJpaRepository,
	private val companies: CompanyJpaRepository,
	@Value("\${buptle.dev-user.email}") private val devUserEmail: String,
	@Value("\${buptle.dev-user.name}") private val devUserName: String,
) : ApplicationRunner {

	private val log = LoggerFactory.getLogger(javaClass)

	@Transactional
	override fun run(args: ApplicationArguments) {
		seedDevUser()
		seedCompanies()
	}

	private fun seedDevUser() {
		if (users.findByEmail(devUserEmail) != null) return
		val role = checkNotNull(roles.findByRoleCode(ManagementRole.DEVELOPER)) { "DEVELOPER 권한이 없습니다. 마이그레이션을 확인하세요." }
		users.save(ManagementUserEntity(ssoSubject = "local:$devUserEmail", email = devUserEmail, name = devUserName, role = role))
		log.info("개발용 작업 유저 생성: {}", devUserEmail)
	}

	private fun seedCompanies() {
		val created = SAMPLES.filter { companies.findBySchemaName(it.schemaName) == null }.onEach { companies.save(it.toEntity()) }
		if (created.isNotEmpty()) log.info("개발용 고객사 {}곳 생성", created.size)
	}

	private data class Sample(
		val schemaName: String,
		val name: String,
		val domain: String,
		val platform: ServicePlatform,
		val users: Int,
		val userLimit: Int? = null,
		val representative: String? = null,
		val businessNumber: String? = null,
		val phone: String? = null,
		val address: String? = null,
		val createdAt: String? = null,
	) {
		fun toEntity() = CompanyEntity(schemaName, domain, name, platform).also {
			it.currentUserCount = users
			it.userLimit = userLimit
			it.ceoName = representative
			it.businessNumber = businessNumber
			it.telephoneNumber = phone
			it.address = address
			it.sourceCreatedAt = createdAt?.let { d -> Instant.parse("${d}T00:00:00Z") }
			it.syncedAt = Instant.now()
		}
	}

	private companion object {
		val SAMPLES = listOf(
			Sample(
				"acetech", "에이스테크놀로지(주)", "ace-tech.buptle.app", ServicePlatform.BUPTLE_BIZ, users = 128, userLimit = 200,
				representative = "김민수", businessNumber = "123-45-67890", phone = "02-1234-5678",
				address = "서울특별시 강남구 테헤란로 123, 에이스빌딩 12층", createdAt = "2024-03-15",
			),
			Sample("hanil_ind", "한일산업", "hanil.buptle.app", ServicePlatform.BUPTLE_BIZ, users = 64),
			Sample("mirae_fin", "미래파이낸스", "mirae.buptle.app", ServicePlatform.BUPTLE_BIZ, users = 212),
			Sample("daehan_eng", "대한엔지니어링", "daehan.buptle.app", ServicePlatform.BUPTLE_BIZ, users = 87),
			Sample("seoul_med", "서울메디컬", "seoulmed.buptle.app", ServicePlatform.BUPTLE_BIZ, users = 45),
			Sample("nova_greenbio", "그린바이오", "greenbio.nova.buptle.app", ServicePlatform.BUPTLE_NOVA, users = 39),
			Sample("nova_kwon_law", "권앤파트너스", "kwonlaw.nova.buptle.app", ServicePlatform.BUPTLE_NOVA, users = 18),
			Sample("nova_blueship", "블루쉽로지스틱스", "blueship.nova.buptle.app", ServicePlatform.BUPTLE_NOVA, users = 73),
		)
	}
}
