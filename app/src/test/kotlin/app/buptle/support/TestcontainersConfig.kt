package app.buptle.support

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.postgresql.PostgreSQLContainer

/** 운영과 같은 버전의 PostgreSQL 을 컨테이너로 띄워 데이터소스로 연결한다. */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfig {

	@Bean
	@ServiceConnection
	fun postgres(): PostgreSQLContainer = PostgreSQLContainer("postgres:17.10-alpine")
}
