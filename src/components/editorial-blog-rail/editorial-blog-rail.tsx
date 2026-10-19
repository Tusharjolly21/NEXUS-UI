"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorialPost = {
  title: string;
  category: string;
  date: string;
  readTime: string;
  href?: string;
  excerpt?: string;
  author?: { name: string; role?: string };
  /** Two colours for the generated cover art. */
  cover?: [string, string];
};

export type EditorialRailProps = {
  heading?: string;
  /** Link for the "View all" action. */
  allHref?: string;
  featured?: EditorialPost;
  posts?: EditorialPost[];
  className?: string;
};

const FEATURED: EditorialPost = {
  title: "Designing scroll choreography that people actually feel",
  category: "Guide",
  date: "Oct 14",
  readTime: "12 min read",
  excerpt:
    "Pacing, anchors and the three-beat rule: how we stage scroll-linked motion so it explains the product instead of decorating it.",
  author: { name: "Mara Okafor", role: "Design engineer" },
  cover: ["#6366f1", "#f472b6"],
  href: "#",
};

const POSTS: EditorialPost[] = [
  { title: "Springs, not curves: tuning motion by feel", category: "Craft", date: "Oct 09", readTime: "7 min", href: "#" },
  { title: "Shipping a design system in six weeks", category: "Case study", date: "Oct 02", readTime: "9 min", href: "#" },
  { title: "The quiet power of a 1px hairline", category: "Details", date: "Sep 26", readTime: "4 min", href: "#" },
  { title: "Reduced motion is a design brief, not a toggle", category: "Accessibility", date: "Sep 18", readTime: "6 min", href: "#" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

/** A magazine-style rail: one featured story with generated cover art beside a numbered list. */
export function EditorialRail({
  heading = "From the journal",
  allHref = "#",
  featured = FEATURED,
  posts = POSTS,
  className,
}: EditorialRailProps) {
  const reduce = useReducedMotion();
  const [a, b] = featured.cover ?? ["#6366f1", "#f472b6"];

  return (
    <section
      className={cn(
        "flex w-full flex-col rounded-[28px] border border-zinc-200/80 bg-white p-6 text-zinc-950 md:p-8",
        "dark:border-white/10 dark:bg-zinc-950 dark:text-white",
        className,
      )}
    >
      <header className="flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{heading}</h2>
        <a
          href={allHref}
          className="inline-flex items-center gap-1 text-[13.5px] font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
        >
          View all <ArrowUpRight className="size-3.5" />
        </a>
      </header>

      <div className="mt-6 grid flex-1 gap-6 md:grid-cols-[1.15fr_1fr]">
        <motion.a
          href={featured.href ?? "#"}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="group flex flex-col overflow-hidden rounded-[22px] border border-zinc-200/80 bg-zinc-50 dark:border-white/10 dark:bg-white/[0.03]"
        >
          <div className="relative aspect-[16/9] overflow-hidden" aria-hidden>
            <div
              className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
              style={{
                background: `radial-gradient(120% 90% at 15% 20%, ${a} 0%, transparent 55%), radial-gradient(90% 90% at 90% 80%, ${b} 0%, transparent 60%), #0b0b10`,
              }}
            />
            <svg className="absolute inset-0 size-full opacity-[0.35] mix-blend-overlay" viewBox="0 0 400 225" preserveAspectRatio="none">
              {Array.from({ length: 9 }).map((_, i) => (
                <path
                  key={i}
                  d={`M -20 ${40 + i * 22} C 120 ${10 + i * 22}, 260 ${90 + i * 18}, 420 ${30 + i * 24}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="1"
                />
              ))}
            </svg>
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-[11.5px] font-semibold text-zinc-950 backdrop-blur">
              {featured.category}
            </span>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="text-[19px] font-semibold leading-snug tracking-[-0.02em] [text-wrap:balance]">
              {featured.title}
            </h3>
            {featured.excerpt ? (
              <p className="mt-2 line-clamp-2 text-[14px] leading-relaxed text-zinc-500 dark:text-zinc-400">{featured.excerpt}</p>
            ) : null}
            <div className="mt-auto flex items-center gap-3 pt-5 text-[12.5px] text-zinc-500 dark:text-zinc-400">
              {featured.author ? (
                <>
                  <span
                    className="grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
                  >
                    {initials(featured.author.name)}
                  </span>
                  <span className="font-medium text-zinc-950 dark:text-white">{featured.author.name}</span>
                  <span aria-hidden>·</span>
                </>
              ) : null}
              <span>{featured.date}</span>
              <span aria-hidden>·</span>
              <span>{featured.readTime}</span>
            </div>
          </div>
        </motion.a>

        <ol className="flex flex-col divide-y divide-zinc-200/80 dark:divide-white/10">
          {posts.map((p, i) => (
            <motion.li
              key={p.title}
              initial={reduce ? false : { opacity: 0, x: 8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
              className="flex-1"
            >
              <a href={p.href ?? "#"} className="group flex h-full items-start gap-4 py-4 first:pt-0">
                <span className="w-6 shrink-0 pt-0.5 font-mono text-[12px] tabular-nums text-zinc-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-300">
                    {p.category}
                  </span>
                  <span className="mt-1 block text-[15px] font-medium leading-snug tracking-[-0.01em] transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                    {p.title}
                  </span>
                  <span className="mt-1.5 block text-[12.5px] text-zinc-500 dark:text-zinc-400">
                    {p.date} · {p.readTime}
                  </span>
                </span>
                <ArrowUpRight className="mt-1 size-4 shrink-0 text-zinc-300 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-zinc-950 dark:text-zinc-600 dark:group-hover:text-white" />
              </a>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
