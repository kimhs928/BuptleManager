package app.buptle.auth

import app.buptle.operation.user.CurrentUserProvider
import app.buptle.operation.user.ManagementUser
import app.buptle.operation.user.ManagementUserRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/** 로그인 구현 전 개발용: 항상 개발용 작업 유저 1개를 현재 작업자로 사용한다. TODO: 로그인 구현 시 제거 */
@Component
@Profile("local")
class LocalCurrentUserProvider(
	private val users: ManagementUserRepository,
	@Value("\${buptle.dev-user.email}") private val email: String,
) : CurrentUserProvider {

	override fun currentUser(): ManagementUser =
		checkNotNull(users.findByEmail(email)) { "개발용 작업 유저($email)가 없습니다. buptle.dev-seed.enabled=true 로 기동하세요." }
}
