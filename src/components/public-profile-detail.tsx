"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Award, BriefcaseBusiness, Eye, Lightbulb, LockKeyhole, PenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { readStoredPublicProfile, type ProfileVisibilityStatus } from "@/lib/profile-storage";
import type { EmployeeProfile, Viewer } from "@/types/talent";

type PublicProfileDetailProps = {
  employee: EmployeeProfile;
  viewer: Viewer;
};

export function PublicProfileDetail({ employee, viewer }: PublicProfileDetailProps) {
  const profile = readStoredPublicProfile(employee);
  const visibility = profile.visibility;
  const photoUrl = visibility.photo === "public" ? profile.photoUrl || employee.photoUrl : "";
  const visible = {
    selfIntroduction: getPublicValue(profile.selfIntroduction, visibility.selfIntroduction),
    careerHistories: getPublicValue(profile.careerHistories, visibility.careerHistories),
    qualifications: splitText(getPublicValue(profile.qualifications, visibility.qualifications)),
    strengths: splitText(getPublicValue(profile.strengths, visibility.strengths)),
    skillsToGrow: splitText(getPublicValue(profile.skillsToGrow, visibility.skillsToGrow)),
    desiredCareerPublic: getPublicValue(profile.desiredCareerPublic, visibility.desiredCareerPublic),
  };
  const hasAdditionalInfo =
    visible.selfIntroduction ||
    visible.careerHistories ||
    visible.qualifications.length > 0 ||
    visible.strengths.length > 0 ||
    visible.skillsToGrow.length > 0 ||
    visible.desiredCareerPublic;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-sky-100 bg-gradient-to-br from-white via-white to-sky-50/70 shadow-sm">
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[168px_1fr]">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={`${employee.fullName}の顔写真`}
              className="size-36 rounded-[1.75rem] object-cover ring-4 ring-white sm:size-40"
            />
          ) : (
            <div className="flex size-36 items-center justify-center rounded-[1.75rem] bg-slate-100 text-4xl font-bold text-slate-500 ring-4 ring-white sm:size-40">
              {employee.fullName.slice(0, 1)}
            </div>
          )}
          <div>
            <Badge variant="blue" className="w-fit">
              <Eye size={13} />
              公開プロフィール
            </Badge>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0f2f57]">{employee.fullName}</h2>
            <p className="mt-2 text-slate-500">
              {employee.department} / {employee.position}
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
              公開されている情報のみ表示しています。本人が非公開にした項目、空欄の項目、非公開固定の項目は表示されません。
            </p>
            {viewer.employeeId === employee.id ? (
              <Button asChild className="mt-5">
                <Link href="/profile/edit">
                  <PenLine size={17} />
                  プロフィールを編集する
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {hasAdditionalInfo ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            {visible.selfIntroduction ? (
              <ProfilePanel title="自己紹介" icon={<Sparkles size={18} />} accent="blue">
                <p className="whitespace-pre-line text-base leading-8 text-slate-700">{visible.selfIntroduction}</p>
              </ProfilePanel>
            ) : null}

            {visible.careerHistories ? (
              <ProfilePanel title="社内経歴" icon={<BriefcaseBusiness size={18} />} accent="slate">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{visible.careerHistories}</p>
              </ProfilePanel>
            ) : null}

            {visible.desiredCareerPublic ? (
              <ProfilePanel title="将来やりたいこと" icon={<Lightbulb size={18} />} accent="sky">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{visible.desiredCareerPublic}</p>
              </ProfilePanel>
            ) : null}
          </div>

          <div className="space-y-5">
            {visible.strengths.length > 0 ? (
              <TagPanel title="得意領域" icon={<BriefcaseBusiness size={18} />} items={visible.strengths} tone="blue" />
            ) : null}
            {visible.qualifications.length > 0 ? (
              <TagPanel title="保有資格" icon={<Award size={18} />} items={visible.qualifications} tone="slate" />
            ) : null}
            {visible.skillsToGrow.length > 0 ? (
              <TagPanel title="伸ばしたいスキル" icon={<Lightbulb size={18} />} items={visible.skillsToGrow} tone="green" />
            ) : null}
          </div>
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

function getPublicValue(value: string, visibility: ProfileVisibilityStatus) {
  return visibility === "public" && value.trim() ? value.trim() : "";
}

function splitText(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProfilePanel({
  title,
  icon,
  accent,
  children,
}: {
  title: string;
  icon: ReactNode;
  accent: "blue" | "slate" | "sky";
  children: ReactNode;
}) {
  const accentClass =
    accent === "blue"
      ? "bg-sky-50 text-sky-700"
      : accent === "sky"
        ? "bg-cyan-50 text-cyan-700"
        : "bg-slate-100 text-slate-700";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-10 items-center justify-center rounded-2xl ${accentClass}`}>{icon}</span>
          <h3 className="text-lg font-bold text-[#0f2f57]">{title}</h3>
        </div>
        <Badge variant="success">公開中</Badge>
      </div>
      {children}
    </section>
  );
}

function TagPanel({
  title,
  icon,
  items,
  tone,
}: {
  title: string;
  icon: ReactNode;
  items: string[];
  tone: "blue" | "slate" | "green";
}) {
  const tagClass =
    tone === "blue"
      ? "border-sky-100 bg-sky-50 text-sky-800"
      : tone === "green"
        ? "border-emerald-100 bg-emerald-50 text-emerald-800"
        : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-slate-50 text-sky-700">{icon}</span>
        <h3 className="text-lg font-bold text-[#0f2f57]">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`rounded-full border px-3 py-1.5 text-sm font-semibold ${tagClass}`}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
