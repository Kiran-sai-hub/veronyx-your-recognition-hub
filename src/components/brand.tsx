import { Hexagon } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandProps = { compact?: boolean; employer?: boolean; className?: string };

export function Brand({ compact = false, employer = false, className }: BrandProps) {
  if (employer) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <div className="grid size-10 place-items-center rounded-md bg-reward text-reward-foreground font-bold">
          RK
        </div>
        {!compact && (
          <div>
            <p className="font-semibold leading-tight">Radha Krishna Mills</p>
            <p className="text-xs text-muted-foreground">Powered by Veronyx</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
        <Hexagon className="size-5" />
      </div>
      {!compact && (
        <div>
          <p className="font-semibold leading-tight">Veronyx</p>
          <p className="text-xs text-muted-foreground">Recognise</p>
        </div>
      )}
    </div>
  );
}
