import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { TerminalDemo } from "@/components/terminal";

export const metadata: Metadata = createMetadata({
  title: "Terminal demo",
  description: "Premium interactive terminal animation with typing sequences, blinking cursor, command chaining, and optional synthesised mechanical key sounds.",
  alternates: { canonical: "/components/terminal" },
});

export default function TerminalDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Terminal</h1>
      <TerminalDemo />
    </main>
  );
}

