package app.buptle.config

import java.time.Clock
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ClockConfig {
	/** 시간 의존 코드를 테스트할 수 있도록 Clock 을 주입해서 쓴다. */
	@Bean
	fun clock(): Clock = Clock.systemUTC()
}
