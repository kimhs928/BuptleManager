package app.buptle.company.biz

import app.buptle.company.domain.Company
import app.buptle.company.domain.ConfigScope
import app.buptle.company.domain.ServicePlatform
import io.swagger.v3.oas.annotations.media.Schema
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

/** 고객사 기본 정보 (조회 전용) */
@Schema(description = "고객사 기본 정보. 문자열 항목은 값이 없으면 null 이 아니라 빈 문자열이다.")
data class CompanyDetailResponse(
	@Schema(description = "서비스 구분", example = "BUPTLE_BIZ")
	val platform: ServicePlatform,
	@Schema(description = "스키마명", example = "buptle")
	val schema: String,
	@Schema(description = "회사명", example = "법틀")
	val name: String,
	@Schema(description = "서비스 도메인", example = "buptle.buptle.app")
	val domain: String,
	@Schema(description = "활성화 유무", example = "true")
	val active: Boolean,
	@Schema(description = "대표자명. 없으면 빈 문자열", example = "홍길동")
	val representative: String,
	@Schema(description = "사업자번호(000-00-00000 형식). 없으면 빈 문자열", example = "123-45-67890")
	val businessNo: String,
	@Schema(description = "대표 번호. 없으면 빈 문자열", example = "02-1234-5678")
	val phone: String,
	@Schema(description = "고객사 생성일 (Buptle Cloud 기준, 한국 시간 날짜)", type = "string", format = "date", example = "2024-03-15")
	val createdAt: LocalDate?,
	@Schema(description = "현재 유저 수", example = "128")
	val users: Int?,
	@Schema(description = "유저 수 상한", example = "200")
	val userLimit: Int?,
	@Schema(description = "주소. 없으면 빈 문자열", example = "서울특별시 성동구")
	val address: String,
) {
	companion object {
		private val KST: ZoneId = ZoneId.of("Asia/Seoul")

		fun from(company: Company) = CompanyDetailResponse(
			platform = company.platform,
			schema = company.schemaName,
			name = company.name,
			domain = company.domain,
			active = company.active,
			representative = company.representative.orEmpty(),
			businessNo = company.businessNumber.orEmpty(),
			phone = company.telephoneNumber.orEmpty(),
			createdAt = company.sourceCreatedAt?.atZone(KST)?.toLocalDate(),
			users = company.userCount,
			userLimit = company.userLimit,
			address = company.address.orEmpty(),
		)
	}
}

data class OpsResponse(
	@Schema(description = "적용된 컨피그 수", example = "12")
	val appliedConfigs: Int,
	@Schema(description = "현재 접속 중인 유저 수", example = "6")
	val onlineUsers: Int,
	@Schema(description = "최근 30일 처리 내역 건수", example = "9")
	val jobs30d: Int,
	@Schema(description = "열려 있는 티켓 수", example = "2")
	val openTickets: Int,
)

data class RecentJobResponse(
	@Schema(description = "처리 내역 ID", example = "10230")
	val id: Long,
	@Schema(description = "대분류-대상-기능", example = "계약 CT-2024-0315 참여 유저 수정")
	val title: String,
	@Schema(description = "작업자 이름", example = "김효선")
	val actor: String,
	@Schema(description = "Zendesk 티켓 번호", example = "TKT-2024-0523-002")
	val ticket: String,
	@Schema(description = "작업 일시")
	val at: Instant,
)

data class CompanyConfigItem(
	@Schema(description = "컨피그 ID", example = "8")
	val id: Long,
	val scope: ConfigScope,
	@Schema(description = "컨피그명 (^[A-Z0-9_.]+$)", example = "NOTIFY_DISABLED_LIST")
	val name: String,
	@Schema(description = "컨피그 상세 설명", example = "알림 수신 제외 대상 목록")
	val description: String?,
	@Schema(description = "이 고객사에 적용된 값", example = "{\"excludedUserIds\":[\"U-01001\"]}")
	val value: String?,
	@Schema(description = "컨피그 등록 일자")
	val appliedAt: LocalDate,
	@Schema(description = "컨피그 등록 유저", example = "이준호")
	val appliedBy: String,
)

data class PublicConfigItem(
	val id: Long,
	@Schema(example = "PUBLIC_SERVICE_NOTICE")
	val name: String,
	val appliedAt: LocalDate,
	val appliedBy: String,
)

data class CompanyConfigsResponse(
	@Schema(description = "동기화 시각")
	val syncedAt: Instant?,
	@Schema(description = "COMPONENT / MODULES / STANDALONE 컨피그")
	val items: List<CompanyConfigItem>,
	@Schema(description = "고객사와 무관한 PUBLIC 컨피그")
	val publicItems: List<PublicConfigItem>,
)
