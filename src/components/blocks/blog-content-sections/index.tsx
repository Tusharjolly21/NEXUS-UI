"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { FileText, ImageIcon, ListTree, Newspaper, PanelsTopLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BlogContentCentered } from "./blog-content-centered";
import { BlogContentEditorial } from "./blog-content-editorial";
import { BlogHeaderFeaturedPosts } from "./blog-header-featured-posts";
import { BlogHoverImageCardShowcase } from "./blog-hover-image-card";
import { BlogContentWithToc } from "./blog-content-with-toc";

export { BlogContentCentered } from "./blog-content-centered";
export type { BlogContentCenteredProps } from "./blog-content-centered";
export { BlogContentEditorial } from "./blog-content-editorial";
export type { BlogContentEditorialProps } from "./blog-content-editorial";
export { BlogHeaderFeaturedPosts } from "./blog-header-featured-posts";
export type { BlogHeaderFeaturedPostsProps } from "./blog-header-featured-posts";
export { BlogHoverImageCard, BlogHoverImageCardShowcase } from "./blog-hover-image-card";
export type { BlogHoverImageCardProps } from "./blog-hover-image-card";
export { BlogContentWithToc } from "./blog-content-with-toc";
export type { BlogContentWithTocProps } from "./blog-content-with-toc";

const variants = [
  {
    title: "Centered article",
    description: "A narrow editorial column with a wide hero image and readable prose.",
    icon: FileText,
  },
  {
    title: "Article with contents",
    description: "A sticky table of contents that follows the reader through long posts.",
    icon: ListTree,
  },
  {
    title: "Editorial split",
    description: "A pinned headline beside the story, for essays and launch notes.",
    icon: Newspaper,
  },
  {
    title: "Journal index",
    description: "Featured story, category filter, sortable article grid, and pagination.",
    icon: PanelsTopLeft,
  },
  {
    title: "Hover image card",
    description: "A compact card whose author portrait rises out of the image on hover.",
    icon: ImageIcon,
  },
];

const frame =
  "overflow-hidden rounded-[22px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-black dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]";

export function BlogContentSectionsBlock({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 260, damping: 32 },
    },
  };

  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-[#f5f5f7] px-5 py-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:py-20",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.06 }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <motion.p variants={rise} className="text-[17px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">
                Blog content sections
              </motion.p>
              <motion.h2
                variants={rise}
                className="mt-2 max-w-2xl text-balance text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[48px]"
              >
                Sections for every kind of story.
              </motion.h2>
            </div>
            <motion.p
              variants={rise}
              className="max-w-md text-[17px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]"
            >
              Centered articles, long reads with contents, editorial features, and
              journal indexes, all with the same calm type and spacing.
            </motion.p>
          </div>

          <ul className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {variants.map((item) => {
              const Icon = item.icon;
              return (
                <motion.li
                  key={item.title}
                  variants={rise}
                  className="rounded-[20px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.04)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.06)]"
                >
                  <Icon aria-hidden strokeWidth={1.75} className="size-5 text-[#0071e3] dark:text-[#2997ff]" />
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{item.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">
                    {item.description}
                  </p>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
          <div className={frame}>
            <div className="h-[520px] overflow-hidden">
              <BlogContentCentered className="h-full min-h-full" />
            </div>
          </div>
          <div className={frame}>
            <div className="h-[520px] overflow-hidden">
              <BlogContentWithToc className="h-full min-h-full" />
            </div>
          </div>
          <div className={frame}>
            <div className="h-[520px] overflow-hidden">
              <BlogContentEditorial className="h-full min-h-full" />
            </div>
          </div>
          <div className={frame}>
            <div className="h-[520px] overflow-hidden">
              <BlogHeaderFeaturedPosts className="h-full min-h-full" />
            </div>
          </div>
          <div className={frame}>
            <div className="h-[520px] overflow-hidden">
              <BlogHoverImageCardShowcase className="h-full min-h-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogContentSectionsBlockPreview() {
  return (
    <div className="relative flex h-[320px] w-full items-center justify-center overflow-hidden bg-[#f5f5f7] dark:bg-black">
      <div data-tile-focus className="w-[1060px] shrink-0">
        <div className="flex items-end justify-between gap-6 px-6">
          <div>
            <p className="text-[15px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">From the journal</p>
            <h2 className="mt-1.5 text-[34px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">
              Notes on building calmer products
            </h2>
          </div>
          <span className="mb-1 shrink-0 text-[15px] font-medium text-[#0066cc] dark:text-[#2997ff]">
            All 48 posts ›
          </span>
        </div>
        <BlogHoverImageCardShowcase className="min-h-0 items-start p-6 pt-8 [&>div]:max-w-none [&>div]:!grid-cols-3" />
      </div>
    </div>
  );
}

export default BlogContentSectionsBlock;
