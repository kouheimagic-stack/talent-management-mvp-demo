import { BrainCircuit, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    email?: string;
    reset?: string;
    logged_out?: string;
    password_set?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0%,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#ffffff_52%,#edf7ff_100%)] px-4 py-6 sm:px-5 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] max-w-6xl items-center gap-6 sm:min-h-[calc(100vh-80px)] lg:grid-cols-[1fr_460px] lg:gap-10">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0f2f57] text-white shadow-sm">
              <BrainCircuit size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-600">Talent Profile</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f2f57]">
                キャリアプロフィール
              </h1>
            </div>
          </div>
          <h2 className="mt-8 max-w-2xl text-3xl font-semibold tracking-tight text-[#0f2f57] sm:mt-10 sm:text-5xl">
            自分のプロフィールを整え、社内での見え方を選べる。
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base sm:leading-8">
            会社のメールアドレスでログインして、自分のプロフィールと公開状態を確認できます。
          </p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm backdrop-blur sm:mt-8">
            <p className="font-semibold text-[#0f2f57]">デモ用ログイン</p>
            <p className="mt-2">Supabase Authで作成した一般社員ユーザーを使用してください。</p>
            <p className="mt-1 text-xs text-slate-500">
              例: misaki.sato@example.com / 設定したパスワード
            </p>
          </div>
        </section>

        <Card className="shadow-xl shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <CardDescription>会社のメールアドレスとパスワードを入力してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {!configured ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                Supabase環境変数が未設定です。`.env.local` の
                `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` に値を設定してください。
                設定済みなのに表示される場合は、開発サーバーを再起動してください。
              </div>
            ) : null}
            {params.error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {getLoginErrorMessage(params.error)}
              </div>
            ) : null}
            {params.reset === "sent" ? (
              <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-800">
                パスワード再設定メールを送信しました。
              </div>
            ) : null}
            {params.password_set ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                パスワードを設定しました。ログインしてください。
              </div>
            ) : null}
            {params.logged_out ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                ログアウトしました。
              </div>
            ) : null}

            <form action="/api/auth/login" method="post" className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                メールアドレス
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input
                    name="email"
                    type="text"
                    inputMode="email"
                    defaultValue={params.email}
                    required
                    className="pl-10"
                    placeholder="you@example.com"
                  />
                </div>
              </label>
              <label className="block text-sm font-semibold text-slate-700">
                パスワード
                <div className="relative mt-2">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <Input name="password" type="password" required className="pl-10" />
                </div>
              </label>
              <Button className="w-full" disabled={!configured}>
                ログイン
              </Button>
            </form>

            <form action="/api/auth/password-reset" method="post" className="border-t border-slate-100 pt-4">
              <input type="hidden" name="email" value={params.email ?? ""} />
              <Button type="submit" variant="ghost" className="w-full">
                パスワード再設定メールを送信
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function getLoginErrorMessage(error: string) {
  const messages: Record<string, string> = {
    invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
    suspended: "このアカウントは停止中です。担当窓口に連絡してください。",
    missing_profile: "ログインユーザーに紐づくuser_profilesが見つかりません。",
    missing_employee: "ログインユーザーに紐づくemployeesが見つかりません。",
    db_connection: "Supabase Databaseへの接続または取得に失敗しました。",
    session_expired: "ログイン状態を確認できませんでした。もう一度ログインしてください。",
    supabase_config: "Supabase環境変数が未設定です。",
  };

  return messages[error] ?? "ログイン処理に失敗しました。";
}
