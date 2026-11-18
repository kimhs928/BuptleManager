-- 유저의 시스템 내 역할 (main_userprofile 의 isAdmin, isViewer, isLawyer 플래그. 모두 false 이면 일반유저)
insert into enum_sets (set_code,set_name,description,sort_order) values ('BIZ_USER_SYSTEM_ROLE','유저 시스템 내 역할','main_userprofile 의 "isAdmin"(관리자), "isViewer"(조회자), "isLawyer"(법무검토자) 중 true 인 것. 모두 false 이면 일반유저',990);
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'ADMIN',null,'관리자','main_userprofile."isAdmin"',0 from enum_sets where set_code='BIZ_USER_SYSTEM_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'VIEWER',null,'조회자','main_userprofile."isViewer"',10 from enum_sets where set_code='BIZ_USER_SYSTEM_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'LAWYER',null,'법무검토자','main_userprofile."isLawyer"',20 from enum_sets where set_code='BIZ_USER_SYSTEM_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'NORMAL',null,'일반유저','위 플래그가 모두 false',30 from enum_sets where set_code='BIZ_USER_SYSTEM_ROLE';
