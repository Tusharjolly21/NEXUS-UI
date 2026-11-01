Add the "Nexus floating dock" component from Nexus UI to my project.

A macOS-style dock: tiles swell under the pointer and push their neighbours aside on springs, a tooltip names each one, and a click bounces the tile like a launching app before a running dot slides under it. Below md it turns into one glass button that springs the tiles up as a stack.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name and folder. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `lucide-react`, `next` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FloatingDock, FloatingDockDesktop, FloatingDockMobile, IconContainer } from "@/components/floating-dock";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/floating-dock/floating-dock-desktop.tsx ---

```tsx
"use client";

import * as React from "react";
import { LayoutGroup, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSound } from "@/lib/ui-sounds";
import { IconContainer } from "./icon-container";
import type { FloatingDockItem } from "./types";

export function routeActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type FloatingDockDesktopProps = {
  items: FloatingDockItem[];
  className?: string;
  /** Render tiles as buttons instead of links. */
  disableLinks?: boolean;
  /** Active item's href. Defaults to matching the current pathname. */
  activeHref?: string;
  /** Called with the item when a tile is clicked. */
  onSelect?: (item: FloatingDockItem) => void;
  /** "fixed" pins it to the bottom of the viewport (hidden below md); "inline" renders it where you put it. */
  position?: "fixed" | "inline";
  /** Sweeps an invisible pointer across the dock and bounces a tile until someone points at it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

/**
 * The desktop dock: a glass shelf of tiles that swell under the pointer,
 * pushing their neighbours aside on springs.
 */
export function FloatingDockDesktop({
  items,
  className = "",
  disableLinks = false,
  activeHref,
  onSelect,
  position = "fixed",
  autoplay = false,
  enableSound = true,
}: FloatingDockDesktopProps) {
  const play = useSound(enableSound);
  const playRef = React.useRef(play);
  const pathname = usePathname();
  const still = useReducedMotion() === true;
  const group = React.useId();
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);
  const shelf = React.useRef<HTMLDivElement>(null);
  const touched = React.useRef(false);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [bounces, setBounces] = React.useState<Record<string, number>>({});
  const routed = items.find((i) => routeActive(pathname, i.href))?.href;
  // Real links follow the route; button tiles (previews, in-app actions) follow the last pick.
  const active = activeHref ?? (disableLinks ? (picked ?? routed) : (routed ?? picked)) ?? null;

  React.useEffect(() => {
    playRef.current = play;
  }, [play]);

  const hrefs = items.map((i) => i.href).join("\u0000");
  React.useEffect(() => {
    if (!autoplay || still) return;
    const order = hrefs ? hrefs.split("\u0000") : [];
    if (order.length === 0) return;
    let run: AnimationPlaybackControls | undefined;
    let wait: ReturnType<typeof setTimeout> | undefined;
    let k = 0;
    const cycle = () => {
      const el = shelf.current;
      if (touched.current || !el) return;
      const r = el.getBoundingClientRect();
      const there = k % 2 === 0;
      run = animate(there ? 0 : 1, there ? 1 : 0, {
        duration: 2.4,
        ease: [0.45, 0, 0.55, 1],
        onUpdate: (t) => {
          if (!touched.current) mouseX.set(r.left + 18 + t * (r.width - 36));
        },
        onComplete: () => {
          if (touched.current) return;
          mouseX.set(Number.POSITIVE_INFINITY);
          const href = order[(k * 3 + 1) % order.length];
          playRef.current.auto("pop");
          setPicked(href);
          setBounces((b) => ({ ...b, [href]: (b[href] ?? 0) + 1 }));
          k++;
          wait = setTimeout(cycle, 1600);
        },
      });
    };
    wait = setTimeout(cycle, 700);
    return () => {
      run?.stop();
      clearTimeout(wait);
    };
  }, [autoplay, still, hrefs, mouseX]);

  const touch = () => {
    touched.current = true;
  };

  const wrap =
    position === "fixed"
      ? "pointer-events-none fixed inset-x-0 bottom-6 z-[100] hidden justify-center md:flex"
      : "relative flex justify-center";

  return (
    <div className={`${wrap} ${className}`}>
      <LayoutGroup id={group}>
        <motion.nav
          ref={shelf}
          aria-label="Dock"
          onPointerMove={(e) => {
            touch();
            if (e.pointerType === "mouse") mouseX.set(e.clientX);
          }}
          onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
          onFocus={(e) => {
            touch();
            const r = (e.target as HTMLElement).getBoundingClientRect();
            mouseX.set(r.left + r.width / 2);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) mouseX.set(Number.POSITIVE_INFINITY);
          }}
          initial={still ? false : { y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-auto relative flex h-[62px] items-end gap-2 rounded-[22px] border border-white/60 bg-white/60 px-2.5 pb-[5px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-20px_rgba(0,0,0,.35)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-[#1c1c1e]/65 dark:shadow-[0_0_0_1px_rgba(255,255,255,.04),0_20px_40px_-20px_rgba(0,0,0,.9)]"
        >
          {items.map((item) => (
            <IconContainer
              key={item.href}
              mouseX={mouseX}
              title={item.title}
              href={item.href}
              icon={item.icon}
              tint={item.tint}
              badge={item.badge}
              active={item.href === active}
              disableLink={disableLinks}
              bounce={bounces[item.href] ?? 0}
              onActivate={() => {
                play("pop");
                touch();
                setPicked(item.href);
                onSelect?.(item);
              }}
            />
          ))}
        </motion.nav>
      </LayoutGroup>
    </div>
  );
}
```

