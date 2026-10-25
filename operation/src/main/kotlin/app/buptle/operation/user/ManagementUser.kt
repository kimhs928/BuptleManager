package app.buptle.operation.user

data class ManagementUser(
	val id: Long,
	val email: String,
	val name: String,
	val role: ManagementRole,
)
