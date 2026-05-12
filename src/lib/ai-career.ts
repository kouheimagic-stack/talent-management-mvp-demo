type AiFeatureResult = {
  title: string;
  items: string[];
};

export async function generateCareerSuggestions(employeeId: string): Promise<AiFeatureResult> {
  return {
    title: "キャリア提案",
    items: [
      `${employeeId} のプロフィール、評価履歴、希望キャリアをもとにOpenAI APIで生成する予定です。`,
    ],
  };
}

export async function generateDevelopmentMilestones(employeeId: string): Promise<AiFeatureResult> {
  return {
    title: "育成マイルストーン",
    items: [
      `${employeeId} の目標ロールと不足スキルをもとにOpenAI APIで生成する予定です。`,
    ],
  };
}

export async function summarizeInterviewMemo(interviewId: string): Promise<AiFeatureResult> {
  return {
    title: "面談メモ要約",
    items: [`${interviewId} の面談メモをOpenAI APIで要約する予定です。`],
  };
}
