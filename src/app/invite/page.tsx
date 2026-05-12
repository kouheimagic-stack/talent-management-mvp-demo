import { BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type InvitePageProps = {
  searchParams: Promise<{ token?: string; error?: string }>;
};

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <Card className="w-full max-w-lg shadow-none">
        <CardHeader>
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-[#0f2f57] text-white">
            <BrainCircuit size={24} />
          </div>
          <CardTitle>招待からパスワード設定</CardTitle>
          <CardDescription>
            招待メールに含まれるリンクから初回パスワードを設定します。現在はモック処理です。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {params.error ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              トークンまたはパスワードが不正です。8文字以上で設定してください。
            </div>
          ) : null}
          <form action="/api/auth/set-password" method="post" className="space-y-4">
            <input type="hidden" name="token" value={params.token ?? "demo-token"} />
            <label className="block text-sm font-semibold text-slate-700">
              新しいパスワード
              <Input name="password" type="password" minLength={8} required className="mt-2" />
            </label>
            <Button className="w-full">パスワードを設定</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
