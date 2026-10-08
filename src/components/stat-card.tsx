import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  reward?: boolean;
};

export function StatCard({ label, value, detail, icon: Icon, reward = false }: StatCardProps) {
  return (
    <Card className="rounded-lg shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
          <div
            className={
              reward
                ? "grid size-9 place-items-center rounded-md bg-reward/10 text-reward"
                : "grid size-9 place-items-center rounded-md bg-primary/10 text-primary"
            }
          >
            <Icon className="size-5" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  );
}
