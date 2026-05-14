import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function ManagerPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["manager"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="上司トップ"
        description="部下一覧、面談準備、面談記録、アクション追跡はMVP 1で実装します。MVP 0ではプロフィール基盤のみを確認できます。"
        plannedFor="MVP 1"
        role={viewer.role}
      />
    </AppShell>
  );
}
