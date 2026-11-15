package app.buptle.buptlebiz.counsel

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.core.api.PageResponse
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.ResultSet
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import org.springframework.beans.factory.ObjectProvider
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Component

/**
 * Biz DB 에서 자문을 읽는다 (조회 전용). 테이블 · 컬럼 대응은 데이터 매핑 엑셀의 '자문' 시트를 따른다.
 * 상태, 승인 타입 이름은 BuptleManager 의 enum 표(BIZ_COUNSEL_*)에서 가져온다.
 */
@Component
class BizCounselReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
) {

	fun search(schema: String, q: String?, includeDeleted: Boolean, page: Int, size: Int): PageResponse<CounselSummaryResponse> {
		val keyword = q?.trim().orEmpty()
		val where = StringBuilder("where 1=1")
		val params = mutableMapOf<String, Any?>("limit" to size, "offset" to (page - 1) * size)
		if (!includeDeleted) where.append(" and c.isdeleted = false")
		if (keyword.isNotEmpty()) {
			where.append(" and (c.view_code ilike :kw or c.title ilike :kw)")
			params["kw"] = "%${escapeLike(keyword)}%"
		}
		return db().forTenant(schema) { jdbc ->
			val total = jdbc.queryForObject("select count(*) from counsel_bcounsel c $where", params, Long::class.java) ?: 0L
			val items = jdbc.query(
				"""
				select c.view_code, c.title, c.status, c.create_time, c.isdeleted,
				       (select u.first_name from main_userprofile p join users_user u on u.id = p.user_id where p.id = c.creator_id) as requester,
				       coalesce(
				         (select u.first_name from counsel_bapproval a
				            join main_userprofile p on p.id = a.userprofile_id join users_user u on u.id = p.user_id
				           where a.counsel_id = c.id and a.approval_type = 'REVIEW' and a.isdeleted = false order by a.id desc limit 1),
				         (select coalesce(nullif(u.first_name, ''), lf.name) from counsel_bcounsel_external_lawyer e
				            join manage_blawfirmuserprofile lf on lf.id = e.lawfirm_userprofile_id
				            left join main_userprofile p on p.id = lf.user_profile_id
				            left join users_user u on u.id = p.user_id
				           where e.counsel_id = c.id and e.isdeleted = false order by e.id desc limit 1),
				         '-') as lawyer,
				       (select count(*) from (
				           select c.creator_id as pid
				           union select a.userprofile_id from counsel_bapproval a where a.counsel_id = c.id and a.isdeleted = false
				           union select r.userprofile_id from counsel_bcounsel_related r where r.counsel_id = c.id and r.isdeleted = false
				           union select ci.userprofile_id from counsel_bcounsel_circulation ci where ci.counsel_id = c.id and ci.isdeleted = false and ci.active = true
				           union select coalesce(lf.user_profile_id, -lf.id) from counsel_bcounsel_external_lawyer e
				             join manage_blawfirmuserprofile lf on lf.id = e.lawfirm_userprofile_id
				            where e.counsel_id = c.id and e.isdeleted = false
				         ) m) as members
				from counsel_bcounsel c
				$where
				order by c.create_time desc, c.id desc
				limit :limit offset :offset
				""".trimIndent(),
				params,
			) { rs, _ ->
				CounselSummaryResponse(
					id = rs.getString("view_code").orEmpty(),
					name = rs.getString("title").orEmpty(),
					status = rs.getString("status").orEmpty(),
					requester = rs.getString("requester").orEmpty(),
					lawyer = rs.getString("lawyer").orEmpty(),
					members = rs.getInt("members"),
					createdAt = rs.instant("create_time")?.atZone(KST)?.toLocalDate() ?: LocalDate.EPOCH,
					deleted = rs.getBoolean("isdeleted"),
					recent = false,
				)
			}
			PageResponse(items, page, size, total)
		}
	}

	/** view_code 로 자문 1건. 없으면 null */
	fun detail(schema: String, viewCode: String): CounselDetailResponse? = db().forTenant(schema) { jdbc ->
		val c = jdbc.query(
			"""
			select c.id, c.view_code, c.title, c.status, c.create_time, c.update_time, c.delete_time, c.isdeleted,
			       c.ismanaged, c.counsel_type, c.show_range_type, c.migrated
			from counsel_bcounsel c
			where c.view_code = :code
			order by c.isdeleted, c.id desc
			limit 1
			""".trimIndent(),
			mapOf("code" to viewCode),
		) { rs, _ ->
			Base(
				rs.getLong("id"), rs.getString("view_code").orEmpty(), rs.getString("title").orEmpty(), rs.getString("status").orEmpty(),
				rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, rs.instant("delete_time"),
				rs.getBoolean("isdeleted"), rs.getString("ismanaged"), rs.getString("counsel_type").orEmpty(), rs.getString("show_range_type").orEmpty(),
				rs.getBoolean("migrated"),
			)
		}.firstOrNull() ?: return@forTenant null

		val projects = jdbc.query(
			"""
			select e.name from epic_bepic_counsel ec join epic_bepic e on e.id = ec.epic_id
			where ec.counsel_id = :id and ec.isdeleted = false order by ec.id
			""".trimIndent(),
			mapOf("id" to c.id),
		) { rs, _ -> rs.getString(1).orEmpty() }
		val category = jdbc.query(
			"""
			select cat.title as category, par.title as parent
			from counsel_bcounselcategory cc
			join main_bcategory cat on cat.id = cc.category_id
			left join main_bcategory par on par.id = cat.parent_id
			where cc.counsel_id = :id and cc.isdeleted = false order by cc.id desc limit 1
			""".trimIndent(),
			mapOf("id" to c.id),
		) { rs, _ -> rs.getString("category").orEmpty() to rs.getString("parent").orEmpty() }.firstOrNull()

		CounselDetailResponse(
			id = c.viewCode,
			idPlain = c.viewCode.filter { it.isDigit() },
			name = c.title,
			status = c.status,
			createdAt = c.createdAt,
			updatedAt = c.updatedAt,
			deleted = c.deleted,
			deletedAt = c.deletedAt,
			managed = c.managed == FINAL_APPROVAL_REQUIRED,
			counselType = c.counselType,
			showRangeType = c.showRange,
			projects = projects,
			migrated = c.migrated,
			categoryParent = category?.second.orEmpty(),
			category = category?.first.orEmpty(),
		)
	}

	/** 참여 유저. 한 사람이 여러 출처에 있으면 역할을 합쳐 한 줄로 만든다. 자문이 없으면 null */
	fun members(schema: String, viewCode: String, companyName: String): List<CounselMemberResponse>? = db().forTenant(schema) { jdbc ->
		val id = counselId(jdbc, viewCode) ?: return@forTenant null
		val sources = sources(jdbc, id)
		val apprTypes = labels("BIZ_COUNSEL_APPR_TYPE")
		val apprStatuses = labels("BIZ_COUNSEL_APPR_STATUS")
		val roleLabels = labels(ROLE_SET)
		val profiles = profiles(jdbc, sources.mapNotNull { it.profileId }.distinct())
		val lawyers = lawyers(jdbc, sources.mapNotNull { it.lawyerId }.distinct())

		sources.groupBy { it.key }.map { (_, rows) ->
			val first = rows.first()
			val approval = rows.filter { it.role in APPROVAL_ROLES }.let { a -> a.lastOrNull { !it.deleted } ?: a.lastOrNull() }
			val allDeleted = rows.all { it.deleted }
			val profile = first.profileId?.let { profiles[it] }
			val lawyer = rows.firstNotNullOfOrNull { it.lawyerId }?.let { lawyers[it] }
			CounselMemberResponse(
				id = first.key,
				userId = profile?.userId,
				name = profile?.name ?: lawyer?.name.orEmpty(),
				email = profile?.email ?: lawyer?.email.orEmpty(),
				company = lawyer?.firm?.takeIf { it.isNotEmpty() } ?: if (profile != null) companyName else "",
				phone = profile?.phone.orEmpty(),
				roles = rows.map { roleLabels[it.role] ?: it.role }.distinct(),
				dept = profile?.dept.orEmpty(),
				sysRoles = profile?.sysRoles ?: emptyList(),
				approvalType = approval?.approvalType?.let { apprTypes[it] ?: it }.orEmpty(),
				approvalStatus = approval?.approvalStatus?.let { apprStatuses[it] ?: it }.orEmpty(),
				deleted = allDeleted,
				createdAt = rows.minOf { it.createdAt },
				updatedAt = rows.maxOf { it.updatedAt },
				deletedAt = if (allDeleted) rows.mapNotNull { it.deletedAt }.maxOrNull() else null,
			)
		}
	}

	internal fun profiles(jdbc: NamedParameterJdbcTemplate, ids: List<Long>): Map<Long, Profile> {
		if (ids.isEmpty()) return emptyMap()
		return jdbc.query(
			"""
			select p.id, p.user_id, u.first_name, u.email, p.department, p.tel_num,
			       coalesce(p."isAdmin", false) as is_admin, coalesce(p."isLawyer", false) as is_lawyer, coalesce(p."isViewer", false) as is_viewer
			from main_userprofile p left join users_user u on u.id = p.user_id
			where p.id in (:ids)
			""".trimIndent(),
			mapOf("ids" to ids),
		) { rs, _ ->
			rs.getLong("id") to Profile(
				rs.getLong("user_id").toString(), rs.getString("first_name").orEmpty(), rs.getString("email").orEmpty(),
				rs.getString("department").orEmpty(), rs.getString("tel_num").orEmpty(),
				buildList {
					if (rs.getBoolean("is_admin")) add("관리자")
					if (rs.getBoolean("is_lawyer")) add("법무검토자")
					if (rs.getBoolean("is_viewer")) add("조회자")
					if (isEmpty()) add("일반유저")
				},
			)
		}.toMap()
	}

	internal fun lawyers(jdbc: NamedParameterJdbcTemplate, ids: List<Long>): Map<Long, Lawyer> {
		if (ids.isEmpty()) return emptyMap()
		return jdbc.query(
			"""
			select l.id, l.name, l.email, f.name as firm
			from manage_blawfirmuserprofile l left join manage_bexternal_lawfirm f on f.id = l.law_firm_id
			where l.id in (:ids)
			""".trimIndent(),
			mapOf("ids" to ids),
		) { rs, _ -> rs.getLong("id") to Lawyer(rs.getString("name").orEmpty(), rs.getString("email").orEmpty(), rs.getString("firm").orEmpty()) }.toMap()
	}

	/** 참여자가 어느 출처에서 왔는지 한 줄씩 모은다 */
	internal fun sources(jdbc: NamedParameterJdbcTemplate, counselId: Long): List<Source> {
		val p = mapOf("id" to counselId)
		val out = mutableListOf<Source>()
		jdbc.query("select creator_id, create_time, update_time from counsel_bcounsel where id = :id", p) { rs, _ ->
			val pid = rs.getLong("creator_id")
			out += Source(CREATOR, "u$pid", pid, null, false, rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, null, null, null)
		}
		jdbc.query("select userprofile_id, approval_type, status, isdeleted, create_time, update_time, delete_time from counsel_bapproval where counsel_id = :id order by id", p) { rs, _ ->
			val type = rs.getString("approval_type").orEmpty()
			val role = when (type) {
				"DEPT" -> DEPT
				"FINAL" -> FINAL
				else -> REVIEW
			}
			val pid = rs.getLong("userprofile_id")
			out += Source(role, "u$pid", pid, null, rs.getBoolean("isdeleted"), rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, rs.instant("delete_time"), type, rs.getString("status"))
		}
		jdbc.query("select userprofile_id, isdeleted, create_time, update_time, delete_time from counsel_bcounsel_related where counsel_id = :id order by id", p) { rs, _ ->
			val pid = rs.getLong("userprofile_id")
			out += Source(RELATED, "u$pid", pid, null, rs.getBoolean("isdeleted"), rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, rs.instant("delete_time"), null, null)
		}
		jdbc.query("select userprofile_id, isdeleted, create_time, update_time, delete_time from counsel_bcounsel_circulation where counsel_id = :id and active = true order by id", p) { rs, _ ->
			val pid = rs.getLong("userprofile_id")
			out += Source(CIRCULATION, "u$pid", pid, null, rs.getBoolean("isdeleted"), rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, rs.instant("delete_time"), null, null)
		}
		// 외부 변호사도 Biz 의 사내 유저다: external_lawyer.lawfirm_userprofile → user_profile(main_userprofile). 유저가 연결되지 않은 행만 법무법인 유저 정보로 보여 준다
		jdbc.query(
			"""
			select e.lawfirm_userprofile_id, l.user_profile_id, e.isdeleted, e.create_time, e.update_time, e.delete_time
			from counsel_bcounsel_external_lawyer e
			join manage_blawfirmuserprofile l on l.id = e.lawfirm_userprofile_id
			where e.counsel_id = :id order by e.id
			""".trimIndent(),
			p,
		) { rs, _ ->
			val lid = rs.getLong("lawfirm_userprofile_id")
			val pid = (rs.getObject("user_profile_id") as? Number)?.toLong()
			out += Source(EXTERNAL, if (pid != null) "u$pid" else "x$lid", pid, lid, rs.getBoolean("isdeleted"), rs.instant("create_time") ?: Instant.EPOCH, rs.instant("update_time") ?: Instant.EPOCH, rs.instant("delete_time"), null, null)
		}
		return out
	}

	internal data class Source(
		val role: String,
		val key: String,
		val profileId: Long?,
		val lawyerId: Long?,
		val deleted: Boolean,
		val createdAt: Instant,
		val updatedAt: Instant,
		val deletedAt: Instant?,
		val approvalType: String?,
		val approvalStatus: String?,
	)

	internal data class Profile(val userId: String, val name: String, val email: String, val dept: String, val phone: String, val sysRoles: List<String>)

	internal data class Lawyer(val name: String, val email: String, val firm: String)

	internal fun counselId(jdbc: NamedParameterJdbcTemplate, viewCode: String): Long? =
		jdbc.query("select id from counsel_bcounsel where view_code = :code order by isdeleted, id desc limit 1", mapOf("code" to viewCode)) { rs, _ -> rs.getLong(1) }.firstOrNull()

	internal fun labels(setCode: String): Map<String, String> = enums.findDetail(setCode)?.values?.associate { it.code to it.label }.orEmpty()

	private fun db(): BizDatabase = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")

	private fun escapeLike(s: String) = s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

	private data class Base(
		val id: Long,
		val viewCode: String,
		val title: String,
		val status: String,
		val createdAt: Instant,
		val updatedAt: Instant,
		val deletedAt: Instant?,
		val deleted: Boolean,
		val managed: String?,
		val counselType: String,
		val showRange: String,
		val migrated: Boolean,
	)

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()

	companion object {
		const val CREATOR = "CREATOR"
		const val DEPT = "DEPT"
		const val REVIEW = "REVIEW"
		const val FINAL = "FINAL"
		const val CIRCULATION = "CIRCULATION"
		const val RELATED = "RELATED"
		const val EXTERNAL = "EXTERNAL"
		private val APPROVAL_ROLES = setOf(DEPT, REVIEW, FINAL)

		/** 참여자 역할 이름은 enum 표에서 읽는다 */
		const val ROLE_SET = "BIZ_COUNSEL_PARTICIPANT_ROLE"

		/** counsel_bcounsel.ismanaged 가 이 값이면 최종승인이 필요한 자문 (main/CONS.py IS_COUNSEL_FINAL_APPROVAL) */
		const val FINAL_APPROVAL_REQUIRED = "IS_COUNSEL_FINAL_APPROVAL"
		val KST: ZoneId = ZoneId.of("Asia/Seoul")
	}
}
