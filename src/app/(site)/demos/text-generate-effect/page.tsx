import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { TextGenerateEffectDemo } from "@/components/text-generate-effect";

export const metadata: Metadata = createMetadata({
  title: "Text generate effect demo",
  description: "Staggered word/character/line text reveal with blur and upward motion.",
});

export default function TextGenerateEffectDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <TextGenerateEffectDemo />
    </main>
  );
}
