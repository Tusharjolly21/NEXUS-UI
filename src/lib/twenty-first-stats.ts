/**
 * Our numbers on 21st.dev. 21st has no public numbers feed, so these are copied by hand from the nexus-ui
 * profile and Creator Studio analytics. To refresh them: re-read both pages, update SNAPSHOT (with CHECKED_AT) and
 * LAST_30_DAYS and RANK (with ANALYTICS_CHECKED_AT) below, each date set to the moment you read those numbers.
 *
 * The lifetime counts (views, bookmarks) are shown as estimates between checks: the last counted value plus
 * the daily average of the last 30 days. That estimate stops growing after 30 days and never goes past the
 * CAP, so a page that is not refreshed cannot drift far or claim a milestone 21st has not shown.
 */
export const PROFILE_URL = "https://21st.dev/@nexus-ui";

/** When the lifetime SNAPSHOT was read (UTC), and how that date is written on the page. The estimate counts from here. */
export const CHECKED_AT = "2026-11-26T16:10:00Z";
export const CHECKED_LABEL = "26 November 2026";

/** When the last-30-days figures and the weekly rank were last read. */
export const ANALYTICS_CHECKED_AT = "2026-11-26T16:10:00Z";
export const ANALYTICS_CHECKED_LABEL = "26 November 2026";

/**
 * Lifetime counts on the public profile when they were last read. The profile rounds them ("1M", "4.3K"), so
 * these are the shown values, which never overstate the real count.
 */
export const SNAPSHOT: { views: number; bookmarks: number; components: number } = { views: 1_100_000, bookmarks: 4_700, components: 46 };

/** Exact figures from the Creator Studio analytics, "Last 30 days", read at ANALYTICS_CHECKED_AT. */
export const LAST_30_DAYS = {
  views: 230_219,
  copies: 1_590,
  installs: 286,
  bookmarks: 1_051,
  profileViews: 226,
} as const;

/** Growth in percent against the 30 days before, as Creator Studio shows it. It gives none for installs. */
export const CHANGE = { views: 25, copies: 22, bookmarks: 85, profileViews: 201 } as const;

/** Our five most viewed components in the same 30 days (Creator Studio, "Top components"). */
export const TOP_COMPONENTS = [
  { name: "Circular Carousel", views: 27_369, copies: 180 },
  { name: "Cinematic Logo Cloud", views: 20_618, copies: 89 },
  { name: "Logo Clouds", views: 19_904, copies: 73 },
  { name: "Infinite Moving Cards", views: 19_020, copies: 137 },
  { name: "Chat Messages", views: 13_484, copies: 222 },
] as const;

/** The searches inside 21st that opened our components most, in the same 30 days: what was typed, and clicks to us. */
export const TOP_SEARCHES = [
  { query: "chat", clicks: 282 },
  { query: "logo", clicks: 102 },
  { query: "footer", clicks: 64 },
  { query: "map", clicks: 62 },
  { query: "chatbot", clicks: 54 },
] as const;

/**
 * Weekly author rank on 21st.dev: position and authors ranked. `up` (places gained since the reading on `since`)
 * is shown only when the rank has climbed: #55 on 17 November to #40 now.
 */
export const RANK: { position: number; of: number; up?: number; since?: string } = { position: 40, of: 1_067, up: 15, since: "17 November" };

/** What we add per day on top of the snapshot: the last 30 days divided by 30. */
export const DAILY = {
  views: Math.round(LAST_30_DAYS.views / 30),
  bookmarks: Math.round(LAST_30_DAYS.bookmarks / 30),
} as const;

const MAX_DAYS = 30;
// The estimate may run ahead of the last count by at most 30 days of the recent pace, and never past these.
const CAP = { views: 1_499_000, bookmarks: 99_000 };

/** Estimated lifetime counts at a moment in time (default: now). Equal to the snapshot at CHECKED_AT. */
export function estimateLifetime(now: number = Date.now()) {
  const days = Math.min(Math.max((now - Date.parse(CHECKED_AT)) / 86_400_000, 0), MAX_DAYS);
  return {
    views: Math.min(SNAPSHOT.views + DAILY.views * days, CAP.views),
    bookmarks: Math.min(SNAPSHOT.bookmarks + DAILY.bookmarks * days, CAP.bookmarks),
  };
}

/** 934_900 -> "934.9" (the K is added by the caller so it can be styled). */
export function thousands(n: number) {
  return (n / 1000).toFixed(1);
}

/** A count as digits plus a K or M suffix, as 21st writes them: 934_900 -> 934.9 K, 1_014_000 -> 1.01 M, 1_000_000 -> 1 M. */
export function compact(n: number): { digits: string; suffix: "K" | "M" } {
  if (n < 1_000_000) return { digits: thousands(n), suffix: "K" };
  return { digits: String(Number((Math.floor(n / 10_000) / 100).toFixed(2))), suffix: "M" };
}

export const fmt = new Intl.NumberFormat("en-US");
