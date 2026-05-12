import { AppShell } from "@/components/app-shell";
import { PermissionDenied } from "@/components/permission-denied";
import { UserManagementTable } from "@/components/user-management-table";
import { getCurrentViewer } from "@/lib/auth";
import { canManageUsers, mockUsers } from "@/lib/permissions";

export default async function UserManagementPage() {
  const viewer = await getCurrentViewer();

  return (
    <AppShell viewer={viewer}>
      {!canManageUsers(viewer) ? (
        <PermissionDenied
          title="ユーザー管理は人事・管理者向けです"
          description="ログイン権限、招待、停止、パスワード再設定は人事または管理者のみ操作できます。"
        />
      ) : (
        <>
          <div className="mb-7">
            <p className="text-sm font-semibold text-sky-600">Admin</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[#0f2f57]">
              ユーザー管理
            </h2>
            <p className="mt-3 max-w-3xl text-slate-600">
              ログイン権限を持つユーザーの招待、停止、再開、パスワード再設定を管理します。
            </p>
          </div>
          <UserManagementTable users={mockUsers} />
        </>
      )}
    </AppShell>
  );
}
