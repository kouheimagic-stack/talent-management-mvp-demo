import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  DevelopmentPlanRequestSchema,
  DevelopmentPlanSchema,
  MeetingSummaryRequestSchema,
  MeetingSummarySchema,
} from "@/lib/ai/schemas";

const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function summarizeMeeting(input: unknown) {
  const payload = MeetingSummaryRequestSchema.parse(input);
  const client = getClient();

  const response = await client.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          "あなたは上司の1on1とキャリア面談を支援するHRコパイロットです。評価者目線ではなく、本人理解、次回の問い、具体アクションに集中してください。医療・法務・給与決定の断定は避け、観察可能な事実と仮説を分けてください。",
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
    text: {
      format: zodTextFormat(MeetingSummarySchema, "meeting_summary"),
    },
  });

  return response.output_parsed;
}

export async function generateDevelopmentPlan(input: unknown) {
  const payload = DevelopmentPlanRequestSchema.parse(input);
  const client = getClient();

  const response = await client.responses.parse({
    model,
    input: [
      {
        role: "system",
        content:
          "あなたは人材育成に強いマネージャー向けAIです。本人の希望キャリア、強み、育成課題、面談メモをもとに、30/60/90日の現実的な育成計画を作成してください。抽象論ではなく、上司と本人が次に実行できる粒度にしてください。",
      },
      {
        role: "user",
        content: JSON.stringify(payload),
      },
    ],
    text: {
      format: zodTextFormat(DevelopmentPlanSchema, "development_plan"),
    },
  });

  return response.output_parsed;
}
