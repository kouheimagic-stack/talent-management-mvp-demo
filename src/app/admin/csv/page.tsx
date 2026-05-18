import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function CsvAdminPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["hr", "admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="CSV管理"
        description="ユーザー、社員、組織構造のCSVインポート/エクスポートはMVP 2で実装します。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
