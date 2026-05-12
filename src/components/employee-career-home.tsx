"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import Link from "next/link";
import { Eye, Image as ImageIcon, LockKeyhole, PenLine, UserRoundPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeProfile, Viewer } from "@/types/talent";

type EmployeeCareerHomeProps = {
  employee: EmployeeProfile;
  viewer: Viewer;
};

type ProfileDraft = {
  photoUrl?: string;
  selfIntroduction?: string;
  currentWork?: string;
  careerHistories?: string;
  qualifications?: string;
  strengths?: string;
  skillsToGrow?: string;
  desiredCareerPublic?: string;
  desiredCareerPrivate?: string;
  mobility?: string;
  preMeetingMemo?: string;
  updatedAt?: string;
  visibility?: Record<string, "public" | "private" | "fixed_private">;
};

const profileStoragePrefix = "profile-edit-v4-";
const publicKeys = [
  "photo",
  "selfIntroduction",
  "careerHistories",
  "qualifications",
  "strengths",
  "skillsToGrow",
  "desiredCareerPublic",
];
const fixedPrivateKeys = ["desiredCareerPrivate", "mobility", "preMeetingMemo"];
const requiredProfileKeys: Array<keyof ProfileDraft> = [
  "photoUrl",
  "selfIntroduction",
  "currentWork",
  "careerHistories",
  "qualifications",
  "strengths",
  "skillsToGrow",
  "desiredCareerPublic",
  "desiredCareerPrivate",
  "mobility",
  "preMeetingMemo",
];

export function EmployeeCareerHome({ employee, viewer }: EmployeeCareerHomeProps) {
  const storedProfile = useMemo(() => readStoredProfile(employee.id), [employee.id]);
  const visibility: Record<string, "public" | "private" | "fixed_private"> =
    storedProfile?.visibility ?? defaultVisibility();
  const publicCount = publicKeys.filter((key) => visibility[key] === "public").length;
  const privateCount = publicKeys.filter((key) => visibility[key] !== "public").length;
  const fixedPrivateCount = fixedPrivateKeys.length;
  const completion = Math.round(
    (requiredProfileKeys.filter((key) => String(storedProfile?.[key] ?? fallbackValue(employee, key)).trim()).length /
      requiredProfileKeys.length) *
      100,
  );
  const recentlyUpdated = [
    storedProfile?.photoUrl ? "顔写真" : "",
    storedProfile?.selfIntroduction ? "自己紹介" : "",
    storedProfile?.careerHistories ? "社内経歴" : "",
    storedProfile?.qualifications ? "保有資格" : "",
    storedProfile?.desiredCareerPublic ? "希望キャリア 公開用コメント" : "",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50/60 shadow-none">
        <CardHeader>
          <Badge variant="blue" className="w-fit">
            <UserRoundPen size={13} />
            {viewer.name} のマイページ
          </Badge>
          <CardTitle className="text-3xl">マイページ</CardTitle>
          <CardDescription>
            自分のプロフィール完成度と公開状態を確認し、必要な項目を更新します。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={storedProfile?.photoUrl || employee.photoUrl}
              alt={`${employee.fullName}の顔写真`}
              className="size-36 rounded-3xl object-cover ring-4 ring-sky-50"
            />
            <Badge variant={visibility.photo === "public" ? "success" : "default"} className="mt-4">
              {visibility.photo === "public" ? "顔写真 公開中" : "顔写真 非公開"}
            </Badge>
          </div>

          <div className="min-w-0">
            <p className="text-2xl font-bold text-[#0f2f57]">{employee.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">
              {employee.department} / {employee.position}
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <StatusCard icon={<PenLine size={19} />} label="プロフィール完成度" value={`${completion}%`} />
              <StatusCard icon={<Eye size={19} />} label="公開中の項目" value={`${publicCount}項目`} />
              <StatusCard icon={<LockKeyhole size={19} />} label="非公開の項目" value={`${privateCount + fixedPrivateCount}項目`} />
            </div>
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-[#0f2f57]">最近更新した項目</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentlyUpdated.length > 0 ? (
                  recentlyUpdated.map((item) => (
                    <Badge key={item} variant="blue">
                      {item}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">まだ保存された更新はありません。</span>
                )}
              </div>
              {storedProfile?.updatedAt ? (
                <p className="mt-3 text-xs text-slate-500">最終保存: {storedProfile.updatedAt}</p>
              ) : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/profile/edit">
                  <UserRoundPen size={17} />
                  プロフィール編集
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href={`/employees/${employee.id}`}>
                  <ImageIcon size={17} />
                  公開プロフィールプレビュー
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatusCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sky-700">{icon}</div>
      <p className="mt-3 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0f2f57]">{value}</p>
    </div>
  );
}

function readStoredProfile(employeeId: string): ProfileDraft | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(`${profileStoragePrefix}${employeeId}`);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as ProfileDraft;
  } catch {
    return null;
  }
}

function fallbackValue(employee: EmployeeProfile, key: keyof ProfileDraft) {
  if (key === "photoUrl") return employee.photoUrl;
  if (key === "selfIntroduction") return `${employee.department}で${employee.position}を担当しています。`;
  if (key === "currentWork") return "";
  if (key === "careerHistories") return employee.careerHistories.map((history) => history.summary).join("\n");
  if (key === "qualifications") return employee.certifications.map((certification) => certification.name).join("、");
  if (key === "strengths") return employee.strengths.join("、");
  if (key === "skillsToGrow") return employee.careerPreference.skillsToDevelop.join("、");
  if (key === "desiredCareerPublic") return "";
  if (key === "desiredCareerPrivate") return "";
  if (key === "mobility") return "";
  if (key === "preMeetingMemo") return "";
  return "";
}

function defaultVisibility(): Record<string, "public" | "private" | "fixed_private"> {
  return {
    photo: "public",
    selfIntroduction: "public",
    careerHistories: "public",
    qualifications: "public",
    strengths: "public",
    skillsToGrow: "private",
    desiredCareerPublic: "private",
    desiredCareerPrivate: "fixed_private",
    mobility: "fixed_private",
    preMeetingMemo: "fixed_private",
  };
}
