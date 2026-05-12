import { AppShell } from "@/components/app-shell";
import { MeetingCopilot } from "@/components/meeting-copilot";
import { PermissionDenied } from "@/components/permission-denied";
import { listEmployees } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";
import { canUseManagerWorkflow } from "@/lib/permissions";

type NewMeetingPageProps = {
  searchParams: Promise<{ role?: string; employeeId?: string }>;
};

export default async function NewMeetingPage({ searchParams }: NewMeetingPageProps) {
  const params = await searchParams;
  const viewer = await getCurrentViewer();
  const employees = await listEmployees(viewer);

  return (
    <AppShell viewer={viewer}>
      {!canUseManagerWorkflow(viewer) ? (
        <PermissionDenied
          title="面談記録は上司・人事・管理者向けです"
          description="一般社員は本人入力とプロフィール編集を利用できます。面談記録を作成するには上司、人事、管理者でログインしてください。"
        />
      ) : (
        <>
      <div className="mb-7">
        <p className="text-sm font-semibold text-sky-600">AI Meeting Note</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2f57]">
          面談記録
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          1on1やキャリア面談のメモを入力すると、AIが要約、次回質問、次アクション、育成計画を生成します。
        </p>
      </div>
      <MeetingCopilot employees={employees} viewer={viewer} initialEmployeeId={params.employeeId} />
        </>
      )}
    </AppShell>
  );
}
