package app.buptle.infra.config

import app.buptle.infra.company.CompanyEntity
import app.buptle.infra.user.ManagementUserEntity
import jakarta.persistence.Column
import jakarta.persistence.Embeddable
import jakarta.persistence.EmbeddedId
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.FetchType
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.MapsId
import jakarta.persistence.Table
import java.io.Serializable
import java.time.Instant
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener

@Embeddable
data class CompanyConfigId(
	@Column(name = "company_id")
	var companyId: Long = 0,

	@Column(name = "config_id")
	var configId: Long = 0,
) : Serializable

/** 고객사에 적용된 컨피그와 그 값 */
@Entity
@Table(name = "company_configs")
@EntityListeners(AuditingEntityListener::class)
class CompanyConfigEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("companyId")
	@JoinColumn(name = "company_id")
	val company: CompanyEntity,

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@MapsId("configId")
	@JoinColumn(name = "config_id")
	val config: ConfigEntity,

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "applied_by", nullable = false)
	var appliedBy: ManagementUserEntity,

	@Column(name = "applied_at", nullable = false)
	val appliedAt: Instant,
) {
	@EmbeddedId
	val id: CompanyConfigId = CompanyConfigId()

	@Column(name = "config_value", columnDefinition = "text")
	var configValue: String? = null

	@LastModifiedDate
	@Column(name = "updated_at", nullable = false)
	lateinit var updatedAt: Instant
		protected set
}
