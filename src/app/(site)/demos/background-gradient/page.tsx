import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { BackgroundGradientDemo } from "@/components/background-gradient";

export const metadata: Metadata = createMetadata({
  title: "Background gradient demo",
  description: "Animated gradient border wrapper with pointer-reactive glow and smooth color transitions. Works on cards, buttons, and hero sections in any React app.",
  alternates: { canonical: "/components/background-gradient" },
});

export default function BackgroundGradientDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Background Gradient</h1>
      <BackgroundGradientDemo />
    </main>
  );
}
