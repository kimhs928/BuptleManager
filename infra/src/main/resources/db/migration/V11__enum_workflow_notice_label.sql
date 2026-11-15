-- 4번 항목(default_contract_info) 이름을 '공지사항'으로 바꾼다
update enum_values set label = '공지사항'
where set_id = (select id from enum_sets where set_code = 'BIZ_WORKFLOW_ITEM') and value_code = '4';
