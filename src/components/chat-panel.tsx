"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addMessage, getMessages, getOrCreateThread, markThreadRead } from "@/lib/chat-store";
import type { ChatMessage, ChatThreadType, EmployeeProfile, Viewer } from "@/types/talent";

type ChatPanelProps = {
  employee: EmployeeProfile;
  viewer: Viewer;
  threadType?: ChatThreadType;
  meetingId?: string;
  actionItemId?: string;
};

export function ChatPanel({
  employee,
  viewer,
  threadType = "employee_manager",
  meetingId,
  actionItemId,
}: ChatPanelProps) {
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const threadKey = useMemo(
    () => `${threadType}:${employee.id}:${meetingId ?? actionItemId ?? employee.managerId ?? viewer.employeeId}`,
    [actionItemId, employee.id, employee.managerId, meetingId, threadType, viewer.employeeId],
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    typeof window === "undefined" ? [] : getMessages(threadKey),
  );

  useEffect(() => {
    queueMicrotask(() => {
      markThreadRead(threadKey, viewer);
      setMessages(getMessages(threadKey));
    });
  }, [threadKey, viewer]);

  function send() {
    if (!message.trim()) {
      return;
    }
    getOrCreateThread({ employee, viewer, type: threadType, meetingId, actionItemId, preferredId: threadKey });
    addMessage(threadKey, viewer, message.trim());
    markThreadRead(threadKey, viewer);
    setMessage("");
    setMessages(getMessages(threadKey));
  }

  const filteredMessages = messages.filter((item) =>
    [item.senderName, item.body].join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );
  const unread = messages.filter((item) => item.senderId !== viewer.employeeId && !item.readAt).length;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
        このチャット内容は、面談支援・育成提案の精度向上のため、権限範囲内でAI要約に利用される場合があります。
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="text-sky-700" size={20} />
            <h3 className="font-bold text-[#0f2f57]">面談・育成チャット</h3>
            {unread > 0 ? <Badge variant="warning">未読 {unread}</Badge> : <Badge variant="success">既読</Badge>}
          </div>
          <p className="mt-1 text-sm text-slate-500">{employee.fullName}と上司の1対1メモを残します。</p>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="メッセージ検索"
            className="pl-9"
          />
        </div>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4">
        {filteredMessages.length > 0 ? (
          filteredMessages.map((item) => {
            const mine = item.senderId === viewer.employeeId;
            return (
              <div key={item.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl p-3 ${mine ? "bg-[#0f2f57] text-white" : "bg-white text-slate-700"}`}>
                  <div className="flex items-center justify-between gap-4 text-xs opacity-80">
                    <span>{item.senderName}</span>
                    <span>{new Date(item.createdAt).toLocaleString("ja-JP")}</span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6">{item.body}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            面談前の確認、アクションの相談、次回までの状況共有をここに残します。
          </div>
        )}
      </div>

      <div className="grid gap-3">
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="面談や育成アクションに関するやりとりを入力"
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="button" onClick={send} disabled={!message.trim()}>
            <Send size={17} />
            送信
          </Button>
        </div>
      </div>
    </div>
  );
}
