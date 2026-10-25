package app.buptle.infra

import app.buptle.infra.dev.DevDataSeeder
import app.buptle.operation.user.ManagementRole
import app.buptle.operation.user.ManagementUserRepository
import app.buptle.support.TestcontainersConfig
import jakarta.persistence.EntityManager
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.DefaultApplicationArguments
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

@SpringBootTest(
	properties = [
		"buptle.dev-seed.enabled=true",
		"buptle.dev-user.email=dev@buptle.test",
		"buptle.dev-user.name=개발 유저",
	],
)
@ActiveProfiles("test")
@Import(TestcontainersConfig::class)
class DevDataSeederTest(
	@Autowired private val seeder: DevDataSeeder,
	@Autowired private val users: ManagementUserRepository,
	@Autowired private val em: EntityManager,
) {

	private fun count(entity: String) = (em.createQuery("select count(e) from $entity e").singleResult as Long).toInt()

	@Test
	fun `기동하면 개발용 작업 유저가 개발자 권한으로 만들어진다`() {
		val user = assertNotNull(users.findByEmail("dev@buptle.test"))

		assertEquals("개발 유저", user.name)
		assertEquals(ManagementRole.DEVELOPER, user.role)
	}

	@Test
	fun `고객사 샘플이 만들어지고 다시 실행해도 중복되지 않는다`() {
		val users = count("ManagementUserEntity")
		val companies = count("CompanyEntity")

		seeder.run(DefaultApplicationArguments())

		assertEquals(8, companies)
		assertEquals(users, count("ManagementUserEntity"))
		assertEquals(companies, count("CompanyEntity"))
	}
}
