package app.buptle.infra.operation

import app.buptle.company.domain.ServicePlatform
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationHistoryRepository
import app.buptle.operation.log.RecentTarget
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
class OperationHistoryRepositoryAdapter(
	private val em: EntityManager,
) : OperationHistoryRepository {

	override fun findRecentTargets(platform: ServicePlatform, schemaName: String, category: OperationCategory, limit: Int): List<RecentTarget> {
		// 같은 대상이 여러 번 나오므로 넉넉히 읽은 뒤 대상별 최신 1건만 남긴다
		val rows = em.createQuery(
			"""
			select t from OperationTargetEntity t
			join fetch t.operationLog l
			join fetch l.actor
			join l.companies c
			where t.targetType = :category and t.externalTargetId is not null
			  and c.schemaName = :schema and c.servicePlatform = :platform
			order by l.occurredAt desc, t.id desc
			""".trimIndent(),
			OperationTargetEntity::class.java,
		)
			.setParameter("category", category)
			.setParameter("schema", schemaName)
			.setParameter("platform", platform)
			.setMaxResults(limit * FETCH_FACTOR)
			.resultList

		return rows
			.distinctBy { it.externalTargetId }
			.take(limit)
			.map {
				val log = it.operationLog
				RecentTarget(
					targetId = it.externalTargetId!!,
					name = (it.targetData?.get("name") ?: it.afterData?.get("name")) as? String,
					lastType = log.type,
					lastOperatedAt = log.occurredAt,
					operatorName = log.actor.name,
				)
			}
	}

	private companion object {
		const val FETCH_FACTOR = 20
	}
}
