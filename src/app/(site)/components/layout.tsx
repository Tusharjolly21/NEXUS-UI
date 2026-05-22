import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { libraryComponents } from "@/lib/catalog/library-components";

export const metadata: Metadata = createMetadata({
  title: "Free React UI Components",
  description:
    "Free animated React components for Next.js — text effects, backgrounds, sidebars, inputs, and more. Copy-paste TypeScript, free and premium.",
  alternates: { canonical: "/components" },
});

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "React UI Components — Nexus UI",
    description:
      "Animated, copy-paste React components for Next.js. Motion effects, forms, backgrounds, 3D, and more.",
    url: `${siteConfig.url}/components`,
    numberOfItems: libraryComponents.length,
    itemListElement: libraryComponents.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteConfig.url}/components/${c.slug}`,
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
