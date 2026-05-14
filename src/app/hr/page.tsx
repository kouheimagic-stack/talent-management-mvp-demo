import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function HrPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["hr"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="人事トップ"
        description="ユーザー管理、組織構造管理、CSVインポート/エクスポートはMVP 2で実装します。MVP 0では公開プロフィール基盤のみを確認できます。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
