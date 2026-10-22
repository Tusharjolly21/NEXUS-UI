"use client";

import * as React from "react";
import { SearchTrigger } from "./search-trigger";

/*
 * The search button is on every page, but the palette behind it needs the whole catalog and every
 * preview component (hundreds of KB). So the button, the open/closed state and the shortcuts live
 * here, and the palette itself (./search-palette) loads separately: in the background once the page
 * has settled, or immediately on hover, focus or the first keypress of ⌘K, so it is normally
 * ready before anyone asks for it.
 */
type PaletteModule = typeof import("./search-palette");

let palettePromise: Promise<PaletteModule> | null = null;
const loadPalette = () => (palettePromise ??= import("./search-palette"));

export function SearchCommand({ variant = "default" }: { variant?: "default" | "capsule" } = {}) {
  const [Palette, setPalette] = React.useState<PaletteModule["SearchPalette"] | null>(null);
  const [open, setOpen] = React.useState(false);
  /* Bumped on every open: the palette remounts, so it always starts with an empty search. */
  const [session, setSession] = React.useState(0);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const openRef = React.useRef(false);

  React.useEffect(() => {
    openRef.current = open;
  }, [open]);

  const warm = React.useCallback(() => {
    void loadPalette().then((m) => setPalette(() => m.SearchPalette));
  }, []);

  /* Load it in the background once the page has finished loading and the browser is idle. */
  React.useEffect(() => {
    let idleId: number | undefined;
    const onIdle = () => {
      if (typeof window.requestIdleCallback === "function") idleId = window.requestIdleCallback(warm, { timeout: 4000 });
      else idleId = window.setTimeout(warm, 1500);
    };
    if (document.readyState === "complete") onIdle();
    else window.addEventListener("load", onIdle, { once: true });
    return () => {
      window.removeEventListener("load", onIdle);
      if (idleId === undefined) return;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, [warm]);

  /* Opening starts a fresh session, in the event path rather than in an effect. */
  const openPalette = React.useCallback(() => {
    warm();
    if (openRef.current) return;
    setSession((n) => n + 1);
    setOpen(true);
  }, [warm]);

  const close = React.useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus({ preventScroll: true });
  }, []);

  /* Keyboard shortcut: ⌘K / Ctrl+K / "/" and Escape */
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openPalette();
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing =
        ["input", "textarea", "select"].includes(target?.tagName?.toLowerCase() ?? "") || !!target?.isContentEditable;
      if (e.key === "/" && !typing) {
        e.preventDefault();
        openPalette();
        return;
      }
      if (e.key === "Escape" && openRef.current) close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [openPalette, close]);

  return (
    <>
      <SearchTrigger onClick={openPalette} onWarm={warm} variant={variant} buttonRef={triggerRef} />
      {Palette ? <Palette key={session} open={open} onClose={close} /> : null}
    </>
  );
}
