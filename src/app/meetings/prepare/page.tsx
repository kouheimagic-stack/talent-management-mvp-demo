import { AppShell } from "@/components/app-shell";
import { MeetingPrepWorkspace } from "@/components/meeting-prep-workspace";
import { PermissionDenied } from "@/components/permission-denied";
import { listEmployees } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";
import { canUseManagerWorkflow } from "@/lib/permissions";

type MeetingPreparePageProps = {
  searchParams: Promise<{ role?: string; employeeId?: string }>;
};

export default async function MeetingPreparePage({ searchParams }: MeetingPreparePageProps) {
  const params = await searchParams;
  const viewer = await getCurrentViewer();
  const employees = await listEmployees(viewer);

  return (
    <AppShell viewer={viewer}>
      {!canUseManagerWorkflow(viewer) ? (
        <PermissionDenied
          title="面談準備は上司・人事・管理者向けです"
          description="一般社員は本人入力と公開プロフィール編集を利用できます。面談準備を行うには上司、人事、管理者でログインしてください。"
        />
      ) : (
        <>
      <div className="mb-7">
        <p className="text-sm font-semibold text-sky-600">Before meeting</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2f57]">
          上司用 面談準備
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          本人入力、前回面談、未完了アクション、評価推移を1つの流れで確認し、AIが今回話すべき論点を提案します。
        </p>
      </div>
      <MeetingPrepWorkspace employees={employees} initialEmployeeId={params.employeeId} />
        </>
      )}
    </AppShell>
  );
}
