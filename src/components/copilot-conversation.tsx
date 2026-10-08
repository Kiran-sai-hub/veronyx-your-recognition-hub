import {
  AlertOctagon,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  ClipboardList,
  Compass,
  Download,
  ExternalLink,
  Eye,
  Gauge,
  LockKeyhole,
  Mic,
  Plus,
  RotateCcw,
  Search,
  Send,
  Table2,
  TimerOff,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { DryRunReport, ValidationReport } from "@/components/workflow-reports";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { aiSuggestionsByScreen, decisionTrace } from "@/lib/admin-data";
import {
  type CopilotReply,
  type Proposal,
  QUERY_LIMIT,
  progressByKind,
  replyToText,
  respond,
  transcriptToText,
} from "@/lib/copilot-engine";
import { formatRupees } from "@/lib/format";
import { go } from "@/lib/navigate";
import { roleLabel } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  applyAutoFix,
  describeStep,
  describeTrigger,
  hasErrors,
  simulateDryRun,
  validateDraft,
} from "@/lib/workflow-model";
import type { Persona } from "@/store/app-store";
import { type Turn, useCopilotStore } from "@/store/copilot-store";
import { useDemoStore } from "@/store/demo-store";

const MAX_CHARS = 500;
const inflight = new Set<string>();

function time(at: number) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(at);
}

function dateTime(at: number) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(at);
}

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

const quickActions = [
  {
    label: "Explain this leaderboard",
    icon: BarChart3,
    prompt: "Explain this leaderboard",
    complete: true,
  },
  {
    label: "Why didn't X win?",
    icon: Search,
    prompt: `Why didn't ${decisionTrace.employee} win?`,
    complete: true,
  },
  { label: "Create a workflow for…", icon: Zap, prompt: "Create a workflow for ", complete: false },
  {
    label: "Show analytics for…",
    icon: Gauge,
    prompt: "Show analytics for coverage by department",
    complete: true,
  },
  {
    label: "Help me set up…",
    icon: Compass,
    prompt: "I run a garment factory. How do I start?",
    complete: true,
  },
];

/** Runs a question through the scripted engine with visible step-by-step progress. */
export function useCopilotAsk(persona: Persona) {
  const { addTurn, patchTurn, sessions, activeId } = useCopilotStore();
  const session = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const used = session?.turns.length ?? 0;
  return (question: string, screen: string) => {
    const text = question.trim().slice(0, MAX_CHARS);
    if (!text) return;
    const reply = respond(text, persona, used);
    const steps = progressByKind[reply.kind] ?? progressByKind["default"]!;
    const id = Math.random().toString(36).slice(2, 10);
    addTurn({
      id,
      question: text,
      at: Date.now(),
      screen,
      reply: null,
      step: 0,
      ...(reply.kind === "proposal" ? { proposalState: "open" as const } : {}),
    });
    inflight.add(id);
    const delay = reply.kind === "proposal" ? 520 : 420;
    steps.forEach((_, i) => {
      window.setTimeout(() => inflight.has(id) && patchTurn(id, { step: i + 1 }), delay * (i + 1));
    });
    window.setTimeout(
      () => {
        if (!inflight.has(id)) return;
        inflight.delete(id);
        patchTurn(id, { reply, step: steps.length });
      },
      delay * (steps.length + 1),
    );
  };
}

