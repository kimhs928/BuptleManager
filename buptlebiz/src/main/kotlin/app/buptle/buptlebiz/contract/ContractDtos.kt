package app.buptle.buptlebiz.contract

import app.buptle.core.api.AuditRequest
import app.buptle.operation.log.OperationType
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.PositiveOrZero
import jakarta.validation.constraints.Size
import java.time.Instant
import java.time.LocalDate

/** 계약 상태. TBD: buptlebiz 실제 상태 코드와 대응 */
enum class ContractStatus(val label: String) {
	DRAFTING("작성중"),
	REVIEWING("검토중"),
	SIGNING("서명 진행중"),
	COMPLETED("체결 완료"),
	REJECTED("반려"),
}

enum class ContractKind(val label: String) {
	ELECTRONIC("전자계약"),
	DOCUMENT("문서계약"),
}

enum class ContractGrade(val label: String) {
	NORMAL("일반(비보안)"),
	SECURE("보안"),
}

// ───────────── 검색 ─────────────

data class ContractSummaryResponse(
	@Schema(description = "계약 ID", example = "CT-2024-0315")
	val id: String,
	@Schema(example = "2024 클라우드 서비스 이용계약 (갱신)")
	val name: String,
	val status: ContractStatus,
	@Schema(description = "계약 종류 표시 문구", example = "전자 · 전자서명")
	val kind: String,
	@Schema(description = "기안자 이름", example = "홍길동")
	val creatorName: String,
	@Schema(description = "참여 유저 수(삭제된 유저 제외)", example = "4")
	val members: Int,
	val createdAt: LocalDate,
	val deleted: Boolean,
	val deletedAt: Instant?,
	@Schema(description = "삭제한 유저 이름")
	val deletedBy: String?,
	@Schema(description = "최근 조회 여부. q 가 비었을 때 노출 대상")
	val recent: Boolean,
)

// ───────────── 기본 정보 ─────────────

data class ContractDocumentResponse(
	@Schema(example = "d1")
	val id: String,
	@Schema(example = "2024 클라우드 서비스 이용계약 (갱신).pdf")
	val name: String,
	@Schema(description = "FINAL(최종 문서, 첫 항목) / ATTACHMENT(첨부파일)", allowableValues = ["FINAL", "ATTACHMENT"])
	val kind: String,
)

data class ContractInfoResponse(
	@Schema(description = "계약 ID", example = "CT-2024-0315")
	val id: String,
	@Schema(description = "숫자만 있는 ID", example = "20240315")
	val idPlain: String,
	val name: String,
	@Schema(description = "요약 설명. 빈 문자열 가능")
	val summary: String,
	val startDate: LocalDate?,
	val endDate: LocalDate?,
	@Schema(description = "계약 금액(원), 0 이상 정수", example = "48000000")
	val amount: Long,
	@Schema(allowableValues = ["ko", "en", "ja"], example = "ko")
	val lang: String,
	val status: ContractStatus,
	val deleted: Boolean,
	val createdAt: Instant,
	val updatedAt: Instant,
	val deletedAt: Instant?,
	@Schema(description = "마이그레이션 계약 여부 (수정 불가)")
	val migration: Boolean,
	@Schema(description = "계약 형태. workflow 수정에서만 변경 가능")
	val kind: ContractKind,
	@Schema(description = "서명 방식 (수정 불가). TBD: 종이서명 코드", example = "ELECTRONIC_SIGN")
	val signType: String,
	val grade: ContractGrade,
	val autoRenew: Boolean,
	val documents: List<ContractDocumentResponse>,
)

data class ContractTemplateResponse(
	@Schema(example = "클라우드 서비스 이용계약서 v3")
	val name: String,
	@Schema(description = "상위 카테고리", example = "서비스 이용")
	val categoryParent: String,
	@Schema(example = "SaaS 구독")
	val category: String,
	val description: String,
	@Schema(description = "초안 업로드 템플릿 여부")
	val draftUpload: Boolean,
	val draftUploadLabel: String?,
	val draftFile: String?,
)

