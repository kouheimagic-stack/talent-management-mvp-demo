import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  return NextResponse.redirect(
    new URL(`/login?reset=sent&email=${encodeURIComponent(email)}`, request.url),
  );
}