export function CopilotConversation({
  persona,
  screen,
  variant,
  initialPrompt,
  onConsumePrompt,
  onLeave,
}: {
  persona: Persona;
  screen: string;
  variant: "sheet" | "page";
  initialPrompt?: string | null;
  onConsumePrompt?: () => void;
  onLeave?: () => void;
}) {
  const { sessions, activeId, newSession, patchTurn } = useCopilotStore();
  const session = sessions.find((s) => s.id === activeId) ?? sessions[0]!;
  const ask = useCopilotAsk(persona);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastRef = useRef<HTMLDivElement>(null);
  const busy = session.turns.some((t) => t.reply === null && !t.cancelled && inflight.has(t.id));
  const suggestions = aiSuggestionsByScreen[screen] ?? aiSuggestionsByScreen["default"] ?? [];
  const scope = `${persona === "owner" ? "Whole company" : "Whole company (HR)"} · read-only · as ${roleLabel[persona]}`;
  const lastTurn = session.turns.at(-1);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 350);
    return () => window.clearTimeout(t);
  }, []);

  const consumed = useRef<string | null>(null);
  useEffect(() => {
    if (initialPrompt && consumed.current !== initialPrompt) {
      consumed.current = initialPrompt;
      ask(initialPrompt, screen);
      onConsumePrompt?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  // Focus management (§5.3 L): move focus to the newest answer when it arrives.
  useEffect(() => {
    if (lastTurn?.reply) lastRef.current?.focus({ preventScroll: false });
    lastRef.current?.scrollIntoView({ block: "nearest" });
  }, [lastTurn?.reply, session.turns.length]);

  const submit = () => {
    if (busy || !draft.trim()) return;
    ask(draft, screen);
    setDraft("");
  };

  const exportTranscript = () => {
    const lines = session.turns.flatMap((t) => [
      { role: "user" as const, text: t.question, at: dateTime(t.at) },
      { role: "assistant" as const, text: t.cancelled ? "(cancelled)" : replyToText(t.reply) },
    ]);
    download(
      `copilot-transcript-${session.id}.txt`,
      transcriptToText(session.title, scope, lines),
      "text/plain",
    );
  };

  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col",
        variant === "page" && "rounded-lg border border-border bg-card",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Eye className="size-3.5" aria-hidden /> Can see: {scope}
        </span>
        <span>Session started {dateTime(session.startedAt)}</span>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" className="h-8" onClick={() => newSession()}>
            <Plus /> New session
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8"
            onClick={exportTranscript}
            disabled={!session.turns.length}
          >
            <Download /> Export
          </Button>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4"
        aria-live="polite"
        aria-busy={busy}
      >
        {loading ? (
          <div className="space-y-3" aria-label="Loading conversation">
            <div className="ml-auto h-9 w-2/3 animate-pulse rounded-lg bg-muted" />
            <div className="h-20 w-5/6 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : session.turns.length === 0 ? (
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Bot className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
              <p className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
                Hi! I can help you create workflows, explain leaderboards, and answer questions.
                What would you like to do?
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Suggested for this screen</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s, screen)}
                  className="block w-full rounded-md border border-border p-3 text-left text-sm hover:bg-muted"
                >
                  {s}
                </button>
              ))}
              <button
                type="button"
                onClick={() =>
                  ask(
                    "Reward top 2 support agents monthly by CSAT, min 50 tickets. ₹2,000 to #1, ₹1,000 to #2. My approval needed.",
                    screen,
                  )
                }
                className="block w-full rounded-md border border-primary/30 bg-primary/5 p-3 text-left text-sm hover:bg-primary/10"
              >
                “Reward top 2 support agents monthly by CSAT, min 50 tickets. ₹2,000 to #1, ₹1,000
                to #2. My approval needed.”
              </button>
            </div>
          </div>
        ) : (
          session.turns.map((turn, i) => (
            <div
              key={turn.id}
              className="space-y-2"
              ref={i === session.turns.length - 1 ? lastRef : undefined}
              tabIndex={-1}
            >
              <div className="ml-auto w-fit max-w-[85%]">
                <p className="whitespace-pre-wrap rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">
                  {turn.question}
                </p>
                <p className="mt-0.5 text-right text-[11px] text-muted-foreground">
                  You · {time(turn.at)}
                </p>
              </div>
              <div className="flex gap-2">
                <Bot className="mt-1 size-5 shrink-0 text-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <TurnBody
                    turn={turn}
                    persona={persona}
                    onAsk={(q) => ask(q, screen)}
                    onCancel={() => {
                      inflight.delete(turn.id);
                      patchTurn(turn.id, { cancelled: true });
                    }}
                    onRetry={() =>
                      ask(
                        turn.question.replace(/timeout|slow|error|fail test/gi, "coverage"),
                        screen,
                      )
                    }
                    onPatch={(patch) => patchTurn(turn.id, patch)}
                    onLeave={onLeave}
                    stillRunning={inflight.has(turn.id)}
                  />
                  {turn.reply && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Copilot · {time(turn.at + 3000)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="space-y-2 border-t border-border p-3">
        <div
          className="flex gap-1.5 overflow-x-auto pb-1"
          role="toolbar"
          aria-label="Quick actions"
        >
          {quickActions.map((a) => (
            <Button
              key={a.label}
              size="sm"
              variant="outline"
              className="h-8 shrink-0 rounded-full text-xs"
              disabled={busy}
              onClick={() => {
                if (a.complete) ask(a.prompt, screen);
                else {
                  setDraft(a.prompt);
                  inputRef.current?.focus();
                }
              }}
            >
              <a.icon className="size-3.5" /> {a.label}
            </Button>
          ))}
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex-1">
            <Textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_CHARS))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Type your request…"
              aria-label="Ask AI Copilot"
              aria-describedby="copilot-count"
              className="max-h-40 min-h-11 resize-none"
              rows={variant === "page" ? 2 : 1}
            />
            <p
              id="copilot-count"
              className="mt-1 flex justify-between text-[11px] text-muted-foreground"
            >
              <span>
                Any language (English, हिन्दी, தமிழ்…) · Enter to send ·{" "}
                {QUERY_LIMIT - session.turns.length} questions left this session
              </span>
              <span className={draft.length > MAX_CHARS - 50 ? "text-warning" : ""}>
                {draft.length}/{MAX_CHARS}
              </span>
            </p>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            disabled
            aria-label="Voice input (coming soon)"
            title="Voice input — coming soon"
          >
            <Mic />
          </Button>
          <Button type="submit" size="icon" disabled={busy || !draft.trim()} aria-label="Send">
            <Send />
          </Button>
        </form>
      </div>
    </div>
  );
}

function TurnBody({
  turn,
  persona,
  onAsk,
  onCancel,
  onRetry,
  onPatch,
  onLeave,
  stillRunning,
}: {
  turn: Turn;
  persona: Persona;
  onAsk: (q: string) => void;
  onCancel: () => void;
  onRetry: () => void;
  onPatch: (p: Partial<Turn>) => void;
  onLeave: (() => void) | undefined;
  stillRunning: boolean;
}) {
  if (turn.cancelled)
    return (
      <div className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
        Cancelled.{" "}
        <Button variant="link" size="sm" className="h-auto p-0" onClick={onRetry}>
          Ask again
        </Button>
      </div>
    );
  if (!turn.reply) {
    if (!stillRunning)
      return (
        <div className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
          This answer was interrupted.{" "}
          <Button variant="link" size="sm" className="h-auto p-0" onClick={onRetry}>
            Try again
          </Button>
        </div>
      );
    const kind = respond(turn.question, persona).kind;
    const steps = progressByKind[kind] ?? progressByKind["default"]!;
    return (
      <div className="space-y-2 rounded-lg border border-border px-3 py-2 text-sm" role="status">
        <span className="flex gap-1" aria-label="Copilot is typing">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
        <ol className="space-y-0.5">
          {steps.map((s, i) => (
            <li
              key={s}
              className={
                i < turn.step
                  ? "text-foreground"
                  : i === turn.step
                    ? "font-medium text-primary"
                    : "text-muted-foreground"
              }
            >
              {i < turn.step ? "✓" : i === turn.step ? "…" : "○"} {s}
            </li>
          ))}
        </ol>
        {kind === "proposal" && (
          <p className="text-xs text-muted-foreground">This may take 30–60 seconds on real data.</p>
        )}
      </div>
    );
  }
  return (
    <ReplyView
      reply={turn.reply}
      turn={turn}
      onAsk={onAsk}
      onRetry={onRetry}
      onCancel={onCancel}
      onPatch={onPatch}
      onLeave={onLeave}
    />
  );
}

function Sources({ sources }: { sources: string[] }) {
  if (!sources.length) return null;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
      Source:
      {sources.map((s) => (
        <span key={s} className="inline-flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5">
          {s} <ExternalLink className="size-3" aria-hidden />
        </span>
      ))}
    </p>
  );
}

