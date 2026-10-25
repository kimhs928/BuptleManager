package app.buptle.config

import org.slf4j.LoggerFactory
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

	private val log = LoggerFactory.getLogger(javaClass)

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

	/**
	 * 로그인 구현 전 개발용: local 프로파일에서는 인증 없이 모든 요청을 허용한다. (CSRF 도 끈다)
	 * prod 프로파일에서는 이 체인이 만들어지지 않아 위의 기본 규칙(인증 필요)이 적용된다.
	 * TODO: 로그인 구현 시 제거
	 */
	@Bean
	@Order(0)
	@Profile("local")
	fun localOpenFilterChain(http: HttpSecurity): SecurityFilterChain {
		log.warn("local 프로파일: 인증 없이 모든 요청을 허용합니다. (로그인 구현 전 개발용)")
		http
			.securityMatcher("/**")
			.authorizeHttpRequests { it.anyRequest().permitAll() }
			.csrf { it.disable() }
		return http.build()
	}
}
