package app.buptle.operation.user

interface ManagementUserRepository {
	fun findByEmail(email: String): ManagementUser?
}
