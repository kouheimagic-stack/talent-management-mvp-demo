import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type WorkflowStepperProps = {
  current: "prepare" | "record" | "follow";
};

const steps = [
  {
    id: "prepare",
    title: "面談前",
    description: "本人入力、前回内容、未完了アクションを確認",
  },
  {
    id: "record",
    title: "面談中",
    description: "メモ、決定事項、AI要約、育成提案を作成",
  },
  {
    id: "follow",
    title: "面談後",
    description: "ネクストアクションを保存し、期限まで追跡",
  },
] as const;

export function WorkflowStepper({ current }: WorkflowStepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm lg:grid-cols-3">
      {steps.map((step, index) => {
        const active = step.id === current;
        const done = index < currentIndex;

        return (
          <div
            key={step.id}
            className={cn(
              "rounded-xl p-4 transition",
              active ? "bg-[#0f2f57] text-white" : "bg-slate-50 text-slate-600",
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-sm font-bold",
                  active ? "bg-white text-[#0f2f57]" : "bg-white text-sky-700",
                )}
              >
                {done ? <CheckCircle2 size={16} /> : index + 1}
              </span>
              <p className={cn("font-semibold", active ? "text-white" : "text-[#0f2f57]")}>
                {step.title}
              </p>
            </div>
            <p className={cn("mt-2 text-sm leading-6", active ? "text-sky-100" : "text-slate-500")}>
              {step.description}
            </p>
          </div>
        );
      })}
    </div>
  );
}
