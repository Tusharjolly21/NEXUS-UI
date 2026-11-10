import type { Metadata } from "next";
import Link from "next/link";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { templateName } from "@/components/templates/template-card";
import { getCachedUser } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { getPricing } from "@/lib/region";
import { IndiaDiscountBadge } from "@/components/pricing/india-discount-badge";
import { templates } from "@/lib/catalog/templates";
import TemplatesGallery from "./templates-client";
import { ListingShell } from "@/components/listing/listing-shell";
import { ListingBrowse, ListingSidebar } from "@/components/listing/listing-sidebar";
import { templateGroups } from "@/lib/catalog/listing-groups/templates";
import { ProBand, ProRail, type PromoCopy } from "@/components/listing/pro-promo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Next.js Landing Page Templates for SaaS",
  description: `${templates.length} animated Next.js landing page templates for SaaS, AI startups, agencies, portfolios and stores. Open each one live, then take the full source.`,
  alternates: { canonical: "/templates" },
});

export default async function TemplatesPage() {
  const pricing = await getPricing();
  let isPremium = false;

  if (isSupabaseConfigured()) {
    try {
      const user = await getCachedUser();
      if (user) {
        isPremium = await hasPremiumAccess(user.id);
      }
    } catch {
      // non-fatal: the page still works logged out
    }
  }

  const groups = templateGroups();
  const copy: PromoCopy = {
    title: ["Launch with every ", "template", ""],
    body: `All ${templates.length} templates with full source, plus every component and block, and everything we release next.`,
    band: "Launch with every template",
  };

  return (
    <>
      <ListingShell
        sidebar={<ListingSidebar title="Templates" total={templates.length} groups={groups} />}
        rail={<ProRail copy={copy} pricing={pricing} />}
      >
        <ListingBrowse title="Templates" total={templates.length} groups={groups} className="mb-8" />
        <h1 className="pg-display max-w-[860px] text-[clamp(44px,5.6vw,76px)] text-foreground">
          Next.js templates, ready to make <RainbowWord>yours</RainbowWord>
        </h1>
        <p className="mt-5 max-w-[620px] text-[18px] leading-[1.55] text-muted-foreground">
          {templates.length} Next.js landing pages with the motion already done. Open any of them live, then take the
          full source and change whatever you like.
        </p>

        <section aria-label="Templates" className="mt-10">
          <TemplatesGallery isPremium={isPremium} afterFilters={<ProBand copy={copy} pricing={pricing} className="mt-5" />} />
        </section>
      </ListingShell>

      <Band tint="butter">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {isPremium ? (
            <div>
              <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
                Every template is already yours
              </h2>
              <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
                Open one and grab the code. Need a section that isn&apos;t there? Drop in a component.
              </p>
            </div>
          ) : (
            <div>
              <h2 className="pg-display max-w-[620px] text-[clamp(36px,5vw,52px)] leading-[1.02] text-foreground">
                Get every template
              </h2>
              <p className="mt-4 max-w-[520px] text-[18px] text-muted-foreground">
                Pro unlocks all {templates.length}, every block and everything we release next for {pricing.pro} a year. All-Access unlocks the same, for good, at {pricing.allAccess} once.
              </p>
              {pricing.proDiscount ? <IndiaDiscountBadge percent={pricing.proDiscount} upTo className="mt-4" /> : null}
            </div>
          )}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {isPremium ? null : <PillLink href="/pricing">Compare plans</PillLink>}
            <PillLink href="/components" variant={isPremium ? "ink" : "white"}>
              Browse components
            </PillLink>
            <PillLink href="/videos" variant="white">
              Product videos
            </PillLink>
          </div>
        </div>
      </Band>

      {/* every template as a plain link, for crawlers and screen-reader navigation */}
      <nav aria-label="All templates" className="sr-only">
        <ul>
          {templates.map((t) => (
            <li key={t.slug}>
              <Link href={`/templates/${t.slug}`}>{templateName(t)}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
