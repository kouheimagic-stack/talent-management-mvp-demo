-- MVP 0 Supabase移行 Phase 1
-- 目的: Supabase Auth / user_profiles / employees の紐づけと基本情報取得を安定させる。
-- 注意: auth.users へは直接insertしません。Supabase Authでユーザー作成後、そのUUIDを user_profiles.auth_user_id に登録します。

create extension if not exists pgcrypto;

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  name text not null,
  name_kana text,
  email text not null unique,
  department text not null,
  team text,
  position text,
  grade text,
  joined_on date,
  employment_status text not null default 'active' check (employment_status in ('active', 'leave', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  employee_id uuid not null unique references employees(id) on delete cascade,
  role text not null default 'employee' check (role in ('employee', 'manager', 'hr', 'admin')),
  account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists employee_profiles (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references employees(id) on delete cascade,
  photo_path text,
  photo_url text,
  self_introduction text,
  current_work text,
  career_history_text text,
  qualifications_text text,
  strengths_text text,
  skills_to_grow_text text,
  desired_career_public text,
  desired_career_private text,
  mobility_preference text,
  pre_meeting_memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profile_visibility (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  field_name text not null,
  visibility_status text not null default 'private' check (visibility_status in ('public', 'private', 'fixed_private')),
  updated_at timestamptz not null default now(),
  unique (employee_id, field_name)
);

alter table employees enable row level security;
alter table user_profiles enable row level security;
alter table employee_profiles enable row level security;
alter table profile_visibility enable row level security;

drop policy if exists "select own user profile" on user_profiles;
create policy "select own user profile"
on user_profiles
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "select active employees" on employees;
create policy "select active employees"
on employees
for select
to authenticated
using (employment_status = 'active');

drop policy if exists "select own employee profile" on employee_profiles;
create policy "select own employee profile"
on employee_profiles
for select
to authenticated
using (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
);

drop policy if exists "upsert own employee profile" on employee_profiles;
create policy "upsert own employee profile"
on employee_profiles
for all
to authenticated
using (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
)
with check (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
);

drop policy if exists "select own profile visibility" on profile_visibility;
create policy "select own profile visibility"
on profile_visibility
for select
to authenticated
using (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
);

drop policy if exists "upsert own profile visibility" on profile_visibility;
create policy "upsert own profile visibility"
on profile_visibility
for all
to authenticated
using (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
)
with check (
  employee_id in (
    select employee_id
    from user_profiles
    where auth_user_id = auth.uid()
  )
);

-- デモ社員データ例
insert into employees (
  employee_code,
  name,
  name_kana,
  email,
  department,
  team,
  position,
  grade,
  joined_on,
  employment_status
)
values
  ('DEMO-0001', '一般社員 デモ', 'イッパンシャイン デモ', 'employee@example.com', 'プロダクト開発部', 'アプリチーム', 'メンバー', 'G2', '2023-04-01', 'active'),
  ('DEMO-0002', '上司 デモ', 'ジョウシ デモ', 'manager@example.com', 'プロダクト開発部', 'アプリチーム', 'マネージャー', 'G5', '2018-04-01', 'active'),
  ('DEMO-0003', '人事 デモ', 'ジンジ デモ', 'hr@example.com', '人事企画部', 'HRBPチーム', 'HR担当', 'G4', '2020-10-01', 'active'),
  ('DEMO-0004', '管理者 デモ', 'カンリシャ デモ', 'admin@example.com', '情報システム部', '社内基盤チーム', '管理者', 'G6', '2017-04-01', 'active'),
  ('TM-1001', '佐藤 美咲', 'サトウ ミサキ', 'misaki.sato@example.com', 'プロダクト開発部', '決済チーム', 'プロダクトマネージャー', 'G4', '2020-04-01', 'active'),
  ('TM-1034', '山本 蓮', 'ヤマモト レン', 'ren.yamamoto@example.com', 'データ戦略部', '分析基盤チーム', 'データサイエンティスト', 'G3', '2022-10-01', 'active'),
  ('TM-1088', '田中 葵', 'タナカ アオイ', 'aoi.tanaka@example.com', '人事企画部', 'HRBPチーム', 'HRビジネスパートナー', 'G4', '2019-07-01', 'active')
on conflict (employee_code) do update
set
  name = excluded.name,
  name_kana = excluded.name_kana,
  email = excluded.email,
  department = excluded.department,
  team = excluded.team,
  position = excluded.position,
  grade = excluded.grade,
  joined_on = excluded.joined_on,
  employment_status = excluded.employment_status,
  updated_at = now();

-- auth.users と user_profiles の紐づけ手順:
-- 1. Supabase Dashboard > Authentication > Users で misaki.sato@example.com を作成する。
-- 2. 作成された User UID をコピーする。
-- 3. 下の <AUTH_USER_ID> をコピーしたUIDに置き換えて実行する。
--
-- insert into user_profiles (auth_user_id, employee_id, role, account_status)
-- select
--   '<AUTH_USER_ID>'::uuid,
--   employees.id,
--   'employee',
--   'active'
-- from employees
-- where employees.email = 'misaki.sato@example.com'
-- on conflict (auth_user_id) do update
-- set employee_id = excluded.employee_id,
--     role = excluded.role,
--     account_status = excluded.account_status,
--     updated_at = now();

-- MVP 0デモユーザー4名をまとめて紐づけるSQL例:
-- 先に Supabase Dashboard > Authentication > Users で
-- employee@example.com / manager@example.com / hr@example.com / admin@example.com を作成してから実行します。
--
-- insert into user_profiles (auth_user_id, employee_id, role, account_status)
-- select
--   auth_users.id,
--   employees.id,
--   case employees.email
--     when 'employee@example.com' then 'employee'
--     when 'manager@example.com' then 'manager'
--     when 'hr@example.com' then 'hr'
--     when 'admin@example.com' then 'admin'
--   end,
--   'active'
-- from auth.users auth_users
-- join employees on lower(employees.email) = lower(auth_users.email)
-- where employees.email in (
--   'employee@example.com',
--   'manager@example.com',
--   'hr@example.com',
--   'admin@example.com'
-- )
-- on conflict (auth_user_id) do update
-- set employee_id = excluded.employee_id,
--     role = excluded.role,
--     account_status = excluded.account_status,
--     updated_at = now();
