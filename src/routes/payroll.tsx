import { createFileRoute } from "@tanstack/react-router";

import { AdminRoutePage } from "@/components/admin-route-page";
import { PayrollPage } from "@/components/payroll-page";

export const Route = createFileRoute("/payroll")({
  head: () => ({
    meta: [
      { title: "Payroll export — Veronyx Recognise" },
      {
        name: "description",
        content: "Export reward amounts to your payroll system with validation and history.",
      },
      { property: "og:title", content: "Payroll export — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Export reward amounts to your payroll system with validation and history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RoutePage,
});

function RoutePage() {
  return (
    <AdminRoutePage pathname="/payroll">
      <PayrollPage />
    </AdminRoutePage>
  );
}
