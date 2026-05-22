import type { Metadata } from "next";
import { TypewriterEffectDemo } from "@/components/typewriter-effect";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Typewriter effect demo",
  description: "Premium typewriter text animation with cursor, loop, deleting, and semantic heading support.",
  alternates: { canonical: "/demos/typewriter-effect" },
});

export default function TypewriterEffectDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <TypewriterEffectDemo />
    </main>
  );
}
