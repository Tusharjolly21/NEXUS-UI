"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * How many tiles each list has revealed, kept for the life of the tab. A list that remounts (the
 * back button after opening a component, say) finds its count here, so the page is as long as it
 * was and the browser can put you back where you were. It is an external store so the server render
 * and the first client render agree (both show one batch) and nothing is read during render.
 */
const counts = new Map<string, number>();
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

/**
 * Reveals a long list a batch at a time as the reader scrolls. `storeKey` names the list and its
 * filters: a different key starts again from one batch.
 */
export function useInfiniteCount({ total, batch, storeKey }: { total: number; batch: number; storeKey: string }) {
  const stored = React.useSyncExternalStore(
    subscribe,
    () => counts.get(storeKey) ?? batch,
    () => batch,
  );
  const count = Math.min(Math.max(stored, batch), total);
  const more = React.useCallback(() => {
    counts.set(storeKey, Math.min((counts.get(storeKey) ?? batch) + batch, total));
    listeners.forEach((l) => l());
  }, [storeKey, batch, total]);
  return { count, more, done: count >= total };
}

/**
 * The end of an infinite list. It loads the next batch when it comes within about a screen of the
 * viewport, and it is a real button as well, so keyboard and assistive-tech users (and anyone whose
 * scrolling doesn't trigger it) can ask for more themselves.
 */
export function InfiniteSentinel({
  onMore,
  shown,
  total,
  noun,
  className,
}: {
  onMore: () => void;
  shown: number;
  total: number;
  noun: string;
  className?: string;
}) {
  const ref = React.useRef<HTMLButtonElement | null>(null);

  // A fresh observer after every batch: it reports at once if the button is still in range, so a
  // tall screen keeps filling until the button is pushed out of view.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onMore();
      },
      { rootMargin: "0px 0px 900px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [onMore, shown]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <button
        ref={ref}
        type="button"
        onClick={onMore}
        className="pg-float inline-flex h-11 items-center gap-2 rounded-full bg-card px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <Loader2 className="size-4 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden />
        Show more {noun}
      </button>
      <p className="text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
        Showing {shown} of {total}
      </p>
    </div>
  );
}
