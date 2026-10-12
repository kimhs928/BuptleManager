plugins {
	kotlin("jvm")
}

dependencies {
	implementation(project(":core"))
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