--- components/floating-dock/floating-dock-mobile.tsx ---

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSound } from "@/lib/ui-sounds";
import type { FloatingDockItem } from "./types";

function routeActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type FloatingDockMobileProps = {
  items: FloatingDockItem[];
  className?: string;
  /** Render rows as buttons instead of links. */
  disableLinks?: boolean;
  activeHref?: string;
  onSelect?: (item: FloatingDockItem) => void;
  /** "fixed" pins it bottom-centre (hidden from md up); "inline" renders it where you put it. */
  position?: "fixed" | "inline";
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

/**
 * The small-screen dock: one glass button that springs a stack of tiles up
 * out of itself, each row following the one below it.
 */
export function FloatingDockMobile({ items, className = "", disableLinks = false, activeHref, onSelect, position = "fixed", enableSound = true }: FloatingDockMobileProps) {
  const play = useSound(enableSound);
  const pathname = usePathname();
  const still = useReducedMotion() === true;
  const panelId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [picked, setPicked] = React.useState<string | null>(null);
  const routed = items.find((i) => routeActive(pathname, i.href))?.href;
  const active = activeHref ?? (disableLinks ? (picked ?? routed) : (routed ?? picked)) ?? null;
  const button = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        play("tap", 0.6);
        setOpen(false);
        button.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, play]);

  const wrap = position === "fixed" ? "fixed inset-x-0 bottom-5 z-[100] flex justify-center md:hidden" : "relative flex justify-center";
  const row =
    "flex items-center gap-3 rounded-[18px] border border-white/60 bg-white/80 py-1.5 pl-1.5 pr-4 text-[15px] font-medium tracking-[-0.01em] text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.04),0_12px_24px_-14px_rgba(0,0,0,.4)] backdrop-blur-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:border-white/10 dark:bg-[#1c1c1e]/85 dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff]";

  return (
    <div className={`${wrap} ${className}`}>
      <AnimatePresence>
        {open && position === "fixed" && (
          <motion.button
            type="button"
            aria-label="Close navigation"
            tabIndex={-1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/25 backdrop-blur-[2px]"
            onClick={() => {
              play("tap", 0.6);
              setOpen(false);
            }}
          />
        )}
      </AnimatePresence>
      <div className="relative flex flex-col items-center">
        <AnimatePresence>
          {open && (
            <motion.nav id={panelId} aria-label="Site navigation" className="absolute bottom-full mb-3 flex flex-col items-center gap-2">
              {items.map((item, i) => {
                const fromBottom = items.length - 1 - i;
                const on = item.href === active;
                const body = (
                  <>
                    <span
                      className={`relative flex size-9 items-center justify-center overflow-hidden rounded-[10px] [&_svg]:size-[18px] ${
                        item.tint ? "text-white" : "bg-[#f0f0f3] text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]"
                      }`}
                      aria-hidden
                    >
                      {item.tint && <span className="absolute inset-0" style={{ background: item.tint }} />}
                      <span className="relative">{item.icon}</span>
                    </span>
                    <span className="whitespace-nowrap">{item.title}</span>
                    {on && <span className="ml-auto size-1.5 rounded-full bg-[#0071e3] dark:bg-[#0a84ff]" aria-hidden />}
                  </>
                );
                const pick = () => {
                  play("pop");
                  setPicked(item.href);
                  setOpen(false);
                  onSelect?.(item);
                };
                return (
                  <motion.div
                    key={item.href}
                    className="w-full"
                    initial={still ? { opacity: 0 } : { opacity: 0, y: 24 + fromBottom * 10, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={still ? { opacity: 0 } : { opacity: 0, y: 16 + fromBottom * 6, scale: 0.7, transition: { duration: 0.16, delay: i * 0.015 } }}
                    transition={still ? { duration: 0.12 } : { type: "spring", stiffness: 520, damping: 26, delay: fromBottom * 0.035 }}
                  >
                    {disableLinks ? (
                      <button type="button" aria-pressed={on} onClick={pick} className={`${row} w-full`}>
                        {body}
                      </button>
                    ) : (
                      <Link href={item.href} aria-current={on ? "page" : undefined} onClick={pick} className={`${row} w-full`}>
                        {body}
                      </Link>
                    )}
                  </motion.div>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
        <motion.button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => {
            play("tap", 0.6);
            setOpen((v) => !v);
          }}
          whileTap={still ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 600, damping: 20 }}
          className="relative flex size-14 items-center justify-center rounded-full border border-white/60 bg-white/75 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_16px_32px_-14px_rgba(0,0,0,.45)] backdrop-blur-xl outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:border-white/10 dark:bg-[#1c1c1e]/80 dark:text-[#f5f5f7] dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-black"
        >
          <span className="relative block size-5" aria-hidden>
            {[0, 1, 2, 3].map((k) => (
              <motion.span
                key={k}
                className="absolute block size-[7px] rounded-[2.5px] bg-current"
                style={{ left: k % 2 ? 11 : 2, top: k < 2 ? 2 : 11 }}
                animate={open ? { x: k % 2 ? -4.5 : 4.5, y: k < 2 ? -4.5 + 9 : -4.5, scale: 0, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 26, delay: open ? 0 : 0.04 * k }}
              />
            ))}
            {[45, -45].map((deg) => (
              <motion.span
                key={deg}
                className="absolute left-[1px] top-[9px] block h-[2px] w-[18px] rounded-full bg-current"
                initial={false}
                animate={open ? { rotate: deg, scaleX: 1, opacity: 1 } : { rotate: 0, scaleX: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              />
            ))}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
```

--- components/floating-dock/floating-dock.tsx ---

```tsx
"use client";

import { FloatingDockDesktop } from "./floating-dock-desktop";
import { FloatingDockMobile } from "./floating-dock-mobile";
import type { FloatingDockItem } from "./types";

export type FloatingDockProps = {
  items: FloatingDockItem[];
  desktopClassName?: string;
  mobileClassName?: string;
  /** Render tiles as buttons instead of links (previews, in-app actions). */
  disableLinks?: boolean;
  /** Active item's href. Defaults to matching the current pathname. */
  activeHref?: string;
  /** Called with the item when a tile is clicked. */
  onSelect?: (item: FloatingDockItem) => void;
  /** "fixed" (default) pins it to the bottom of the viewport; "inline" renders it in place. Both switch to the compact menu below md. */
  position?: "fixed" | "inline";
  /** Sweeps an invisible pointer across the dock and bounces a tile until someone points at it. */
  autoplay?: boolean;
  /** Plays interface sounds on interaction. They follow the site-wide sound switch. Autoplay makes the same sounds once the visitor has used the page. */
  enableSound?: boolean;
};

/**
 * A macOS-style dock. Tiles swell under the pointer and push their
 * neighbours aside, a tooltip names each one, and a click bounces the tile
 * like a launching app before a running dot slides under it. Below md it
 * becomes one glass button that springs the tiles up as a stack.
 */
export function FloatingDock({ items, desktopClassName = "", mobileClassName = "", disableLinks, activeHref, onSelect, position = "fixed", autoplay, enableSound }: FloatingDockProps) {
  const desktop = (
    <FloatingDockDesktop
      items={items}
      className={desktopClassName}
      disableLinks={disableLinks}
      activeHref={activeHref}
      onSelect={onSelect}
      position={position}
      autoplay={autoplay}
      enableSound={enableSound}
    />
  );
  const mobile = (
    <FloatingDockMobile
      items={items}
      className={mobileClassName}
      disableLinks={disableLinks}
      activeHref={activeHref}
      onSelect={onSelect}
      position={position}
      enableSound={enableSound}
    />
  );
  if (position === "fixed") {
    return (
      <>
        {desktop}
        {mobile}
      </>
    );
  }
  return (
    <>
      <div className="hidden md:block">{desktop}</div>
      <div className="md:hidden">{mobile}</div>
    </>
  );
}

export type { FloatingDockItem } from "./types";
export { FloatingDockDesktop } from "./floating-dock-desktop";
export { FloatingDockMobile } from "./floating-dock-mobile";
export { IconContainer } from "./icon-container";
```

--- components/floating-dock/icon-container.tsx ---

```tsx
"use client";

import * as React from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Resting tile size, px. */
export const DOCK_BASE = 44;
/** Tile size right under the pointer, px. */
export const DOCK_PEAK = 70;
/** Distance from a tile's centre at which magnification has faded out, px. */
const REACH = 150;

export type IconContainerProps = {
  /** Pointer x in client coordinates; Infinity when the pointer is away. */
  mouseX: MotionValue<number>;
  title: string;
  icon: React.ReactNode;
  href: string;
  tint?: string;
  badge?: number | string;
  active?: boolean;
  /** Render a button instead of a link (for previews and in-app actions). */
  disableLink?: boolean;
  /** Increment to make the tile bounce, as if the app were launching. */
  bounce?: number;
  /** Called when the tile is clicked or activated with the keyboard. */
  onActivate?: () => void;
};

/**
 * One dock tile. It grows with the pointer's distance (its real width, so the
 * neighbours make room), shows a tooltip, and on click bounces like a
 * launching app: a little gravity sim with a squash every time it lands.
 */
export function IconContainer({
  mouseX,
  title,
  icon,
  href,
  tint,
  badge,
  active = false,
  disableLink = false,
  bounce = 0,
  onActivate,
}: IconContainerProps) {
  const still = useReducedMotion() === true;
  const ref = React.useRef<HTMLDivElement>(null);
  const [tip, setTip] = React.useState(false);

  const target = useTransform(mouseX, (x) => {
    const el = ref.current;
    if (still || !el || !Number.isFinite(x)) return DOCK_BASE;
    const r = el.getBoundingClientRect();
    const d = Math.abs(x - (r.left + r.width / 2));
    const t = Math.max(0, 1 - d / REACH);
    // Cosine falloff: a rounded hill, like the real dock.
    return DOCK_BASE + (DOCK_PEAK - DOCK_BASE) * (0.5 - 0.5 * Math.cos(Math.PI * t));
  });
  const size = useSpring(target, { stiffness: 420, damping: 30, mass: 0.12 });
  const radius = useTransform(size, (s) => s * 0.27);
  const glyph = useTransform(size, (s) => s * 0.5);

  // Launch bounce: y is integrated by hand; the squash springs back with a wobble.
  const hop = useMotionValue(0);
  const squash = useSpring(0, { stiffness: 700, damping: 11 });
  const sy = useTransform(squash, (q) => 1 - q * 0.22);
  const sx = useTransform(squash, (q) => 1 + q * 0.16);

  const launch = React.useCallback(() => {
    if (still) return () => {};
    let raf = 0;
    let y = 0;
    let v = -620;
    let last = performance.now();
    let landings = 0;
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      v += 2900 * dt;
      y += v * dt;
      if (y >= 0) {
        y = 0;
        squash.jump(Math.min(1, Math.abs(v) / 650));
        squash.set(0);
        v = -v * 0.42;
        landings++;
        if (Math.abs(v) < 140 || landings > 3) {
          hop.set(0);
          return;
        }
      }
      hop.set(y);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [still, hop, squash]);

  const stopRef = React.useRef<() => void>(() => {});
  React.useEffect(() => {
    if (bounce === 0) return;
    stopRef.current();
    stopRef.current = launch();
  }, [bounce, launch]);
  React.useEffect(() => () => stopRef.current(), []);

  const activate = () => {
    stopRef.current();
    stopRef.current = launch();
    onActivate?.();
  };

  const tileClass = `relative flex items-center justify-center overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-[#0a84ff] dark:focus-visible:ring-offset-[#1c1c1e] ${
    tint
      ? "text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_6px_14px_-8px_rgba(0,0,0,.45)]"
      : "bg-white text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.06),0_6px_14px_-8px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_6px_14px_-8px_rgba(0,0,0,.8)]"
  }`;
  const inner = (
    <>
      {tint && <span aria-hidden className="absolute inset-0" style={{ background: tint }} />}
      {tint && <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />}
      <motion.span aria-hidden className="relative flex items-center justify-center [&_svg]:size-full [&_svg]:stroke-[1.75]" style={{ width: glyph, height: glyph }}>
        {icon}
      </motion.span>
    </>
  );
  const handlers = {
    onPointerEnter: () => setTip(true),
    onPointerLeave: () => setTip(false),
    onFocus: () => setTip(true),
    onBlur: () => setTip(false),
  };

  return (
    <motion.div ref={ref} className="relative flex shrink-0 flex-col items-center justify-end" style={{ width: size }}>
      <AnimatePresence>
        {tip && (
          <motion.span
            key="tip"
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-3 whitespace-nowrap rounded-[8px] bg-[#1d1d1f]/90 px-2.5 py-1 text-[12px] font-medium text-white shadow-[0_8px_20px_-8px_rgba(0,0,0,.5)] backdrop-blur-md dark:bg-[#f5f5f7]/95 dark:text-[#1d1d1f]"
            style={{ x: "-50%" }}
          >
            {title}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div className="origin-bottom" style={{ y: hop }}>
        <motion.div className="origin-bottom" style={{ scaleX: sx, scaleY: sy }}>
          {disableLink ? (
            <motion.button
              type="button"
              aria-label={title}
              aria-pressed={active}
              onClick={activate}
              className={tileClass}
              style={{ width: size, height: size, borderRadius: radius }}
              {...handlers}
            >
              {inner}
            </motion.button>
          ) : (
            <motion.div style={{ width: size, height: size, borderRadius: radius }} className="relative">
              <Link
                href={href}
                aria-label={title}
                aria-current={active ? "page" : undefined}
                onClick={activate}
                className={`${tileClass} size-full rounded-[inherit]`}
                {...handlers}
              >
                {inner}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      {badge !== undefined && badge !== "" && (
        <motion.span
          aria-label={`${badge} new`}
          className="absolute right-0 top-0 z-[1] flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[11px] font-semibold tabular-nums text-white shadow-[0_0_0_2px_rgba(255,255,255,.9)] dark:shadow-[0_0_0_2px_#1c1c1e]"
          style={{ y: hop, x: "25%" }}
        >
          {badge}
        </motion.span>
      )}
      <span className="mt-1 flex h-1 items-center justify-center" aria-hidden>
        {active && (
          <motion.span
            layoutId="floating-dock-running"
            className="block size-1 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          />
        )}
      </span>
    </motion.div>
  );
}
```

--- components/floating-dock/index.ts ---

```ts
export type { FloatingDockItem, FloatingDockProps } from "./floating-dock";
export {
  FloatingDock,
  FloatingDockDesktop,
  FloatingDockMobile,
  IconContainer,
} from "./floating-dock";
```

--- components/floating-dock/types.ts ---

```ts
import type * as React from "react";

export type FloatingDockItem = {
  /** Shown in the tooltip and used as the accessible name. */
  title: string;
  /** Usually a lucide icon. It is sized to the tile for you. */
  icon: React.ReactNode;
  href: string;
  /** Tile background, any CSS colour or gradient. With a tint the icon turns white. */
  tint?: string;
  /** Small red counter on the tile. */
  badge?: number | string;
};
```

--- components/floating-dock.tsx ---

```tsx
/** Re-export shim for `@/components/floating-dock`. */
export type { FloatingDockItem, FloatingDockProps } from "./floating-dock/floating-dock";
export {
  FloatingDock,
  FloatingDockDesktop,
  FloatingDockMobile,
  IconContainer,
} from "./floating-dock/floating-dock";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.5;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * 0.5;
}
```
