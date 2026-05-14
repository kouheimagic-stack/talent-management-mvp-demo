"use client";

import { Award, BriefcaseBusiness, Eye, MapPin, UserRound } from "lucide-react";
import Link from "next/link";
import { Pill } from "@/components/ui";
import { readStoredPublicProfile } from "@/lib/profile-storage";
import type { EmployeeProfile, ViewerRole } from "@/types/talent";

type EmployeeCardProps = {
  employee: EmployeeProfile;
  role: ViewerRole;
};

export function EmployeeCard({ employee }: EmployeeCardProps) {
  const profile = readStoredPublicProfile(employee);
  const visibility = profile.visibility;
  const photoUrl = visibility.photo === "public" ? profile.photoUrl || employee.photoUrl : "";
  const selfIntroduction =
    visibility.selfIntroduction === "public" && profile.selfIntroduction.trim()
      ? profile.selfIntroduction
      : "";
  const strengths =
    visibility.strengths === "public" ? splitText(profile.strengths).slice(0, 4) : [];
  const qualifications =
    visibility.qualifications === "public" ? splitText(profile.qualifications).slice(0, 3) : [];
  const desiredCareer =
    visibility.desiredCareerPublic === "public" && profile.desiredCareerPublic.trim()
      ? profile.desiredCareerPublic
      : "";

  return (
    <Link
      href={`/employees/${employee.id}`}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={`${employee.fullName}の顔写真`}
            className="size-20 shrink-0 rounded-2xl object-cover ring-4 ring-sky-50"
          />
        ) : (
          <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-500 ring-4 ring-sky-50">
            {employee.fullName.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{employee.employeeCode}</p>
          <h2 className="mt-1 text-xl font-bold text-[#0f2f57]">{employee.fullName}</h2>
          <p className="text-sm text-slate-500">{employee.fullNameKana}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 text-sm text-slate-600">
        <p className="flex items-start gap-2">
          <UserRound size={16} className="mt-0.5 shrink-0 text-sky-600" />
          <span>{employee.department} / {employee.position}</span>
        </p>
        <p className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-sky-600" />
          <span>{employee.location}</span>
        </p>
        {strengths.length > 0 ? (
          <p className="flex items-start gap-2">
            <BriefcaseBusiness size={16} className="mt-0.5 shrink-0 text-sky-600" />
            <span>得意領域: {strengths.join("、")}</span>
          </p>
        ) : null}
        {qualifications.length > 0 ? (
          <p className="flex items-start gap-2">
            <Award size={16} className="mt-0.5 shrink-0 text-sky-600" />
            <span>資格: {qualifications.join("、")}</span>
          </p>
        ) : null}
      </div>

      {selfIntroduction ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          {selfIntroduction}
        </div>
      ) : null}

      {desiredCareer ? (
        <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-sky-900">
          {desiredCareer}
        </div>
      ) : null}

      {strengths.length > 0 || qualifications.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {strengths.map((skill) => (
            <Pill key={skill} tone="blue">
              {skill}
            </Pill>
          ))}
          {qualifications.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      ) : null}

      <div className="mt-auto pt-5">
        <span className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0f2f57] px-4 text-sm font-semibold text-white transition group-hover:bg-[#123b6d]">
          <Eye size={16} />
          公開プロフィールを見る
        </span>
      </div>
    </Link>
  );
}

function splitText(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
