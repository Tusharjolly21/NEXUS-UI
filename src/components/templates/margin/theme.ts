"use client";

import { useCallback, useSyncExternalStore, type MouseEvent } from "react";

/**
 * Light and dark come from the class on <html>: `dark` or `light`. With neither class (a standalone app that does
 * not manage one) the page follows the visitor's system setting. The toggle in the header writes the class, using a
 * circular view transition from the click point when the browser supports it and motion is allowed.
 */
const DARK_QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  const media = matchMedia(DARK_QUERY);
  media.addEventListener("change", onChange);
  return () => {
    observer.disconnect();
    media.removeEventListener("change", onChange);
  };
}

function readDark() {
  const classes = document.documentElement.classList;
  if (classes.contains("dark")) return true;
  if (classes.contains("light")) return false;
  return matchMedia(DARK_QUERY).matches;
}

function setDark(dark: boolean) {
  const classes = document.documentElement.classList;
  classes.toggle("dark", dark);
  classes.toggle("light", !dark);
}

export function useTheme() {
  // The server cannot know the visitor's theme, so it renders light; CSS variables already show the right colours
  // before this value arrives, only canvas drawing waits for it.
  const dark = useSyncExternalStore(subscribe, readDark, () => false);

  const toggle = useCallback((event: MouseEvent) => {
    const next = !readDark();
    const doc = document as Document & {
      startViewTransition?: (update: () => void) => { ready: Promise<void> };
    };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDark(next);
      return;
    }
    const x = event.clientX || innerWidth / 2;
    const y = event.clientY || 0;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc
      .startViewTransition(() => setDark(next))
      .ready.then(() =>
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 620, easing: "cubic-bezier(.65,0,.35,1)", pseudoElement: "::view-transition-new(root)" },
        ),
      )
      .catch(() => {});
  }, []);

  return { dark, toggle };
}
