import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function AdminPermissionsPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="権限管理"
        description="ロールに加えて細かなpermissionsを設定する機能はMVP 2以降で実装します。MVP 0では全ユーザーが個人プロフィールを持つ前提を確認できます。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
