import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";

export function AdminRoutePage({ pathname, children }: { pathname: string; children: ReactNode }) {
  return <AppShell pathname={pathname}>{children}</AppShell>;
}
