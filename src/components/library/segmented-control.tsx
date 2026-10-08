import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Pill-style filter switch. Looks like tabs but is a group of pressed buttons, because it filters
 * one list instead of switching between panels.
 */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-9 w-fit items-center rounded-lg bg-muted p-1 text-muted-foreground"
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-7 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors",
            value === o.value ? "bg-background text-foreground shadow" : "hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
