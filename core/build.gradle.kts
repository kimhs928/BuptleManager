plugins {
	kotlin("jvm")
}

dependencies {
	// 모든 모듈이 쓰는 API 공통 모델(AuditRequest 등)의 @Schema, 검증 어노테이션
	api("io.swagger.core.v3:swagger-annotations-jakarta:2.2.55")
	api("jakarta.validation:jakarta.validation-api:3.1.1")
	implementation("org.jetbrains.kotlin:kotlin-reflect")
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
