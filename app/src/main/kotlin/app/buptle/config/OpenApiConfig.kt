package app.buptle.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import org.springdoc.core.models.GroupedOpenApi
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 *  Biz 와 Nova를 구별한다. API 문서를 Biz 와 Nova별로 구별한다.
 */
@Configuration
class OpenApiConfig {
	@Bean
	fun openApi(): OpenAPI = OpenAPI().info(Info().title("BuptleManager API").version("v1"))

	@Bean
	fun commonApi(): GroupedOpenApi = GroupedOpenApi.builder()
		.group("1-common")
		.displayName("공통")
		.pathsToMatch("/api/**")
		.pathsToExclude("/api/biz/**", "/api/nova/**")
		.build()

	@Bean
	fun bizApi(): GroupedOpenApi = GroupedOpenApi.builder()
		.group("2-biz")
		.displayName("Buptle Biz")
		.pathsToMatch("/api/biz/**")
		.build()

	@Bean
	fun novaApi(): GroupedOpenApi = GroupedOpenApi.builder()
		.group("3-nova")
		.displayName("Buptle Nova")
		.pathsToMatch("/api/nova/**")
		.build()
}
