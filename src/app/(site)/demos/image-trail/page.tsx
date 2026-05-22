import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { ImageTrailDemo } from "@/components/image-trail";

export const metadata: Metadata = createMetadata({
  title: "Image Trail demo",
  description: "Cursor trail that cycles through images with fade, blur, and optional magnetic pull.",
  alternates: { canonical: "/demos/image-trail" },
});

export default function ImageTrailDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <ImageTrailDemo />
    </main>
  );
}
