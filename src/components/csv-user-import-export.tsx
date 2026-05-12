"use client";

import { useMemo, useRef, useState } from "react";
import { Download, FileSearch, Upload } from "lucide-react";
import Papa from "papaparse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MockUser } from "@/lib/permissions";
import type { ViewerRole } from "@/types/talent";

type ManagedUser = MockUser & {
  inviteSentAt?: string;
  resetSentAt?: string;
};

type CsvRow = {
  employee_id?: string;
  name?: string;
  email?: string;
  role?: string;
  department?: string;
  team?: string;
  position?: string;
  manager_email?: string;
  employment_status?: string;
  account_status?: string;
  invited_at?: string;
  last_login_at?: string;
};

type PreviewRow = {
  rowNumber: number;
  raw: CsvRow;
  status: "new" | "updated" | "skipped" | "error";
  warnings: string[];
  errors: string[];
};

type CsvUserImportExportProps = {
  users: ManagedUser[];
  onApply: (users: ManagedUser[]) => void;
};

const roles: ViewerRole[] = ["employee", "manager", "hr", "admin"];
const csvHeaders = [
  "employee_id",
  "name",
  "email",
  "role",
  "department",
  "team",
  "position",
  "manager_email",
  "employment_status",
  "account_status",
  "invited_at",
  "last_login_at",
];

