import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function UserManagementPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["hr", "admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="ユーザー管理"
        description="招待メール、パスワード再設定、アカウント停止/再開、CSV連携はMVP 2で実装します。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
