import { NextResponse } from "next/server";
import { generateDevelopmentPlan } from "@/lib/ai/openai";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await generateDevelopmentPlan(body);

    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "育成提案の生成に失敗しました";
    const status = message.includes("OPENAI_API_KEY") ? 503 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
