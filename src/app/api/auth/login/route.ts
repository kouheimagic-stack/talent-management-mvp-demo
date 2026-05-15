import { NextResponse } from "next/server";
import {
  supabaseAccessTokenCookieName,
  supabaseRefreshTokenCookieName,
} from "@/lib/auth";
import { createSupabaseServerClient, SupabaseConfigError } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.redirect(
        new URL(`/login?error=invalid_credentials&email=${encodeURIComponent(email)}`, request.url),
      );
    }

    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .select("account_status")
      .eq("auth_user_id", data.user.id)
      .maybeSingle<{ account_status: "active" | "suspended" }>();

    if (profileError) {
      return NextResponse.redirect(new URL("/login?error=db_connection", request.url));
    }

    if (!userProfile) {
      return NextResponse.redirect(new URL("/login?error=missing_profile", request.url));
    }

    if (userProfile.account_status === "suspended") {
      return NextResponse.redirect(new URL("/login?error=suspended", request.url));
    }

    const response = NextResponse.redirect(new URL("/me", request.url));
    setAuthCookies(response, data.session.access_token, data.session.refresh_token);
    return response;
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return NextResponse.redirect(new URL("/login?error=supabase_config", request.url));
    }
    return NextResponse.redirect(new URL("/login?error=db_connection", request.url));
  }
}

function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
  const secure = process.env.NODE_ENV === "production";
  response.cookies.set(supabaseAccessTokenCookieName, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
  response.cookies.set(supabaseRefreshTokenCookieName, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
  });
}
