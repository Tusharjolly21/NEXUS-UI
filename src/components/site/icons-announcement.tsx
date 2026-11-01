"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { BellIcon } from "@/components/nx-icons/icons/bell";
import { HeartIcon } from "@/components/nx-icons/icons/heart";
import { RocketIcon } from "@/components/nx-icons/icons/rocket";
import { pillClassName } from "@/components/site/pill-link";
import { useProAccess } from "@/components/pro/pro-access";
import { WHATS_NEW_COOKIE, WHATS_NEW_ID } from "@/lib/launch-banner";
import { FREE_ICON_COUNT, ICON_COUNT, PRO_ICON_COUNT } from "@/lib/icons/count";
import { getConsentSnapshot, getServerConsentSnapshot, subscribeConsent } from "@/lib/consent";

function writeSeen() {
  document.cookie = `${WHATS_NEW_COOKIE}=${WHATS_NEW_ID}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax`;
}

/**
 * A one-time "what's new" card: the first time someone opens the site after the icon library ships, they are
 * told it exists, whether they are signed out, on the free plan or a Pro member (each gets their own words).
 * It waits until the cookie question has been answered so the two never stack, stays off the icon pages
 * themselves, and closing it (or following its link) stores a cookie so it never comes back. Bump WHATS_NEW_ID
 * for the next announcement.
 */
export function IconsAnnouncement() {
  const { isPro } = useProAccess();
  const pathname = usePathname();
  const consent = React.useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const reduce = useReducedMotion();
  const [armed, setArmed] = React.useState(false);
  const [dismissed, setDismissed] = React.useState(false);
  const [tick, setTick] = React.useState(0);

  // Wait a beat after load, and only for people who haven't seen this announcement yet.
  React.useEffect(() => {
    const seen = document.cookie.split("; ").some((c) => c === `${WHATS_NEW_COOKIE}=${WHATS_NEW_ID}`);
    if (seen) return;
    const t = window.setTimeout(() => setArmed(true), 1600);
    return () => window.clearTimeout(t);
  }, []);

  const onIcons = pathname === "/icons" || pathname.startsWith("/icons/");
  const visible = armed && !dismissed && !onIcons && (consent === "granted" || consent === "denied");

  // The three icons take turns playing while the card is up.
  React.useEffect(() => {
    if (!visible || reduce) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1800);
    return () => window.clearInterval(t);
  }, [visible, reduce]);

  function remember() {
    writeSeen();
    setDismissed(true);
  }

  // Seeing the icon pages counts as having seen the announcement (no state change: the card is already hidden there).
  React.useEffect(() => {
    if (onIcons) writeSeen();
  }, [onIcons]);

  const items = [
    { Icon: BellIcon, accent: "#ff3b30" },
    { Icon: RocketIcon, accent: "#ff9f0a" },
    { Icon: HeartIcon, accent: "#ff375f" },
  ];

  return (
    <AnimatePresence>
      {visible ? (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="whats-new-title"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pg-frost fixed inset-x-3 bottom-3 z-[60] rounded-[22px] p-5 text-foreground ring-1 ring-border shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[400px]"
        >
          <button
            type="button"
            onClick={remember}
            aria-label="Dismiss"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring"
          >
            <X className="size-4" aria-hidden />
          </button>
          <div className="flex items-center gap-2" aria-hidden>
            {items.map(({ Icon, accent }, i) => (
              <span key={i} className="grid size-11 place-items-center rounded-2xl bg-secondary text-foreground">
                <Icon size={24} accent={accent} play={!reduce && tick % items.length === i} />
              </span>
            ))}
          </div>
          {isPro ? (
            <>
              <p className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#b07400] dark:text-[#ffd60a]">
                <Check className="size-3.5" aria-hidden /> Included in your plan
              </p>
              <h2 id="whats-new-title" className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em]">
                Your plan includes all {ICON_COUNT} icons
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                That is the {FREE_ICON_COUNT} free icons plus all {PRO_ICON_COUNT} Pro ones, each with its own sound and a copy-paste React file. Every icon we add from here on is included too, at no extra cost.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/icons" onClick={remember} className={pillClassName("ink", "sm", "w-full")}>
                  Open the library
                </Link>
                <button type="button" onClick={remember} className={pillClassName("white", "sm", "w-full")}>
                  Later
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">New</p>
              <h2 id="whats-new-title" className="mt-0.5 text-[17px] font-semibold tracking-[-0.01em]">
                {ICON_COUNT} animated icons, with sound
              </h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
                Every one has its own synthesised sound and a copy-paste React file. {FREE_ICON_COUNT} are free; Pro unlocks the other {PRO_ICON_COUNT}.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/icons" onClick={remember} className={pillClassName("white", "sm", "w-full")}>
                  Try the free icons
                </Link>
                <Link href="/pricing" onClick={remember} className={pillClassName("white", "sm", "w-full")}>
                  See Pro
                </Link>
              </div>
            </>
          )}
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
