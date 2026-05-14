import { AppShell } from "@/components/app-shell";
import { DevelopmentPlaceholder } from "@/components/development-placeholder";
import { getCurrentViewer, requireRole } from "@/lib/auth";

export default async function MeetingPreparePage() {
  const viewer = await getCurrentViewer();
  requireRole(viewer, ["manager", "hr", "admin"]);

  return (
    <AppShell viewer={viewer}>
      <DevelopmentPlaceholder
        title="面談準備"
        description="本人入力、前回面談、未完了アクション、AI論点提案の確認はMVP 1で実装します。"
        plannedFor="MVP 1"
        role={viewer.role}
      />
    </AppShell>
  );
}
