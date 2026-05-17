import { NextResponse } from "next/server";
import { mockAuthCookieName } from "@/lib/auth";
import { findUserByEmail } from "@/lib/permissions";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    return NextResponse.redirect(
      new URL(`/login?error=invalid_credentials&email=${encodeURIComponent(email)}`, request.url),
    );
  }

  if (user.accountStatus === "suspended") {
    return NextResponse.redirect(new URL("/login?error=suspended", request.url));
  }

  const response = NextResponse.redirect(new URL("/me", request.url));
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(mockAuthCookieName, user.id, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  return response;
}
