import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { blocks } from "@/lib/catalog/blocks";
import { BlocksCatalog } from "./_catalog";

export const metadata: Metadata = createMetadata({
  title: "UI Blocks for Next.js — Tailwind CSS & Framer Motion",
  description:
    "Production-ready UI blocks for Next.js — hero sections, pricing, testimonials, feature grids, and more. Built with Tailwind CSS and Framer Motion. Free and premium.",
  alternates: { canonical: "/blocks" },
});

export default function BlocksPage() {
  return (
    <>
      <ul aria-hidden className="sr-only">
        {blocks.map((b) => (
          <li key={b.slug}>
            <Link href={`/blocks/${b.slug}`}>{b.name}</Link>
          </li>
        ))}
      </ul>
      <BlocksCatalog />
    </>
  );
}
