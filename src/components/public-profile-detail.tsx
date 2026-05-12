"use client";

import Link from "next/link";
import { Eye, LockKeyhole, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeProfile, Viewer } from "@/types/talent";

type PublicProfileDetailProps = {
  employee: EmployeeProfile;
  viewer: Viewer;
};

type StoredProfile = {
  photoUrl?: string;
  selfIntroduction?: string;
  careerHistories?: string;
  qualifications?: string;
  strengths?: string;
  skillsToGrow?: string;
  desiredCareerPublic?: string;
  desiredCareerPrivate?: string;
  mobility?: string;
  preMeetingMemo?: string;
  visibility?: Record<string, "public" | "private" | "fixed_private">;
};

const profileStoragePrefix = "profile-edit-v4-";

export function PublicProfileDetail({ employee, viewer }: PublicProfileDetailProps) {
  const profile = readStoredProfile(employee.id);
  const visibility: Record<string, "public" | "private" | "fixed_private"> =
    profile?.visibility ?? defaultVisibility();
  const rows = [
    {
      key: "selfIntroduction",
      label: "自己紹介",
      value: profile?.selfIntroduction ?? `${employee.department}で${employee.position}を担当しています。`,
    },
    {
      key: "careerHistories",
      label: "社内経歴",
      value: profile?.careerHistories ?? employee.careerHistories.map((history) => `${history.title}: ${history.summary}`).join("\n"),
    },
    {
      key: "qualifications",
      label: "保有資格",
      value: profile?.qualifications ?? employee.certifications.map((certification) => certification.name).join("、"),
    },
    {
      key: "strengths",
      label: "得意領域",
      value: profile?.strengths ?? employee.strengths.join("、"),
    },
    {
      key: "skillsToGrow",
      label: "伸ばしたいスキル",
      value: profile?.skillsToGrow ?? employee.careerPreference.skillsToDevelop.join("、"),
    },
    {
      key: "desiredCareerPublic",
      label: "希望キャリア 公開用コメント",
      value: profile?.desiredCareerPublic ?? "",
    },
  ].filter((row) => visibility[row.key] === "public" && row.value.trim());
  const photoUrl = visibility.photo === "public" ? profile?.photoUrl || employee.photoUrl : employee.photoUrl;

  return (
    <div className="space-y-6">
      <Card className="border-sky-100 bg-gradient-to-br from-white to-sky-50/60 shadow-none">
        <CardContent className="grid gap-6 pt-6 md:grid-cols-[160px_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`${employee.fullName}の顔写真`}
            className="size-36 rounded-3xl object-cover ring-4 ring-white"
          />
          <div>
            <Badge variant="blue" className="w-fit">
              <Eye size={13} />
              公開プロフィール
            </Badge>
            <h2 className="mt-4 text-3xl font-bold text-[#0f2f57]">{employee.fullName}</h2>
            <p className="mt-2 text-slate-500">
              {employee.department} / {employee.position}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              本人が公開設定した項目だけを表示しています。非公開情報はこの画面には表示されません。
            </p>
            {viewer.employeeId === employee.id ? (
              <Button asChild className="mt-5">
                <Link href="/profile/edit">
                  <PenLine size={17} />
                  自分のプロフィールを編集
                </Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {rows.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-2">
          {rows.map((row) => (
            <Card key={row.key} className="shadow-none">
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-3 text-lg">
                  {row.label}
                  <Badge variant="success">公開中</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-7 text-slate-600">{row.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <LockKeyhole className="mx-auto text-slate-400" size={26} />
          <p className="mt-3 font-semibold text-[#0f2f57]">公開されている追加情報はありません</p>
          <p className="mt-2 text-sm text-slate-500">氏名、所属、役職のみ表示しています。</p>
        </div>
      )}
    </div>
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

function defaultVisibility(): Record<string, "public" | "private" | "fixed_private"> {
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
