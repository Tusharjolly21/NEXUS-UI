import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { GooeyInputDemo } from "@/components/gooey-input";

export const metadata: Metadata = createMetadata({
  title: "Gooey input demo",
  description: "Expandable search pill with SVG gooey filter and detached icon bubble.",
});

export default function GooeyInputDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <GooeyInputDemo />
    </main>
  );
}
