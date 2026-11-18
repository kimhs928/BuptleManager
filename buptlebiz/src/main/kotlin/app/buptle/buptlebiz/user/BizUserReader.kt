package app.buptle.buptlebiz.user

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.ResultSet
import java.time.Instant
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

/**
 * Biz 고객사의 유저(users_user + main_userprofile)와 유저가 참여 중인 계약·자문·소송을 Biz DB 에서 읽는다 (조회 전용).
 * 시스템 내 역할 이름은 BuptleManager 의 enum 표(BIZ_USER_SYSTEM_ROLE)에서 가져온다.
 */
@Component
class BizUserReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
) {

	fun users(schema: String): List<CompanyUserResponse> {
		val roleLabels = enums.findDetail(ROLE_SET)?.values?.associate { it.code to it.label }.orEmpty()
		return db().forTenant(schema) { jdbc ->
			jdbc.query(
				"""
				select u.id as pk, u.first_name, u.email, u.last_login, u.is_active, u.date_joined,
				       p.create_time, p.update_time, p.tel_num, p.department, p.role_name, p.description, p.employee_no,
				       p.migrated, p.isdeleted,
				       coalesce(p."isAdmin", false) as is_admin, coalesce(p."isLawyer", false) as is_lawyer, coalesce(p."isViewer", false) as is_viewer,
				       (select count(distinct ct.contract_id) from contract_bcontractor ct join contract_bcontract c on c.id = ct.contract_id
				         where ct.user_id = u.id and ct.isdeleted = false and c.isdeleted = false) as contracts,
				       (select count(*) from (${COUNSEL_IDS.replace(":pid", "p.id")}) x) as counsels,
				       (select count(*) from (${LAWSUIT_IDS.replace(":pid", "p.id")}) y) as lawsuits
				from users_user u
				join main_userprofile p on p.user_id = u.id
				order by u.id
				""".trimIndent(),
				emptyMap<String, Any>(),
			) { rs, _ ->
				val roles = buildList {
					if (rs.getBoolean("is_admin")) add(ADMIN)
					if (rs.getBoolean("is_viewer")) add(VIEWER)
					if (rs.getBoolean("is_lawyer")) add(LAWYER)
					if (isEmpty()) add(NORMAL)
				}
				CompanyUserResponse(
					id = "u${rs.getLong("pk")}",
					pk = rs.getLong("pk").toString(),
					name = rs.getString("first_name").orEmpty(),
					email = rs.getString("email").orEmpty(),
					lastLogin = rs.instant("last_login"),
					roles = roles.map { roleLabels[it] ?: it },
					active = rs.getBoolean("is_active") && !rs.getBoolean("isdeleted"),
					joinedAt = rs.instant("date_joined"),
					createdAt = rs.instant("create_time"),
					updatedAt = rs.instant("update_time"),
					phone = rs.getString("tel_num").orEmpty(),
					dept = rs.getString("department").orEmpty(),
					title = rs.getString("role_name").orEmpty(),
					desc = rs.getString("description").orEmpty(),
					empNo = rs.getString("employee_no").orEmpty(),
					migrated = rs.getBoolean("migrated"),
					docCounts = UserDocCounts(rs.getInt("contracts"), rs.getInt("counsels"), rs.getInt("lawsuits")),
				)
			}
		}
	}

	/** 유저가 참여 중인 문서 목록. 유저가 없으면 null */
	fun documents(schema: String, pk: Long, kind: DocKind): List<UserDocumentResponse>? = db().forTenant(schema) { jdbc ->
		val profile = jdbc.query("select id from main_userprofile where user_id = :pk", mapOf("pk" to pk)) { rs, _ -> rs.getLong(1) }.firstOrNull()
			?: return@forTenant null
		val params = mapOf("pk" to pk, "pid" to profile)
		when (kind) {
			DocKind.CONTRACT -> jdbc.query(
				"""
				select c.view_code, c.name from contract_bcontract c
				where c.isdeleted = false and c.id in (select ct.contract_id from contract_bcontractor ct where ct.user_id = :pk and ct.isdeleted = false)
				order by c.create_time desc, c.id desc
				""".trimIndent(),
				params,
			) { rs, _ -> UserDocumentResponse(rs.getString("view_code").orEmpty(), rs.getString("name").orEmpty()) }

			DocKind.COUNSEL -> jdbc.query(
				"select c.view_code, c.title from counsel_bcounsel c where c.isdeleted = false and c.id in ($COUNSEL_IDS) order by c.create_time desc, c.id desc",
				params,
			) { rs, _ -> UserDocumentResponse(rs.getString("view_code").orEmpty(), rs.getString("title").orEmpty()) }

			DocKind.LAWSUIT -> jdbc.query(
				"select l.view_code, l.title from lawsuit_blawsuit l where l.isdeleted = false and l.id in ($LAWSUIT_IDS) order by l.create_time desc, l.id desc",
				params,
			) { rs, _ -> UserDocumentResponse(rs.getString("view_code").orEmpty(), rs.getString("title").orEmpty()) }
		}
	}

	private fun db(): BizDatabase = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()

	private companion object {
		const val ROLE_SET = "BIZ_USER_SYSTEM_ROLE"
		const val ADMIN = "ADMIN"
		const val VIEWER = "VIEWER"
		const val LAWYER = "LAWYER"
		const val NORMAL = "NORMAL"

		/**
		 * 유저(:pid = main_userprofile.id)가 참여 중인 자문 id. 요청자, 승인자, 관련인, 회람인, 외부 변호사(법무법인 유저가 이 유저와 연결된 경우).
		 * 삭제되지 않은 참여만 센다.
		 */
		val COUNSEL_IDS = """
			select c.id from counsel_bcounsel c where c.creator_id = :pid and c.isdeleted = false
			union select a.counsel_id from counsel_bapproval a join counsel_bcounsel c on c.id = a.counsel_id where a.userprofile_id = :pid and a.isdeleted = false and c.isdeleted = false
			union select r.counsel_id from counsel_bcounsel_related r join counsel_bcounsel c on c.id = r.counsel_id where r.userprofile_id = :pid and r.isdeleted = false and c.isdeleted = false
			union select ci.counsel_id from counsel_bcounsel_circulation ci join counsel_bcounsel c on c.id = ci.counsel_id where ci.userprofile_id = :pid and ci.isdeleted = false and ci.active = true and c.isdeleted = false
			union select e.counsel_id from counsel_bcounsel_external_lawyer e
			  join manage_blawfirmuserprofile lf on lf.id = e.lawfirm_userprofile_id
			  join counsel_bcounsel c on c.id = e.counsel_id
			 where lf.user_profile_id = :pid and e.isdeleted = false and c.isdeleted = false
		""".trimIndent()

		/** 유저가 참여 중인 소송 id. 당사자·스케줄·업무·제외 항목은 참여 역할이 아니라 뺀다 */
		val LAWSUIT_IDS = """
			select lp.lawsuit_id from lawsuit_blawsuitparticipant lp join lawsuit_blawsuit l on l.id = lp.lawsuit_id
			 where lp.isdeleted = false and l.isdeleted = false
			   and lp.type in ('CREATOR', 'MANAGER', 'CONTACTOR', 'RELATED', 'EXTERNAL_LAWYER')
			   and (lp.related_id = :pid or lp.lawfirm_userprofile_id in (select id from manage_blawfirmuserprofile where user_profile_id = :pid))
		""".trimIndent()
	}
}
