import {
  Bot,
  CalendarDays,
  FilePenLine,
  GitBranch,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";
import Link from "next/link";
import { Pill } from "@/components/ui";
import { getTenureYears, nextAction, ratingTone } from "@/lib/talent-utils";
import type { EmployeeProfile } from "@/types/talent";

type ProfileHeroProps = {
  employee: EmployeeProfile;
  showPrivate?: boolean;
};

export function ProfileHero({ employee, showPrivate = true }: ProfileHeroProps) {
  const tenure = getTenureYears(employee.joinedOn);
  const meetingHref = `/meetings/new?employeeId=${employee.id}`;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
      <div className="grid gap-6 lg:grid-cols-[180px_1fr_auto] lg:items-start">
        <div className="flex justify-center lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={employee.photoUrl}
            alt={`${employee.fullName}の顔写真`}
            className="size-40 rounded-lg object-cover ring-4 ring-sky-50"
          />
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="navy">{employee.employeeCode}</Pill>
            <Pill tone="blue">{employee.careerStage}</Pill>
            {showPrivate ? (
              <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${ratingTone(employee.latestRating)}`}>
                現在評価 {employee.latestRating}
              </span>
            ) : null}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[#0f2f57] sm:text-4xl">
            {employee.fullName}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{employee.fullNameKana}</p>

          <div className="mt-5 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <div>
              <p className="text-xs font-semibold text-slate-400">所属</p>
              <p className="mt-1 font-semibold text-slate-900">{employee.department}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">役職 / 等級</p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.position} / {employee.grade}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">入社日 / 勤続</p>
              <p className="mt-1 font-semibold text-slate-900">
                {employee.joinedOn} / {tenure}年
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">
                {showPrivate ? "次回面談" : "勤務地"}
              </p>
              <p className="mt-1 font-semibold text-slate-900">
                {showPrivate ? employee.nextInterviewOn ?? "未設定" : employee.location}
              </p>
            </div>
          </div>

          {showPrivate ? (
            <div className="mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-[#0f2f57]">
                <Sparkles size={17} className="text-sky-600" />
                AI要約コメント
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{employee.aiSummary}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-bold text-[#0f2f57]">公開プロフィール</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                所属、役職、社内経歴、資格、得意領域など、本人が公開可能な情報のみ表示しています。
              </p>
            </div>
          )}
        </div>

        {showPrivate ? (
          <div className="grid gap-3 lg:w-52">
          <Link
            href={meetingHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0f2f57] px-4 text-sm font-semibold text-white transition hover:bg-[#123b6d]"
          >
            <FilePenLine size={17} />
            面談を記録
          </Link>
          <Link
            href={meetingHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            <Bot size={17} />
            AIキャリア提案
          </Link>
          <Link
            href={meetingHref}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <GitBranch size={17} />
            育成計画を作成
          </Link>
          </div>
        ) : null}
      </div>

      {showPrivate ? (
        <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 md:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <UserRoundCheck size={20} className="text-sky-600" />
          <div>
            <p className="text-xs text-slate-500">希望キャリア</p>
            <p className="font-semibold text-[#0f2f57]">{employee.careerPreference.desiredRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <CalendarDays size={20} className="text-sky-600" />
          <div>
            <p className="text-xs text-slate-500">次アクション</p>
            <p className="font-semibold text-[#0f2f57]">{nextAction(employee)}</p>
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-4">
          <p className="text-xs text-slate-500">育成課題</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {employee.developmentAreas.slice(0, 3).map((area) => (
              <Pill key={area}>{area}</Pill>
            ))}
          </div>
        </div>
        </div>
      ) : null}
    </section>
  );
}
