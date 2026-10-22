/**
 * Cookie consent for the things that set cookies for advertising and analytics (Google Analytics,
 * Google AdSense). Both stay off until the visitor accepts. The choice lives in a first-party cookie
 * so it survives reloads, and this module is the only place that reads or writes it.
 *
 * Client-side only: every function touches `document` or `window`.
 */

export type ConsentChoice = "granted" | "denied";
/** `unset`: asked nothing yet. `unknown`: server render / first hydration pass, before the cookie is read. */
export type ConsentState = ConsentChoice | "unset" | "unknown";

export const CONSENT_COOKIE = "nx-consent";
/** Asked again after six months. */
const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;
/** Fired on `window` to open the banner again (the footer's "Cookie settings" link). */
export const OPEN_SETTINGS_EVENT = "nexus:open-cookie-settings";

const listeners = new Set<() => void>();

function readCookie(name: string): string | null {
  for (const part of document.cookie.split("; ")) {
    const eq = part.indexOf("=");
    if (eq !== -1 && part.slice(0, eq) === name) return decodeURIComponent(part.slice(eq + 1));
  }
  return null;
}

export function getConsentSnapshot(): ConsentState {
  const value = readCookie(CONSENT_COOKIE);
  return value === "granted" || value === "denied" ? value : "unset";
}

export function getServerConsentSnapshot(): ConsentState {
  return "unknown";
}

export function subscribeConsent(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setConsent(choice: ConsentChoice) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${choice}; Path=/; Max-Age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
  listeners.forEach((listener) => listener());
}

export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

/**
 * Removes the cookies Google Analytics sets on this site. Google sets them on the registrable domain,
 * so each candidate domain is tried. (AdSense cookies belong to Google's own domains and can't be
 * removed from here; withdrawing consent reloads the page so its scripts don't run again.)
 */
export function clearGoogleCookies() {
  const host = window.location.hostname;
  const parent = host.split(".").slice(-2).join(".");
  const domains = [undefined, host, `.${host}`, `.${parent}`];
  for (const part of document.cookie.split("; ")) {
    const name = part.slice(0, part.indexOf("="));
    if (!/^(_ga|_gid|_gat|_gcl)/.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ""}`;
    }
  }
}
