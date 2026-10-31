import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { ImageTrailDemo } from "@/components/image-trail";

export const metadata: Metadata = createMetadata({
  title: "Image Trail demo",
  description: "Cursor image trail cycling through images with fade and blur transitions. Optional magnetic pull effect draws trailing images toward the pointer.",
  alternates: { canonical: "/components/image-trail" },
});

export default function ImageTrailDemoPage() {
  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-gradient-to-b from-background via-muted/15 to-background">
      <h1 className="sr-only">Image Trail</h1>
      <ImageTrailDemo />
    </div>
  );
}
