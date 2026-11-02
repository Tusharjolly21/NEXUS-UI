/**
 * The query parameter the sign-in callback adds to the page it sends you to (its value says which section
 * you were going to). The site's funnel listener counts it as login_completed and removes it from the address bar.
 */
export const LOGIN_MARKER = "nx_login";

/** The section of a path as a short label: "/pricing" is "pricing", "/" is "home". */
export function loginSource(path: string): string {
  const first = new URL(path, "https://x.invalid").pathname.split("/")[1] ?? "";
  if (!first) return "home";
  return /^[a-z0-9-]{1,24}$/.test(first) ? first : "other";
}
