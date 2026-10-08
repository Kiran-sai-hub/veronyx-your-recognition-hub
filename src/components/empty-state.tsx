import type { ReactNode } from "react";

import { EmptyIllustration, type IllustrationKind } from "@/components/illustrations";

/** Shared empty state (checklist §6.1): illustration, exact copy, optional call to action. */
export function EmptyState({
  title,
  description,
  action,
  illustration = "start",
}: {
  title: string;
  description?: string | undefined;
  action?: ReactNode;
  illustration?: IllustrationKind;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border px-6 py-10 text-center">
      <EmptyIllustration kind={illustration} className="h-28 w-auto" />
      <div className="max-w-md space-y-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
