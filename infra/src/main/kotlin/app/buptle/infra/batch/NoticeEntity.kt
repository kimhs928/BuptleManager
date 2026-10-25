package app.buptle.infra.batch

import app.buptle.operation.batch.NoticeType
import jakarta.persistence.CascadeType
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
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.Instant
import org.springframework.data.annotation.CreatedDate
import org.springframework.data.jpa.domain.support.AuditingEntityListener

/** 배치가 만든 알림 (예: 미등록 컨피그 발견) */
@Entity
@Table(name = "notices")
@EntityListeners(AuditingEntityListener::class)
class NoticeEntity(
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "batch_run_id", nullable = false)
	val batchRun: BatchRunEntity,

	@Enumerated(EnumType.STRING)
	@Column(name = "notice_type", nullable = false, length = 30)
	val noticeType: NoticeType,

	@Column(name = "title", nullable = false)
	var title: String,

	@Column(name = "content", nullable = false, columnDefinition = "text")
	var content: String,
) {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	val id: Long? = null

	@Column(name = "resolved_at")
	var resolvedAt: Instant? = null

	@CreatedDate
	@Column(name = "created_at", nullable = false, updatable = false)
	lateinit var createdAt: Instant
		protected set

	@OneToMany(mappedBy = "notice", cascade = [CascadeType.ALL], orphanRemoval = true)
	val items: MutableList<NoticeItemEntity> = mutableListOf()
}
