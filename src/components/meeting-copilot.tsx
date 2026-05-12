"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bot, CheckCircle2, Loader2, Save, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkflowStepper } from "@/components/workflow-stepper";
import { createId, getSelfUpdate, getWorkflowState, saveMeetingWithActions } from "@/lib/workflow-store";
import type {
  ActionItemRecord,
  ActionPriority,
  DevelopmentPlanResult,
  EmployeeProfile,
  MeetingSummaryResult,
  Viewer,
} from "@/types/talent";

type MeetingCopilotProps = {
  employees: EmployeeProfile[];
  viewer: Viewer;
  initialEmployeeId?: string;
};

type ActionCandidate = {
  id: string;
  title: string;
  owner: string;
  dueOn: string;
  priority: ActionPriority;
  reviewInNextMeeting: boolean;
  comment: string;
  selected: boolean;
};

type NoteDraft = {
  employeeVoice: string;
  managerObservation: string;
  blockers: string;
  agreements: string;
  decisions: string;
  nextActionsText: string;
  nextQuestionsText: string;
};

const noteFields: {
  key: keyof NoteDraft;
  label: string;
  placeholder: string;
}[] = [
  {
    key: "employeeVoice",
    label: "本人の発言",
    placeholder: "今の業務で負荷が高いこと、挑戦したい仕事、キャリア不安などを記録",
  },
  {
    key: "managerObservation",
    label: "上司の所感",
    placeholder: "本人の状態、成長度、懸念点、支援すべき点を記録",
  },
  {
    key: "blockers",
    label: "困っていること",
    placeholder: "業務量、関係者調整、スキル不足、心理的負荷など",
  },
  {
    key: "agreements",
    label: "合意したこと",
    placeholder: "今回の面談で双方が合意した内容を記録",
  },
  {
    key: "decisions",
    label: "決定事項",
    placeholder: "配置、役割、期限、支援内容など決定したこと",
  },
  {
    key: "nextActionsText",
    label: "次回までにやること",
    placeholder: "本人・上司それぞれの具体的なアクション",
  },
  {
    key: "nextQuestionsText",
    label: "次回確認したいこと",
    placeholder: "次回面談で振り返る論点や確認事項",
  },
];

