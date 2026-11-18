-- 작업 분류를 category1(영역) / category2(세부 영역) 두 단계로 나눈다.
-- CONFIG, SESSION 은 고객사 정보(COMPANY)의 세부 영역(컨피그, 실시간 접속 유저)으로 옮긴다.
alter table operation_logs drop constraint ck_operation_logs_category;
alter table operation_targets drop constraint ck_operation_targets_type;

alter table operation_logs rename column operation_category to operation_category1;
alter table operation_logs add column operation_category2 varchar(50);

update operation_logs set operation_category2 = 'COMPANY_CONFIG', operation_category1 = 'COMPANY' where operation_category1 = 'CONFIG';
update operation_logs set operation_category2 = 'COMPANY_LIVE_USER', operation_category1 = 'COMPANY' where operation_category1 = 'SESSION';
update operation_targets set target_type = 'COMPANY' where target_type in ('CONFIG', 'SESSION');

-- 이미 남은 이력의 세부 영역은 바뀐 항목으로 짐작하지 않고 비워 둔다 (새 이력부터 채운다)
alter table operation_logs add constraint ck_operation_logs_category1 check (operation_category1 in
    ('COMPANY', 'CONTRACT', 'COUNSEL', 'LAWSUIT', 'USER', 'ERROR_REPORT'));
alter table operation_targets add constraint ck_operation_targets_type check (target_type in
    ('COMPANY', 'CONTRACT', 'COUNSEL', 'LAWSUIT', 'USER', 'ERROR_REPORT'));
alter table operation_logs add constraint ck_operation_logs_category2 check (operation_category2 is null or operation_category2 in
    ('COMPANY_BASIC', 'COMPANY_CONFIG', 'COMPANY_LIVE_USER',
     'CONTRACT_BASIC', 'CONTRACT_MEMBER', 'CONTRACT_WORKFLOW_HISTORY_EMAIL',
     'COUNSEL_BASIC', 'COUNSEL_MEMBER', 'COUNSEL_PROCESS_HISTORY_EMAIL', 'COUNSEL_COMMENT',
     'LAWSUIT_BASIC', 'LAWSUIT_MEMBER', 'LAWSUIT_HISTORY_EMAIL',
     'USER_INFO', 'USER_EXPORT', 'USER_TRANSFER_CONTRACT', 'USER_TRANSFER_COUNSEL', 'USER_TRANSFER_LAWSUIT',
     'ERROR_REPORT_CONTRACT', 'ERROR_REPORT_COUNSEL'));
alter index idx_operation_logs_category_type_occurred rename to idx_operation_logs_category1_type_occurred;
