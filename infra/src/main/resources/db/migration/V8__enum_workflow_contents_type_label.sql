-- 계약 컨텐츠 구분(아델 버전) 이름과 선택값 표기 정리
update enum_values set label = '계약문서 형식'
where set_id = (select id from enum_sets where set_code = 'BIZ_WORKFLOW_ITEM') and value_code = '17';
update enum_values set label = '전자 계약서'
where set_id = (select id from enum_sets where set_code = 'BIZ_WF_CONTENTS_TYPE') and value_code = '0';
update enum_values set label = '문서 계약서'
where set_id = (select id from enum_sets where set_code = 'BIZ_WF_CONTENTS_TYPE') and value_code = '1';
