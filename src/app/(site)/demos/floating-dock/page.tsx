import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { FloatingDockDemo } from "@/components/floating-dock";

export const metadata: Metadata = createMetadata({
  title: "Floating dock demo",
  description: "macOS-style floating navigation dock with spring magnification on hover, tooltip labels, and an adaptive bottom-sheet fallback for mobile viewports.",
  alternates: { canonical: "/components/floating-dock" },
});

export default function FloatingDockDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <h1 className="sr-only">Floating Dock</h1>
      <FloatingDockDemo />
    </main>
  );
}
