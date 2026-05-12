# 認証・権限管理 再設計

## 画面設計

1. ログイン画面 `/login`
   - メールアドレスとパスワードでログイン
   - 開発中はモック認証、セッションはCookieで保持
   - パスワード再設定メール送信、招待からの初回パスワード設定導線を用意

2. マイページ `/me`
   - 本人が面談前に仕事内容、困りごと、希望、自己評価、目標進捗を入力
   - 保存内容は上司の面談準備画面に反映

3. プロフィール編集 `/profile/edit`
   - 本人が公開プロフィールを編集
   - 必須項目が空なら保存不可理由を表示

4. 社員公開プロフィール `/employees/[id]`
   - 権限がない社員は公開プロフィールのみ
   - 権限がある社員は評価、面談、AI分析、育成課題まで表示

5. 上司用ダッシュボード `/dashboard`
   - manager / hr / admin のみ

6. 部下一覧 `/employees`
   - employee は公開情報中心
   - manager / hr / admin は面談状態や次アクションも確認

7. 面談準備 `/meetings/prepare`
   - manager / hr / admin のみ

8. 面談記録 `/meetings/new`
   - manager / hr / admin のみ
   - 未入力項目があれば保存不可理由を表示

9. アクション管理 `/actions`
   - manager / hr / admin のみ
   - 保存された `action_items` を一覧・更新

10. ユーザー管理 `/admin/users`
   - hr / admin のみ
   - 氏名、メール、ロール、所属、上司、状態、最終ログイン、招待再送、再設定、停止/再開を操作

## 権限設計

- employee
  - 自分の詳細情報を閲覧・編集
  - 他社員は公開プロフィールのみ

- manager
  - 下位組織の社員詳細を閲覧
  - 下位組織以外は公開プロフィールのみ
  - 面談準備、面談記録、アクション管理を利用

- hr
  - 全社員の詳細情報を閲覧
  - 面談準備、面談記録、アクション管理を利用

- admin
  - 全機能を利用

## DB設計

- `users`: ログインユーザー、ロール
- `employees`: 社員基本情報
- `employee_profiles`: 自己紹介、公開キャリア情報、公開設定
- `employee_profile_visibility`: 項目別の公開/非公開/権限限定
- `organizations`: 組織
- `organization_members`: 組織所属
- `manager_relations`: 上司・部下関係
- `qualifications`: 資格
- `career_histories`: 社内経歴
- `self_updates`: 本人入力
- `meetings`: 面談記録
- `meeting_ai_outputs`: AI要約・育成提案
- `action_items`: ネクストアクション
- `permissions`: 個別閲覧・編集権限
- `invitations`: 招待メールと初回パスワード設定
- `audit_logs`: 認証・権限・ユーザー管理操作の監査ログ

## Supabase Auth移行方針

- ログイン: `supabase.auth.signInWithPassword({ email, password })`
- ログアウト: `supabase.auth.signOut()`
- パスワード再設定: `supabase.auth.resetPasswordForEmail(email)`
- 招待: サーバー側でService Roleを使い `supabase.auth.admin.inviteUserByEmail(email)`
- 初回パスワード設定: 招待リンクのセッション確立後に `supabase.auth.updateUser({ password })`
- 権限: `auth.users.id` と `user_profiles.user_id` を紐付け、RLSでemployee/manager/hr/adminを判定
- UIのナビゲーション: Supabaseセッションから取得した `user_profiles.role` で自動生成

Supabase公式ドキュメントでは、メール/パスワード認証、パスワード再設定、Auth Adminの招待APIが提供されています。MVPではAPI Routeを同じ責務境界にしているため、モック処理をSupabase SDK呼び出しへ差し替えます。

## コンポーネント構成

- `AppShell`: ログインユーザー、ロール、ナビゲーション
- `RoleSwitcher`: ログイン切替への導線
- `LoginPage`: メール/パスワード認証
- `UserManagementTable`: 人事・管理者向けユーザー管理
- `ProfileEditForm`: 顔写真アップロード、公開設定、公開プロフィールプレビュー
- `CsvUserImportExport`: CSVエクスポート、CSVインポート、差分プレビュー、招待確認
- `MeetingCopilot`: 面談前確認、面談中メモ、AI整理・保存の3ステップ
- `ChatPanel`: 社員・上司の1対1チャット、既読/未読、検索、AI利用明示

## 追加画面設計

### 本人プロフィール編集

- 左側で顔写真、自己紹介、仕事内容を編集
- 右側で社内経歴、資格、得意領域、伸ばしたいスキル、希望キャリア、異動希望、面談前メモを編集
- 各項目に「公開中」「非公開」「権限限定」バッジを表示
- 公開へ切り替える場合は確認モーダルを表示
- 保存前に「今回公開される情報」を一覧表示
- 保存後はトースト通知を表示
- 公開プロフィールプレビューで他社員からの見え方を確認

### ユーザー管理CSV

- エクスポート: 登録ユーザー、社員、組織、上司関係をCSVでダウンロード
- インポート: papaparseでCSVを解析し、プレビュー表示
- 差分: 新規追加、更新、無効化候補、エラーを行単位で表示
- バリデーション: email/name/role/manager_email/循環参照
- 新規メンバーがある場合は招待メール送信方針を確認

### 面談記録3ステップ

1. 面談前確認
   - 本人入力、前回面談、前回未完了アクション、AI論点、上司が聞きたいこと
2. 面談中メモ
   - 本人発言、上司所感、困りごと、合意、決定事項、次回までにやること、次回確認したいこと
3. AI整理・保存
   - AI要約、質問候補、育成提案、アクション候補確認、保存

### 簡易チャット

- 社員詳細の「チャット」タブで1対1チャット
- アクション管理にコメント欄
- 人事・管理者は権限範囲内で閲覧可能
- 「AI要約に利用される場合がある」旨を明示
- `PermissionDenied`: 権限不足時の説明
- `ProfileEditForm`: 本人プロフィール編集
- `SelfUpdateForm`: 本人入力
- `MeetingPrepWorkspace`: 面談準備
- `MeetingCopilot`: 面談記録と保存
- `ActionManagementBoard`: アクション管理
