import { BrainCircuit, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

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

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0f2fe_0%,transparent_34%),linear-gradient(135deg,#f8fafc_0%,#ffffff_52%,#edf7ff_100%)] px-5 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-80px)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_460px]">
        <section>
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#0f2f57] text-white shadow-sm">
              <BrainCircuit size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-sky-600">Career Profile</p>
              <h1 className="text-2xl font-semibold tracking-tight text-[#0f2f57]">
                社員公開プロフィール
              </h1>
            </div>
          </div>
          <h2 className="mt-10 max-w-2xl text-5xl font-semibold tracking-tight text-[#0f2f57]">
            自分の情報を安心して管理し、公開範囲を自分で決める。
          </h2>
          <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
            メールアドレスとパスワードでログインします。現在はlocalStorageモック認証ですが、Supabase Authへ移行しやすい構造です。
          </p>
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm backdrop-blur">
            <p className="font-semibold text-[#0f2f57]">開発用ログイン</p>
            <p className="mt-2">一般社員: misaki.sato@example.com / password123</p>
            <p>上司: ken.takahashi@example.com / password123</p>
            <p>人事: hr@example.com / password123</p>
            <p>管理者: admin@example.com / password123</p>
          </div>
        </section>

        <Card className="shadow-xl shadow-slate-200/60">
          <CardHeader>
            <CardTitle className="text-2xl">ログイン</CardTitle>
            <CardDescription>会社のメールアドレスとパスワードを入力してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {params.error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {params.error === "suspended"
                  ? "このアカウントは停止中です。人事または管理者に連絡してください。"
                  : "メールアドレスまたはパスワードが正しくありません。"}
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
              <Button className="w-full">ログイン</Button>
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
