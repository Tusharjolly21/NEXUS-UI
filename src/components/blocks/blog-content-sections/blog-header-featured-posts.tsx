"use client";

import * as React from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "framer-motion";
import { ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Article = {
  id: string;
  title: string;
  summary: string;
  category: string;
  thumbnailUrl: string;
  publishedAt: string;
  readingTime: string;
  likes: number;
  views: number;
  author: {
    name: string;
    initials: string;
    avatarUrl: string;
  };
  tags: string[];
};

export type BlogHeaderFeaturedPostsProps = {
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

const tabs = [
  { id: "all", label: "View all" },
  { id: "systems", label: "Systems" },
  { id: "motion", label: "Motion" },
  { id: "frontend", label: "Frontend" },
  { id: "launch", label: "Launch" },
];

const sortOptions = ["Most recent", "Most popular", "Most viewed"];

const featuredArticle: Article = {
  id: "featured",
  title: "Design systems that make launches feel effortless",
  summary:
    "How reusable sections, motion rules, and a clean visual language let small teams ship polished product pages without rebuilding the same pieces every quarter.",
  category: "Systems",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=80",
  publishedAt: "22 May 2026",
  readingTime: "10 min read",
  likes: 0,
  views: 0,
  author: {
    name: "Ariana Reed",
    initials: "AR",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
  },
  tags: ["Systems", "Components", "Launch"],
};

const articles: Article[] = [
  {
    id: "article-1",
    title: "A field guide to reusable hero sections",
    summary: "How to compose headlines, calls to action, visuals, and proof into hero blocks that earn the scroll.",
    category: "Systems",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
    publishedAt: "21 May 2026",
    readingTime: "7 min read",
    likes: 412,
    views: 9800,
    author: {
      name: "Nina Kapoor",
      initials: "NK",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["Hero", "Conversion", "UX"],
  },
  {
    id: "article-2",
    title: "Motion rules for calm, premium interfaces",
    summary: "A small system for entrances, hover states, and spring timing that feels considered rather than busy.",
    category: "Motion",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&q=80",
    publishedAt: "20 May 2026",
    readingTime: "9 min read",
    likes: 688,
    views: 12400,
    author: {
      name: "Ishan Mehta",
      initials: "IM",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["Springs", "Timing"],
  },
  {
    id: "article-3",
    title: "Shipping components with better props",
    summary: "The prop patterns that make UI components easier to reuse, customize, and publish.",
    category: "Frontend",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80",
    publishedAt: "19 May 2026",
    readingTime: "8 min read",
    likes: 530,
    views: 15100,
    author: {
      name: "Theo Banerjee",
      initials: "TB",
      avatarUrl:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["React", "Props"],
  },
  {
    id: "article-4",
    title: "The landing page audit checklist",
    summary: "A focused review pass for spacing, contrast, hierarchy, responsiveness, and copy clarity.",
    category: "Launch",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80",
    publishedAt: "18 May 2026",
    readingTime: "6 min read",
    likes: 297,
    views: 7200,
    author: {
      name: "Maya Sen",
      initials: "MS",
      avatarUrl:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["Checklist", "Launch"],
  },
  {
    id: "article-5",
    title: "Designing bento grids that do real work",
    summary: "How to avoid random card layouts and build bento sections with rhythm, hierarchy, and purpose.",
    category: "Systems",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=900&q=80",
    publishedAt: "17 May 2026",
    readingTime: "7 min read",
    likes: 741,
    views: 10900,
    author: {
      name: "Rhea Thomas",
      initials: "RT",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["Bento", "Layout"],
  },
  {
    id: "article-6",
    title: "Making docs pages feel like product",
    summary: "Navigation, examples, code previews, and copy details that help people trust a component library.",
    category: "Frontend",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    publishedAt: "16 May 2026",
    readingTime: "5 min read",
    likes: 356,
    views: 8300,
    author: {
      name: "Dev Arora",
      initials: "DA",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    },
    tags: ["Docs", "DX"],
  },
];

const SNAP: Transition = { type: "spring", stiffness: 500, damping: 36 };
const SOFT: Transition = { type: "spring", stiffness: 260, damping: 30 };
const ZOOM: Transition = { type: "spring", stiffness: 120, damping: 22 };

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3]";

function sortArticles(list: Article[], sortBy: string) {
  if (sortBy === "Most popular") return [...list].sort((a, b) => b.likes - a.likes);
  if (sortBy === "Most viewed") return [...list].sort((a, b) => b.views - a.views);
  return list;
}

export function BlogHeaderFeaturedPosts({
  className,
  eyebrow = "The Northfield journal",
  title = "Design notes for faster launches",
  description = "Practical writing on component systems, considered motion, frontend craft, and launch-ready product pages.",
}: BlogHeaderFeaturedPostsProps) {
  const scope = React.useId();
  const sortId = React.useId();
  const reduce = useReducedMotion();
  const [activeTab, setActiveTab] = React.useState("all");
  const [sortBy, setSortBy] = React.useState(sortOptions[0]);

  const visible = React.useMemo(() => {
    const filtered =
      activeTab === "all"
        ? articles
        : articles.filter((article) => article.category.toLowerCase() === activeTab);
    return sortArticles(filtered, sortBy);
  }, [activeTab, sortBy]);

  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: SOFT },
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        className={cn(
          "@container min-h-full w-full overflow-y-auto bg-white px-5 py-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:px-10 lg:py-20",
          className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <motion.header
            initial="hidden"
            animate="show"
            transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
            className="max-w-3xl"
          >
            <motion.p variants={rise} className="text-[17px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">
              {eyebrow}
            </motion.p>
            <motion.h1
              variants={rise}
              className="mt-2 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] @xl:text-[52px] @5xl:text-[64px] @5xl:leading-[1.03]"
            >
              {title}
            </motion.h1>
            <motion.p
              variants={rise}
              className="mt-5 max-w-2xl text-pretty text-[19px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6] @xl:text-[21px]"
            >
              {description}
            </motion.p>
          </motion.header>

          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 30, delay: 0.25 }}
            className="mt-12"
          >
            <FeaturedArticle article={featuredArticle} />
          </motion.div>

          <div className="mt-16 flex flex-col gap-4 @3xl:flex-row @3xl:items-center @3xl:justify-between">
            <div className="-mx-5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0">
              <div
                role="group"
                aria-label="Filter by category"
                className="inline-flex rounded-[10px] bg-[#e8e8ed] p-[3px] dark:bg-[#3a3a3c]"
              >
                {tabs.map((tab) => {
                  const selected = tab.id === activeTab;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      aria-pressed={selected}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "relative h-8 whitespace-nowrap rounded-[8px] px-3.5 text-[13px] font-medium transition-colors",
                        focusRing,
                        selected
                          ? "text-[#1d1d1f] dark:text-[#f5f5f7]"
                          : "text-[#6e6e73] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:text-[#f5f5f7]",
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId={`${scope}-tab`}
                          transition={SNAP}
                          className="absolute inset-0 rounded-[8px] bg-white shadow-[0_2px_6px_rgba(0,0,0,.1),0_0_0_.5px_rgba(0,0,0,.04)] dark:bg-[#636366]"
                        />
                      )}
                      <span className="relative">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <label htmlFor={sortId} className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">
                Sort by
              </label>
              <div className="relative">
                <select
                  id={sortId}
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  className={cn(
                    "h-9 appearance-none rounded-[10px] bg-[#e8e8ed] pl-3 pr-9 text-[13px] font-medium text-[#1d1d1f] transition-colors hover:bg-[#dedee3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
                    focusRing,
                  )}
                >
                  {sortOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden
                  strokeWidth={2}
                  className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-[#6e6e73] dark:text-[#a1a1a6]"
                />
              </div>
            </div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            variants={rise}
          >
            <ul className="relative mt-10 grid grid-cols-1 gap-x-8 gap-y-14 @3xl:grid-cols-2 @5xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {visible.map((article) => (
                  <motion.li
                    key={article.id}
                    layout
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(6px)" }}
                    transition={SOFT}
                  >
                    <ArticleCard article={article} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </motion.div>

          <Pagination />
        </div>
      </section>
    </MotionConfig>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <motion.a
      href="#"
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn(
        "group block rounded-[24px] @3xl:relative @3xl:min-h-[540px] @3xl:overflow-hidden @3xl:rounded-[28px] @3xl:shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] @5xl:min-h-[620px]",
        focusRing,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[#f5f5f7] dark:bg-[#1c1c1e] @3xl:absolute @3xl:inset-0 @3xl:aspect-auto @3xl:rounded-none">
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.03 } }}
          transition={ZOOM}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${article.thumbnailUrl}')` }}
          role="img"
          aria-label={article.title}
        />
        <div className="absolute inset-0 hidden bg-[linear-gradient(to_top,rgba(0,0,0,.72),rgba(0,0,0,.18)_45%,transparent_70%)] @3xl:block" />
      </div>

      <div className="mt-6 @3xl:absolute @3xl:inset-x-0 @3xl:bottom-0 @3xl:mt-0 @3xl:p-10 @3xl:text-white @5xl:p-12">
        <p className="text-[14px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6] @3xl:text-white/75 @3xl:dark:text-white/75">
          {article.category}
          <span aria-hidden className="mx-2 opacity-60">
            ·
          </span>
          <span className="font-normal">{article.publishedAt}</span>
        </p>
        <div className="mt-2 flex items-start gap-5">
          <h2 className="max-w-3xl flex-1 text-balance text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] @xl:text-[34px] @3xl:text-[44px] @5xl:text-[52px] @5xl:leading-[1.04]">
            {article.title}
          </h2>
          <motion.span
            aria-hidden
            variants={{ rest: { x: 0, y: 0 }, hover: { x: 3, y: -3 } }}
            transition={SNAP}
            className="mt-1.5 hidden size-11 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur-md @3xl:grid"
          >
            <ArrowUpRight className="size-5" strokeWidth={2} />
          </motion.span>
        </div>
        <p className="mt-4 max-w-2xl text-pretty text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6] @3xl:text-[19px] @3xl:text-white/80 @3xl:dark:text-white/80">
          {article.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex items-center gap-3">
            <Avatar article={article} />
            <div className="text-[14px] leading-tight">
              <p className="font-semibold">{article.author.name}</p>
              <p className="mt-0.5 text-[#86868b] dark:text-[#98989d] @3xl:text-white/70 @3xl:dark:text-white/70">
                {article.readingTime}
              </p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Topics">
            {article.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#6e6e73] dark:bg-[#1c1c1e] dark:text-[#a1a1a6] @3xl:bg-white/15 @3xl:text-white @3xl:backdrop-blur-md @3xl:dark:bg-white/15 @3xl:dark:text-white"
              >
                {tag}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.a>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <motion.a
      href="#"
      initial="rest"
      animate="rest"
      whileHover="hover"
      className={cn("group block rounded-[22px]", focusRing)}
    >
      <div className="relative aspect-[3/2] overflow-hidden rounded-[20px] bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: 1.04 } }}
          transition={ZOOM}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${article.thumbnailUrl}')` }}
          role="img"
          aria-label={article.title}
        />
      </div>

      <div className="mt-5 px-1">
        <p className="text-[13px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">{article.category}</p>
        <div className="mt-1.5 flex items-start gap-3">
          <h3 className="flex-1 text-balance text-[21px] font-semibold leading-[1.2] tracking-[-0.02em]">
            {article.title}
          </h3>
          <motion.span
            aria-hidden
            variants={{ rest: { x: 0, y: 0, opacity: 0.5 }, hover: { x: 2, y: -2, opacity: 1 } }}
            transition={SNAP}
            className="mt-1 shrink-0 text-[#1d1d1f] dark:text-[#f5f5f7]"
          >
            <ArrowUpRight className="size-5" strokeWidth={1.75} />
          </motion.span>
        </div>
        <p className="mt-2 line-clamp-2 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
          {article.summary}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <Avatar article={article} />
          <div className="min-w-0 text-[14px] leading-tight">
            <p className="truncate font-semibold">{article.author.name}</p>
            <p className="mt-0.5 truncate text-[13px] text-[#86868b] dark:text-[#98989d]">
              {article.publishedAt} · {article.readingTime}
            </p>
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Topics">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium text-[#6e6e73] dark:bg-[#1c1c1e] dark:text-[#a1a1a6]"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>
    </motion.a>
  );
}

function Avatar({ article }: { article: Article }) {
  return (
    <span
      className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#e8e8ed] bg-cover bg-center shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
      style={{ backgroundImage: `url('${article.author.avatarUrl}')` }}
      aria-hidden
    >
      <span className="sr-only">{article.author.initials}</span>
    </span>
  );
}

function Pagination() {
  const scope = React.useId();
  const [page, setPage] = React.useState(1);
  const pages = [1, 2, 3, 8];
  const last = pages[pages.length - 1];

  const pill =
    "inline-flex h-9 items-center gap-1 rounded-full px-4 text-[14px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label="Pagination"
      className="mt-16 flex items-center justify-between gap-3 border-t border-black/[0.08] pt-6 dark:border-white/[0.1]"
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={page === 1}
        onClick={() => setPage((p) => (p === 8 ? 3 : Math.max(1, p - 1)))}
        className={cn(
          pill,
          "bg-[#e8e8ed] text-[#1d1d1f] hover:bg-[#dedee3] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c]",
          focusRing,
        )}
      >
        <ChevronLeft aria-hidden className="-ml-1 size-4" strokeWidth={2} />
        Previous
      </motion.button>

      <ul className="hidden items-center gap-1 sm:flex">
        {pages.map((n, index) => (
          <li key={n} className="flex items-center gap-1">
            {index === pages.length - 1 && (
              <span aria-hidden className="px-1.5 text-[14px] text-[#86868b]">
                …
              </span>
            )}
            <button
              type="button"
              aria-current={page === n ? "page" : undefined}
              aria-label={`Page ${n}`}
              onClick={() => setPage(n)}
              className={cn(
                "relative grid size-9 place-items-center rounded-full text-[14px] font-medium tabular-nums transition-colors",
                focusRing,
                page === n
                  ? "text-white dark:text-[#1d1d1f]"
                  : "text-[#6e6e73] hover:bg-black/[0.04] hover:text-[#1d1d1f] dark:text-[#a1a1a6] dark:hover:bg-white/[0.06] dark:hover:text-[#f5f5f7]",
              )}
            >
              {page === n && (
                <motion.span
                  layoutId={`${scope}-page`}
                  transition={SNAP}
                  className="absolute inset-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                />
              )}
              <span className="relative">{n}</span>
            </button>
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        disabled={page === last}
        onClick={() => setPage((p) => (p === 3 ? 8 : Math.min(last, p + 1)))}
        className={cn(pill, "bg-[#0071e3] text-white hover:bg-[#0077ed]", focusRing)}
      >
        Next
        <ChevronRight aria-hidden className="-mr-1 size-4" strokeWidth={2} />
      </motion.button>
    </nav>
  );
}

export default BlogHeaderFeaturedPosts;
