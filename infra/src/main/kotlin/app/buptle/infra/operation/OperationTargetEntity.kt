package app.buptle.infra.operation

import app.buptle.operation.log.OperationCategory
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EntityListeners
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
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
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener

/** 작업 1건이 대상으로 한 Buptle Cloud 데이터 (외래키 없이 종류와 외부 ID 로 식별) */
@Entity
@Table(name = "operation_targets")
@EntityListeners(AuditingEntityListener::class)
class OperationTargetEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "operation_log_id", nullable = false)
	val operationLog: OperationLogEntity,

	@Enumerated(EnumType.STRING)
	@Column(name = "target_type", nullable = false, length = 30)
	val targetType: OperationCategory,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	/** Buptle Cloud 에 존재하는 작업 대상 ID */
	@Column(name = "external_target_id")
	var externalTargetId: String? = null

	/** 조회·추출·강제 로그아웃 대상 또는 작업 당시 스냅샷 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "target_data", columnDefinition = "jsonb")
	var targetData: Map<String, Any?>? = null

	/** 수정·삭제·이관 전 데이터 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "before_data", columnDefinition = "jsonb")
	var beforeData: Map<String, Any?>? = null

	/** 수정·추가·이관 후 데이터 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "after_data", columnDefinition = "jsonb")
	var afterData: Map<String, Any?>? = null

	@CreatedDate
	@Column(name = "created_at", nullable = false, updatable = false)
	lateinit var createdAt: Instant
		protected set
}
