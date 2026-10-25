package app.buptle.company.domain

enum class ConfigScope {
	MODULES,
	COMPONENT,
	STANDALONE,

	/** 고객사에 속하지 않는 공용 컨피그 */
	PUBLIC,
}
