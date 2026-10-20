import type { Metadata } from "next";
import { BackgroundBoxesDemo } from "@/components/background-boxes";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Background boxes demo",
  description: "Interactive full-width box grid background with hover highlight and glow ripple effects. Cursor-tracking ambient lighting for React hero sections.",
  alternates: { canonical: "/components/background-boxes" },
});

export default function BackgroundBoxesDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Background Boxes</h1>
      <BackgroundBoxesDemo />
    </main>
  );
}
