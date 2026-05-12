import type {
  ActionItemRecord,
  ActionStatus,
  EmployeeProfile,
  MeetingRecord,
  SelfUpdate,
  WorkflowState,
} from "@/types/talent";

const storageKey = "ai-meeting-copilot-workflow-v1";

const fallbackDate = "2026-05-12";

export function createDefaultSelfUpdate(employee: EmployeeProfile): SelfUpdate {
  return {
    id: `self-${employee.id}`,
    employeeId: employee.id,
    currentWork: `${employee.department}で${employee.position}として主要テーマを推進中。`,
    blockers: employee.developmentAreas.map((area) => `${area}の実務機会が不足`).join("、"),
    futureAspirations: employee.careerPreference.desiredRole,
    skillsToGrow: employee.careerPreference.skillsToDevelop,
    mobilityPreference: employee.careerPreference.mobility,
    preMeetingMemo: "次回面談で、今後の役割期待と優先して伸ばすスキルを相談したい。",
    selfRating: employee.latestRating,
    goalProgressNote: employee.goals.map((goal) => `${goal.title}: ${goal.progress}%`).join("\n"),
    updatedAt: fallbackDate,
  };
}

export function getWorkflowState(): WorkflowState {
  if (typeof window === "undefined") {
    return emptyState();
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return emptyState();
  }

  try {
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

export function saveWorkflowState(state: WorkflowState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new Event("workflow-state-changed"));
}

export function getSelfUpdate(employee: EmployeeProfile) {
  const state = getWorkflowState();
  return (
    state.selfUpdates.find((update) => update.employeeId === employee.id) ??
    createDefaultSelfUpdate(employee)
  );
}

export function upsertSelfUpdate(update: SelfUpdate) {
  const state = getWorkflowState();
  const next = {
    ...state,
    selfUpdates: [
      ...state.selfUpdates.filter((item) => item.employeeId !== update.employeeId),
      update,
    ],
  };
  saveWorkflowState(next);
  return next;
}

export function saveMeetingWithActions(meeting: MeetingRecord, actions: ActionItemRecord[]) {
  const state = getWorkflowState();
  const next = {
    ...state,
    meetings: [meeting, ...state.meetings.filter((item) => item.id !== meeting.id)],
    actionItems: [
      ...actions,
      ...state.actionItems.filter((item) => item.meetingId !== meeting.id),
    ],
  };
  saveWorkflowState(next);
  return next;
}

export function updateActionStatus(id: string, status: ActionStatus) {
  const state = getWorkflowState();
  const now = new Date().toISOString().slice(0, 10);
  const next = {
    ...state,
    actionItems: state.actionItems.map((item) =>
      item.id === id
        ? { ...item, status, completedAt: status === "done" ? now : undefined }
        : item,
    ),
  };
  saveWorkflowState(next);
  return next;
}

export function updateActionItem(id: string, patch: Partial<ActionItemRecord>) {
  const state = getWorkflowState();
  const next = {
    ...state,
    actionItems: state.actionItems.map((item) =>
      item.id === id ? { ...item, ...patch } : item,
    ),
  };
  saveWorkflowState(next);
  return next;
}

export function emptyState(): WorkflowState {
  return {
    selfUpdates: [],
    meetings: [],
    actionItems: [],
  };
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
