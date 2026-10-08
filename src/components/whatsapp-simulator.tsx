import { Bell, Gift, QrCode, Send } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  botReply,
  botText,
  initialBotState,
  recognitionNotification,
  type BotState,
} from "@/lib/whatsapp-bot";

type Bubble = { id: number; from: "me" | "bot"; text: string; time: string };
type LogRow = {
  time: string;
  template: string;
  status: "delivered" | "suppressed_no_optin" | "consent";
  detail: string;
};

const quick = [
  "JOIN",
  "BALANCE",
  "REDEEM",
  "1",
  "2",
  "THANKS @Priya for Diwali rush help",
  "LANG hi",
  "STOP",
];

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Frontline WhatsApp journey (checklist §3.5) — a simulation, nothing is really sent. */
export function WhatsappSimulator() {
  const [state, setState] = useState<BotState>(initialBotState);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [input, setInput] = useState("");
  const [seq, setSeq] = useState(1);
  const [invited, setInvited] = useState(false);

  const push = (items: Omit<Bubble, "id" | "time">[]) => {
    setBubbles((b) => [...b, ...items.map((item, i) => ({ ...item, id: seq + i, time: now() }))]);
    setSeq((n) => n + items.length);
  };

  const send = (text: string) => {
    const trimmed = text.trim().slice(0, 200);
    if (!trimmed) return;
    const result = botReply(trimmed, state);
    if (trimmed.toUpperCase() === "JOIN" && !state.joined)
      setLog((l) => [
        {
          time: now(),
          template: "consent_capture",
          status: "consent",
          detail: "WhatsApp consent granted · evidence wamid.HBgM91 · +91 98431 22014",
        },
        ...l,
      ]);
    if (trimmed.toUpperCase() === "STOP")
      setLog((l) => [
        {
          time: now(),
          template: "opt_out",
          status: "consent",
          detail: "Consent withdrawn — all messages suppressed immediately",
        },
        ...l,
      ]);
    setState(result.state);
    push([
      { from: "me", text: trimmed },
      { from: "bot", text: result.reply },
    ]);
    setInput("");
  };

  const notify = () => {
    if (!state.joined || state.stopped) {
      setLog((l) => [
        {
          time: now(),
          template: `ranked_on_board_${state.language}`,
          status: "suppressed_no_optin",
          detail: "Not sent — employee has not opted in",
        },
        ...l,
      ]);
      return;
    }
    setState({ ...state, lastNotification: true });
    setLog((l) => [
      {
        time: now(),
        template: `ranked_on_board_${state.language}`,
        status: "delivered",
        detail: "Utility template · approved by Meta",
      },
      ...l,
    ]);
    push([{ from: "bot", text: recognitionNotification(state.language) }]);
  };

  const deliverVoucher = () => {
    if (!state.joined || state.stopped) return;
    setLog((l) => [
      {
        time: now(),
        template: `voucher_delivered_${state.language}`,
        status: "delivered",
        detail: "Utility template",
      },
      ...l,
    ]);
    push([{ from: "bot", text: botText("voucher", state.language) }]);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Frontline · no app install"
        title="WhatsApp bot"
        description="What a factory worker sees on WhatsApp. Messages come from your company's business account, in the worker's language."
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setInvited(true)}>
              <QrCode className="size-4" /> HR: send opt-in link
            </Button>
            <Button variant="outline" onClick={notify}>
              <Bell className="size-4" /> Send a recognition
            </Button>
            <Button
              variant="outline"
              onClick={deliverVoucher}
              disabled={!state.joined || state.stopped}
            >
              <Gift className="size-4" /> Simulate: reward picked in app
            </Button>
          </div>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2rem] border-8 border-foreground/80 shadow-lg">
          <div className="flex items-center gap-3 bg-[#075e54] px-4 py-3 text-white">
            <div className="grid size-9 place-items-center rounded-full bg-reward font-bold text-reward-foreground">
              RK
            </div>
            <div>
              <p className="text-sm font-semibold">Radha Krishna Mills</p>
              <p className="text-[11px] opacity-80">Business account · powered by Veronyx</p>
            </div>
          </div>
          <div
            className="flex h-[480px] flex-col gap-2 overflow-y-auto bg-[#ece5dd] p-3 dark:bg-muted"
            aria-live="polite"
          >
            {invited && bubbles.length === 0 && (
              <p className="max-w-[85%] rounded-lg bg-white px-3 py-2 text-[15px] text-black shadow-sm dark:bg-card dark:text-foreground">
                Radha Krishna Mills invites you to get recognition and rewards on WhatsApp. Reply
                JOIN to opt in. You can reply STOP any time.
              </p>
            )}
            {!invited && bubbles.length === 0 && (
              <p className="m-auto max-w-[80%] text-center text-xs text-muted-foreground">
                Start with “HR: send opt-in link”, then reply JOIN. Simulation — no real messages
                are sent.
              </p>
            )}
            {bubbles.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-[15px] leading-snug text-black shadow-sm dark:text-foreground",
                  b.from === "me"
                    ? "ml-auto bg-[#dcf8c6] dark:bg-success/20"
                    : "bg-white dark:bg-card",
                )}
              >
                {b.text}
                <span className="ml-2 align-bottom text-[10px] text-black/50 dark:text-muted-foreground">
                  {b.time}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto bg-card px-2 pt-2">
            {quick.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="min-h-9 shrink-0 rounded-full border border-border px-3 text-xs"
              >
                {q.length > 16 ? `${q.slice(0, 16)}…` : q}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2 bg-card p-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message"
              aria-label="Message"
              maxLength={200}
            />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="size-4" />
            </Button>
          </form>
        </div>
        <div className="space-y-4 text-sm">
          <Card className="rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                <li>
                  <b>JOIN</b> — opts in; consent is recorded with evidence.
                </li>
                <li>
                  <b>1 / 2</b> — after a recognition: redeem, or see the details.
                </li>
                <li>
                  <b>BALANCE</b> — coins and points expiring soon.
                </li>
                <li>
                  <b>REDEEM</b> — OTP-secured link to the catalogue; the voucher arrives here.
                </li>
                <li>
                  <b>THANKS @name reason</b> — peer shoutout.
                </li>
                <li>
                  <b>LANG hi / ta / en</b> — all future messages in that language.
                </li>
                <li>
                  <b>STOP</b> — all messages suppressed immediately.
                </li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Status:{" "}
                <StatusBadge tone={state.stopped ? "error" : state.joined ? "success" : "neutral"}>
                  {state.stopped ? "Opted out" : state.joined ? "Opted in" : "Not joined"}
                </StatusBadge>{" "}
                · Language {state.language.toUpperCase()}
              </p>
            </CardContent>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Message log (admin view)</CardTitle>
            </CardHeader>
            <CardContent>
              {log.length === 0 ? (
                <p className="text-muted-foreground">No messages yet.</p>
              ) : (
                <ul className="space-y-2">
                  {log.map((row, i) => (
                    <li
                      key={i}
                      className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-2 last:border-0"
                    >
                      <span>
                        <span className="font-mono text-xs">{row.template}</span>
                        <span className="block text-xs text-muted-foreground">
                          {row.time} · {row.detail}
                        </span>
                      </span>
                      <StatusBadge
                        tone={
                          row.status === "delivered"
                            ? "success"
                            : row.status === "consent"
                              ? "neutral"
                              : "error"
                        }
                      >
                        {row.status}
                      </StatusBadge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
