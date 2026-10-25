package app.buptle.config

import app.buptle.support.TestcontainersConfig
import kotlin.test.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post

/** 로그인 구현 전까지 local 프로파일은 인증 없이 API 를 호출할 수 있어야 한다. */
@SpringBootTest
@ActiveProfiles("test", "local")
@Import(TestcontainersConfig::class)
@AutoConfigureMockMvc
class LocalOpenSecurityTest(@Autowired private val mockMvc: MockMvc) {

	@Test
	fun `인증 없이 API 에 접근할 수 있다 (없는 경로는 401 이 아니라 404)`() {
		mockMvc.get("/api/anything").andExpect { status { isNotFound() } }
	}

	@Test
	fun `CSRF 토큰 없이도 변경 요청을 보낼 수 있다`() {
		mockMvc.post("/api/anything").andExpect { status { isNotFound() } }
	}

	@Test
	fun `API 문서를 볼 수 있다`() {
		mockMvc.get("/v3/api-docs").andExpect { status { isOk() } }
	}
}
