"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";
import { useProAccess } from "@/components/pro/pro-access";
import { getConsentSnapshot, getServerConsentSnapshot, subscribeConsent } from "@/lib/consent";
import { WHATS_NEW_COOKIE, WHATS_NEW_ID } from "@/lib/launch-banner";
import { SLOTS_COOKIE, type SlotPlan, type SlotsResponse } from "@/lib/launch-slots";
import { PRICES, formatPrice } from "@/lib/pricing";

/**
 * A small card for visitors without Pro: how many early slots each plan has taken, and that the price goes up
 * when they are gone. The numbers come from /api/slots, which counts them from the database, so they are real and
 * move when someone buys. It appears after a while on the site, once the cookie question and the icons
 * announcement are out of the way, never on the pricing, sign-in or account pages, and never for Pro members.
 * Closing it hides it for a week. A plan whose slots are full is left out; with none left the card does not appear.
 */
const HIDDEN_ON = ["/pricing", "/login", "/auth", "/dashboard", "/checkout"];

const ROWS: { plan: SlotPlan; name: string; price: string; unit: string }[] = [
  { plan: "lifetime", name: "All-Access", price: formatPrice(PRICES.allAccess), unit: "once" },
  { plan: "yearly", name: "Pro", price: formatPrice(PRICES.pro), unit: "a year" },
];

function hasCookie(name: string, value?: string) {
  return document.cookie.split("; ").some((c) => (value ? c === `${name}=${value}` : c.startsWith(`${name}=`)));
}

export function SlotsNotice() {
  const { isPro } = useProAccess();
  const pathname = usePathname() ?? "/";
  const consent = React.useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const reduce = useReducedMotion();
  const [data, setData] = React.useState<SlotsResponse | null>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const hiddenHere = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const asked = consent === "granted" || consent === "denied";

  // After a short while, and only when the visitor hasn't closed it this week and the icons announcement is done.
  React.useEffect(() => {
    if (isPro || hasCookie(SLOTS_COOKIE)) return;
    let alive = true;
    let poll = 0;
    const check = () => {
      if (!alive) return;
      if (hasCookie(WHATS_NEW_COOKIE, WHATS_NEW_ID)) setReady(true);
      else poll = window.setTimeout(check, 5000);
    };
    const start = window.setTimeout(check, 20000);
    return () => {
      alive = false;
      window.clearTimeout(start);
      window.clearTimeout(poll);
    };
  }, [isPro]);

  // The numbers are only fetched when the card could actually show.
  const wantsData = ready && asked && !hiddenHere && !isPro && !dismissed;
  React.useEffect(() => {
    if (!wantsData || data) return;
    let alive = true;
    fetch("/api/slots")
      .then((r) => (r.ok ? (r.json() as Promise<SlotsResponse>) : null))
      .then((d) => alive && d && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [wantsData, data]);

  const rows = data?.enabled ? ROWS.filter((r) => data.plans[r.plan] && data.plans[r.plan]!.taken < data.plans[r.plan]!.cap) : [];
  const visible = wantsData && rows.length > 0;

  function close() {
    document.cookie = `${SLOTS_COOKIE}=1; Max-Age=${60 * 60 * 24 * 7}; Path=/; SameSite=Lax`;
    setDismissed(true);
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="slots-title"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pg-frost fixed inset-x-3 bottom-3 z-[60] rounded-[22px] p-5 text-foreground shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] ring-1 ring-border sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[400px]"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
          <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Early prices</p>
          <h2 id="slots-title" className="mt-0.5 pr-8 text-[19px] font-semibold tracking-[-0.015em]">
            Early slots are open
          </h2>
          <ul className="mt-3 grid gap-3">
            {rows.map((r) => {
              const p = data!.plans[r.plan]!;
              const pct = Math.max(2, Math.round((p.taken / p.cap) * 100));
              return (
                <li key={r.plan}>
                  <div className="flex items-baseline justify-between gap-3 text-[14px]">
                    <span className="font-medium">
                      {r.name} <span className="font-normal text-muted-foreground">{r.price} {r.unit}</span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {p.taken} of {p.cap} taken
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label={`${r.name} early slots taken`}
                    aria-valuemin={0}
                    aria-valuemax={p.cap}
                    aria-valuenow={p.taken}
                    className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]"
                  >
                    <div className="h-full rounded-full bg-action" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[13.5px] text-muted-foreground">When the early slots are gone, the price goes up.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/pricing" onClick={close} className={pillClassName("ink", "sm", "w-full")}>
              See plans
            </Link>
            <button type="button" onClick={close} className={pillClassName("white", "sm", "w-full")}>
              Not now
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
