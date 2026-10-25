package app.buptle.operation.user

/** 지금 작업을 수행하는 운영자. 로그인 구현 전에는 개발용 계정 1개를 돌려준다. */
interface CurrentUserProvider {
	fun currentUser(): ManagementUser
}
