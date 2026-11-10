"use client";

import * as React from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { COPIED_EVENT, useProAccess } from "@/components/pro/pro-access";
import { trackEvent } from "@/lib/track";

const DISMISS_KEY = "nx_after_copy_off";

function wasDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * One quiet line that appears under an install command right after a visitor without Pro copies it.
 * It sits in the page flow (no popup, no overlay, nothing blocks the copy), says what stays free, and
 * can be closed; closing it keeps it away for the rest of the tab's session. Pro members never see it.
 *
 * `copied` flips to true in the parent once a copy succeeded. The line stays after that (it does not
 * flash away with the "Copied" label) until it is dismissed.
 */
export function AfterCopyProLine({ slug, copied: copiedProp, listen = false }: { slug: string; copied?: boolean; listen?: boolean }) {
  const { isPro, proCount } = useProAccess();
  const [closed, setClosed] = React.useState(false);
  // `listen` shows the line after any free copy on the page (code, prompt) that calls announceCopy().
  const [heard, setHeard] = React.useState(false);
  React.useEffect(() => {
    if (!listen) return;
    const on = () => setHeard(true);
    window.addEventListener(COPIED_EVENT, on);
    return () => window.removeEventListener(COPIED_EVENT, on);
  }, [listen]);
  const copied = !!copiedProp || heard;
  const counted = React.useRef(false);

  // `copied` only turns true after a click, so reading the session here never differs between server and browser.
  const visible = copied && !closed && !isPro && proCount > 0 && !wasDismissed();
  React.useEffect(() => {
    if (visible && !counted.current) {
      counted.current = true;
      trackEvent("after_copy_shown", { slug });
    }
  }, [visible, slug]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="mt-3 flex items-center gap-3 rounded-2xl bg-muted py-2.5 pl-4 pr-2 text-[13.5px] leading-[1.45] text-muted-foreground"
    >
      <p className="min-w-0 flex-1">
        Copied. This one stays free. {proCount} more components and every template are in Pro.{" "}
        <Link
          href="/pricing"
          data-plans-source="after_copy"
          className="font-medium text-link underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          See Pro
        </Link>
      </p>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          setClosed(true);
          try {
            window.sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            // private mode: it comes back on the next copy, which is fine
          }
        }}
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-black/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring dark:hover:bg-white/10"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
