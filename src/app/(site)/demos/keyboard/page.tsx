import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { KeyboardDemo } from "@/components/keyboard";

export const metadata: Metadata = createMetadata({
  title: "Mac Keyboard",
  description:
    "Interactive Mac-style keyboard with synthesised mechanical sounds, Framer Motion key-press animations, and physical keyboard input sync.",
  alternates: { canonical: "/components/mac-keyboard" },
});

export default function KeyboardDemoPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Mac Keyboard</h1>
      <KeyboardDemo />
    </div>
  );
}
