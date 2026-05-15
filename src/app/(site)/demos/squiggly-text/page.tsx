import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { SquigglyTextDemo } from "@/components/squiggly-text";

export const metadata: Metadata = createMetadata({
  title: "RippleLine squiggly text",
  description: "Premium SVG wave underline with turbulence, blur, displacement, and Framer Motion.",
});

export default function SquigglyTextDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <SquigglyTextDemo />
    </main>
  );
}
