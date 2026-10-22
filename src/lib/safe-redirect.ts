/** Where a plain sign-in lands. Protected pages pass their own ?next=, so those still return there. */
export const DEFAULT_AUTH_REDIRECT = "/";

/**
 * Only allow same-origin relative paths for post-login redirects.
 * Rejects `//host`, `/\host`, `@host` and absolute URLs so `?next=` cannot send users off-site.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return DEFAULT_AUTH_REDIRECT;
  }
  return next;
}
