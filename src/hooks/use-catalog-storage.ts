"use client";

import * as React from "react";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const trimmed = raw.trim();
    if (!trimmed) return fallback;
    const c0 = trimmed[0];
    if (c0 !== "{" && c0 !== "[" && c0 !== '"') return fallback;
    return JSON.parse(trimmed) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useCatalogStorage<T>(key: string, initial: T) {
  const [state, setState] = React.useState<T>(initial);
  const hydrated = React.useRef(false);
  /** Callers often pass `[]` inline — must not appear in `useCallback` deps or setters change every render. */
  const initialRef = React.useRef(initial);
  initialRef.current = initial;

  React.useEffect(() => {
    const parsed = readJson(key, initialRef.current);
    const init = initialRef.current;
    const safe = Array.isArray(init) && !Array.isArray(parsed) ? init : parsed;
    setState(safe);
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-hydrate when storage key changes
  }, [key]);

  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      setState((prev) => {
        const init = initialRef.current;
        const base = Array.isArray(init) && !Array.isArray(prev) ? init : prev;
        const resolved = typeof next === "function" ? (next as (p: T) => T)(base) : next;
        if (hydrated.current) writeJson(key, resolved);
        return resolved;
      });
    },
    [key],
  );

  return [state, set] as const;
}
