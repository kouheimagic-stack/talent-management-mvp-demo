import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getViewer, mockUsers } from "@/lib/permissions";

export const mockAuthCookieName = "mock_user_id";

export async function getCurrentViewer() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(mockAuthCookieName)?.value;
  if (!userId) {
    redirect("/login");
  }

  return getViewer(userId);
}

export function getDefaultUserId() {
  return mockUsers[0].id;
}
