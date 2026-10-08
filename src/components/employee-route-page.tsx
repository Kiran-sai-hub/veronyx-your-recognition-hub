import { AppShell } from "@/components/app-shell";
import { EmployeePage, type EmployeePageKind } from "@/components/employee-page";

export function EmployeeRoutePage({
  kind,
  pathname,
}: {
  kind: EmployeePageKind;
  pathname: string;
}) {
  return (
    <AppShell pathname={pathname}>
      <EmployeePage kind={kind} />
    </AppShell>
  );
}
