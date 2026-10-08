import { Bell, Send } from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/page-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  botReply,
  initialBotState,
  recognitionNotification,
  type BotState,
} from "@/lib/whatsapp-bot";
import { cn } from "@/lib/utils";

type Bubble = { id: number; from: "me" | "bot"; text: string; time: string };

const quick = ["JOIN", "BALANCE", "REDEEM", "THANKS Arun", "LANG", "STOP"];

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function WhatsappSimulator() {
  const [state, setState] = useState<BotState>(initialBotState);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [nextId, setNextId] = useState(1);

  const send = (text: string) => {
    const trimmed = text.trim().slice(0, 200);
    if (!trimmed) return;
    const result = botReply(trimmed, state);
    setState(result.state);
    setBubbles((b) => [
      ...b,
      { id: nextId, from: "me", text: trimmed, time: now() },
      { id: nextId + 1, from: "bot", text: result.reply, time: now() },
    ]);
    setNextId((n) => n + 2);
    setInput("");
  };

  const notify = () => {
    if (!state.joined || state.stopped) return;
    setBubbles((b) => [
      ...b,
      { id: nextId, from: "bot", text: recognitionNotification(state.language), time: now() },
    ]);
    setNextId((n) => n + 1);
  };

  return (
    <div className="space-y-6">
      <PageHeading
        eyebrow="Frontline"
        title="WhatsApp simulator"
        description="Try what a factory worker sees on WhatsApp. Messages show your company's name, not ours."
        action={
          <Button variant="outline" onClick={notify} disabled={!state.joined || state.stopped}>
            <Bell className="size-4" /> Send a recognition
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="mx-auto w-full max-w-[380px] overflow-hidden rounded-[2rem] border-8 border-foreground/80 shadow-lg">
          <div className="flex items-center gap-3 bg-success px-4 py-3 text-success-foreground">
            <div className="grid size-9 place-items-center rounded-full bg-reward font-bold text-reward-foreground">
              RK
            </div>
            <div>
              <p className="text-sm font-semibold">Radha Krishna Mills</p>
              <p className="text-[11px] opacity-80">Business account · powered by Veronyx</p>
            </div>
          </div>
          <div
            className="flex h-[480px] flex-col gap-2 overflow-y-auto bg-muted p-3"
            aria-live="polite"
          >
            {bubbles.length === 0 && (
              <p className="m-auto max-w-[80%] text-center text-xs text-muted-foreground">
                Send JOIN to start. This is a simulation — no real messages are sent.
              </p>
            )}
            {bubbles.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "max-w-[85%] rounded-lg px-3 py-2 text-[15px] leading-snug shadow-sm",
                  b.from === "me" ? "ml-auto bg-success/20" : "bg-card",
                )}
              >
                {b.text}
                <span className="ml-2 align-bottom text-[10px] text-muted-foreground">
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
                className="shrink-0 rounded-full border border-border px-3 py-1 text-xs"
              >
                {q}
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
        <div className="space-y-3 text-sm">
          <h2 className="text-lg font-semibold">What each word does</h2>
          <ul className="space-y-2">
            <li>
              <b>JOIN</b> — signs up and records WhatsApp consent.
            </li>
            <li>
              <b>BALANCE</b> — replies with current points.
            </li>
            <li>
              <b>REDEEM</b> — sends a 15-minute secure link to the reward page.
            </li>
            <li>
              <b>THANKS name</b> — sends a thank-you to a colleague.
            </li>
            <li>
              <b>LANG</b> — switches English → தமிழ் → हिन्दी (or LANG ta / hi).
            </li>
            <li>
              <b>STOP</b> — stops all messages immediately.
            </li>
          </ul>
          <p className="text-muted-foreground">
            Status: {state.stopped ? "stopped" : state.joined ? "joined" : "not joined"} · language{" "}
            {state.language.toUpperCase()}
          </p>
        </div>
      </div>
    </div>
  );
}
