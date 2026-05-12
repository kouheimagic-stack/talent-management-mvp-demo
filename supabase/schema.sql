create type app_role as enum ('self', 'manager', 'hr', 'admin');

create table employees (
  id uuid primary key default gen_random_uuid(),
  employee_code text not null unique,
  photo_path text,
  full_name text not null,
  full_name_kana text,
  email text not null unique,
  department text not null,
  position text not null,
  grade text,
  location text,
  joined_on date not null,
  manager_employee_id uuid references employees(id),
  employment_status text not null default 'active',
  career_stage text,
  ai_summary text,
  strengths text[] not null default '{}',
  development_areas text[] not null default '{}',
  one_on_one_readiness integer not null default 0 check (one_on_one_readiness between 0 and 100),
  engagement integer not null default 0 check (engagement between 0 and 100),
  growth_velocity integer not null default 0 check (growth_velocity between 0 and 100),
  risk_level text not null default 'low',
  focus_theme text,
  recommended_action text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key,
  employee_id uuid references employees(id),
  email text not null unique,
  full_name text not null,
  role app_role not null default 'self',
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parent_organization_id uuid references organizations(id),
  created_at timestamptz not null default now()
);

create table organization_members (
  organization_id uuid not null references organizations(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  primary key (organization_id, employee_id)
);

create table manager_relations (
  manager_employee_id uuid not null references employees(id) on delete cascade,
  member_employee_id uuid not null references employees(id) on delete cascade,
  relation_type text not null default 'direct',
  primary key (manager_employee_id, member_employee_id)
);

create table employee_profiles (
  employee_id uuid primary key references employees(id) on delete cascade,
  self_introduction text,
  strengths text[] not null default '{}',
  public_career_note text,
  career_visibility text not null default 'public',
  updated_at timestamptz not null default now()
);

create table employee_profile_visibility (
  employee_id uuid not null references employees(id) on delete cascade,
  field_key text not null,
  visibility text not null default 'private' check (visibility in ('public', 'private', 'restricted')),
  updated_at timestamptz not null default now(),
  primary key (employee_id, field_key)
);

create table profile_visibility (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  field_name text not null,
  visibility_status text not null default 'private' check (visibility_status in ('public', 'private', 'restricted')),
  updated_at timestamptz not null default now(),
  unique (employee_id, field_name)
);

create table user_profiles (
  id uuid primary key,
  employee_id uuid references employees(id),
  role app_role not null default 'self',
  created_at timestamptz not null default now()
);

create table self_updates (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  current_work text,
  blockers text,
  future_aspirations text,
  skills_to_grow text[] not null default '{}',
  mobility_preference text,
  pre_meeting_memo text,
  self_rating text,
  goal_progress_note text,
  updated_by uuid references users(id),
  updated_at timestamptz not null default now()
);

create table career_histories (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  company text not null,
  title text not null,
  started_on date not null,
  ended_on date,
  summary text,
  skills text[] not null default '{}'
);

create table certifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  name text not null,
  issuer text,
  acquired_on date,
  expires_on date
);

create table qualifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  name text not null,
  issuer text,
  acquired_on date,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'restricted'))
);

create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by uuid references users(id),
  role app_role not null default 'employee',
  status text not null default 'sent' check (status in ('sent', 'accepted', 'expired', 'revoked')),
  token_hash text,
  sent_at timestamptz not null default now(),
  accepted_at timestamptz
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  action text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table user_import_logs (
  id uuid primary key default gen_random_uuid(),
  imported_by uuid references users(id),
  file_name text not null,
  total_rows integer not null default 0,
  success_count integer not null default 0,
  error_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table user_import_rows (
  id uuid primary key default gen_random_uuid(),
  import_log_id uuid not null references user_import_logs(id) on delete cascade,
  row_number integer not null,
  email text,
  status text not null check (status in ('new', 'updated', 'skipped', 'error')),
  error_message text
);

create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('employee_manager', 'meeting', 'action_item')),
  employee_id uuid references employees(id) on delete cascade,
  manager_id uuid references users(id),
  meeting_id uuid references meetings(id) on delete cascade,
  action_item_id uuid references action_items(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads(id) on delete cascade,
  sender_id uuid references users(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table performance_reviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  period text not null,
  rating text not null,
  score numeric(3, 1),
  reviewer_employee_id uuid references employees(id),
  summary text,
  salary_band text,
  is_sensitive boolean not null default true,
  created_at timestamptz not null default now()
);

create table goals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  title text not null,
  progress integer not null default 0 check (progress between 0 and 100),
  due_on date,
  owner_employee_id uuid references employees(id),
  created_at timestamptz not null default now()
);

create table employee_photos (
  employee_id uuid primary key references employees(id) on delete cascade,
  storage_bucket text not null default 'employee-photos',
  storage_path text not null,
  updated_at timestamptz not null default now()
);

create table interviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  interviewer_employee_id uuid references employees(id),
  held_on date not null,
  topic text not null,
  memo text,
  action_items text[] not null default '{}',
  ai_summary text,
  ai_output jsonb
);

create table meetings (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  manager_user_id uuid references users(id),
  purpose text not null,
  memo text,
  decisions text,
  next_meeting_on date,
  created_at timestamptz not null default now()
);

create table meeting_ai_outputs (
  id uuid primary key default gen_random_uuid(),
  interview_id uuid references interviews(id) on delete cascade,
  employee_id uuid not null references employees(id) on delete cascade,
  feature text not null check (feature in ('meeting_summary', 'development_plan')),
  model text not null,
  input_hash text not null,
  output jsonb not null,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);

create table action_items (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  meeting_id uuid references meetings(id) on delete set null,
  manager_user_id uuid references users(id),
  title text not null,
  owner text not null,
  due_on date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  review_in_next_meeting boolean not null default true,
  comment text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table career_preferences (
  employee_id uuid primary key references employees(id) on delete cascade,
  desired_role text,
  desired_department text,
  mobility text,
  skills_to_develop text[] not null default '{}',
  notes text,
  updated_at timestamptz not null default now()
);

create table career_goals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  title text not null,
  desired_role text,
  progress integer not null default 0 check (progress between 0 and 100),
  target_on date,
  updated_at timestamptz not null default now()
);

create table manager_assignments (
  manager_employee_id uuid not null references employees(id) on delete cascade,
  member_employee_id uuid not null references employees(id) on delete cascade,
  can_view_sensitive boolean not null default false,
  primary key (manager_employee_id, member_employee_id)
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  subject_user_id uuid references users(id),
  employee_id uuid references employees(id),
  can_view_sensitive boolean not null default false,
  can_edit_self_update boolean not null default false,
  can_edit_meeting boolean not null default false,
  created_at timestamptz not null default now()
);

create table ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id),
  feature text not null,
  input_hash text not null,
  output jsonb,
  created_by uuid references user_profiles(id),
  created_at timestamptz not null default now()
);

create table development_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  theme text not null,
  hypothesis text,
  milestones jsonb not null default '[]'::jsonb,
  manager_actions text[] not null default '{}',
  employee_actions text[] not null default '{}',
  success_metrics text[] not null default '{}',
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table employee_signals (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  signal_type text not null,
  score integer not null check (score between 0 and 100),
  reason text,
  source text not null default 'manual',
  observed_at timestamptz not null default now()
);

create table integrations (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('slack', 'line_works', 'task')),
  workspace_key text,
  settings jsonb not null default '{}'::jsonb,
  enabled boolean not null default false,
  created_at timestamptz not null default now()
);
