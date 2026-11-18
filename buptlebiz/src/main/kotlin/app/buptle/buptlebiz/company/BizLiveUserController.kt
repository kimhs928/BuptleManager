package app.buptle.buptlebiz.company

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.operation.log.OperationCategory
import app.buptle.operation.log.OperationLogRecorder
import app.buptle.operation.log.OperationRecord
import app.buptle.operation.log.OperationSubCategory
import app.buptle.operation.log.OperationType
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** Biz 고객사의 실시간 접속 유저. Biz 쪽 세션을 읽고 끊어야 해서 buptlebiz 가 가진다. */
@Tag(name = "특정 고객사 > 고객사 정보")
@RestController
@RequestMapping("/api/biz/companies/{schemaName}")
class BizLiveUserController(
	private val companies: CompanyRepository,
	private val reader: BizLiveUserReader,
	private val writer: BizLiveUserWriter,
	private val recorder: OperationLogRecorder,
) {

	@Operation(summary = "실시간 접속 유저")
	@GetMapping("/live-users")
	fun liveUsers(@PathVariable schemaName: String): LiveUsersResponse {
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")
		return reader.liveUsers(schemaName)
	}

	@Operation(
		summary = "강제 로그아웃",
		description = "선택한 세션의 login_info.active 를 false 로 바꿔 세션을 끊고 작업 이력에 남긴다. 이미 끝난 세션은 건너뛰고, 끊을 세션이 하나도 없으면 409.",
	)
	@PostMapping("/live-users/force-logout")
	fun forceLogout(@PathVariable schemaName: String, @Valid @RequestBody request: ForceLogoutRequest): ForceLogoutResponse {
		val company = companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")
		val ended = writer.forceLogout(schemaName, request.sessionIds)
		if (ended.isEmpty()) throw BusinessException(CommonErrorCode.CONFLICT, "이미 종료되었거나 없는 세션입니다. 목록을 새로 고쳐 주세요.")
		val labels = ended.map { "${it.name.ifBlank { it.email }} (${it.email})" }
		val logId = recorder.record(
			OperationRecord(
				ServicePlatform.BUPTLE_BIZ, schemaName, OperationCategory.COMPANY, OperationSubCategory.COMPANY_LIVE_USER, OperationType.FORCE_LOGOUT,
				schemaName, company.name,
				labels.associateWith { "접속 중" }, labels.associateWith { "로그아웃" },
				request.audit.ticket.trim(), request.audit.requester.trim(), request.audit.reason.trim(),
			),
		)
		return ForceLogoutResponse(ended.map { LoggedOutUser("u${it.loginInfoId}", it.name) }, listOf(logId))
	}
}
