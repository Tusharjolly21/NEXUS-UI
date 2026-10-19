"use client";

import * as React from "react";

/** A failed image keeps its box but shows a quiet tone instead of a broken icon and spilled alt text. */
const BROKEN_IMAGE_CSS = `img[data-broken="true"]{color:transparent;font-size:0;background:linear-gradient(135deg,rgba(127,127,127,.10),rgba(127,127,127,.22));}`;

/** Template sections hydrate lazily; touching an image before React owns it causes a hydration mismatch. */
function isHydrated(el: Element) {
  return Object.keys(el).some((k) => k.startsWith("__reactFiber"));
}

function markBroken(img: HTMLImageElement, attempt = 0) {
  if (img.dataset.broken === "true" || !img.isConnected) return;
  if (!isHydrated(img)) {
    if (attempt < 40) window.setTimeout(() => markBroken(img, attempt + 1), 250);
    return;
  }
  img.dataset.broken = "true";
  // an empty alt stops Chrome drawing its broken-image glyph; the name moves to aria-label
  if (img.alt) {
    img.setAttribute("role", "img");
    img.setAttribute("aria-label", img.alt);
  }
  img.alt = "";
}

export function ThemeReceiver({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "nexus-theme") {
        document.documentElement.classList.toggle("dark", e.data.dark === true);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  React.useEffect(() => {
    const onError = (e: Event) => {
      if (e.target instanceof HTMLImageElement) markBroken(e.target);
    };
    // image errors don't bubble, so listen in the capture phase
    document.addEventListener("error", onError, true);
    document.querySelectorAll("img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.currentSrc) markBroken(img);
    });
    return () => document.removeEventListener("error", onError, true);
  }, []);

  return (
    <>
      <style>{BROKEN_IMAGE_CSS}</style>
      {children}
    </>
  );
}
