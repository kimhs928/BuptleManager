package app.buptle.infra.operation

import app.buptle.infra.company.CompanyEntity
import app.buptle.infra.user.ManagementUserEntity
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationType
import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.Instant
import java.util.UUID
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes

/** 운영관리 시스템에서 수행한 작업 1건 (감사 이력) */
@Entity
@Table(name = "operation_logs")
class OperationLogEntity(
	/** 애플리케이션에서 생성하는 작업 단위 식별자 */
	@Column(name = "operation_key", nullable = false, unique = true)
	val operationKey: UUID,

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "actor_user_id", nullable = false)
	val actor: ManagementUserEntity,

	@Enumerated(EnumType.STRING)
	@Column(name = "operation_category", nullable = false, length = 30)
	val category: OperationCategory,

	@Enumerated(EnumType.STRING)
	@Column(name = "operation_type", nullable = false, length = 30)
	val type: OperationType,

	@Column(name = "occurred_at", nullable = false)
	val occurredAt: Instant,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	/** Zendesk 티켓 또는 내부 요청 번호 */
	@Column(name = "ticket_number", length = 100)
	var ticketNumber: String? = null

	/** Zendesk 시스템의 티켓 ID (채팅 내역 조회용) */
	@Column(name = "zendesk_ticket_id", length = 50)
	var zendeskTicketId: String? = null

	@Column(name = "operation_reason", columnDefinition = "text")
	var reason: String? = null

	/** 검색 조건, 추출 조건 등 작업 입력값 */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "request_data", columnDefinition = "jsonb")
	var requestData: Map<String, Any?>? = null

	/** 조회·추출 건수 등 결과 요약 (개인정보 원문은 저장하지 않는다) */
	@JdbcTypeCode(SqlTypes.JSON)
	@Column(name = "result_data", columnDefinition = "jsonb")
	var resultData: Map<String, Any?>? = null

	@ManyToMany
	@JoinTable(
		name = "operation_companies",
		joinColumns = [JoinColumn(name = "operation_log_id")],
		inverseJoinColumns = [JoinColumn(name = "company_id")],
	)
	val companies: MutableSet<CompanyEntity> = mutableSetOf()

	@OneToMany(mappedBy = "operationLog", cascade = [CascadeType.ALL], orphanRemoval = true)
	val targets: MutableList<OperationTargetEntity> = mutableListOf()
}
