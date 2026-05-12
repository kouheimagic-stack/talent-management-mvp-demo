"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Clock, MessageSquareText, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkflowStepper } from "@/components/workflow-stepper";
import {
  getWorkflowState,
  updateActionItem,
  updateActionStatus,
} from "@/lib/workflow-store";
import type { ActionItemRecord, ActionPriority, ActionStatus, EmployeeProfile, Viewer } from "@/types/talent";

type ActionManagementBoardProps = {
  employees: EmployeeProfile[];
  viewer: Viewer;
};

const today = "2026-05-12";

const statusLabels: Record<ActionStatus, string> = {
  todo: "未着手",
  in_progress: "進行中",
  done: "完了",
  blocked: "保留",
};

const priorityLabels: Record<ActionPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export function ActionManagementBoard({ employees, viewer }: ActionManagementBoardProps) {
  const [actions, setActions] = useState<ActionItemRecord[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [managerFilter, setManagerFilter] = useState("all");
  const [dueFilter, setDueFilter] = useState("all");

  function reload() {
    setActions(getWorkflowState().actionItems);
  }

  useEffect(() => {
    queueMicrotask(reload);
    window.addEventListener("workflow-state-changed", reload);
    return () => window.removeEventListener("workflow-state-changed", reload);
  }, []);

  const filtered = useMemo(
    () =>
      actions
        .filter((action) => employeeFilter === "all" || action.employeeId === employeeFilter)
        .filter((action) => managerFilter === "all" || action.managerId === managerFilter)
        .filter((action) => {
          if (dueFilter === "all") {
            return true;
          }
          if (dueFilter === "overdue") {
            return action.status !== "done" && action.dueOn < today;
          }
          return action.reviewInNextMeeting;
        })
        .sort((a, b) => a.dueOn.localeCompare(b.dueOn)),
    [actions, employeeFilter, managerFilter, dueFilter],
  );

  const managers = Array.from(new Map(actions.map((action) => [action.managerId, action.managerName])).entries());

  function setStatus(id: string, status: ActionStatus) {
    updateActionStatus(id, status);
    reload();
  }

  function patchAction(id: string, patch: Partial<ActionItemRecord>) {
    updateActionItem(id, patch);
    reload();
  }

  return (
    <div className="space-y-6">
      <WorkflowStepper current="follow" />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <select
            value={employeeFilter}
            onChange={(event) => setEmployeeFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">すべての社員</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName}
              </option>
            ))}
          </select>
          <select
            value={managerFilter}
            onChange={(event) => setManagerFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">すべての上司</option>
            <option value={viewer.employeeId}>{viewer.name}</option>
            {managers.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={dueFilter}
            onChange={(event) => setDueFilter(event.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          >
            <option value="all">期限すべて</option>
            <option value="overdue">期限超過</option>
            <option value="next">次回面談で確認</option>
          </select>
          <Button variant="secondary" onClick={reload}>
            <RefreshCw size={16} />
            更新
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["未着手", actions.filter((item) => item.status === "todo").length],
          ["進行中", actions.filter((item) => item.status === "in_progress").length],
          ["期限超過", actions.filter((item) => item.status !== "done" && item.dueOn < today).length],
          ["完了", actions.filter((item) => item.status === "done").length],
        ].map(([label, value]) => (
          <Card key={label} className="shadow-none">
            <CardContent className="pt-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-[#0f2f57]">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>ネクストアクション一覧</CardTitle>
          <CardDescription>
            面談後に保存したaction_itemsを追跡します。期限超過は強調表示され、完了ボタンで状態更新できます。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((action) => {
                const overdue = action.status !== "done" && action.dueOn < today;

                return (
                  <div
                    key={action.id}
                    className={`rounded-2xl border p-4 ${
                      overdue ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="grid gap-4 lg:grid-cols-[1fr_180px_160px_auto] lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={overdue ? "danger" : "blue"}>
                            {overdue ? "期限超過" : priorityLabels[action.priority]}
                          </Badge>
                          {action.reviewInNextMeeting ? (
                            <Badge variant="navy">次回面談で確認</Badge>
                          ) : null}
                        </div>
                        <h3 className="mt-3 font-semibold text-[#0f2f57]">{action.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {action.employeeName} / 担当: {action.owner} / 上司: {action.managerName}
                        </p>
                        <div className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                          <MessageSquareText size={16} className="mt-0.5 text-sky-600" />
                          <Input
                            value={action.comment}
                            onChange={(event) => patchAction(action.id, { comment: event.target.value })}
                            placeholder="コメント"
                          />
                        </div>
                      </div>
                      <label className="text-sm font-semibold text-slate-700">
                        期限
                        <Input
                          type="date"
                          value={action.dueOn}
                          onChange={(event) => patchAction(action.id, { dueOn: event.target.value })}
                          className="mt-2"
                        />
                      </label>
                      <label className="text-sm font-semibold text-slate-700">
                        ステータス
                        <select
                          value={action.status}
                          onChange={(event) => setStatus(action.id, event.target.value as ActionStatus)}
                          className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex gap-2 lg:justify-end">
                        <Button
                          variant={action.status === "done" ? "secondary" : "default"}
                          onClick={() => setStatus(action.id, "done")}
                          disabled={action.status === "done"}
                        >
                          <Check size={16} />
                          完了
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                      <Clock size={15} />
                      作成日: {action.createdAt}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <h3 className="font-semibold text-[#0f2f57]">まだアクションがありません</h3>
              <p className="mt-2 text-sm text-slate-500">
                面談記録でAI要約を生成し、ネクストアクション候補を確認して保存すると、ここに表示されます。
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
