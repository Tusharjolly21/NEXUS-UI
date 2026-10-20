import { highlight } from "sugar-high";
import { GooeyInput } from "@/components/gooey-input";

/**
 * The snippet and the live component use the same props, so what you see
 * on the left is exactly what the code on the right renders.
 */
const SNIPPET = `"use client";

import { GooeyInput } from "@/components/gooey-input";

export function CatalogSearch() {
  return (
    <GooeyInput
      placeholder="Search…"
      collapsedWidth={115}
      expandedWidth={200}
      expandedOffset={56}
    />
  );
}`;

/** Dark+ token colours for sugar-high, matching the component modal. */
const SH_VARS = {
  "--sh-keyword": "#c792ea",
  "--sh-string": "#c3e88d",
  "--sh-comment": "#6b7280",
  "--sh-identifier": "#e6e6eb",
  "--sh-sign": "#9aa0aa",
  "--sh-class": "#82aaff",
  "--sh-property": "#ffcb6b",
  "--sh-entity": "#f78c6c",
  "--sh-jsxliterals": "#e6e6eb",
} as React.CSSProperties;

/** A live component beside the file it lives in once installed. */
export function CodeDemo() {
  const html = highlight(SNIPPET);

  return (
    <figure className="pg-float overflow-hidden rounded-tile bg-card">
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="relative flex min-h-[280px] flex-col border-b border-border lg:border-b-0 lg:border-r">
          <p className="px-5 pt-4 text-[12.5px] font-medium text-muted-foreground">Live · click it</p>
          <div className="pg-dotgrid grid flex-1 place-items-center px-6 py-10">
            <GooeyInput placeholder="Search…" collapsedWidth={115} expandedWidth={200} expandedOffset={56} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col bg-[#121216]">
          <p className="border-b border-white/10 px-5 py-3 font-mono text-[12.5px] text-white/60">
            components/catalog-search.tsx
          </p>
          <pre
            className="flex-1 overflow-x-auto p-5 font-mono text-[13px] leading-[1.7] text-[#e6e6eb]"
            style={SH_VARS}
          >
            <code dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </div>
      </div>
      <figcaption className="sr-only">
        The Gooey Input component running live, next to the code that renders it.
      </figcaption>
    </figure>
  );
}
