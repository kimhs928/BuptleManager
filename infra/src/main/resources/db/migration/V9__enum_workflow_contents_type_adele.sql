-- 17번 항목(아델 버전)을 1번 항목(계약문서 형식)과 구분한다
update enum_values set label = '계약문서 형식(아델)'
where set_id = (select id from enum_sets where set_code = 'BIZ_WORKFLOW_ITEM') and value_code = '17';
