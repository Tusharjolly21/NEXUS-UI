import type { Metadata } from "next";
import { StatefulButtonDemo } from "@/components/stateful-button";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Stateful button demo",
  description: "Animated idle/loading/success/error button with async-safe state handling.",
});

export default function StatefulButtonDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <StatefulButtonDemo />
    </main>
  );
}
