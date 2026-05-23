import type { Metadata } from "next";
import { StatefulButtonDemo } from "@/components/stateful-button";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Stateful button demo",
  description: "Animated button with idle, loading, success, and error states with async-safe transitions. Drop-in replacement for standard submit buttons in React.",
  alternates: { canonical: "/demos/stateful-button" },
});

export default function StatefulButtonDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Stateful Button</h1>
      <StatefulButtonDemo />
    </main>
  );
}
