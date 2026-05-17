# Supabase MVP 0 初期セットアップ手順

この手順は、MVP 0をSupabase Authでログインできる状態にするための開発用メモです。

## 現在のログイン方式

- ログインはSupabase Authのメールアドレス・パスワード認証を使います。
- 旧来の「このユーザーでログイン」方式はログイン処理では使っていません。
- ログイン処理は `src/app/api/auth/login/route.ts` です。
- ログイン後のユーザー判定は `src/lib/auth.ts` の `getCurrentViewer()` で行います。

ログイン時の流れ:

1. Supabase Authでメールアドレス・パスワードを確認する。
2. `auth.users.id` と一致する `user_profiles.auth_user_id` を探す。
3. `user_profiles.employee_id` と一致する `employees.id` を探す。
4. 3つが揃っていれば `/me` を表示する。

## 必要な環境変数

`.env.local` に以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
```

値を入れた後は、Next.jsの開発サーバーを再起動します。

```bash
npm run dev
```

Vercelでも同じ2つを Environment Variables に設定し、再デプロイします。

## デモユーザー

開発確認用として、以下の4ユーザーを作ります。

| ロール | メールアドレス | パスワード |
| --- | --- | --- |
| 一般社員 | employee@example.com | password123 |
| 上司 | manager@example.com | password123 |
| 人事 | hr@example.com | password123 |
| 管理者 | admin@example.com | password123 |

このパスワードは開発用です。本番では使いません。

## Step 1: テーブルを作成する

Supabase Dashboardで対象プロジェクトを開きます。

1. 左メニューの `SQL Editor` を開く。
2. `supabase/mvp0_phase1.sql` の内容を貼り付ける。
3. `Run` を押す。

これで以下が作成されます。

- `employees`
- `user_profiles`
- `employee_profiles`
- `profile_visibility`
- RLS policy
- デモ用 `employees` データ

## Step 2: Authユーザーを作成する

Supabase Dashboardで以下を行います。

1. 左メニューの `Authentication` を開く。
2. `Users` を開く。
3. `Add user` または `Create user` を押す。
4. `Auto Confirm User` を有効にする。
5. 以下を1人ずつ作成する。

- `employee@example.com` / `password123`
- `manager@example.com` / `password123`
- `hr@example.com` / `password123`
- `admin@example.com` / `password123`

## Step 3: Authユーザーと社員データを紐づける

Authユーザー作成後、SQL Editorで以下を実行します。

```sql
insert into user_profiles (auth_user_id, employee_id, role, account_status)
select
  auth_users.id,
  employees.id,
  case employees.email
    when 'employee@example.com' then 'employee'
    when 'manager@example.com' then 'manager'
    when 'hr@example.com' then 'hr'
    when 'admin@example.com' then 'admin'
  end,
  'active'
from auth.users auth_users
join employees on lower(employees.email) = lower(auth_users.email)
where employees.email in (
  'employee@example.com',
  'manager@example.com',
  'hr@example.com',
  'admin@example.com'
)
on conflict (auth_user_id) do update
set employee_id = excluded.employee_id,
    role = excluded.role,
    account_status = excluded.account_status,
    updated_at = now();
```

## Step 4: 紐づけ確認SQL

SQL Editorで以下を実行し、4行表示されればOKです。

```sql
select
  auth_users.email as auth_email,
  user_profiles.role,
  user_profiles.account_status,
  employees.employee_code,
  employees.name,
  employees.department,
  employees.position
from user_profiles
join auth.users auth_users on auth_users.id = user_profiles.auth_user_id
join employees on employees.id = user_profiles.employee_id
where auth_users.email in (
  'employee@example.com',
  'manager@example.com',
  'hr@example.com',
  'admin@example.com'
)
order by auth_users.email;
```

## ログインできない時の見方

ログイン画面のエラーと原因:

- `Supabase環境変数が未設定です`
  - `.env.local` の `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` が空、または開発サーバー未再起動。
- `メールアドレスまたはパスワードが正しくありません`
  - Supabase Authにユーザーがない、パスワードが違う、メール確認が未完了。
- `ログインユーザーに紐づくuser_profilesが見つかりません`
  - Authユーザーはあるが、`user_profiles.auth_user_id` の紐づけがない。
- `ログインユーザーに紐づくemployeesが見つかりません`
  - `user_profiles.employee_id` が存在しない `employees.id` を指している。
- `このアカウントは停止中です`
  - `user_profiles.account_status = 'suspended'` になっている。

## MVP 0で必要な3点セット

ログインできるには、必ず以下が揃っている必要があります。

1. Supabase Authのユーザー
2. `employees` の社員データ
3. `user_profiles` の `auth_user_id` と `employee_id` の紐づけ

どれか1つでも欠けるとログイン後にエラーになります。
