package app.buptle.buptlebiz.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Primary

/**
 * BIZ_DB_URL 이 있을 때만 Biz DB 에 연결한다. 없으면 이 빈이 생기지 않아 앱은 BuptleManager DB 만으로 뜬다.
 * 접속 정보는 환경변수나 .env 로만 넣고 저장소에는 올리지 않는다.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnExpression("!'\${BIZ_DB_URL:}'.isEmpty()")
class BizDatabaseConfig {

	@Bean
	@Primary
	fun bizDatabase(
		@Value("\${BIZ_DB_URL}") url: String,
		@Value("\${BIZ_DB_USERNAME:}") username: String,
		@Value("\${BIZ_DB_PASSWORD:}") password: String,
	): BizDatabase {
		val config = HikariConfig().apply {
			poolName = "biz-db"
			jdbcUrl = url
			this.username = username.ifEmpty { null }
			this.password = password.ifEmpty { null }
			// 운영 DB 이므로 읽기만 한다
			isReadOnly = true
			maximumPoolSize = 5
			connectionTimeout = 5_000
			// Biz DB 가 꺼져 있어도 앱은 뜬다. 연결은 처음 쓸 때 시도한다.
			initializationFailTimeout = -1
		}
		return BizDatabase(HikariDataSource(config))
	}

	/**
	 * 수정용 연결. BIZ_DB_WRITE_URL / BIZ_DB_WRITE_USERNAME / BIZ_DB_WRITE_PASSWORD 를 따로 주면 그것을 쓰고,
	 * 없으면 읽기용과 같은 접속 정보로 읽기 전용이 아닌 풀을 하나 더 만든다(로컬 개발용). 운영에서는 따로 주는 것을 권한다.
	 */
	@Bean
	fun bizWriteDatabase(
		@Value("\${BIZ_DB_WRITE_URL:\${BIZ_DB_URL}}") url: String,
		@Value("\${BIZ_DB_WRITE_USERNAME:\${BIZ_DB_USERNAME:}}") username: String,
		@Value("\${BIZ_DB_WRITE_PASSWORD:\${BIZ_DB_PASSWORD:}}") password: String,
	): BizWriteDatabase {
		val config = HikariConfig().apply {
			poolName = "biz-db-write"
			jdbcUrl = url
			this.username = username.ifEmpty { null }
			this.password = password.ifEmpty { null }
			isReadOnly = false
			maximumPoolSize = 3
			connectionTimeout = 5_000
			initializationFailTimeout = -1
		}
		return BizWriteDatabase(HikariDataSource(config))
	}
}
