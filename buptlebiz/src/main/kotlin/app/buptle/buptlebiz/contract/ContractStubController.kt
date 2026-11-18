package app.buptle.buptlebiz.contract

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.AuditRequest
import app.buptle.core.api.ChangeResponse
import app.buptle.core.api.CreatedResponse
import app.buptle.core.api.ListResponse
import app.buptle.core.api.PageResponse
import app.buptle.core.api.notImplemented
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationLogRecorder
import app.buptle.operation.log.OperationRecord
import app.buptle.operation.log.OperationSubCategory
import app.buptle.operation.log.OperationType
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
import tools.jackson.databind.ObjectMapper

/**
 * 계약 API 명세용 스텁. 본문은 모두 501 이고, 구현할 때 호출부를 실제 로직으로 바꾼다.
 * 모든 변경 요청은 본문에 audit(티켓, 요청자, 사유)을 담는다.
 */
@Tag(name = "특정 고객사 > 계약서 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}/contracts")
class ContractStubController(
	private val companies: CompanyRepository,
	private val reader: BizContractReader,
	private val memberReader: BizMemberReader,
	private val historyReader: BizHistoryReader,
	private val workflowReader: BizWorkflowReader,
	private val writer: BizContractWriter,
	private val recorder: OperationLogRecorder,
	private val json: ObjectMapper,
) {

	@Suppress("UNCHECKED_CAST")
	private fun toMap(o: Any?): Map<String, Any?> = if (o == null) emptyMap() else json.convertValue(o, Map::class.java) as Map<String, Any?>

	private fun notFoundContract(): Nothing = throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")

	/** 수정 작업을 작업 이력에 남긴다. 바뀐 항목만 전/후 값으로 기록한다. 남긴 이력의 ID */
	private fun log(schemaName: String, sub: OperationSubCategory, type: OperationType, contractId: String, contractName: String, before: Any?, after: Any?, audit: AuditRequest): Long {
		val b = toMap(before)
		val a = toMap(after)
		val keys = a.keys.filter { b[it] != a[it] }
		return recorder.record(
			OperationRecord(
				ServicePlatform.BUPTLE_BIZ, schemaName, OperationCategory.CONTRACT, sub, type, contractId, contractName,
				if (before == null) null else keys.associateWith { b[it] }, keys.associateWith { a[it] },
				audit.ticket.trim(), audit.requester.trim(), audit.reason.trim(),
			),
		)
	}

	/** BuptleManager 에 등록된 Biz 고객사인지 확인한다. 아니면 404 */
	private fun requireBizCompany(schemaName: String) =
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")

	@Operation(summary = "계약 검색", description = "계약 ID 또는 계약명 검색. 최근 작업한 계약은 GET /recent 로 따로 조회한다.")
	@GetMapping
	fun search(
		@PathVariable schemaName: String,
		@Parameter(description = "계약 ID 또는 계약명 부분 일치") @RequestParam(required = false) q: String?,
		@Parameter(description = "삭제된 계약 포함") @RequestParam(defaultValue = "false") includeDeleted: Boolean,
		@RequestParam(defaultValue = "1") @Min(1) page: Int,
		@RequestParam(defaultValue = "10") @Min(1) @Max(100) size: Int,
	): PageResponse<ContractSummaryResponse> {
		requireBizCompany(schemaName)
		return reader.search(schemaName, q, includeDeleted, page, size)
	}

	@Operation(
		summary = "계약 기본 정보",
		description = "계약 정보, 템플릿/카테고리, 최근 히스토리 3묶음. 조회하면 서버가 '최근 조회한 계약'에도 기록한다.",
	)
	@GetMapping("/{id}")
	fun detail(@PathVariable schemaName: String, @PathVariable id: String): ContractDetailResponse {
		requireBizCompany(schemaName)
		return reader.detail(schemaName, id) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")
	}

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
	): ChangeResponse<ContractInfoResponse> {
		requireBizCompany(schemaName)
		val before = reader.detail(schemaName, id) ?: notFoundContract()
		val changed = writer.updateBasic(schemaName, id, request) ?: notFoundContract()
		val after = reader.detail(schemaName, id) ?: notFoundContract()
		val logId = log(schemaName, OperationSubCategory.CONTRACT_BASIC, OperationType.UPDATE, before.contract.id, before.contract.name, before.contract, after.contract, request.audit)
		return ChangeResponse(after.contract, changed, listOf(logId))
	}

	@Operation(summary = "계약 참여 유저 정보", description = "참여일 오름차순.")
	@GetMapping("/{id}/members")
	fun members(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Parameter(description = "삭제된 유저 포함") @RequestParam(defaultValue = "true") includeDeleted: Boolean,
	): ListResponse<ContractMemberResponse> {
		requireBizCompany(schemaName)
		val items = memberReader.members(schemaName, id, includeDeleted) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")
		return ListResponse(items, items.size.toLong())
	}

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
	): CreatedResponse<ContractMemberResponse> {
		requireBizCompany(schemaName)
		val contract = reader.detail(schemaName, id) ?: notFoundContract()
		val memberId = writer.addMember(schemaName, id, request) ?: notFoundContract()
		val member = memberReader.members(schemaName, id, true)?.firstOrNull { it.id == memberId } ?: notFoundContract()
		val logId = log(schemaName, OperationSubCategory.CONTRACT_MEMBER, OperationType.ADD, contract.contract.id, contract.contract.name, null, member, request.audit)
		return CreatedResponse(member, listOf(logId))
	}

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
	): ChangeResponse<ContractMemberResponse> {
		requireBizCompany(schemaName)
		val contract = reader.detail(schemaName, id) ?: notFoundContract()
		val before = memberReader.members(schemaName, id, true)?.firstOrNull { it.id == memberId } ?: notFoundContract()
		val changed = writer.updateMember(schemaName, id, memberId, request) ?: notFoundContract()
		val after = memberReader.members(schemaName, id, true)?.firstOrNull { it.id == memberId } ?: notFoundContract()
		val logId = log(schemaName, OperationSubCategory.CONTRACT_MEMBER, OperationType.UPDATE, contract.contract.id, contract.contract.name, before, after, request.audit)
		return ChangeResponse(after, changed, listOf(logId))
	}

	@Operation(summary = "계약 workflow 정보")
	@GetMapping("/{id}/workflow")
	fun workflow(@PathVariable schemaName: String, @PathVariable id: String): WorkflowResponse {
		requireBizCompany(schemaName)
		return workflowReader.workflow(schemaName, id) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")
	}

	@Operation(summary = "계약 workflow 수정", description = "name, rev 는 수정 불가.")
	@PatchMapping("/{id}/workflow")
	fun updateWorkflow(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Valid @RequestBody request: WorkflowUpdateRequest,
	): WorkflowChangeResponse {
		requireBizCompany(schemaName)
		val contract = reader.detail(schemaName, id) ?: notFoundContract()
		val before = workflowReader.workflow(schemaName, id) ?: notFoundContract()
		val changed = writer.updateWorkflow(schemaName, id, request) ?: notFoundContract()
		val after = workflowReader.workflow(schemaName, id) ?: notFoundContract()
		val logId = log(schemaName, OperationSubCategory.CONTRACT_WORKFLOW_HISTORY_EMAIL, OperationType.UPDATE, contract.contract.id, contract.contract.name, before.attrs.associate { it.key to it.value }, after.attrs.associate { it.key to it.value }, request.audit)
		return WorkflowChangeResponse(after, changed, listOf(logId))
	}

	@Operation(summary = "계약 히스토리 정보", description = "액션 일시 오름차순.")
	@GetMapping("/{id}/history")
	fun history(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@Parameter(description = "삭제된 이력 포함") @RequestParam(defaultValue = "true") includeDeleted: Boolean,
		@Parameter(description = "true 면 docId 가 있는 이력만") @RequestParam(defaultValue = "false") docOnly: Boolean,
		@Parameter(description = "액션 유저 이름 일치") @RequestParam(required = false) user: String?,
		@Parameter(description = "액션 이름 일치") @RequestParam(required = false) action: String?,
	): ContractHistoryListResponse {
		requireBizCompany(schemaName)
		return historyReader.history(schemaName, id, includeDeleted, docOnly, user, action) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")
	}

	@Operation(summary = "계약 히스토리 수정", description = "수정 불가: 액션 타입, 단계 이동(from, to). deleted=true 면 삭제 일시를 서버가 기록한다.")
	@PatchMapping("/{id}/history/{historyId}")
	fun updateHistory(
		@PathVariable schemaName: String,
		@PathVariable id: String,
		@PathVariable historyId: String,
		@Valid @RequestBody request: ContractHistoryUpdateRequest,
	): ChangeResponse<ContractHistoryResponse> {
		requireBizCompany(schemaName)
		val contract = reader.detail(schemaName, id) ?: notFoundContract()
		fun find() = historyReader.history(schemaName, id, true, false, null, null)?.items?.firstOrNull { it.id == historyId } ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "히스토리를 찾을 수 없습니다.")
		val before = find()
		val changed = writer.updateHistory(schemaName, id, historyId, request) ?: notFoundContract()
		val after = find()
		val logId = log(schemaName, OperationSubCategory.CONTRACT_WORKFLOW_HISTORY_EMAIL, OperationType.UPDATE, contract.contract.id, contract.contract.name, before, after, request.audit)
		return ChangeResponse(after, changed, listOf(logId))
	}

	@Operation(summary = "계약 이메일 정보", description = "최신순(생성 일시 내림차순).")
	@GetMapping("/{id}/emails")
	fun emails(@PathVariable schemaName: String, @PathVariable id: String): ListResponse<ContractEmailResponse> {
		val company = requireBizCompany(schemaName)
		val items = historyReader.emails(schemaName, id, company.name) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "계약을 찾을 수 없습니다.")
		return ListResponse(items, items.size.toLong())
	}
}
