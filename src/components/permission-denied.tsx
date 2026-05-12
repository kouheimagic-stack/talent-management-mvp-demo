import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PermissionDeniedProps = {
  title: string;
  description: string;
};

export function PermissionDenied({ title, description }: PermissionDeniedProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <LockKeyhole size={22} />
        </div>
        <h2 className="mt-5 text-2xl font-semibold text-[#0f2f57]">{title}</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
        <Button asChild className="mt-6">
          <Link href="/login">ログインユーザーを切り替える</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
