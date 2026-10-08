/** Amount formulas for reward steps (checklist §7.1 Formula Editor). */
/** Variables an amount formula may use. */
export const formulaVariables = ["rank", "metric", "target", "base", "tenure_years"] as const;

/** Small recursive-descent evaluator: no eval, only the grammar a formula may use. */
function evaluate(tokens: string[], vars: Record<string, number>): number {
  let pos = 0;
  const peek = () => tokens[pos];
  const take = (t?: string) => {
    const tok = tokens[pos];
    if (t !== undefined && tok !== t) throw new Error(`expected ${t}`);
    pos++;
    return tok;
  };
  const factor = (): number => {
    const t = peek();
    if (t === undefined) throw new Error("end");
    if (t === "-") {
      take();
      return -factor();
    }
    if (t === "(") {
      take("(");
      const v = expr();
      take(")");
      return v;
    }
    if (t === "min" || t === "max") {
      take();
      take("(");
      const args = [expr()];
      while (peek() === ",") {
        take(",");
        args.push(expr());
      }
      take(")");
      return t === "min" ? Math.min(...args) : Math.max(...args);
    }
    take();
    if (/^\d/.test(t)) return Number(t);
    if (t in vars) return vars[t] ?? 0;
    throw new Error(`unexpected ${t}`);
  };
  const term = (): number => {
    let v = factor();
    while (peek() === "*" || peek() === "/") v = take() === "*" ? v * factor() : v / factor();
    return v;
  };
  const expr = (): number => {
    let v = term();
    while (peek() === "+" || peek() === "-") v = take() === "+" ? v + term() : v - term();
    return v;
  };
  const result = expr();
  if (pos !== tokens.length) throw new Error("trailing");
  return result;
}

export type FormulaCheck = { ok: true; example: number } | { ok: false; error: string };

/**
 * Validates an amount formula: numbers, + − × ÷, brackets, min()/max() and the known variables.
 * Evaluated with sample values so people see what it produces (checklist §7.1 Formula Editor).
 */
export function checkFormula(
  formula: string,
  sample: Record<string, number> = {
    rank: 1,
    metric: 112,
    target: 100,
    base: 1000,
    tenure_years: 3,
  },
): FormulaCheck {
  const text = formula.trim();
  if (!text) return { ok: false, error: "Enter a formula, e.g. base * metric / target" };
  const tokens = text.match(/[A-Za-z_]+|\d+(\.\d+)?|[()+\-*/,]|\S/g) ?? [];
  for (const t of tokens) {
    if (
      /^[A-Za-z_]+$/.test(t) &&
      !(formulaVariables as readonly string[]).includes(t) &&
      t !== "min" &&
      t !== "max"
    )
      return {
        ok: false,
        error: `Unknown name “${t}”. Use: ${formulaVariables.join(", ")}, min, max.`,
      };
    if (!/^([A-Za-z_]+|\d+(\.\d+)?|[()+\-*/,])$/.test(t))
      return { ok: false, error: `“${t}” is not allowed in a formula.` };
  }
  let depth = 0;
  for (const t of tokens) {
    if (t === "(") depth++;
    if (t === ")") depth--;
    if (depth < 0) return { ok: false, error: "A closing bracket has no opening bracket." };
  }
  if (depth !== 0) return { ok: false, error: "Brackets don't match." };
  try {
    const value = evaluate(tokens, sample);
    if (!Number.isFinite(value))
      return { ok: false, error: "The formula doesn't produce a number (check for ÷ 0)." };
    if (value < 0) return { ok: false, error: "The formula can produce a negative amount." };
    return { ok: true, example: Math.round(value) };
  } catch {
    return { ok: false, error: "The formula is incomplete — check operators and brackets." };
  }
}
