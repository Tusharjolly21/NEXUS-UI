import type { Metadata } from "next";
import Link from "next/link";
import { IconGrid } from "@/components/nx-icons/icon-grid";
import { RealInterfaces } from "@/components/nx-icons/real-interfaces";
import { RainbowWord } from "@/components/site";
import { ICONS } from "@/lib/icons/catalog";
import { FREE_ICON_COUNT, PRO_ICON_COUNT } from "@/lib/icons/count";
import { createMetadata, siteConfig } from "@/lib/seo";
import { ListingShell } from "@/components/listing/listing-shell";
import { ListingGroupChips, ListingSidebar, RESULTS_ID } from "@/components/listing/listing-sidebar";
import { ProBand, ProRail, type PromoCopy } from "@/components/listing/pro-promo";
import { totalOf } from "@/lib/catalog/listing-groups/total";
import { iconGroups } from "@/lib/catalog/listing-groups/icons";

const FITS: { title: string; body: string; icons: string[] }[] = [
  { title: "Toolbars and editors", body: "Undo, edit, link, attach, crop and code buttons for rich-text editors, note apps and CMS screens.", icons: ["undo", "pencil", "link", "paperclip", "scissors", "code"] },
  { title: "Players", body: "Play and pause that morphs, skip, shuffle, repeat, volume and like buttons for music, video and podcast apps.", icons: ["play-pause", "skip-forward", "shuffle", "repeat", "volume", "headphones"] },
  { title: "Carts and checkout", body: "Add-to-bag, price tags, delivery, wallet and card icons for stores, marketplaces and payment steps.", icons: ["shopping-bag", "shopping-cart", "tag", "package", "wallet", "credit-card"] },
  { title: "Forms and inputs", body: "Show-password eyes, locks, calendars, toggles and send buttons that confirm every action.", icons: ["eye", "lock", "calendar", "toggle", "send", "status"] },
  { title: "Toasts and alerts", body: "Success, warning and info messages with a dismiss button, plus bells for notifications.", icons: ["check-circle", "alert-triangle", "info", "close", "bell", "alarm-clock"] },
  { title: "Navigation", body: "Hamburger menus, tab bars, next arrows and search for headers, sidebars and mobile apps.", icons: ["menu", "home", "search", "arrow-right", "compass", "plus"] },
  { title: "Dashboards", body: "Charts, settings, sliders and refresh controls for admin panels and analytics screens.", icons: ["bar-chart", "settings", "sliders", "refresh", "battery", "zap"] },
  { title: "Loading states", body: "Spinners, dots and ripples that loop on their own, for buttons, cards and whole pages.", icons: ["arc-spinner", "wave-dots", "pulse-dots", "tick-spinner", "ripple", "orbit"] },
];

export const metadata: Metadata = createMetadata({
  title: `${FREE_ICON_COUNT} Free Animated Icons for React, With Sound`,
  description: `${ICONS.length} animated React icons, each with its own sound, ${FREE_ICON_COUNT} free: loaders, bells, hearts, arrows and more. Built with Framer Motion. Hover to play.`,
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

  const groups = iconGroups();
  const total = totalOf(groups);
  const copy: PromoCopy = {
    title: ["Unlock all ", String(PRO_ICON_COUNT), " Pro icons"],
    body: "Every icon with its own sound and every style, ready to copy, plus every component, block and template.",
    band: `Unlock all ${PRO_ICON_COUNT} Pro icons`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ListingShell sidebar={<ListingSidebar title="Icons" total={total} groups={groups} param="category" layout="groups" />} rail={<ProRail copy={copy} />}>
        <h1 className="pg-display max-w-[900px] text-[clamp(42px,5.4vw,76px)] leading-[1.02] text-foreground">
          Animated icons for React that <RainbowWord>move</RainbowWord>.
        </h1>
        <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-muted-foreground">
          Loaders that loop, bells that ring, planes that fly off and come back. Hover any icon to play it, restyle the whole set with the
          controls below, switch Sound on to hear each one, then open one to drag it and copy its file. Want the sounds in your own app? Read the <Link href="/icons/sounds" className="text-foreground underline underline-offset-4">sound guide</Link>.
        </p>
        <ProBand copy={copy} className="mt-8" />

        <section id={RESULTS_ID} aria-label="Icon library" className="mt-10 scroll-mt-24">
          <ListingGroupChips groups={groups} total={total} param="category" className="mb-4" />
          <IconGrid />
        </section>

        <div>
          <section aria-labelledby="real-interfaces" className="mt-24">
            <h2 id="real-interfaces" className="pg-display text-[clamp(30px,4.4vw,48px)] leading-[1.05] text-foreground">Made for real interfaces</h2>
            <p className="mt-4 max-w-[680px] text-[18px] leading-[1.55] text-muted-foreground">
              Drop them into the toolbars, players and carts you already build. Here is each one in a small working mock-up: click, hover and type to see where an icon fits, then open it to copy the file.
            </p>
            <div className="mt-8">
              <RealInterfaces />
            </div>

            <h3 className="mt-16 text-[22px] font-semibold text-foreground">Where animated icons fit</h3>
            <ul className="mt-5 grid gap-x-8 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {FITS.map((f) => (
                <li key={f.title}>
                  <p className="text-[16px] font-semibold text-foreground">{f.title}</p>
                  <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{f.body}</p>
                  <p className="mt-2.5 flex flex-wrap gap-1.5">
                    {f.icons.map((i) => (
                      <Link key={i} href={`/icons/${i}`} className="rounded-full bg-secondary px-2.5 py-1 text-[12px] text-foreground/80 transition-colors hover:text-foreground">
                        {i}
                      </Link>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-20 grid gap-8 sm:grid-cols-3">
            {[
              ["A tiny story and a sound each", "Not just a wiggle: a bell that pops a badge, a bin that catches a crumpled paper, a house that switches its windows on. Every one has its own sound, scored note by note against its animation."],
              ["Make it yours", "Spark, Neon, Aurora or Chrome, or the liquid looks: Mercury (flowing metal), Liquid (a wet, wobbling droplet) and Glass (a lens with a bright rim). Any colour, any speed. Try them on the whole set above, or on a single icon on its own page."],
              ["One file, free or Pro", `Each icon is one self-contained component built with Framer Motion, and it holds still for visitors who have reduced motion switched on. ${FREE_ICON_COUNT} are free to copy; Pro unlocks the other ${PRO_ICON_COUNT}. You can preview, play and hear every one of them first.`],
            ].map(([title, body]) => (
              <div key={title}>
                <h2 className="text-[17px] font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-[15.5px] leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </ListingShell>
    </>
  );
}
