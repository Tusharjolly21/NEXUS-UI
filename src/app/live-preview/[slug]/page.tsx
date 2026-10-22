import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLibraryComponent,
  libraryComponents,
} from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";

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

/** Full-window catalog preview — no site chrome, component fills the viewport. */
export default async function LivePreviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { v } = await searchParams;
  const item = getLibraryComponent(slug);
  if (!item) notFound();

  // ?v=<n> opens one variant of a page that has several; anything else shows the main preview
  const index = /^\d{1,2}$/.test(v ?? "") ? Number(v) : -1;
  const Preview = item.previewSections?.[index]?.Preview ?? item.Preview;

  return (
    <div className="dark min-h-dvh bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 md:p-10">
      <h1 className="sr-only">{item.name} — live preview</h1>
      <div className="mx-auto flex w-full max-w-6xl justify-center py-8 md:py-12">
        <Preview compact={false} />
      </div>
    </div>
  );
}
