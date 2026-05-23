import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { TextGenerateEffectDemo } from "@/components/text-generate-effect";

export const metadata: Metadata = createMetadata({
  title: "Text generate effect demo",
  description: "Staggered word, character, and line text reveal with blur and upward motion. Smooth entrance effect for headings and body copy in React and Next.js.",
  alternates: { canonical: "/demos/text-generate-effect" },
});

export default function TextGenerateEffectDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Text Generate Effect</h1>
      <TextGenerateEffectDemo />
    </main>
  );
}
