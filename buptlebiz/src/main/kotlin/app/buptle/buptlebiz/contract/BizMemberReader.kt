package app.buptle.buptlebiz.contract

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.ResultSet
import java.time.Instant
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

/**
 * 계약 참여 유저(contract_bcontractor)를 Biz DB 에서 읽는다 (조회 전용).
 * 역할, 서명 방식 이름은 BuptleManager 의 enum 표에서 가져온다.
 */
@Component
class BizMemberReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
) {

	/** 계약(view_code)이 없으면 null */
	fun members(schema: String, viewCode: String, includeDeleted: Boolean): List<ContractMemberResponse>? {
		val db = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")
		val roleLabels = labels("BIZ_CONTRACTOR_ROLE")
		val methodLabels = labels("BIZ_SIGN_METHOD")
		return db.forTenant(schema) { jdbc ->
			val contractId = jdbc.query(
				"select id from contract_bcontract where view_code = :code order by isdeleted, id desc limit 1",
				mapOf("code" to viewCode),
			) { rs, _ -> rs.getLong(1) }.firstOrNull() ?: return@forTenant null

			jdbc.query(
				"""
				select ct.id, ct.classification, ct.name, ct.email, ct.company_name, ct.mobile, ct.responsibility, ct.language,
				       ct.sig_method_restrict, ct.sig_classification_restrict, ct.dept_name, ct.isdeleted,
				       ct.create_time, ct.update_time, ct.delete_time,
				       u.first_name as user_name, u.email as user_email,
				       p.department as profile_dept, p.tel_num as profile_tel,
				       coalesce(p."isAdmin", false) as is_admin, coalesce(p."isLawyer", false) as is_lawyer, coalesce(p."isViewer", false) as is_viewer,
				       (select s.method from contract_bsignature s where s.contractor_id = ct.id and s.isdeleted = false order by s.id desc limit 1) as signed_method
				from contract_bcontractor ct
				left join users_user u on u.id = ct.user_id
				left join main_userprofile p on p.user_id = ct.user_id
				where ct.contract_id = :cid ${if (includeDeleted) "" else "and ct.isdeleted = false"}
				order by ct.create_time, ct.id
				""".trimIndent(),
				mapOf("cid" to contractId),
			) { rs, _ ->
				val roles = rs.ints("classification")
				val external = EXTERNAL_ROLE in roles
				val responsibility = rs.getInt("responsibility")
				val signedMethod = (rs.getObject("signed_method") as? Number)?.toInt()
				ContractMemberResponse(
					id = "m${rs.getLong("id")}",
					kind = if (external) "external" else "internal",
					roles = roles.map { roleLabels[it.toString()] ?: it.toString() },
					name = rs.getString("user_name")?.takeIf { it.isNotBlank() } ?: rs.getString("name").orEmpty(),
					email = rs.getString("user_email")?.takeIf { it.isNotBlank() } ?: rs.getString("email").orEmpty(),
					company = rs.getString("company_name").orEmpty(),
					dept = rs.getString("profile_dept")?.takeIf { it.isNotBlank() } ?: rs.getString("dept_name").orEmpty(),
					phone = rs.getString("profile_tel")?.takeIf { it.isNotBlank() } ?: rs.getString("mobile").orEmpty(),
					perm = if (external) emptyList() else permLabels(responsibility),
					// 화면 기준: 방식 = 개인/회사 서명 구분, 종류 = SMS · 공인인증서 같은 서명 수단
					signMethod = dashIfEmpty(rs.ints("sig_classification_restrict").map { SIGN_CLASS[it] ?: it.toString() }),
					signType = dashIfEmpty(rs.ints("sig_method_restrict").map { methodLabels[it.toString()] ?: it.toString() }),
					signStatus = signStatus(responsibility, signedMethod),
					lang = when (rs.getString("language")) {
						"en" -> "en"
						"ja" -> "ja"
						else -> "ko"
					},
					sysRoles = if (external) emptyList() else sysRoles(rs.getBoolean("is_admin"), rs.getBoolean("is_lawyer"), rs.getBoolean("is_viewer")),
					deleted = rs.getBoolean("isdeleted"),
					joinedAt = rs.instant("create_time") ?: Instant.EPOCH,
					updatedAt = rs.instant("update_time") ?: Instant.EPOCH,
					deletedAt = rs.instant("delete_time"),
				)
			}
		}
	}

	private fun labels(setCode: String): Map<String, String> = enums.findDetail(setCode)?.values?.associate { it.code to it.label }.orEmpty()

	private fun permLabels(responsibility: Int): List<String> = buildList {
		if (responsibility and RES_WATCH != 0) add("조회")
		if (responsibility and RES_SIGN != 0) add("서명")
		if (responsibility and RES_MASTER != 0) add("관리")
	}

	/** 서명 상태. 거부 = 서명 거절(method 6), 완료 = 서명 기록 있음, 대기 = 서명 권한이 있는데 기록 없음, 그 외 - */
	private fun signStatus(responsibility: Int, signedMethod: Int?): String = when {
		signedMethod == SIG_REJECT -> "거부"
		signedMethod != null -> "완료"
		responsibility and RES_SIGN != 0 -> "대기"
		else -> "-"
	}

	private fun sysRoles(admin: Boolean, lawyer: Boolean, viewer: Boolean): List<String> = buildList {
		if (admin) add("관리자")
		if (lawyer) add("법무검토자")
		if (viewer) add("조회자")
		if (isEmpty()) add("일반")
	}

	private fun dashIfEmpty(items: List<String>) = items.joinToString(", ").ifEmpty { "-" }

	private fun ResultSet.ints(column: String): List<Int> = (getArray(column)?.array as? Array<*>)?.mapNotNull { (it as? Number)?.toInt() }.orEmpty()

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()

	private companion object {
		const val EXTERNAL_ROLE = 1
		const val RES_SIGN = 1
		const val RES_WATCH = 2
		const val RES_MASTER = 4096
		const val SIG_REJECT = 6
		val SIGN_CLASS = mapOf(0 to "개인 서명", 1 to "회사 서명", 2 to "수기 서명")
	}
}
