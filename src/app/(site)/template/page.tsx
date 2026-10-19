import type { Metadata } from "next";
import GsapMacbookLandingPage from "@/components/templates/gsap-macbook-landing-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Halcyon — Cinematic Product Launch",
  description:
    "An immersive laptop landing page template with GSAP scroll choreography, 3D model switching, cinematic media, and performance feature sections.",
  alternates: { canonical: "/template" },
});

export default function TemplatePage() {
  return <GsapMacbookLandingPage />;
}
