import { cn } from "@/lib/utils";

/** Circular progress (checklist §7.1 Progress: circular), e.g. weights adding to 100%. */
export function CircularProgress({
  value,
  size = 72,
  stroke = 8,
  label,
  className,
  tone = "primary",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  className?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (clamped / 100) * c}
          className={cn(
            "transition-[stroke-dashoffset] motion-reduce:transition-none",
            tone === "primary" && "stroke-primary",
            tone === "success" && "stroke-success",
            tone === "warning" && "stroke-warning",
            tone === "destructive" && "stroke-destructive",
          )}
        />
      </svg>
      <span className="absolute text-sm font-semibold">{Math.round(clamped)}%</span>
    </div>
  );
}
