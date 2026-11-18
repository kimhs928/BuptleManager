package app.buptle.buptlebiz.user

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.AuditRequest
import app.buptle.core.api.ChangeResponse
import app.buptle.core.api.ListResponse
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationLogRecorder
import app.buptle.operation.log.OperationRecord
import app.buptle.operation.log.OperationSubCategory
import app.buptle.operation.log.OperationType
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import java.time.Instant
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import tools.jackson.databind.ObjectMapper

enum class DocKind { CONTRACT, COUNSEL, LAWSUIT }

data class UserDocCounts(
	@Schema(description = "참여 중인 계약 수") val contract: Int,
	@Schema(description = "참여 중인 자문 수") val counsel: Int,
	@Schema(description = "참여 중인 소송 수") val lawsuit: Int,
)

data class CompanyUserResponse(
	@Schema(description = "화면 행 ID", example = "u12") val id: String,
	@Schema(description = "유저 고유 키 (users_user.id)", example = "12") val pk: String,
	val name: String,
	val email: String,
	@Schema(description = "마지막 접속 시각. 접속한 적이 없으면 null") val lastLogin: Instant?,
	@Schema(description = "시스템 내 역할 이름 (enum BIZ_USER_SYSTEM_ROLE)") val roles: List<String>,
	@Schema(description = "활성화 유무. users_user.is_active 이고 프로필이 삭제되지 않았을 때 true") val active: Boolean,
	val joinedAt: Instant?,
	val createdAt: Instant?,
	val updatedAt: Instant?,
	val phone: String,
	val dept: String,
	@Schema(description = "직책 (main_userprofile.role_name)") val title: String,
	val desc: String,
	@Schema(description = "사번") val empNo: String,
	val migrated: Boolean,
	val docCounts: UserDocCounts,
)

@Schema(description = "바꿀 항목만 보낸다.")
data class UserUpdateRequest(
	val name: String? = null,
	val email: String? = null,
	val active: Boolean? = null,
	@Schema(description = "시스템 내 역할 이름 (enum BIZ_USER_SYSTEM_ROLE). 일반유저만 있으면 모든 역할 해제")
	val roles: List<String>? = null,
	val phone: String? = null,
	val dept: String? = null,
	val title: String? = null,
	val desc: String? = null,
	val empNo: String? = null,
	val joinedAt: Instant? = null,
	val createdAt: Instant? = null,
	val updatedAt: Instant? = null,
	@field:Valid
	val audit: AuditRequest,
)

data class UserDocumentResponse(
	@Schema(description = "문서 ID (view_code)") val id: String,
	val title: String,
)

/** Biz 고객사의 유저 조회. Biz DB 를 읽기만 한다. 수정과 이관은 아직 연결하지 않았다. */
@Tag(name = "특정 고객사 > 유저 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}/users")
class UserController(
	private val companies: CompanyRepository,
	private val reader: BizUserReader,
	private val writer: BizUserWriter,
	private val recorder: OperationLogRecorder,
	private val json: ObjectMapper,
) {

	private fun requireBizCompany(schemaName: String) =
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")

	@Operation(summary = "유저 목록", description = "고객사의 모든 유저와 참여 문서 수. 검색 조건은 화면에서 적용한다.")
	@GetMapping
	fun users(@PathVariable schemaName: String): ListResponse<CompanyUserResponse> {
		requireBizCompany(schemaName)
		val items = reader.users(schemaName)
		return ListResponse(items, items.size.toLong())
	}

	@Operation(summary = "유저가 참여 중인 문서", description = "계약·자문·소송 중 한 종류. 최신 생성순.")
	@GetMapping("/{pk}/documents")
	fun documents(
		@PathVariable schemaName: String,
		@PathVariable pk: Long,
		@Parameter(description = "문서 종류: contract, counsel, lawsuit", example = "contract") @RequestParam kind: String,
	): ListResponse<UserDocumentResponse> {
		requireBizCompany(schemaName)
		val docKind = DocKind.entries.firstOrNull { it.name.equals(kind, ignoreCase = true) } ?: throw BusinessException(CommonErrorCode.INVALID_REQUEST, "문서 종류는 contract, counsel, lawsuit 중 하나입니다.")
		val items = reader.documents(schemaName, pk, docKind) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "유저를 찾을 수 없습니다.")
		return ListResponse(items, items.size.toLong())
	}

	@Operation(summary = "유저 수정", description = "바꿀 항목만 보낸다. 사번과 이메일은 다른 유저와 겹치면 409. 수정 내용은 작업 이력에 남는다.")
	@PatchMapping("/{pk}")
	fun update(@PathVariable schemaName: String, @PathVariable pk: Long, @Valid @RequestBody request: UserUpdateRequest): ChangeResponse<CompanyUserResponse> {
		requireBizCompany(schemaName)
		fun find() = reader.users(schemaName).firstOrNull { it.pk == pk.toString() } ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "유저를 찾을 수 없습니다.")
		val before = find()
		val changed = writer.update(schemaName, pk, request) ?: throw BusinessException(CommonErrorCode.NOT_FOUND, "유저를 찾을 수 없습니다.")
		val after = find()
		val b = toMap(before)
		val a = toMap(after)
		val keys = a.keys.filter { b[it] != a[it] }
		val logId = recorder.record(
			OperationRecord(
				ServicePlatform.BUPTLE_BIZ, schemaName, OperationCategory.USER, OperationSubCategory.USER_INFO, OperationType.UPDATE, pk.toString(), after.name,
				keys.associateWith { b[it] }, keys.associateWith { a[it] }, request.audit.ticket.trim(), request.audit.requester.trim(), request.audit.reason.trim(),
			),
		)
		return ChangeResponse(after, changed, listOf(logId))
	}

	@Suppress("UNCHECKED_CAST")
	private fun toMap(o: Any): Map<String, Any?> = json.convertValue(o, Map::class.java) as Map<String, Any?>
}
