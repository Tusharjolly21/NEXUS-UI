"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Heading = { id: string; title: string };

/**
 * "On this page": the current page's sections, with a rail that fills as you read and the
 * section you're in marked. The marker springs between rows; the fill follows the scroll.
 */
export function OnThisPage() {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [headings, setHeadings] = React.useState<Heading[]>([]);
  const [active, setActive] = React.useState<string | null>(null);
  const fill = useSpring(0, { stiffness: 220, damping: 32, mass: 0.6 });

  // Read the sections once the page has rendered (and again on every docs page change).
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const list = [...document.querySelectorAll<HTMLElement>("[data-doc-section] > h2[id]")].map((h) => ({
        id: h.id,
        title: h.textContent?.trim() ?? h.id,
      }));
      setHeadings(list);
      setActive(list[0]?.id ?? null);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  React.useEffect(() => {
    if (!headings.length) return;
    const onScroll = () => {
      const offset = 140;
      let current = headings[0].id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = h.id;
      }
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      fill.set(max > 0 ? Math.min(1, window.scrollY / max) : 1);
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings, fill]);

  if (headings.length < 2) return null;

  return (
    <div className="mt-8">
      <p className="px-3 text-[13px] font-medium text-muted-foreground">On this page</p>
      <div className="relative mt-2 pl-3">
        <span aria-hidden className="absolute bottom-1 left-3 top-1 w-[2px] rounded-full bg-foreground/[0.08]" />
        <motion.span
          aria-hidden
          className="absolute left-3 top-1 w-[2px] origin-top rounded-full bg-[#0071e3] dark:bg-[#0a84ff]"
          style={{ height: "calc(100% - 8px)", scaleY: reduce ? undefined : fill }}
        />
        <ul className="space-y-0.5">
          {headings.map((h) => {
            const on = h.id === active;
            return (
              <li key={h.id} className="relative">
                {on ? (
                  <motion.span
                    layoutId="docs-toc-dot"
                    aria-hidden
                    className="absolute left-[-3.5px] top-[calc(50%-4.5px)] size-[9px] rounded-full border-2 border-[#0071e3] bg-background dark:border-[#0a84ff]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 30 }}
                  />
                ) : null}
                <a
                  href={`#${h.id}`}
                  aria-current={on ? "location" : undefined}
                  className={cn(
                    "block rounded-[8px] py-1.5 pl-4 pr-2 text-[13.5px] leading-snug transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
                    on ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {h.title}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
