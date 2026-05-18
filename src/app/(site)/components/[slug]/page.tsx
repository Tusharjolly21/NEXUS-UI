import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLibraryComponent, libraryComponents } from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";
import { ComponentDetailPageClient } from "@/components/library/component-detail-page-client";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return libraryComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) return {};
  return createMetadata({
    title: item.name,
    description: item.description,
    openGraph: { title: `${item.name} · ${siteConfig.name}` },
    alternates: { canonical: `/components/${slug}` },
  });
}

export default async function ComponentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) notFound();

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: item.name,
    description: item.description,
    programmingLanguage: "TypeScript",
    runtimePlatform: "Next.js",
    url: `${siteConfig.url}/components/${slug}`,
    isAccessibleForFree: !item.premium,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Components", item: `${siteConfig.url}/components` },
      { "@type": "ListItem", position: 3, name: item.name, item: `${siteConfig.url}/components/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <ComponentDetailPageClient slug={slug} />
    </>
  );
}
