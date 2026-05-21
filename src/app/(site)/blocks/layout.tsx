import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { blocks } from "@/lib/catalog/blocks";

export const metadata: Metadata = createMetadata({
  title: "Blocks",
  description:
    "Production-ready UI blocks for Next.js landing pages — hero sections, pricing grids, testimonials, CTAs, and more. shadcn/ui compatible.",
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
      url: `${siteConfig.url}/blocks/${b.slug}`,
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
