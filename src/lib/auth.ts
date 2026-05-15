import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { roleLabels } from "@/lib/permissions";
import { createSupabaseServerClient, SupabaseConfigError } from "@/lib/supabase/server";
import type { Viewer, ViewerRole } from "@/types/talent";

export const supabaseAccessTokenCookieName = "sb-access-token";
export const supabaseRefreshTokenCookieName = "sb-refresh-token";

export const roleHomePaths: Record<ViewerRole, string> = {
  employee: "/me",
  manager: "/me",
  hr: "/me",
  admin: "/me",
};

type UserProfileRow = {
  id: string;
  auth_user_id: string;
  employee_id: string;
  role: ViewerRole;
  account_status: "active" | "suspended";
};

type EmployeeRow = {
  id: string;
  employee_code: string;
  name: string;
  email: string;
  department: string;
  team: string | null;
  position: string | null;
  grade: string | null;
};

export async function getCurrentViewer() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(supabaseAccessTokenCookieName)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  try {
    const supabase = createSupabaseServerClient(accessToken);
    const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);

    if (authError || !authData.user) {
      redirect("/login?error=session_expired");
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("id, auth_user_id, employee_id, role, account_status")
      .eq("auth_user_id", authData.user.id)
      .maybeSingle<UserProfileRow>();

    if (profileError) {
      redirect("/login?error=db_connection");
    }

    if (!userProfile) {
      redirect("/login?error=missing_profile");
    }

    if (userProfile.account_status === "suspended") {
      redirect("/login?error=suspended");
    }

    const { data: employee, error: employeeError } = await supabase
      .from("employees")
      .select("id, employee_code, name, email, department, team, position, grade")
      .eq("id", userProfile.employee_id)
      .maybeSingle<EmployeeRow>();

    if (employeeError) {
      redirect("/login?error=db_connection");
    }

    if (!employee) {
      redirect("/login?error=missing_employee");
    }

    return toViewer(authData.user.id, userProfile, employee);
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      redirect("/login?error=supabase_config");
    }
    throw error;
  }
}

export function getDefaultUserId() {
  return "";
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

function toViewer(authUserId: string, userProfile: UserProfileRow, employee: EmployeeRow): Viewer {
  return {
    userId: userProfile.id,
    authUserId,
    role: userProfile.role,
    employeeId: employee.id,
    email: employee.email,
    name: employee.name,
    department: employee.department,
    team: employee.team,
    position: employee.position,
    grade: employee.grade,
    accountStatus: userProfile.account_status,
    permittedSensitiveEmployeeIds: [employee.id],
  };
}
