import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { FileSearch, LockKeyhole, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import insightsMark from "@/assets/insights-mark.png";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolContent, ToolHeader, ToolInput } from "@/components/ai-elements/tool";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Evidence } from "@/lib/insights-evidence";

export type InsightsThreadSummary = { id: string; title: string };

const toolLabels: Record<string, string> = {
  findEmployee: "Looked up people",
  explainOutcome: "Read the workflow decision trace",
  recognitionHistory: "Read recognition history",
  fairnessSummary: "Read fairness figures",
};

const suggestions = [
  "Why didn't Arjun Sharma get rewarded in the sales workflow?",
  "Which teams are being missed by recognition?",
  "Is recognition spread fairly across shifts?",
];

function evidenceFrom(message: UIMessage): Evidence[] {
  const items: Evidence[] = [];
  for (const part of message.parts) {
    if (!part.type.startsWith("tool-") || !("output" in part)) continue;
    const output = part.output as { evidence?: Evidence[] } | undefined;
    for (const ev of output?.evidence ?? []) {
      if (!items.some((i) => i.id === ev.id)) items.push(ev);
    }
  }
  return items;
}

function EvidenceList({ message }: { message: UIMessage }) {
  const items = evidenceFrom(message);
  const text = message.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ");
  const cited = items.filter((e) => text.includes(e.id));
  const shown = cited.length > 0 ? cited : items;
  if (shown.length === 0) return null;
  return (
    <div className="mt-3 rounded-lg border border-border p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
        <FileSearch className="size-3.5" /> Evidence used
      </p>
      <ul className="space-y-2">
        {shown.map((e) => (
          <li key={e.id} className="text-xs">
            <span className="mr-1.5 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-primary">{e.id}</span>
            <span className="font-medium">{e.label}</span>
            <p className="mt-0.5 text-muted-foreground">
              {e.detail} · <span className="italic">{e.source}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

type InsightsChatProps = {
  threadId: string;
  persona: string;
  initialMessages: UIMessage[];
  onMessagesChange: (messages: UIMessage[]) => void;
};

export function InsightsChat({ threadId, persona, initialMessages, onMessagesChange }: InsightsChatProps) {
  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/insights", body: { threadId, persona } }),
    [threadId, persona],
  );
  const { messages, sendMessage, status, stop, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "The assistant could not answer just now."),
  });
  const saveRef = useRef(onMessagesChange);
  saveRef.current = onMessagesChange;
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!busy) saveRef.current(messages);
  }, [messages, busy]);

  const ask = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    void sendMessage({ text: trimmed.slice(0, 1000) });
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 && (
            <ConversationEmptyState
              icon={<img src={insightsMark} alt="" width={56} height={56} className="size-14" />}
              title="Ask about recognition and fairness"
              description="Answers use only your company's data and show the evidence behind every point."
            >
              <div className="mt-4 flex flex-col gap-2">
                {suggestions.map((s) => (
                  <Button key={s} variant="outline" className="h-auto whitespace-normal text-left" onClick={() => ask(s)}>
                    {s}
                  </Button>
                ))}
              </div>
            </ConversationEmptyState>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={cn(
                  m.role === "user" && "bg-primary text-primary-foreground",
                  m.role === "assistant" && "bg-transparent p-0",
                )}
              >
                {m.parts.map((part, i) => {
                  if (part.type === "text") {
                    return m.role === "assistant" ? (
                      <MessageResponse key={i}>{part.text}</MessageResponse>
                    ) : (
                      <p key={i}>{part.text}</p>
                    );
                  }
                  if (part.type.startsWith("tool-") && "state" in part && "input" in part) {
                    const name = part.type.slice(5);
                    return (
                      <Tool key={i} defaultOpen={false}>
                        <ToolHeader
                          type={part.type as `tool-${string}`}
                          state={part.state}
                          title={toolLabels[name] ?? name}
                        />
                        <ToolContent>
                          <ToolInput input={part.input} />
                        </ToolContent>
                      </Tool>
                    );
                  }
                  return null;
                })}
                {m.role === "assistant" && !(busy && m.id === messages.at(-1)?.id) && <EvidenceList message={m} />}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Checking the records…</Shimmer>}
          {error && !busy && (
            <p className="text-sm text-destructive">{error.message || "Something went wrong. Please ask again."}</p>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border p-4">
        <PromptInput onSubmit={(msg) => ask(msg.text ?? "")}>
          <PromptInputTextarea autoFocus placeholder="Ask, e.g. why didn't Priya win this month?" maxLength={1000} />
          <PromptInputFooter className="justify-between">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <LockKeyhole className="size-3" /> Won't analyse gender, caste, religion or health
            </span>
            <PromptInputSubmit status={status} onStop={stop} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

type InsightsThreadListProps = {
  threads: InsightsThreadSummary[];
  activeId: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export function InsightsThreadList({ threads, activeId, onNew, onSelect, onDelete }: InsightsThreadListProps) {
  return (
    <div className="flex flex-col gap-2">
      <Button onClick={onNew} className="w-full">
        <Plus className="size-4" /> New question
      </Button>
      <ul className="space-y-1">
        {threads.map((t) => (
          <li
            key={t.id}
            className={cn(
              "group flex items-center gap-1 rounded-md",
              t.id === activeId ? "bg-muted" : "hover:bg-muted/60",
            )}
          >
            <button type="button" onClick={() => onSelect(t.id)} className="flex-1 truncate px-3 py-2 text-left text-sm">
              {t.title}
            </button>
            <button
              type="button"
              aria-label={`Delete ${t.title}`}
              onClick={() => onDelete(t.id)}
              className="p-2 text-muted-foreground opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="size-3.5" />
            </button>
          </li>
        ))}
      </ul>
      <p className="px-1 text-xs text-muted-foreground">Conversations are cleared when you close this page.</p>
    </div>
  );
}
