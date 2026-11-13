"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { NexusMark } from "@/components/brand/nexus-mark";
import { trackEvent } from "@/lib/track";

/** Time a visitor without Pro spends browsing (tab visible, summed across pages) before the Pro offer shows itself. */
export const AUTO_PROMPT_AFTER_MS = 45_000;
/** The offer shows itself at most once in this many days, closed or not. */
const AUTO_PROMPT_EVERY_DAYS = 7;

const BROWSED_KEY = "nx:pro-auto-browsed-ms"; // sessionStorage: browsing time this visit
const LAST_SHOWN_KEY = "nx:pro-auto-last-shown"; // localStorage: when it last showed itself
export const PRO_SEEN_KEY = "nx:pro-dialog-seen"; // sessionStorage: the visitor already opened the dialog this visit

/** Pages where an offer would get in the way: buying, signing in, account pages and the legal pages. */
const QUIET_PREFIXES = ["/pricing", "/login", "/auth", "/oauth", "/checkout", "/dashboard", "/admin", "/terms", "/privacy", "/refund-policy"];

const PHONE_QUERY = "(max-width: 639px)";

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}
function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    // private mode or blocked storage: the timer still works for this page
  }
}
const session = () => window.sessionStorage;
const local = () => window.localStorage;

/** Something else is asking for attention: the cookie question, another dialog, or the visitor is typing. */
function busy() {
  if (document.querySelector('[aria-labelledby="cookie-banner-title"]')) return true;
  if (document.querySelector('[role="dialog"][aria-modal="true"], [role="alertdialog"]')) return true;
  const a = document.activeElement;
  return !!a && (a instanceof HTMLInputElement || a instanceof HTMLTextAreaElement || (a instanceof HTMLElement && a.isContentEditable));
}

/**
 * Shows the Pro offer once a visitor without Pro has browsed for AUTO_PROMPT_AFTER_MS, first visits included.
 * Desktop and tablets get the full upgrade dialog; phones get a small bar at the bottom that opens it, so the
 * page is never covered on a phone. Both close with a cross. It never shows on QUIET_PREFIXES pages, while
 * something else is asking for attention, if the visitor already opened the dialog this visit, or more than
 * once every AUTO_PROMPT_EVERY_DAYS days.
 */
export function AutoProPrompt({ proCount, onOpen }: { proCount: number; onOpen: () => void }) {
  const pathname = usePathname() || "/";
  const [bar, setBar] = React.useState<"hidden" | "shown" | "leaving">("hidden");
  const quiet = QUIET_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  React.useEffect(() => {
    const last = Number(read(local, LAST_SHOWN_KEY) || 0);
    if (Date.now() - last < AUTO_PROMPT_EVERY_DAYS * 86_400_000) return;

    let browsed = Number(read(session, BROWSED_KEY) || 0);
    let tickFrom = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      if (document.visibilityState === "visible") browsed += now - tickFrom;
      tickFrom = now;
      write(session, BROWSED_KEY, String(Math.round(browsed)));
      if (browsed < AUTO_PROMPT_AFTER_MS || quiet || read(session, PRO_SEEN_KEY) || busy()) return;

      window.clearInterval(id);
      write(local, LAST_SHOWN_KEY, String(Date.now()));
      const phone = window.matchMedia(PHONE_QUERY).matches;
      trackEvent("pro_auto_prompt", { form: phone ? "bar" : "dialog", path: pathname });
      if (phone) setBar("shown");
      else onOpen();
    }, 1000);
    return () => window.clearInterval(id);
  }, [pathname, quiet, onOpen]);

  const dismiss = (how: "close" | "open") => {
    trackEvent("pro_auto_prompt_action", { form: "bar", action: how });
    setBar("leaving");
    window.setTimeout(() => setBar("hidden"), 220);
    if (how === "open") onOpen();
  };

  // Leaving for a quiet page (pricing, login...) puts the bar away.
  if (bar === "hidden" || quiet) return null;
  return (
    <div
      role="region"
      aria-label="Nexus UI Pro"
      className={
        "fixed inset-x-0 bottom-0 z-[80] px-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] motion-reduce:animate-none " +
        (bar === "leaving"
          ? "animate-out fade-out slide-out-to-bottom-4 fill-mode-forwards duration-200"
          : "animate-in fade-in slide-in-from-bottom-6 duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]")
      }
    >
      <div className="mx-auto flex max-w-[480px] items-center gap-3 rounded-[22px] bg-card p-2.5 pl-3 shadow-[0_0_0_0.5px_rgba(0,0,0,0.1),0_18px_40px_-14px_rgba(0,0,0,0.4)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.12),0_18px_40px_-14px_rgba(0,0,0,0.9)]">
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[#1d1d1f] text-white">
          <NexusMark size={22} color="#fff" />
        </span>
        <button type="button" onClick={() => dismiss("open")} className="min-w-0 flex-1 text-left">
          <span className="block truncate text-[14px] font-semibold leading-tight tracking-[-0.01em] text-foreground">Unlock all of Pro</span>
          <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
            {proCount ? `${proCount} Pro components and more` : "Every component, template and block"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => dismiss("open")}
          className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-action px-3.5 text-[13.5px] font-semibold text-white transition-transform active:scale-[0.97]"
        >
          See Pro
          <ArrowRight className="size-3.5" strokeWidth={2.4} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Close"
          onClick={() => dismiss("close")}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground active:scale-95"
        >
          <X className="size-4" strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
