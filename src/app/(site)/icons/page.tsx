import type { Metadata } from "next";
import { IconGrid } from "@/components/nx-icons/icon-grid";
import { RainbowWord } from "@/components/site";
import { ICONS } from "@/lib/icons/catalog";
import { createMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Animated Icons for React",
  description: `${ICONS.length} animated React icons: loaders, spinners, bells, hearts, arrows and more. Built with Framer Motion. Hover to play, then copy the code.`,
  alternates: { canonical: "/icons" },
});

export default function IconsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Animated Icons for React",
    description: "Animated React icons built with Framer Motion. Hover to play, copy the code.",
    url: `${siteConfig.url}/icons`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ICONS.length,
      itemListElement: ICONS.map((i, n) => ({
        "@type": "ListItem",
        position: n + 1,
        name: `${i.title} icon`,
        url: `${siteConfig.url}/icons/${i.slug}`,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(44px,7.4vw,80px)] leading-[1.02] text-foreground">
            Animated icons for React that <RainbowWord>move</RainbowWord>.
          </h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">
            Loaders that loop, bells that ring, planes that fly off and come back. Hover any icon to play it, restyle the whole set with the
            controls below, switch Sound on to hear each one, then open one to drag it and copy its file.
          </p>
        </div>
      </section>

      <section aria-label="Icon library" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <IconGrid />

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            {[
              ["A tiny story and a sound each", "Not just a wiggle: a bell that pops a badge, a bin that catches a crumpled paper, a house that switches its windows on. Every one has its own sound, scored note by note against its animation."],
              ["Make it yours", "Spark, Neon, Aurora or Chrome, in any colour and at any speed. Try them on the whole set above, or on a single icon on its own page."],
              ["One file, no lock-in", "Each icon is one self-contained component built with Framer Motion, and it holds still for visitors who have reduced motion switched on."],
            ].map(([title, body]) => (
              <div key={title}>
                <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-[15.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
