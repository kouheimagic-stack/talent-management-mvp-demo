# AI面談支援SaaS 再設計

## プロジェクト構成

```text
src/
  app/
    dashboard/page.tsx                 # 面談支援ダッシュボード
    employees/page.tsx                 # 部下一覧
    employees/[id]/page.tsx            # 社員詳細
    meetings/new/page.tsx              # 面談記録
    api/ai/summarize-meeting/route.ts  # OpenAI面談要約
    api/ai/development-plan/route.ts   # OpenAI育成提案
  components/
    app-shell.tsx
    dashboard-command-center.tsx
    employee-directory.tsx
    employee-insight-panel.tsx
    meeting-copilot.tsx
    shadcn/ui primitives
  lib/
    ai/
      openai.ts
      schemas.ts
    employees.ts
    mock-employees.ts
    supabase.ts
  types/
    talent.ts
supabase/
  schema.sql
```

## UI設計

目的は、人事台帳ではなく「上司が面談前後で毎回開く」体験にすることです。

- 本人用マイページ: 本人が仕事内容、困りごと、希望、スキル、面談前メモ、自己評価、目標進捗を入力
- 上司用 面談準備: 本人入力、前回面談、前回AI要約、未完了アクション、評価推移、AI論点を確認
- 面談記録: メモ、AI要約、AI育成提案、決定事項、次回面談日、ネクストアクション作成、保存
- アクション管理: 社員別、上司別、期限別にaction_itemsを追跡し、完了・コメント更新

画面は常に「面談前 -> 面談中 -> 面談後」のステップを表示し、次に何をすべきかを明確にします。

## DB設計

主要テーブル:

- `users`: アプリ利用者。本人、上司、人事、管理者
- `employees`: 社員基本情報、顔写真Storageパス、キャリア段階、AI要約
- `self_updates`: 本人入力。面談前メモ、困りごと、希望、自己評価
- `meetings`: 面談記録。メモ、決定事項、次回面談日
- `meeting_ai_outputs`: AI要約、次回アクション、育成提案、モデル、入力ハッシュ
- `action_items`: 面談後のネクストアクション。担当者、期限、ステータス、優先度
- `career_goals`: 希望キャリア、目標、進捗
- `permissions`: 本人、上司、人事、管理者の閲覧/編集権限
- `development_plans`: 育成テーマ、マイルストーン、期限、状態
- `employee_signals`: 離職リスク、エンゲージメント、コンディション、変化検知
- `integrations`: Slack/LINE WORKS/タスク管理連携設定

## OpenAI API構成

API RouteからOpenAI Responses APIへ接続します。

- `POST /api/ai/summarize-meeting`
  - 入力: 社員プロフィール、面談メモ、面談目的
  - 出力: 要約、感情/関心、次回聞くべき問い、次アクション、リスクシグナル

- `POST /api/ai/development-plan`
  - 入力: 社員プロフィール、強み、育成課題、希望キャリア、面談要約
  - 出力: 育成テーマ、30/60/90日マイルストーン、上長アクション

出力はStructured OutputsでJSON化し、UIにそのまま描画できる形にします。

## Supabase構成

- Auth: `user_profiles.role` で本人、上長、人事、管理者を判定
- Postgres: 社員、面談、AI出力、育成計画、シグナルを保存
- Storage: 顔写真を `employee-photos/{employee_id}/avatar` に保存
- RLS: 本人、直属上長、人事、管理者の閲覧範囲を分離

MVPではSupabase未接続でも操作確認できるよう、`localStorage` をモックDBとして使います。`workflow-store.ts` の関数境界をSupabase CRUDへ差し替えます。

## コンポーネント構成

- `WorkflowStepper`: 面談前、面談中、面談後の流れ
- `SelfUpdateForm`: 本人入力と保存
- `MeetingPrepWorkspace`: 上司の面談準備とAI論点生成
- `MeetingCopilot`: 面談記録、AI要約、育成提案、保存
- `ActionManagementBoard`: ネクストアクション追跡
- `DashboardCommandCenter`: 今日のフォーカスと状態変化

## 拡張方針

将来的に、離職リスク分析、キャリア提案、目標管理、社内異動提案、タスク連携、Slack/LINE WORKS通知を追加できるよう、AI出力と業務アクションを分離して保存します。
