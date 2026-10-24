# Cursor Card

Add the "Cursor Card" component from Nexus UI to my project.

An inline link that lifts a preview card out of the text on hover or keyboard focus. The card rises with a stretch and settles, leans and slides as the pointer moves along the link, and draws its own cover from the title and site when no image is given. Also includes Cursor Card: A preview card trails your cursor through a project list, leans into your movement and swaps content row to row without disappearing.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `next`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { LinkPreview, CursorCard, CURSOR_CARD_ITEMS } from "@/components/link-preview";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/link-preview/cursor-card.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export interface CursorCardItem {
  /** Row title, set large. */
  title: string;
  /** Short kind label on the right of the row. */
  kind: string;
  /** Year or date shown after the kind. */
  year: string;
  /** The two colours of the card's cover gradient. */
  colors: [string, string];
  /** Where the row links to. Leave unset (or "#") for a row that only drives the card. */
  href?: string;
}

export interface CursorCardProps {
  /** The rows of the list. Defaults to six invented projects. */
  items?: CursorCardItem[];
  /** Text of the call to action at the foot of the card. */
  ctaLabel?: string;
  /** Moves the card down the list by itself, row by row, until someone points at the list or focuses a row. Never runs under reduced motion. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export const CURSOR_CARD_ITEMS: CursorCardItem[] = [
  { title: "Orbitly", kind: "Brand and site", year: "2026", colors: ["#0a84ff", "#5e5ce6"] },
  { title: "Wayfolk", kind: "Booking app", year: "2025", colors: ["#ff9f0a", "#ff375f"] },
  { title: "Tallyford", kind: "Pricing page", year: "2025", colors: ["#30d158", "#0a84ff"] },
  { title: "Velaworks", kind: "Design system", year: "2024", colors: ["#bf5af2", "#ff375f"] },
  { title: "Quadrille", kind: "Dashboard", year: "2024", colors: ["#64d2ff", "#30d158"] },
  { title: "Relaymint", kind: "Onboarding", year: "2023", colors: ["#1d1d1f", "#5e5ce6"] },
];

const FOCUS = "focus-visible:rounded-[8px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";
const CARD_W = 200;

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/**
 * A preview card that follows the cursor around a project list. It trails a
 * little behind on a spring, leans into the direction you move, and swaps its
 * contents as you pass from row to row without disappearing in between.
 * On touch, tapping a row pins the card beside it (a second tap follows the
 * link). Focusing a row with the keyboard pins the card there too. Under
 * reduced motion the card sits exactly under the pointer and only fades.
 */
export function CursorCard({ items = CURSOR_CARD_ITEMS, ctaLabel = "View case study", autoplay = false, className }: CursorCardProps) {
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const lastPointer = useRef("mouse");
  const [hot, setHot] = useState<number | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 28, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 300, damping: 28, mass: 0.6 });
  const x = reduce ? mx : sx;
  const y = reduce ? my : sy;
  const vx = useVelocity(x);
  const rotate = useTransform(vx, (v) => Math.max(-12, Math.min(12, v / 90)));
  const active = useDemoActive(box, autoplay && !reduce);

  /** Keeps the card's centre far enough from the sides that it never spills out of the list. */
  const clampX = (v: number) => {
    const w = box.current?.offsetWidth ?? 0;
    const half = Math.min(CARD_W / 2, w / 2);
    return Math.max(half, Math.min(w - half, v));
  };
  const pinTo = (li: HTMLElement | null) => {
    const el = box.current;
    if (!el || !li) return;
    mx.set(clampX(el.offsetWidth * 0.62));
    my.set(li.offsetTop + li.offsetHeight / 2);
  };

  // Demo: the card visits each row in turn.
  useEffect(() => {
    if (!autoplay || reduce || !active) return;
    let k = 0;
    const id = window.setInterval(() => {
      const el = box.current;
      if (touched.current || !el) return;
      const rows = el.querySelectorAll<HTMLElement>("li");
      const i = k++ % items.length;
      const r = rows[i];
      if (!r) return;
      setHot(i);
      const half = Math.min(CARD_W / 2, el.offsetWidth / 2);
      const target = Math.max(half, Math.min(el.offsetWidth - half, el.offsetWidth * (0.45 + 0.3 * Math.sin(k))));
      animate(mx, target, { duration: 0.7, ease: "easeInOut" });
      animate(my, r.offsetTop + r.offsetHeight / 2, { duration: 0.7, ease: "easeInOut" });
    }, 1100);
    return () => window.clearInterval(id);
  }, [autoplay, reduce, active, items.length, mx, my]);

  const w = hot !== null ? items[hot] : null;
  return (
    <div
      ref={box}
      className={cn("relative w-full max-w-[620px]", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        touched.current = true;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(clampX(e.clientX - r.left));
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setHot(null);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHot(null);
      }}
    >
      <ul className="m-0 list-none p-0">
        {items.map((it, i) => {
          const dimmed = hot !== null && hot !== i;
          const real = !!it.href && it.href !== "#";
          return (
            <li key={it.title}>
              <a
                href={it.href ?? "#"}
                onPointerDown={(e) => {
                  lastPointer.current = e.pointerType;
                }}
                onClick={(e) => {
                  touched.current = true;
                  // A row with no destination only drives the card; with one, the first tap on touch pins the card and the second follows the link.
                  if (!real || (lastPointer.current !== "mouse" && hot !== i)) {
                    e.preventDefault();
                    pinTo(e.currentTarget.parentElement);
                    setHot(i);
                  }
                }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setHot(i);
                }}
                onFocus={(e) => {
                  touched.current = true;
                  pinTo(e.currentTarget.parentElement);
                  setHot(i);
                }}
                className={cn("flex items-baseline justify-between gap-4 border-b border-black/[.07] py-5 no-underline dark:border-white/[.1]", FOCUS)}
              >
                <motion.span
                  className={cn("text-[clamp(26px,5vw,40px)] font-semibold tracking-[-0.035em] transition-colors duration-200", dimmed ? "text-[#c7c7cc] dark:text-[#48484a]" : "text-[#1d1d1f] dark:text-[#f5f5f7]")}
                  animate={{ x: hot === i && !reduce ? 10 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 26 }}
                >
                  {it.title}
                </motion.span>
                <span className="flex-none text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {it.kind} &middot; {it.year}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <AnimatePresence>
        {w && (
          <motion.div
            className="pointer-events-none absolute left-0 top-0 z-10 overflow-hidden rounded-[18px] bg-white p-2 shadow-[0_24px_50px_-18px_rgba(0,0,0,.45),0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:shadow-[0_24px_50px_-18px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)]"
            style={{ width: CARD_W, x, y, rotate: reduce ? 0 : rotate, translateX: "-50%", translateY: "-50%" }}
            initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 400, damping: 26 }}
            aria-hidden="true"
          >
            <div className="relative h-[120px] overflow-hidden rounded-[12px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={w.title}
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(150deg, ${w.colors[0]}, ${w.colors[1]})` }}
                  initial={reduce ? { opacity: 0 } : { y: "100%" }}
                  animate={reduce ? { opacity: 1 } : { y: 0 }}
                  exit={reduce ? { opacity: 0 } : { y: "-40%", opacity: 0.4 }}
                  transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 300, damping: 30 }}
                >
                  <span className="absolute bottom-3 left-3 text-[22px] font-semibold tracking-[-0.03em] text-white">{w.title}</span>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between px-1.5 pb-1 pt-2 text-[12px]">
              <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{ctaLabel}</span>
              <span className="text-[#0071e3] dark:text-[#0a84ff]">&rarr;</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

--- components/link-preview/index.ts ---

```ts
export { LinkPreview } from "./link-preview";
export type { LinkPreviewProps } from "./link-preview";
export { CursorCard, CURSOR_CARD_ITEMS } from "./cursor-card";
export type { CursorCardProps, CursorCardItem } from "./cursor-card";
```

--- components/link-preview/link-preview.tsx ---

```tsx
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";
import { cn } from "@/lib/utils";

export type LinkPreviewProps = {
  /** Destination: an internal path (/about) or a full URL. */
  href: string;
  /** Picture for the card. Without one the card draws a cover from the title and site name. */
  image?: string;
  /** Card heading. */
  title?: string;
  /** One line under the heading. */
  description?: string;
  /** The link text. */
  children: React.ReactNode;
  /** Card width in px. */
  width?: number;
  /** Height of the picture area in px. */
  height?: number;
  /** Wait before the card rises, in seconds. */
  delay?: number;
  /** Extra classes for the link. */
  className?: string;
  /** Extra classes for the floating card. */
  previewClassName?: string;
  /** Opens the link in a new tab. */
  openInNewTab?: boolean;
  /** Controls the card from outside. Leave unset to open on hover and focus. */
  open?: boolean;
  /** Opens and closes the card on its own until someone hovers or focuses the link. */
  autoplay?: boolean;
};

function hostOf(href: string) {
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** Stable hue from a string so a generated cover always looks the same for the same link. */
function hueOf(s: string) {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

const noop = () => () => {};
const useMounted = () => React.useSyncExternalStore(noop, () => true, () => false);

/** Rise: the card grows up out of the link, stretched, and settles with an overshoot. */
const RISE = { type: "spring" as const, stiffness: 380, damping: 17, mass: 0.7 };

/**
 * An inline link that lifts a preview card out of the text when you hover or
 * focus it. The card rises with a stretch and settles, then leans and slides
 * as the pointer moves along the link and swings back when it stops. Without
 * an image it draws its own cover.
 */
export function LinkPreview({
  href,
  image,
  title,
  description,
  children,
  width = 300,
  height = 168,
  delay = 0.08,
  className = "",
  previewClassName = "",
  openInNewTab = true,
  open,
  autoplay = false,
}: LinkPreviewProps) {
  const still = useReducedMotion() === true;
  const mounted = useMounted();
  const anchor = React.useRef<HTMLAnchorElement>(null);
  const touched = React.useRef(false);
  const [hover, setHover] = React.useState(false);
  const [demo, setDemo] = React.useState(false);
  const [below, setBelow] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const shown = open ?? (hover || demo);

  const ax = useMotionValue(0);
  const ay = useMotionValue(0);
  const px = useMotionValue(0);
  const pv = useVelocity(px);
  const shift = useSpring(useTransform(px, [-1, 1], [-14, 14]), { stiffness: 160, damping: 18 });
  const lean = useSpring(useTransform(pv, [-6, 0, 6], [-7, 0, 7]), { stiffness: 220, damping: 11 });

  const host = hostOf(href);
  const hue = hueOf(host || title || href);
  const art = !image || failed;

  // Track the link while the card is up so it stays put on scroll and resize.
  React.useEffect(() => {
    if (!shown) return;
    let raf = 0;
    const tick = () => {
      const el = anchor.current;
      if (el) {
        const r = el.getBoundingClientRect();
        // Centre on the link, but keep the whole card on screen (links near a phone's edge).
        const half = width / 2 + 8;
        const centre = r.left + r.width / 2;
        ax.set(window.innerWidth > half * 2 ? Math.min(window.innerWidth - half, Math.max(half, centre)) : window.innerWidth / 2);
        ay.set(below ? r.bottom + 12 : r.top - 12);
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [shown, below, ax, ay, width]);

  // Autoplay: lift the card, sweep the lean across, drop it, repeat.
  React.useEffect(() => {
    if (!autoplay || open !== undefined) return;
    let on = false;
    let sweep = 0;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      on = !on;
      if (on) {
        const r = anchor.current?.getBoundingClientRect();
        setBelow(!!r && r.top < height + 96);
      }
      setDemo(on);
      sweep++;
      px.set(on ? (sweep % 4 === 1 ? 0.8 : -0.8) : 0);
    }, 2200);
    return () => window.clearInterval(t);
  }, [autoplay, open, px, height]);

  const show = () => {
    touched.current = true;
    setDemo(false);
    const r = anchor.current?.getBoundingClientRect();
    setBelow(!!r && r.top < height + 96);
    setHover(true);
  };
  const hide = () => {
    setHover(false);
    px.set(0);
  };

  const card = (
    <AnimatePresence>
      {shown && (
        <motion.div key="lp" className="pointer-events-none fixed left-0 top-0 z-[9999]" style={{ x: ax, y: ay }} aria-hidden="true">
          <div style={{ width, transform: `translate(-50%, ${below ? "0" : "-100%"})` }}>
            <motion.div
              style={{ x: shift, rotate: lean, originX: 0.5, originY: below ? 0 : 1 }}
              initial={still ? { opacity: 0 } : { opacity: 0, scaleY: 0.4, scaleX: 0.8, y: below ? -10 : 10 }}
              animate={{ opacity: 1, scaleY: 1, scaleX: 1, y: 0, transition: { ...RISE, delay, opacity: { duration: 0.12, delay } } }}
              exit={{ opacity: 0, scaleY: 0.7, scaleX: 0.9, y: below ? -6 : 6, transition: { duration: 0.14 } }}
              className={cn(`overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-24px_rgba(0,0,0,.45)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_48px_-20px_rgba(0,0,0,.9)]`, previewClassName)}
            >
              <div className="relative overflow-hidden" style={{ height }}>
                {art ? (
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 92% 66%), hsl(${(hue + 48) % 360} 84% 48%))` }}
                    initial={still ? false : { scale: 1.18 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 120, damping: 20, delay }}
                  >
                    <span className="absolute -right-6 -top-10 h-36 w-36 rounded-full bg-white/20" />
                    <span className="absolute -bottom-14 left-6 h-28 w-28 rounded-full bg-black/10" />
                    <span className="absolute bottom-4 left-4 right-4 truncate text-[22px] font-semibold leading-none tracking-[-0.03em] text-white">{title ?? host}</span>
                  </motion.div>
                ) : (
                  <>
                    {!loaded && <div className="absolute inset-0 animate-pulse bg-[#f0f0f3] dark:bg-[#2c2c2e]" />}
                    <motion.img
                      src={image}
                      alt=""
                      draggable={false}
                      onLoad={() => setLoaded(true)}
                      onError={() => setFailed(true)}
                      className="h-full w-full object-cover"
                      initial={still ? false : { scale: 1.15, filter: "blur(8px)" }}
                      animate={{ scale: 1, filter: loaded ? "blur(0px)" : "blur(8px)" }}
                      transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    />
                  </>
                )}
              </div>
              {(title || description || host) && (
                <div className="px-4 pb-3.5 pt-3">
                  {title && <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</p>}
                  {description && <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-[#6e6e73] dark:text-[#a1a1a6]">{description}</p>}
                  {host && <p className="mt-1.5 text-[11px] text-[#86868b] dark:text-[#98989d]">{host}</p>}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Link
        ref={anchor}
        href={href}
        {...(openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        aria-description={title ? `Preview: ${title}${description ? `. ${description}` : ""}` : undefined}
        onPointerEnter={(e) => e.pointerType !== "touch" && show()}
        onPointerLeave={(e) => e.pointerType !== "touch" && hide()}
        onPointerMove={(e) => {
          const el = anchor.current;
          if (!el || e.pointerType === "touch") return;
          const r = el.getBoundingClientRect();
          px.set(((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1);
        }}
        onClick={(e) => {
          // First tap on touch screens shows the card; the second follows the link.
          if (window.matchMedia("(hover: none)").matches && !hover) {
            e.preventDefault();
            show();
          }
        }}
        onFocus={show}
        onBlur={hide}
        onKeyDown={(e) => e.key === "Escape" && hide()}
        className={cn(`rounded-[4px] font-medium text-[#0071e3] underline decoration-[#0071e3]/35 decoration-[1.5px] underline-offset-[3px] outline-none transition-colors hover:decoration-[#0071e3] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:text-[#2997ff] dark:decoration-[#2997ff]/40 dark:hover:decoration-[#2997ff] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black`, className)}
      >
        {children}
      </Link>
      {mounted && createPortal(card, document.body)}
    </>
  );
}

export default LinkPreview;
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
