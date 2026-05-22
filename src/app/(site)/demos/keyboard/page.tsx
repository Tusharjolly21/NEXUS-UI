import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { KeyboardDemo } from "@/components/keyboard";

export const metadata: Metadata = createMetadata({
  title: "Mac Keyboard",
  description:
    "Interactive Mac-style keyboard with synthesised mechanical sounds, Framer Motion key-press animations, and physical keyboard input sync.",
  alternates: { canonical: "/demos/keyboard" },
});

export default function KeyboardDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <KeyboardDemo />
    </main>
  );
}
