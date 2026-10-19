"use client";

import * as React from "react";
import { DynamicPreview } from "@/components/library/dynamic-preview";
import { PREVIEW_FILL_CLASSES } from "@/components/gallery/fit-preview";

/** Sentinel the measuring script treats as "outside the component". */
export const TILE_LAB_SENTINEL = "#ff00ff";

export function TileLabStage() {
  const search = React.useSyncExternalStore(
    () => () => {},
    () => window.location.search,
    () => null,
  );
  const p = React.useMemo(() => {
    if (search === null) return null;
    const q = new URLSearchParams(search);
    return { e: q.get("e") ?? "", w: Number(q.get("w") ?? 960), h: Number(q.get("h") ?? 720) };
  }, [search]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-tile-lab", "");
  }, []);

  if (!p) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: `var(--tile-lab-sentinel, ${TILE_LAB_SENTINEL})` }}>
      {/* keep Next's dev indicator out of the measurement */}
      <style>{"nextjs-portal{display:none!important}html,body{overflow:hidden!important}"}</style>
      <div
        id="tile-lab-stage"
        data-ready="true"
        style={{ position: "absolute", left: 0, top: 0, width: p.w, height: p.h, overflow: "hidden" }}
        className={PREVIEW_FILL_CLASSES}
      >
        <DynamicPreview exportName={p.e} compact />
      </div>
    </div>
  );
}
