-- 자문 참여자 역할 (Confluence 10.03 BuptleBiz - 자문 > 자문 참여 유저). 값은 코드에서 쓰는 출처 구분이다.
insert into enum_sets (set_code,set_name,description,sort_order) values ('BIZ_COUNSEL_PARTICIPANT_ROLE','자문 참여자 역할','참여자가 어느 테이블에서 왔는지(기안자=counsel_bcounsel.creator, 부서장/검토자/최종승인자=counsel_bapproval, 회람인, 관련인, 외부변호사)에 따른 역할',980);
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'CREATOR',null,'요청자','counsel_bcounsel.creator',0 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'DEPT','COUNSEL_APPR_TYPE_DEPT','부서장','counsel_bapproval.approval_type = DEPT',10 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'REVIEW','COUNSEL_APPR_TYPE_REVIEW','검토자','counsel_bapproval.approval_type = REVIEW',20 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'FINAL','COUNSEL_APPR_TYPE_FINAL','최종승인자','counsel_bapproval.approval_type = FINAL',30 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'CIRCULATION',null,'회람인','counsel_bcounsel_circulation',40 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'RELATED',null,'참조','counsel_bcounsel_related (approval_type = RELATED)',50 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';
insert into enum_values (set_id,group_id,value_code,const_name,label,remark,sort_order) select id,null,'EXTERNAL',null,'외부 변호사','counsel_bcounsel_external_lawyer',60 from enum_sets where set_code='BIZ_COUNSEL_PARTICIPANT_ROLE';

-- 코멘트 종류는 질문/답변 두 가지만 고른다. '등록'은 질문/답변이 아닐 때의 기본값이라 선택지에서 뺀다.
update enum_values set is_active = false
where set_id = (select id from enum_sets where set_code = 'BIZ_COUNSEL_CONTENT_STATUS') and value_code = 'REGISTERED';
