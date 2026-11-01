plugins {
	kotlin("jvm")
	kotlin("plugin.spring")
	id("io.spring.dependency-management")
}

dependencies {
	implementation(platform("org.springframework.boot:spring-boot-dependencies:4.1.1"))

	implementation(project(":core"))
	implementation(project(":company"))
	implementation(project(":operation"))
	// 이 모듈이 Biz 전용 API(컨트롤러, 요청/응답 DTO)를 가진다
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	// Biz 운영 DB(BIZ_DB_URL) 조회용 별도 연결
	implementation("org.springframework.boot:spring-boot-starter-jdbc")
	runtimeOnly("org.postgresql:postgresql")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
