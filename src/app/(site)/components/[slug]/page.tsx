import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ComponentDetailView } from "@/components/library/component-detail-view";
import {
  getLibraryComponent,
  libraryComponents,
} from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";

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
  });
}

export default async function ComponentDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = getLibraryComponent(slug);
  if (!item) notFound();
  return <ComponentDetailView item={item} />;
}
