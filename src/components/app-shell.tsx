import {
  BrainCircuit,
  LogOut,
  ShieldCheck,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import type { Viewer } from "@/types/talent";
import { roleLabels } from "@/lib/permissions";
import { getRoleHomePath } from "@/lib/auth";

type AppShellProps = {
  viewer: Viewer;
  children: React.ReactNode;
};

export function AppShell({ viewer, children }: AppShellProps) {
  const nav = getNavigation();

  return (
    <div className="min-h-screen bg-[#fbfdff] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:flex-col md:items-stretch md:gap-4 md:px-5 md:py-4 lg:flex-row lg:items-center lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3 md:flex-col md:items-stretch md:gap-4 lg:flex-row lg:items-center lg:gap-8">
            <Link href={getRoleHomePath(viewer.role)} className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f2f57] text-white shadow-sm md:size-11">
                <BrainCircuit size={21} />
              </div>
              <div className="min-w-0">
                <p className="hidden text-sm font-semibold text-sky-600 sm:block">Talent Profile</p>
                <h1 className="truncate text-base font-bold tracking-tight text-[#0f2f57] sm:text-xl">
                  キャリアプロフィール
                </h1>
              </div>
            </Link>
            <nav className="hidden flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 md:flex">
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
          <div className="flex shrink-0 items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm md:flex">
              <ShieldCheck size={18} className="text-sky-600" />
              <span className="text-slate-500">閲覧者</span>
              <span className="font-semibold text-[#0f2f57]">
                {viewer.name} / {roleLabels[viewer.role]}
              </span>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
                <LogOut size={16} />
                <span className="hidden sm:inline">ログアウト</span>
                <span className="sr-only sm:hidden">ログアウト</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 pb-32 pt-5 md:px-5 md:py-8 lg:px-8">{children}</main>
      <footer className="hidden border-t border-slate-200 bg-slate-50 md:block">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>現在はSupabase Auth連携を進めています。プロフィール情報は段階的にDBへ移行します。</span>
          <span className="text-[#0f2f57]">MVP 0: キャリアプロフィール基盤</span>
        </div>
      </footer>
      <MobileTabBar viewer={viewer} />
    </div>
  );
}

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

function getNavigation(): NavItem[] {
  const mvp0Nav: NavItem[] = [
    { href: "/me", label: "マイページ", icon: UserRoundPen },
    { href: "/profile/edit", label: "プロフィール編集", icon: UserRoundPen },
    { href: "/employees", label: "社員を探す", icon: UsersRound },
  ];

  return mvp0Nav;
}
