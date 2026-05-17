import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer, mockUsers, roleLabels } from "@/lib/permissions";
import type { Viewer, ViewerRole } from "@/types/talent";

export const mockAuthCookieName = "mvp0-user-id";
export const supabaseAccessTokenCookieName = "sb-access-token";
export const supabaseRefreshTokenCookieName = "sb-refresh-token";

export const roleHomePaths: Record<ViewerRole, string> = {
  employee: "/me",
  manager: "/me",
  hr: "/me",
  admin: "/me",
};

export async function getCurrentViewer() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(mockAuthCookieName)?.value;

  if (!userId) {
    redirect("/login");
  }

  const user = mockUsers.find((item) => item.id === userId);

  if (!user) {
    redirect("/login?error=session_expired");
  }

  if (user.accountStatus === "suspended") {
    redirect("/login?error=suspended");
  }

  return getViewer(user.id);
}

export function getDefaultUserId() {
  return mockUsers[0].id;
}

export function getRoleHomePath(role: ViewerRole) {
  return roleHomePaths[role];
}

export function redirectToRoleHome(viewer: Viewer): never {
  redirect(getRoleHomePath(viewer.role));
}

export function requireRole(viewer: Viewer, allowedRoles: ViewerRole[]) {
  if (!allowedRoles.includes(viewer.role)) {
    redirectToRoleHome(viewer);
  }
}

export function getViewerRoleLabel(role: ViewerRole) {
  return roleLabels[role];
}
