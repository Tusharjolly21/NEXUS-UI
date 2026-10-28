import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getLibraryComponent,
  libraryComponents,
} from "@/lib/catalog/library-components";
import { createMetadata, siteConfig } from "@/lib/seo";
import Link from "next/link";
import { sessionCanAccessComponent } from "@/lib/component-access";
import { LivePreviewStage } from "@/components/library/live-preview-stage";

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

  // The full-screen preview carries none of the on-page protections, so it is for people who
  // can use the component: free components for everyone, Pro components with Pro.
  if (!(await sessionCanAccessComponent(item.slug, item.premium))) {
    return (
      <main className="dark grid min-h-dvh place-items-center bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 text-zinc-100">
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Full-screen preview is for Pro</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-400">
            {item.name} is a Pro component. You can still try it on its page. Pro opens it full screen, with the code
            and the install command.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-semibold text-zinc-900"
            >
              See Pro plans
            </Link>
            <Link
              href={`/components/${item.slug}`}
              className="inline-flex h-11 items-center rounded-full px-6 text-sm font-medium text-zinc-200 ring-1 ring-white/20"
            >
              Back to {item.name}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ?v=<n> opens one variant of a page that has several; anything else shows the main preview
  const index = /^\d{1,2}$/.test(v ?? "") ? Number(v) : -1;
  const Preview = item.previewSections?.[index]?.Preview ?? item.Preview;

  return (
    <div className="dark min-h-dvh bg-gradient-to-b from-zinc-900 to-zinc-950">
      <h1 className="sr-only">{item.name} — live preview</h1>
      <LivePreviewStage>
        <Preview compact={false} />
      </LivePreviewStage>
    </div>
  );
}
