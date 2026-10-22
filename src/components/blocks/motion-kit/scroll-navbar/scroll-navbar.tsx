"use client";

import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { useSound } from "@/lib/ui-sounds";
import { cn } from "@/lib/utils";

export interface ScrollNavbarProps {
  /** Wordmark shown next to the logo mark. It collapses away when the bar becomes a pill. */
  brand?: string;
  /** One or two letters inside the logo mark. */
  mark?: string;
  /** Nav items. Item N scrolls to the Nth element that matches `sectionSelector`. */
  links?: string[];
  /** Label of the call-to-action button. */
  ctaLabel?: string;
  /**
   * The scrolling element to watch, for example a panel with `overflow-y: auto`. Leave it out to watch the
   * window. Give the navbar a place inside that element so it can stick to its top.
   */
  scrollRef?: RefObject<HTMLElement | null>;
  /** CSS selector for the sections the underline follows, searched inside `scrollRef` (or the document). */
  sectionSelector?: string;
  /** Called with the link label and its index when a nav item is activated. */
  onNavigate?: (label: string, index: number) => void;
  /** Called when the call-to-action is pressed. */
  onCta?: () => void;
  /** Plays a soft tick when a nav item is activated. It follows the site-wide sound switch. Scrolling is always silent. */
  enableSound?: boolean;
  className?: string;
}

export const DEFAULT_SCROLL_NAVBAR_LINKS = ["Product", "Pricing", "Customers", "Docs"];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;
const PILL_SPRING = { type: "spring", stiffness: 300, damping: 32 } as const;
const INSTANT = { duration: 0 } as const;

/**
 * A navbar that knows how you are scrolling. At the top it is a full-width bar; scroll a little and it tucks
 * into a floating pill; keep scrolling down and it slides out of the way; scroll up even slightly and it
 * comes straight back. The underline follows whichever section you are reading, and pressing a link scrolls
 * there. It sticks to the top of the window, or of the element you pass as `scrollRef`. It never hides while
 * focus is inside it, and under reduced motion it fades instead of sliding and scrolls without animation.
 * Scroll-linked, so it has no autoplay.
 */
