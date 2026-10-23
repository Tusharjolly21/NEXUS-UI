"use client";

import * as React from "react";

type RegistryFile = { path: string; target?: string; content: string };
type RegistryItem = { files?: RegistryFile[]; registryDependencies?: string[] };

/** One file a person copies by hand: where to save it and what goes in it. */
export type SourceFile = {
  /** The registry item it belongs to (the component itself, or a helper it imports such as `ui-sounds`). */
  from: string;
  /** Project-relative path to save it as, assuming the `src/` layout the docs use. */
  savePath: string;
  content: string;
};

export type RegistryFilesState =
  | { status: "idle" | "loading" | "error" | "locked" }
  | { status: "ready"; files: SourceFile[] };

/** The registry's own `target` ("components/x/x.tsx") becomes a path inside `src/`. */
export function savePathFor(file: RegistryFile) {
  const target = (file.target ?? `components/${file.path.split("/").pop() ?? file.path}`).replace(/^\/+/, "");
  return target.startsWith("src/") ? target : `src/${target}`;
}

/** Helper items on this site that a component imports; `nexus-font` only adds a font and is not needed by hand. */
function helperNames(item: RegistryItem) {
  const names: string[] = [];
  for (const dep of item.registryDependencies ?? []) {
    const m = /\/api\/registry\/([a-z0-9-]+)\/?$/.exec(dep);
    if (m && m[1] !== "nexus-font") names.push(m[1]);
  }
  return names;
}

async function fetchItem(name: string): Promise<{ item: RegistryItem | null; locked: boolean }> {
  const res = await fetch(`/api/registry/${name}`);
  if (res.status === 401 || res.status === 403) return { item: null, locked: true };
  if (!res.ok) return { item: null, locked: false };
  return { item: (await res.json()) as RegistryItem, locked: false };
}

/**
 * Loads a component's source files from the registry for copying by hand, plus the helper files it imports
 * (so pasting them all gives a project that builds). Nothing is fetched until `enabled` turns true.
 * Pro items come back 401/403 for visitors without access, which shows as `locked`.
 */
export function useRegistryFiles(name: string, enabled: boolean): RegistryFilesState {
  const [state, setState] = React.useState<RegistryFilesState>({ status: "idle" });

  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    (async () => {
      try {
        const main = await fetchItem(name);
        if (!alive) return;
        if (main.locked) return setState({ status: "locked" });
        if (!main.item?.files?.length) return setState({ status: "error" });
        const files: SourceFile[] = main.item.files.map((f) => ({ from: name, savePath: savePathFor(f), content: f.content }));
        const helpers = await Promise.all(helperNames(main.item).map(async (h) => ({ h, res: await fetchItem(h).catch(() => null) })));
        if (!alive) return;
        for (const { h, res } of helpers) {
          for (const f of res?.item?.files ?? []) files.push({ from: h, savePath: savePathFor(f), content: f.content });
        }
        setState({ status: "ready", files });
      } catch {
        if (alive) setState({ status: "error" });
      }
    })();
    return () => {
      alive = false;
    };
  }, [name, enabled]);

  // Asked for but not answered yet reads as loading, without setting state inside the effect.
  return enabled && state.status === "idle" ? { status: "loading" } : state;
}
