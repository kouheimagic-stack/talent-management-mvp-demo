import { Clock, Construction } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ViewerRole } from "@/types/talent";

type DevelopmentPlaceholderProps = {
  title: string;
  description: string;
  plannedFor: "MVP 1" | "MVP 2";
  role: ViewerRole;
};

export function DevelopmentPlaceholder({
  title,
  description,
  plannedFor,
  role,
}: DevelopmentPlaceholderProps) {
  const homeHref = role === "employee" ? "/me" : role === "manager" ? "/manager" : role === "hr" ? "/hr" : "/admin";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-[#0f2f57]">
              <Construction size={24} />
            </div>
            <Badge variant="warning">開発中</Badge>
            <Badge>{plannedFor}以降で実装予定</Badge>
          </div>
          <h2 className="mt-6 text-3xl font-semibold tracking-tight text-[#0f2f57]">{title}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-slate-600">{description}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
          <div className="flex items-center gap-2 font-semibold text-[#0f2f57]">
            <Clock size={16} />
            MVP 0では未提供
          </div>
          <p className="mt-2 max-w-sm">
            現在は社員情報、プロフィール編集、公開プロフィール閲覧に集中しています。
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild>
          <Link href={homeHref}>自分のトップへ戻る</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/employees">社員を探す</Link>
        </Button>
      </div>
    </section>
  );
}
