import { useSyncExternalStore } from "react";

/**
 * True while a CSS media query matches. `serverValue` is what the server render (and the first client render)
 * assumes, so pick the layout you want to flash least.
 */
export function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/**
 * True when the visitor asked for reduced motion. Reads the media query through useSyncExternalStore with a
 * server value of false, so server and first client render agree and the page settles to the reduced version
 * right after hydration.
 */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}
