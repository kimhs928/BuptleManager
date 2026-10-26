plugins {
	kotlin("jvm")
	kotlin("plugin.spring")
	id("io.spring.dependency-management")
}

dependencies {
	implementation(platform("org.springframework.boot:spring-boot-dependencies:4.1.1"))

	implementation(project(":core"))
	// BuptleManager DB 에 저장된 고객사 데이터를 보여주는 API(플랫폼별 biz/, nova/)를 이 모듈이 가진다
	implementation("org.springframework.boot:spring-boot-starter-webmvc")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
