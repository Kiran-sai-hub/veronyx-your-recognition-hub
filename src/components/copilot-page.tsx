import { BarChart3, Check, Download, Eye, LockKeyhole, Minus, Plus, RotateCcw, Send, Table2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toCsv } from "@/lib/phase2-data";
import { decisionTrace } from "@/lib/admin-data";
import { progressSteps, respond, transcriptToText, type CopilotReply } from "@/lib/copilot-engine";
import { cn } from "@/lib/utils";

type Turn = { id: number; question: string; reply: CopilotReply | null; step: number };
type Session = { id: number; title: string; turns: Turn[] };

const suggestions = [
  `Why didn't ${decisionTrace.employee} win?`,
  "Show recognition coverage by shift",
  "Compare recognition by gender",
  "Simulate a timeout",
];

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function replyText(reply: CopilotReply | null): string {
  if (!reply) return "";
  if (reply.kind === "timeout") return "This took too long.";
  if (reply.kind === "error") return "Something went wrong.";
  return reply.text;
}

function TableAnswer({ reply }: { reply: Extract<CopilotReply, { kind: "table" }> }) {
  const [view, setView] = useState<"chart" | "table">("chart");
  return (
    <div className="mt-3 space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={view === "chart" ? "default" : "outline"} onClick={() => setView("chart")}>
          <BarChart3 className="size-4" /> Chart
        </Button>
        <Button size="sm" variant={view === "table" ? "default" : "outline"} onClick={() => setView("table")}>
          <Table2 className="size-4" /> Table
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            download("copilot-answer.csv", toCsv([...reply.columns], reply.rows.map((r) => [r.label, String(r.value)])), "text/csv")
          }
        >
          <Download className="size-4" /> CSV
        </Button>
      </div>
      {view === "chart" ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reply.rows}>
              <XAxis dataKey="label" fontSize={12} />
              <YAxis fontSize={12} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="py-1">{reply.columns[0]}</th>
              <th className="py-1">{reply.columns[1]}</th>
            </tr>
          </thead>
          <tbody>
            {reply.rows.map((r) => (
              <tr key={r.label} className="border-t border-border">
                <td className="py-1.5">{r.label}</td>
                <td className="py-1.5">{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Reply({ turn, onAsk, onRetry }: { turn: Turn; onAsk: (q: string) => void; onRetry: () => void }) {
  const r = turn.reply;
  if (!r) {
    return (
      <ol className="space-y-1 text-sm" aria-live="polite">
        {progressSteps.map((s, i) => (
          <li key={s} className={i <= turn.step ? "text-foreground" : "text-muted-foreground"}>
            {i < turn.step ? "✓" : i === turn.step ? "…" : "○"} {s}
          </li>
        ))}
      </ol>
    );
  }
  if (r.kind === "timeout" || r.kind === "error") {
    return (
      <div className="rounded-md border border-border p-3 text-sm">
        <p>{r.kind === "timeout" ? "This is taking longer than 30 seconds, so I stopped." : "I couldn't finish that answer."}</p>
        <p className="mt-1 text-muted-foreground">You can try again or use the Analytics page directly.</p>
        <Button size="sm" variant="outline" className="mt-2" onClick={onRetry}>
          <RotateCcw className="size-4" /> Try again
        </Button>
      </div>
    );
  }
  if (r.kind === "refusal") {
    return (
      <div className="text-sm">
        <p className="flex items-center gap-1.5">
          <LockKeyhole className="size-4 text-private" /> {r.text}
        </p>
        <p className="mt-2 text-muted-foreground">Here's what I can do instead:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {r.alternatives.map((a) => (
            <Button key={a} size="sm" variant="outline" onClick={() => onAsk(a)}>
              {a}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="text-sm">
      <p>{r.text}</p>
      {r.kind === "trace" && (
        <ol className="mt-3 space-y-2">
          {r.steps.map((s, i) => (
            <li key={s.title} className="flex gap-2">
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-xs",
                  s.passed === true && "bg-success/15 text-success",
                  s.passed === false && "bg-private-surface text-private",
                  s.passed === null && "bg-muted text-muted-foreground",
                )}
              >
                {s.passed === true ? <Check className="size-3" /> : s.passed === false ? <X className="size-3" /> : <Minus className="size-3" />}
              </span>
              <span>
                <span className="font-medium">
                  {i + 1}. {s.title}
                </span>{" "}
                <span className="text-muted-foreground">— {s.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
      {r.kind === "table" && <TableAnswer reply={r} />}
      {r.sources.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Based on: {r.sources.join(" · ")}</p>}
    </div>
  );
}

type CopilotPageProps = { persona: string; aiAvailable: boolean };

export function CopilotPage({ persona, aiAvailable }: CopilotPageProps) {
  const [sessions, setSessions] = useState<Session[]>([{ id: 1, title: "New session", turns: [] }]);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const nextId = useRef(2);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const active = sessions.find((s) => s.id === activeId) ?? sessions[0];
  const busy = active?.turns.some((t) => !t.reply) ?? false;
  const scope = `${persona === "manager" ? "Your team" : "Whole company"} · last 90 days · read-only`;

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const updateTurn = (sid: number, tid: number, patch: Partial<Turn>) =>
    setSessions((list) =>
      list.map((s) => (s.id === sid ? { ...s, turns: s.turns.map((t) => (t.id === tid ? { ...t, ...patch } : t)) } : s)),
    );

  const ask = (question: string) => {
    const text = question.trim().slice(0, 500);
    if (!text || busy || !active) return;
    const sid = active.id;
    const tid = nextId.current++;
    setSessions((list) =>
      list.map((s) =>
        s.id === sid
          ? { ...s, title: s.turns.length === 0 ? text.slice(0, 40) : s.title, turns: [...s.turns, { id: tid, question: text, reply: null, step: 0 }] }
          : s,
      ),
    );
    setInput("");
    timers.current.push(setTimeout(() => updateTurn(sid, tid, { step: 1 }), 500));
    timers.current.push(setTimeout(() => updateTurn(sid, tid, { step: 2 }), 1100));
    timers.current.push(setTimeout(() => updateTurn(sid, tid, { reply: respond(text, persona) }), 1600));
  };

  const newSession = () => {
    const id = nextId.current++;
    setSessions((list) => [{ id, title: "New session", turns: [] }, ...list]);
    setActiveId(id);
  };

  const exportTranscript = () => {
    if (!active) return;
    const lines = active.turns.flatMap((t) => [
      { role: "user" as const, text: t.question },
      { role: "assistant" as const, text: replyText(t.reply) },
    ]);
    download("copilot-transcript.txt", transcriptToText(active.title, scope, lines), "text/plain");
  };

  if (!aiAvailable) {
    return (
      <div className="space-y-6">
        <PageHeading eyebrow="AI" title="Copilot" description="Ask questions about your recognition programme." />
        <Card>
          <CardContent className="p-6 text-sm">
            AI is turned off for your organisation. Everything still works by hand — use Analytics, Fairness and Workflows directly.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="AI"
        title="Copilot"
        description="Ask questions in plain language. Answers use only your data, and nothing changes without your confirmation."
        action={
          <Button variant="outline" onClick={exportTranscript} disabled={!active?.turns.length}>
            <Download className="size-4" /> Export transcript
          </Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-2">
          <Button className="w-full" onClick={newSession}>
            <Plus className="size-4" /> New session
          </Button>
          <ul className="flex gap-1 overflow-x-auto lg:block lg:space-y-1">
            {sessions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "w-full truncate whitespace-nowrap rounded-md px-3 py-2 text-left text-sm",
                    s.id === activeId ? "bg-muted font-medium" : "hover:bg-muted/60",
                  )}
                >
                  {s.title}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <Card className="flex min-h-[60vh] flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
            <Eye className="size-3.5" /> Can see: {scope}
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-4">
            {active?.turns.length === 0 && (
              <div className="py-10 text-center">
                <p className="font-medium">What would you like to know?</p>
                <div className="mx-auto mt-4 flex max-w-md flex-col gap-2">
                  {suggestions.map((s) => (
                    <Button key={s} variant="outline" onClick={() => ask(s)}>
                      {s}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            {active?.turns.map((t) => (
              <div key={t.id} className="space-y-3">
                <p className="ml-auto w-fit max-w-[85%] rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground">{t.question}</p>
                <div className="max-w-[95%]">
                  <Reply turn={t} onAsk={ask} onRetry={() => ask(t.question.replace(/timeout|slow|error/gi, "coverage"))} />
                </div>
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 border-t border-border p-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
              placeholder="Ask about coverage, winners or fairness"
              className="min-h-11 resize-none"
              rows={1}
              maxLength={500}
            />
            <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
