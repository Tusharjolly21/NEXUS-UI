import type { Metadata } from "next";
import { TypewriterEffectDemo } from "@/components/typewriter-effect";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Typewriter effect demo",
  description: "Premium typewriter text animation with cursor blink, loop, delete, and multi-string cycling. Works with any semantic heading or paragraph element in React.",
  alternates: { canonical: "/demos/typewriter-effect" },
});

export default function TypewriterEffectDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Typewriter Effect</h1>
      <TypewriterEffectDemo />
    </main>
  );
}
