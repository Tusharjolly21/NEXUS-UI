import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { RainbowWord } from "@/components/site";
import { CHECKED_ON, GUIDE, alternatives, getAlternative } from "@/lib/alternatives";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { allGalleryItems } from "@/lib/catalog/gallery-items";
import { getPricing } from "@/lib/region";
import { createMetadata, siteConfig } from "@/lib/seo";

export const dynamicParams = false;

/**
 * Shown live on every comparison page, so someone weighing libraries can try ours before reading on.
 * The ones Google already sends the most people to (Search Console, Nov 2026); none of the heavy "For fun" set.
 */
const SHOWCASE = ["dynamic-island", "chat-messages", "animated-countdown", "emoji-reactions", "dot-sphere"];

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) return {};
  return createMetadata({
    title: { absolute: `${alt.name} Alternative (2026): Animated React Components` },
    description: `Looking for a ${alt.name} alternative${alt.alsoSpelled ? ` (${alt.alsoSpelled})` : ""}? Try Nexus UI's animated React components live, then compare install, what is free and the price.`,
    alternates: { canonical: `/alternatives/${alt.slug}` },
  });
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) notFound();

  const pricing = await getPricing();
  const { components, freeComponents, proComponents, templates, freeTemplates, blocks } = CATALOG_COUNTS;
  const nexus = {
    summary: "A library of animated React components, blocks and Next.js templates.",
    stack: "React, TypeScript, Tailwind CSS and Framer Motion.",
    install: "Copy from each component page, or install with the shadcn CLI through the @nexus-labs registry.",
    free: `${freeComponents} of ${components} components, ${freeTemplates} of ${templates} templates and the free blocks.`,
    paid: `Pro is ${pricing.pro} a year, or All-Access is ${pricing.allAccess} once. Either unlocks the ${proComponents} Pro components, all ${templates} templates and the premium blocks (${blocks} block groups in total), plus Pro build prompts.`,
  };

  const showcase = allGalleryItems()
    .filter((g) => SHOWCASE.includes(g.slug))
    .sort((a, b) => SHOWCASE.indexOf(a.slug) - SHOWCASE.indexOf(b.slug));

  // Every answer here is a fact from this page or the site, nothing about the other library beyond its own homepage.
  const faq: { q: string; a: string }[] = [
    {
      q: `Is Nexus UI free like ${alt.name}?`,
      a: `Partly. ${nexus.free} are free, with full source. ${nexus.paid}`,
    },
    {
      q: "Does Nexus UI work with shadcn/ui?",
      a: "Yes. Every component installs with the shadcn CLI through the @nexus-labs registry, or you can copy it from its page. It is React, TypeScript, Tailwind CSS and Framer Motion, so it sits next to your shadcn/ui components.",
    },
    {
      q: `Can I use Nexus UI and ${alt.name} in the same project?`,
      a: "Yes. A Nexus UI component is source code that lives in your own project, not a package you are locked into, so you can mix it with components from any other library.",
    },
    {
      q: "Can my AI coding agent add Nexus UI components?",
      a: "Yes. Nexus UI has an MCP server, so Claude Code, Cursor, VS Code and Codex can search the library and add a component by name. Free components need no key; Pro members add their API key to get the rest.",
    },
  ];

  const pageUrl = `${siteConfig.url}/alternatives/${alt.slug}`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Compare libraries", item: `${siteConfig.url}/alternatives` },
      { "@type": "ListItem", position: 3, name: `${alt.name} alternative`, item: pageUrl },
    ],
  };

  const rows: { label: string; them: string; us: string }[] = [
    { label: "What it is", them: alt.summary, us: nexus.summary },
    { label: "Stack", them: alt.stack, us: nexus.stack },
    { label: "Install", them: alt.install, us: nexus.install },
    { label: "Free", them: alt.free, us: nexus.free },
    { label: "Paid", them: alt.paid, us: nexus.paid },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[920px] text-[clamp(40px,6.4vw,72px)] leading-[1.05] text-foreground">
            A {alt.name} alternative for <RainbowWord>animated</RainbowWord> React components
          </h1>
          <p className="mt-5 max-w-[660px] text-[19px] leading-[1.55] text-muted-foreground">
            {alt.name}
            {alt.alsoSpelled ? ` (also written ${alt.alsoSpelled})` : ""} and Nexus UI both give you animated React
            components you add to your own project. Here is how they differ, and when {alt.name} is the better fit.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link
              href="#try-nexus-ui"
              className="inline-flex rounded-full bg-foreground px-5 py-2.5 text-[15px] font-semibold text-background hover:opacity-90"
            >
              Try the components
            </Link>
            <Link
              href="/components"
              className="pg-glass inline-flex rounded-full bg-card px-5 py-2.5 text-[15px] font-semibold text-foreground hover:bg-muted"
            >
              Browse all components
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 pb-8">
        <div className="mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-card pg-float">
          <table className="w-full border-collapse text-left text-[15px] leading-relaxed">
            <caption className="sr-only">
              {alt.name} compared with Nexus UI
            </caption>
            <thead>
              <tr className="text-[13.5px] text-muted-foreground">
                <th scope="col" className="w-[14%] px-5 py-4 font-medium" />
                <th scope="col" className="px-5 py-4 font-medium">
                  {alt.name}
                </th>
                <th scope="col" className="px-5 py-4 font-medium">
                  Nexus UI
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-foreground/[0.06] align-top">
                  <th scope="row" className="px-5 py-4 text-[14px] font-semibold text-foreground">
                    {r.label}
                  </th>
                  <td className="px-5 py-4 text-body">{r.them}</td>
                  <td className="px-5 py-4 text-body">{r.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="try-nexus-ui" aria-labelledby="try-heading" className="scroll-mt-24 px-4 pb-12 pt-4">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="try-heading" className="pg-display text-[clamp(30px,4.2vw,44px)] leading-[1.05] text-foreground">
            Try them before you choose
          </h2>
          <p className="mt-3 max-w-[620px] text-[17px] leading-relaxed text-muted-foreground">
            These run live. Hover, drag or click any of them, then open one to copy it or install it with the shadcn CLI.
          </p>
          <div className="mt-8">
            <ComponentGallery items={showcase} pricing={pricing} limit={SHOWCASE.length} mobileLimit={3} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-2">
          <div className="rounded-tile bg-tint-sky p-7">
            <h2 className="text-[19px] font-semibold text-foreground">Choose {alt.name} if</h2>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-body">
              {alt.chooseThem.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-foreground/50" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-tile bg-tint-violet p-7">
            <h2 className="text-[19px] font-semibold text-foreground">Choose Nexus UI if</h2>
            <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-body">
              {[
                "You want one plan that unlocks every Pro component, block and template, with the choice of a yearly or a one-time payment.",
                "You want springs and physics-driven components, and full-page Next.js templates, in the same library.",
                "You install with the shadcn CLI and want Pro build prompts an AI coding agent can work from.",
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-foreground/50" />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { href: "/components", label: "Browse components" },
                { href: "/docs/cli", label: "Install with shadcn" },
                { href: "/pricing", label: "Pricing" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="pg-glass inline-flex rounded-full bg-card px-3.5 py-1.5 text-[13.5px] font-medium text-foreground hover:bg-muted"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-14 max-w-[1152px]">
          <h2 className="text-[24px] font-semibold tracking-[-0.4px] text-foreground">Questions people ask</h2>
          <dl className="mt-5 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {faq.map((f) => (
              <div key={f.q}>
                <dt className="text-[16.5px] font-semibold text-foreground">{f.q}</dt>
                <dd className="mt-1.5 text-[15px] leading-relaxed text-body">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mx-auto mt-12 max-w-[1152px] text-[13px] leading-relaxed text-muted-foreground">
          <p>
            What we say about {alt.name} comes from{" "}
            <a href={alt.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {alt.host}
            </a>{" "}
            as we read it in {CHECKED_ON}, and it may have changed since. Anything its homepage did not state is left
            out. Nexus UI is independent and not affiliated with {alt.name}.
          </p>
          <p className="mt-2">
            For a longer read that covers more libraries, see{" "}
            <Link href={GUIDE.href} className="underline underline-offset-4">
              {GUIDE.label}
            </Link>
            .
          </p>
          <p className="mt-2">
            Also compared:{" "}
            {alternatives
              .filter((a) => a.slug !== alt.slug)
              .map((a, i) => (
                <span key={a.slug}>
                  {i > 0 ? ", " : ""}
                  <Link href={`/alternatives/${a.slug}`} className="underline underline-offset-4">
                    {a.name}
                  </Link>
                </span>
              ))}
            .
          </p>
        </div>
      </section>
    </>
  );
}
