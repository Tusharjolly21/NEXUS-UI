import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { GUIDE, alternatives } from "@/lib/alternatives";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Animated React libraries compared",
  description: "How Nexus UI compares with Magic UI, React Bits and Aceternity UI: install method, what is free, what costs money and when each is the better pick.",
  alternates: { canonical: "/alternatives" },
});

/** The questions worth asking of any animated component library, Nexus UI included. */
const COMPARE: { q: string; a: string }[] = [
  {
    q: "How does it install?",
    a: "Copy-paste works anywhere, but a shadcn CLI registry keeps every file and dependency in one command. Check whether the library offers one, and whether its Pro parts install the same way.",
  },
  {
    q: "What is free, and what is the licence?",
    a: "Count what you actually get for free: components, blocks, templates. Then read what the paid tier adds, and whether you can use it in client work.",
  },
  {
    q: "How does the motion feel?",
    a: "Open the live demos and drag, hover and click. Springs that settle and things that react to your pointer read very differently from a fade-in on scroll.",
  },
  {
    q: "Does it fit your stack?",
    a: "Look for TypeScript, Tailwind CSS and the animation library you already use, and check that components work with the Next.js App Router and server components around them.",
  },
  {
    q: "Yearly or once?",
    a: "Some libraries charge a yearly plan, some a one-time pass. If you will keep using it for years, a lifetime option usually costs less in the end.",
  },
  {
    q: "Will your AI agent understand it?",
    a: "If you build with Claude Code, Cursor or Codex, a library with an MCP server or written build prompts lets the agent add and adapt components without you copying files by hand.",
  },
];

export default function AlternativesPage() {
  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(44px,7vw,76px)] leading-[1.04] text-foreground">
            Animated React libraries, <RainbowWord>compared</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Picking a component library is a real decision. These pages set Nexus UI next to the libraries people
            compare it with, and say plainly when the other one is the better fit.
          </p>
        </div>
      </section>
      <section className="px-4 pb-24">
        <ul className="mx-auto grid max-w-[1152px] grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-3">
          {alternatives.map((a) => (
            <li key={a.slug} className="rounded-tile bg-card p-7 pg-float">
              <h2 className="text-[19px] font-semibold text-foreground">{a.name}</h2>
              <p className="mt-2 text-[15px] leading-relaxed text-body">{a.summary}</p>
              <Link
                href={`/alternatives/${a.slug}`}
                className="mt-4 inline-block text-[14.5px] font-medium text-link underline underline-offset-4"
              >
                Nexus UI vs {a.name}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mx-auto mt-16 max-w-[1152px]">
          <h2 className="pg-display text-[clamp(28px,3.6vw,38px)] leading-[1.08] text-foreground">What to compare</h2>
          <p className="mt-3 max-w-[640px] text-[17px] leading-relaxed text-muted-foreground">
            Most animated React libraries look alike in a screenshot. These are the differences that show up once one is in
            your project.
          </p>
          <dl className="mt-8 grid gap-x-10 gap-y-7 md:grid-cols-2">
            {COMPARE.map((c) => (
              <div key={c.q}>
                <dt className="text-[17px] font-semibold text-foreground">{c.q}</dt>
                <dd className="mt-1.5 text-[15.5px] leading-relaxed text-body">{c.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[15px] text-muted-foreground">
            For a longer read, see{" "}
            <Link href={GUIDE.href} className="text-link underline underline-offset-4">
              {GUIDE.label}
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
