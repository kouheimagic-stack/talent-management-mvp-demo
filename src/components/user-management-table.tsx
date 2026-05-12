"use client";

import { useMemo, useState } from "react";
import { Mail, PauseCircle, PlayCircle, RotateCcw, Send } from "lucide-react";
import { CsvUserImportExport } from "@/components/csv-user-import-export";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { roleLabels, type MockUser } from "@/lib/permissions";

type ManagedUser = MockUser & {
  inviteSentAt?: string;
  resetSentAt?: string;
};

type UserManagementTableProps = {
  users: MockUser[];
};

const storageKey = "user-management-v1";

const statusLabels = {
  not_invited: "招待前",
  invited: "招待済み",
  active: "有効",
  suspended: "停止中",
};

export function UserManagementTable({ users }: UserManagementTableProps) {
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>(() => {
    if (typeof window === "undefined") {
      return users;
    }
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : users;
  });
  const [query, setQuery] = useState("");

  function save(next: ManagedUser[]) {
    setManagedUsers(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function patchUser(id: string, patch: Partial<ManagedUser>) {
    save(managedUsers.map((user) => (user.id === id ? { ...user, ...patch } : user)));
  }

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return managedUsers;
    }

    return managedUsers.filter((user) =>
      [user.name, user.email, roleLabels[user.role], user.department, user.managerName ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [managedUsers, query]);

  return (
    <div className="space-y-6">
      <CsvUserImportExport users={managedUsers} onApply={save} />
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>ログインユーザー管理</CardTitle>
          <CardDescription>
            人事・管理者のみが、招待、停止、再開、パスワード再設定送信を操作できます。現在はlocalStorageで状態を保持します。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="氏名、メール、ロール、所属で検索"
          />
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[1120px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">氏名</th>
                <th className="px-4 py-3 font-semibold">メールアドレス</th>
                <th className="px-4 py-3 font-semibold">ロール</th>
                <th className="px-4 py-3 font-semibold">所属</th>
                <th className="px-4 py-3 font-semibold">上司</th>
                <th className="px-4 py-3 font-semibold">状態</th>
                <th className="px-4 py-3 font-semibold">最終ログイン</th>
                <th className="px-4 py-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="align-top">
                  <td className="px-4 py-4 font-semibold text-[#0f2f57]">{user.name}</td>
                  <td className="px-4 py-4 text-slate-600">{user.email}</td>
                  <td className="px-4 py-4">
                    <Badge variant={user.role === "admin" ? "navy" : "blue"}>
                      {roleLabels[user.role]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.department}</td>
                  <td className="px-4 py-4 text-slate-600">{user.managerName ?? "-"}</td>
                  <td className="px-4 py-4">
                    <Badge variant={user.accountStatus === "suspended" ? "danger" : user.accountStatus === "active" ? "success" : "warning"}>
                      {statusLabels[user.accountStatus]}
                    </Badge>
                    {user.inviteSentAt ? (
                      <p className="mt-1 text-xs text-slate-500">招待送信: {user.inviteSentAt}</p>
                    ) : null}
                    {user.resetSentAt ? (
                      <p className="mt-1 text-xs text-slate-500">再設定送信: {user.resetSentAt}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{user.lastLoginAt ?? "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <form action="/api/auth/password-reset" method="post">
                        <input type="hidden" name="email" value={user.email} />
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            patchUser(user.id, { resetSentAt: new Date().toISOString().slice(0, 16).replace("T", " ") })
                          }
                        >
                          <RotateCcw size={15} />
                          再設定
                        </Button>
                      </form>
                      <form action="/api/auth/invite" method="post">
                        <input type="hidden" name="email" value={user.email} />
                        <Button
                          type="button"
                          size="sm"
                          variant="sky"
                          onClick={() =>
                            patchUser(user.id, {
                              accountStatus: "invited",
                              inviteSentAt: new Date().toISOString().slice(0, 16).replace("T", " "),
                            })
                          }
                        >
                          <Send size={15} />
                          招待再送
                        </Button>
                      </form>
                      {user.accountStatus === "suspended" ? (
                        <Button
                          size="sm"
                          onClick={() => patchUser(user.id, { accountStatus: "active" })}
                        >
                          <PlayCircle size={15} />
                          再開
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => patchUser(user.id, { accountStatus: "suspended" })}
                        >
                          <PauseCircle size={15} />
                          停止
                        </Button>
                      )}
                      <Button asChild size="sm" variant="ghost">
                        <a href={`mailto:${user.email}`}>
                          <Mail size={15} />
                          連絡
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
