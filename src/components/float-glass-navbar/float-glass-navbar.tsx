"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent as RMouseEvent, type ReactNode, type RefObject } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

export interface FloatGlassNavLink {
  label: string;
  href: string;
}

export interface FloatGlassNavbarProps {
  /** Wordmark next to the logo. */
  brand?: string;
  /** Your logo. Defaults to a drawn mark. */
  logo?: ReactNode;
  links?: FloatGlassNavLink[];
  /** Controlled active link. */
  activeHref?: string;
  /** Active link when uncontrolled. Defaults to the first link. */
  defaultActiveHref?: string;
  /** Call-to-action pill on the right. `null` hides it. */
  cta?: { label: string; href?: string; onClick?: () => void } | null;
  /** Called with the href when a link is clicked. When set, the browser's own navigation is prevented so you can route yourself. */
  onNavigate?: (href: string) => void;
  /** Force the compact pill. Leave undefined to condense once the page (or `scrollContainerRef`) scrolls past `condenseAt`. */
  condensed?: boolean;
  /** Scroll container to watch instead of the window. */
  scrollContainerRef?: RefObject<HTMLElement | null>;
  /** Scroll distance in px after which the bar condenses. */
  condenseAt?: number;
  /** "sticky" (default) pins it to the top of its scroll parent, "fixed" to the viewport, "static" leaves it in flow. */
  position?: "sticky" | "fixed" | "static";
  /** Tours the links and breathes between wide and compact until someone points at it. */
  autoplay?: boolean;
  className?: string;
}

export const DEFAULT_NAV_LINKS: FloatGlassNavLink[] = [
  { label: "Overview", href: "#overview" },
  { label: "Components", href: "#components" },
  { label: "Templates", href: "#templates" },
  { label: "Pricing", href: "#pricing" },
];

function Mark() {
  return (
    <span
      aria-hidden
      className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
      style={{ background: "linear-gradient(135deg,#5ac8fa 0%,#0071e3 55%,#5e5ce6 100%)" }}
    >
      <svg viewBox="0 0 20 20" className="size-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
        <path d="M5 14.5V5.5l10 9V5.5" />
      </svg>
    </span>
  );
}

/**
 * A floating glass navigation bar. A soft lens slides under the link you point
 * at, thinning out as it travels and stretching as it lands, then glides home
 * to the active link. Scroll past `condenseAt` and the bar tucks itself into a
 * compact pill; on narrow screens the links fold into a menu.
 */
