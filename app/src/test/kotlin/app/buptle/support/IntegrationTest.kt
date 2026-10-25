package app.buptle.support

import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles

/** DB 가 필요한 통합 테스트용 공통 설정 (test 프로파일 + Testcontainers PostgreSQL) */
@Target(AnnotationTarget.CLASS)
@Retention(AnnotationRetention.RUNTIME)
@SpringBootTest
@ActiveProfiles("test")
@Import(TestcontainersConfig::class)
annotation class IntegrationTest
