import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function OrganizationAdminPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="組織管理"
        description="部署、チーム、上司・部下関係の管理はMVP 2で実装します。"
        plannedFor="MVP 2"
        role={viewer.role}
      />
    </AppShell>
  );
}
