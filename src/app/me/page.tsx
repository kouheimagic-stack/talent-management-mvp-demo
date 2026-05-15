import { AppShell } from "@/components/app-shell";
import { EmployeeCareerHome } from "@/components/employee-career-home";
import { employeeProfileFromViewer, getEmployeeById } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";

export default async function MyPage() {
  const viewer = await getCurrentViewer();
  const myEmployee = (await getEmployeeById(viewer.employeeId)) ?? employeeProfileFromViewer(viewer);

  return (
    <AppShell viewer={viewer}>
      <div className="mb-5 md:mb-7">
        <p className="text-sm font-semibold text-sky-600">My career</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f2f57] md:text-3xl">
          マイページ
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base">
          Supabase Authでログイン中の社員基本情報を表示しています。
        </p>
      </div>
      <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="blue">Supabase接続中</Badge>
          <Badge variant={viewer.accountStatus === "active" ? "success" : "warning"}>
            {viewer.accountStatus ?? "active"}
          </Badge>
          <Badge variant="default">{viewer.role}</Badge>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Info label="氏名" value={viewer.name} />
          <Info label="メールアドレス" value={viewer.email} />
          <Info label="所属" value={viewer.department} />
          <Info label="チーム" value={viewer.team} />
          <Info label="役職" value={viewer.position} />
          <Info label="等級" value={viewer.grade} />
          <Info label="employee_id" value={viewer.employeeId} />
          <Info label="auth_user_id" value={viewer.authUserId} />
        </div>
      </section>
      <EmployeeCareerHome employee={myEmployee} viewer={viewer} />
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-[#0f2f57]">{value || "-"}</p>
    </div>
  );
}
