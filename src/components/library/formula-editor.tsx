import { useId } from "react";

import { checkFormula, formulaVariables } from "@/lib/formula";
import { cn } from "@/lib/utils";

function highlight(formula: string) {
  const parts = formula.match(/[A-Za-z_]+|\d+(\.\d+)?|\s+|./g) ?? [];
  return parts.map((p, i) => (
    <span
      key={i}
      className={cn(
        /^\d/.test(p) && "text-reward",
        /^[A-Za-z_]+$/.test(p) &&
          ((formulaVariables as readonly string[]).includes(p)
            ? "text-primary"
            : p === "min" || p === "max"
              ? "text-private"
              : "text-destructive underline decoration-wavy"),
        /^[()+\-*/,]$/.test(p) && "text-muted-foreground",
      )}
    >
      {p}
    </span>
  ));
}

/** Amount formula editor with syntax highlighting and live validation. */
export function FormulaEditor({
  value,
  onChange,
  id,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
}) {
  const auto = useId();
  const inputId = id ?? auto;
  const result = checkFormula(value);
  return (
    <div className="space-y-1.5">
      <div className="relative rounded-md border border-input bg-background font-mono text-sm focus-within:ring-2 focus-within:ring-ring">
        <div aria-hidden className="pointer-events-none whitespace-pre-wrap break-all px-3 py-2">
          {highlight(value)}
          {"​"}
        </div>
        <textarea
          id={inputId}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value.replace(/\n/g, ""))}
          spellCheck={false}
          rows={1}
          aria-invalid={!result.ok}
          aria-describedby={`${inputId}-help`}
          className="absolute inset-0 resize-none overflow-hidden bg-transparent px-3 py-2 text-transparent caret-foreground outline-none"
        />
      </div>
      <p
        id={`${inputId}-help`}
        className={cn("text-xs", result.ok ? "text-muted-foreground" : "text-destructive")}
      >
        {result.ok
          ? `Valid. Example: rank 1, sales 112% of target, base ₹1,000 → ₹${result.example.toLocaleString("en-IN")}`
          : result.error}
      </p>
      <p className="text-[11px] text-muted-foreground">
        You can use {formulaVariables.join(", ")}, numbers, + − * /, brackets, min() and max().
      </p>
    </div>
  );
}
