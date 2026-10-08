import { Pause, Play, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { employees, recognitions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ROTATE_MS = 10000;
const slides = ["Top teams this month", "Recent recognitions", "Plant goal"] as const;

const topTeams = [
  { team: "Spinning – day", points: 18450 },
  { team: "Quality lab", points: 16200 },
  { team: "Packing A", points: 14980 },
  { team: "Dyeing", points: 12110 },
  { team: "Weaving B", points: 11040 },
];

type KioskDisplayProps = { onExit: () => void };

export function KioskDisplay({ onExit }: KioskDisplayProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const reduce =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      document.documentElement.classList.contains("reduce-motion");
    if (reduce) setPaused(true);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [paused]);

  const names = employees.slice(10, 13).map((e) => e.name);

  return (
    <div className="flex min-h-screen flex-col bg-background p-8 text-foreground lg:p-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-lg bg-reward text-xl font-bold text-reward-foreground">
            RK
          </div>
          <div>
            <p className="text-2xl font-bold sm:text-3xl">Radha Krishna Mills</p>
            <p className="text-sm text-muted-foreground">Coimbatore plant · powered by Veronyx</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? <Play className="size-5" /> : <Pause className="size-5" />}
          </Button>
          <Button variant="ghost" size="lg" onClick={onExit}>
            Exit kiosk
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col justify-center py-10" aria-live="polite">
        <h1 className="mb-8 text-5xl font-bold">{slides[index]}</h1>
        {index === 0 && (
          <ol className="space-y-4">
            {topTeams.map((t, i) => (
              <li
                key={t.team}
                className="flex items-center justify-between rounded-xl bg-card p-6 text-3xl shadow-sm"
              >
                <span className="flex items-center gap-5">
                  <span
                    className={cn(
                      "w-10 font-bold",
                      i === 0 ? "text-reward" : "text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  {t.team}
                </span>
                <span className="font-semibold text-reward">
                  {t.points.toLocaleString("en-IN")} pts
                </span>
              </li>
            ))}
          </ol>
        )}
        {index === 1 && (
          <div className="grid gap-6 lg:grid-cols-3">
            {recognitions.map((r, i) => (
              <div key={r.id} className="rounded-xl bg-card p-8 shadow-sm">
                <Trophy className="size-10 text-reward" />
                <p className="mt-4 text-3xl font-bold">{names[i]}</p>
                <p className="mt-2 text-2xl text-primary">{r.title}</p>
                <p className="mt-3 text-xl text-muted-foreground">{r.message}</p>
              </div>
            ))}
          </div>
        )}
        {index === 2 && (
          <div className="rounded-xl bg-card p-10 shadow-sm">
            <p className="text-3xl">Zero-defect days this month</p>
            <p className="mt-4 text-8xl font-bold text-primary">18 / 22</p>
            <div className="mt-8 h-6 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[82%] rounded-full bg-primary" />
            </div>
            <p className="mt-4 text-2xl text-muted-foreground">
              4 more days to unlock the Diwali team lunch
            </p>
          </div>
        )}
      </main>

      <footer className="flex justify-center gap-3">
        {slides.map((s, i) => (
          <button
            key={s}
            type="button"
            aria-label={`Show ${s}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-3 rounded-full transition-all",
              i === index ? "w-10 bg-primary" : "w-3 bg-muted-foreground/40",
            )}
          />
        ))}
      </footer>
    </div>
  );
}
