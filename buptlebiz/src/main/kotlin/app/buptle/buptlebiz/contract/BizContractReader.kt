package app.buptle.buptlebiz.contract

import app.buptle.buptlebiz.db.BizDatabase
import app.buptle.core.api.PageResponse
import app.buptle.operation.enums.EnumCatalogRepository
import java.sql.ResultSet
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import org.springframework.beans.factory.ObjectProvider
import org.springframework.stereotype.Component

/** 계약 설정값 표시용 상수 (contract_bcontractor 등에서 쓰는 코드) */
private const val CONTRACTOR_CREATOR = 0

/**
 * Biz DB 에서 계약을 읽는다 (조회 전용). 테이블 · 컬럼 대응은 데이터 매핑 엑셀의 '계약' 시트를 따른다.
 * 상태 이름과 분류는 BuptleManager 의 enum 표(BIZ_CONTRACT_STATUS)에서 가져온다.
 */
@Component
class BizContractReader(
	private val biz: ObjectProvider<BizDatabase>,
	private val enums: EnumCatalogRepository,
) {

	fun search(schema: String, q: String?, includeDeleted: Boolean, page: Int, size: Int): PageResponse<ContractSummaryResponse> {
		val statuses = statusLookup()
		val keyword = q?.trim().orEmpty()
		val where = StringBuilder("where 1=1")
		val params = mutableMapOf<String, Any?>("limit" to size, "offset" to (page - 1) * size)
		if (!includeDeleted) where.append(" and c.isdeleted = false")
		if (keyword.isNotEmpty()) {
			where.append(" and (c.view_code ilike :kw or c.name ilike :kw)")
			params["kw"] = "%${escapeLike(keyword)}%"
		}
		return db().forTenant(schema) { jdbc ->
			val total = jdbc.queryForObject("select count(*) from contract_bcontract c $where", params, Long::class.java) ?: 0L
			val items = jdbc.query(
				"""
				select c.id, c.view_code, c.name, c.status_on_workflow, c.classification, c.create_time, c.isdeleted, c.delete_time,
				       (select ct.name from contract_bcontractor ct
				         where ct.contract_id = c.id and ct.isdeleted = false and ${CONTRACTOR_CREATOR} = any(ct.classification)
				         order by ct.id limit 1) as creator_name,
				       (select count(*) from contract_bcontractor ct where ct.contract_id = c.id and ct.isdeleted = false) as members
				from contract_bcontract c
				$where
				order by c.create_time desc, c.id desc
				limit :limit offset :offset
				""".trimIndent(),
				params,
			) { rs, _ ->
				ContractSummaryResponse(
					id = rs.getString("view_code"),
					name = rs.getString("name").orEmpty(),
					status = statuses.of(rs.getInt("status_on_workflow")),
					kind = kindText(rs.getInt("classification")),
					creatorName = rs.getString("creator_name").orEmpty(),
					members = rs.getInt("members"),
					createdAt = rs.instant("create_time")?.atZone(KST)?.toLocalDate() ?: LocalDate.EPOCH,
					deleted = rs.getBoolean("isdeleted"),
					deletedAt = rs.instant("delete_time"),
					deletedBy = null,
					recent = false,
				)
			}
			PageResponse(items, page, size, total)
		}
	}

	/** view_code 로 계약 1건. 없으면 null */
	fun detail(schema: String, viewCode: String): ContractDetailResponse? {
		val statuses = statusLookup()
		return db().forTenant(schema) { jdbc ->
			val row = jdbc.query(
				"""
				select c.id, c.view_code, c.name, c.description, c.valid_from, c.valid_until, c.amount_finance, c.language_type,
				       c.status_on_workflow, c.isdeleted, c.create_time, c.update_time, c.delete_time, c.migrated,
				       c."isAutoUpdateValid" as auto_renew, c.classification, c.template_id
				from contract_bcontract c
				where c.view_code = :code
				order by c.isdeleted, c.id desc
				limit 1
				""".trimIndent(),
				mapOf("code" to viewCode),
			) { rs, _ ->
				Row(
					rs.getLong("id"),
					rs.getString("view_code"),
					rs.getString("name").orEmpty(),
					rs.getString("description").orEmpty(),
					rs.instant("valid_from")?.atZone(KST)?.toLocalDate(),
					rs.instant("valid_until")?.atZone(KST)?.toLocalDate(),
					rs.getBigDecimal("amount_finance")?.toLong() ?: 0L,
					rs.getString("language_type"),
					rs.getInt("status_on_workflow"),
					rs.getBoolean("isdeleted"),
					rs.instant("create_time") ?: Instant.EPOCH,
					rs.instant("update_time") ?: Instant.EPOCH,
					rs.instant("delete_time"),
					rs.getBoolean("migrated"),
					rs.getBoolean("auto_renew"),
					rs.getInt("classification"),
					rs.getObject("template_id") as? Number,
				)
			}.firstOrNull() ?: return@forTenant null

			val documents = documents(jdbc, row.id)
			val template = row.templateId?.let { template(jdbc, it.toLong()) }
			ContractDetailResponse(
				contract = ContractInfoResponse(
					id = row.viewCode,
					idPlain = row.viewCode.filter { it.isDigit() },
					name = row.name,
					summary = row.description,
					startDate = row.validFrom,
					endDate = row.validUntil,
					amount = row.amount,
					lang = langCode(row.languageType),
					status = statuses.of(row.status),
					deleted = row.deleted,
					createdAt = row.createdAt,
					updatedAt = row.updatedAt,
					deletedAt = row.deletedAt,
					migration = row.migrated,
					kind = if (row.classification == CLASSIFICATION_PAPER) ContractKind.DOCUMENT else ContractKind.ELECTRONIC,
					signType = "",
					grade = ContractGrade.NORMAL,
					autoRenew = row.autoRenew,
					documents = documents,
				),
				template = template,
				recentHistory = RecentHistoryResponse(total = 0, items = emptyList()),
			)
		}
	}

	private fun documents(jdbc: org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate, contractId: Long): List<ContractDocumentResponse> {
		val params = mapOf("id" to contractId)
		val finals = jdbc.query(
			"""
			select d.id, coalesce(nullif(d.file_name, ''), nullif(d.scanfile_name, ''), nullif(d.online_pdf_name, ''), '') as name
			from contract_bdocument d
			where d.contract_id = :id and d.isdeleted = false and d.status = 1
			order by d.id desc limit 1
			""".trimIndent(),
			params,
		) { rs, _ -> ContractDocumentResponse("d${rs.getLong("id")}", rs.getString("name"), "FINAL") }
		val attachments = jdbc.query(
			"""
			select a.id, a.name from main_battachment a
			where a.isdeleted = false and a.contract_id = :id
			order by a.id
			""".trimIndent(),
			params,
		) { rs, _ -> ContractDocumentResponse("a${rs.getLong("id")}", rs.getString("name").orEmpty(), "ATTACHMENT") }
		return finals + attachments
	}

	private fun template(jdbc: org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate, templateId: Long): ContractTemplateResponse? =
		jdbc.query(
			"""
			select t.name, coalesce(t.description, '') as description, (t.is_file_option = '1') as draft_upload, t.filename,
			       f.name as category, p.name as category_parent
			from contract_btemplate t
			left join contract_btemplate f on f.id = t.parent_folder_id
			left join contract_btemplate p on p.id = f.parent_folder_id
			where t.id = :id
			""".trimIndent(),
			mapOf("id" to templateId),
		) { rs, _ ->
			ContractTemplateResponse(
				name = rs.getString("name").orEmpty(),
				categoryParent = rs.getString("category_parent").orEmpty(),
				category = rs.getString("category").orEmpty(),
				description = rs.getString("description"),
				draftUpload = rs.getBoolean("draft_upload"),
				draftUploadLabel = null,
				draftFile = rs.getString("filename"),
			)
		}.firstOrNull()

	private fun db(): BizDatabase = biz.ifAvailable ?: throw IllegalStateException("Biz DB 가 연결되어 있지 않습니다 (BIZ_DB_URL).")

	/** 상태 코드 → 이름 · 분류. enum 표에 없는 코드는 코드 번호를 이름으로 쓴다 */
	private fun statusLookup(): StatusLookup {
		val detail = enums.findDetail(STATUS_SET)
		val groups = detail?.groups?.associateBy { it.code }.orEmpty()
		val byCode = detail?.values?.associateBy { it.code }.orEmpty()
		return StatusLookup { code ->
			val v = byCode[code.toString()]
			ContractStatusInfo(code, v?.label ?: code.toString(), v?.groupCode, v?.groupCode?.let { groups[it]?.name })
		}
	}

	private fun interface StatusLookup {
		fun of(code: Int): ContractStatusInfo
	}

	private data class Row(
		val id: Long,
		val viewCode: String,
		val name: String,
		val description: String,
		val validFrom: LocalDate?,
		val validUntil: LocalDate?,
		val amount: Long,
		val languageType: String?,
		val status: Int,
		val deleted: Boolean,
		val createdAt: Instant,
		val updatedAt: Instant,
		val deletedAt: Instant?,
		val migrated: Boolean,
		val autoRenew: Boolean,
		val classification: Int,
		val templateId: Number?,
	)

	private fun ResultSet.instant(column: String): Instant? = getTimestamp(column)?.toInstant()

	private fun kindText(classification: Int) = if (classification == CLASSIFICATION_PAPER) "문서 · 종이서명" else "전자 · 전자서명"

	/** Biz 의 language_type (KOR/ENG/JPN …) → API 언어 코드. 대응 값이 없으면 ko */
	private fun langCode(type: String?) = when (type) {
		"ENG" -> "en"
		"JPN" -> "ja"
		else -> "ko"
	}

	private fun escapeLike(s: String) = s.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")

	companion object {
		const val STATUS_SET = "BIZ_CONTRACT_STATUS"
		private const val CLASSIFICATION_PAPER = 1
		private val KST: ZoneId = ZoneId.of("Asia/Seoul")
	}
}
