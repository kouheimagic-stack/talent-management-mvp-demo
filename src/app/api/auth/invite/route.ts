import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "");
  const returnTo = String(formData.get("returnTo") ?? "/admin/users");

  return NextResponse.redirect(
    new URL(`${returnTo}?invite=sent&email=${encodeURIComponent(email)}`, request.url),
  );
}
