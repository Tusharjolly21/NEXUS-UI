import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { FullPreviewShell } from "@/components/templates/full-preview-shell";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return createMetadata({
    title: `${t.title} — Preview`,
    description: `Interactive preview of ${t.title} on ${siteConfig.name}.`,
    robots: { index: false, follow: false },
  });
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  return <FullPreviewShell tmpl={tmpl} />;
}
