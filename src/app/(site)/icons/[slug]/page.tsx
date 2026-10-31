import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CodeBlock } from "@/components/code-block";
import { DEFAULT_HEADER } from "@/components/code-block/code-block";
import { IconTile } from "@/components/nx-icons/icon-grid";
import { IconPlayground } from "@/components/nx-icons/icon-playground";
import { RainbowWord } from "@/components/site";
import { ICONS, getCategory, getIcon } from "@/lib/icons/catalog";
import { createMetadata, siteConfig } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return ICONS.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) return {};
  return createMetadata({
    title: `Animated ${icon.title} Icon for React`,
    description: `${icon.description} A free animated ${icon.title.toLowerCase()} icon for React, built with Framer Motion. Copy the code.`,
    alternates: { canonical: `/icons/${icon.slug}` },
  });
}

const PROPS: [name: string, type: string, def: string, note: string][] = [
  ["size", "number", "24", "Width and height in pixels."],
  ["strokeWidth", "number", "2", "Line thickness, in a drawing that is 24 units wide."],
  ["className", "string", "", "Set a text colour here: the icon draws in currentColor."],
  ["play", "boolean", "", "true plays, false rests. Left out, it follows the pointer (or loops, for loaders)."],
];

export default async function IconPage({ params }: Props) {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) notFound();
  const category = getCategory(icon.category);
  const source = await readFile(path.join(process.cwd(), "src/components/nx-icons/icons", `${icon.slug}.tsx`), "utf8");
  const related = ICONS.filter((i) => i.category === icon.category && i.slug !== icon.slug).slice(0, 6);
  const name = icon.title.toLowerCase();

  const faq: { q: string; a: string }[] = [
    {
      q: `How do I use the ${icon.title.toLowerCase()} icon in React?`,
      a: `Copy ${icon.slug}.tsx into your project, install framer-motion, and import ${icon.component}. Render it like any component: <${icon.component} size={32} />.`,
    },
    {
      q: "Does it need a library?",
      a: "Only Framer Motion, which draws the animation. The icon itself is one file of plain SVG and React, with no other dependencies.",
    },
    {
      q: "Can I change the size and colour?",
      a: "Yes. Set size (in pixels) and strokeWidth as props. The icon draws in currentColor, so a text colour class on it, or on a parent, changes its colour.",
    },
    {
      q: "What happens with reduced motion?",
      a: "When the visitor has reduced motion switched on in their system, the icon does not animate. It stays in its resting pose.",
    },
  ];
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Icons", item: `${siteConfig.url}/icons` },
        { "@type": "ListItem", position: 2, name: `${icon.title} icon`, item: `${siteConfig.url}/icons/${icon.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      {jsonLd.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <Link href="/icons" className="hover:text-foreground">
              Icons
            </Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">{icon.title}</span>
          </nav>
          <h1 className="pg-display mt-5 max-w-[900px] text-[clamp(40px,6.6vw,72px)] leading-[1.02] text-foreground">
            Animated <RainbowWord>{icon.title}</RainbowWord> icon for React.
          </h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">{icon.description}</p>
        </div>
      </section>

      <section aria-label="Preview and usage" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <IconPlayground icon={icon} />
        </div>
      </section>

      <section aria-labelledby="source" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="source" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
            The code
          </h2>
          <p className="mt-2 max-w-[640px] text-[16px] text-muted-foreground">
            One file. Save it as <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px]">components/icons/{icon.slug}.tsx</code>, run{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px]">npm i framer-motion</code>, and import{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px]">{icon.component}</code>.
          </p>
          <div className="mt-6">
            <CodeBlock
              code={source}
              language="tsx"
              theme="dark"
              header={{ ...DEFAULT_HEADER, title: `${icon.slug}.tsx` }}
              hoverHighlight={false}
              enableSound={false}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="props" className="px-4 pb-16">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="props" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
            Props
          </h2>
          <div className="mt-6 overflow-x-auto rounded-[20px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <table className="w-full min-w-[560px] text-left text-[15px]">
              <thead>
                <tr className="text-[13px] uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3.5 font-medium">Prop</th>
                  <th className="px-5 py-3.5 font-medium">Type</th>
                  <th className="px-5 py-3.5 font-medium">Default</th>
                  <th className="px-5 py-3.5 font-medium">What it does</th>
                </tr>
              </thead>
              <tbody>
                {PROPS.map(([n, t, d, note]) => (
                  <tr key={n} className="border-t border-border">
                    <td className="px-5 py-3.5 font-mono text-[14px] text-foreground">{n}</td>
                    <td className="px-5 py-3.5 font-mono text-[14px] text-muted-foreground">{t}</td>
                    <td className="px-5 py-3.5 font-mono text-[14px] text-muted-foreground">{d || "–"}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="more" className="px-4 pb-16">
          <div className="mx-auto max-w-[1152px]">
            <h2 id="more" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
              More {category?.label.toLowerCase() ?? ""} icons
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
              {related.map((i) => (
                <li key={i.slug}>
                  <IconTile icon={i} />
                </li>
              ))}
            </ul>
            <p className="mt-6">
              <Link href="/icons" className="text-[15px] text-link hover:underline hover:underline-offset-4">
                All animated icons ›
              </Link>
            </p>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="faq" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <h2 id="faq" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
            Questions about the {name} icon
          </h2>
          <div className="mt-6 border-t border-border">
            {faq.map((f) => (
              <details key={f.q} className="group border-b border-border">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-semibold tracking-[-0.3px] text-foreground [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="text-[22px] font-normal text-muted-foreground transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none">
                    +
                  </span>
                </summary>
                <p className="max-w-[640px] pb-5 text-[15.5px] leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
