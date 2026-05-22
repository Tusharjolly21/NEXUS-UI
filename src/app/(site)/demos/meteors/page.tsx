import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { MeteorsDemo } from "@/components/meteors";

export const metadata: Metadata = createMetadata({
  title: "Meteor effect demo",
  description: "Animated diagonal meteor beams with glow trails for hero sections and cards.",
  alternates: { canonical: "/demos/meteors" },
});

export default function MeteorsDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <MeteorsDemo />
    </main>
  );
}
