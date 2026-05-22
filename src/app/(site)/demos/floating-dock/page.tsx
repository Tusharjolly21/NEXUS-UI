import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { FloatingDockDemo } from "@/components/floating-dock";

export const metadata: Metadata = createMetadata({
  title: "Floating dock demo",
  description: "macOS-style floating navigation dock with magnification, tooltips, and mobile sheet menu.",
  alternates: { canonical: "/demos/floating-dock" },
});

export default function FloatingDockDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <FloatingDockDemo />
    </main>
  );
}
