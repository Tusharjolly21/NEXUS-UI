import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { MeteorsDemo } from "@/components/meteors";

export const metadata: Metadata = createMetadata({
  title: "Meteor effect demo",
  description: "Animated diagonal meteor shower with glowing streak trails for hero sections, cards, and feature banners. Configurable density, speed, and angle in React.",
  alternates: { canonical: "/components/meteors" },
});

export default function MeteorsDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Meteors</h1>
      <MeteorsDemo />
    </main>
  );
}
