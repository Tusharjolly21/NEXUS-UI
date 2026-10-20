"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
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
  /** Where the card links to. */
  href?: string;
};

const defaultMainImage =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

const defaultHoverImage =
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80";

const LIFT: Transition = { type: "spring", stiffness: 380, damping: 30 };
const SLIDE: Transition = { type: "spring", stiffness: 420, damping: 32 };
const ZOOM: Transition = { type: "spring", stiffness: 120, damping: 22 };

export function BlogHoverImageCard({
  className,
  author = "Noah Williams",
  title = "Designing launch pages with reusable UI systems",
  tag = "Design systems",
  date = "23 May '26",
  mainImage = defaultMainImage,
  hoverImage = defaultHoverImage,
  tagClassName,
  arrowClassName,
  href = "#",
}: BlogHoverImageCardProps) {
  const reduce = useReducedMotion();
  const [focused, setFocused] = React.useState(false);

  const card: Variants = {
    rest: {
      y: 0,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 12px 32px -24px rgba(0,0,0,0.2)",
    },
    hover: {
      y: reduce ? 0 : -4,
      boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 28px 48px -24px rgba(0,0,0,0.32)",
    },
  };

  return (
    <motion.article
      variants={card}
      initial="rest"
      animate={focused ? "hover" : "rest"}
      whileHover="hover"
      transition={LIFT}
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      className={cn(
        "group relative flex h-[425px] w-full max-w-[300px] cursor-pointer flex-col gap-4 rounded-[24px] bg-white p-2.5 text-[#1d1d1f] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[#0071e3] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]",
        className,
      )}
    >
      <div className="relative flex-1 overflow-hidden rounded-[18px] bg-[#f5f5f7] dark:bg-[#2c2c2e]">
        <motion.div
          variants={{ rest: { scale: 1 }, hover: { scale: reduce ? 1 : 1.05 } }}
          transition={ZOOM}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${mainImage}')` }}
          role="img"
          aria-label={title}
        />

        {/* Author portrait rises out of a notch cut into the image corner. */}
        <motion.div
          variants={{
            rest: reduce ? { opacity: 0 } : { y: 112 },
            hover: reduce ? { opacity: 1 } : { y: 0 },
          }}
          transition={SLIDE}
          className="absolute bottom-0 left-0 flex h-28 w-[92px] flex-col overflow-hidden"
        >
          <Corner className="left-0 top-0" />
          <div className="flex h-[100px] w-full">
            <div className="flex h-[100px] w-20 items-center justify-center rounded-tr-[16px] bg-white dark:bg-[#1c1c1e]">
              <div
                className="h-20 w-[60px] rounded-[10px] bg-[#e8e8ed] bg-cover bg-center dark:bg-[#3a3a3c]"
                style={{ backgroundImage: `url('${hoverImage}')` }}
                role="img"
                aria-label={`${author} portrait`}
              />
            </div>
            <div className="relative h-[100px] w-3 overflow-hidden">
              <Corner className="left-0 top-[88px]" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="space-y-3 px-2 pb-2">
        <p className="text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{author}</p>
        <h3 className="line-clamp-2 text-[19px] font-semibold leading-[1.2] tracking-[-0.02em]">
          <a href={href} className="outline-none after:absolute after:inset-0 after:rounded-[24px]">
            {title}
          </a>
        </h3>

        <div className="relative flex items-center gap-3 pt-1">
          <span
            className={cn(
              "max-w-[150px] truncate rounded-full bg-[#f5f5f7] px-3 py-1 text-[12px] font-medium text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]",
              tagClassName,
            )}
          >
            {tag}
          </span>
          <span className="min-w-0 flex-1 truncate text-[13px] tabular-nums text-[#86868b] dark:text-[#98989d]">
            {date}
          </span>
          <motion.span
            aria-hidden
            variants={{
              rest: { x: reduce ? 0 : 10, opacity: 0, scale: reduce ? 1 : 0.8 },
              hover: { x: 0, opacity: 1, scale: 1 },
            }}
            transition={SLIDE}
            className={cn(
              "grid size-7 shrink-0 place-items-center rounded-full bg-[#0071e3] text-white",
              arrowClassName,
            )}
          >
            <ArrowUpRight className="size-4" strokeWidth={2} />
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
        "flex min-h-full w-full items-center justify-center overflow-y-auto bg-[#f5f5f7] p-6 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]",
        className,
      )}
    >
      <div className="grid w-full max-w-5xl justify-items-center gap-6 sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3">
        <BlogHoverImageCard
          author="Noah Williams"
          title="Designing launch pages with reusable UI systems"
          tag="Design systems"
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
        />
        <BlogHoverImageCard
          author="Theo Banerjee"
          title="A practical guide to product stories that feel premium"
          tag="Launch"
          date="14 May '26"
          mainImage="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80"
          hoverImage="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=500&q=80"
        />
      </div>
    </section>
  );
}

function Corner({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={cn("absolute size-3 text-white dark:text-[#1c1c1e]", className)}
      aria-hidden="true"
    >
      <path d="M0 12H12C5.373 12 0 6.627 0 0Z" fill="currentColor" />
    </svg>
  );
}

export default BlogHoverImageCard;