export function CsvUserImportExport({ users, onApply }: CsvUserImportExportProps) {
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [disableCandidates, setDisableCandidates] = useState<ManagedUser[]>([]);
  const [fileName, setFileName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [inviteMode, setInviteMode] = useState<"invite" | "employee_only" | "skip">("invite");
  const fileRef = useRef<HTMLInputElement>(null);

  const counts = useMemo(
    () => ({
      new: previewRows.filter((row) => row.status === "new").length,
      updated: previewRows.filter((row) => row.status === "updated").length,
      error: previewRows.filter((row) => row.status === "error").length,
      skipped: previewRows.filter((row) => row.status === "skipped").length,
    }),
    [previewRows],
  );
  const newEmails = previewRows
    .filter((row) => row.status === "new")
    .map((row) => normalize(row.raw.email))
    .filter(Boolean);
  const canApply = previewRows.length > 0 && counts.error === 0;

  function exportCsv() {
    const rows = users.map((user) => ({
      employee_id: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      team: "",
      position: user.title,
      manager_email: users.find((candidate) => candidate.name === user.managerName)?.email ?? "",
      employment_status: "active",
      account_status: user.accountStatus,
      invited_at: user.inviteSentAt ?? "",
      last_login_at: user.lastLoginAt ?? "",
    }));
    const csv = Papa.unparse(rows, { columns: csvHeaders });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `talent-users-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importCsv(file: File) {
    setFileName(file.name);
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data;
        const nextPreview = validateRows(rows, users);
        setPreviewRows(nextPreview);
        setDisableCandidates(findDisableCandidates(rows, users));
      },
    });
  }

  function applyImport() {
    if (!canApply) {
      return;
    }

    if (newEmails.length > 0 && !showConfirm) {
      setShowConfirm(true);
      return;
    }

    const now = new Date().toISOString().slice(0, 16).replace("T", " ");
    const byEmail = new Map(users.map((user) => [normalize(user.email), user]));
    const nextUsers = [...users];

    previewRows.forEach((row) => {
      if (row.status === "error" || row.status === "skipped") {
        return;
      }

      const email = normalize(row.raw.email);
      const existing = byEmail.get(email);
      if (!email || (row.status === "new" && inviteMode === "skip")) {
        return;
      }

      const managerName = row.raw.manager_email
        ? byEmail.get(normalize(row.raw.manager_email))?.name
        : undefined;
      const patch: Partial<ManagedUser> = {
        employeeId: row.raw.employee_id?.trim() || existing?.employeeId || `emp-${Date.now()}`,
        name: row.raw.name?.trim() || existing?.name || "",
        email,
        role: toRole(row.raw.role) ?? existing?.role ?? "employee",
        title: row.raw.position?.trim() || existing?.title || "一般社員",
        department: row.raw.department?.trim() || existing?.department || "未設定",
        managerName,
        accountStatus:
          row.status === "new" && inviteMode === "invite"
            ? "invited"
            : toAccountStatus(row.raw.account_status) ?? existing?.accountStatus ?? "not_invited",
        lastLoginAt: row.raw.last_login_at?.trim() || existing?.lastLoginAt,
        inviteSentAt:
          row.status === "new" && inviteMode === "invite"
            ? now
            : row.raw.invited_at?.trim() || existing?.inviteSentAt,
      };

      if (existing) {
        const index = nextUsers.findIndex((user) => normalize(user.email) === email);
        nextUsers[index] = { ...existing, ...patch };
      } else {
        nextUsers.push({
          id: `user-import-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          employeeId: patch.employeeId ?? `emp-${Date.now()}`,
          name: patch.name ?? "",
          email,
          password: "password123",
          role: patch.role ?? "employee",
          title: patch.title ?? "一般社員",
          department: patch.department ?? "未設定",
          managerName: patch.managerName,
          accountStatus: patch.accountStatus ?? "not_invited",
          inviteSentAt: patch.inviteSentAt,
          lastLoginAt: patch.lastLoginAt,
          reportEmployeeIds: [],
          permittedSensitiveEmployeeIds: [patch.employeeId ?? ""],
        });
      }
    });

    onApply(nextUsers);
    setShowConfirm(false);
  }

  return (
    <Card className="border-sky-100 shadow-none">
      <CardHeader>
        <CardTitle>CSVインポート / エクスポート</CardTitle>
        <CardDescription>
          ユーザー、社員、組織構造をCSVで更新します。manager_emailから上司・部下関係を検証します。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={exportCsv}>
            <Download size={17} />
            CSVエクスポート
          </Button>
          <Button type="button" variant="sky" onClick={() => fileRef.current?.click()}>
            <Upload size={17} />
            CSVアップロード
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                importCsv(file);
              }
            }}
          />
        </div>

        {previewRows.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue">
                <FileSearch size={13} />
                {fileName}
              </Badge>
              <Badge variant="success">新規追加 {counts.new}</Badge>
              <Badge variant="blue">更新 {counts.updated}</Badge>
              <Badge variant="warning">無効化候補 {disableCandidates.length}</Badge>
              <Badge variant="danger">エラー {counts.error}</Badge>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-semibold">行</th>
                    <th className="px-4 py-3 font-semibold">状態</th>
                    <th className="px-4 py-3 font-semibold">氏名</th>
                    <th className="px-4 py-3 font-semibold">メール</th>
                    <th className="px-4 py-3 font-semibold">ロール</th>
                    <th className="px-4 py-3 font-semibold">上司メール</th>
                    <th className="px-4 py-3 font-semibold">検証結果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {previewRows.map((row) => (
                    <tr key={row.rowNumber}>
                      <td className="px-4 py-3">{row.rowNumber}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#0f2f57]">{row.raw.name}</td>
                      <td className="px-4 py-3 text-slate-600">{row.raw.email}</td>
                      <td className="px-4 py-3 text-slate-600">{row.raw.role}</td>
                      <td className="px-4 py-3 text-slate-600">{row.raw.manager_email || "-"}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {[...row.errors, ...row.warnings].length > 0
                          ? [...row.errors, ...row.warnings].join(" / ")
                          : "問題なし"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {disableCandidates.length > 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                CSVに含まれない既存ユーザーがあります。無効化候補:
                {disableCandidates.map((user) => ` ${user.email}`).join("、")}
              </div>
            ) : null}

            <Button type="button" onClick={applyImport} disabled={!canApply}>
              インポートを確定
            </Button>
            {!canApply ? (
              <p className="text-sm text-rose-600">エラー行があるため確定できません。CSVを修正してください。</p>
            ) : null}
          </div>
        ) : null}
      </CardContent>

      {showConfirm ? (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/30 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
            <Badge variant="warning">新規メンバー招待</Badge>
            <h2 className="mt-4 text-xl font-bold text-[#0f2f57]">CSVに新規メンバーが含まれています</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              CSVに新規メンバーが含まれています。以下のメールアドレスに招待メールを送信しますか？
            </p>
            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              {newEmails.join("、")}
            </div>
            <div className="mt-5 grid gap-2">
              {[
                ["invite", "招待メールを送って登録"],
                ["employee_only", "招待せず社員情報のみ作成"],
                ["skip", "この行をスキップ"],
              ].map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                  <input
                    type="radio"
                    checked={inviteMode === value}
                    onChange={() => setInviteMode(value as typeof inviteMode)}
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowConfirm(false)}>
                戻る
              </Button>
              <Button type="button" onClick={applyImport}>
                選択内容で確定
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function validateRows(rows: CsvRow[], users: ManagedUser[]) {
  const currentEmails = new Set(users.map((user) => normalize(user.email)));
  const csvEmails = new Set(rows.map((row) => normalize(row.email)).filter(Boolean));
  const cyclicEmails = findCyclicEmails(rows);

  return rows.map((row, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const email = normalize(row.email);

    if (!email) {
      errors.push("メールアドレス必須");
    }
    if (!row.name?.trim()) {
      errors.push("氏名必須");
    }
    if (!toRole(row.role)) {
      errors.push("roleが指定値以外");
    }
    if (row.manager_email && !currentEmails.has(normalize(row.manager_email)) && !csvEmails.has(normalize(row.manager_email))) {
      warnings.push("manager_emailが存在しません");
    }
    if (email && cyclicEmails.has(email)) {
      errors.push("循環参照になる組織構造です");
    }

    return {
      rowNumber: index + 2,
      raw: row,
      status: errors.length > 0 ? "error" : currentEmails.has(email) ? "updated" : "new",
      warnings,
      errors,
    } satisfies PreviewRow;
  });
}

function findDisableCandidates(rows: CsvRow[], users: ManagedUser[]) {
  const csvEmails = new Set(rows.map((row) => normalize(row.email)).filter(Boolean));
  return users.filter((user) => !csvEmails.has(normalize(user.email)));
}

function findCyclicEmails(rows: CsvRow[]) {
  const managerByEmail = new Map<string, string>();
  rows.forEach((row) => {
    const email = normalize(row.email);
    const managerEmail = normalize(row.manager_email);
    if (email && managerEmail) {
      managerByEmail.set(email, managerEmail);
    }
  });

  const cyclic = new Set<string>();
  managerByEmail.forEach((_, email) => {
    const seen = new Set<string>();
    let cursor = email;
    while (managerByEmail.has(cursor)) {
      if (seen.has(cursor)) {
        seen.forEach((item) => cyclic.add(item));
        break;
      }
      seen.add(cursor);
      cursor = managerByEmail.get(cursor) ?? "";
    }
  });
  return cyclic;
}

function StatusBadge({ status }: { status: PreviewRow["status"] }) {
  if (status === "new") {
    return <Badge variant="success">新規追加</Badge>;
  }
  if (status === "updated") {
    return <Badge variant="blue">更新</Badge>;
  }
  if (status === "error") {
    return <Badge variant="danger">エラー</Badge>;
  }
  return <Badge variant="default">スキップ</Badge>;
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function toRole(value?: string): ViewerRole | undefined {
  const normalized = normalize(value);
  return roles.includes(normalized as ViewerRole) ? (normalized as ViewerRole) : undefined;
}

function toAccountStatus(value?: string): MockUser["accountStatus"] | undefined {
  const normalized = normalize(value);
  if (["not_invited", "invited", "active", "suspended"].includes(normalized)) {
    return normalized as MockUser["accountStatus"];
  }
  return undefined;
}
