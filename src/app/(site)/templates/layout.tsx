import { siteConfig } from "@/lib/seo";
import { templates } from "@/lib/catalog/templates";

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Next.js Templates — Nexus UI",
    description:
      "Animated Next.js landing page templates for SaaS, AI startups, agencies, portfolios and stores.",
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
