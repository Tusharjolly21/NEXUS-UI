import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Components",
  description:
    "Browse animated React components for Next.js — heroes, inputs, carousels, text effects, and more. Copy-paste TypeScript, free and premium.",
  alternates: { canonical: "/components" },
});

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
