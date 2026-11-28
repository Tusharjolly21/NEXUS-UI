import type { Metadata } from "next";
import { ComponentDetailContent, componentDetailMetadata, popularComponentSlugs } from "@/components/library/component-detail-page";

/**
 * A component's page as a signed-out visitor sees it (visitors in India (rupee prices in the upgrade dialog)), built once and cached for an hour. Visitors never
 * type this URL: next.config.mjs rewrites "/components/:slug" here under the same conditions as the homepage. The address bar
 * keeps "/components/:slug" and the canonical stays there. The most-viewed components are built ahead of time; the rest are
 * built on their first visit and then cached. It must read nothing from the request.
 */
type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return popularComponentSlugs(40).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return componentDetailMetadata((await params).slug);
}

export default async function ComponentDetailStaticIn({ params }: Props) {
  return <ComponentDetailContent slug={(await params).slug} signedOut />;
}
