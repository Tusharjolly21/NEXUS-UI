import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { CursorTextRevealDemo } from "@/components/cursor-text-reveal";

export const metadata: Metadata = createMetadata({
  title: "Cursor Text Reveal Demo",
  description: "Interactive cursor-following text reveal for React. A mask effect that exposes hidden content as the user moves their pointer across the text.",
  alternates: { canonical: "/components/cursor-text-reveal" },
});

export default function CursorTextRevealDemoPage() {
  return (
    <main className="min-h-[calc(100dvh-4rem)]">
      <h1 className="sr-only">Cursor Text Reveal</h1>
      <CursorTextRevealDemo />
    </main>
  );
}
