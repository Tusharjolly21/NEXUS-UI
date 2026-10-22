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
