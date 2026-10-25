package app.buptle.infra.user

import app.buptle.operation.user.ManagementUser
import app.buptle.operation.user.ManagementUserRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
class ManagementUserRepositoryAdapter(
	private val users: ManagementUserJpaRepository,
) : ManagementUserRepository {

	override fun findByEmail(email: String): ManagementUser? = users.findByEmail(email)?.let {
		ManagementUser(id = checkNotNull(it.id), email = it.email, name = it.name, role = it.role.roleCode)
	}
}
