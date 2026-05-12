import { NextResponse } from "next/server";
import { mockAuthCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login?logged_out=1", request.url));
  response.cookies.delete(mockAuthCookieName);
  return response;
}
