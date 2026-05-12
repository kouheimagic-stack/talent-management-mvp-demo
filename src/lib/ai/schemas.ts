import { z } from "zod";

export const MeetingSummarySchema = z.object({
  summary: z.string(),
  sentiment: z.enum(["positive", "neutral", "concerned"]),
  keyTopics: z.array(z.string()),
  concerns: z.array(z.string()),
  nextQuestions: z.array(z.string()),
  actionItems: z.array(
    z.object({
      title: z.string(),
      owner: z.string(),
      dueHint: z.string(),
    }),
  ),
  riskSignals: z.array(z.string()),
});

export const DevelopmentPlanSchema = z.object({
  theme: z.string(),
  hypothesis: z.string(),
  milestones: z.array(
    z.object({
      day: z.enum(["30", "60", "90"]),
      title: z.string(),
      outcome: z.string(),
    }),
  ),
  managerActions: z.array(z.string()),
  employeeActions: z.array(z.string()),
  successMetrics: z.array(z.string()),
});

export const MeetingSummaryRequestSchema = z.object({
  employeeId: z.string(),
  employeeName: z.string(),
  role: z.string(),
  department: z.string(),
  careerGoal: z.string(),
  strengths: z.array(z.string()),
  developmentAreas: z.array(z.string()),
  purpose: z.string().min(1),
  memo: z.string().min(10),
});

export const DevelopmentPlanRequestSchema = MeetingSummaryRequestSchema.extend({
  meetingSummary: MeetingSummarySchema.optional(),
});
