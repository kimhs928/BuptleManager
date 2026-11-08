package app.buptle.infra.enums

import app.buptle.operation.enums.EnumCatalogRepository
import app.buptle.operation.enums.EnumGroup
import app.buptle.operation.enums.EnumSet
import app.buptle.operation.enums.EnumSetDetail
import app.buptle.operation.enums.EnumValue
import app.buptle.operation.enums.EnumValueCreate
import app.buptle.operation.enums.EnumValueUpdate
import org.springframework.jdbc.core.simple.JdbcClient
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
@Transactional(readOnly = true)
class EnumCatalogRepositoryAdapter(
	private val jdbc: JdbcClient,
) : EnumCatalogRepository {

	override fun findSets(): List<EnumSet> = jdbc.sql(
		"""
		select s.set_code, s.set_name, s.description,
		       (select count(*) from enum_values v where v.set_id = s.id) as value_count
		from enum_sets s order by s.sort_order, s.set_code
		""".trimIndent(),
	).query { rs, _ -> EnumSet(rs.getString("set_code"), rs.getString("set_name"), rs.getString("description"), rs.getInt("value_count")) }.list()

	override fun findDetail(setCode: String): EnumSetDetail? {
		val set = findSets().firstOrNull { it.code == setCode } ?: return null
		val groups = jdbc.sql(
			"select g.group_code, g.group_name, g.sort_order from enum_groups g join enum_sets s on s.id = g.set_id where s.set_code = :set order by g.sort_order, g.id",
		).param("set", setCode).query { rs, _ -> EnumGroup(rs.getString("group_code"), rs.getString("group_name"), rs.getInt("sort_order")) }.list()
		return EnumSetDetail(set, groups, values(setCode))
	}

	@Transactional
	override fun updateValue(setCode: String, valueId: Long, update: EnumValueUpdate): EnumValue? {
		val groupId = groupId(setCode, update.groupCode)
		val changed = jdbc.sql(
			"""
			update enum_values v set label = :label, remark = :remark, group_id = :groupId,
			       sort_order = :sortOrder, is_active = :active, updated_at = now()
			from enum_sets s where s.id = v.set_id and s.set_code = :set and v.id = :id
			""".trimIndent(),
		)
			.param("label", update.label).param("remark", update.remark).param("groupId", groupId, java.sql.Types.BIGINT)
			.param("sortOrder", update.sortOrder).param("active", update.active)
			.param("set", setCode).param("id", valueId)
			.update()
		return if (changed == 0) null else values(setCode).firstOrNull { it.id == valueId }
	}

	@Transactional
	override fun createValue(setCode: String, create: EnumValueCreate): EnumValue? {
		if (values(setCode).any { it.code == create.code }) return null
		val groupId = groupId(setCode, create.groupCode)
		val id = jdbc.sql(
			"""
			insert into enum_values (set_id, group_id, value_code, const_name, label, remark, sort_order)
			select s.id, :groupId, :code, :constName, :label, :remark,
			       coalesce(:sortOrder, (select coalesce(max(sort_order), 0) + 10 from enum_values where set_id = s.id))
			from enum_sets s where s.set_code = :set
			returning id
			""".trimIndent(),
		)
			.param("groupId", groupId, java.sql.Types.BIGINT).param("code", create.code).param("constName", create.constName)
			.param("label", create.label).param("remark", create.remark).param("sortOrder", create.sortOrder, java.sql.Types.INTEGER)
			.param("set", setCode)
			.query(Long::class.java).single()
		return values(setCode).first { it.id == id }
	}

	@Transactional
	override fun renameGroup(setCode: String, groupCode: String, name: String): EnumGroup? {
		val changed = jdbc.sql(
			"update enum_groups g set group_name = :name from enum_sets s where s.id = g.set_id and s.set_code = :set and g.group_code = :group",
		).param("name", name).param("set", setCode).param("group", groupCode).update()
		if (changed == 0) return null
		return findDetail(setCode)?.groups?.firstOrNull { it.code == groupCode }
	}

	private fun values(setCode: String): List<EnumValue> = jdbc.sql(
		"""
		select v.id, v.value_code, v.const_name, v.label, v.remark, g.group_code, v.sort_order, v.is_active
		from enum_values v
		join enum_sets s on s.id = v.set_id
		left join enum_groups g on g.id = v.group_id
		where s.set_code = :set
		order by v.sort_order, v.id
		""".trimIndent(),
	).param("set", setCode).query { rs, _ ->
		EnumValue(
			rs.getLong("id"), rs.getString("value_code"), rs.getString("const_name"), rs.getString("label"),
			rs.getString("remark"), rs.getString("group_code"), rs.getInt("sort_order"), rs.getBoolean("is_active"),
		)
	}.list()

	private fun groupId(setCode: String, groupCode: String?): Long? {
		if (groupCode.isNullOrBlank()) return null
		return jdbc.sql("select g.id from enum_groups g join enum_sets s on s.id = g.set_id where s.set_code = :set and g.group_code = :group")
			.param("set", setCode).param("group", groupCode).query(Long::class.java).optional().orElse(null)
	}
}
