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
          自分の情報を整えながら、社員全体に公開する項目と非公開にする項目を管理します。
        </p>
      </div>
      <ProfileEditForm employee={employee} />
    </AppShell>
  );
}
