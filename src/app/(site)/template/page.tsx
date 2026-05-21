import type { Metadata } from "next";
import { NexusAiLaunchTemplatePage } from "@/components/templates/nexus-ai-launch-template-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "AI Launch Template",
  description:
    "A modern Nexus UI landing page template built from local components, motion sections, bento cards, testimonials, and FAQs.",
  alternates: { canonical: "/template" },
});

export default function TemplatePage() {
  return <NexusAiLaunchTemplatePage />;
}
