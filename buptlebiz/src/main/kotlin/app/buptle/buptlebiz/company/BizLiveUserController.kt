package app.buptle.buptlebiz.company

import app.buptle.company.domain.CompanyRepository
import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.notImplemented
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
) {

	@Operation(summary = "실시간 접속 유저")
	@GetMapping("/live-users")
	fun liveUsers(@PathVariable schemaName: String): LiveUsersResponse {
		companies.findBySchemaName(schemaName)?.takeIf { it.platform == ServicePlatform.BUPTLE_BIZ }
			?: throw BusinessException(CommonErrorCode.NOT_FOUND, "고객사를 찾을 수 없습니다.")
		return reader.liveUsers(schemaName)
	}

	@Operation(summary = "강제 로그아웃", description = "선택한 유저의 세션을 끊고 처리 내역에 기록한다.")
	@PostMapping("/live-users/force-logout")
	fun forceLogout(@PathVariable schemaName: String, @Valid @RequestBody request: ForceLogoutRequest): ForceLogoutResponse = notImplemented()
}
