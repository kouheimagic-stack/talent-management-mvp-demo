import { ArrowRight, CalendarClock, MessageSquareText, Radar, Sparkles } from "lucide-react";
import Link from "next/link";
import { TeamSignalChart } from "@/components/team-signal-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { nextAction } from "@/lib/talent-utils";
import type { EmployeeProfile } from "@/types/talent";

type DashboardCommandCenterProps = {
  employees: EmployeeProfile[];
};

export function DashboardCommandCenter({ employees }: DashboardCommandCenterProps) {
  const urgent = [...employees].sort((a, b) => a.oneOnOneReadiness - b.oneOnOneReadiness);
  const chartData = employees.map((employee) => ({
    name: employee.fullName.split(" ")[0],
    readiness: employee.oneOnOneReadiness,
    engagement: employee.engagement,
    growth: employee.growthVelocity,
  }));
  const riskCount = employees.filter((employee) => employee.riskLevel !== "low").length;

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#ffffff_48%,#e0f2fe_100%)] p-6 shadow-sm lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <Badge variant="blue">
              <Sparkles size={13} />
              AI 1on1 Copilot
            </Badge>
            <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#0f2f57] lg:text-5xl">
              今日の面談で、何を聞き、何を次へ進めるか。
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              部下一覧ではなく、面談前の判断材料と面談後のアクションを一画面に集約します。
              AI要約と育成提案は面談メモから生成されます。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/meetings/new">
                  面談を記録
                  <ArrowRight size={17} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/employees">部下一覧を見る</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-slate-500">今日のフォーカス</p>
            <div className="mt-4 space-y-4">
              {urgent.slice(0, 2).map((employee) => (
                <Link
                  key={employee.id}
                  href={`/employees/${employee.id}`}
                  className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-300"
                >
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={employee.photoUrl}
                      alt={`${employee.fullName}の顔写真`}
                      className="size-12 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-[#0f2f57]">{employee.fullName}</p>
                      <p className="truncate text-sm text-slate-500">{employee.focusTheme}</p>
                    </div>
                    <Badge variant={employee.riskLevel === "medium" ? "warning" : "blue"}>
                      {employee.oneOnOneReadiness}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock size={18} className="text-sky-600" />
              面談予定
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#0f2f57]">
              {employees.filter((employee) => employee.nextInterviewOn).length}
            </p>
            <p className="mt-2 text-sm text-slate-500">次回面談が設定済み</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar size={18} className="text-sky-600" />
              注意シグナル
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#0f2f57]">{riskCount}</p>
            <p className="mt-2 text-sm text-slate-500">離職・負荷の兆候を要確認</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareText size={18} className="text-sky-600" />
              未完了アクション
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#0f2f57]">
              {employees.reduce((sum, employee) => sum + employee.goals.filter((goal) => goal.progress < 60).length, 0)}
            </p>
            <p className="mt-2 text-sm text-slate-500">次回面談で確認すべき項目</p>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-[#0f2f57]">チーム状態の変化</h3>
            <p className="mt-1 text-sm text-slate-500">面談準備度、関心・意欲、成長速度を横断して確認します。</p>
          </div>
        </div>
        <TeamSignalChart data={chartData} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h3 className="text-xl font-semibold text-[#0f2f57]">次に動くべきこと</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {urgent.map((employee) => (
            <Link
              key={employee.id}
              href={`/employees/${employee.id}`}
              className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[1fr_1.4fr_auto] lg:items-center"
            >
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={employee.photoUrl}
                  alt={`${employee.fullName}の顔写真`}
                  className="size-12 rounded-xl object-cover"
                />
                <div>
                  <p className="font-semibold text-[#0f2f57]">{employee.fullName}</p>
                  <p className="text-sm text-slate-500">{employee.department} / {employee.position}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">{nextAction(employee)}</p>
              <Badge variant={employee.riskLevel === "medium" ? "warning" : "blue"}>
                {employee.riskLevel === "low" ? "安定" : "要確認"}
              </Badge>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
