import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { InfiniteMovingCardsDemo } from "@/components/infinite-moving-cards";

export const metadata: Metadata = createMetadata({
  title: "Infinite moving cards demo",
  description: "Seamless infinite card marquee with direction, speed, and hover pause controls.",
  alternates: { canonical: "/demos/infinite-moving-cards" },
});

export default function InfiniteMovingCardsDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <InfiniteMovingCardsDemo />
    </main>
  );
}
