import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { GlowingEffectCardsDemo } from "@/components/glowing-effect-cards";

export const metadata: Metadata = createMetadata({
  title: "Glowing effect cards demo",
  description: "Cursor-reactive glowing border cards in a responsive 2-1-2 layout.",
});

export default function GlowingEffectCardsDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <GlowingEffectCardsDemo />
    </main>
  );
}
