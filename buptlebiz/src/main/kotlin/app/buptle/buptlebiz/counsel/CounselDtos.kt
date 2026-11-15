package app.buptle.buptlebiz.counsel

import io.swagger.v3.oas.annotations.media.Schema
import java.time.Instant
import java.time.LocalDate

// ───────────── 검색 ─────────────

data class CounselSummaryResponse(
	@Schema(description = "자문 ID (counsel_bcounsel.view_code)", example = "20240112-00000012")
	val id: String,
	val name: String,
	@Schema(description = "자문 상태 코드 (enum BIZ_COUNSEL_STATUS)", example = "REVIEW")
	val status: String,
	@Schema(description = "요청자 이름")
	val requester: String,
	@Schema(description = "담당 변호사 이름. 없으면 '-'")
	val lawyer: String,
	@Schema(description = "참여 유저 수 (요청자·승인자·관련인·회람인·외부 변호사, 사람 단위)")
	val members: Int,
	val createdAt: LocalDate,
	val deleted: Boolean,
	@Schema(description = "검색 목록에서는 항상 false. 최근 조회는 GET /recent")
	val recent: Boolean,
)

// ───────────── 기본 정보 ─────────────

data class CounselDetailResponse(
	val id: String,
	@Schema(description = "하이픈 없는 ID")
	val idPlain: String,
	val name: String,
	val status: String,
	val createdAt: Instant,
	val updatedAt: Instant,
	val deleted: Boolean,
	val deletedAt: Instant?,
	@Schema(description = "관리 자문 여부. counsel_bcounsel.ismanaged 가 IS_COUNSEL_FINAL_APPROVAL(최종승인 필요)이면 true")
	val managed: Boolean,
	@Schema(example = "PUBLIC")
	val counselType: String,
	@Schema(example = "INNER")
	val showRangeType: String,
	val projects: List<String>,
	val migrated: Boolean,
	val categoryParent: String,
	val category: String,
)

// ───────────── 참여 유저 ─────────────

data class CounselMemberResponse(
	@Schema(description = "참여 유저 행 ID. 출처 테이블별 PK 를 합성한다 (예: u12, x7)")
	val id: String,
	@Schema(description = "사내 유저의 user_id. 외부 변호사는 null")
	val userId: String?,
	val name: String,
	val email: String,
	val company: String,
	val phone: String,
	@Schema(description = "자문 내 역할 (여러 개)")
	val roles: List<String>,
	val dept: String,
	@Schema(description = "시스템 내 역할. 외부 변호사는 빈 목록")
	val sysRoles: List<String>,
	@Schema(description = "승인 타입(부서장/검토자/최종승인자). 승인 절차에 없으면 빈 문자열")
	val approvalType: String,
	@Schema(description = "승인 내역(등록/요청/승인/부결·반려/자문 중단). 승인 절차에 없으면 빈 문자열")
	val approvalStatus: String,
	val deleted: Boolean,
	val createdAt: Instant,
	val updatedAt: Instant,
	val deletedAt: Instant?,
)

// ───────────── 프로세스 ─────────────

data class CounselWorkflowAttrResponse(
	val key: String,
	val label: String,
	@Schema(allowableValues = ["single", "multi"])
	val type: String,
	val options: List<String>,
	val value: List<String>,
)

data class CounselGuidePerson(val name: String, val dept: String)

data class CounselGuideStageResponse(
	val name: String,
	@Schema(description = "연결된 설정 항목 키. 그 항목이 '불필요'면 흐리게 보인다")
	val opt: String?,
	val people: List<CounselGuidePerson>,
)

data class CounselProcessResponse(
	val attrs: List<CounselWorkflowAttrResponse>,
	val guide: List<CounselGuideStageResponse>,
)

// ───────────── 히스토리 · 이메일 ─────────────

data class CounselHistoryResponse(
	val id: String,
	val action: String,
	val at: Instant,
	val deleted: Boolean,
	val comment: String,
	@Schema(description = "본문(자문 질문/답변 내용, counsel_bccontent.content_text). 본문이 없는 이력은 빈 문자열")
	val body: String,
	val from: String,
	val to: String,
	val stageMove: Boolean,
	val user: String,
)

data class CounselEmailResponse(
	val id: String,
	val createdAt: Instant,
	val updatedAt: Instant,
	val sender: String,
	val senderMail: String,
	val receiver: String,
	val receiverMail: String,
	val subject: String,
	val link: String,
	val body: String,
)
