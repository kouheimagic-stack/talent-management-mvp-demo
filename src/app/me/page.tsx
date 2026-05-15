import { AppShell } from "@/components/app-shell";
import { EmployeeCareerHome } from "@/components/employee-career-home";
import { getEmployeeById } from "@/lib/employees";
import { getCurrentViewer } from "@/lib/auth";

export default async function MyPage() {
  const viewer = await getCurrentViewer();
  const myEmployee = await getEmployeeById(viewer.employeeId);

  if (myEmployee) {
    return (
      <AppShell viewer={viewer}>
        <div className="mb-5 md:mb-7">
          <p className="text-sm font-semibold text-sky-600">My career</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f2f57] md:text-3xl">
            マイページ
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base">
            自分のプロフィール完成度、公開中の項目、最近更新した項目を確認します。
          </p>
        </div>
        <EmployeeCareerHome employee={myEmployee} viewer={viewer} />
      </AppShell>
    );
  }

  return (
    <AppShell viewer={viewer}>
      <div className="mb-5 md:mb-7">
        <p className="text-sm font-semibold text-sky-600">My career</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f2f57] md:text-3xl">
          マイページ
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base">
          このログインユーザーに紐づく社員プロフィールがまだありません。MVP 0では一般社員のプロフィール編集と公開プロフィール閲覧を対象にしています。
        </p>
      </div>
    </AppShell>
  );
}
