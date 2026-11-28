import type { Metadata } from "next";
import { ComponentDetailContent, componentDetailMetadata } from "@/components/library/component-detail-page";
import { libraryComponents } from "@/lib/catalog/library-components";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return libraryComponents.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return componentDetailMetadata((await params).slug);
}

export default async function ComponentDetailPage({ params }: Props) {
  return <ComponentDetailContent slug={(await params).slug} signedOut={false} />;
}
