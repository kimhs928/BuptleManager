package app.buptle.operation.log

/** 작업 대상 세부 영역 (category2). 반드시 한 영역([parent], category1)에 속한다 */
enum class OperationSubCategory(val parent: OperationCategory, val label: String) {
	COMPANY_BASIC(OperationCategory.COMPANY, "기본 정보"),
	COMPANY_CONFIG(OperationCategory.COMPANY, "컨피그"),
	COMPANY_LIVE_USER(OperationCategory.COMPANY, "실시간 접속 유저"),

	CONTRACT_BASIC(OperationCategory.CONTRACT, "기본 정보"),
	CONTRACT_MEMBER(OperationCategory.CONTRACT, "참여 유저"),
	CONTRACT_WORKFLOW_HISTORY_EMAIL(OperationCategory.CONTRACT, "워크플로우·히스토리·이메일 발송 내역"),

	COUNSEL_BASIC(OperationCategory.COUNSEL, "기본 정보"),
	COUNSEL_MEMBER(OperationCategory.COUNSEL, "참여 유저"),
	COUNSEL_PROCESS_HISTORY_EMAIL(OperationCategory.COUNSEL, "프로세스·히스토리·이메일 내역"),
	COUNSEL_COMMENT(OperationCategory.COUNSEL, "코멘트"),

	LAWSUIT_BASIC(OperationCategory.LAWSUIT, "기본 정보"),
	LAWSUIT_MEMBER(OperationCategory.LAWSUIT, "참여 유저"),
	LAWSUIT_HISTORY_EMAIL(OperationCategory.LAWSUIT, "히스토리·이메일 발송 내역"),

	/** 유저 정보 수정 (목록에 없던 항목. 유저 수정 저장용) */
	USER_INFO(OperationCategory.USER, "유저 정보"),
	USER_EXPORT(OperationCategory.USER, "유저 추출"),
	USER_TRANSFER_CONTRACT(OperationCategory.USER, "계약 이관"),
	USER_TRANSFER_COUNSEL(OperationCategory.USER, "자문 이관"),
	USER_TRANSFER_LAWSUIT(OperationCategory.USER, "소송 이관"),

	ERROR_REPORT_CONTRACT(OperationCategory.ERROR_REPORT, "계약 오류 리포트 추출"),
	ERROR_REPORT_COUNSEL(OperationCategory.ERROR_REPORT, "자문 오류 리포트 추출"),
}
