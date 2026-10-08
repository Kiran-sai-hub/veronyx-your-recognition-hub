import { createFileRoute } from "@tanstack/react-router";
import { EmployeeRoutePage } from "@/components/employee-route-page";
export const Route = createFileRoute("/me/redeem")({
  head: () => ({
    meta: [
      { title: "Reward catalogue — Radha Krishna Mills" },
      { name: "description", content: "Redeem points for vouchers, experiences and donations." },
      { property: "og:title", content: "Reward catalogue — Radha Krishna Mills" },
      {
        property: "og:description",
        content: "Redeem points for vouchers, experiences and donations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <EmployeeRoutePage kind="rewards" pathname="/me/redeem" />,
});