export function MeetingCopilot({ employees, viewer, initialEmployeeId }: MeetingCopilotProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [employeeId, setEmployeeId] = useState(initialEmployeeId ?? employees[0]?.id ?? "");
  const [purpose, setPurpose] = useState("キャリア面談");
  const [managerQuestions, setManagerQuestions] = useState("今後挑戦したい役割と、現在の負荷感を確認したい。");
  const [nextMeetingOn, setNextMeetingOn] = useState("2026-06-12");
  const [notes, setNotes] = useState<NoteDraft>({
    employeeVoice: "",
    managerObservation: "",
    blockers: "",
    agreements: "",
    decisions: "",
    nextActionsText: "",
    nextQuestionsText: "",
  });
  const [summary, setSummary] = useState<MeetingSummaryResult | null>(null);
  const [plan, setPlan] = useState<DevelopmentPlanResult | null>(null);
  const [actionCandidates, setActionCandidates] = useState<ActionCandidate[]>([]);
  const [customAction, setCustomAction] = useState("");
  const [loading, setLoading] = useState<"summary" | "plan" | "questions" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedMeetingId, setSavedMeetingId] = useState<string | null>(null);

  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId) ?? employees[0],
    [employeeId, employees],
  );
  const selfUpdate = useMemo(() => (employee ? getSelfUpdate(employee) : null), [employee]);
  const workflowState = useMemo(() => getWorkflowState(), []);
  const previousMeeting = workflowState.meetings.find((meeting) => meeting.employeeId === employee?.id);
  const openActions = workflowState.actionItems.filter(
    (item) => item.employeeId === employee?.id && item.status !== "done",
  );
  const selectedActions = actionCandidates.filter((candidate) => candidate.selected);
  const saveBlockers = [
    !employeeId ? "対象社員が未選択です" : "",
    !notes.decisions.trim() ? "決定事項が未入力です" : "",
    selectedActions.length === 0 ? "ネクストアクションが未選択です" : "",
    !nextMeetingOn ? "次回面談日が未入力です" : "",
  ].filter(Boolean);
  const canSave = saveBlockers.length === 0;

  async function callAi(endpoint: string, body: unknown) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload.error ?? "AI処理に失敗しました");
    }

    return payload.result;
  }

  function buildMemo() {
    return [
      `上司が今回聞きたいこと: ${managerQuestions}`,
      ...noteFields.map((field) => `${field.label}: ${notes[field.key] || "未入力"}`),
    ].join("\n");
  }

  function buildAiPayload() {
    return {
      employeeId: employee.id,
      employeeName: employee.fullName,
      role: employee.position,
      department: employee.department,
      careerGoal: employee.careerPreference.desiredRole,
      strengths: employee.strengths,
      developmentAreas: employee.developmentAreas,
      purpose,
      memo: buildMemo(),
    };
  }

  async function summarize() {
    setError(null);
    setLoading("summary");

    try {
      const result: MeetingSummaryResult = await callAi("/api/ai/summarize-meeting", buildAiPayload());
      setSummary(result);
      setActionCandidates((current) => [
        ...current.filter((candidate) => !candidate.id.startsWith("ai-")),
        ...result.actionItems.map((item) => ({
          id: `ai-${createId("candidate")}`,
          title: item.title,
          owner: item.owner || employee.fullName,
          dueOn: nextMeetingOn,
          priority: "medium" as ActionPriority,
          reviewInNextMeeting: true,
          comment: item.dueHint,
          selected: true,
        })),
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI要約に失敗しました");
    } finally {
      setLoading(null);
    }
  }

  async function generatePlan() {
    setError(null);
    setLoading("plan");

    try {
      const result: DevelopmentPlanResult = await callAi("/api/ai/development-plan", {
        ...buildAiPayload(),
        meetingSummary: summary ?? undefined,
      });
      setPlan(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "育成提案に失敗しました");
    } finally {
      setLoading(null);
    }
  }

  async function generateQuestions() {
    setError(null);
    setLoading("questions");

    try {
      const result: MeetingSummaryResult = await callAi("/api/ai/summarize-meeting", buildAiPayload());
      setSummary(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "質問候補の生成に失敗しました");
    } finally {
      setLoading(null);
    }
  }

  function updateNote(key: keyof NoteDraft, value: string) {
    setNotes((current) => ({ ...current, [key]: value }));
    setSavedMeetingId(null);
  }

  function addCustomAction() {
    if (!customAction.trim()) {
      return;
    }

    setActionCandidates((current) => [
      ...current,
      {
        id: createId("candidate"),
        title: customAction.trim(),
        owner: employee.fullName,
        dueOn: nextMeetingOn,
        priority: "medium",
        reviewInNextMeeting: true,
        comment: "面談中に追加",
        selected: true,
      },
    ]);
    setCustomAction("");
  }

  function updateCandidate(id: string, patch: Partial<ActionCandidate>) {
    setActionCandidates((current) =>
      current.map((candidate) => (candidate.id === id ? { ...candidate, ...patch } : candidate)),
    );
  }

  function saveMeeting() {
    if (!canSave) {
      return;
    }

    const meetingId = createId("meeting");
    const now = new Date().toISOString().slice(0, 10);
    const meeting = {
      id: meetingId,
      employeeId: employee.id,
      employeeName: employee.fullName,
      managerId: viewer.employeeId,
      managerName: viewer.name,
      purpose,
      memo: buildMemo(),
      decisions: notes.decisions,
      nextMeetingOn,
      summary: summary ?? undefined,
      developmentPlan: plan ?? undefined,
      createdAt: now,
    };
    const actions: ActionItemRecord[] = selectedActions.map((candidate) => ({
      id: createId("action"),
      employeeId: employee.id,
      employeeName: employee.fullName,
      managerId: viewer.employeeId,
      managerName: viewer.name,
      meetingId,
      title: candidate.title,
      owner: candidate.owner,
      dueOn: candidate.dueOn,
      status: "todo",
      priority: candidate.priority,
      reviewInNextMeeting: candidate.reviewInNextMeeting,
      comment: candidate.comment,
      createdAt: now,
    }));

    saveMeetingWithActions(meeting, actions);
    setSavedMeetingId(meetingId);
  }

  if (!employee || !selfUpdate) {
    return null;
  }

  return (
    <div className="space-y-6">
      <WorkflowStepper current="record" />

      <Card className="shadow-none">
        <CardHeader>
          <Badge variant="blue" className="w-fit">
            面談記録
          </Badge>
          <CardTitle className="text-2xl">面談前確認、面談中メモ、AI整理を3ステップで進める</CardTitle>
          <CardDescription>
            上司が迷わず面談を進め、保存後はmeetingとaction_itemsに反映します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              [1, "Step1", "面談前確認"],
              [2, "Step2", "面談中メモ"],
              [3, "Step3", "AI整理・保存"],
            ].map(([value, label, title]) => (
              <button
                key={String(value)}
                type="button"
                onClick={() => setStep(value as 1 | 2 | 3)}
                className={`rounded-2xl border p-4 text-left transition ${
                  step === value
                    ? "border-sky-200 bg-sky-50 text-[#0f2f57]"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <p className="text-xs font-bold text-sky-700">{label}</p>
                <p className="mt-1 font-bold">{title}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {step === 1 ? (
        <StepOne
          employees={employees}
          employee={employee}
          employeeId={employeeId}
          setEmployeeId={(value) => {
            setEmployeeId(value);
            setSummary(null);
            setPlan(null);
            setActionCandidates([]);
            setSavedMeetingId(null);
          }}
          purpose={purpose}
          setPurpose={setPurpose}
          selfUpdate={selfUpdate}
          previousMeeting={previousMeeting}
          openActions={openActions}
          managerQuestions={managerQuestions}
          setManagerQuestions={setManagerQuestions}
          onNext={() => setStep(2)}
        />
      ) : null}

      {step === 2 ? (
        <StepTwo notes={notes} updateNote={updateNote} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      ) : null}

      {step === 3 ? (
        <StepThree
          employee={employee}
          loading={loading}
          error={error}
          summary={summary}
          plan={plan}
          summarize={summarize}
          generateQuestions={generateQuestions}
          generatePlan={generatePlan}
          actionCandidates={actionCandidates}
          updateCandidate={updateCandidate}
          customAction={customAction}
          setCustomAction={setCustomAction}
          addCustomAction={addCustomAction}
          nextMeetingOn={nextMeetingOn}
          setNextMeetingOn={setNextMeetingOn}
          canSave={canSave}
          saveBlockers={saveBlockers}
          saveMeeting={saveMeeting}
          savedMeetingId={savedMeetingId}
          onBack={() => setStep(2)}
        />
      ) : null}
    </div>
  );
}

function StepOne({
  employees,
  employee,
  employeeId,
  setEmployeeId,
  purpose,
  setPurpose,
  selfUpdate,
  previousMeeting,
  openActions,
  managerQuestions,
  setManagerQuestions,
  onNext,
}: {
  employees: EmployeeProfile[];
  employee: EmployeeProfile;
  employeeId: string;
  setEmployeeId: (value: string) => void;
  purpose: string;
  setPurpose: (value: string) => void;
  selfUpdate: ReturnType<typeof getSelfUpdate>;
  previousMeeting?: ReturnType<typeof getWorkflowState>["meetings"][number];
  openActions: ActionItemRecord[];
  managerQuestions: string;
  setManagerQuestions: (value: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Step1：面談前確認</CardTitle>
          <CardDescription>本人入力、前回要約、未完了アクションを確認して今回の論点を決めます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            対象社員
            <select
              value={employeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              {employees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.fullName} / {item.position}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            面談目的
            <select
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
            >
              <option>1on1</option>
              <option>キャリア面談</option>
              <option>評価フィードバック</option>
              <option>育成計画レビュー</option>
            </select>
          </label>

          <PersonSummary employee={employee} />

          <label className="block text-sm font-semibold text-slate-700">
            上司が今回聞きたいこと
            <Textarea
              value={managerQuestions}
              onChange={(event) => setManagerQuestions(event.target.value)}
              placeholder="今回の面談で必ず確認したい問い、気になっている変化、支援したい点"
              className="mt-2"
            />
          </label>

          <div className="flex justify-end">
            <Button type="button" onClick={onNext}>
              Step2へ進む
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-5">
        <InfoBlock
          title="本人の面談前入力"
          items={[
            ["今の仕事内容", selfUpdate.currentWork],
            ["困っていること", selfUpdate.blockers],
            ["今後やりたいこと", selfUpdate.futureAspirations],
            ["伸ばしたいスキル", selfUpdate.skillsToGrow.join("、")],
            ["面談前メモ", selfUpdate.preMeetingMemo],
          ]}
        />
        <InfoBlock
          title="前回面談"
          items={[
            ["前回AI要約", previousMeeting?.summary?.summary ?? "前回面談の保存データはまだありません。"],
            ["前回決定事項", previousMeeting?.decisions ?? "なし"],
          ]}
        />
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>前回の未完了アクション</CardTitle>
            <CardDescription>次回面談で確認する対象を先に把握します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {openActions.length > 0 ? (
              openActions.map((action) => (
                <div key={action.id} className="rounded-xl border border-slate-200 p-4">
                  <p className="font-semibold text-[#0f2f57]">{action.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    担当: {action.owner} / 期限: {action.dueOn}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState text="未完了アクションはありません。" />
            )}
          </CardContent>
        </Card>
        <InfoBlock
          title="AIが今回話すべき論点"
          items={[
            ["論点1", `${employee.careerPreference.desiredRole}に向けた経験設計`],
            ["論点2", `${employee.developmentAreas[0]}を補う支援`],
            ["論点3", employee.recommendedAction],
          ]}
        />
      </section>
    </div>
  );
}

function StepTwo({
  notes,
  updateNote,
  onBack,
  onNext,
}: {
  notes: NoteDraft;
  updateNote: (key: keyof NoteDraft, value: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Step2：面談中メモ</CardTitle>
        <CardDescription>発言、所感、合意、決定事項を分けて残すことで、AI整理と後追いの精度を上げます。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          {noteFields.map((field) => (
            <label key={field.key} className="block text-sm font-semibold text-slate-700">
              {field.label}
              <Textarea
                value={notes[field.key]}
                onChange={(event) => updateNote(field.key, event.target.value)}
                placeholder={field.placeholder}
                className="mt-2 min-h-32"
              />
            </label>
          ))}
        </div>
        <div className="flex justify-between gap-2">
          <Button type="button" variant="secondary" onClick={onBack}>
            Step1へ戻る
          </Button>
          <Button type="button" onClick={onNext}>
            Step3へ進む
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StepThree({
  employee,
  loading,
  error,
  summary,
  plan,
  summarize,
  generateQuestions,
  generatePlan,
  actionCandidates,
  updateCandidate,
  customAction,
  setCustomAction,
  addCustomAction,
  nextMeetingOn,
  setNextMeetingOn,
  canSave,
  saveBlockers,
  saveMeeting,
  savedMeetingId,
  onBack,
}: {
  employee: EmployeeProfile;
  loading: "summary" | "plan" | "questions" | null;
  error: string | null;
  summary: MeetingSummaryResult | null;
  plan: DevelopmentPlanResult | null;
  summarize: () => void;
  generateQuestions: () => void;
  generatePlan: () => void;
  actionCandidates: ActionCandidate[];
  updateCandidate: (id: string, patch: Partial<ActionCandidate>) => void;
  customAction: string;
  setCustomAction: (value: string) => void;
  addCustomAction: () => void;
  nextMeetingOn: string;
  setNextMeetingOn: (value: string) => void;
  canSave: boolean;
  saveBlockers: string[];
  saveMeeting: () => void;
  savedMeetingId: string | null;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
      <section className="space-y-5">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Step3：AI整理・保存</CardTitle>
            <CardDescription>AI要約、質問候補、育成提案、ネクストアクション候補を生成します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                {error}
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <Button type="button" onClick={summarize} disabled={loading !== null}>
                {loading === "summary" ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
                AI要約生成
              </Button>
              <Button type="button" variant="sky" onClick={generateQuestions} disabled={loading !== null}>
                {loading === "questions" ? <Loader2 size={17} className="animate-spin" /> : <Bot size={17} />}
                AI質問候補生成
              </Button>
              <Button type="button" variant="sky" onClick={generatePlan} disabled={loading !== null}>
                {loading === "plan" ? <Loader2 size={17} className="animate-spin" /> : <Bot size={17} />}
                AI育成提案生成
              </Button>
            </div>

            <AiSummaryPanel summary={summary} plan={plan} />
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>保存条件</CardTitle>
            <CardDescription>保存できない理由はボタンの近くに表示します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              次回面談日
              <Input type="date" value={nextMeetingOn} onChange={(event) => setNextMeetingOn(event.target.value)} className="mt-2" />
            </label>
            <Button type="button" onClick={saveMeeting} disabled={!canSave} className="w-full">
              <Save size={17} />
              面談とアクションを保存
            </Button>
            {!canSave ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                保存できません。理由: {saveBlockers.join("、")}
              </div>
            ) : null}
            {savedMeetingId ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                保存しました。面談記録とアクション管理に反映しました。
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/actions">アクション管理へ</Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/meetings/prepare?employeeId=${employee.id}`}>次回準備を確認</Link>
                  </Button>
                </div>
              </div>
            ) : null}
            <Button type="button" variant="secondary" onClick={onBack}>
              Step2へ戻る
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>ネクストアクション候補</CardTitle>
          <CardDescription>チェックした候補だけaction_itemsに保存します。担当者、期限、優先度を調整できます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {actionCandidates.length > 0 ? (
            <div className="space-y-3">
              {actionCandidates.map((candidate) => (
                <div key={candidate.id} className="rounded-xl border border-slate-200 p-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={candidate.selected}
                      onChange={(event) => updateCandidate(candidate.id, { selected: event.target.checked })}
                      className="mt-1"
                    />
                    <span className="min-w-0 flex-1">
                      <Input
                        value={candidate.title}
                        onChange={(event) => updateCandidate(candidate.id, { title: event.target.value })}
                      />
                    </span>
                  </label>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <Input value={candidate.owner} onChange={(event) => updateCandidate(candidate.id, { owner: event.target.value })} placeholder="担当者" />
                    <Input type="date" value={candidate.dueOn} onChange={(event) => updateCandidate(candidate.id, { dueOn: event.target.value })} />
                    <select
                      value={candidate.priority}
                      onChange={(event) => updateCandidate(candidate.id, { priority: event.target.value as ActionPriority })}
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState text="AI要約を生成すると候補が表示されます。手入力でも追加できます。" />
          )}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Input value={customAction} onChange={(event) => setCustomAction(event.target.value)} placeholder="手入力でネクストアクションを追加" />
            <Button type="button" variant="secondary" onClick={addCustomAction}>
              追加
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PersonSummary({ employee }: { employee: EmployeeProfile }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={employee.photoUrl} alt={`${employee.fullName}の顔写真`} className="size-16 rounded-2xl object-cover" />
      <div>
        <p className="font-semibold text-[#0f2f57]">{employee.fullName}</p>
        <p className="text-sm text-slate-500">
          {employee.department} / {employee.position}
        </p>
        <p className="mt-2 text-sm text-slate-600">{employee.recommendedAction}</p>
      </div>
    </div>
  );
}

function InfoBlock({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function AiSummaryPanel({
  summary,
  plan,
}: {
  summary: MeetingSummaryResult | null;
  plan: DevelopmentPlanResult | null;
}) {
  if (!summary && !plan) {
    return <EmptyState text="AI要約、質問候補、育成提案を生成するとここに表示されます。" />;
  }

  return (
    <div className="space-y-5">
      {summary ? (
        <div className="space-y-4 rounded-xl bg-slate-50 p-4">
          <p className="text-sm leading-6 text-slate-700">{summary.summary}</p>
          <ResultList title="主要トピック" items={summary.keyTopics} />
          <ResultList title="AI質問候補" items={summary.nextQuestions} />
          <ResultList title="懸念・観察ポイント" items={summary.concerns} />
        </div>
      ) : null}
      {plan ? (
        <div className="space-y-4">
          <Badge variant="navy">{plan.theme}</Badge>
          <p className="text-sm leading-6 text-slate-700">{plan.hypothesis}</p>
          <div className="grid gap-3 md:grid-cols-3">
            {plan.milestones.map((milestone) => (
              <div key={milestone.day} className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-sky-700">{milestone.day}日</p>
                <p className="mt-2 font-semibold text-[#0f2f57]">{milestone.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{milestone.outcome}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ResultList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#0f2f57]">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <Badge key={item} variant="blue">
              {item}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-slate-400">なし</span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex min-h-28 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
      <CheckCircle2 size={18} className="mr-2 text-sky-600" />
      {text}
    </div>
  );
}
