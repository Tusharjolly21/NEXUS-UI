import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { CodeBlock } from "@/components/code-block";
import { AccessTag } from "@/components/pro/pro-access";
import { DEFAULT_HEADER } from "@/components/code-block/code-block";
import { IconTile } from "@/components/nx-icons/icon-grid";
import { CopyButton } from "@/components/nx-icons/copy-button";
import { LockedCode } from "@/components/nx-icons/locked-code";
import { sessionCanAccessIcon } from "@/lib/icons/access";
import { IconPlayground } from "@/components/nx-icons/icon-playground";
import { UseScene } from "@/components/nx-icons/use-scenes";
import { RainbowWord } from "@/components/site";
import { ICONS, getCategory, getIcon } from "@/lib/icons/catalog";
import { iconMetaDescription } from "@/lib/icons/seo";
import { ICON_USES } from "@/lib/icons/uses";
import { FREE_ICON_COUNT, PRO_ICON_COUNT } from "@/lib/icons/count";
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
    description: iconMetaDescription(icon),
    alternates: { canonical: `/icons/${icon.slug}` },
  });
}

const PROPS: [name: string, type: string, def: string, note: string][] = [
  ["size", "number", "24", "Width and height in pixels."],
  ["strokeWidth", "number", "2", "Line thickness, in a drawing that is 24 units wide."],
  ["speed", "number", "1", "Playback speed: 1 is the designed pace, 2 is twice as fast, 0.5 is half."],
  ["accent", "string", "currentColor", "Colour of the icon's small accent details (a badge, a spark, a trail). Left out, they match the icon."],
  ["className", "string", "", "Set a text colour here: the icon draws in currentColor."],
  ["play", "boolean", "", "true plays, false rests. Left out, it follows the pointer (or loops, for loaders)."],
];
const STATE_PROP: [string, string, string, string] = ["state", "\"idle\" | \"loading\" | \"success\" | \"error\"", "", "Which state to show. Left out, it runs loading then success while the pointer is over it."];

