import Link from "next/link";
import { roleLabels } from "@/lib/permissions";
import type { Viewer } from "@/types/talent";

type RoleSwitcherProps = {
  viewer: Viewer;
};

export function RoleSwitcher({ viewer }: RoleSwitcherProps) {
  return (
    <Link
      href="/login"
      className="rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-sm font-semibold text-[#0f2f57] transition hover:bg-white"
    >
      {roleLabels[viewer.role]}としてログイン中 / 切替
    </Link>
  );
}
