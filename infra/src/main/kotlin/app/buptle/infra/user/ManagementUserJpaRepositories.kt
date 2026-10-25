package app.buptle.infra.user

import app.buptle.operation.user.ManagementRole
import org.springframework.data.jpa.repository.JpaRepository

interface ManagementRoleJpaRepository : JpaRepository<ManagementRoleEntity, Long> {
	fun findByRoleCode(roleCode: ManagementRole): ManagementRoleEntity?
}

interface ManagementUserJpaRepository : JpaRepository<ManagementUserEntity, Long> {
	fun findByEmail(email: String): ManagementUserEntity?
}
