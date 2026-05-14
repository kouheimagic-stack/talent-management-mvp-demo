import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer, mockUsers } from "@/lib/permissions";
import type { Viewer, ViewerRole } from "@/types/talent";

export const mockAuthCookieName = "mock_user_id";

export const roleHomePaths: Record<ViewerRole, string> = {
  employee: "/me",
  manager: "/manager",
  hr: "/hr",
  admin: "/admin",
};

export async function getCurrentViewer() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(mockAuthCookieName)?.value;
  if (!userId) {
    redirect("/login");
  }

  return getViewer(userId);
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
