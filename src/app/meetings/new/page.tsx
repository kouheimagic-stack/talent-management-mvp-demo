import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function NewMeetingPage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["manager", "hr", "admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="面談記録"
        description="面談記録3ステップ、AI要約、AIアクション候補生成はMVP 1で実装します。"
        plannedFor="MVP 1"
        role={viewer.role}
      />
    </AppShell>
  );
}