export function ScrollNavbar({
  brand = "Nexus",
  mark = "N",
  links = DEFAULT_SCROLL_NAVBAR_LINKS,
  ctaLabel = "Sign up",
  scrollRef,
  sectionSelector = "[data-sec]",
  onNavigate,
  onCta,
  enableSound = true,
  className,
}: ScrollNavbarProps) {
  const play = useSound(enableSound);
  const reduce = useReducedMotion() ?? false;
  const uid = useId().replace(/:/g, "");
  const [pill, setPill] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState(0);
  const [focusIn, setFocusIn] = useState(false);
  const last = useRef(0);

  // Watch the scroll position of the window or of the element we were given.
  useEffect(() => {
    const el = scrollRef?.current ?? null;
    const target: HTMLElement | Window = el ?? window;
    const read = () => {
      const y = el ? el.scrollTop : window.scrollY;
      const dy = y - last.current;
      last.current = y;
      setPill(y > 40);
      if (y < 120) setHidden(false);
      else if (dy > 6) setHidden(true);
      else if (dy < -3) setHidden(false);
      const secs = Array.from((el ?? document).querySelectorAll<HTMLElement>(sectionSelector));
      const base = el ? el.getBoundingClientRect().top - el.scrollTop : -window.scrollY;
      let a = 0;
      secs.forEach((s, i) => {
        if (s.getBoundingClientRect().top - base - 120 <= y) a = i;
      });
      setActive(a);
    };
    target.addEventListener("scroll", read, { passive: true });
    // Sync once after layout in case the page is already scrolled when we mount.
    const raf = requestAnimationFrame(read);
    return () => {
      target.removeEventListener("scroll", read);
      cancelAnimationFrame(raf);
    };
  }, [scrollRef, sectionSelector]);

  const go = useCallback(
    (i: number) => {
      const el = scrollRef?.current ?? null;
      const s = (el ?? document).querySelectorAll<HTMLElement>(sectionSelector)[i];
      if (!s) return;
      const behavior = reduce ? "auto" : "smooth";
      if (el) {
        const top = s.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop - 70;
        el.scrollTo({ top, behavior });
      } else {
        window.scrollTo({ top: s.getBoundingClientRect().top + window.scrollY - 70, behavior });
      }
    },
    [scrollRef, sectionSelector, reduce],
  );

  const away = hidden && !focusIn;

  return (
    // A zero-height sticky rail: the bar floats over whatever starts at the top instead of pushing it down.
    <div className={cn("sticky top-0 z-30 h-0 w-full", className)}>
      <motion.header
        className="@container absolute inset-x-0 top-0 flex justify-center"
        initial={false}
        animate={reduce ? { opacity: away ? 0 : 1, paddingTop: pill ? 12 : 0 } : { y: away ? -90 : 0, opacity: 1, paddingTop: pill ? 12 : 0 }}
        transition={reduce ? { duration: 0.15 } : SPRING}
        inert={away}
        onFocus={() => setFocusIn(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusIn(false);
        }}
      >
        <motion.nav
          className="relative isolate flex h-14 w-full items-center gap-2 px-4 @xl:px-6"
          initial={false}
          animate={{ maxWidth: pill ? 520 : 2000, borderRadius: pill ? 999 : 0 }}
          transition={reduce ? INSTANT : PILL_SPRING}
          aria-label="Main"
        >
          {/* Pill surface: fades in so the light and dark shadows can both be plain classes. */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,.06),0_14px_30px_-16px_rgba(0,0,0,.3)] backdrop-blur-[14px] [border-radius:inherit] dark:bg-[#1c1c1e]/80 dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_14px_30px_-16px_rgba(0,0,0,.9)]"
            initial={false}
            animate={{ opacity: pill ? 1 : 0 }}
            transition={reduce ? INSTANT : { duration: 0.25 }}
          />
          <span className="mr-auto flex items-center gap-2 text-[15px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
            <span
              className="flex h-7 w-7 flex-none items-center justify-center rounded-[8px] bg-[#1d1d1f] text-[12px] font-bold text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
              aria-hidden="true"
            >
              {mark}
            </span>
            <motion.span
              initial={false}
              animate={{ width: pill ? 0 : "auto", opacity: pill ? 0 : 1 }}
              transition={reduce ? INSTANT : undefined}
              className="overflow-hidden whitespace-nowrap"
            >
              {brand}
            </motion.span>
          </span>
          <LayoutGroup id={`mk-scroll-nav-${uid}`}>
            <div className="hidden items-center @xl:flex">
              {links.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => {
                    play("tick", 0.5);
                    onNavigate?.(l, i);
                    go(i);
                  }}
                  className={cn("relative h-9 rounded-full px-3 text-[13.5px] font-medium", FOCUS)}
                  aria-current={active === i ? "location" : undefined}
                >
                  <span className={active === i ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]"}>{l}</span>
                  {active === i && (
                    <motion.span
                      layoutId={`mk-scroll-nav-under-${uid}`}
                      className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                      transition={reduce ? INSTANT : { type: "spring", stiffness: 420, damping: 34 }}
                      aria-hidden="true"
                    />
                  )}
                </button>
              ))}
            </div>
          </LayoutGroup>
          <button
            type="button"
            onClick={onCta}
            className={cn("ml-auto h-9 rounded-full bg-[#0071e3] px-4 text-[13px] font-medium text-white @xl:ml-2", FOCUS)}
          >
            {ctaLabel}
          </button>
        </motion.nav>
      </motion.header>
    </div>
  );
}

/** A tall demo page for the navbar: a hero followed by one placeholder section per link, each marked `data-sec`. */
export function ScrollNavbarDemoPage({
  links = DEFAULT_SCROLL_NAVBAR_LINKS,
  title = "Scroll this page.",
  subtitle = "Watch the bar tuck into a pill, hide as you go down and return when you go up.",
}: {
  links?: string[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <div className="flex h-[440px] flex-col items-center justify-center bg-gradient-to-b from-[#eef5ff] to-white px-6 text-center dark:from-[#0b1a2e] dark:to-black">
        <h3 className="m-0 text-[clamp(32px,6vw,54px)] font-semibold leading-[1.02] tracking-[-0.04em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h3>
        <p className="m-0 mt-3 text-[16px] text-[#6e6e73] dark:text-[#a1a1a6]">{subtitle}</p>
      </div>
      {links.map((l, i) => (
        <section key={l} data-sec="" className="px-6 py-14 sm:px-12">
          <h4 className="m-0 text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{l}</h4>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 3 + (i % 2) * 3 }, (_, k) => (
              <span key={k} className="h-28 rounded-[16px] bg-[#f5f5f7] dark:bg-[#1c1c1e]" />
            ))}
          </div>
        </section>
      ))}
      <div className="h-[200px]" />
    </div>
  );
}
