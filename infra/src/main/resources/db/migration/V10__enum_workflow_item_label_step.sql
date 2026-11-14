-- 워크플로우 설정 항목 이름의 '프로세스'를 '단계'로 바꾼다
update enum_values set label = replace(label, '프로세스', '단계')
where set_id = (select id from enum_sets where set_code = 'BIZ_WORKFLOW_ITEM') and label like '%프로세스%';
