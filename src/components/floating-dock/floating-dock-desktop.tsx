"use client";

import * as React from "react";
import { LayoutGroup, animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import { usePathname } from "next/navigation";
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
}: FloatingDockDesktopProps) {
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
