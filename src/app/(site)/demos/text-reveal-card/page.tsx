import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { TextRevealCardDemo } from "@/components/text-reveal-card";

export const metadata: Metadata = createMetadata({
  title: "Text reveal card demo",
  description: "Premium mousemove-driven reveal card with hidden bottom content and spotlight masking. Smooth reveal transitions built with Framer Motion for React.",
  alternates: { canonical: "/components/text-reveal-card" },
});

export default function TextRevealCardDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Text Reveal Card</h1>
      <TextRevealCardDemo />
    </main>
  );
}
