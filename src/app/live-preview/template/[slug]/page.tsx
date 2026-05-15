import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTemplate, templates } from "@/lib/catalog/templates";
import { createMetadata, siteConfig } from "@/lib/seo";
import { SimplisticSaaSPage } from "@/components/templates/simplistic-saas-page";
import { LandingPage } from "@/components/marketing/landing-page";
import { TemplateSceneLoader } from "@/components/templates/template-scene-loader";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return templates.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = getTemplate(slug);
  if (!t) return {};
  return createMetadata({
    title: `${t.title} — Live preview`,
    description: `Isolated preview of ${t.title} on ${siteConfig.name}.`,
    robots: { index: false, follow: false },
  });
}

export default async function TemplateLivePreviewPage({ params }: Props) {
  const { slug } = await params;
  const tmpl = getTemplate(slug);
  if (!tmpl) notFound();

  if (tmpl.slug === "simplistic-saas-template") {
    return <SimplisticSaaSPage />;
  } else if (tmpl.slug === "saas-launch-aurora") {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <TemplateSceneLoader slug={tmpl.slug} />
    </div>
  );
}
