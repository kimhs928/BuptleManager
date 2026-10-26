package app.buptle.buptlebiz.contract

import app.buptle.core.api.ChangeResponse
import app.buptle.core.api.CreatedResponse
import app.buptle.core.api.ListResponse
import app.buptle.core.api.PageResponse
import app.buptle.core.api.notImplemented
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

/**
 * 계약 API 명세용 스텁. 본문은 모두 501 이고, 구현할 때 호출부를 실제 로직으로 바꾼다.
 * 모든 변경 요청은 본문에 audit(티켓, 요청자, 사유)을 담는다.
 */
@Tag(name = "특정 고객사 > 계약서 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}/contracts")
class ContractStubController {

	@Operation(summary = "계약 검색", description = "q 가 비어 있으면 recent=true 항목을 '최근 조회한 계약'으로 쓴다.")
	@GetMapping
	fun search(
		@PathVariable schemaName: String,
		@Parameter(description = "계약 ID 또는 계약명 부분 일치") @RequestParam(required = false) q: String?,
		@Parameter(description = "삭제된 계약 포함") @RequestParam(defaultValue = "false") includeDeleted: Boolean,
		@RequestParam(defaultValue = "1") @Min(1) page: Int,
		@RequestParam(defaultValue = "10") @Min(1) @Max(100) size: Int,
	): PageResponse<ContractSummaryResponse> = notImplemented()

	@Operation(
		summary = "계약 기본 정보",
		description = "계약 정보, 템플릿/카테고리, 최근 히스토리 3묶음. 조회하면 서버가 '최근 조회한 계약'에도 기록한다.",
	)
	@GetMapping("/{id}")
	fun detail(@PathVariable schemaName: String, @PathVariable id: String): ContractDetailResponse = notImplemented()

	@Operation(
		summary = "계약 기본 정보 수정",
		description = "수정 불가: 계약 ID, 마이그레이션, 계약 종류, 서명 방식(계약 형태는 workflow 수정에서만). " +
			"startDate <= endDate. 보낸 항목 중 실제 바뀐 것만 변경 전/후로 기록한다.",
	)
	@PatchMapping("/{id}")
	fun update(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Valid @RequestBody request: ContractUpdateRequest,
	): ChangeResponse<ContractInfoResponse> = notImplemented()

	@Operation(summary = "계약 참여 유저 정보", description = "참여일 오름차순.")
	@GetMapping("/{id}/members")
	fun members(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Parameter(description = "삭제된 유저 포함") @RequestParam(defaultValue = "true") includeDeleted: Boolean,
	): ListResponse<ContractMemberResponse> = notImplemented()

	@Operation(
		summary = "계약 참여 유저 추가",
		description = "같은 이메일이 이미 참여 중이면 409 DUPLICATE_MEMBER. 추가된 유저는 deleted=false, joinedAt/updatedAt 은 서버 현재 시각.",
	)
	@PostMapping("/{id}/members")
	@ResponseStatus(HttpStatus.CREATED)
	fun addMember(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Valid @RequestBody request: ContractMemberCreateRequest,
	): CreatedResponse<ContractMemberResponse> = notImplemented()

	@Operation(
		summary = "계약 참여 유저 수정",
		description = "내부 유저의 이름, 이메일, 회사, 시스템 내 역할과 외부 유저의 계약 내 역할, 권한은 수정 불가. 외부 유저 이메일이 같은 계약에서 중복되면 409.",
	)
	@PatchMapping("/{id}/members/{memberId}")
	fun updateMember(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@PathVariable memberId: String,
		@Valid @RequestBody request: ContractMemberUpdateRequest,
	): ChangeResponse<ContractMemberResponse> = notImplemented()

	@Operation(summary = "계약 workflow 정보")
	@GetMapping("/{id}/workflow")
	fun workflow(@PathVariable schemaName: String, @PathVariable id: String): WorkflowResponse = notImplemented()

	@Operation(summary = "계약 workflow 수정", description = "name, rev 는 수정 불가.")
	@PatchMapping("/{id}/workflow")
	fun updateWorkflow(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Valid @RequestBody request: WorkflowUpdateRequest,
	): WorkflowChangeResponse = notImplemented()

	@Operation(summary = "계약 히스토리 정보", description = "액션 일시 오름차순.")
	@GetMapping("/{id}/history")
	fun history(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Parameter(description = "삭제된 이력 포함") @RequestParam(defaultValue = "true") includeDeleted: Boolean,
		@Parameter(description = "true 면 docId 가 있는 이력만") @RequestParam(defaultValue = "false") docOnly: Boolean,
		@Parameter(description = "액션 유저 이름 일치") @RequestParam(required = false) user: String?,
		@Parameter(description = "액션 이름 일치") @RequestParam(required = false) action: String?,
	): ContractHistoryListResponse = notImplemented()

	@Operation(summary = "계약 히스토리 수정", description = "수정 불가: 액션 타입, 단계 이동(from, to). deleted=true 면 삭제 일시를 서버가 기록한다.")
	@PatchMapping("/{id}/history/{historyId}")
	fun updateHistory(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@PathVariable historyId: String,
		@Valid @RequestBody request: ContractHistoryUpdateRequest,
	): ChangeResponse<ContractHistoryResponse> = notImplemented()

	@Operation(summary = "계약 이메일 정보", description = "최신순(생성 일시 내림차순).")
	@GetMapping("/{id}/emails")
	fun emails(@PathVariable schemaName: String, @PathVariable id: String): ListResponse<ContractEmailResponse> = notImplemented()
}
