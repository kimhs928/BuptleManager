package app.buptle.config

import app.buptle.support.IntegrationTest
import kotlin.test.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

@IntegrationTest
@AutoConfigureMockMvc
class SecurityConfigTest(@Autowired private val mockMvc: MockMvc) {

	@Test
	fun `헬스체크는 로그인 없이 접근할 수 있다`() {
		mockMvc.get("/actuator/health").andExpect { status { isOk() } }
	}

	@Test
	fun `그 외 API 는 로그인이 필요하다`() {
		mockMvc.get("/api/anything").andExpect { status { isUnauthorized() } }
	}

	@Test
	fun `CSRF 토큰 없는 변경 요청은 거부된다`() {
		mockMvc.post("/api/anything").andExpect { status { isForbidden() } }
	}

	@Test
	fun `test 프로파일에서는 API 문서가 노출되지 않는다`() {
		mockMvc.get("/v3/api-docs").andExpect { status { isUnauthorized() } }
	}

	@Test
	fun `Actuator 는 헬스체크 외 엔드포인트를 노출하지 않는다`() {
		mockMvc.get("/actuator/env").andExpect { status { isUnauthorized() } }
	}
}
