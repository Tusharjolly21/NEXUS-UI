import type { Metadata } from "next";
import Link from "next/link";
import { Band, PillLink, RainbowWord } from "@/components/site";
import { templateName } from "@/components/templates/template-card";
import { getCachedUser } from "@/lib/supabase/server";
import { hasPremiumAccess } from "@/lib/entitlements";
import { isSupabaseConfigured } from "@/lib/env";
import { createMetadata } from "@/lib/seo";
import { PRICES, formatPrice } from "@/lib/pricing";
import { templates } from "@/lib/catalog/templates";
import TemplatesGallery from "./templates-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Next.js Landing Page Templates — SaaS, AI, Agency & Portfolio",
  description: `${templates.length} animated Next.js landing page templates for SaaS, AI startups, agencies, portfolios and stores. Open each one live, then take the full source. Built with Tailwind CSS and Framer Motion.`,
  alternates: { canonical: "/templates" },
});

export default async function TemplatesPage() {
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

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-6 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(48px,8vw,80px)] text-foreground">
            Whole pages, ready to make <RainbowWord>yours</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[620px] text-[19px] leading-[1.55] text-muted-foreground">
            {templates.length} Next.js landing pages with the motion already done. Open any of them live, then take the
            full source and change whatever you like.
          </p>
        </div>
      </section>

      <section aria-label="Templates" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <TemplatesGallery isPremium={isPremium} />
        </div>
      </section>

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
                Pro unlocks all {templates.length}, every block and everything we release next for {formatPrice(PRICES.pro)} a year. All-Access unlocks the same, for good, at {formatPrice(PRICES.allAccess)} once.
              </p>
            </div>
          )}
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {isPremium ? null : <PillLink href="/pricing">Compare plans</PillLink>}
            <PillLink href="/components" variant={isPremium ? "ink" : "white"}>
              Browse components
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
