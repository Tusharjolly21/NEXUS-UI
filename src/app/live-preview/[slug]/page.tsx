import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLibraryComponent,
  libraryComponents,
} from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";
import { sessionCanAccessComponent } from "@/lib/component-access";
import { LivePreviewStage } from "@/components/library/live-preview-stage";
import { PreviewShield } from "@/components/pro/preview-shield";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ v?: string }> };

export function generateStaticParams() {
  return libraryComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) return {};
  return createMetadata({
    title: `${item.name} — Live preview`,
    description: `Isolated preview of ${item.name} on ${siteConfig.name}.`,
    robots: { index: false, follow: false },
  });
}

/** Full-window catalog preview. No site chrome; the stage scales the component to fill the screen without leaving it. */
export default async function LivePreviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { v } = await searchParams;
  const item = getLibraryComponent(slug);
  if (!item) notFound();

  // Open to everyone, Pro components included. Visitors without Pro get the same Pro-preview shield as
  // on the component page: it stays fully interactive, but right-click, copying and dragging the design
  // out are switched off. The code, usage, install and build prompt stay behind the server's Pro check.
  const canAccess = await sessionCanAccessComponent(item.slug, item.premium);

  // ?v=<n> opens one variant of a page that has several; anything else shows the main preview
  const index = /^\d{1,2}$/.test(v ?? "") ? Number(v) : -1;
  const Preview = item.previewSections?.[index]?.Preview ?? item.Preview;

  return (
    <div className="dark min-h-dvh bg-gradient-to-b from-zinc-900 to-zinc-950">
      <h1 className="sr-only">{item.name} — live preview</h1>
      <PreviewShield active={!canAccess} className="min-h-dvh">
        <LivePreviewStage>
          <Preview compact={false} />
        </LivePreviewStage>
      </PreviewShield>
    </div>
  );
}
