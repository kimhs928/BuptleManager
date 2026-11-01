package app.buptle.buptlebiz.db

import com.zaxxer.hikari.HikariDataSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate

/**
 * Buptle Biz 운영 DB (실시간 접속 유저 등 BuptleManager DB 에 없는 데이터). 조회 전용.
 *
 * 일부러 DataSource 빈으로 등록하지 않는다. 등록하면 BuptleManager DB 의 자동 구성이 물러난다.
 * 필요한 곳에서 이 클래스를 주입받아 [jdbc] 로 조회한다.
 */
class BizDatabase(private val dataSource: HikariDataSource) : AutoCloseable {
	val jdbc = NamedParameterJdbcTemplate(dataSource)

	override fun close() = dataSource.close()
}
