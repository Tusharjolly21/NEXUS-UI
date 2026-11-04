import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { TemplateDetailContent } from "@/components/templates/template-detail-content";
import { createMetadata, shortDescription, siteConfig } from "@/lib/seo";
import { sessionCanAccessTemplate } from "@/lib/template-access";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ checkout?: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};

  if (slug === "macbook-pro-showcase") {
    return createMetadata({
      title: "Halcyon — Cinematic Product Launch",
      description:
        "An immersive laptop launch template with GSAP scroll choreography, interactive 3D configuration, performance animations, and cinematic media.",
      openGraph: {
        title: "Halcyon — Cinematic Product Launch",
        description:
          "A cinematic Next.js product template with GSAP scroll animation and interactive 3D laptop sections.",
      },
      alternates: { canonical: "/templates/macbook-pro-showcase" },
    });
  }

  return createMetadata(
    {
      title: `${t.title} — Next.js Landing Page Template`,
      description: shortDescription(t.description),
      openGraph: { title: `${t.title} · ${siteConfig.siteName}` },
      alternates: { canonical: `/templates/${slug}` },
    },
    { title: t.title, pro: !!t.premium },
  );
}

export default async function TemplateDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { checkout } = await searchParams;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  // Fails closed: an auth or database outage renders the page as locked instead of erroring.
  const hasAccess = await sessionCanAccessTemplate(slug);
  const checkoutPending = checkout === "success" && !hasAccess;
  const others = templates.filter((t) => t.slug !== slug).sort((a, b) => b.trendingScore - a.trendingScore);
  const related = [...others.filter((t) => t.category === tmpl.category), ...others.filter((t) => t.category !== tmpl.category)].slice(0, 2);

  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tmpl.title,
    description: tmpl.description,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    url: `${siteConfig.url}/templates/${slug}`,
    offers: {
      "@type": "Offer",
      price: tmpl.premium ? "49" : "0",
      priceCurrency: "USD",
    },
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <TemplateDetailContent tmpl={tmpl} related={related} isPremium={hasAccess} checkoutPending={checkoutPending} />
    </>
  );
}
