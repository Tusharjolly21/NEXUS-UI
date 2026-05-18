import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { TemplateDetailContent } from "@/components/templates/template-detail-content";
import { createMetadata, siteConfig } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return createMetadata({
    title: t.title,
    description: t.description,
    openGraph: { title: `${t.title} · ${siteConfig.name}` },
    alternates: { canonical: `/templates/${slug}` },
  });
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Templates", item: `${siteConfig.url}/templates` },
      { "@type": "ListItem", position: 3, name: tmpl.title, item: `${siteConfig.url}/templates/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <TemplateDetailContent tmpl={tmpl} />
    </>
  );
}
