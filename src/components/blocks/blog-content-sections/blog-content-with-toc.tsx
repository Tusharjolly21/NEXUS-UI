"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BlogContentCentered } from "./blog-content-centered";

/** The four body sections of the article, by id. */
export type BlogTocSectionId = "introduction" | "key-areas" | "ethics" | "conclusion";

export type BlogTocItem = { id: BlogTocSectionId; label: string };

/** The default contents: one entry per body section, in reading order. */
export const BLOG_TOC_ITEMS: BlogTocItem[] = [
  { id: "introduction", label: "Introduction" },
  { id: "key-areas", label: "Key areas of AI development" },
  { id: "ethics", label: "Ethical considerations" },
  { id: "conclusion", label: "Conclusion" },
];

export type BlogContentWithTocProps = {
  /** The article headline. */
  title?: string;
  /** Standfirst under the headline. Leave empty to hide it. */
  dek?: string;
  /** Small label above the headline, before the date. */
  category?: string;
  /** Byline name; its first two initials fill the monogram. */
  author?: string;
  /** Publish date next to the category. */
  date?: string;
  /** Line under the author name. */
  readingTime?: string;
  /** Heading above the contents list. */
  tocLabel?: string;
  /** Contents entries (ids must be body section ids; unknown ids are skipped). */
  tocItems?: BlogTocItem[];
  /** Prefix for the body section ids the entries link to (`<prefix>-introduction`, ...). Letters, digits, `-` and `_` only. */
  sectionIdPrefix?: string;
  /** Wide image under the header. Defaults to the centred article's stock photo. */
  heroImage?: string;
  /** Figure inside the body. Defaults to the centred article's circuit-board photo. */
  secondaryImage?: string;
  /** Merged onto the outer section. */
  className?: string;
};

const SECTION_IDS: readonly string[] = ["introduction", "key-areas", "ethics", "conclusion"];

export function BlogContentWithToc({
  title,
  dek,
  category,
  author,
  date,
  readingTime,
  tocLabel = "On this page",
  tocItems: tocItemsProp = BLOG_TOC_ITEMS,
  sectionIdPrefix: prefixProp = "blog-with-toc",
  heroImage,
  secondaryImage,
  className,
}: BlogContentWithTocProps) {
  const scope = React.useId();
  const reduce = useReducedMotion();
  const rootRef = React.useRef<HTMLElement>(null);
  // Ids go into querySelector, so only plain id characters are kept.
  const sectionIdPrefix = String(prefixProp ?? "").replace(/[^a-zA-Z0-9_-]/g, "") || "blog-with-toc";
  const tocItems = React.useMemo(
    () => (Array.isArray(tocItemsProp) ? tocItemsProp : []).filter((item) => Boolean(item) && SECTION_IDS.includes(item.id)),
    [tocItemsProp],
  );
  const [active, setActive] = React.useState<string>(tocItems[0]?.id ?? "");

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
  }, [tocItems, sectionIdPrefix]);

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
            <p className="px-3 text-[12px] font-semibold text-[#86868b] dark:text-[#98989d]">{tocLabel}</p>
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
          title={title}
          dek={dek}
          category={category}
          author={author}
          date={date}
          readingTime={readingTime}
          heroImage={heroImage}
          secondaryImage={secondaryImage}
        />
      </div>
    </section>
  );
}

export default BlogContentWithToc;
