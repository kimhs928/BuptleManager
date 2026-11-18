-- 작업 분류 LITIGATION 을 LAWSUIT 으로 바꾼다 (Biz 의 소송 용어와 맞춤)
alter table operation_logs drop constraint ck_operation_logs_category;
alter table operation_targets drop constraint ck_operation_targets_type;

update operation_logs set operation_category = 'LAWSUIT' where operation_category = 'LITIGATION';
update operation_targets set target_type = 'LAWSUIT' where target_type = 'LITIGATION';

alter table operation_logs add constraint ck_operation_logs_category check (operation_category in
    ('COMPANY', 'CONTRACT', 'COUNSEL', 'LAWSUIT', 'USER', 'CONFIG', 'SESSION', 'ERROR_REPORT'));
alter table operation_targets add constraint ck_operation_targets_type check (target_type in
    ('COMPANY', 'CONTRACT', 'COUNSEL', 'LAWSUIT', 'USER', 'CONFIG', 'SESSION', 'ERROR_REPORT'));
