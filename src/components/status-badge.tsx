import { CheckCircle2, Clock3, LockKeyhole, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  children: React.ReactNode;
  tone?: "success" | "warning" | "error" | "private" | "neutral" | "reward";
};

export function StatusBadge({ children, tone = "neutral" }: StatusBadgeProps) {
  const Icon =
    tone === "success"
      ? CheckCircle2
      : tone === "warning" || tone === "error"
        ? TriangleAlert
        : tone === "private"
          ? LockKeyhole
          : Clock3;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "success" && "border-success/30 bg-success/10 text-success",
        tone === "warning" && "border-warning/30 bg-warning/10 text-warning-foreground",
        tone === "error" && "border-destructive/30 bg-destructive/10 text-destructive",
        tone === "private" && "border-private/25 bg-private-surface text-private",
        tone === "reward" && "border-reward/30 bg-reward/10 text-reward",
        tone === "neutral" && "border-border bg-muted text-muted-foreground",
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}
