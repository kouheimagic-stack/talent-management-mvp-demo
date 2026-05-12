"use client";

import { useState } from "react";
import {
  Award,
  Bot,
  BriefcaseBusiness,
  CalendarCheck,
  MessageCircle,
  ClipboardList,
  LockKeyhole,
  ShieldCheck,
  Target,
} from "lucide-react";
import { Pill } from "@/components/ui";
import { ChatPanel } from "@/components/chat-panel";
import type { EmployeeProfile, Viewer } from "@/types/talent";

type EmployeeProfileTabsProps = {
  employee: EmployeeProfile;
  viewer: Viewer;
  canViewSensitive: boolean;
};

const tabs = [
  { id: "career", label: "経歴", icon: BriefcaseBusiness },
  { id: "reviews", label: "評価履歴", icon: ClipboardList },
  { id: "interviews", label: "面談履歴", icon: CalendarCheck },
  { id: "goals", label: "目標管理", icon: Target },
  { id: "certifications", label: "資格", icon: Award },
  { id: "chat", label: "チャット", icon: MessageCircle },
  { id: "ai", label: "AI提案", icon: Bot },
  { id: "permissions", label: "権限設定", icon: ShieldCheck },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function EmployeeProfileTabs({
  employee,
  viewer,
  canViewSensitive,
}: EmployeeProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("career");

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto border-b border-slate-200 px-3">
        <div className="flex min-w-max gap-1 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#0f2f57] text-white"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 lg:p-6">
        {activeTab === "career" ? <CareerTab employee={employee} /> : null}
        {activeTab === "reviews" ? (
          <ReviewsTab employee={employee} canViewSensitive={canViewSensitive} />
        ) : null}
        {activeTab === "interviews" ? <InterviewsTab employee={employee} /> : null}
        {activeTab === "goals" ? <GoalsTab employee={employee} /> : null}
        {activeTab === "certifications" ? <CertificationsTab employee={employee} /> : null}
        {activeTab === "chat" ? <ChatPanel employee={employee} viewer={viewer} /> : null}
        {activeTab === "ai" ? <AiTab employee={employee} /> : null}
        {activeTab === "permissions" ? (
          <PermissionsTab employee={employee} viewer={viewer} canViewSensitive={canViewSensitive} />
        ) : null}
      </div>
    </section>
  );
}

function CareerTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="space-y-4">
      {employee.careerHistories.map((history) => (
        <div
          key={`${history.company}-${history.title}-${history.startedOn}`}
          className="rounded-lg border border-slate-200 p-4"
        >
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-slate-900">{history.title}</h3>
            <span className="text-sm text-slate-500">
              {history.startedOn} - {history.endedOn ?? "現在"}
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-sky-700">{history.company}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{history.summary}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {history.skills.map((skill) => (
              <Pill key={skill}>{skill}</Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({
  employee,
  canViewSensitive,
}: {
  employee: EmployeeProfile;
  canViewSensitive: boolean;
}) {
  if (!canViewSensitive) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-sky-100 bg-sky-50 p-4">
        <LockKeyhole className="mt-0.5 text-sky-700" size={20} />
        <div>
          <h3 className="font-bold text-[#0f2f57]">閲覧権限がありません</h3>
          <p className="mt-1 text-sm text-slate-600">
            給与・評価情報は本人、人事、管理者、許可された上長のみ閲覧できます。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">期間</th>
            <th className="px-4 py-3 font-semibold">評価</th>
            <th className="px-4 py-3 font-semibold">スコア</th>
            <th className="px-4 py-3 font-semibold">評価者</th>
            <th className="px-4 py-3 font-semibold">給与レンジ</th>
            <th className="px-4 py-3 font-semibold">サマリ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {employee.performanceReviews.map((review) => (
            <tr key={review.period}>
              <td className="px-4 py-3 font-semibold text-slate-900">{review.period}</td>
              <td className="px-4 py-3">
                <Pill tone="blue">{review.rating}</Pill>
              </td>
              <td className="px-4 py-3 text-slate-600">{review.score}</td>
              <td className="px-4 py-3 text-slate-600">{review.reviewer}</td>
              <td className="px-4 py-3 text-slate-600">{review.salaryBand}</td>
              <td className="px-4 py-3 leading-6 text-slate-600">{review.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InterviewsTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {employee.interviews.map((interview) => (
        <div key={`${interview.heldOn}-${interview.topic}`} className="rounded-lg border border-slate-200 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-bold text-slate-900">{interview.topic}</h3>
            <span className="text-sm text-slate-500">{interview.heldOn}</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-sky-700">{interview.interviewer}</p>
          <p className="mt-3 text-sm leading-6 text-slate-600">{interview.memo}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {interview.actionItems.map((item) => (
              <Pill key={item} tone="blue">
                {item}
              </Pill>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function GoalsTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {employee.goals.map((goal) => (
        <div key={goal.title} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">{goal.title}</h3>
              <p className="mt-1 text-sm text-slate-500">
                期限: {goal.dueOn} / 担当: {goal.owner}
              </p>
            </div>
            <span className="text-lg font-bold text-[#0f2f57]">{goal.progress}%</span>
          </div>
          <div className="mt-4 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-sky-500" style={{ width: `${goal.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function CertificationsTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {employee.certifications.map((certification) => (
        <div key={certification.name} className="rounded-lg border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900">{certification.name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                {certification.issuer} / 取得: {certification.acquiredOn}
              </p>
            </div>
            <Pill tone={certification.status === "active" ? "blue" : "slate"}>
              {certification.status === "expiring" ? "更新確認" : "有効"}
            </Pill>
          </div>
        </div>
      ))}
    </div>
  );
}

function AiTab({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        ["キャリア提案", `${employee.careerPreference.desiredRole}に向け、${employee.developmentAreas[0]}の実務機会を増やす。`],
        ["育成マイルストーン", "30日: 課題整理、60日: 実務アサイン、90日: 成果レビューを設定。"],
        ["面談メモ要約", employee.aiSummary],
      ].map(([title, body]) => (
        <div key={title} className="rounded-lg border border-sky-100 bg-sky-50 p-4">
          <h3 className="font-bold text-[#0f2f57]">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        </div>
      ))}
    </div>
  );
}

function PermissionsTab({
  employee,
  viewer,
  canViewSensitive,
}: {
  employee: EmployeeProfile;
  viewer: Viewer;
  canViewSensitive: boolean;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        ["対象社員", employee.fullName],
        ["現在の閲覧者", `${viewer.name} / ${viewer.role}`],
        ["給与・評価閲覧", canViewSensitive ? "許可" : "不可"],
      ].map(([label, value]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-lg font-bold text-[#0f2f57]">{value}</p>
        </div>
      ))}
    </div>
  );
}
