package app.buptle.company

import app.buptle.company.domain.ServicePlatform
import app.buptle.core.api.ListResponse
import app.buptle.core.api.notImplemented
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import java.time.Instant
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController

// ───────────── 03. 메인 페이지 ─────────────

data class RecentCompanyResponse(
	@Schema(description = "스키마명", example = "acetech")
	val schemaName: String,
	@Schema(description = "서비스 구분")
	val platform: ServicePlatform,
)

data class RecentCompanyRequest(
	@field:NotBlank
	@Schema(description = "스키마명", example = "acetech")
	val schemaName: String,
	@Schema(description = "서비스 구분")
	val platform: ServicePlatform,
)

data class ConfigMismatchResponse(
	val platform: ServicePlatform,
	@Schema(description = "미등록 컨피그 수. 0이면 화면 알림을 숨긴다", example = "3")
	val count: Int,
	@Schema(description = "마지막 배치 실행 시각")
	val lastBatchAt: Instant?,
)

@Tag(name = "03. 메인")
@RestController
@RequestMapping("/api")
class MainStubController {

	@Operation(summary = "최근 검색한 고객사", description = "현재 로그인한 작업자 기준 최신순.")
	@GetMapping("/companies/recent")
	fun recent(): ListResponse<RecentCompanyResponse> = notImplemented()

	@Operation(summary = "최근 검색에 기록", description = "고객사의 '이동'을 눌렀을 때 호출한다. 같은 고객사는 최신 시각으로 갱신한다.")
	@PostMapping("/companies/recent")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	fun record(@Valid @RequestBody request: RecentCompanyRequest): Unit = notImplemented()

	@Operation(summary = "컨피그 불일치 알림", description = "마지막 컨피그 동기화 배치에서 찾은 미등록 컨피그 수.")
	@GetMapping("/config-mismatch")
	fun configMismatch(@RequestParam platform: ServicePlatform): ConfigMismatchResponse = notImplemented()
}
