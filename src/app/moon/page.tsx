import type { Metadata } from "next";
import MoonStudioPage from "@/components/templates/moon-studio-page";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...createMetadata({
    title: "NOVA STUDIO — Building Lasting Digital Connections",
    description: "NOVA STUDIO is a creative agency specializing in building, launching, and revitalizing brand identities with impactful branding solutions.",
    alternates: { canonical: "/moon" },
  }),
};

export default function MoonPage() {
  return <MoonStudioPage />;
}
