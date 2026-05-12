import { AppShell } from "@/components/app-shell";
import { DashboardCommandCenter } from "@/components/dashboard-command-center";
import { PermissionDenied } from "@/components/permission-denied";
import { listEmployees } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";
import { canUseManagerWorkflow } from "@/lib/permissions";

export default async function DashboardPage() {
  const viewer = await getCurrentViewer();
  const employees = await listEmployees(viewer);

  return (
    <AppShell viewer={viewer}>
      {canUseManagerWorkflow(viewer) ? (
        <DashboardCommandCenter employees={employees} />
      ) : (
        <PermissionDenied
          title="ダッシュボードは上司・人事・管理者向けです"
          description="一般社員は本人入力、プロフィール編集、自分の詳細情報を利用できます。上司用ダッシュボードを見るには権限のあるユーザーでログインしてください。"
        />
      )}
    </AppShell>
  );
}
