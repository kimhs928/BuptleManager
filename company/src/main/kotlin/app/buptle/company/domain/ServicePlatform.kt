package app.buptle.company.domain

/**
 * 고객사가 실제로 존재하는 서비스 구분이다.
 * 한 고객사는 BUPTLE_BIZ와 BUPTLE_NOVA 중 하나에만 속한다.
 */
enum class ServicePlatform {
	BUPTLE_BIZ,
	BUPTLE_NOVA,
}
