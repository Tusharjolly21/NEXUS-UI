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
  });
}

export default async function TemplateDetailPage({ params }: Props) {
  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  return <TemplateDetailContent tmpl={tmpl} />;
}
