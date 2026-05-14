import { getCurrentViewer, redirectToRoleHome } from "@/lib/auth";

export default async function DashboardPage() {
  const viewer = await getCurrentViewer();
  redirectToRoleHome(viewer);
}
