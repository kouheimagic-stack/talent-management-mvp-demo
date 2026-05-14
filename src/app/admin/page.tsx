import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function AdminPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="管理者トップ"
        description="システム設定、ユーザー管理、組織管理、CSV管理はMVP 2で実装します。MVP 0では公開プロフィール基盤のみを確認できます。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
