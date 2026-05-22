import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { blocks } from "@/lib/catalog/blocks";

export const metadata: Metadata = createMetadata({
  title: "Free Next.js UI Blocks — Hero, Pricing, Text Animations & More",
  description:
    "Free Next.js UI blocks — hero sections, pricing, testimonials, text animations, and background animations. Built with Tailwind CSS and Framer Motion.",
  alternates: { canonical: "/blocks" },
});

export default function BlocksLayout({ children }: { children: React.ReactNode }) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "UI Blocks — Nexus UI",
    description:
      "Production-ready UI blocks for Next.js landing pages. Hero sections, pricing, testimonials, CTAs, and more.",
    url: `${siteConfig.url}/blocks`,
    numberOfItems: blocks.length,
    itemListElement: blocks.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: `${siteConfig.url}/blocks/${b.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      {children}
    </>
  );
}
