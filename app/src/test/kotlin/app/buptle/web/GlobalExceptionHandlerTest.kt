package app.buptle.web

import app.buptle.core.error.BusinessException
import app.buptle.core.error.CommonErrorCode
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.MediaType
import org.springframework.security.access.AccessDeniedException
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.test.web.servlet.post
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import kotlin.test.Test

class GlobalExceptionHandlerTest {

	data class CreateRequest(@field:NotBlank(message = "이름은 필수입니다.") val name: String?)

	@RestController
	class SampleController {
		@GetMapping("/business")
		fun business(): Nothing = throw BusinessException(CommonErrorCode.CONFLICT, "이미 등록된 이메일입니다.")

		@GetMapping("/denied")
		fun denied(): Nothing = throw AccessDeniedException("denied")

		@GetMapping("/boom")
		fun boom(): Nothing = throw IllegalStateException("내부 정보: db password=secret")

		@PostMapping("/validate")
		fun validate(@Valid @RequestBody request: CreateRequest) = request
	}

	private val mockMvc: MockMvc = MockMvcBuilders.standaloneSetup(SampleController())
		.setControllerAdvice(GlobalExceptionHandler())
		.setValidator(LocalValidatorFactoryBean().apply { afterPropertiesSet() })
		.build()

	@Test
	fun `업무 오류는 오류 코드와 메시지로 응답한다`() {
		mockMvc.get("/business").andExpect {
			status { isConflict() }
			jsonPath("$.code") { value("CONFLICT") }
			jsonPath("$.detail") { value("이미 등록된 이메일입니다.") }
			jsonPath("$.status") { value(409) }
		}
	}

	@Test
	fun `권한 오류는 403 으로 응답한다`() {
		mockMvc.get("/denied").andExpect {
			status { isForbidden() }
			jsonPath("$.code") { value("FORBIDDEN") }
		}
	}

	@Test
	fun `예상하지 못한 오류는 내부 정보를 숨기고 500 으로 응답한다`() {
		mockMvc.get("/boom").andExpect {
			status { isInternalServerError() }
			jsonPath("$.code") { value("INTERNAL_ERROR") }
			jsonPath("$.detail") { value(CommonErrorCode.INTERNAL_ERROR.message) }
			content { string(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("secret"))) }
		}
	}

	@Test
	fun `검증 오류는 필드별 errors 를 포함한다`() {
		mockMvc.post("/validate") {
			contentType = MediaType.APPLICATION_JSON
			content = """{"name": ""}"""
		}.andExpect {
			status { isBadRequest() }
			jsonPath("$.code") { value("INVALID_REQUEST") }
			jsonPath("$.errors[0].field") { value("name") }
			jsonPath("$.errors[0].message") { value("이름은 필수입니다.") }
		}
	}

	@Test
	fun `프레임워크 오류에도 오류 코드가 붙는다`() {
		mockMvc.get("/validate").andExpect {
			status { isMethodNotAllowed() }
			jsonPath("$.code") { value("METHOD_NOT_ALLOWED") }
		}
	}

	@Test
	fun `본문을 읽을 수 없으면 400 으로 응답한다`() {
		mockMvc.post("/validate") {
			contentType = MediaType.APPLICATION_JSON
			content = "not-json"
		}.andExpect {
			status { isBadRequest() }
			jsonPath("$.code") { value("INVALID_REQUEST") }
		}
	}
}
