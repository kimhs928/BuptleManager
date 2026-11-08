package app.buptle.enums

import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import app.buptle.operation.enums.EnumCatalogRepository
import app.buptle.operation.enums.EnumGroup
import app.buptle.operation.enums.EnumSet
import app.buptle.operation.enums.EnumSetDetail
import app.buptle.operation.enums.EnumValue
import app.buptle.operation.enums.EnumValueCreate
import app.buptle.operation.enums.EnumValueUpdate
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

@Tag(name = "관리자")
@RestController
@RequestMapping("/api/enums")
class EnumController(
	private val enums: EnumCatalogRepository,
) {

	@Operation(summary = "enum 표 목록", description = "드롭다운 선택지로 쓰는 enum 표(계약 상태, 참여자 역할 등) 목록.")
	@GetMapping
	fun sets(): List<EnumSet> = enums.findSets()

	@Operation(summary = "enum 표 상세", description = "표의 분류(그룹)와 값 목록. 비활성 값도 포함한다.")
	@GetMapping("/{setCode}")
	fun detail(@PathVariable setCode: String): EnumSetDetail = enums.findDetail(setCode) ?: notFound()

	@Operation(summary = "enum 값 수정", description = "표시 이름·설명·분류·순서·사용 여부를 바꾼다. 실제 값(code)은 Biz DB 와 맞물려 있어 바꿀 수 없다.")
	@PatchMapping("/{setCode}/values/{valueId}")
	fun updateValue(@PathVariable setCode: String, @PathVariable valueId: Long, @Valid @RequestBody body: UpdateValueRequest): EnumValue =
		enums.updateValue(setCode, valueId, EnumValueUpdate(body.label.trim(), body.remark?.trim()?.ifEmpty { null }, body.groupCode, body.sortOrder, body.active))
			?: notFound()

	@Operation(summary = "enum 값 추가")
	@PostMapping("/{setCode}/values")
	@ResponseStatus(HttpStatus.CREATED)
	fun createValue(@PathVariable setCode: String, @Valid @RequestBody body: CreateValueRequest): EnumValue {
		enums.findDetail(setCode) ?: notFound()
		return enums.createValue(
			setCode,
			EnumValueCreate(body.code.trim(), body.constName?.trim()?.ifEmpty { null }, body.label.trim(), body.remark?.trim()?.ifEmpty { null }, body.groupCode, body.sortOrder),
		) ?: throw BusinessException(CommonErrorCode.CONFLICT, "이미 같은 실제 값이 있습니다.")
	}

	@Operation(summary = "enum 분류 이름 수정")
	@PatchMapping("/{setCode}/groups/{groupCode}")
	fun renameGroup(@PathVariable setCode: String, @PathVariable groupCode: String, @Valid @RequestBody body: RenameGroupRequest): EnumGroup =
		enums.renameGroup(setCode, groupCode, body.name.trim()) ?: notFound()

	private fun notFound(): Nothing = throw BusinessException(CommonErrorCode.NOT_FOUND)
}

data class UpdateValueRequest(
	@field:NotBlank @field:Size(max = 200)
	@Schema(description = "화면에 보이는 이름", example = "계약 초안 중")
	val label: String,
	@Schema(description = "설명·메모")
	val remark: String? = null,
	@Schema(description = "분류 코드. 없으면 분류 없음", example = "CONT_GRP_STS_DRAFT")
	val groupCode: String? = null,
	@Schema(description = "표시 순서", example = "10")
	val sortOrder: Int = 0,
	@Schema(description = "false 면 드롭다운에서 숨긴다")
	val active: Boolean = true,
)

data class CreateValueRequest(
	@field:NotBlank @field:Size(max = 60)
	@Schema(description = "Biz DB 에 저장되는 실제 값", example = "10")
	val code: String,
	@field:Size(max = 120)
	val constName: String? = null,
	@field:NotBlank @field:Size(max = 200)
	val label: String,
	val remark: String? = null,
	val groupCode: String? = null,
	val sortOrder: Int? = null,
)

data class RenameGroupRequest(
	@field:NotBlank @field:Size(max = 100)
	val name: String,
)
