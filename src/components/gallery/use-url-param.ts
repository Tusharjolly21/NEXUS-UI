"use client";

import * as React from "react";

const EVENT = "nexus:urlparam";

function subscribe(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}

/**
 * One search param, read from and written to the URL with the native History API (which Next's
 * router stays in sync with). Unlike `useSearchParams` it doesn't opt the page out of static
 * rendering: on the server it is always null.
 */
export function useUrlParam(name: string): [string | null, (value: string | null) => void] {
  const value = React.useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name),
    () => null,
  );

  const set = React.useCallback(
    (next: string | null) => {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set(name, next);
      else url.searchParams.delete(name);
      window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
      window.dispatchEvent(new Event(EVENT));
    },
    [name],
  );

  return [value, set];
}
