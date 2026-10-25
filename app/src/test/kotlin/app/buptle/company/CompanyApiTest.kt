package app.buptle.company

import app.buptle.company.domain.ServicePlatform
import app.buptle.infra.company.CompanyEntity
import app.buptle.support.IntegrationTest
import jakarta.persistence.EntityManager
import java.time.Instant
import kotlin.test.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.get
import org.springframework.transaction.annotation.Transactional

@IntegrationTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser
class CompanyApiTest(
	@Autowired private val mockMvc: MockMvc,
	@Autowired private val em: EntityManager,
) {

	private fun company(schema: String, name: String, platform: ServicePlatform = ServicePlatform.BUPTLE_BIZ, users: Int = 10) =
		CompanyEntity(schema, "$schema.buptle.app", name, platform).also {
			it.currentUserCount = users
			em.persist(it)
		}

	private fun givenCompanies() {
		company("acetech", "에이스테크놀로지(주)", users = 128).apply {
			ceoName = "김민수"
			businessNumber = "123-45-67890"
			telephoneNumber = "02-1234-5678"
			address = "서울특별시 강남구"
			userLimit = 200
			sourceCreatedAt = Instant.parse("2024-03-15T00:00:00Z")
		}
		company("hanil_ind", "한일산업")
		company("nova_greenbio", "그린바이오", ServicePlatform.BUPTLE_NOVA)
		em.flush()
	}

	@Test
	fun `전체 목록은 고객사명 순으로 나온다`() {
		givenCompanies()

		mockMvc.get("/api/companies").andExpect {
			status { isOk() }
			jsonPath("$.length()") { value(3) }
			jsonPath("$[0].name") { value("그린바이오") }
			jsonPath("$[1].name") { value("에이스테크놀로지(주)") }
			jsonPath("$[2].name") { value("한일산업") }
		}
	}

	@Test
	fun `목록 항목에는 화면에 필요한 값만 담긴다`() {
		givenCompanies()

		mockMvc.get("/api/companies") { param("q", "acetech") }.andExpect {
			jsonPath("$[0].schemaName") { value("acetech") }
			jsonPath("$[0].domain") { value("acetech.buptle.app") }
			jsonPath("$[0].platform") { value("BUPTLE_BIZ") }
			jsonPath("$[0].userCount") { value(128) }
			jsonPath("$[0].active") { value(true) }
			jsonPath("$[0].address") { doesNotExist() }
		}
	}

	@Test
	fun `서비스 구분으로 거를 수 있다`() {
		givenCompanies()

		mockMvc.get("/api/companies") { param("platform", "BUPTLE_NOVA") }.andExpect {
			jsonPath("$.length()") { value(1) }
			jsonPath("$[0].schemaName") { value("nova_greenbio") }
		}
	}

	@Test
	fun `스키마명이나 고객사명 일부로 대소문자 구분 없이 검색한다`() {
		givenCompanies()

		mockMvc.get("/api/companies") { param("q", "ACE") }.andExpect { jsonPath("$[0].schemaName") { value("acetech") } }
		mockMvc.get("/api/companies") { param("q", "한일") }.andExpect { jsonPath("$[0].schemaName") { value("hanil_ind") } }
		mockMvc.get("/api/companies") { param("q", "없는고객사") }.andExpect { jsonPath("$.length()") { value(0) } }
	}

	@Test
	fun `검색어의 와일드카드 문자는 그대로 찾는다`() {
		givenCompanies()

		// '_' 를 문자 그대로 찾는다. 와일드카드(임의 한 글자)로 해석되면 "a_i" 가 "ani"(hanil_ind)에 걸려 1건이 나온다.
		mockMvc.get("/api/companies") { param("q", "l_i") }.andExpect {
			jsonPath("$.length()") { value(1) }
			jsonPath("$[0].schemaName") { value("hanil_ind") }
		}
		mockMvc.get("/api/companies") { param("q", "a_i") }.andExpect { jsonPath("$.length()") { value(0) } }
		mockMvc.get("/api/companies") { param("q", "%") }.andExpect { jsonPath("$.length()") { value(0) } }
	}

	@Test
	fun `limit 로 결과 수를 줄일 수 있다`() {
		givenCompanies()

		mockMvc.get("/api/companies") { param("limit", "2") }.andExpect { jsonPath("$.length()") { value(2) } }
	}

	@Test
	fun `limit 범위를 벗어나면 400 이다`() {
		mockMvc.get("/api/companies") { param("limit", "0") }.andExpect {
			status { isBadRequest() }
			jsonPath("$.code") { value("INVALID_REQUEST") }
		}
		mockMvc.get("/api/companies") { param("limit", "201") }.andExpect { status { isBadRequest() } }
	}

	@Test
	fun `서비스 구분 값이 잘못되면 400 이다`() {
		mockMvc.get("/api/companies") { param("platform", "UNKNOWN") }.andExpect {
			status { isBadRequest() }
			jsonPath("$.code") { value("INVALID_REQUEST") }
		}
	}

	@Test
	fun `스키마명으로 기본 정보를 조회한다`() {
		givenCompanies()

		mockMvc.get("/api/companies/acetech").andExpect {
			status { isOk() }
			jsonPath("$.name") { value("에이스테크놀로지(주)") }
			jsonPath("$.platform") { value("BUPTLE_BIZ") }
			jsonPath("$.representative") { value("김민수") }
			jsonPath("$.businessNumber") { value("123-45-67890") }
			jsonPath("$.telephoneNumber") { value("02-1234-5678") }
			jsonPath("$.address") { value("서울특별시 강남구") }
			jsonPath("$.userCount") { value(128) }
			jsonPath("$.userLimit") { value(200) }
			jsonPath("$.createdAt") { value("2024-03-15T00:00:00Z") }
		}
	}

	@Test
	fun `없는 고객사는 404 이다`() {
		mockMvc.get("/api/companies/none").andExpect {
			status { isNotFound() }
			jsonPath("$.code") { value("NOT_FOUND") }
			jsonPath("$.detail") { value("고객사를 찾을 수 없습니다.") }
		}
	}
}
