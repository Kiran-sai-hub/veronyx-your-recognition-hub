import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/** Stepper for wizards (checklist §7.1): horizontal or vertical, with done/current/upcoming. */
export function Stepper({
  steps,
  current,
  orientation = "horizontal",
  onStepClick,
  className,
}: {
  steps: { label: string; description?: string }[];
  current: number;
  orientation?: "horizontal" | "vertical";
  /** Called for completed steps so people can go back. */
  onStepClick?: ((index: number) => void) | undefined;
  className?: string;
}) {
  return (
    <ol
      aria-label="Progress"
      className={cn(
        orientation === "horizontal" ? "flex flex-wrap items-center gap-2" : "space-y-4",
        className,
      )}
    >
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li
            key={step.label}
            className={cn(
              "flex gap-2",
              orientation === "horizontal" ? "items-center" : "items-start",
            )}
            aria-current={active ? "step" : undefined}
          >
            <button
              type="button"
              disabled={!done || !onStepClick}
              onClick={() => onStepClick?.(i)}
              className="flex items-start gap-2 text-left disabled:cursor-default"
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  done && "bg-success text-success-foreground",
                  active && "bg-primary text-primary-foreground",
                  !done && !active && "bg-muted text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span>
                <span
                  className={cn("block text-sm", active ? "font-medium" : "text-muted-foreground")}
                >
                  {step.label}
                </span>
                {orientation === "vertical" && step.description && (
                  <span className="block text-xs text-muted-foreground">{step.description}</span>
                )}
              </span>
            </button>
            {orientation === "horizontal" && i < steps.length - 1 && (
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