function ReplyView({
  reply,
  turn,
  onAsk,
  onRetry,
  onCancel,
  onPatch,
  onLeave,
}: {
  reply: CopilotReply;
  turn: Turn;
  onAsk: (q: string) => void;
  onRetry: () => void;
  onCancel: () => void;
  onPatch: (p: Partial<Turn>) => void;
  onLeave: (() => void) | undefined;
}) {
  const box = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
  switch (reply.kind) {
    case "text":
      return (
        <div className={box}>
          <p>{reply.text}</p>
          {reply.confidence && reply.confidence !== "high" && (
            <p className="mt-1 text-xs text-muted-foreground">Confidence: {reply.confidence}</p>
          )}
          <Sources sources={reply.sources} />
        </div>
      );
    case "table":
      return <TableReply reply={reply} onAsk={onAsk} />;
    case "trace":
      return (
        <div className={box}>
          <p className="font-medium">📊 {reply.text}</p>
          <p className="text-xs text-muted-foreground">{reply.workflow}</p>
          <ol className="mt-3 space-y-1.5">
            {reply.steps.map((s, i) => (
              <li key={`${s.title}-${i}`} className="flex gap-2">
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded-full text-[10px]",
                    s.passed === true && "bg-success/15 text-success",
                    s.passed === false && "bg-destructive/15 text-destructive",
                    s.passed === null && "bg-muted text-muted-foreground",
                  )}
                  aria-label={
                    s.passed === true ? "passed" : s.passed === false ? "failed" : "skipped"
                  }
                >
                  {s.passed === true ? (
                    <Check className="size-3" />
                  ) : s.passed === false ? (
                    <X className="size-3" />
                  ) : (
                    "–"
                  )}
                </span>
                <span>
                  <span className="font-medium">
                    Step {i + 1}: {s.title}
                  </span>{" "}
                  — <span className="text-muted-foreground">{s.detail}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-2">
            <span className="font-medium">What would have been needed:</span> {reply.needed}
          </p>
          <p className="mt-2 rounded bg-muted p-2 text-xs">
            💡 If this seems incorrect, check the source record or ask the supervisor to correct the
            sheet.
          </p>
          <Collapsible className="mt-1">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="group px-0">
                <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />{" "}
                Show me the data
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="space-y-1 font-mono text-xs">
                {reply.sources.map((s) => (
                  <li key={s}>
                    <a href="/workflows/wf-sales/runs" className="text-primary underline">
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        </div>
      );
    case "setup":
      return (
        <div className={box}>
          <p className="font-medium">🏭 {reply.industry} — setup guide</p>
          <p className="mt-1">{reply.text}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            Recommended tracking
          </p>
          <ul className="list-disc pl-5">
            {reply.tracking.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            Recommended workflows
          </p>
          <ol className="list-decimal pl-5">
            {reply.workflows.map((w) => (
              <li key={w.name}>{w.name}</li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
            Data source options
          </p>
          <ul className="list-disc pl-5">
            {reply.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onLeave?.();
                go("/connectors");
              }}
            >
              Start with Google Sheet
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onLeave?.();
                go("/capture");
              }}
            >
              Start with WhatsApp
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onLeave?.();
                go("/workflows/new");
              }}
            >
              Show me the templates
            </Button>
          </div>
        </div>
      );
    case "refusal":
      return (
        <div className={cn(box, "border-private/30 bg-private-surface")}>
          <p className="flex items-start gap-1.5 font-medium">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-private" /> {reply.text}
          </p>
          <p className="mt-1 text-muted-foreground">{reply.why}</p>
          {reply.contact && (
            <p className="mt-1 text-muted-foreground">Who to contact: {reply.contact}</p>
          )}
          <p className="mt-2 text-xs font-medium">Here's what I can do instead:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {reply.alternatives.map((a) => (
              <Button key={a} size="sm" variant="outline" onClick={() => onAsk(a)}>
                {a}
              </Button>
            ))}
          </div>
        </div>
      );
    case "rate_limit":
      return (
        <div className={box}>
          <p className="font-medium">You've reached the query limit for this session.</p>
          <p className="text-muted-foreground">
            It resets at {reply.resetsAt}. Start a new session or use Analytics directly.
          </p>
        </div>
      );
    case "timeout":
      return <TimeoutReply onRetry={onRetry} onCancel={onCancel} />;
    case "error":
      return (
        <div className={cn(box, "border-destructive/30")} role="alert">
          <p className="flex items-center gap-1.5 font-medium">
            <AlertOctagon className="size-4 text-destructive" /> Something went wrong. Please try
            again.
          </p>
          <p className="text-xs text-muted-foreground">Error code for support: {reply.code}</p>
          <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
            <RotateCcw /> Retry
          </Button>
        </div>
      );
    case "proposal":
      return (
        <div className="space-y-2">
          <p className={box}>{reply.text}</p>
          <ProposalCard proposal={reply.proposal} turn={turn} onPatch={onPatch} onLeave={onLeave} />
        </div>
      );
  }
}

