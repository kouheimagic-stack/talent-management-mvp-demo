import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const token = String(formData.get("token") ?? "");

  if (!token || password.length < 8) {
    return NextResponse.redirect(new URL(`/invite?token=${token}&error=invalid`, request.url));
  }

  return NextResponse.redirect(new URL("/login?password_set=1", request.url));
}
