import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="システム設定"
        description="認証、外部連携、ストレージ、監査ログなどのシステム設定はMVP 2以降で実装します。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
