"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { FloatingDockItem } from "./types";

function routeActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type FloatingDockMobileProps = {
  items: FloatingDockItem[];
  className?: string;
};

export function FloatingDockMobile({ items, className }: FloatingDockMobileProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const transition = reduceMotion
    ? { duration: 0.12 }
    : ({ type: "spring", stiffness: 420, damping: 34, mass: 0.28 } as const);

  return (
    <div className={cn("fixed inset-x-0 bottom-4 z-[100] flex justify-center md:hidden", className)}>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            aria-label="Close navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/35 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative flex flex-col items-center gap-2">
        <AnimatePresence>
          {open ? (
            <motion.nav
              id="floating-dock-mobile-panel"
              role="menu"
              aria-label="Site navigation"
              initial={reduceMotion ? { opacity: 0, y: 8 } : { opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? { opacity: 0, y: 6 } : { opacity: 0, y: 10, scale: 0.96 }}
              transition={transition}
              className="mb-1 flex min-w-[220px] flex-col gap-1.5 rounded-2xl border border-border/70 bg-background/95 p-2 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/95"
            >
              {items.map((item) => {
                const active = routeActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium outline-none ring-offset-2 ring-offset-background transition-[background-color,color,box-shadow]",
                      "focus-visible:ring-2 focus-visible:ring-primary/60",
                      active
                        ? "bg-primary/12 text-primary shadow-[0_8px_20px_-14px_rgba(14,165,233,0.6)]"
                        : "text-foreground hover:bg-muted/80",
                    )}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground dark:bg-white/5 [&_svg]:size-5">
                      {item.icon}
                    </span>
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </motion.nav>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-expanded={open}
          aria-controls={open ? "floating-dock-mobile-panel" : undefined}
          aria-haspopup="true"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "pointer-events-auto flex size-14 items-center justify-center rounded-full border border-border/70 bg-background/90 text-foreground shadow-lg backdrop-blur-xl outline-none ring-offset-2 ring-offset-background transition-[transform,box-shadow]",
            "focus-visible:ring-2 focus-visible:ring-primary/60 dark:border-white/10 dark:bg-zinc-950/90",
          )}
          whileTap={reduceMotion ? undefined : { scale: 0.94 }}
        >
          {open ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
        </motion.button>
      </div>
    </div>
  );
}
