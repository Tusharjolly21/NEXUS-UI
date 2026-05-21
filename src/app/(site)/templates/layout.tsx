import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { templates } from "@/lib/catalog/templates";

export const metadata: Metadata = createMetadata({
  title: "Templates",
  description:
    "Full-page Next.js templates built for production SaaS. Animated landing pages, pricing flows, and dashboards you can copy and ship.",
  alternates: { canonical: "/templates" },
});

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Next.js Templates — Nexus UI",
    description:
      "Full-page Next.js templates for production SaaS. Animated landing pages, pricing flows, and dashboards.",
    url: `${siteConfig.url}/templates`,
    numberOfItems: templates.length,
    itemListElement: templates.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      item: `${siteConfig.url}/templates/${t.slug}`,
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
