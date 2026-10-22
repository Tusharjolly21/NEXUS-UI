"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { pillClassName } from "@/components/site/pill-link";
import {
  OPEN_SETTINGS_EVENT,
  clearGoogleCookies,
  getConsentSnapshot,
  getServerConsentSnapshot,
  setConsent,
  subscribeConsent,
  type ConsentChoice,
} from "@/lib/consent";

/**
 * Asks whether Google Analytics and Google ads may set cookies. Shown to anyone who hasn't chosen,
 * and again whenever the footer's "Cookie settings" link is used. Accept and Reject carry equal weight.
 */
export function ConsentBanner() {
  const choice = React.useSyncExternalStore(subscribeConsent, getConsentSnapshot, getServerConsentSnapshot);
  const [reopened, setReopened] = React.useState(false);
  const reduce = useReducedMotion();
  const firstButton = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  /* While the answer is "no", make sure Google's cookies aren't lying around. Analytics can write its
     session cookie again as the page unloads, after withdrawing consent cleared it. */
  React.useEffect(() => {
    if (choice === "denied") clearGoogleCookies();
  }, [choice]);

  /* When it was opened on purpose, put focus inside it; when it simply appears, leave focus alone. */
  React.useEffect(() => {
    if (reopened) firstButton.current?.focus();
  }, [reopened]);

  React.useEffect(() => {
    if (!reopened) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setReopened(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reopened]);

  const visible = choice === "unset" || reopened;

  function choose(next: ConsentChoice) {
    const previous = getConsentSnapshot();
    setConsent(next);
    setReopened(false);
    if (previous === "granted" && next === "denied") {
      /* Scripts that are already running can't be unloaded: remove their cookies and start clean. */
      clearGoogleCookies();
      window.location.reload();
    }
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-text"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="pg-frost fixed inset-x-3 bottom-3 z-[90] rounded-[22px] p-5 text-foreground ring-1 ring-border shadow-[0_18px_50px_-18px_rgba(0,0,0,0.35)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:max-w-[400px]"
        >
          <h2 id="cookie-banner-title" className="text-[15px] font-semibold tracking-[-0.01em]">
            Cookies
          </h2>
          <p id="cookie-banner-text" className="mt-1.5 text-[13.5px] leading-relaxed text-muted-foreground">
            We&apos;d like to use Google Analytics and Google ads cookies to see how the site is used and to show
            ads. They stay off unless you say yes, and the site works the same either way.{" "}
            <Link
              href="/privacy#cookies-analytics"
              className="text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Details
            </Link>
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              ref={firstButton}
              type="button"
              onClick={() => choose("denied")}
              className={pillClassName("white", "sm", "w-full")}
            >
              Reject
            </button>
            <button type="button" onClick={() => choose("granted")} className={pillClassName("white", "sm", "w-full")}>
              Accept
            </button>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  );
}
