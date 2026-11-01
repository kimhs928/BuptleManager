package app.buptle.buptlebiz.db

import com.zaxxer.hikari.HikariDataSource
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.jdbc.datasource.SingleConnectionDataSource

/**
 * Buptle Biz 운영 DB (실시간 접속 유저 등 BuptleManager DB 에 없는 데이터). 조회 전용.
 *
 * Biz 는 멀티테넌트라 고객사마다 스키마가 다르다. BuptleManager 에서 고른 스키마명이 곧 테넌트이므로
 * 조회는 반드시 [forTenant] 로 그 테넌트의 스키마 안에서 한다.
 *
 * 일부러 DataSource 빈으로 등록하지 않는다. 등록하면 BuptleManager DB 의 자동 구성이 물러난다.
 */
class BizDatabase(private val dataSource: HikariDataSource) : AutoCloseable {

	/**
	 * [schema] 테넌트의 스키마를 search_path 로 잡은 연결에서 [block] 을 실행한다.
	 * 쿼리에는 스키마를 붙이지 않고 테이블명만 쓴다. search_path 는 이 트랜잭션 안에서만 적용돼 풀의 다른 연결에 새지 않는다.
	 */
	fun <T> forTenant(schema: String, block: (NamedParameterJdbcTemplate) -> T): T {
		require(TENANT_PATTERN.matches(schema)) { "올바르지 않은 테넌트(스키마)명입니다: $schema" }
		dataSource.connection.use { conn ->
			conn.autoCommit = false
			try {
				// 값은 바인딩으로 넘기고(SQL 에 이어 붙이지 않음), 세 번째 인자 true 로 현재 트랜잭션에만 적용한다
				conn.prepareStatement("select set_config('search_path', ?, true)").use {
					it.setString(1, "\"$schema\"")
					it.execute()
				}
				val result = block(NamedParameterJdbcTemplate(SingleConnectionDataSource(conn, true)))
				conn.commit()
				return result
			} catch (e: Throwable) {
				conn.rollback()
				throw e
			}
		}
	}

	override fun close() = dataSource.close()

	private companion object {
		/** 스키마명으로 허용하는 문자. 따옴표 등 SQL 에 의미 있는 문자는 막는다 */
		val TENANT_PATTERN = Regex("[A-Za-z0-9_]{1,100}")
	}
}
