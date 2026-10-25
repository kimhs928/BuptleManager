package app.buptle.infra.batch

import app.buptle.company.domain.ServicePlatform
import app.buptle.operation.batch.BatchStatus
import app.buptle.operation.batch.BatchType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

/** 배치 1회 실행 결과 */
@Entity
@Table(name = "batch_runs")
class BatchRunEntity(
	@Enumerated(EnumType.STRING)
	@Column(name = "batch_type", nullable = false, length = 30)
	val batchType: BatchType,

	@Enumerated(EnumType.STRING)
	@Column(name = "service_platform", nullable = false, length = 30)
	val servicePlatform: ServicePlatform,

	@Column(name = "started_at", nullable = false)
	val startedAt: Instant,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	@Enumerated(EnumType.STRING)
	@Column(name = "status", nullable = false, length = 30)
	var status: BatchStatus = BatchStatus.RUNNING

	@Column(name = "finished_at")
	var finishedAt: Instant? = null

	@Column(name = "scanned_count", nullable = false)
	var scannedCount: Int = 0

	@Column(name = "mismatch_count", nullable = false)
	var mismatchCount: Int = 0

	@Column(name = "failure_message", columnDefinition = "text")
	var failureMessage: String? = null
}