export function FloatGlassNavbar({
  brand = "Nexus",
  logo,
  links = DEFAULT_NAV_LINKS,
  activeHref,
  defaultActiveHref,
  cta = { label: "Get started" },
  onNavigate,
  condensed,
  scrollContainerRef,
  condenseAt = 24,
  position = "sticky",
  autoplay = false,
  className = "",
}: FloatGlassNavbarProps) {
  const still = useReducedMotion() === true;
  const [internal, setInternal] = useState(defaultActiveHref ?? links[0]?.href ?? "");
  const active = activeHref ?? internal;
  const [scrolled, setScrolled] = useState(false);
  const [demoCompact, setDemoCompact] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const compact = condensed ?? demoCompact ?? scrolled;
  // Measured: whether the links fit, the bar's compact width, and the wide width.
  const [fit, setFit] = useState({ fold: false, tight: 560 });
  const rootEl = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLDivElement>(null);
  const brandMeter = useRef<HTMLSpanElement>(null);

  const { scrollY } = useScroll(scrollContainerRef ? { container: scrollContainerRef } : undefined);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > condenseAt));

  const list = useRef<HTMLDivElement>(null);
  const linkEls = useRef<Map<string, HTMLAnchorElement>>(new Map());
  const touched = useRef(false);
  const spring = still ? { stiffness: 2000, damping: 120 } : { stiffness: 420, damping: 30, mass: 0.8 };
  const lensX = useSpring(0, spring);
  const lensW = useSpring(0, spring);
  const lensO = useSpring(0, { stiffness: 300, damping: 30 });
  const speed = useVelocity(lensX);
  const lensScaleY = useTransform(speed, (v) => (still ? 1 : 1 - Math.min(Math.abs(v) / 3200, 0.32)));

  const moveLens = (href: string | null, jump = false) => {
    const el = href ? linkEls.current.get(href) : undefined;
    if (!el) {
      lensO.set(0);
      return;
    }
    if (jump) {
      lensX.jump(el.offsetLeft);
      lensW.jump(el.offsetWidth);
    } else {
      lensX.set(el.offsetLeft);
      lensW.set(el.offsetWidth);
    }
    lensO.set(1);
  };
  const moveLensRef = useRef(moveLens);
  useLayoutEffect(() => {
    moveLensRef.current = moveLens;
  });

  // Park the lens on the active link after mount, after every resize and whenever the bar changes width.
  useLayoutEffect(() => {
    moveLensRef.current(active, true);
  }, [active, links.length]);
  useEffect(() => {
    const el = list.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => moveLensRef.current(active, true));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  const hrefs = links.map((l) => l.href).join("\u0000");
  const ctaLabel = cta?.label ?? "";
  useEffect(() => {
    const r = rootEl.current;
    const m = meter.current;
    if (!r || !m || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const need = m.scrollWidth + 4;
      const brandW = brandMeter.current?.offsetWidth ?? 0;
      const avail = r.clientWidth - 24;
      const fold = avail < need;
      const tight = Math.round(fold ? Math.min(avail, 280) : Math.min(avail, need - brandW));
      setFit((f) => (f.fold === fold && f.tight === tight ? f : { fold, tight }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(r);
    return () => ro.disconnect();
  }, [hrefs, ctaLabel, brand]);
  useEffect(() => {
    if (!autoplay) return;
    const order = hrefs ? hrefs.split("\u0000") : [];
    if (order.length === 0) return;
    let k = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        setDemoCompact(null);
        moveLensRef.current(active);
        return;
      }
      k++;
      const n = order.length + 2;
      const step = k % (n * 2);
      if (step === n) setDemoCompact(true);
      if (step === 0) setDemoCompact(false);
      const slot = step % n;
      moveLensRef.current(slot < order.length ? order[slot] : active);
    }, 1100);
    return () => window.clearInterval(t);
  }, [autoplay, hrefs, active]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const touch = () => {
    if (touched.current) return;
    touched.current = true;
    setDemoCompact(null);
  };

  const go = (href: string, e: RMouseEvent) => {
    touch();
    if (onNavigate) {
      e.preventDefault();
      onNavigate(href);
    }
    setInternal(href);
    setOpen(false);
  };

  const pos = position === "fixed" ? "fixed inset-x-0 top-0 z-50" : position === "sticky" ? "sticky top-0 z-40" : "relative";
  const bar = { type: "spring", stiffness: 260, damping: 24 } as const;
  const focus = "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]";

  return (
    <div ref={rootEl} className={`w-full px-3 pt-3 ${pos} ${className}`} onPointerEnter={touch} onFocus={touch}>
      {/* Invisible copy of the full bar, measured to decide whether the links fit. */}
      <div aria-hidden className="pointer-events-none invisible absolute inset-0 overflow-hidden">
      <div ref={meter} className="absolute left-0 top-0 flex w-max items-center gap-1 whitespace-nowrap pl-2 pr-1.5">
        <span className="flex items-center gap-2 pr-2">
          <span className="size-7" />
          <span ref={brandMeter} className="pr-2 text-[15px] font-semibold tracking-[-0.02em]">
            {brand}
          </span>
        </span>
        <span className="flex">
          {links.map((l) => (
            <span key={l.href} className="px-[11px] py-1.5 text-[13.5px] font-medium tracking-[-0.01em]">
              {l.label}
            </span>
          ))}
        </span>
        {cta && (
          <span className="flex items-center gap-1 pl-4 pr-3 text-[13px] font-semibold">
            {cta.label}
            <span className="inline-block size-3.5" />
          </span>
        )}
      </div>
      </div>
      <motion.nav
        aria-label="Main"
        initial={still ? false : { y: -16, opacity: 0, scale: 0.97 }}
        animate={{ y: compact ? 4 : 0, opacity: 1, scale: 1, maxWidth: compact ? fit.tight : 920 }}
        transition={still ? { duration: 0 } : { ...bar, opacity: { duration: 0.3 } }}
        className={`relative mx-auto flex w-full items-center gap-1 rounded-full border border-black/[.06] bg-white/70 py-1.5 pl-2 pr-1.5 backdrop-blur-xl backdrop-saturate-150 transition-shadow duration-300 dark:border-white/10 dark:bg-[#1c1c1e]/70 ${
          compact
            ? "shadow-[0_0_0_1px_rgba(0,0,0,.03),0_18px_40px_-18px_rgba(0,0,0,.35)] dark:shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)]"
            : "shadow-[0_0_0_1px_rgba(0,0,0,.02),0_10px_30px_-22px_rgba(0,0,0,.3)] dark:shadow-[0_10px_30px_-22px_rgba(0,0,0,.8)]"
        }`}
      >
        <a href={links[0]?.href ?? "#"} onClick={(e) => links[0] && go(links[0].href, e)} className={`flex shrink-0 items-center gap-2 rounded-full pr-2 ${focus}`}>
          {logo ?? <Mark />}
          <motion.span
            initial={false}
            animate={{ width: compact ? 0 : "auto", opacity: compact ? 0 : 1 }}
            transition={still ? { duration: 0 } : bar}
            className="overflow-hidden whitespace-nowrap text-[15px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]"
          >
            {brand}
          </motion.span>
          {compact && <span className="sr-only">{brand}</span>}
        </a>

        <div
          ref={list}
          className={`relative mx-auto min-w-0 items-center ${fit.fold ? "hidden" : "flex"}`}
          onPointerLeave={() => moveLens(active)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) moveLens(active);
          }}
        >
          <motion.span
            aria-hidden
            className="absolute left-0 top-0 h-full rounded-full bg-black/[.06] dark:bg-white/[.1]"
            style={{ x: lensX, width: lensW, opacity: lensO, scaleY: lensScaleY }}
          />
          {links.map((l) => {
            const on = l.href === active;
            return (
              <a
                key={l.href}
                ref={(el) => {
                  if (el) linkEls.current.set(l.href, el);
                  else linkEls.current.delete(l.href);
                }}
                href={l.href}
                aria-current={on ? "page" : undefined}
                onPointerEnter={() => moveLens(l.href)}
                onFocus={() => moveLens(l.href)}
                onClick={(e) => go(l.href, e)}
                className={`relative whitespace-nowrap rounded-full px-[11px] py-1.5 text-[13.5px] font-medium tracking-[-0.01em] transition-colors ${focus} ${
                  on ? "text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]"
                }`}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        <div className={`flex shrink-0 items-center gap-1 ${fit.fold ? "ml-auto" : ""}`}>
          {cta && (
            <motion.a
              href={cta.href ?? "#"}
              onClick={(e) => {
                touch();
                if (!cta.href) e.preventDefault();
                cta.onClick?.();
              }}
              whileHover={still ? undefined : "hover"}
              whileTap={still ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              className={`group inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#0071e3] py-2 pl-4 pr-3 text-[13px] font-semibold text-white shadow-[0_6px_16px_-8px_rgba(0,113,227,.8)] hover:bg-[#0077ed] dark:bg-[#0a84ff] ${focus} focus-visible:ring-offset-2 dark:focus-visible:ring-offset-[#1c1c1e]`}
            >
              {cta.label}
              <motion.svg
                variants={{ hover: { x: 3 } }}
                transition={{ type: "spring", stiffness: 600, damping: 15 }}
                viewBox="0 0 16 16"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 3.5 10.5 8 6 12.5" />
              </motion.svg>
            </motion.a>
          )}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => {
              touch();
              setOpen((o) => !o);
            }}
            className={`flex size-9 items-center justify-center rounded-full text-[#1d1d1f] hover:bg-black/[.05] dark:text-[#f5f5f7] dark:hover:bg-white/10 ${fit.fold ? "" : "hidden"} ${focus}`}
          >
            <span className="relative block h-3 w-4" aria-hidden>
              <motion.span
                className="absolute left-0 top-0 block h-[1.75px] w-4 rounded-full bg-current"
                animate={open ? { y: 5, rotate: 45 } : { y: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              />
              <motion.span
                className="absolute left-0 top-0 block h-[1.75px] w-4 rounded-full bg-current"
                animate={open ? { y: 5, rotate: -45 } : { y: 9, rotate: 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              />
            </span>
          </button>
        </div>

        <AnimatePresence>
          {open && fit.fold && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={still ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 30 }}
              className="absolute inset-x-0 top-[calc(100%+8px)] origin-top rounded-[22px] border border-black/[.06] bg-white/90 p-2 shadow-[0_0_0_1px_rgba(0,0,0,.03),0_24px_48px_-24px_rgba(0,0,0,.4)] backdrop-blur-xl dark:border-white/10 dark:bg-[#1c1c1e]/90"
            >
              {links.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => go(l.href, e)}
                  aria-current={l.href === active ? "page" : undefined}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={still ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30, delay: i * 0.035 }}
                  className={`flex items-center justify-between rounded-[14px] px-3.5 py-2.5 text-[15px] font-medium tracking-[-0.01em] text-[#1d1d1f] hover:bg-black/[.04] dark:text-[#f5f5f7] dark:hover:bg-white/[.06] ${focus}`}
                >
                  {l.label}
                  {l.href === active && <span className="size-1.5 rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" aria-hidden />}
                </motion.a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}

/** Older name for the same component. */
export const FloatingNav = FloatGlassNavbar;
