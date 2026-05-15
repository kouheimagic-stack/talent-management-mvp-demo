import { NextResponse } from "next/server";
import {
  supabaseAccessTokenCookieName,
  supabaseRefreshTokenCookieName,
} from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/login?logged_out=1", request.url));

  try {
    const accessToken = request.headers
      .get("cookie")
      ?.split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(`${supabaseAccessTokenCookieName}=`))
      ?.split("=")[1];

    if (accessToken) {
      await createSupabaseServerClient(accessToken).auth.signOut();
    }
  } catch {
    // Cookie cleanup below is enough for this app session.
  }

  response.cookies.delete(supabaseAccessTokenCookieName);
  response.cookies.delete(supabaseRefreshTokenCookieName);
  return response;
}
