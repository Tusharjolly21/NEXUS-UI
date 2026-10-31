import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { GlowingEffectCardsDemo } from "@/components/glowing-effect-cards";

export const metadata: Metadata = createMetadata({
  title: "Glowing effect cards demo",
  description: "Cursor-reactive glowing border cards arranged in a responsive 2-1-2 bento grid. WebGL-powered gradient border follows the pointer position in real time.",
  alternates: { canonical: "/components/glowing-effect-cards" },
});

export default function GlowingEffectCardsDemoPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Glowing Effect Cards</h1>
      <GlowingEffectCardsDemo />
    </div>
  );
}
