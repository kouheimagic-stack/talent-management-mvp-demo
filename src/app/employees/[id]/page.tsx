import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PublicProfileDetail } from "@/components/public-profile-detail";
import { getCurrentViewer } from "@/lib/auth";
import { getEmployeeById } from "@/lib/employees";
import { canViewEmployee } from "@/lib/permissions";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const { id } = await params;
  const viewer = await getCurrentViewer();
  const employee = await getEmployeeById(id);

  if (!employee || !canViewEmployee(employee, viewer)) {
    notFound();
  }

  return (
    <AppShell viewer={viewer}>
      <Link
        href="/employees"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-[#0f2f57] md:mb-6"
      >
        <ArrowLeft size={16} />
        社員を探すへ戻る
      </Link>

      <div className="mb-5 md:mb-7">
        <p className="text-sm font-semibold text-sky-600">Public profile</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#0f2f57] md:text-3xl">
          公開プロフィール
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 md:mt-3 md:text-base">
          本人が公開設定した項目だけを表示します。非公開情報はこの画面には表示しません。
        </p>
      </div>

      <PublicProfileDetail employee={employee} viewer={viewer} />
    </AppShell>
  );
}
