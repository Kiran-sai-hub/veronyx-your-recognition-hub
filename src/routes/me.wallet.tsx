import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/wallet")({
  head: () => ({
    meta: [
      { title: "My wallet — Radha Krishna Mills" },
      { name: "description", content: "View your points, upcoming expiries and wallet activity." },
      { property: "og:title", content: "My wallet — Radha Krishna Mills" },
      {
        property: "og:description",
        content: "View your points, upcoming expiries and wallet activity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="wallet" pathname="/me/wallet" />,
});
