import { cn } from "@/lib/utils";

/** Switch between the scripted Copilot and the live, evidence-cited Q&A (both Owner/HR only). */
export function CopilotTabs({ active }: { active: "copilot" | "insights" }) {
  const tabs = [
    { key: "copilot", href: "/copilot", label: "Copilot" },
    { key: "insights", href: "/insights", label: "Evidence Q&A (live AI)" },
  ] as const;
  return (
    <nav aria-label="AI Copilot views" className="inline-flex rounded-md bg-muted p-1">
      {tabs.map((t) => (
        <a
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={cn(
            "rounded-sm px-3 py-1.5 text-sm font-medium",
            active === t.key
              ? "bg-background shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
        </a>
      ))}
    </nav>
  );
}
