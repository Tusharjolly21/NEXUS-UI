"use client";

import Link from "next/link";
import { useProAccess } from "@/components/pro/pro-access";
import { pillClassName } from "@/components/site/pill-link";
import { trackEvent } from "@/lib/track";

export type ProPick = { slug: string; name: string };

/**
 * A quiet, in-page card at the end of a free component's page, for visitors who don't have Pro.
 * Not a popup or a banner: it sits in the page flow, never overlays anything and is never re-shown.
 * It names real Pro components from the same category so the offer is something you can look at.
 */
export function ProNudge({
  slug,
  name,
  picks,
  placement = "end",
}: {
  slug: string;
  name: string;
  picks: ProPick[];
  /** `top` is the short version right under the preview, where people actually look; `end` is the full card. */
  placement?: "top" | "end";
}) {
  const { isPro, proCount } = useProAccess();
  if (isPro || proCount <= 0) return null;
  const top = placement === "top";
  const headingId = top ? "pro-nudge-top-heading" : "pro-nudge-heading";

  return (
    <section aria-labelledby={headingId} className={top ? "mt-10" : "mt-20"}>
      <div
        className={
          top
            ? "pg-glass rounded-[24px] bg-tint-sky/70 p-6 sm:p-7 md:flex md:items-center md:justify-between md:gap-10"
            : "pg-glass rounded-[28px] bg-tint-sky/70 p-7 sm:p-9 md:flex md:items-center md:justify-between md:gap-10"
        }
      >
        <div className="min-w-0">
          <h2 id={headingId} className="pg-display text-[clamp(26px,3.4vw,34px)] leading-[1.08] text-foreground">
            Like {name}? {proCount} more are in Pro.
          </h2>
          <p className="mt-3 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
            Pro unlocks all {proCount} Pro components, every template and block, and everything we release next.{" "}
            {name} stays free.
          </p>
          {picks.length && !top ? (
            <ul aria-label="A few Pro components" className="mt-5 flex flex-wrap gap-2">
              {picks.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/components/${p.slug}`}
                    className="pg-glass inline-block rounded-full bg-card px-3 py-1 text-[13.5px] font-medium text-foreground transition-colors hover:bg-card/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div className="mt-6 shrink-0 md:mt-0">
          <Link
            href="/pricing"
            data-plans-source={top ? "pro_card_top" : "pro_card"}
            onClick={() => trackEvent("pro_card_click", { slug, placement })}
            className={pillClassName("ink", "md")}
          >
            See plans
          </Link>
        </div>
      </div>
    </section>
  );
}
