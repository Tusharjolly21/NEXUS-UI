import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { BackgroundGradientDemo } from "@/components/background-gradient";

export const metadata: Metadata = createMetadata({
  title: "Background gradient demo",
  description: "Animated gradient wrapper with glow and interaction for cards, buttons, and sections.",
});

export default function BackgroundGradientDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <BackgroundGradientDemo />
    </main>
  );
}
