import { createFileRoute } from "@tanstack/react-router";
import { OtpLoginPage } from "@/components/auth-page";

export const Route = createFileRoute("/login/otp")({
  head: () => ({
    meta: [
      { title: "Mobile verification — Radha Krishna Mills" },
      {
        name: "description",
        content: "Verify your registered mobile number to access employee rewards.",
      },
      { property: "og:title", content: "Mobile verification — Radha Krishna Mills" },
      {
        property: "og:description",
        content: "Verify your registered mobile number to access employee rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OtpLoginPage,
});
