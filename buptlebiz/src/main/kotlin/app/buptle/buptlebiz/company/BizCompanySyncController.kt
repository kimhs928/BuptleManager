package app.buptle.buptlebiz.company

import app.buptle.company.domain.CompanySyncResult
import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.ApplicationArguments
import org.springframework.boot.ApplicationRunner
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

/** Biz 고객사 동기화를 수동으로 실행한다. */
@Tag(name = "고객사 > Biz 연동")
@RestController
@RequestMapping("/api/biz/companies")
class BizCompanySyncController(
	private val service: BizCompanySyncService,
) {

	@Operation(
		summary = "Biz 고객사 동기화",
		description = "실제 Biz DB 의 고객사를 읽어 BuptleManager 고객사 목록에 반영한다. 없던 고객사는 만들고, 있던 고객사는 값을 고치고, Biz 에 없는 Biz 고객사는 비활성으로 바꾼다(삭제하지 않는다).",
	)
	@PostMapping("/sync")
	fun sync(): CompanySyncResult = service.sync() ?: throw BusinessException(CommonErrorCode.INTERNAL_ERROR, "Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")
}

/** 서버를 켤 때 한 번 동기화한다. Biz DB 가 없거나 실패해도 서버는 그대로 뜬다. 끄려면 buptle.biz.company-sync-on-startup=false */
@Component
@Order(2)
class BizCompanySyncRunner(
	private val service: BizCompanySyncService,
	@Value("\${buptle.biz.company-sync-on-startup:true}") private val enabled: Boolean,
) : ApplicationRunner {

	private val log = LoggerFactory.getLogger(javaClass)

	override fun run(args: ApplicationArguments) {
		if (!enabled) return
		try {
			service.sync()
		} catch (e: Exception) {
			log.warn("시작 시 Biz 고객사 동기화에 실패했습니다: {}", e.message)
		}
	}
}