data class RecentHistoryItem(
	@Schema(description = "처리 내역 ID", example = "10231")
	val id: Long,
	val type: OperationType,
	@Schema(description = "대상 데이터 설명", example = "참여 유저 · 정우성")
	val target: String,
	@Schema(example = "김효선")
	val user: String,
	val at: Instant,
)

data class RecentHistoryResponse(
	@Schema(description = "이 문서의 처리 내역 전체 건수", example = "14")
	val total: Long,
	@Schema(description = "최근 처리 내역, 최대 10건")
	val items: List<RecentHistoryItem>,
)

@Schema(description = "계약 기본 정보. 계약 정보, 템플릿/카테고리, 최근 히스토리 3묶음")
data class ContractDetailResponse(
	val contract: ContractInfoResponse,
	@Schema(description = "템플릿 없이 만든 계약이면 null")
	val template: ContractTemplateResponse?,
	val recentHistory: RecentHistoryResponse,
)

@Schema(description = "바꿀 항목만 보낸다. 계약 ID, 마이그레이션, 계약 종류, 서명 방식은 수정할 수 없다.")
data class ContractUpdateRequest(
	@field:Size(min = 1, max = 200)
	val name: String? = null,
	val summary: String? = null,
	@field:PositiveOrZero
	val amount: Long? = null,
	@Schema(allowableValues = ["ko", "en", "ja"])
	val lang: String? = null,
	val status: ContractStatus? = null,
	@Schema(description = "true 로 바꾸면 deletedAt 은 서버 시각, false 로 바꾸면 null")
	val deleted: Boolean? = null,
	val startDate: LocalDate? = null,
	val endDate: LocalDate? = null,
	val createdAt: Instant? = null,
	val updatedAt: Instant? = null,
	val deletedAt: Instant? = null,
	val grade: ContractGrade? = null,
	val autoRenew: Boolean? = null,
	@field:Valid
	val audit: AuditRequest,
)

// ───────────── 참여 유저 ─────────────

data class ContractMemberResponse(
	@Schema(example = "m1")
	val id: String,
	@Schema(description = "내부/외부 유저", allowableValues = ["internal", "external"])
	val kind: String,
	@Schema(description = "계약 내 역할(복수). 외부 유저는 [\"상대방 서명자\"]", example = "[\"기안자\",\"최종승인자\"]")
	val roles: List<String>,
	val name: String,
	val email: String,
	val company: String,
	val dept: String,
	val phone: String,
	@Schema(description = "계약 내 권한(조회/서명/관리). 외부 유저는 빈 배열", example = "[\"조회\",\"서명\"]")
	val perm: List<String>,
	@Schema(description = "개인 서명 / 회사 서명 / -", example = "개인 서명")
	val signMethod: String,
	@Schema(description = "SMS 인증 / 공인인증서 / 디지털 직인 / 수기 서명 / -", example = "SMS 인증")
	val signType: String,
	@Schema(description = "완료 / 대기 / 거부 / -", example = "완료")
	val signStatus: String,
	@Schema(allowableValues = ["ko", "en", "ja"])
	val lang: String,
	@Schema(description = "시스템 내 역할. 외부 유저는 빈 배열", example = "[\"GENERAL\"]")
	val sysRoles: List<String>,
	val deleted: Boolean,
	val joinedAt: Instant,
	val updatedAt: Instant,
	val deletedAt: Instant?,
)

