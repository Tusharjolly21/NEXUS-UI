"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ArticleTag = {
  name: string;
  tone: "violet" | "blue" | "emerald" | "rose" | "amber" | "slate";
};

type Article = {
  id: string;
  title: string;
  summary: string;
  category: string;
  thumbnailUrl: string;
  publishedAt: string;
  readingTime: string;
  author: {
    name: string;
    initials: string;
    avatarUrl: string;
  };
  tags: ArticleTag[];
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
    "A practical look at how reusable sections, motion rules, and clean visual language help teams ship polished product pages without rebuilding the same pieces.",
  category: "Systems",
  thumbnailUrl:
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=80",
  publishedAt: "22 May 2026",
  readingTime: "10 min read",
  author: {
    name: "Ariana Reed",
    initials: "AR",
    avatarUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
  },
  tags: [
    { name: "Systems", tone: "slate" },
    { name: "Components", tone: "slate" },
    { name: "Launch", tone: "slate" },
  ],
};

const articles: Article[] = [
  {
    id: "article-1",
    title: "A field guide to reusable hero sections",
    summary: "How to compose headlines, CTAs, visuals, and trust signals into hero blocks that actually convert.",
    category: "Systems",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=900&q=80",
    publishedAt: "21 May 2026",
    readingTime: "7 min read",
    author: {
      name: "Nina Kapoor",
      initials: "NK",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "Hero", tone: "violet" },
      { name: "Conversion", tone: "blue" },
      { name: "UX", tone: "rose" },
    ],
  },
  {
    id: "article-2",
    title: "Motion rules for premium SaaS pages",
    summary: "A simple system for entrances, hover states, scroll effects, and animation timing that feels expensive.",
    category: "Motion",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=900&q=80",
    publishedAt: "20 May 2026",
    readingTime: "9 min read",
    author: {
      name: "Ishan Mehta",
      initials: "IM",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "Framer Motion", tone: "blue" },
      { name: "Timing", tone: "rose" },
    ],
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
    author: {
      name: "Theo Banerjee",
      initials: "TB",
      avatarUrl:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "React", tone: "emerald" },
      { name: "Props", tone: "slate" },
    ],
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
    author: {
      name: "Maya Sen",
      initials: "MS",
      avatarUrl:
        "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "Checklist", tone: "violet" },
      { name: "Launch", tone: "slate" },
    ],
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
    author: {
      name: "Rhea Thomas",
      initials: "RT",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "Bento", tone: "blue" },
      { name: "Layout", tone: "amber" },
    ],
  },
  {
    id: "article-6",
    title: "Making docs pages feel like product",
    summary: "Navigation, examples, code previews, and copy details that help users trust a component library.",
    category: "Frontend",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
    publishedAt: "16 May 2026",
    readingTime: "5 min read",
    author: {
      name: "Dev Arora",
      initials: "DA",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=160&q=80",
    },
    tags: [
      { name: "Docs", tone: "violet" },
      { name: "DX", tone: "blue" },
    ],
  },
];

export function BlogHeaderFeaturedPosts({
  className,
  eyebrow = "Nexus journal",
  title = "Design notes for faster launches",
  description = "Practical writing on component systems, polished motion, frontend craft, and launch-ready product pages.",
}: BlogHeaderFeaturedPostsProps) {
  const [activeTab, setActiveTab] = React.useState("all");
  const [sortBy, setSortBy] = React.useState(sortOptions[0]);

  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-white px-5 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-8 lg:px-10 lg:py-18",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        </header>

        <FeaturedArticle article={featuredArticle} />

        <div className="mt-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 dark:border-white/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "whitespace-nowrap border-b-2 px-1.5 pb-3 pr-4 text-sm font-semibold transition",
                  activeTab === tab.id
                    ? "border-zinc-950 text-zinc-950 dark:border-white dark:text-white"
                    : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <label className="relative w-full md:max-w-48">
            <span className="sr-only">Sort articles</span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3.5 pr-10 text-sm font-medium text-zinc-800 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/10 dark:border-white/10 dark:bg-white/5 dark:text-white"
            >
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
          </label>
        </div>

        <ul className="mt-10 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard article={article} />
            </li>
          ))}
        </ul>

        <Pagination />
      </div>
    </section>
  );
}

