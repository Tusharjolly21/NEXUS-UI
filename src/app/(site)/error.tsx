"use client";

import * as React from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * The site's own fallback when something on a page throws, in place of the framework's bare "This page couldn't
 * load". The nav and footer stay, and the page can be tried again where it is, without losing your place on the site.
 */
export default function SiteError({ error, unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="px-4 pb-28 pt-24">
      <div className="mx-auto max-w-[560px] rounded-[28px] bg-card px-8 py-14 text-center shadow-[0_0_0_0.5px_var(--border)]">
        <h1 className="pg-display text-[clamp(30px,5vw,40px)] leading-[1.05] text-foreground">This page hit a snag</h1>
        <p className="mx-auto mt-4 max-w-[400px] text-[16px] leading-[1.55] text-muted-foreground">
          Something on it stopped working. Trying again usually brings it back.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-[15px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <RotateCcw className="size-4" aria-hidden />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex h-11 items-center rounded-full bg-foreground/[0.06] px-5 text-[15px] font-semibold text-foreground transition-colors hover:bg-foreground/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Go to the home page
          </Link>
        </div>
      </div>
    </section>
  );
}
