import { cookies } from "next/headers";
import { supabaseAccessTokenCookieName } from "@/lib/auth";
import { mockEmployees } from "@/lib/mock-employees";
import { createSupabaseServerClient, SupabaseConfigError } from "@/lib/supabase/server";
import type { EmployeeProfile, Viewer } from "@/types/talent";
import { canViewEmployee, mockUsers, toViewer } from "./permissions";

type SupabaseEmployeeRow = {
  id: string;
  employee_code: string;
  name: string;
  name_kana: string | null;
  email: string;
  department: string;
  team: string | null;
  position: string | null;
  grade: string | null;
  joined_on: string | null;
  employment_status: "active" | "leave" | "retired";
};

export async function listEmployees(
  viewer: Viewer,
  query?: string,
  department?: string,
  rating?: string,
  interview?: string,
  specialty?: string,
) {
  const normalizedQuery = query?.trim().toLowerCase();
  const normalizedSpecialty = specialty?.trim().toLowerCase();

  return getMvp0Employees()
    .filter((employee) => canViewEmployee(employee, viewer))
    .filter((employee) => {
      if (!department || department === "all") {
        return true;
      }

      return employee.department === department;
    })
    .filter((employee) => {
      if (!rating || rating === "all") {
        return true;
      }

      return employee.latestRating === rating;
    })
    .filter((employee) => {
      if (!interview || interview === "all") {
        return true;
      }

      if (interview === "scheduled") {
        return Boolean(employee.nextInterviewOn);
      }

      return !employee.nextInterviewOn;
    })
    .filter((employee) => {
      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        employee.fullName,
        employee.fullNameKana,
        employee.department,
        employee.position,
        ...employee.skills,
        ...employee.strengths,
        ...employee.certifications.map((certification) => certification.name),
        ...employee.careerHistories.map((history) => history.summary),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    })
    .filter((employee) => {
      if (!normalizedSpecialty) {
        return true;
      }

      const haystack = [
        ...employee.strengths,
        ...employee.certifications.map((certification) => certification.name),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedSpecialty);
    });
}

export async function getEmployeeById(id: string): Promise<EmployeeProfile | undefined> {
  const mockEmployee = getMvp0Employees().find((employee) => employee.id === id);
  if (mockEmployee) {
    return mockEmployee;
  }

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(supabaseAccessTokenCookieName)?.value;
    const supabase = createSupabaseServerClient(accessToken);
    const { data } = await supabase
      .from("employees")
      .select("id, employee_code, name, name_kana, email, department, team, position, grade, joined_on, employment_status")
      .eq("id", id)
      .maybeSingle<SupabaseEmployeeRow>();

    return data ? employeeProfileFromSupabaseRow(data) : undefined;
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return undefined;
    }
    return undefined;
  }
}

function getMvp0Employees() {
  const existingIds = new Set(mockEmployees.map((employee) => employee.id));
  const roleProfiles = mockUsers
    .filter((user) => !existingIds.has(user.employeeId))
    .map((user) => employeeProfileFromViewer(toViewer(user)));

  return [...mockEmployees, ...roleProfiles];
}

export async function getDepartments(viewer: Viewer) {
  const employees = await listEmployees(viewer);

  return Array.from(new Set(employees.map((employee) => employee.department)));
}

export async function getRatings(viewer: Viewer) {
  const employees = await listEmployees(viewer);

  return Array.from(new Set(employees.map((employee) => employee.latestRating)));
}

export function employeeProfileFromViewer(viewer: Viewer): EmployeeProfile {
  return {
    id: viewer.employeeId,
    employeeCode: "",
    photoUrl: "",
    fullName: viewer.name,
    fullNameKana: "",
    email: viewer.email,
    department: viewer.department ?? "",
    position: viewer.position ?? "",
    grade: viewer.grade ?? "",
    location: viewer.team ?? "",
    joinedOn: "",
    skills: [],
    strengths: [],
    developmentAreas: [],
    latestRating: "",
    careerStage: "",
    aiSummary: "",
    oneOnOneReadiness: 0,
    engagement: 0,
    growthVelocity: 0,
    riskLevel: "low",
    focusTheme: "",
    recommendedAction: "",
    phone: "",
    employmentStatus: "active",
    careerHistories: [],
    certifications: [],
    performanceReviews: [],
    interviews: [],
    careerPreference: {
      desiredRole: "",
      desiredDepartment: "",
      mobility: "",
      skillsToDevelop: [],
      notes: "",
    },
    goals: [],
  };
}

function employeeProfileFromSupabaseRow(row: SupabaseEmployeeRow): EmployeeProfile {
  return {
    ...employeeProfileFromViewer({
      userId: "",
      employeeId: row.id,
      role: "employee",
      email: row.email,
      name: row.name,
      department: row.department,
      team: row.team,
      position: row.position,
      grade: row.grade,
      permittedSensitiveEmployeeIds: [row.id],
    }),
    employeeCode: row.employee_code,
    fullNameKana: row.name_kana ?? "",
    joinedOn: row.joined_on ?? "",
    employmentStatus: row.employment_status,
  };
}
