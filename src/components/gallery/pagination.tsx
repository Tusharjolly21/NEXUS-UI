"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUrlParam } from "./use-url-param";

/**
 * The current page from `?page=` (1-based, clamped), and a setter that writes it back to the URL so
 * links and the back button keep their place.
 */
export function usePage(pageCount: number): [number, (page: number) => void] {
  const [param, setParam] = useUrlParam("page");
  const raw = Number.parseInt(param ?? "1", 10);
  const page = Math.min(Math.max(1, Number.isFinite(raw) ? raw : 1), Math.max(1, pageCount));
  const set = React.useCallback((next: number) => setParam(next <= 1 ? null : String(next)), [setParam]);
  return [page, set];
}

/** Page numbers to show: always the first and last, the current one and its neighbours, with gaps. */
function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const keep = new Set([1, count, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((p) => keep.add(p));
  if (page >= count - 2) [count - 3, count - 2, count - 1].forEach((p) => keep.add(p));
  const pages = [...keep].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) out.push("gap");
    out.push(p);
  });
  return out;
}

/**
 * Apple-style page controls: round previous / next buttons around a row of page pills, with the
 * current page marked by a pill that slides between numbers.
 */
export function Pagination({
  page,
  pageCount,
  onChange,
  label = "Pages",
  className,
}: {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
  className?: string;
}) {
  const id = React.useId();
  const reduce = useReducedMotion();
  if (pageCount <= 1) return null;

  const button =
    "grid size-10 place-items-center rounded-full bg-card text-foreground shadow-[0_0_0_0.5px_var(--border),0_1px_2px_rgba(0,0,0,0.04)] transition-[background-color,opacity] hover:bg-foreground/[0.05] disabled:pointer-events-none disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  return (
    <nav aria-label={label} className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className={button}
        >
          <ChevronLeft className="size-[18px]" aria-hidden />
        </motion.button>

        <ol className="flex items-center gap-0.5 rounded-full bg-foreground/[0.06] p-1">
          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <li key={`gap-${i}`} aria-hidden className="grid h-8 w-6 place-items-center text-[13px] text-muted-foreground">
                …
              </li>
            ) : (
              <li key={p}>
                <button
                  type="button"
                  onClick={() => onChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  aria-label={`Page ${p}`}
                  className={cn(
                    "relative grid h-8 min-w-8 place-items-center rounded-full px-2.5 text-[13.5px] font-medium tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    p === page ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {p === page ? (
                    <motion.span
                      layoutId={`${id}-page`}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-card shadow-[0_2px_6px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.04)]"
                    />
                  ) : null}
                  <span className="relative">{p}</span>
                </button>
              </li>
            ),
          )}
        </ol>

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => onChange(page + 1)}
          disabled={page >= pageCount}
          aria-label="Next page"
          className={button}
        >
          <ChevronRight className="size-[18px]" aria-hidden />
        </motion.button>
      </div>
      <p className="text-[13px] tabular-nums text-muted-foreground" aria-live="polite">
        Page {page} of {pageCount}
      </p>
    </nav>
  );
}

/** Scrolls an element's top into view (under the floating nav) after a page change. */
export function scrollToTop(el: HTMLElement | null) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 96;
  if (window.scrollY > top) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }
}
