"use client";

import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 15_000);
  return () => clearInterval(id);
}

function format(timeZone: string) {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone }).format(new Date()).toLowerCase();
}

/**
 * The current time in a time zone, as "7:24 am", refreshed every 15 seconds. The server has no clock the visitor
 * can trust, so it returns an empty string and the real time appears right after hydration.
 */
export function useLocalTime(timeZone: string) {
  return useSyncExternalStore(subscribe, () => format(timeZone), () => "");
}
