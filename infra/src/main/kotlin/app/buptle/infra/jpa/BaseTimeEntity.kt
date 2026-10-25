package app.buptle.infra.jpa

import jakarta.persistence.Column
import jakarta.persistence.EntityListeners
import jakarta.persistence.MappedSuperclass
import java.time.Instant
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.annotation.LastModifiedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener

/** created_at / updated_at 을 자동으로 채우는 공통 엔티티 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener::class)
abstract class BaseTimeEntity {

	@CreatedDate
	@Column(name = "created_at", nullable = false, updatable = false)
	lateinit var createdAt: Instant
		protected set

	@LastModifiedDate
	@Column(name = "updated_at", nullable = false)
	lateinit var updatedAt: Instant
		protected set
}
