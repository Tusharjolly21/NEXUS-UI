import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { alternatives } from "@/lib/alternatives";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Animated React component libraries compared",
  description: "How Nexus UI compares with Magic UI, React Bits and Aceternity UI: install method, what is free, what costs money and when each is the better pick.",
  alternates: { canonical: "/alternatives" },
});

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
      </section>
    </>
  );
}
