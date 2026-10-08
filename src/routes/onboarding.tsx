import { createFileRoute } from "@tanstack/react-router";
import { OnboardingPage } from "@/components/onboarding-page";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Organisation setup — Veronyx Recognise" },
      {
        name: "description",
        content: "Set up your organisation, teams, employees and first data source.",
      },
      { property: "og:title", content: "Organisation setup — Veronyx Recognise" },
      {
        property: "og:description",
        content: "Set up your organisation, teams, employees and first data source.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OnboardingPage,
});
