package app.buptle.operation.enums

/** 드롭다운 선택지 묶음 (예: 계약 상태, 참여자 역할) */
data class EnumSet(
	val code: String,
	val name: String,
	val description: String?,
	val valueCount: Int,
)

/** 값을 묶는 분류 (예: 계약 상태의 초안 / 검토 / 서명) */
data class EnumGroup(
	val code: String,
	val name: String,
	val sortOrder: Int,
)

data class EnumValue(
	val id: Long,
	/** Biz DB 에 저장된 실제 값 */
	val code: String,
	val constName: String?,
	val label: String,
	val remark: String?,
	val groupCode: String?,
	val sortOrder: Int,
	val active: Boolean,
	/** 이 값의 하위 선택지를 담은 표 코드. 없으면 null (예: 워크플로우 항목 -> 그 항목의 선택값 표). 수정 API 로는 바꾸지 않는다 */
	val childSetCode: String? = null,
)

data class EnumSetDetail(
	val set: EnumSet,
	val groups: List<EnumGroup>,
	val values: List<EnumValue>,
)

/** 수정 가능한 값 항목. 실제 값(code)과 상수명은 Biz DB 와 맞물려 있어 바꾸지 않는다. */
data class EnumValueUpdate(
	val label: String,
	val remark: String?,
	val groupCode: String?,
	val sortOrder: Int,
	val active: Boolean,
)

data class EnumValueCreate(
	val code: String,
	val constName: String?,
	val label: String,
	val remark: String?,
	val groupCode: String?,
	val sortOrder: Int?,
)

interface EnumCatalogRepository {
	fun findSets(): List<EnumSet>

	fun findDetail(setCode: String): EnumSetDetail?

	/** 없으면 null */
	fun updateValue(setCode: String, valueId: Long, update: EnumValueUpdate): EnumValue?

	/** 같은 실제 값이 이미 있으면 null */
	fun createValue(setCode: String, create: EnumValueCreate): EnumValue?

	fun renameGroup(setCode: String, groupCode: String, name: String): EnumGroup?
}
