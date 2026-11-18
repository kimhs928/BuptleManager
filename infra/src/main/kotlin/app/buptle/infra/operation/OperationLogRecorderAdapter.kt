package app.buptle.infra.operation

import app.buptle.infra.company.CompanyEntity
import app.buptle.infra.user.ManagementUserEntity
import app.buptle.operation.log.OperationLogRecorder
import app.buptle.operation.log.OperationRecord
import app.buptle.operation.user.CurrentUserProvider
import jakarta.persistence.EntityManager
import java.time.Instant
import java.util.UUID
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class OperationLogRecorderAdapter(
	private val em: EntityManager,
	private val currentUser: CurrentUserProvider,
) : OperationLogRecorder {

	@Transactional
	override fun record(record: OperationRecord): Long {
		val actor = em.getReference(ManagementUserEntity::class.java, currentUser.currentUser().id)
		val log = OperationLogEntity(UUID.randomUUID(), actor, record.category1, record.type, Instant.now())
		log.category2 = record.category2
		log.ticketNumber = record.ticket
		log.reason = record.reason
		log.requestData = mapOf("requester" to record.requester)
		log.resultData = mapOf("target" to record.targetId)
		em.createQuery("select c from CompanyEntity c where c.schemaName = :schema and c.servicePlatform = :platform", CompanyEntity::class.java)
			.setParameter("schema", record.schemaName).setParameter("platform", record.platform).resultList
			.forEach { log.companies.add(it) }
		val target = OperationTargetEntity(log, record.category1).also {
			it.externalTargetId = record.targetId
			it.targetData = mapOf("name" to record.targetName)
			it.beforeData = record.before
			it.afterData = record.after
		}
		log.targets.add(target)
		em.persist(log)
		em.flush()
		return checkNotNull(log.id)
	}
}
