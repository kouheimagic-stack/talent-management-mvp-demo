import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { getCurrentViewer } from "@/lib/auth";
import { getEmployeeById } from "@/lib/employees";

export default async function ProfileEditPage() {
  const viewer = await getCurrentViewer();
  const employee = await getEmployeeById(viewer.employeeId);

  if (!employee) {
    notFound();
  }

  return (
    <AppShell viewer={viewer}>
      <div className="mb-7">
        <p className="text-sm font-semibold text-sky-600">My profile</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2f57]">
          プロフィール編集
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          公開プロフィールに表示される自己紹介、得意領域、公開キャリア情報を編集します。
        </p>
      </div>
      <ProfileEditForm employee={employee} />
    </AppShell>
  );
}
