package app.buptle.infra.user

import app.buptle.infra.jpa.BaseTimeEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "management_users")
class ManagementUserEntity(
	/** 중앙 IdP 가 전달하는 변하지 않는 사용자 식별자 */
	@Column(name = "sso_subject", nullable = false, unique = true)
	val ssoSubject: String,

	@Column(name = "user_email", nullable = false, unique = true)
	var email: String,

	@Column(name = "user_name", nullable = false, length = 100)
	var name: String,

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "role_id", nullable = false)
	var role: ManagementRoleEntity,

	@Column(name = "is_active", nullable = false)
	var active: Boolean = true,
) : BaseTimeEntity() {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	@Column(name = "last_login_at")
	var lastLoginAt: Instant? = null

	@Column(name = "deleted_at")
	var deletedAt: Instant? = null
}
