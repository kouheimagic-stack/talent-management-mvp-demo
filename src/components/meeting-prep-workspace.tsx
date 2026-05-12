"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, CalendarCheck, CheckCircle2, Loader2, MessageSquareQuote, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceChart } from "@/components/performance-chart";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { getSelfUpdate, getWorkflowState } from "@/lib/workflow-store";
import { performanceTrend } from "@/lib/talent-utils";
import type { ActionItemRecord, EmployeeProfile, MeetingSummaryResult } from "@/types/talent";

type MeetingPrepWorkspaceProps = {
  employees: EmployeeProfile[];
  initialEmployeeId?: string;
};

export function MeetingPrepWorkspace({ employees, initialEmployeeId }: MeetingPrepWorkspaceProps) {
  const [employeeId, setEmployeeId] = useState(initialEmployeeId ?? employees[0]?.id ?? "");
  const [generated, setGenerated] = useState<MeetingSummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState(() => getWorkflowState());

  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId) ?? employees[0],
    [employeeId, employees],
  );
  useEffect(() => {
    const reload = () => setWorkflow(getWorkflowState());
    reload();
    window.addEventListener("workflow-state-changed", reload);
    return () => window.removeEventListener("workflow-state-changed", reload);
  }, []);
  const selfUpdate = employee ? getSelfUpdate(employee) : null;
  const previousMeeting =
    workflow.meetings.find((meeting) => meeting.employeeId === employee?.id) ??
    (employee?.interviews[0]
      ? {
          memo: employee.interviews[0].memo,
          summary: employee.interviews[0].aiSummary,
          createdAt: employee.interviews[0].heldOn,
          decisions: "",
          nextMeetingOn: employee.nextInterviewOn ?? "",
        }
      : undefined);
  const openActions = workflow.actionItems.filter(
    (action) => action.employeeId === employee?.id && action.status !== "done",
  );

  async function generateTalkingPoints() {
    if (!employee || !selfUpdate) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/summarize-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: employee.id,
          employeeName: employee.fullName,
          role: employee.position,
          department: employee.department,
          careerGoal: selfUpdate.futureAspirations,
          strengths: employee.strengths,
          developmentAreas: employee.developmentAreas,
          purpose: "面談準備",
          memo: [
            `本人入力: ${selfUpdate.preMeetingMemo}`,
            `困りごと: ${selfUpdate.blockers}`,
            `前回メモ: ${previousMeeting?.memo ?? "なし"}`,
            `未完了アクション: ${openActions.map((action) => action.title).join("、") || "なし"}`,
          ].join("\n"),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "AI論点生成に失敗しました");
      }

      setGenerated(payload.result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI論点生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  if (!employee || !selfUpdate) {
    return null;
  }

  return (
    <div className="space-y-6">
      <WorkflowStepper current="prepare" />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">対象社員</p>
          <select
            value={employeeId}
            onChange={(event) => {
              setEmployeeId(event.target.value);
              setGenerated(null);
              setWorkflow(getWorkflowState());
            }}
            className="mt-2 h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            {employees.map((item) => (
              <option key={item.id} value={item.id}>
                {item.fullName} / {item.position}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={generateTalkingPoints} disabled={loading}>
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Bot size={17} />}
          AIが今回話すべき論点を提案
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="space-y-5">
          <Card className="shadow-none">
            <CardHeader>
              <Badge variant="blue" className="w-fit">
                <MessageSquareQuote size={13} />
                本人入力
              </Badge>
              <CardTitle>{employee.fullName} が面談前に入力した内容</CardTitle>
              <CardDescription>
                ここを先に読むことで、面談の最初に確認すべき論点が決まります。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
              <Info title="今の仕事内容" body={selfUpdate.currentWork} />
              <Info title="困っていること" body={selfUpdate.blockers} />
              <Info title="今後やりたいこと" body={selfUpdate.futureAspirations} />
              <Info title="面談前メモ" body={selfUpdate.preMeetingMemo} />
              <Info title="自己評価 / 目標進捗" body={`${selfUpdate.selfRating}\n${selfUpdate.goalProgressNote}`} />
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>評価推移</CardTitle>
              <CardDescription>面談では評価の上下より、変化の理由を確認します。</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart data={performanceTrend(employee.performanceReviews)} />
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarCheck size={18} className="text-sky-600" />
                前回の振り返り
              </CardTitle>
              <CardDescription>前回面談メモ、AI要約、未完了アクションを確認します。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {previousMeeting ? (
                <>
                  <Info title="前回メモ" body={previousMeeting.memo} />
                  <Info
                    title="前回AI要約"
                    body={previousMeeting.summary?.summary ?? "前回のAI要約はまだ保存されていません。"}
                  />
                </>
              ) : (
                <Empty text="前回面談はまだ保存されていません。今回の面談後に履歴として表示されます。" />
              )}
              <div>
                <p className="text-sm font-semibold text-[#0f2f57]">未完了アクション</p>
                <div className="mt-3 space-y-2">
                  {openActions.length > 0 ? (
                    openActions.map((action) => <ActionRow key={action.id} action={action} />)
                  ) : (
                    <Empty text="未完了アクションはありません。面談中に次アクションを作成するとここに表示されます。" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles size={18} className="text-sky-600" />
                AIが今回話すべき論点
              </CardTitle>
              <CardDescription>本人入力、前回面談、未完了アクションをもとに生成します。</CardDescription>
            </CardHeader>
            <CardContent>
              {generated ? (
                <div className="space-y-5">
                  <Info title="要約" body={generated.summary} />
                  <List title="面談で聞くべき質問" items={generated.nextQuestions} />
                  <List title="懸念・観察ポイント" items={generated.concerns} />
                  <List title="リスクシグナル" items={generated.riskSignals} />
                </div>
              ) : (
                <Empty text="AI論点生成ボタンを押すと、今回の面談で聞くべき質問が表示されます。" />
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Info({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-[#0f2f57]">{title}</p>
      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">{body || "未入力"}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#0f2f57]">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item} className="flex gap-2 rounded-xl border border-slate-200 p-3 text-sm text-slate-700">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-sky-600" />
              {item}
            </div>
          ))
        ) : (
          <Empty text="なし" />
        )}
      </div>
    </div>
  );
}

function ActionRow({ action }: { action: ActionItemRecord }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-semibold text-slate-900">{action.title}</p>
        <Badge variant={action.priority === "high" ? "warning" : "blue"}>{action.priority}</Badge>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        {action.owner} / 期限: {action.dueOn} / {action.status}
      </p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
      {text}
    </div>
  );
}
