"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Light and dark come from the `dark` class on <html>, the same switch the rest of the page reads.
 * `toggle` flips it (with a view transition when the browser supports it and motion is allowed) and saves the
 * choice under `skein-theme`. To apply a saved choice before first paint in your own app, read that key in an
 * inline script in <head> and add the `dark` class.
 */
export const THEME_STORAGE_KEY = "skein-theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

const readDark = () => document.documentElement.classList.contains("dark");

export function useTheme() {
  // Server snapshot is dark so the first paint of the toggle matches the page's own default look.
  const dark = useSyncExternalStore(subscribe, readDark, () => true);

  const toggle = useCallback(() => {
    const apply = () => {
      const next = !document.documentElement.classList.contains("dark");
      document.documentElement.classList.toggle("dark", next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
      } catch {
        // Private mode or blocked storage: the choice just won't persist.
      }
    };
    const doc = document as Document & { startViewTransition?: (callback: () => void) => unknown };
    if (doc.startViewTransition && !matchMedia("(prefers-reduced-motion: reduce)").matches) doc.startViewTransition(apply);
    else apply();
  }, []);

  return { dark, toggle };
}
