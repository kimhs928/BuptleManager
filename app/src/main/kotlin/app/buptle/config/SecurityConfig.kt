package app.buptle.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.core.annotation.Order
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.HttpStatusEntryPoint
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter
import org.springframework.security.web.csrf.CookieCsrfTokenRepository
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler

/**
 * 기본 보안 골격: 헬스체크만 공개하고 나머지는 인증 필요, 미인증은 401.
 * 로그인 방식(formLogin / oauth2Login)은 인증 구현 시 이 체인에 추가한다.
 */
@Configuration
@EnableWebSecurity
class SecurityConfig {

	@Bean
	fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
		http
			.authorizeHttpRequests {
				it.requestMatchers("/actuator/health", "/actuator/health/**").permitAll()
				it.anyRequest().authenticated()
			}
			.exceptionHandling { it.authenticationEntryPoint(HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) }
			.csrf {
				it.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
				it.csrfTokenRequestHandler(CsrfTokenRequestAttributeHandler())
			}
			.addFilterAfter(CsrfCookieFilter(), BasicAuthenticationFilter::class.java)
		return http.build()
	}

	/** API 문서는 local 프로파일에서만 공개 */
	@Bean
	@Order(0)
	@Profile("local")
	fun apiDocsFilterChain(http: HttpSecurity): SecurityFilterChain {
		http
			.securityMatcher("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**")
			.authorizeHttpRequests { it.anyRequest().permitAll() }
			.csrf { it.disable() }
		return http.build()
	}
}
