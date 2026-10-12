plugins {
	kotlin("jvm")
}

dependencies {
	implementation(project(":core"))
	implementation(project(":company"))
	testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
}