function TimeoutReply({ onRetry, onCancel }: { onRetry: () => void; onCancel: () => void }) {
  const [canRetry, setCanRetry] = useState(false);
  useEffect(() => {
    // Real product: 30 s. Shortened so the demo shows the retry state.
    const t = window.setTimeout(() => setCanRetry(true), 3000);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className="rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-sm"
      role="status"
    >
      <p className="flex items-center gap-1.5 font-medium">
        <TimerOff className="size-4 text-warning" /> Taking longer than usual. Please wait…
      </p>
      <div className="mt-2 flex gap-2">
        <Button size="sm" variant="outline" disabled={!canRetry} onClick={onRetry}>
          <RotateCcw /> {canRetry ? "Retry" : "Retry (available after 30s)"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function TableReply({
  reply,
  onAsk,
}: {
  reply: Extract<CopilotReply, { kind: "table" }>;
  onAsk: (q: string) => void;
}) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
      <p>{reply.text}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Metric: {reply.metric} · Window: {reply.window}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Button
          size="sm"
          variant={view === "chart" ? "default" : "outline"}
          className="h-8"
          onClick={() => setView("chart")}
        >
          <BarChart3 /> Show as chart
        </Button>
        <Button
          size="sm"
          variant={view === "table" ? "default" : "outline"}
          className="h-8"
          onClick={() => setView("table")}
        >
          <Table2 /> Show as table
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-8"
          onClick={() =>
            download(
              "copilot-answer.csv",
              [reply.columns.join(","), ...reply.rows.map((r) => `${r.label},${r.value}`)].join(
                "\n",
              ),
              "text/csv",
            )
          }
        >
          <Download /> Export CSV
        </Button>
      </div>
      {view === "chart" ? (
        <figure className="mt-2 h-44" aria-label={`${reply.metric} chart`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reply.rows} margin={{ left: -20, right: 8 }}>
              <XAxis dataKey="label" fontSize={11} stroke="var(--muted-foreground)" />
              <YAxis fontSize={11} stroke="var(--muted-foreground)" unit="%" />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                }}
              />
              <Bar dataKey="value" name={reply.columns[1]} fill="var(--primary)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
          <figcaption className="sr-only">
            {reply.rows.map((r) => `${r.label}: ${r.value}%`).join(", ")}
          </figcaption>
        </figure>
      ) : (
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-1 font-medium">{reply.columns[0]}</th>
              <th className="py-1 text-right font-medium">{reply.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {reply.rows.map((r) => (
              <tr key={r.label} className="border-t border-border">
                <td className="py-1.5">{r.label}</td>
                <td className="py-1.5 text-right">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Sources sources={reply.sources} />
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className="text-xs text-muted-foreground">Ask a follow-up:</span>
        {reply.followUps.map((f) => (
          <button
            key={f}
            type="button"
            className="text-xs text-primary underline"
            onClick={() => onAsk(f)}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      {children}
    </section>
  );
}

/** Proposal card (checklist §5.2): everything a person needs before confirming an AI proposal. */
function ProposalCard({
  proposal,
  turn,
  onPatch,
  onLeave,
}: {
  proposal: Proposal;
  turn: Turn;
  onPatch: (p: Partial<Turn>) => void;
  onLeave: (() => void) | undefined;
}) {
  const saveWorkflow = useDemoStore((s) => s.saveWorkflow);
  const [draft, setDraft] = useState(proposal.draft);
  const [answers, setAnswers] = useState(proposal.questions.map((q) => q.default));
  const [json, setJson] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const checks = validateDraft(draft);
  const blocked = hasErrors(checks);
  const dry = simulateDryRun(draft, 3, null);
  const state = turn.proposalState ?? "open";
  const decided = state !== "open";

  const confirm = (status: "draft" | "live") => {
    const id = `wf-ai-${proposal.id}`;
    saveWorkflow({
      id,
      name: draft.name,
      status,
      version: 1,
      savedAt: Date.now(),
      fromAi: true,
      trigger: draft.triggers[0] ? describeTrigger(draft.triggers[0]) : "",
      draft: { ...draft, id, version: 1 },
    });
    onPatch({ proposalState: status === "live" ? "active" : "draft" });
    toast.success(status === "live" ? "Workflow activated." : "Workflow saved as draft.", {
      action: {
        label: "Open",
        onClick: () => {
          onLeave?.();
          go(`/workflows/${id}`);
        },
      },
    });
  };

  return (
    <article
      className="space-y-4 rounded-lg border-2 border-primary/30 bg-card p-4 text-sm"
      aria-label={`Workflow proposal ${proposal.id}`}
    >
      <header className="flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 font-semibold">
          <ClipboardList className="size-4 text-primary" /> 📋 {proposal.type} Proposal
        </p>
        <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">ID: {proposal.id}</span>
      </header>

      <Section title="Summary">
        <p>{proposal.summary}</p>
      </Section>
      <Section title="Assumptions">
        <ul className="list-disc space-y-0.5 pl-5">
          {proposal.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Section>
      <Section title="Questions">
        {proposal.questions.map((q, i) => (
          <div
            key={q.question}
            className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2"
          >
            <span>
              {q.question}{" "}
              <span className="text-xs text-muted-foreground">
                (default: {q.default ? "yes" : "no"})
              </span>
            </span>
            <span className="flex gap-1">
              {[true, false].map((v) => (
                <Button
                  key={String(v)}
                  size="sm"
                  variant={answers[i] === v ? "default" : "outline"}
                  className="h-7"
                  disabled={decided}
                  onClick={() => setAnswers(answers.map((a, j) => (j === i ? v : a)))}
                >
                  {v ? "Yes" : "No"}
                </Button>
              ))}
            </span>
          </div>
        ))}
      </Section>

      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="group -ml-2">
            <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />{" "}
            Definition preview
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2">
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={json ? "outline" : "default"}
              className="h-7"
              onClick={() => setJson(false)}
            >
              Visual
            </Button>
            <Button
              size="sm"
              variant={json ? "default" : "outline"}
              className="h-7"
              onClick={() => setJson(true)}
            >
              JSON
            </Button>
          </div>
          {json ? (
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(
                {
                  name: draft.name,
                  scope: draft.scope,
                  triggers: draft.triggers,
                  steps: draft.steps.map((s) => ({ kind: s.kind, ...s.config })),
                  budget: draft.budget,
                },
                null,
                2,
              )}
            </pre>
          ) : (
            <ol className="space-y-1 rounded-md border border-border p-3">
              {draft.triggers.map((t) => (
                <li key={t.id} className="text-muted-foreground">
                  ⚡ {describeTrigger(t)}
                </li>
              ))}
              {draft.steps.map((s, i) => (
                <li key={s.id}>
                  {i + 1}. <span className="font-medium">{s.label}</span> — {describeStep(s)}
                </li>
              ))}
            </ol>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Section title="Validation report">
        <ValidationReport
          checks={checks}
          onAutoFix={decided ? undefined : (fix) => setDraft((d) => applyAutoFix(d, fix))}
          onRevalidate={() => toast.success("Re-validated.")}
        />
        {proposal.repairs.map((r) => (
          <p key={r} className="text-xs text-muted-foreground">
            🔁 Repair loop: {r}
          </p>
        ))}
      </Section>

      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="group -ml-2">
            <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />{" "}
            Dry-run results, fairness & unmatched records
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p className="mb-2 font-medium">
            📊 Dry-run: {dry.periods.length} periods, {formatRupees(dry.totalCost)} total, budget{" "}
            {dry.budgetOk ? "OK" : "insufficient"} · ⚖️ {dry.fairnessNotes[0]}
          </p>
          <DryRunReport result={dry} pool={draft.budget.wallet} />
        </CollapsibleContent>
      </Collapsible>

      <div className="grid gap-2 sm:grid-cols-2">
        <Section title="Budget impact">
          <p>
            {proposal.budget.pool}: {formatRupees(proposal.budget.remaining)} left → about{" "}
            {formatRupees(proposal.budget.monthlyCost)} per month. After 3 months:{" "}
            {formatRupees(proposal.budget.remaining - proposal.budget.monthlyCost * 3)}.
          </p>
        </Section>
        <Section title="Tax impact">
          <p>{proposal.tax}</p>
        </Section>
      </div>

      <footer className="space-y-3 border-t border-border pt-3">
        {state === "open" && !rejecting && (
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" disabled={blocked} onClick={() => confirm("draft")}>
              Confirm & Save Draft
            </Button>
            <Button
              size="sm"
              disabled={blocked}
              onClick={() => confirm("live")}
              title={blocked ? "Fix validation errors first" : undefined}
            >
              Confirm & Activate
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                onLeave?.();
                go(`/workflows/new?template=${proposal.templateId}&from=ai`);
              }}
            >
              Edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-destructive"
              onClick={() => setRejecting(true)}
            >
              Reject
            </Button>
          </div>
        )}
        {rejecting && state === "open" && (
          <div className="flex flex-wrap gap-2">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (optional)"
              aria-label="Reject reason"
              className="h-9 flex-1"
            />
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onPatch({ proposalState: "rejected", rejectReason: reason });
                toast("Proposal rejected. Nothing was saved.");
              }}
            >
              Reject proposal
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>
              Cancel
            </Button>
          </div>
        )}
        {decided && (
          <p className="rounded-md bg-muted px-3 py-2 font-medium">
            {state === "draft" && "✓ Saved as draft by you."}
            {state === "active" && "✓ Activated by you. First run scheduled for 01/11/2026 06:00."}
            {state === "rejected" &&
              `Rejected${turn.rejectReason ? `: ${turn.rejectReason}` : "."}`}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Requires permission: {proposal.permissions} · Audited as: actor_type=user, ai_proposal_id=
          {proposal.id} · Will be logged as an AI proposal.
        </p>
      </footer>
    </article>
  );
}
