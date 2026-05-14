import {
  BrainCircuit,
  Building2,
  ClipboardList,
  LogOut,
  Shield,
  ShieldCheck,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { Viewer } from "@/types/talent";
import { roleLabels } from "@/lib/permissions";
import { getRoleHomePath } from "@/lib/auth";

type AppShellProps = {
  viewer: Viewer;
  children: React.ReactNode;
};

export function AppShell({ viewer, children }: AppShellProps) {
  const nav = getNavigation(viewer);

  return (
    <div className="min-h-screen bg-[#fbfdff] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-8">
            <Link href={getRoleHomePath(viewer.role)} className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#0f2f57] text-white shadow-sm">
                <BrainCircuit size={22} />
              </div>
              <div>
                <p className="text-sm font-semibold text-sky-600">Career Profile</p>
                <h1 className="text-xl font-bold tracking-tight text-[#0f2f57]">
                  社員公開プロフィール
                </h1>
              </div>
            </Link>
            <nav className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {nav.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-[#0f2f57]"
                  >
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm">
              <ShieldCheck size={18} className="text-sky-600" />
              <span className="text-slate-500">閲覧者</span>
              <span className="font-semibold text-[#0f2f57]">
                {viewer.name} / {roleLabels[viewer.role]}
              </span>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                <LogOut size={16} />
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-5 py-8 lg:px-8">{children}</main>
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>現在はlocalStorageモックで保存しています。将来Supabase Auth / Storage / DBへ移行する前提です。</span>
          <span className="text-[#0f2f57]">MVP 0: 社員情報・公開プロフィール基盤</span>
        </div>
      </footer>
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function getNavigation(viewer: Viewer): NavItem[] {
  const mvp0Nav: NavItem[] = [
    { href: "/me", label: "マイページ", icon: UserRoundPen },
    { href: "/profile/edit", label: "プロフィール編集", icon: UserRoundPen },
    { href: "/employees", label: "社員公開プロフィール一覧", icon: UsersRound },
  ];

  if (viewer.role === "employee") {
    return mvp0Nav;
  }

  if (viewer.role === "manager") {
    return [
      { href: "/manager", label: "上司トップ（開発中）", icon: ClipboardList },
      { href: "/employees", label: "社員公開プロフィール一覧", icon: UsersRound },
      { href: "/profile/edit", label: "自分のプロフィール編集", icon: UserRoundPen },
      { href: "/meetings", label: "面談（開発中）", icon: ClipboardList },
      { href: "/actions", label: "アクション（開発中）", icon: ClipboardList },
    ];
  }

  if (viewer.role === "hr") {
    return [
      { href: "/hr", label: "人事トップ（開発中）", icon: Building2 },
      { href: "/employees", label: "社員公開プロフィール一覧", icon: UsersRound },
      { href: "/profile/edit", label: "自分のプロフィール編集", icon: UserRoundPen },
      { href: "/admin/users", label: "ユーザー管理（開発中）", icon: Shield },
    ];
  }

  return [
    { href: "/admin", label: "管理者トップ（開発中）", icon: Shield },
    { href: "/employees", label: "社員公開プロフィール一覧", icon: UsersRound },
    { href: "/profile/edit", label: "自分のプロフィール編集", icon: UserRoundPen },
    { href: "/admin/users", label: "ユーザー管理（開発中）", icon: Shield },
    { href: "/admin/org", label: "組織管理（開発中）", icon: Building2 },
    { href: "/admin/csv", label: "CSV管理（開発中）", icon: ClipboardList },
  ];
}
