"use client";

import * as React from "react";
import type { SlotsResponse } from "@/lib/launch-slots";

/** One request per page load, shared by everything that shows the early-slot numbers (the banner and the popup). */
let pending: Promise<SlotsResponse | null> | null = null;
function load() {
  return (pending ??= fetch("/api/slots")
    .then((r) => (r.ok ? (r.json() as Promise<SlotsResponse>) : null))
    .catch(() => null));
}

/** The early-slot numbers from the database, or null until they arrive (or when they can't be read). */
export function useSlots(active = true): SlotsResponse | null {
  const [data, setData] = React.useState<SlotsResponse | null>(null);
  React.useEffect(() => {
    if (!active) return;
    let alive = true;
    void load().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [active]);
  return data;
}
