import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/permissions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const user = findUserByEmail(email);
  const status = user ? "sent" : "not_found";

  return NextResponse.redirect(
    new URL(`/login?reset=${status}&email=${encodeURIComponent(email)}`, request.url),
  );
}
