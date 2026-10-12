package app.buptle

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class BuptleManagerApplication

fun main(args: Array<String>) {
	runApplication<BuptleManagerApplication>(*args)
}
