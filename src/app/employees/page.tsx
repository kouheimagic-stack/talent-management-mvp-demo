import { Search, Sparkles, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { EmployeeDirectory } from "@/components/employee-directory";
import { getDepartments, listEmployees } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";

type EmployeesPageProps = {
  searchParams: Promise<{
    role?: string;
    q?: string;
    department?: string;
    rating?: string;
    interview?: string;
    specialty?: string;
    view?: string;
  }>;
};

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const params = await searchParams;
  const viewer = await getCurrentViewer();
  const view = params.view === "table" ? "table" : "cards";
  const [employees, departments] = await Promise.all([
    listEmployees(viewer, params.q, params.department, params.rating, params.interview, params.specialty),
    getDepartments(viewer),
  ]);

  return (
    <AppShell viewer={viewer}>
      <div className="mb-8 grid gap-5 lg:grid-cols-[1.5fr_1fr] lg:items-end">
        <div>
          <p className="text-sm font-semibold text-sky-600">People directory</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0f2f57]">
            社員公開プロフィール一覧
          </h2>
          <p className="mt-3 max-w-3xl text-slate-600">
            社内の人を知り、得意領域、資格、キャリアの参考になる公開情報を探します。非公開情報は表示されません。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Search className="mb-3 text-sky-600" size={22} />
            <p className="text-sm font-semibold text-[#0f2f57]">得意領域を探す</p>
            <p className="mt-1 text-sm text-slate-500">相談先や協業相手を見つける</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <Sparkles className="mb-3 text-sky-600" size={22} />
            <p className="text-sm font-semibold text-[#0f2f57]">資格保有者を探す</p>
            <p className="mt-1 text-sm text-slate-500">公開資格から詳しい人を探す</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <UsersRound className="mb-3 text-sky-600" size={22} />
            <p className="text-sm font-semibold text-[#0f2f57]">キャリア参考</p>
            <p className="mt-1 text-sm text-slate-500">公開経歴から学ぶ</p>
          </div>
        </div>
      </div>

      <EmployeeDirectory
        employees={employees}
        departments={departments}
        ratings={[]}
        role="employee"
        query={params.q}
        department={params.department}
        rating={params.rating}
        interview={params.interview}
        specialty={params.specialty}
        view={view}
      />
    </AppShell>
  );
}
