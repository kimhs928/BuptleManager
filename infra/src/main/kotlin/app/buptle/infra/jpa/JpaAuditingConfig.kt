package app.buptle.infra.jpa

import java.time.Clock
import java.util.Optional
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.data.auditing.DateTimeProvider
import org.springframework.data.jpa.repository.config.EnableJpaAuditing

@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "auditingDateTimeProvider")
class JpaAuditingConfig {

	/** 테스트에서 시간을 고정할 수 있도록 Clock 을 사용한다. */
	@Bean
	fun auditingDateTimeProvider(clock: Clock) = DateTimeProvider { Optional.of(clock.instant()) }
}
