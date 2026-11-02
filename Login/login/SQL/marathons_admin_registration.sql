-- 마라톤 관리자 등록 기능용 마이그레이션 (PostgreSQL / Supabase)
-- 실행 순서: 이 SQL을 먼저 적용한 뒤에 백엔드를 배포하세요.
-- (prod 설정이 ddl-auto=validate 라서 source_type 컬럼이 없으면 서버가 기동되지 않습니다.)

-- 1) 백업 (되돌릴 수 있게)
create table if not exists marathons_backup_20261102 as table marathons;

-- 2) 등록 경로 컬럼. 기존 데이터는 모두 'legacy', 관리자가 직접 등록하면 'admin'
alter table marathons
  add column if not exists source_type text not null default 'legacy';

-- 3) RLS 켜기
--    - 기존 공개 읽기(SELECT) 정책 2개가 이미 있어 사이트 조회는 그대로 동작합니다.
--    - 쓰기 정책이 없으므로 anon 키로는 등록/수정/삭제가 불가능합니다.
--    - Spring 서버는 postgres 계정으로 접속하므로 RLS의 영향을 받지 않고 관리자 API로만 쓰기가 가능합니다.
alter table marathons enable row level security;

-- 4) 관리자 계정 지정 (현재 ROLE_ADMIN 계정이 없습니다)
--    '본인아이디'를 users.username 값으로 바꿔서 실행한 뒤, 사이트에서 로그아웃 후 다시 로그인하세요.
-- insert into user_auth (username, auth) values ('본인아이디', 'ROLE_ADMIN');
