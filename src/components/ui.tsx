import type { LucideIcon } from "lucide-react";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  helper?: string;
};

export function MetricCard({ icon: Icon, label, value, helper }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-bold text-[#0f2f57]">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
          <Icon size={20} />
        </div>
      </div>
      {helper ? <p className="mt-3 text-xs leading-5 text-slate-500">{helper}</p> : null}
    </div>
  );
}

type PillProps = {
  children: React.ReactNode;
  tone?: "blue" | "slate" | "navy";
};

export function Pill({ children, tone = "slate" }: PillProps) {
  const tones = {
    blue: "bg-sky-50 text-sky-700 border-sky-100",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    navy: "bg-[#0f2f57] text-white border-[#0f2f57]",
  };

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
