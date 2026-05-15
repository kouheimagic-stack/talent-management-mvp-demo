import { NextResponse } from "next/server";
import { createSupabaseServerClient, SupabaseConfigError } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim();

  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email);
    return NextResponse.redirect(
      new URL(`/login?reset=sent&email=${encodeURIComponent(email)}`, request.url),
    );
  } catch (error) {
    const code = error instanceof SupabaseConfigError ? "supabase_config" : "db_connection";
    return NextResponse.redirect(
      new URL(`/login?error=${code}&email=${encodeURIComponent(email)}`, request.url),
    );
  }
}
