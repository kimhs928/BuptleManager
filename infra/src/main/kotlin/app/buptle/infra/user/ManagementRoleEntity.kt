package app.buptle.infra.user

import app.buptle.operation.user.ManagementRole
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "management_roles")
class ManagementRoleEntity(
	@Enumerated(EnumType.STRING)
	@Column(name = "role_code", nullable = false, unique = true, length = 30)
	val roleCode: ManagementRole,

	@Column(name = "role_name", nullable = false, length = 50)
	var roleName: String,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null
}
