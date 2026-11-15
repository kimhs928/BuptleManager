-- 개발용 시드로 넣었던 가짜 Biz 고객사를 지운다. 실제 Biz DB 동기화 후 Biz 에 없어서 비활성이 된 것만 지운다
-- (아직 동기화 전이거나 실제로 쓰는 고객사라면 활성 상태이므로 건드리지 않는다).
delete from company_configs
where company_id in (
    select id from companies
    where service_platform = 'BUPTLE_BIZ' and is_active = false
      and schema_name in ('acetech', 'hanil_ind', 'mirae_fin', 'daehan_eng', 'seoul_med')
);
delete from operation_companies
where company_id in (
    select id from companies
    where service_platform = 'BUPTLE_BIZ' and is_active = false
      and schema_name in ('acetech', 'hanil_ind', 'mirae_fin', 'daehan_eng', 'seoul_med')
);
delete from companies
where service_platform = 'BUPTLE_BIZ' and is_active = false
  and schema_name in ('acetech', 'hanil_ind', 'mirae_fin', 'daehan_eng', 'seoul_med');