function FeaturedArticle({ article }: { article: Article }) {
  return (
    <a
      href="#"
      className="group relative mt-14 hidden min-h-[560px] overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 shadow-2xl shadow-zinc-950/8 outline-none transition focus-visible:ring-4 focus-visible:ring-violet-500/20 dark:border-white/10 dark:bg-white/5 md:block lg:min-h-[640px]"
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${article.thumbnailUrl}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/72 via-zinc-950/8 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10">
        <div className="flex flex-col gap-7">
          <div>
            <div className="flex gap-5">
              <h2 className="flex-1 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {article.title}
              </h2>
              <ArrowUpRight className="mt-2 size-7 shrink-0 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-white/82 sm:text-lg">
              {article.summary}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="flex flex-wrap gap-8">
              <MetaBlock label="Written by">
                <div className="flex items-center gap-2">
                  <AvatarChip article={article} />
                  <span>{article.author.name}</span>
                </div>
              </MetaBlock>
              <MetaBlock label="Published on">
                <span className="inline-flex h-10 items-center">{article.publishedAt}</span>
              </MetaBlock>
            </div>

            <MetaBlock label="Filed under">
              <div className="flex h-10 items-center gap-2">
                {article.tags.map((tag) => (
                  <span key={tag.name} className="rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-white/90">
                    {tag.name}
                  </span>
                ))}
              </div>
            </MetaBlock>
          </div>
        </div>
      </div>
    </a>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <a href="#" className="group block outline-none">
      <div
        className="aspect-[1.45/1] overflow-hidden rounded-2xl border border-zinc-200 bg-cover bg-center shadow-lg shadow-zinc-950/5 transition group-hover:shadow-xl group-hover:shadow-zinc-950/10 dark:border-white/10"
        style={{ backgroundImage: `url('${article.thumbnailUrl}')` }}
        role="img"
        aria-label={article.title}
      >
        <div className="h-full w-full bg-gradient-to-t from-zinc-950/18 via-transparent to-white/8 transition group-hover:bg-zinc-950/5" />
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-violet-600 dark:text-violet-300">
          {article.category}
        </p>
        <div className="mt-2 flex gap-3">
          <h3 className="flex-1 text-xl font-semibold tracking-tight text-zinc-950 transition group-hover:text-violet-700 dark:text-white dark:group-hover:text-violet-200">
            {article.title}
          </h3>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-zinc-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-950 dark:group-hover:text-white" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {article.summary}
        </p>

        <div className="mt-5 flex items-center gap-3">
          <AvatarChip article={article} dark />
          <div>
            <p className="text-sm font-semibold text-zinc-950 dark:text-white">{article.author.name}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {article.publishedAt} · {article.readingTime}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag.name}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                tagStyles[tag.tone],
              )}
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function AvatarChip({ article, dark = false }: { article: Article; dark?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border bg-cover bg-center text-xs font-bold",
        dark ? "border-zinc-200 dark:border-white/10" : "border-white/40",
      )}
      style={{ backgroundImage: `url('${article.author.avatarUrl}')` }}
      aria-label={article.author.name}
    >
      <span className="sr-only">{article.author.initials}</span>
    </span>
  );
}

function MetaBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 text-sm font-semibold text-white">
      <p>{label}</p>
      <div>{children}</div>
    </div>
  );
}

function Pagination() {
  return (
    <nav className="mt-14 flex items-center justify-between border-t border-zinc-200 pt-5 text-sm font-semibold text-zinc-700 dark:border-white/10 dark:text-zinc-300">
      <a href="#" className="inline-flex items-center gap-2 transition hover:text-zinc-950 dark:hover:text-white">
        <ArrowLeft className="size-4" />
        Previous
      </a>
      <div className="hidden items-center gap-1 sm:flex">
        {[1, 2, 3].map((page) => (
          <a
            key={page}
            href="#"
            className={cn(
              "grid size-9 place-items-center rounded-full transition",
              page === 1
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "hover:bg-zinc-100 dark:hover:bg-white/10",
            )}
          >
            {page}
          </a>
        ))}
        <span className="px-2 text-zinc-400">...</span>
        <a href="#" className="grid size-9 place-items-center rounded-full transition hover:bg-zinc-100 dark:hover:bg-white/10">
          8
        </a>
      </div>
      <a href="#" className="inline-flex items-center gap-2 transition hover:text-zinc-950 dark:hover:text-white">
        Next
        <ArrowRight className="size-4" />
      </a>
    </nav>
  );
}

const tagStyles: Record<ArticleTag["tone"], string> = {
  violet: "bg-violet-50 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-400/10 dark:text-violet-200 dark:ring-violet-400/20",
  blue: "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-400/10 dark:text-sky-200 dark:ring-sky-400/20",
  emerald: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-200 dark:ring-emerald-400/20",
  rose: "bg-rose-50 text-rose-700 ring-1 ring-rose-200 dark:bg-rose-400/10 dark:text-rose-200 dark:ring-rose-400/20",
  amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-400/10 dark:text-amber-200 dark:ring-amber-400/20",
  slate: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200 dark:bg-white/10 dark:text-zinc-200 dark:ring-white/10",
};

export default BlogHeaderFeaturedPosts;
