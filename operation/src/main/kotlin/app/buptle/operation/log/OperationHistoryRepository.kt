package app.buptle.operation.log

import app.buptle.company.domain.ServicePlatform
import java.time.Instant

/** 작업 이력에서 찾은 최근 작업 대상 1건 (같은 대상은 가장 최근 작업 하나만) */
data class RecentTarget(
	/** Buptle Cloud 쪽 대상 ID (계약 ID 등) */
	val targetId: String,
	/** 작업 당시 스냅샷에 남은 이름. 없으면 null */
	val name: String?,
	val lastType: OperationType,
	val lastOperatedAt: Instant,
	val operatorName: String,
)

interface OperationHistoryRepository {
	/** 고객사에서 [category] 대상으로 작업한 이력 중 대상별 가장 최근 작업을 최신순으로 [limit] 건 찾는다. */
	fun findRecentTargets(platform: ServicePlatform, schemaName: String, category: OperationCategory, limit: Int): List<RecentTarget>
}
