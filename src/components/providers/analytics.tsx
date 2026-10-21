"use client";

import * as React from "react";
import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const GOOGLE_TAG_ID = "G-LNN2CTHENQ";
const CLOUDFLARE_TOKEN = "27b8689ab43848efa888f93f6c6e6b02";

/** localStorage key that switches every analytics tool off in this browser. */
const OPT_OUT_KEY = "nexus-no-track";

function readOptOut(): boolean {
  try {
    return window.localStorage.getItem(OPT_OUT_KEY) === "1";
  } catch {
    // Storage blocked: we cannot tell, so count the visit as normal.
    return false;
  }
}

/**
 * Opt-out is per browser, set by visiting any page once with `?notrack=1` and undone with `?notrack=0`.
 * It only affects the browser that sets it, so it cannot change anyone else's tracking, and it needs no
 * secret. The flag is stored locally and never sent anywhere. The param is stripped from the address bar
 * so a shared link does not carry it.
 */
function applyOptOutParam(): boolean {
  const url = new URL(window.location.href);
  const flag = url.searchParams.get("notrack");
  if (flag === "1" || flag === "0") {
    try {
      if (flag === "1") {
        window.localStorage.setItem(OPT_OUT_KEY, "1");
        // Vercel's own switch, kept in step so its scripts stay off even if loaded elsewhere.
        window.localStorage.setItem("va-disable", "true");
      } else {
        window.localStorage.removeItem(OPT_OUT_KEY);
        window.localStorage.removeItem("va-disable");
      }
    } catch {
      /* storage blocked */
    }
    url.searchParams.delete("notrack");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }
  return readOptOut();
}

/**
 * Loads Google Analytics, Cloudflare Web Analytics, Vercel Web Analytics and Speed Insights, unless this
 * browser has opted out. Nothing loads until the check has run, so an opted-out visit never reaches any
 * of them (not even for the first page view).
 */
export function SiteAnalytics() {
  const [mode, setMode] = React.useState<"pending" | "on" | "off">("pending");

  React.useEffect(() => {
    const off = applyOptOutParam();
    if (off) {
      // Google's documented switch, in case its script is already on the page from a cached shell.
      (window as unknown as Record<string, unknown>)[`ga-disable-${GOOGLE_TAG_ID}`] = true;
    }
    setMode(off ? "off" : "on");
  }, []);

  if (mode !== "on") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_TAG_ID}`} strategy="afterInteractive" />
      <Script id="google-tag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_TAG_ID}');
        `}
      </Script>
      <Script
        src="https://static.cloudflareinsights.com/beacon.min.js"
        strategy="afterInteractive"
        data-cf-beacon={JSON.stringify({ token: CLOUDFLARE_TOKEN })}
      />
      <VercelAnalytics />
      <SpeedInsights />
    </>
  );
}
