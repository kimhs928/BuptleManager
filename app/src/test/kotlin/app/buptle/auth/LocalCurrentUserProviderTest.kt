package app.buptle.auth

import app.buptle.operation.user.ManagementRole
import app.buptle.operation.user.ManagementUser
import app.buptle.operation.user.ManagementUserRepository
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class LocalCurrentUserProviderTest {

	private val dev = ManagementUser(1, "dev@buptle.local", "홍길동", ManagementRole.DEVELOPER)

	private fun repository(vararg users: ManagementUser) = object : ManagementUserRepository {
		override fun findByEmail(email: String) = users.find { it.email == email }
	}

	@Test
	fun `설정된 이메일의 개발용 유저를 현재 작업자로 돌려준다`() {
		val provider = LocalCurrentUserProvider(repository(dev), "dev@buptle.local")

		assertEquals(dev, provider.currentUser())
	}

	@Test
	fun `개발용 유저가 없으면 시드 설정 안내와 함께 실패한다`() {
		val provider = LocalCurrentUserProvider(repository(), "dev@buptle.local")

		val error = assertFailsWith<IllegalStateException> { provider.currentUser() }

		assertEquals(true, error.message?.contains("dev-seed"))
	}
}
