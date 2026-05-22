import type { Metadata } from "next";
import { createMetadata, siteConfig } from "@/lib/seo";
import { templates } from "@/lib/catalog/templates";

export const metadata: Metadata = createMetadata({
  title: "Free Next.js Landing Page Templates — SaaS & Marketing",
  description:
    "Free Next.js landing page templates for SaaS and marketing. Animated, production-ready, built with Tailwind CSS and Framer Motion. Copy and ship.",
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
