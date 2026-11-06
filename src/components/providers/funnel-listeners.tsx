"use client";

import * as React from "react";
import { LOGIN_MARKER } from "@/lib/login-marker";
import { rememberSource, trackEvent } from "@/lib/track";

const LABEL = /^[a-z0-9-]{1,24}$/;

/** The first part of a path as a short label: "/components/x" is "components", "/" is "home". */
function sectionOf(pathname: string): string {
  const first = pathname.split("/")[1] ?? "";
  return LABEL.test(first) ? first : first ? "other" : "home";
}

/** Where on the page a link to the plans sits. A link (or a parent) can name itself with data-plans-source. */
function sourceOf(link: Element): string {
  const named = link.closest<HTMLElement>("[data-plans-source]")?.dataset.plansSource;
  if (named && LABEL.test(named.replace(/_/g, "-"))) return named;
  if (link.closest("[role=dialog]")) return "dialog";
  if (link.closest("footer")) return "footer";
  if (link.closest("header, nav")) return "nav";
  return "page";
}

/**
 * Two small listeners for the funnel, mounted once for the whole site. Renders nothing.
 *
 * - plans_click: every click on a link to /pricing, labelled with where on the page it sat (nav, footer,
 *   banner, upgrade dialog, a card...) and which section of the site it was on. One listener instead of a
 *   handler on each of the 50 or so links.
 * - login_completed: the sign-in callback adds ?nx_login=<where you were going> to the page it lands on;
 *   this counts it once and takes it out of the address bar.
 *
 * Labels only, never an email, name or id. Both go through trackEvent, so an opted-out browser sends nothing.
 */
export function FunnelListeners() {
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || !(e.target instanceof Element)) return;
      const link = e.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      let url: URL;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.pathname !== "/pricing") return;
      trackEvent("plans_click", { source: sourceOf(link), page: sectionOf(window.location.pathname) });
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // A link that says where it came from (?src=ig) is remembered for the session and counted once as a landing.
  React.useEffect(() => {
    const src = new URL(window.location.href).searchParams.get("src");
    if (src && rememberSource(src)) trackEvent("src_landing", { page: sectionOf(window.location.pathname) });
  }, []);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const marker = url.searchParams.get(LOGIN_MARKER);
    if (marker === null) return;
    url.searchParams.delete(LOGIN_MARKER);
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    trackEvent("login_completed", { source: LABEL.test(marker) ? marker : "other" });
  }, []);

  return null;
}
