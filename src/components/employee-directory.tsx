import {
  CalendarDays,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  Search,
  Target,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { EmployeeCard } from "@/components/employee-card";
import { Pill } from "@/components/ui";
import { nextAction, ratingTone } from "@/lib/talent-utils";
import type { EmployeeProfile, ViewerRole } from "@/types/talent";

type EmployeeDirectoryProps = {
  employees: EmployeeProfile[];
  departments: string[];
  ratings: string[];
  role: ViewerRole;
  query?: string;
  department?: string;
  rating?: string;
  interview?: string;
  specialty?: string;
  view: "cards" | "table";
};

export function EmployeeDirectory({
  employees,
  departments,
  ratings,
  role,
  query,
  department,
  rating,
  interview,
  specialty,
  view,
}: EmployeeDirectoryProps) {
  const showPrivateSignals = role !== "employee";
  const isPublicDirectory = role === "employee";
  const effectiveView = isPublicDirectory ? "cards" : view;
  const viewParams = new URLSearchParams({
    q: query ?? "",
    department: department ?? "all",
    specialty: specialty ?? "",
  });
  if (!isPublicDirectory) {
    viewParams.set("rating", rating ?? "all");
    viewParams.set("interview", interview ?? "all");
  }

  return (
    <div className="space-y-5">
      <form
        className={`grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 ${
          isPublicDirectory ? "xl:grid-cols-[1fr_220px_220px_auto]" : "xl:grid-cols-[1fr_200px_160px_180px_auto]"
        }`}
      >
        <input type="hidden" name="view" value={view} />
        <label className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            name="q"
            defaultValue={query}
            placeholder={isPublicDirectory ? "氏名、得意領域、資格、自己紹介で検索" : "氏名、部署、役職、スキルで検索"}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          />
        </label>
        <select
          name="department"
          defaultValue={department ?? "all"}
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <option value="all">すべての部署</option>
          {departments.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        {isPublicDirectory ? (
          <label className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              name="specialty"
              defaultValue={specialty}
              placeholder="資格・得意領域で絞る"
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
          </label>
        ) : null}
        {!isPublicDirectory ? (
          <>
            <select
              name="rating"
              defaultValue={rating ?? "all"}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="all">すべての評価</option>
              {ratings.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select
              name="interview"
              defaultValue={interview ?? "all"}
              className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            >
              <option value="all">面談予定すべて</option>
              <option value="scheduled">面談予定あり</option>
              <option value="missing">面談未設定</option>
            </select>
          </>
        ) : null}
        <button className="h-11 rounded-lg bg-[#0f2f57] px-5 text-sm font-semibold text-white transition hover:bg-[#123b6d]">
          絞り込み
        </button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
          {employees.length}名を表示中。
          {showPrivateSignals
            ? "カードでは人材像、テーブルでは比較を優先します。"
            : "公開中の自己紹介、得意領域、資格、社内経歴だけを表示します。"}
        </p>
        {!isPublicDirectory ? (
          <div className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1">
            <Link
              href={`/employees?${viewParams.toString()}&view=cards`}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                view === "cards" ? "bg-[#0f2f57] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid size={16} />
              カード
            </Link>
            <Link
              href={`/employees?${viewParams.toString()}&view=table`}
              className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
                view === "table" ? "bg-[#0f2f57] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <List size={16} />
              テーブル
            </Link>
          </div>
        ) : null}
      </div>

      {employees.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h3 className="text-lg font-bold text-[#0f2f57]">該当する公開プロフィールがありません</h3>
          <p className="mt-2 text-sm text-slate-500">検索語、部署、資格・得意領域の条件を少し広げてください。</p>
        </div>
      ) : effectiveView === "cards" ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {employees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} role={role} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">社員</th>
                <th className="px-4 py-3 font-semibold">所属</th>
                {showPrivateSignals ? <th className="px-4 py-3 font-semibold">評価</th> : null}
                {isPublicDirectory ? (
                  <>
                    <th className="px-4 py-3 font-semibold">得意領域</th>
                    <th className="px-4 py-3 font-semibold">保有資格</th>
                    <th className="px-4 py-3 font-semibold">自己紹介</th>
                    <th className="px-4 py-3 font-semibold">公開プロフィール</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 font-semibold">次回面談</th>
                    <th className="px-4 py-3 font-semibold">キャリア志向</th>
                    <th className="px-4 py-3 font-semibold">次アクション</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {employees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <Link href={`/employees/${employee.id}`} className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={employee.photoUrl}
                        alt={`${employee.fullName}の顔写真`}
                        className="size-11 rounded-lg object-cover"
                      />
                      <span>
                        <span className="block font-bold text-[#0f2f57]">{employee.fullName}</span>
                        <span className="text-xs text-slate-500">{employee.employeeCode}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <span className="flex items-center gap-2">
                      <UserRound size={16} className="text-sky-600" />
                      {employee.department} / {employee.position}
                    </span>
                    <span className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} className="text-sky-600" />
                      {employee.location} / {employee.grade}
                    </span>
                  </td>
                  {showPrivateSignals ? <td className="px-4 py-4">
                    <span className={`rounded-md border px-2.5 py-1 text-xs font-bold ${ratingTone(employee.latestRating)}`}>
                      {employee.latestRating}
                    </span>
                  </td> : null}
                  {isPublicDirectory ? (
                    <>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {employee.strengths.slice(0, 3).map((strength) => (
                            <Pill key={strength} tone="blue">{strength}</Pill>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {employee.certifications.slice(0, 2).map((certification) => (
                            <Pill key={certification.name}>{certification.name}</Pill>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 leading-6 text-slate-600">
                        {employee.department}で{employee.position}を担当。{employee.strengths[0]}を得意領域にしています。
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/employees/${employee.id}`} className="inline-flex items-center gap-2 font-semibold text-sky-700">
                          <Eye size={16} />
                          見る
                        </Link>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-4 text-slate-600">
                        <span className="flex items-center gap-2">
                          <CalendarDays size={16} className="text-sky-600" />
                          {employee.nextInterviewOn ?? "未設定"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Pill tone="blue">
                          <Target size={13} className="mr-1" />
                          {employee.careerStage}
                        </Pill>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{nextAction(employee)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
