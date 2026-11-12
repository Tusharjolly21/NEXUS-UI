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
export const CHECKED_AT = "2026-11-12T05:49:00Z";
export const CHECKED_LABEL = "12 November 2026";

/** When the last-30-days figures and the weekly rank were last read. */
export const ANALYTICS_CHECKED_AT = "2026-11-12T05:40:00Z";
export const ANALYTICS_CHECKED_LABEL = "12 November 2026";

/** Lifetime counts on the public profile when they were last read. */
export const SNAPSHOT: { views: number; bookmarks: number; components: number } = { views: 957_200, bookmarks: 4_000, components: 41 };

/**
 * Exact figures from the Creator Studio analytics, "Last 30 days", read at ANALYTICS_CHECKED_AT. Installs and
 * profile views were last read on an earlier day (EARLIER_LABEL), and the page says so beside them.
 */
export const LAST_30_DAYS = {
  views: 181_333,
  copies: 1_188,
  installs: 156,
  bookmarks: 667,
  profileViews: 91,
} as const;
export const EARLIER_LABEL = "10 November";

/** Weekly author rank on 21st.dev: position, authors ranked, and places gained since the previous reading (#81). */
export const RANK = { position: 54, of: 944, up: 27, since: "10 November" } as const;

/** What we add per day on top of the snapshot: the last 30 days divided by 30. */
export const DAILY = {
  views: Math.round(LAST_30_DAYS.views / 30),
  bookmarks: Math.round(LAST_30_DAYS.bookmarks / 30),
} as const;

const MAX_DAYS = 30;
const CAP = { views: 999_000, bookmarks: 99_000 };

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

export const fmt = new Intl.NumberFormat("en-US");
