package app.buptle.infra.config

import app.buptle.company.domain.ConfigScope
import app.buptle.infra.jpa.BaseTimeEntity
import app.buptle.infra.user.ManagementUserEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import jakarta.persistence.UniqueConstraint

/** 법무시스템에서 사용하는 컨피그 정의 */
@Entity
@Table(
	name = "configs",
	uniqueConstraints = [UniqueConstraint(name = "uk_configs_name_scope", columnNames = ["config_name", "config_scope"])],
)
class ConfigEntity(
	@Column(name = "config_name", nullable = false)
	val configName: String,

	@Enumerated(EnumType.STRING)
	@Column(name = "config_scope", nullable = false, length = 30)
	var configScope: ConfigScope,

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "created_by", nullable = false)
	val createdBy: ManagementUserEntity,
) : BaseTimeEntity() {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	@Column(name = "default_value", columnDefinition = "text")
	var defaultValue: String? = null

	@Column(name = "config_description", columnDefinition = "text")
	var configDescription: String? = null
}