@Schema(description = "내부 유저(kind=internal)는 userId/name/email/roles/perm 필수, 외부 유저(kind=external)는 name/email 필수이며 역할은 서버가 상대방 서명자로 고정한다.")
data class ContractMemberCreateRequest(
	@field:NotBlank
	@Schema(allowableValues = ["internal", "external"])
	val kind: String,
	@Schema(description = "사번. 내부 유저만", example = "A00388")
	val userId: String? = null,
	@field:NotBlank
	val name: String,
	@field:NotBlank
	val email: String,
	val company: String? = null,
	val dept: String? = null,
	val phone: String? = null,
	@Schema(description = "내부 유저만. 1개 이상", example = "[\"검토자\"]")
	val roles: List<String>? = null,
	@Schema(description = "내부 유저만", example = "[\"조회\"]")
	val perm: List<String>? = null,
	@Schema(allowableValues = ["ko", "en", "ja"])
	val lang: String = "ko",
	val signMethod: String,
	val signType: String,
	@Schema(description = "기본 대기")
	val signStatus: String = "대기",
	@field:Valid
	val audit: AuditRequest,
)

@Schema(
	description = "바꿀 항목만 보낸다. 내부 유저: roles, perm, dept, phone, lang, signMethod, signType, signStatus, joinedAt, updatedAt, deleted, deletedAt. " +
		"외부 유저: name, email, company, dept, phone, lang, signMethod, signType, signStatus, joinedAt, updatedAt, deleted, deletedAt.",
)
data class ContractMemberUpdateRequest(
	val name: String? = null,
	val email: String? = null,
	val company: String? = null,
	val dept: String? = null,
	val phone: String? = null,
	val roles: List<String>? = null,
	val perm: List<String>? = null,
	val lang: String? = null,
	val signMethod: String? = null,
	val signType: String? = null,
	val signStatus: String? = null,
	val joinedAt: Instant? = null,
	val updatedAt: Instant? = null,
	@Schema(description = "true 로 바꾸면 deletedAt 은 서버 시각, false 로 바꾸면 null")
	val deleted: Boolean? = null,
	val deletedAt: Instant? = null,
	@field:Valid
	val audit: AuditRequest,
)

// ───────────── workflow ─────────────

data class WorkflowAttr(
	@Schema(example = "docType")
	val key: String,
	@Schema(example = "계약 형태")
	val label: String,
	@Schema(allowableValues = ["single", "multi"])
	val type: String,
	val options: List<String>,
	val value: List<String>,
)

data class WorkflowUser(
	@Schema(example = "부서장")
	val role: String,
	val name: String,
	val email: String,
	val dept: String,
	@Schema(example = "부서장 승인")
	val stage: String,
	@Schema(description = "연결된 설정 항목 key. 해당 항목이 '불필요'이면 화면에서 흐리게 표시", example = "deptApproval")
	val optionKey: String?,
)

data class WorkflowPerson(val name: String, val dept: String)

data class WorkflowStage(
	@Schema(example = "서명")
	val name: String,
	@Schema(example = "[\"당사 서명\",\"상대 서명\"]")
	val substages: List<String>,
	val people: List<WorkflowPerson>,
)

data class WorkflowResponse(
	@Schema(description = "workflow 이름 (수정 불가)", example = "표준 전자 계약 workflow")
	val name: String,
	@Schema(description = "rev_num (수정 불가)", example = "WF-ACE-0315-232")
	val rev: String,
	val attrs: List<WorkflowAttr>,
	val users: List<WorkflowUser>,
	val process: List<WorkflowStage>,
	@Schema(example = "상대 서명")
	val currentStage: String,
)

data class WorkflowAttrUpdate(
	val key: String,
	val value: List<String>,
)

data class WorkflowUpdateRequest(
	@Schema(description = "바꿀 설정 항목만")
	val attrs: List<WorkflowAttrUpdate>,
	@field:Valid
	val audit: AuditRequest,
)

data class WorkflowChangeResponse(
	val workflow: WorkflowResponse,
	val changeCount: Int,
	val historyIds: List<Long>,
)

// ───────────── 진행 히스토리 ─────────────

data class HistoryEmail(val subject: String, val body: String, val attachments: List<String>)

data class HistoryParticipant(
	val name: String,
	val role: String,
	@Schema(allowableValues = ["추가", "삭제", "권한 변경"])
	val change: String,
)

