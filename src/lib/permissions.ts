import type { EmployeeProfile, Viewer, ViewerRole } from "@/types/talent";

export type MockUser = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  password: string;
  role: ViewerRole;
  title: string;
  department: string;
  managerName?: string;
  accountStatus: "not_invited" | "invited" | "active" | "suspended";
  lastLoginAt?: string;
  reportEmployeeIds: string[];
  permittedSensitiveEmployeeIds: string[];
};

export const mockUsers: MockUser[] = [
  {
    id: "user-employee-001",
    employeeId: "emp-001",
    name: "佐藤 美咲",
    email: "misaki.sato@example.com",
    password: "password123",
    role: "employee",
    title: "一般社員",
    department: "プロダクト開発部",
    managerName: "高橋 健",
    accountStatus: "active",
    lastLoginAt: "2026-05-12 18:20",
    reportEmployeeIds: [],
    permittedSensitiveEmployeeIds: ["emp-001"],
  },
  {
    id: "user-manager-001",
    employeeId: "mgr-001",
    name: "高橋 健",
    email: "ken.takahashi@example.com",
    password: "password123",
    role: "manager",
    title: "上司",
    department: "プロダクト開発部",
    accountStatus: "active",
    lastLoginAt: "2026-05-12 19:05",
    reportEmployeeIds: ["emp-001", "emp-002"],
    permittedSensitiveEmployeeIds: ["emp-001", "emp-002"],
  },
  {
    id: "user-hr-001",
    employeeId: "hr-001",
    name: "人事担当",
    email: "hr@example.com",
    password: "password123",
    role: "hr",
    title: "人事",
    department: "人事企画部",
    accountStatus: "active",
    lastLoginAt: "2026-05-12 16:40",
    reportEmployeeIds: [],
    permittedSensitiveEmployeeIds: ["*"],
  },
  {
    id: "user-admin-001",
    employeeId: "admin-001",
    name: "管理者",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    title: "管理者",
    department: "管理部",
    accountStatus: "active",
    lastLoginAt: "2026-05-12 20:10",
    reportEmployeeIds: [],
    permittedSensitiveEmployeeIds: ["*"],
  },
];

export const roleLabels: Record<ViewerRole, string> = {
  employee: "一般社員",
  manager: "上司",
  hr: "人事",
  admin: "管理者",
};

export function toViewer(user: MockUser): Viewer {
  return {
    userId: user.id,
    role: user.role,
    employeeId: user.employeeId,
    email: user.email,
    name: user.name,
    permittedSensitiveEmployeeIds: user.permittedSensitiveEmployeeIds,
  };
}

export function findUserByEmail(email: string) {
  return mockUsers.find((item) => item.email.toLowerCase() === email.trim().toLowerCase());
}

export function canManageUsers(viewer: Viewer) {
  return viewer.role === "hr" || viewer.role === "admin";
}

export function getViewer(roleOrUserId?: string): Viewer {
  const normalized = roleOrUserId === "self" ? "employee" : roleOrUserId;
  const user =
    mockUsers.find((item) => item.id === normalized) ??
    mockUsers.find((item) => item.role === normalized) ??
    mockUsers[0];

  return toViewer(user);
}

export function canViewPrivateProfile(employee: EmployeeProfile, viewer: Viewer) {
  if (viewer.role === "hr" || viewer.role === "admin") {
    return true;
  }

  if (viewer.role === "employee") {
    return employee.id === viewer.employeeId;
  }

  return isDirectReport(employee, viewer);
}

export function canEditProfile(employee: EmployeeProfile, viewer: Viewer) {
  return viewer.role === "admin" || employee.id === viewer.employeeId;
}

export function canUseManagerWorkflow(viewer: Viewer) {
  return viewer.role === "manager" || viewer.role === "hr" || viewer.role === "admin";
}

export function canViewSensitiveInfo(employee: EmployeeProfile, viewer: Viewer) {
  if (viewer.role === "hr" || viewer.role === "admin") {
    return true;
  }

  if (viewer.role === "employee") {
    return employee.id === viewer.employeeId;
  }

  if (viewer.role === "manager") {
    return viewer.permittedSensitiveEmployeeIds.includes(employee.id);
  }

  return false;
}

export function canViewEmployee(employee: EmployeeProfile, viewer: Viewer) {
  if (viewer.role === "hr" || viewer.role === "admin") {
    return true;
  }

  if (viewer.role === "employee") {
    return true;
  }

  return true;
}

export function isDirectReport(employee: EmployeeProfile, viewer: Viewer) {
  const user = mockUsers.find((item) => item.id === viewer.userId);
  return Boolean(user?.reportEmployeeIds.includes(employee.id));
}

export function getVisibilityLabel(employee: EmployeeProfile, viewer: Viewer) {
  return canViewPrivateProfile(employee, viewer) ? "詳細情報を表示" : "公開プロフィールのみ";
}
