import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { SparklesPreview } from "@/components/sparkles";

export const metadata: Metadata = createMetadata({
  title: "Sparkles demo",
  description: "Configurable animated sparkle particles for hero backgrounds, cards, and decorative UI layers. Adjust density, size, color, and speed to fit your brand.",
  alternates: { canonical: "/components/sparkles" },
});

export default function SparklesDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Sparkles</h1>
      <SparklesPreview />
    </main>
  );
}
