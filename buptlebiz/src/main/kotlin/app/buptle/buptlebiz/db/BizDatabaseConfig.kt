package app.buptle.buptlebiz.db

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * BIZ_DB_URL 이 있을 때만 Biz DB 에 연결한다. 없으면 이 빈이 생기지 않아 앱은 BuptleManager DB 만으로 뜬다.
 * 접속 정보는 환경변수나 .env 로만 넣고 저장소에는 올리지 않는다.
 */
@Configuration(proxyBeanMethods = false)
@ConditionalOnExpression("!'\${BIZ_DB_URL:}'.isEmpty()")
class BizDatabaseConfig {

	@Bean
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
}
