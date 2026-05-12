"use client";

import { Award, BriefcaseBusiness, Eye, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { Pill } from "@/components/ui";
import type { EmployeeProfile, ViewerRole } from "@/types/talent";

type EmployeeCardProps = {
  employee: EmployeeProfile;
  role: ViewerRole;
};

type StoredProfile = {
  photoUrl?: string;
  selfIntroduction?: string;
  qualifications?: string;
  strengths?: string;
  visibility?: Record<string, "public" | "private" | "fixed_private">;
};

const profileStoragePrefix = "profile-edit-v4-";

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const profile = readStoredProfile(employee.id);
  const visibility = profile?.visibility ?? defaultVisibility();
  const photoUrl = visibility.photo === "public" ? profile?.photoUrl || employee.photoUrl : employee.photoUrl;
  const selfIntroduction =
    visibility.selfIntroduction === "public"
      ? profile?.selfIntroduction || `${employee.department}で${employee.position}を担当しています。`
      : "自己紹介は非公開です。";
  const strengths =
    visibility.strengths === "public"
      ? splitText(profile?.strengths ?? employee.strengths.join("、")).slice(0, 3)
      : [];
  const qualifications =
    visibility.qualifications === "public"
      ? splitText(profile?.qualifications ?? employee.certifications.map((item) => item.name).join("、")).slice(0, 2)
      : [];

  return (
    <Link
      href={`/employees/${employee.id}`}
      className="group flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={`${employee.fullName}の顔写真`}
          className="size-20 rounded-lg object-cover ring-4 ring-sky-50"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{employee.employeeCode}</p>
          <h2 className="mt-1 text-xl font-bold text-[#0f2f57]">{employee.fullName}</h2>
          <p className="text-sm text-slate-500">{employee.fullNameKana}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <UserRound size={16} className="text-sky-600" />
          {employee.department} / {employee.position}
        </p>
        <p className="flex items-center gap-2">
          <MapPin size={16} className="text-sky-600" />
          {employee.location}
        </p>
        <p className="flex items-center gap-2">
          <BriefcaseBusiness size={16} className="text-sky-600" />
          得意領域: {strengths.length > 0 ? strengths.join("、") : "非公開"}
        </p>
        <p className="flex items-center gap-2">
          <Award size={16} className="text-sky-600" />
          資格: {qualifications.length > 0 ? qualifications.join("、") : "非公開"}
        </p>
      </div>

      <div className="mt-5 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">
        {selfIntroduction}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {strengths.length > 0 ? (
          strengths.map((skill) => (
            <Pill key={skill} tone="blue">
              {skill}
            </Pill>
          ))
        ) : (
          <Pill>得意領域 非公開</Pill>
        )}
      </div>

      <div className="mt-auto flex items-center gap-2 pt-5 text-sm font-semibold text-sky-700 group-hover:text-[#0f2f57]">
        <Eye size={16} />
        公開プロフィールを見る
      </div>
    </Link>
  );
}

function readStoredProfile(employeeId: string): StoredProfile | null {
  if (typeof window === "undefined") {
    return null;
  }
  const raw = window.localStorage.getItem(`${profileStoragePrefix}${employeeId}`);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return null;
  }
}

function splitText(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultVisibility() {
  return {
    photo: "public",
    selfIntroduction: "public",
    careerHistories: "public",
    qualifications: "public",
    strengths: "public",
    skillsToGrow: "private",
    desiredCareerPublic: "private",
  };
}
