-- 서명 방식: 문서(Confluence)에 없던 값을 Biz 코드(main/CONS.py SIG_MTD_*)에서 보충한다.
update enum_values set const_name = 'CONTOR_RES_NOEDIT' where const_name = 'CONTOR_USER_CONFIRM' and value_code = '32';
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'2','SIG_MTD_DIGSTAMP','디지털 직인','Confluence 문서에 없음 - main/CONS.py 에서 보충',100 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'5','SIG_MTD_PIC','사진 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',110 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'6','SIG_MTD_REJECT','서명 거절','Confluence 문서에 없음 - main/CONS.py 에서 보충',120 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'7','SIG_MTD_STAMP','도장 이미지 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',130 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'8','SIG_MTD_VIEW','뷰어만 가능','Confluence 문서에 없음 - main/CONS.py 에서 보충',140 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'9','SIG_MTD_SIGN_AUTO_APPEND','업체수기날인 (docx에 사인이미지 자동삽입)','Confluence 문서에 없음 - main/CONS.py 에서 보충',150 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'10','SIG_MTD_GROUP_SIGN_SKIP','그룹사인완료','Confluence 문서에 없음 - main/CONS.py 에서 보충',160 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'11','SIG_MTD_AFFIXING_NO_NEED','서명부서 담당자 서명 필요 없음','Confluence 문서에 없음 - main/CONS.py 에서 보충',170 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'12','SIG_MTD_AFFIXING_PAPER','서명부서 담당자 종이에 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',180 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'13','SIG_MTD_AFFIXING_SCAN_REG','서명부서 담당자 스캔본 등록','Confluence 문서에 없음 - main/CONS.py 에서 보충',190 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'14','SIG_MTD_AFFIXING_SEAL_CHK','서명부서 담당자 날인 확인','Confluence 문서에 없음 - main/CONS.py 에서 보충',200 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'15','SIG_MTD_AFFIXING_COLLECT','서명부서 담당자 원본회수','Confluence 문서에 없음 - main/CONS.py 에서 보충',210 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'20','SIG_MTD_SEAL_SIGN_OFFLINE','서명프로세스의 오프라인 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',220 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'21','SIG_MTD_SEAL_SIGN_PDF','서명프로세스의 전자날인 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',230 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;
insert into enum_values (set_id,value_code,const_name,label,remark,sort_order) select es.id,'22','SIG_MTD_ELEC_SEAL','전자 인감 서명','Confluence 문서에 없음 - main/CONS.py 에서 보충',240 from enum_sets es where es.set_code='BIZ_SIGN_METHOD' on conflict do nothing;

-- 참여자 언어(contract_bcontractor.language)는 KOR 이 아니라 ko/en/ja/zh 소문자 코드를 쓴다 (main/CONS.py LANGUAGE_KO 등).
insert into enum_sets (set_code, set_name, description, sort_order)
values ('BIZ_LANGUAGE_CODE', '언어 코드', 'contract_bcontractor.language (main/CONS.py LANGUAGE_KO 등)', 55);
insert into enum_values (set_id, value_code, const_name, label, sort_order)
select es.id, v.code, v.const_name, v.label, v.sort_order
from enum_sets es,
     (values ('ko', 'LANGUAGE_KO', '한국어', 0), ('en', 'LANGUAGE_EN', '영어', 10), ('ja', 'LANGUAGE_JA', '일본어', 20), ('zh', 'LANGUAGE_ZH', '중국어', 30)) as v (code, const_name, label, sort_order)
where es.set_code = 'BIZ_LANGUAGE_CODE';
