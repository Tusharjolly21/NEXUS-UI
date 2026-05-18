import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Blocks",
  description:
    "Production-ready UI blocks for Next.js landing pages — hero sections, pricing grids, testimonials, CTAs, and more. shadcn/ui compatible.",
  alternates: { canonical: "/blocks" },
});

export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
