import type { Metadata } from "next";
import { CursorTextRevealDemo } from "@/components/cursor-text-reveal";

export const metadata: Metadata = {
  title: "Cursor Text Reveal Demo",
  description: "Interactive cursor-following text reveal examples for Nexus UI.",
  alternates: { canonical: "/demos/cursor-text-reveal" },
};

export default function CursorTextRevealDemoPage() {
  return <CursorTextRevealDemo />;
}
