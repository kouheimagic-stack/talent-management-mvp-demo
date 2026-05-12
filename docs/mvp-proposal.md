# タレントマネジメントMVP提案

## プロジェクト構成

```text
src/
  app/
    employees/
      [id]/page.tsx        # 社員詳細
      page.tsx             # 社員一覧
    layout.tsx
    page.tsx               # /employees へ誘導
  components/              # 画面共通UI
  lib/
    employees.ts           # データ取得の抽象化
    mock-employees.ts      # MVP用モックデータ
    permissions.ts         # 権限制御
    supabase.ts            # Supabaseクライアント
  types/
    talent.ts              # ドメイン型
supabase/
  schema.sql               # 将来投入するDB設計
docs/
  mvp-proposal.md
```

## 必要な画面

1. 社員一覧画面
   - 氏名、部署、役職、勤務地、スキル、評価サマリ、面談状況を一覧表示
   - 部署・氏名・スキル検索
   - ロール切り替えによる閲覧範囲の確認

2. 社員詳細画面
   - 基本情報
   - 経歴
   - 資格
   - 評価履歴
   - 面談履歴
   - 希望キャリア
   - 給与・評価などの機微情報は権限で表示制御

3. 将来追加画面
   - キャリア提案生成
   - 育成マイルストーン生成
   - 面談メモ要約
   - 権限・承認設定

## データベース設計

中心テーブルは `employees` です。詳細情報は更新頻度と閲覧権限が異なるため、`career_histories`、`certifications`、`performance_reviews`、`interviews`、`career_preferences`、`compensations` に分離します。

権限は `user_profiles.role` と `manager_assignments` を使います。

- 本人: 自分の基本情報、希望キャリア、許可された評価・給与を閲覧
- 上長: 配下社員の基本情報、面談、許可された評価・給与を閲覧
- 人事: 全社員の人事情報を閲覧
- 管理者: 全情報を閲覧、設定変更

## 実装手順

1. Next.js + TypeScript + Tailwind CSSの初期構成
2. ドメイン型、モックデータ、データ取得関数を作成
3. 権限制御ヘルパーを作成
4. 社員一覧画面を作成
5. 社員詳細画面を作成
6. Supabaseスキーマを作成
7. OpenAI API追加用に `career_insights` 系のサービス層を追加

## OpenAI API拡張方針

MVPではAI処理を直接画面に埋め込まず、将来以下のサービス関数を追加できる構造にします。

- `generateCareerSuggestions(employeeId)`
- `generateDevelopmentMilestones(employeeId)`
- `summarizeInterviewMemo(interviewId)`

社員データ取得とAI生成処理を分離することで、監査ログ、個人情報マスキング、承認フローを後から追加しやすくします。

## 改善後のUIコンポーネント分割

詳細画面は、情報を一度に読ませず、判断に必要な順番で分割します。

1. `ProfileHero`
   - 顔写真、氏名、所属、役職、等級、勤続年数、現在評価、次回面談、希望キャリア、AI要約、次アクションボタン

2. `TalentDashboard`
   - 評価推移グラフ、資格ステップ、キャリアマップ、強みタグ、育成課題タグ

3. `EmployeeProfileTabs`
   - 経歴、評価履歴、面談履歴、目標管理、資格、AI提案、権限設定をタブで切り替え

4. `EmployeeDirectory`
   - 一覧の検索、部署フィルター、評価フィルター、面談予定フィルター、カード/テーブル切替

顔写真は現在 `employee.photoUrl` にモックURLを保持しています。Supabase移行時は `employee_photos.storage_path` を保存し、Supabase Storageの公開URLまたは署名付きURLを `photoUrl` として画面に渡します。
