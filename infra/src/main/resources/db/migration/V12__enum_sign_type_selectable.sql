-- 계약서에서 실제로 고르는 서명 종류 4개만 묶은 표 (화면의 서명 종류 선택지).
-- 값과 이름은 BIZ_SIGN_METHOD 에서 그대로 복사한다 (참여 유저에 저장된 이름과 맞아야 한다).
insert into enum_sets (set_code,set_name,description,sort_order)
values ('BIZ_SIGN_TYPE_SELECTABLE','서명 종류 (선택 가능)','화면에서 고를 수 있는 서명 종류. BIZ_SIGN_METHOD 중 SMS 인증, 공동인증서, 디지털 직인, 수기서명 4개',35);
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order)
select (select id from enum_sets where set_code='BIZ_SIGN_TYPE_SELECTABLE'), null, v.value_code, v.const_name, v.label, v.remark,
       case v.value_code when '0' then 0 when '1' then 10 when '2' then 20 else 30 end
from enum_values v
where v.set_id = (select id from enum_sets where set_code='BIZ_SIGN_METHOD') and v.value_code in ('0','1','2','4');
