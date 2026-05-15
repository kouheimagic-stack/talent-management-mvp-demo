export type ViewerRole = "employee" | "manager" | "hr" | "admin";

export type EmployeeSummary = {
  id: string;
  employeeCode: string;
  photoUrl: string;
  fullName: string;
  fullNameKana: string;
  email: string;
  department: string;
  position: string;
  grade: string;
  location: string;
  joinedOn: string;
  managerId?: string;
  managerName?: string;
  skills: string[];
  strengths: string[];
  developmentAreas: string[];
  latestRating: string;
  nextInterviewOn?: string;
  careerStage: string;
  aiSummary: string;
  oneOnOneReadiness: number;
  engagement: number;
  growthVelocity: number;
  riskLevel: "low" | "medium" | "high";
  focusTheme: string;
  recommendedAction: string;
};

export type CareerHistory = {
  company: string;
  title: string;
  startedOn: string;
  endedOn?: string;
  summary: string;
  skills: string[];
};

export type Certification = {
  name: string;
  issuer: string;
  acquiredOn: string;
  expiresOn?: string;
  status: "active" | "expiring" | "expired";
};

export type PerformanceReview = {
  period: string;
  rating: string;
  score: number;
  reviewer: string;
  summary: string;
  salaryBand: string;
  isSensitive: boolean;
};

export type Interview = {
  heldOn: string;
  interviewer: string;
  topic: string;
  memo: string;
  actionItems: string[];
  aiSummary?: MeetingSummaryResult;
};

export type CareerPreference = {
  desiredRole: string;
  desiredDepartment: string;
  mobility: string;
  skillsToDevelop: string[];
  notes: string;
};

export type Goal = {
  title: string;
  progress: number;
  dueOn: string;
  owner: string;
};

export type EmployeeProfile = EmployeeSummary & {
  phone: string;
  employmentStatus: "active" | "leave" | "retired";
  careerHistories: CareerHistory[];
  certifications: Certification[];
  performanceReviews: PerformanceReview[];
  interviews: Interview[];
  careerPreference: CareerPreference;
  goals: Goal[];
};

export type MeetingSummaryResult = {
  summary: string;
  sentiment: "positive" | "neutral" | "concerned";
  keyTopics: string[];
  concerns: string[];
  nextQuestions: string[];
  actionItems: {
    title: string;
    owner: string;
    dueHint: string;
  }[];
  riskSignals: string[];
};

export type DevelopmentPlanResult = {
  theme: string;
  hypothesis: string;
  milestones: {
    day: "30" | "60" | "90";
    title: string;
    outcome: string;
  }[];
  managerActions: string[];
  employeeActions: string[];
  successMetrics: string[];
};

export type MeetingPriority = {
  employeeId: string;
  priority: "today" | "soon" | "watch";
  reason: string;
};

export type SelfUpdate = {
  id: string;
  employeeId: string;
  currentWork: string;
  blockers: string;
  futureAspirations: string;
  skillsToGrow: string[];
  mobilityPreference: string;
  preMeetingMemo: string;
  selfRating: string;
  goalProgressNote: string;
  updatedAt: string;
};

export type ActionStatus = "todo" | "in_progress" | "done" | "blocked";
export type ActionPriority = "low" | "medium" | "high";

export type ActionItemRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  meetingId?: string;
  title: string;
  owner: string;
  dueOn: string;
  status: ActionStatus;
  priority: ActionPriority;
  reviewInNextMeeting: boolean;
  comment: string;
  createdAt: string;
  completedAt?: string;
};

export type MeetingRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  managerId: string;
  managerName: string;
  purpose: string;
  memo: string;
  decisions: string;
  nextMeetingOn: string;
  summary?: MeetingSummaryResult;
  developmentPlan?: DevelopmentPlanResult;
  createdAt: string;
};

export type WorkflowState = {
  selfUpdates: SelfUpdate[];
  meetings: MeetingRecord[];
  actionItems: ActionItemRecord[];
};

export type ChatThreadType = "employee_manager" | "meeting" | "action_item";

export type ChatThread = {
  id: string;
  type: ChatThreadType;
  employeeId: string;
  managerId?: string;
  meetingId?: string;
  actionItemId?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  readAt?: string;
  createdAt: string;
};

export type Viewer = {
  userId: string;
  authUserId?: string;
  role: ViewerRole;
  employeeId: string;
  email: string;
  name: string;
  department?: string;
  team?: string | null;
  position?: string | null;
  grade?: string | null;
  accountStatus?: "active" | "suspended";
  permittedSensitiveEmployeeIds: string[];
};
