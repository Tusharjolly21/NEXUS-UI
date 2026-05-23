"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BlogHoverImageCardProps = {
  className?: string;
  author?: string;
  title?: string;
  tag?: string;
  date?: string;
  mainImage?: string;
  hoverImage?: string;
  tagClassName?: string;
  arrowClassName?: string;
};

const defaultMainImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const defaultHoverImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";

export function BlogHoverImageCard({
  className,
  author = "Noah Williams",
  title = "Designing launch pages with reusable UI systems",
  tag = "Design Systems",
  date = "23 May '26",
  mainImage = defaultMainImage,
  hoverImage = defaultHoverImage,
  tagClassName,
  arrowClassName,
}: BlogHoverImageCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      initial="rest"
      whileHover="hover"
      animate="rest"
      className={cn(
        "group relative flex h-[425px] w-full max-w-[300px] cursor-pointer flex-col gap-4 overflow-hidden rounded-[14px] bg-white text-zinc-950",
        className,
      )}
    >
      <div
        className="relative flex-1 overflow-hidden rounded-xl bg-cover bg-center"
        style={{ backgroundImage: `url('${mainImage}')` }}
        role="img"
        aria-label={title}
      >
        <motion.div
          variants={{
            rest: { scale: 1 },
            hover: { scale: shouldReduceMotion ? 1 : 1.04 },
          }}
          transition={{ duration: 0.45, ease: [0.35, 0.13, 0, 0.99] }}
          className="absolute inset-0 bg-gradient-to-t from-zinc-950/16 via-transparent to-white/10"
        />

        <motion.div
          variants={{
            rest: { y: 112 },
            hover: { y: 0 },
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.35, 0.13, 0, 0.99] }}
          className="absolute bottom-0 left-0 flex h-28 w-[92px] flex-col overflow-hidden"
        >
          <Corner className="left-0 top-0 rotate-0" />
          <div className="flex h-[100px] w-full">
            <div className="flex h-[100px] w-20 items-center justify-center rounded-bl-xl rounded-tr-xl bg-white">
              <div
                className="h-20 w-[60px] rounded-md bg-cover bg-center"
                style={{ backgroundImage: `url('${hoverImage}')` }}
                role="img"
                aria-label={`${author} portrait`}
              />
            </div>
            <div className="relative h-[100px] w-3 overflow-hidden">
              <Corner className="left-0 top-[88px] rotate-0" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-4">
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">{author}</p>
          <h3 className="line-clamp-2 text-lg font-medium leading-snug text-zinc-700">
            {title}
          </h3>
        </div>

        <div className="relative flex items-center justify-between gap-3">
          <span
            className={cn(
              "max-w-[150px] truncate rounded-full bg-zinc-200 px-3 py-1.5 text-sm text-zinc-600",
              tagClassName,
            )}
          >
            {tag}
          </span>
          <span className="min-w-0 flex-1 truncate px-1.5 py-1.5 text-sm text-zinc-900">
            {date}
          </span>
          <motion.span
            variants={{
              rest: { x: 18 },
              hover: { x: 0 },
            }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: [0.35, 0.13, 0, 0.99] }}
            className={cn(
              "absolute right-0 top-1/2 grid size-4 -translate-y-1/2 place-items-center rounded bg-zinc-950 text-white",
              arrowClassName,
            )}
          >
            <ArrowUpRight className="size-3" strokeWidth={1.8} />
          </motion.span>
        </div>
      </div>
    </motion.article>
  );
}

export function BlogHoverImageCardShowcase({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "flex min-h-full w-full items-center justify-center overflow-y-auto bg-white p-6 text-zinc-950 dark:bg-zinc-950",
        className,
      )}
    >
      <div className="grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <BlogHoverImageCard
          author="Noah Williams"
          title="Designing launch pages with reusable UI systems"
          tag="Design Systems"
          date="23 May '26"
          mainImage="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
          hoverImage="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80"
        />
        <BlogHoverImageCard
          author="Ariana Reed"
          title="How animated cards create a stronger editorial rhythm"
          tag="Motion"
          date="18 May '26"
          mainImage="https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80"
          hoverImage="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=500&q=80"
          tagClassName="bg-violet-100 text-violet-700"
          arrowClassName="bg-violet-600"
        />
        <BlogHoverImageCard
          author="Theo Banerjee"
          title="A practical guide to product stories that feel premium"
          tag="Launch"
          date="14 May '26"
          mainImage="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
          hoverImage="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=500&q=80"
          tagClassName="bg-sky-100 text-sky-700"
          arrowClassName="bg-sky-600"
        />
      </div>
    </section>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("absolute size-3 text-white", className)}
      aria-hidden="true"
    >
      <path d="M0 12H12C5.373 12 0 6.627 0 0Z" fill="currentColor" />
    </svg>
  );
}

export default BlogHoverImageCard;
