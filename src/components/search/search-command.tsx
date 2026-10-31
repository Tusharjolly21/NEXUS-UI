"use client";

import * as React from "react";
import { SearchTrigger } from "./search-trigger";

/*
 * The search button is on every page, but the palette behind it is only needed once someone
 * searches. So the button, the open/closed state and the shortcuts live here, and the palette
 * itself (./search-palette) loads separately: in the background once the page has settled, or
 * immediately on hover, focus or the first keypress of ⌘K. Its catalog is a small JSON fetched by
 * the palette (/api/search-index); the live previews in its side pane are fetched only on that
 * same intent, so most visitors never download them for search.
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

  /* The preview pane draws live components, whose code is large. Fetch it only when someone shows
     intent (hover, focus, open), not for every visitor on every page. The catalog JSON follows the same rule. */
  const warmWithPreviews = React.useCallback(() => {
    warm();
    void loadPalette().then((m) => m.loadCatalog());
    void import("@/registry/component-previews");
  }, [warm]);

  /* Load the palette itself (small) in the background once the page has finished loading and the browser is idle. */
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
    warmWithPreviews();
    if (openRef.current) return;
    setSession((n) => n + 1);
    setOpen(true);
  }, [warmWithPreviews]);

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
      <SearchTrigger onClick={openPalette} onWarm={warmWithPreviews} variant={variant} buttonRef={triggerRef} />
      {Palette ? <Palette key={session} open={open} onClose={close} /> : null}
    </>
  );
}
