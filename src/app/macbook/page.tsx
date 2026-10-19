import type { Metadata } from "next";
import GsapMacbookLandingPage from "@/components/templates/gsap-macbook-landing-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "Halcyon — Cinematic Product Launch",
    description: "An immersive product landing page featuring interactive 3D model configuration (Graphite & Silver, 14\" & 16\"), GSAP scroll-driven animations, and performance metric collages.",
    alternates: { canonical: "/macbook" },
  }),
};

export default function MacbookPage() {
  return <GsapMacbookLandingPage />;
}
