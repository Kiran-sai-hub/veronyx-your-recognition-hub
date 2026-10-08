import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
  Sparkles,
  Wand2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import type { AutoFix, Check, DryRunResult } from "@/lib/workflow-model";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";

const statusIcon = {
  pass: { Icon: CheckCircle2, className: "text-success", label: "Passed" },
  warn: { Icon: AlertTriangle, className: "text-warning", label: "Warning" },
  error: { Icon: XCircle, className: "text-destructive", label: "Error" },
} as const;

/** V1–V14 report (checklist §5.3 E): every rule with its status, explanation and fix. */
export function ValidationReport({
  checks,
  onAutoFix,
  onRevalidate,
  onAskAi,
  defaultOpen = false,
}: {
  checks: Check[];
  onAutoFix?: ((fix: AutoFix) => void) | undefined;
  onRevalidate?: (() => void) | undefined;
  onAskAi?: ((check: Check) => void) | undefined;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const [showPassed, setShowPassed] = useState(defaultOpen);
  const errors = checks.filter((c) => c.status === "error").length;
  const warnings = checks.filter((c) => c.status === "warn").length;
  const visible = showPassed ? checks : checks.filter((c) => c.status !== "pass");
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {errors > 0 ? (
            <span className="text-destructive">
              ❌ {errors} error{errors > 1 ? "s" : ""} block saving
            </span>
          ) : (
            <span className="text-success">✅ Validation passed</span>
          )}
          {warnings > 0 && (
            <span className="text-warning">
              {" "}
              · ⚠️ {warnings} warning{warnings > 1 ? "s" : ""}
            </span>
          )}
          <span className="text-muted-foreground">
            {" "}
            · {checks.length - errors - warnings} of {checks.length} passed
          </span>
        </p>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowPassed((v) => !v)}>
            {showPassed ? "Hide passed" : "Show all V1–V14"}
          </Button>
          {onRevalidate && (
            <Button variant="outline" size="sm" onClick={onRevalidate}>
              <RefreshCw /> Re-validate
            </Button>
          )}
        </div>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {visible.map((check) => {
          const { Icon, className, label } = statusIcon[check.status];
          const expanded = open === check.code;
          return (
            <li key={check.code}>
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setOpen(expanded ? null : check.code)}
                className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted/60"
              >
                <Icon className={cn("size-4 shrink-0", className)} aria-label={label} />
                <span className="w-9 shrink-0 font-mono text-xs text-muted-foreground">
                  {check.code}
                </span>
                <span className="flex-1">{check.title}</span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform",
                    expanded && "rotate-180",
                  )}
                />
              </button>
              {expanded && (
                <div className="space-y-2 bg-muted/40 px-3 pb-3 pl-14 text-sm">
                  <p>{check.detail}</p>
                  {check.fix && <p className="text-muted-foreground">Suggested fix: {check.fix}</p>}
                  <div className="flex flex-wrap gap-2">
                    {check.autoFix && onAutoFix && (
                      <Button size="sm" variant="outline" onClick={() => onAutoFix(check.autoFix!)}>
                        <Wand2 /> Fix automatically
                      </Button>
                    )}
                    {check.status !== "pass" && onAskAi && (
                      <Button size="sm" variant="ghost" onClick={() => onAskAi(check)}>
                        <Sparkles /> Ask AI to fix
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">All 14 checks passed.</li>
        )}
      </ul>
    </div>
  );
}

/** Dry-run results (checklist §4.7, §5.3 F): summary, periods, fairness, unmatched, caps, diff. */
export function DryRunReport({
  result,
  pool,
  actions,
  onRerun,
}: {
  result: DryRunResult;
  pool: string;
  actions?: React.ReactNode;
  onRerun?: () => void;
}) {
  return (
    <div className="space-y-5">
      <section aria-label="Summary" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Periods simulated", String(result.periods.length)],
          ["Total cost", formatRupees(result.totalCost)],
          ["Budget", result.budgetOk ? "✅ OK" : "❌ Insufficient"],
          ["Winners per period", result.periods.map((p) => p.winners.length).join(", ")],
        ].map(([label, value]) => (
          <div key={label} className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p
              className={cn(
                "text-lg font-bold",
                label === "Budget" && !result.budgetOk && "text-destructive",
              )}
            >
              {value}
            </p>
          </div>
        ))}
      </section>
      {!result.budgetOk && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Insufficient budget. Remaining: {formatRupees(result.budgetRemaining)} in{" "}
          {pool || "no pool"}. Required: {formatRupees(result.totalCost)}.
        </p>
      )}

      <section aria-labelledby="dr-periods" className="space-y-2">
        <h3 id="dr-periods" className="font-semibold">
          Per-period results
        </h3>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-muted text-left text-xs text-muted-foreground">
              <tr>
                <th className="p-2.5 font-medium">Period</th>
                <th className="p-2.5 font-medium">Winners (rank · value)</th>
                <th className="p-2.5 text-right font-medium">Cost</th>
                <th className="p-2.5 font-medium">Notes</th>
              </tr>
            </thead>
            <tbody>
              {result.periods.map((p) => (
                <tr key={p.period} className="border-t border-border align-top">
                  <td className="p-2.5 font-mono text-xs">{p.period}</td>
                  <td className="p-2.5">
                    {p.winners.map((w) => (
                      <span key={w.name + w.rank} className="mr-2 inline-block">
                        #{w.rank} {w.name} ({w.value})
                      </span>
                    ))}
                  </td>
                  <td className="p-2.5 text-right">{formatRupees(p.cost)}</td>
                  <td className="p-2.5 text-muted-foreground">{p.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          aria-labelledby="dr-fair"
          className="space-y-2 rounded-md border border-border p-3"
        >
          <h3 id="dr-fair" className="font-semibold">
            Fairness notes
          </h3>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {result.fairnessNotes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <figure aria-label="Winners by group">
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={result.distribution} margin={{ left: -24, right: 8 }}>
                <XAxis dataKey="group" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis allowDecimals={false} fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="winners" name="Winners" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <figcaption className="sr-only">
              Winners by group:{" "}
              {result.distribution.map((d) => `${d.group} ${d.winners}`).join(", ")}.
            </figcaption>
          </figure>
        </section>
        <div className="space-y-4">
          <section
            aria-labelledby="dr-unmatched"
            className="space-y-1 rounded-md border border-warning/30 bg-warning/5 p-3 text-sm"
          >
            <h3 id="dr-unmatched" className="font-semibold">
              ⚠️ {result.unmatched.count} unmatched record{result.unmatched.count === 1 ? "" : "s"}
            </h3>
            <ul className="text-muted-foreground">
              {result.unmatched.examples.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <a href="/connectors/mapping?tab=identity" className="text-primary underline">
              Open the identity resolution queue
            </a>
          </section>
          <section
            aria-labelledby="dr-caps"
            className="space-y-1 rounded-md border border-border p-3 text-sm"
          >
            <h3 id="dr-caps" className="font-semibold">
              Cap hits
            </h3>
            {result.capHits.length ? (
              <ul className="text-muted-foreground">
                {result.capHits.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Nobody hit a per-employee cap.</p>
            )}
          </section>
          {result.diff && (
            <section
              aria-labelledby="dr-diff"
              className="space-y-1 rounded-md border border-border p-3 text-sm"
            >
              <h3 id="dr-diff" className="font-semibold">
                Diff vs previous version
              </h3>
              {result.diff.added.map((a) => (
                <p key={a} className="text-success">
                  + Added: {a}
                </p>
              ))}
              {result.diff.changed.map((c) => (
                <p key={c} className="text-warning">
                  ~ Changed: {c}
                </p>
              ))}
              {!result.diff.added.length && !result.diff.changed.length && (
                <p className="text-muted-foreground">No changes.</p>
              )}
              <p className="font-medium">Impact: {result.diff.impact}</p>
            </section>
          )}
        </div>
      </div>
      {(actions || onRerun) && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {actions}
          {onRerun && (
            <Button variant="ghost" onClick={onRerun}>
              <RefreshCw /> Re-run with different parameters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
