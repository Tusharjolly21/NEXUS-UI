import Link from "next/link";
import { ComponentGallery } from "@/components/gallery/component-gallery";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { getPopulatedCategories, isIndexableCategory } from "@/lib/catalog/category-seo";
import { getIndexableTypes, getTypeHref } from "@/lib/catalog/type-collections";
import { allGalleryItems } from "@/lib/catalog/gallery-items";
import { getComponentCategoryHref } from "@/lib/catalog/taxonomy";
import { alternatives } from "@/lib/alternatives";
import { componentGroups } from "@/lib/catalog/listing-groups/components";
import { ListingShell } from "@/components/listing/listing-shell";
import { ListingGroupChips, ListingSidebar, RESULTS_ID } from "@/components/listing/listing-sidebar";
import { ProBand, ProRail, type PromoCopy } from "@/components/listing/pro-promo";
import type { DisplayPricing } from "@/lib/pricing";

/** The "For fun" group (web slingers, portals, black holes, a shredder). Heavy canvas and WebGL, so it lives on its own page instead of in the wall. */
const FUN_GROUP = "fun";

/**
 * The /components page for the prices it is given. It reads nothing from the request, so a copy can be built once and cached
 * (src/app/(static)/components-static); the regular route (src/app/(site)/components/page.tsx) hands it the visitor's own prices.
 */
export function ComponentsPageContent({ pricing }: { pricing: DisplayPricing }) {
  const all = allGalleryItems();
  const items = all.filter((i) => i.group !== FUN_GROUP);

  const pro = items.filter((i) => i.premium).length;
  const groups = componentGroups(all, { withFun: false });
  const copy: PromoCopy = {
    title: ["Unlock all ", String(pro), " Pro components"],
    body: "Every one with full source, sound and its own demo, and your coding agent can add any of them by name.",
    band: `Unlock all ${pro} Pro components`,
  };

  return (
    <>
      <ListingShell
        sidebar={<ListingSidebar title="Components" total={items.length} groups={groups} param="group" />}
        rail={<ProRail copy={copy} pricing={pricing} />}
      >
        <h1 className="pg-display max-w-[900px] text-[clamp(42px,5.4vw,72px)] leading-[1.02] text-foreground">
          Animated React components that feel <RainbowWord>alive</RainbowWord>.
        </h1>
        <p className="mt-5 max-w-[600px] text-[18px] leading-[1.55] text-muted-foreground">
          Springs, physics, sound and the small details that usually take a week to get right, built with Tailwind CSS and
          Framer Motion. Play with any of them below, then add it to your Next.js or React app with one command.
        </p>

        <section id={RESULTS_ID} aria-label="Component gallery" className="mt-10 scroll-mt-24">
          <ListingGroupChips groups={groups} total={items.length} param="group" className="mb-4" />
          <ComponentGallery
            groupParam="group"
            items={items}
            pricing={pricing}
            searchable
            plansLine
            cards
            afterFilters={<ProBand copy={copy} pricing={pricing} className="mt-5" />}
          />
        </section>
      </ListingShell>

      <section className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <nav aria-labelledby="by-category">
            <h2 id="by-category" className="text-[17px] font-semibold text-foreground">
              Browse by category
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {getPopulatedCategories()
                .filter((c) => isIndexableCategory(c.slug))
                .map((c) => (
                  <li key={c.slug}>
                    <PillLink href={getComponentCategoryHref(c.slug)} variant="white" size="sm">
                      {c.label}
                    </PillLink>
                  </li>
                ))}
            </ul>
            <h2 id="by-type" className="mt-8 text-[17px] font-semibold text-foreground">
              Browse by type
            </h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {getIndexableTypes().map((t) => (
                <li key={t.slug}>
                  <PillLink href={getTypeHref(t.slug)} variant="white" size="sm">
                    {t.heading.replace(/^React /, "").replace(/ Components?$/, "").replace(/: .*$/, "")}
                  </PillLink>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[15px] leading-relaxed text-muted-foreground">
              Comparing libraries? See Nexus UI next to{" "}
              {alternatives.map((a, i) => (
                <span key={a.slug}>
                  {i > 0 ? (i === alternatives.length - 1 ? " and " : ", ") : ""}
                  <Link href={`/alternatives/${a.slug}`} className="text-link hover:underline hover:underline-offset-4">
                    {a.name}
                  </Link>
                </span>
              ))}
              .
            </p>
          </nav>
        </div>
      </section>

      <Band tint="mint">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="pg-display text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">Can&apos;t find the one you need?</h2>
            <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
              Tell us what you&apos;re building and we&apos;ll consider it for the next drop. Or start from a whole page.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <PillLink href="/contact">Ask for a component</PillLink>
            <PillLink href="/templates" variant="white">
              See templates
            </PillLink>
          </div>
        </div>
      </Band>

      {/* every component as a plain link, for crawlers and screen-reader navigation */}
      <nav aria-label="All components" className="sr-only">
        <ul>
          {all.map((i) => (
            <li key={i.slug}>
              <Link href={`/components/${i.slug}`}>{i.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
