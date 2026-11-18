package app.buptle.operation.log

import app.buptle.company.domain.ServicePlatform

/** 운영관리에서 한 수정 작업 1건 (감사 이력에 남길 내용) */
data class OperationRecord(
	val platform: ServicePlatform,
	val schemaName: String,
	val category1: OperationCategory,
	val category2: OperationSubCategory,
	val type: OperationType,
	/** 대상 ID (계약 ID 등) */
	val targetId: String,
	/** 작업 당시 대상 이름 (최근 작업 목록에 쓴다) */
	val targetName: String?,
	val before: Map<String, Any?>?,
	val after: Map<String, Any?>?,
	val ticket: String,
	val requester: String,
	val reason: String,
) {
	init {
		require(category2.parent == category1) { "category2 $category2 는 category1 $category1 에 속하지 않습니다." }
	}
}

/** 수정·추가 작업을 작업 이력(BuptleManager DB)에 남긴다. 작업자는 현재 로그인한 작업 유저다. */
interface OperationLogRecorder {
	/** 남긴 작업 이력의 ID */
	fun record(record: OperationRecord): Long
}
