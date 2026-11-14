-- V6 보완: 부서장 승인 '0' 값, 서명 방식 '종이날인' 표기 통일, on/off 항목 선택값 표.
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'0',null,'필요 없음','실제 데이터에 0 이 저장되어 있다 (Confluence 에는 3=필요 없음). 코드는 1, 2 만 승인 필요로 취급한다',30 from enum_sets where set_code='BIZ_WF_DEPT_CONFIRM';
update enum_values set remark = replace(remark, '수기날인', '종이날인') where remark like '%수기날인%' and set_id = (select id from enum_sets where set_code='BIZ_WORKFLOW_ITEM');
update enum_values set remark = replace(remark, '1, 2=필요, 3=필요 없음.', '1, 2=필요, 3, 0=필요 없음.') where set_id = (select id from enum_sets where set_code='BIZ_WORKFLOW_ITEM') and value_code='10';
insert into enum_sets (set_code,set_name,description,sort_order) values ('BIZ_WF_ON_OFF','워크플로우 on/off','1=on, 빈 문자열=off 와 True/False 로 저장되는 항목 공용. 별칭(비활성)은 저장 값을 읽기 위한 것이다',900);
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'1',null,'on',null,0,true from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'',null,'off',null,10,true from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'0',null,'off','별칭: 저장 값을 읽기 위한 것',20,false from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'true',null,'on','별칭: 저장 값을 읽기 위한 것',30,false from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'True',null,'on','별칭: 저장 값을 읽기 위한 것',40,false from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'false',null,'off','별칭: 저장 값을 읽기 위한 것',50,false from enum_sets where set_code='BIZ_WF_ON_OFF';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order,is_active) select id,null,'False',null,'off','별칭: 저장 값을 읽기 위한 것',60,false from enum_sets where set_code='BIZ_WF_ON_OFF';
update enum_values set child_set_id = (select id from enum_sets where set_code='BIZ_WF_ON_OFF') where set_id = (select id from enum_sets where set_code='BIZ_WORKFLOW_ITEM') and value_code in ('3','11','12','13','14','15','19','20','21','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','50','51','52');
