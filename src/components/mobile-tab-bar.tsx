"use client";

import { Eye, Home, PenLine, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Viewer } from "@/types/talent";

type MobileTabBarProps = {
  viewer: Viewer;
};

const tabBase =
  "flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition";

export function MobileTabBar({ viewer }: MobileTabBarProps) {
  const pathname = usePathname();

  const previewPath = `/employees/${viewer.employeeId}`;
  const tabs = [
    {
      href: "/me",
      label: "ホーム",
      icon: Home,
      active: pathname === "/me",
    },
    {
      href: "/profile/edit",
      label: "編集",
      icon: PenLine,
      active: pathname === "/profile/edit",
    },
    {
      href: "/employees",
      label: "社員を探す",
      icon: Search,
      active: pathname === "/employees" || (pathname.startsWith("/employees/") && pathname !== previewPath),
    },
    {
      href: previewPath,
      label: "プレビュー",
      icon: Eye,
      active: pathname === previewPath,
    },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,47,87,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${tabBase} ${
                tab.active
                  ? "bg-sky-50 text-sky-700"
                  : "text-slate-500 active:bg-slate-50 active:text-[#0f2f57]"
              }`}
              aria-current={tab.active ? "page" : undefined}
            >
              <Icon size={20} strokeWidth={tab.active ? 2.4 : 2} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
