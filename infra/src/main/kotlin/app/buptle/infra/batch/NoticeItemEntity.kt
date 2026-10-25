package app.buptle.infra.batch

import app.buptle.infra.config.ConfigEntity
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
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

/** 알림에 포함된 개별 항목 (미등록 컨피그 1건) */
@Entity
@Table(name = "notice_items")
class NoticeItemEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "notice_id", nullable = false)
	val notice: NoticeEntity,

	@Column(name = "missing_config_name", nullable = false)
	val missingConfigName: String,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	/** BuptleBiz 에서 발견한 미등록 컨피그 정보 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "detected_data", columnDefinition = "jsonb")
	var detectedData: Map<String, Any?>? = null

	/** 등록 완료된 컨피그. 미등록 상태에서는 null */
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "registered_config_id")
	var registeredConfig: ConfigEntity? = null

	@Column(name = "resolved_at")
	var resolvedAt: Instant? = null
}
