"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { IconPeek } from "@/components/site/icon-peek";
import { pillClassName } from "@/components/site/pill-link";
import { useProAccess } from "@/components/pro/pro-access";
import { WHATS_NEW_COOKIE, WHATS_NEW_ID } from "@/lib/launch-banner";
import { FREE_ICON_COUNT, ICON_COUNT } from "@/lib/icons/count";
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

  // Wait a beat after load, and only for people who haven't seen this announcement yet.
  React.useEffect(() => {
    const seen = document.cookie.split("; ").some((c) => c === `${WHATS_NEW_COOKIE}=${WHATS_NEW_ID}`);
    if (seen) return;
    const t = window.setTimeout(() => setArmed(true), 1600);
    return () => window.clearTimeout(t);
  }, []);

  const onIcons = pathname === "/icons" || pathname.startsWith("/icons/");
  const visible = armed && !dismissed && !onIcons && (consent === "granted" || consent === "denied");

  function remember() {
    writeSeen();
    setDismissed(true);
  }

  // Seeing the icon pages counts as having seen the announcement (no state change: the card is already hidden there).
  React.useEffect(() => {
    if (onIcons) writeSeen();
  }, [onIcons]);

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
          <IconPeek count={6} size={26} className="gap-1.5 pr-9 sm:gap-2 sm:pr-0" tile="size-10 items-center justify-center rounded-xl bg-secondary text-foreground sm:size-12 sm:rounded-2xl" />
          <h2 id="whats-new-title" className="mt-4 text-[19px] font-semibold tracking-[-0.015em]">
            {isPro ? `All ${ICON_COUNT} animated icons are yours` : `${ICON_COUNT} animated icons, just landed`}
          </h2>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {isPro ? "Each with its own sound. New ones are included." : `Each with its own sound. ${FREE_ICON_COUNT} are free.`}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link href="/icons" onClick={remember} className={pillClassName("ink", "sm", "w-full")}>
              {isPro ? "Open the icons" : "See the icons"}
            </Link>
            <button type="button" onClick={remember} className={pillClassName("white", "sm", "w-full")}>
              Not now
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
