import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function ManagerReportsPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["manager"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="部下一覧"
        description="部下のプロフィール、面談準備状況、育成テーマの一覧はMVP 1で実装します。MVP 0では自分のプロフィール編集と社員公開プロフィールを確認できます。"
        plannedFor="MVP 1"
        role={viewer.role}
      />
    </AppShell>
  );
}
