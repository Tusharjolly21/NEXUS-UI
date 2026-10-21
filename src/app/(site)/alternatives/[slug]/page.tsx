import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RainbowWord } from "@/components/site";
import { CHECKED_ON, alternatives, getAlternative } from "@/lib/alternatives";
import { CATALOG_COUNTS } from "@/lib/catalog/counts";
import { PRICES, formatPrice } from "@/lib/pricing";
import { createMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) return {};
  return createMetadata({
    title: `${alt.name} alternative for animated React components`,
    description: `Nexus UI next to ${alt.name}${alt.alsoSpelled ? ` (${alt.alsoSpelled})` : ""}: what each is, how they install, what is free and what costs money, and when ${alt.name} is the better pick.`,
    alternates: { canonical: `/alternatives/${alt.slug}` },
  });
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const alt = getAlternative(slug);
  if (!alt) notFound();

  const { components, freeComponents, proComponents, templates, freeTemplates, blocks } = CATALOG_COUNTS;
  const nexus = {
    summary: "A library of animated React components, blocks and Next.js templates.",
    stack: "React, TypeScript, Tailwind CSS and Framer Motion.",
    install: "Copy from each component page, or install with the shadcn CLI through the @nexus-labs registry.",
    free: `${freeComponents} of ${components} components, ${freeTemplates} of ${templates} templates and the free blocks.`,
    paid: `Pro is ${formatPrice(PRICES.pro)} a year, or All-Access is ${formatPrice(PRICES.allAccess)} once. Either unlocks the ${proComponents} Pro components, all ${templates} templates and the premium blocks (${blocks} block groups in total), plus Pro build prompts.`,
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

        <div className="mx-auto mt-8 max-w-[1152px] text-[13px] leading-relaxed text-muted-foreground">
          <p>
            What we say about {alt.name} comes from{" "}
            <a href={alt.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
              {alt.host}
            </a>{" "}
            as we read it in {CHECKED_ON}, and it may have changed since. Anything its homepage did not state is left
            out. Nexus UI is independent and not affiliated with {alt.name}.
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
