import { Award, BarChart3, Flag, GitBranch, Target, TrendingUp } from "lucide-react";
import { PerformanceChart } from "@/components/performance-chart";
import { MetricCard, Pill } from "@/components/ui";
import {
  certificationProgress,
  performanceTrend,
} from "@/lib/talent-utils";
import type { EmployeeProfile } from "@/types/talent";

type TalentDashboardProps = {
  employee: EmployeeProfile;
};

export function TalentDashboard({ employee }: TalentDashboardProps) {
  const certProgress = certificationProgress(employee.certifications);
  const completedGoals = employee.goals.filter((goal) => goal.progress >= 70).length;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={TrendingUp}
          label="現在評価"
          value={employee.latestRating}
          helper="直近評価と推移をダッシュボードで確認"
        />
        <MetricCard
          icon={Award}
          label="資格状況"
          value={`${certProgress}%`}
          helper={`${employee.certifications.length}件の資格を登録済み`}
        />
        <MetricCard
          icon={GitBranch}
          label="キャリア段階"
          value={employee.careerStage}
          helper={employee.careerPreference.desiredRole}
        />
        <MetricCard
          icon={Flag}
          label="目標進捗"
          value={`${completedGoals}/${employee.goals.length}`}
          helper="70%以上の進捗を達成扱い"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-[#0f2f57]">評価推移</h3>
              <p className="mt-1 text-sm text-slate-500">半期ごとの評価スコア</p>
            </div>
            <BarChart3 className="text-sky-600" size={22} />
          </div>
          <PerformanceChart data={performanceTrend(employee.performanceReviews)} />
        </div>

        <div className="grid gap-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-[#0f2f57]">資格取得ステップ</h3>
            <div className="mt-5 space-y-4">
              {employee.certifications.map((certification, index) => (
                <div key={certification.name} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex size-8 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">
                      {index + 1}
                    </div>
                    {index < employee.certifications.length - 1 ? (
                      <div className="h-full w-px bg-sky-100" />
                    ) : null}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold text-slate-900">{certification.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {certification.issuer} / {certification.acquiredOn}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-sky-700">
                      {certification.status === "expiring" ? "更新確認が必要" : "有効"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-[#0f2f57]">キャリアマップ</h3>
            <div className="mt-4 grid gap-3">
              {["現在", "次の段階", "希望キャリア"].map((label, index) => {
                const values = [
                  employee.position,
                  employee.careerStage,
                  employee.careerPreference.desiredRole,
                ];

                return (
                  <div key={label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-[#0f2f57] text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="font-semibold text-slate-900">{values[index]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-[#0f2f57]">
            <Target size={18} className="text-sky-600" />
            強みタグ
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {employee.strengths.map((strength) => (
              <Pill key={strength} tone="blue">
                {strength}
              </Pill>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 font-bold text-[#0f2f57]">
            <Flag size={18} className="text-sky-600" />
            育成課題タグ
          </h3>
          <div className="mt-4 flex flex-wrap gap-2">
            {employee.developmentAreas.map((area) => (
              <Pill key={area}>{area}</Pill>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
