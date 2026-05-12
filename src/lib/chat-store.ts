import type { ChatMessage, ChatThread, ChatThreadType, EmployeeProfile, Viewer } from "@/types/talent";

const storageKey = "ai-meeting-copilot-chat-v1";

type ChatState = {
  threads: ChatThread[];
  messages: ChatMessage[];
};

export function getOrCreateThread({
  employee,
  viewer,
  type = "employee_manager",
  meetingId,
  actionItemId,
  preferredId,
}: {
  employee: EmployeeProfile;
  viewer: Viewer;
  type?: ChatThreadType;
  meetingId?: string;
  actionItemId?: string;
  preferredId?: string;
}) {
  const state = getChatState();
  const existing = state.threads.find(
    (thread) =>
      thread.type === type &&
      thread.employeeId === employee.id &&
      (meetingId ? thread.meetingId === meetingId : true) &&
      (actionItemId ? thread.actionItemId === actionItemId : true),
  );

  if (existing) {
    return existing;
  }

  const thread: ChatThread = {
    id: preferredId ?? createChatId("thread"),
    type,
    employeeId: employee.id,
    managerId: employee.managerId ?? viewer.employeeId,
    meetingId,
    actionItemId,
    createdAt: new Date().toISOString(),
  };
  saveChatState({ ...state, threads: [thread, ...state.threads] });
  return thread;
}

export function getMessages(threadId: string) {
  return getChatState()
    .messages.filter((message) => message.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addMessage(threadId: string, viewer: Viewer, body: string) {
  const state = getChatState();
  const message: ChatMessage = {
    id: createChatId("message"),
    threadId,
    senderId: viewer.employeeId,
    senderName: viewer.name,
    body,
    createdAt: new Date().toISOString(),
  };
  saveChatState({ ...state, messages: [...state.messages, message] });
  return message;
}

export function markThreadRead(threadId: string, viewer: Viewer) {
  const now = new Date().toISOString();
  const state = getChatState();
  saveChatState({
    ...state,
    messages: state.messages.map((message) =>
      message.threadId === threadId && message.senderId !== viewer.employeeId && !message.readAt
        ? { ...message, readAt: now }
        : message,
    ),
  });
}

function getChatState(): ChatState {
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

function saveChatState(state: ChatState) {
  window.localStorage.setItem(storageKey, JSON.stringify(state));
  window.dispatchEvent(new Event("chat-state-changed"));
}

function emptyState(): ChatState {
  return {
    threads: [],
    messages: [],
  };
}

function createChatId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
