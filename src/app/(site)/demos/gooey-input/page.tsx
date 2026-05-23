import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { GooeyInputDemo } from "@/components/gooey-input";

export const metadata: Metadata = createMetadata({
  title: "Gooey input demo",
  description: "Expandable search input pill with an SVG gooey filter effect and a detached floating icon bubble. Smooth open and close animations with Framer Motion.",
  alternates: { canonical: "/demos/gooey-input" },
});

export default function GooeyInputDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Gooey Input</h1>
      <GooeyInputDemo />
    </main>
  );
}
