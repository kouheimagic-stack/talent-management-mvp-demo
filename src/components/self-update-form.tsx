"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, UserRoundPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createDefaultSelfUpdate, getSelfUpdate, upsertSelfUpdate } from "@/lib/workflow-store";
import type { EmployeeProfile, SelfUpdate, Viewer } from "@/types/talent";

type SelfUpdateFormProps = {
  employees: EmployeeProfile[];
  viewer: Viewer;
};

export function SelfUpdateForm({ employees, viewer }: SelfUpdateFormProps) {
  const defaultEmployeeId = viewer.role === "employee" ? viewer.employeeId : employees[0]?.id;
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId ?? "");
  const employee = useMemo(
    () => employees.find((item) => item.id === employeeId) ?? employees[0],
    [employeeId, employees],
  );
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [form, setForm] = useState<SelfUpdate>(() =>
    employee ? getSelfUpdate(employee) : createDefaultSelfUpdate(employees[0]),
  );

  useEffect(() => {
    if (employee) {
      queueMicrotask(() => setForm(getSelfUpdate(employee)));
    }
  }, [employee]);

  function switchEmployee(nextEmployeeId: string) {
    const nextEmployee = employees.find((item) => item.id === nextEmployeeId);
    if (!nextEmployee) {
      return;
    }
    setEmployeeId(nextEmployeeId);
    setForm(getSelfUpdate(nextEmployee));
    setSavedAt(null);
  }

  function update<K extends keyof SelfUpdate>(key: K, value: SelfUpdate[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function save() {
    const now = new Date().toISOString().slice(0, 10);
    upsertSelfUpdate({ ...form, employeeId: employee.id, updatedAt: now });
    setSavedAt(now);
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <section className="space-y-5">
        <Card className="shadow-none">
          <CardHeader>
            <Badge variant="blue" className="w-fit">
              <UserRoundPen size={13} />
              Self update
            </Badge>
            <CardTitle className="text-2xl">
              {viewer.role === "employee" ? "面談前入力" : "本人用マイページ"}
            </CardTitle>
            <CardDescription>
              面談前に本人が近況、困りごと、希望、自己評価を更新します。上司は面談準備ページでこの内容を確認します。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {viewer.role !== "employee" ? (
              <label className="block text-sm font-semibold text-slate-700">
                対象社員
                <select
                  value={employeeId}
                  onChange={(event) => switchEmployee(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                >
                  {employees.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.fullName} / {item.position}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <Field label="今の仕事内容">
              <Textarea value={form.currentWork} onChange={(event) => update("currentWork", event.target.value)} />
            </Field>
            <Field label="困っていること">
              <Textarea value={form.blockers} onChange={(event) => update("blockers", event.target.value)} />
            </Field>
            <Field label="今後やりたいこと">
              <Textarea
                value={form.futureAspirations}
                onChange={(event) => update("futureAspirations", event.target.value)}
              />
            </Field>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>{employee.fullName} の面談前入力</CardTitle>
            <CardDescription>
              空欄のまま保存せず、面談で相談したいことを具体的に書くほどAI提案の精度が上がります。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="伸ばしたいスキル">
              <Input
                value={form.skillsToGrow.join("、")}
                onChange={(event) =>
                  update(
                    "skillsToGrow",
                    event.target.value
                      .split(/[、,]/)
                      .map((item) => item.trim())
                      .filter(Boolean),
                  )
                }
                placeholder="例: 事業計画、ファイナンス、組織マネジメント"
              />
            </Field>
            <Field label="異動希望">
              <Input
                value={form.mobilityPreference}
                onChange={(event) => update("mobilityPreference", event.target.value)}
              />
            </Field>
            <Field label="面談前メモ">
              <Textarea
                value={form.preMeetingMemo}
                onChange={(event) => update("preMeetingMemo", event.target.value)}
                placeholder="面談で必ず相談したいこと、上司に知っておいてほしいこと"
              />
            </Field>
            <Field label="自己評価">
              <Input value={form.selfRating} onChange={(event) => update("selfRating", event.target.value)} />
            </Field>
            <Field label="目標進捗">
              <Textarea
                value={form.goalProgressNote}
                onChange={(event) => update("goalProgressNote", event.target.value)}
              />
            </Field>
            <div className="flex flex-col gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                保存後、上司の面談準備ページに反映されます。
                {savedAt ? <span className="block font-semibold text-sky-700">保存済み: {savedAt}</span> : null}
              </p>
              <Button onClick={save}>
                <Save size={17} />
                保存
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-2">{children}</div>
    </label>
  );
}
