import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Line = { kind: "same" | "added" | "removed"; text: string };

/** Line diff using the longest common subsequence (small inputs only — workflow summaries). */
export function diffLines(before: string[], after: string[]): Line[] {
  const n = before.length;
  const m = after.length;
  const lcs: number[][] = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      lcs[i]![j] =
        before[i] === after[j]
          ? (lcs[i + 1]![j + 1] ?? 0) + 1
          : Math.max(lcs[i + 1]![j] ?? 0, lcs[i]![j + 1] ?? 0);
  const out: Line[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (before[i] === after[j]) {
      out.push({ kind: "same", text: before[i]! });
      i++;
      j++;
    } else if ((lcs[i + 1]![j] ?? 0) >= (lcs[i]![j + 1] ?? 0))
      out.push({ kind: "removed", text: before[i++]! });
    else out.push({ kind: "added", text: after[j++]! });
  }
  while (i < n) out.push({ kind: "removed", text: before[i++]! });
  while (j < m) out.push({ kind: "added", text: after[j++]! });
  return out;
}

const lineClass = {
  same: "",
  added: "bg-success/10 text-success",
  removed: "bg-destructive/10 text-destructive line-through decoration-destructive/40",
};
const sign = { same: " ", added: "+", removed: "−" };

/** Side-by-side or inline diff for comparing workflow versions (checklist §7.1). */
export function DiffViewer({
  before,
  after,
  beforeLabel,
  afterLabel,
}: {
  before: string[];
  after: string[];
  beforeLabel: string;
  afterLabel: string;
}) {
  const [mode, setMode] = useState<"split" | "inline">("split");
  const lines = diffLines(before, after);
  return (
    <div className="space-y-2">
      <div className="flex gap-1" role="group" aria-label="Diff layout">
        {(["split", "inline"] as const).map((m) => (
          <Button
            key={m}
            size="sm"
            variant={mode === m ? "default" : "outline"}
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
          >
            {m === "split" ? "Side by side" : "Inline"}
          </Button>
        ))}
      </div>
      {mode === "inline" ? (
        <pre className="overflow-x-auto rounded-md border border-border font-mono text-xs">
          {lines.map((l, i) => (
            <div key={i} className={cn("px-3 py-0.5", lineClass[l.kind])}>
              <span aria-hidden>{sign[l.kind]} </span>
              <span className="sr-only">{l.kind === "same" ? "" : `${l.kind}: `}</span>
              {l.text}
            </div>
          ))}
        </pre>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {[
            { label: beforeLabel, rows: lines.filter((l) => l.kind !== "added") },
            { label: afterLabel, rows: lines.filter((l) => l.kind !== "removed") },
          ].map((side) => (
            <div key={side.label} className="overflow-x-auto rounded-md border border-border">
              <p className="border-b border-border px-3 py-1.5 text-xs font-medium">{side.label}</p>
              <pre className="font-mono text-xs">
                {side.rows.map((l, i) => (
                  <div key={i} className={cn("px-3 py-0.5", lineClass[l.kind])}>
                    <span aria-hidden>{sign[l.kind]} </span>
                    <span className="sr-only">{l.kind === "same" ? "" : `${l.kind}: `}</span>
                    {l.text}
                  </div>
                ))}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
