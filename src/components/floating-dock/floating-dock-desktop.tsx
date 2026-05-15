"use client";

import * as React from "react";
import { motion, useMotionValue, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { IconContainer } from "./icon-container";
import type { FloatingDockItem } from "./types";

function routeActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type FloatingDockDesktopProps = {
  items: FloatingDockItem[];
  className?: string;
  disableLinks?: boolean;
};

export function FloatingDockDesktop({ items, className, disableLinks = false }: FloatingDockDesktopProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion() === true;
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY);

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    mouseX.set(e.clientX);
  }

  function onLeave() {
    mouseX.set(Number.POSITIVE_INFINITY);
  }

  return (
    <div
      className={cn("pointer-events-none fixed inset-x-0 bottom-7 z-[100] hidden justify-center md:flex", className)}
    >
      <motion.div
        role="navigation"
        aria-label="Primary"
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        initial={reduceMotion ? false : { opacity: 0, y: 14, scale: 0.98 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.4 }}
        className={cn(
          "relative pointer-events-auto flex items-end justify-center gap-3 overflow-visible rounded-[999px] border border-border/60 bg-background/80 px-4 py-1 shadow-[0_16px_48px_-16px_rgba(0,0,0,0.3)] backdrop-blur-xl before:pointer-events-none before:absolute before:inset-x-4 before:top-1 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent dark:border-white/10 dark:bg-zinc-950/85 dark:shadow-black/55",
        )}
      >
        {items.map((item) => (
          <IconContainer
            key={item.href}
            mouseX={mouseX}
            title={item.title}
            href={item.href}
            icon={item.icon}
            active={routeActive(pathname, item.href)}
            disableLink={disableLinks}
          />
        ))}
      </motion.div>
    </div>
  );
}