export default async function IconPage({ params }: Props) {
  const { slug } = await params;
  const icon = getIcon(slug);
  if (!icon) notFound();
  const category = getCategory(icon.category);
  // A Pro icon's code and sound reach the browser only if the server has checked this session has Pro: otherwise
  // they are never even read, so nothing can leak through the page, the props or the HTML.
  const canSee = await sessionCanAccessIcon(icon.slug);
  const locked = !canSee;
  const source = canSee ? await readFile(path.join(process.cwd(), "src/components/nx-icons/icons", `${icon.slug}.tsx`), "utf8") : "";
  const scoreSource = canSee ? await readFile(path.join(process.cwd(), "src/components/nx-icons/sounds", `${icon.slug}.ts`), "utf8") : "";
  const material = await readFile(path.join(process.cwd(), "src/components/nx-icons/icon-material.tsx"), "utf8");
  const related = ICONS.filter((i) => i.category === icon.category && i.slug !== icon.slug).slice(0, 6);
  const name = icon.title.toLowerCase();
  const uses = ICON_USES[icon.slug] ?? [];
  const soundVar = icon.slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
  const usage = `"use client";

import { ${icon.component} } from "@/components/icons/${icon.slug}";
import * as ${soundVar} from "@/components/icons/sounds/${icon.slug}";
import { playIconScore } from "@/components/icons/sound-engine";

export function ${icon.component.replace(/Icon$/, "")}Button() {
  return (
    <button
      type="button"
      onPointerEnter={() => playIconScore(${soundVar})}
      onClick={() => playIconScore(${soundVar})}
    >
      <${icon.component} size={24} />
    </button>
  );
}`;

  const faq: { q: string; a: string }[] = [
    {
      q: `How do I use the ${icon.title.toLowerCase()} icon in React?`,
      a: `Copy ${icon.slug}.tsx into your project, install framer-motion, and import ${icon.component}. Render it like any component: <${icon.component} size={32} />.`,
    },
    {
      q: `Where can I use the ${name} icon?`,
      a: `${uses.map((u) => u.title.toLowerCase()).join(", ")}. Each one is shown live on this page.`,
    },
    {
      q: `Is the ${name} icon free?`,
      a: icon.premium
        ? `You can preview and play the ${name} icon, with its looks and its sound, for free. Its code and sound file are part of Nexus UI Pro, which unlocks all ${PRO_ICON_COUNT} Pro icons. ${FREE_ICON_COUNT} other icons are free to copy.`
        : `Yes. The ${name} icon is one of the ${FREE_ICON_COUNT} free icons: copy its file and sound and use them in personal, commercial and client projects.`,
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
      q: `Does the ${name} icon make a sound?`,
      a: `Yes, optionally: ${icon.heard} The sound is scored against the icon's own animation, so every note lands on a beat of the picture, and it follows the speed prop. It plays only if you call it, and it follows the visitor's sound setting.`,
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
      "@type": "SoftwareSourceCode",
      name: `${icon.title} animated icon for React`,
      description: icon.description,
      programmingLanguage: "TypeScript",
      runtimePlatform: "React",
      keywords: icon.tags.join(", "),
      creator: { "@type": "Organization", name: siteConfig.siteName, url: siteConfig.url },
      isAccessibleForFree: !icon.premium,
      url: `${siteConfig.url}/icons/${icon.slug}`,
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
        <div className="relative mx-auto max-w-[var(--item-w,1152px)]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-muted-foreground">
            <Link href="/icons" className="hover:text-foreground">
              Icons
            </Link>
            <span aria-hidden>›</span>
            <span className="text-foreground">{icon.title}</span>
          </nav>
          <p className="mt-5 flex items-center gap-2 text-[13.5px] text-muted-foreground">
            <AccessTag premium={icon.premium} />
            {icon.premium ? "Preview and play it free. Its code and sound come with Pro." : "Free to copy, with its sound."}
          </p>
          <h1 className="pg-display mt-3 max-w-[900px] text-[clamp(40px,6.6vw,72px)] leading-[1.02] text-foreground">
            Animated <RainbowWord>{icon.title}</RainbowWord> icon for React.
          </h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">{icon.description}</p>
          {uses.length ? (
            <p className="mt-5 flex max-w-[760px] flex-wrap items-center gap-2 text-[14px] text-muted-foreground">
              <span className="mr-1">Use it for</span>
              {uses.map((u) => (
                <a key={u.title} href="#where-to-use" className="rounded-full bg-card px-3 py-1.5 text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.06)] transition-colors hover:bg-secondary dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]">
                  {u.title}
                </a>
              ))}
            </p>
          ) : null}
        </div>
      </section>

      <section aria-label="Preview and usage" className="px-4 pb-16">
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
          <IconPlayground icon={icon} source={source} locked={locked} />
        </div>
      </section>

      {uses.length ? (
        <section id="where-to-use" aria-labelledby="where" className="scroll-mt-24 px-4 pb-16">
          <div className="mx-auto max-w-[var(--item-w,1152px)]">
            <h2 id="where" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
              Where to use the {name} icon
            </h2>
            <p className="mt-2 max-w-[680px] text-[16px] text-muted-foreground">
              {uses.length} real places it fits, each one live. Hover, tap or press a key on a mock-up to see the icon move in context, then copy the
              file above and drop it in.
            </p>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {uses.map((u) => (
                <li key={u.title} className="flex flex-col overflow-hidden rounded-[22px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
                  <div className="flex h-[184px] shrink-0 items-center justify-center bg-secondary/60 p-4">
                    <UseScene slug={icon.slug} accent={icon.accent} scene={u.scene} label={u.label} sub={u.sub} />
                  </div>
                  <div className="p-4">
                    <h3 className="text-[15.5px] font-semibold text-foreground">{u.title}</h3>
                    <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{u.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14.5px] text-muted-foreground">
              More in context on the <Link href="/icons#real-interfaces" className="text-foreground underline underline-offset-4">Made for real interfaces</Link> page: a player, a cart, a toolbar, a chat box and a tab bar.
            </p>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="source" className="px-4 pb-16">
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="source" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
              The code
            </h2>
            {locked ? <CopyButton locked name={icon.title} label="Copy the file" /> : <CopyButton text={source} label="Copy the file" />}
          </div>
          <p className="mt-2 max-w-[640px] text-[16px] text-muted-foreground">
            One file. Save it as <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">components/icons/{icon.slug}.tsx</code>, run{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">npm i framer-motion</code>, and import{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">{icon.component}</code>.
          </p>
          <div className="mt-6">
            {locked ? (
              <LockedCode name={icon.title} what="code" />
            ) : (
              <CodeBlock
                code={source}
                language="tsx"
                theme="dark"
                header={{ ...DEFAULT_HEADER, title: `${icon.slug}.tsx` }}
                hoverHighlight={false}
                enableSound={false}
              />
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="sound" className="px-4 pb-16">
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="sound" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
              The sound (optional)
            </h2>
            {locked ? <CopyButton locked name={icon.title} label="Copy the sound" /> : <CopyButton text={scoreSource} label="Copy the sound" />}
          </div>
          <p className="mt-2 max-w-[700px] text-[16px] text-muted-foreground">
            {icon.heard} It is written against this icon&apos;s own animation: each line below is a note placed on a beat of the picture, and{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">t()</code> stretches it with the <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">speed</code>{" "}
            prop. There are no audio files: it is synthesised in the browser.
          </p>
          <ol className="mt-5 max-w-[760px] list-decimal space-y-2 pl-5 text-[15.5px] leading-relaxed text-muted-foreground">
            <li>
              Once per project, copy <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">sound-engine.ts</code> and{" "}
              <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">sound-kit.ts</code> from the{" "}
              <Link href="/icons/sounds" className="text-foreground underline underline-offset-4">sound guide</Link> into{" "}
              <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">components/icons/</code>.
            </li>
            <li>
              Save the score below as <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">components/icons/sounds/{icon.slug}.ts</code>.
            </li>
            <li>
              Call <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">playIconScore({icon.slug.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())})</code> from a click or hover handler:
            </li>
          </ol>
          <div className="mt-5">
            <CodeBlock
              code={usage}
              language="tsx"
              theme="dark"
              header={{ ...DEFAULT_HEADER, title: `${icon.slug}-button.tsx` }}
              hoverHighlight={false}
              enableSound={false}
            />
          </div>
          <div className="mt-6">
            {locked ? (
              <LockedCode name={icon.title} what="sound" />
            ) : (
              <CodeBlock code={scoreSource} language="ts" theme="dark" header={{ ...DEFAULT_HEADER, title: `${icon.slug}.ts` }} hoverHighlight={false} enableSound={false} />
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="props" className="px-4 pb-16">
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
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
                {(icon.states ? [...PROPS, STATE_PROP] : PROPS).map(([n, t, d, note]) => (
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

      <section aria-labelledby="looks" className="px-4 pb-16">
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="looks" className="text-[24px] font-semibold tracking-[-0.02em] text-foreground">
              Looks (optional)
            </h2>
            <CopyButton text={material} label="Copy the helper" />
          </div>
          <p className="mt-2 max-w-[680px] text-[16px] text-muted-foreground">
            Wrap an icon, or a whole grid of them, in <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">IconMaterial</code> to
            give it a finish: neon glow, an aurora spectrum, polished chrome, or one of the liquid looks (Mercury, Liquid and Glass), which are pure SVG with no canvas or WebGL and each make a sound of their own. Save it as{" "}
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">components/icons/icon-material.tsx</code>. Spark needs no helper:
            it is just the <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[14px] text-foreground">accent</code> prop.
          </p>
          <div className="mt-6">
            <CodeBlock
              code={material}
              language="tsx"
              theme="dark"
              header={{ ...DEFAULT_HEADER, title: "icon-material.tsx" }}
              hoverHighlight={false}
              enableSound={false}
            />
          </div>
        </div>
      </section>

      {related.length ? (
        <section aria-labelledby="more" className="px-4 pb-16">
          <div className="mx-auto max-w-[var(--item-w,1152px)]">
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
        <div className="mx-auto max-w-[var(--item-w,1152px)]">
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
