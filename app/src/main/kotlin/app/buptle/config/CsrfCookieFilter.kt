package app.buptle.config

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.web.filter.OncePerRequestFilter

/** CSRF 토큰을 쿠키(XSRF-TOKEN)로 내려보내도록 매 요청에서 토큰을 한 번 읽는다. */
class CsrfCookieFilter : OncePerRequestFilter() {

	override fun doFilterInternal(request: HttpServletRequest, response: HttpServletResponse, filterChain: FilterChain) {
		(request.getAttribute(CsrfToken::class.java.name) as? CsrfToken)?.token
		filterChain.doFilter(request, response)
	}
}
