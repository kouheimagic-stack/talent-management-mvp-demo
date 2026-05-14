import { mockEmployees } from "@/lib/mock-employees";
import type { EmployeeProfile, Viewer } from "@/types/talent";
import { canViewEmployee } from "./permissions";

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

  return mockEmployees
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
  return mockEmployees.find((employee) => employee.id === id);
}

export async function getDepartments(viewer: Viewer) {
  const employees = await listEmployees(viewer);

  return Array.from(new Set(employees.map((employee) => employee.department)));
}

export async function getRatings(viewer: Viewer) {
  const employees = await listEmployees(viewer);

  return Array.from(new Set(employees.map((employee) => employee.latestRating)));
}
