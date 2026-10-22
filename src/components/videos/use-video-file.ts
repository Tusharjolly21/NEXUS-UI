"use client";

import * as React from "react";
import { useProAccess } from "@/components/pro/pro-access";
import type { VideoPart } from "@/lib/catalog/videos";

type Loaded = { key: string; status: "ready" | "error"; text: string };

/**
 * Fetches one of a video's files (prompt, source, kit, frame page, render script) from the gated
 * route when `enabled`. A 401 or 403 opens the upgrade dialog, so a locked file never shows any
 * content from the browser's side.
 */
export function useVideoFile(slug: string, part: VideoPart, enabled: boolean, name: string) {
  const { requestUpgrade } = useProAccess();
  const key = `${slug}/${part}`;
  const [loaded, setLoaded] = React.useState<Loaded | null>(null);

  React.useEffect(() => {
    if (!enabled) return;
    let live = true;
    fetch(`/api/videos/${encodeURIComponent(slug)}/${part}`, { credentials: "same-origin", cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401 || r.status === 403) {
          requestUpgrade(name, part === "prompt" ? "build prompt" : "source");
          throw new Error("denied");
        }
        if (!r.ok) throw new Error("failed");
        const json = (await r.json()) as { prompt?: string; text?: string };
        return json.prompt ?? json.text ?? "";
      })
      .then((text) => live && setLoaded({ key, status: "ready", text }))
      .catch(() => live && setLoaded({ key, status: "error", text: "" }));
    return () => {
      live = false;
    };
  }, [slug, part, key, enabled, name, requestUpgrade]);

  if (!enabled) return { status: "idle" as const, text: "" };
  if (loaded?.key === key) return { status: loaded.status, text: loaded.text };
  return { status: "loading" as const, text: "" };
}