data class HistoryAttachment(
	val name: String,
	@Schema(allowableValues = ["추가", "삭제", "외부 발송", "발송 취소"])
	val change: String,
)

data class HistoryTransfer(val kind: String, val from: String, val to: String)

@Schema(description = "contract_history.extra_info. htmlType 에 따라 쓰는 필드가 다르다.")
data class ContractHistoryExtra(
	@Schema(description = "표시 유형 1~9", minimum = "1", maximum = "9")
	val htmlType: Int,
	@Schema(description = "문서 버전과 연결된 이력인지")
	val compareDoc: Boolean,
	val docId: String? = null,
	@Schema(description = "서명 구분 0~4")
	val signCls: Int? = null,
	@Schema(description = "서명 방법 코드 0,1,2,3,4,22")
	val signMethod: Int? = null,
	@Schema(description = "htmlType 2 일 때 코멘트 작성자")
	val commenter: String? = null,
	@Schema(description = "htmlType 4 일 때 스마트 이메일")
	val email: HistoryEmail? = null,
	@Schema(description = "htmlType 5 일 때", allowableValues = ["승인", "반려"])
	val result: String? = null,
	@Schema(description = "htmlType 7 일 때")
	val participants: List<HistoryParticipant>? = null,
	@Schema(description = "htmlType 8 일 때")
	val attachments: List<HistoryAttachment>? = null,
	@Schema(description = "htmlType 9 일 때 담당자 전환 정보")
	val transfer: HistoryTransfer? = null,
)

data class ContractHistoryResponse(
	@Schema(example = "h1")
	val id: String,
	@Schema(description = "액션 이름(action_text)", example = "초안 상신")
	val action: String,
	@Schema(description = "액션 타입 코드(action_type)", example = "12")
	val actionType: Int,
	val at: Instant,
	@Schema(description = "액션 유저 이름", example = "김효선")
	val user: String,
	val deleted: Boolean,
	@Schema(description = "빈 문자열 가능")
	val comment: String,
	@Schema(description = "액션 전 단계", example = "초안 작성")
	val from: String,
	@Schema(description = "액션 후 단계", example = "부서장 승인")
	val to: String,
	@Schema(description = "프로세스 단계가 실제로 바뀐 이력인지. 서버가 판단해서 내려준다")
	val stageMove: Boolean,
	val extra: ContractHistoryExtra,
)

data class ContractHistoryListResponse(
	@Schema(description = "액션 일시 오름차순")
	val items: List<ContractHistoryResponse>,
	@Schema(description = "필터 선택 목록: 이 계약 이력에 등장한 액션 유저(중복 없이 시간순). 필터와 무관하게 계산")
	val users: List<String>,
	@Schema(description = "필터 선택 목록: 액션 이름")
	val actions: List<String>,
)

@Schema(description = "수정 가능: 액션 유저, 액션 일자, 삭제 유무, 코멘트. 액션 타입과 단계 이동은 읽기 전용.")
data class ContractHistoryUpdateRequest(
	@Schema(description = "이 계약의 참여 유저 이름만 허용")
	val user: String? = null,
	val at: Instant? = null,
	val deleted: Boolean? = null,
	val comment: String? = null,
	@field:Valid
	val audit: AuditRequest,
)

// ───────────── 이메일 ─────────────

data class ContractEmailResponse(
	@Schema(example = "e1")
	val id: String,
	val createdAt: Instant,
	val updatedAt: Instant,
	@Schema(example = "박지훈")
	val sender: String,
	val senderMail: String,
	val receiver: String,
	val receiverMail: String,
	val subject: String,
	@Schema(example = "https://ace-tech.buptle.app/mail/ML-20240315-0042")
	val link: String,
	@Schema(description = "본문 텍스트(줄바꿈 \\n)")
	val body: String,
	@Schema(example = "CT-2024-0315")
	val contractId: String,
)
