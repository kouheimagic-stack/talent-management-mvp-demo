import { ActionManagementBoard } from "@/components/action-management-board";
import { AppShell } from "@/components/app-shell";
import { PermissionDenied } from "@/components/permission-denied";
import { listEmployees } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";
import { canUseManagerWorkflow } from "@/lib/permissions";

export default async function ActionsPage() {
  const viewer = await getCurrentViewer();
  const employees = await listEmployees(viewer);

  return (
    <AppShell viewer={viewer}>
      {!canUseManagerWorkflow(viewer) ? (
        <PermissionDenied
          title="アクション管理は上司・人事・管理者向けです"
          description="面談後のネクストアクション管理は、上司、人事、管理者の権限で利用できます。"
        />
      ) : (
        <>
      <div className="mb-7">
        <p className="text-sm font-semibold text-sky-600">After meeting</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2f57]">
          アクション管理
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          面談後に決めたネクストアクションを社員別、上司別、期限別に追跡します。次回面談で確認する項目も明確にします。
        </p>
      </div>
      <ActionManagementBoard employees={employees} viewer={viewer} />
        </>
      )}
    </AppShell>
  );
}
