"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BlogContentCentered } from "./blog-content-centered";

export type BlogContentWithTocProps = {
  className?: string;
};

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "key-areas", label: "Key areas of AI development" },
  { id: "ethics", label: "Ethical considerations" },
  { id: "conclusion", label: "Conclusion" },
];

const sectionIdPrefix = "blog-with-toc";

export function BlogContentWithToc({ className }: BlogContentWithTocProps) {
  const scope = React.useId();
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLElement>(null);
  const [active, setActive] = React.useState(tocItems[0].id);

  // Track the section nearest the top of whichever box is scrolling: the block
  // itself when it is height-constrained, otherwise the page.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const scrollRoot = root.scrollHeight > root.clientHeight + 1 ? root : null;
    const targets = tocItems
      .map((item) => root.querySelector<HTMLElement>(`[id="${sectionIdPrefix}-${item.id}"]`))
      .filter((el): el is HTMLElement => el !== null);
    const visible = new Map<string, boolean>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
        const first = tocItems.find((item) => visible.get(`${sectionIdPrefix}-${item.id}`));
        if (first) setActive(first.id);
      },
      { root: scrollRoot, rootMargin: "-8% 0px -55% 0px" },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function jumpTo(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const target = rootRef.current?.querySelector<HTMLElement>(`[id="${sectionIdPrefix}-${id}"]`);
    if (!target) return;
    event.preventDefault();
    setActive(id);
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <section
      ref={rootRef}
      className={cn(
        "@container min-h-full w-full overflow-y-auto bg-white text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-8 @5xl:grid-cols-[220px_minmax(0,760px)] @5xl:gap-16 @5xl:px-10 @5xl:py-24">
        <aside className="hidden @5xl:block">
          <motion.nav
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -12, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ type: "spring", stiffness: 260, damping: 32, delay: 0.15 }}
            className="sticky top-10"
            aria-label="Table of contents"
          >
            <p className="px-3 text-[12px] font-semibold text-[#86868b] dark:text-[#98989d]">On this page</p>
            <ul className="mt-2 flex flex-col gap-0.5">
              {tocItems.map((item) => {
                const isActive = item.id === active;
                return (
                  <li key={item.id}>
                    <a
                      href={`#${sectionIdPrefix}-${item.id}`}
                      onClick={(event) => jumpTo(event, item.id)}
                      aria-current={isActive ? "location" : undefined}
                      className={cn(
                        "relative block rounded-[10px] px-3 py-1.5 text-[14px] leading-[1.35] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]",
                        isActive
                          ? "font-medium text-[#1d1d1f] dark:text-[#f5f5f7]"
                          : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId={`${scope}-toc`}
                          transition={{ type: "spring", stiffness: 480, damping: 34 }}
                          className="absolute inset-0 rounded-[10px] bg-[#f5f5f7] dark:bg-[#1c1c1e]"
                        >
                          <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-[#0071e3]" />
                        </motion.span>
                      )}
                      <span className="relative">{item.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        </aside>

        <BlogContentCentered
          className="min-h-0 overflow-visible bg-transparent px-0 py-0 dark:bg-transparent sm:px-0 lg:py-0"
          sectionIdPrefix={sectionIdPrefix}
        />
      </div>
    </section>
  );
}

export default BlogContentWithToc;
