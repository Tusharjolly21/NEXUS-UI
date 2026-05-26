"use client";

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
    title: "Blog Content Centered",
    description: "A narrow editorial article layout with large images and readable prose.",
    icon: FileText,
  },
  {
    title: "Blog Content With TOC",
    description: "Sticky section navigation for long single-post pages.",
    icon: ListTree,
  },
  {
    title: "Blog Content Editorial",
    description: "A premium split story layout for essays and launch notes.",
    icon: Newspaper,
  },
  {
    title: "Blog Header Featured Posts",
    description: "Featured hero story, category tabs, article grid, and pagination.",
    icon: PanelsTopLeft,
  },
  {
    title: "Blog Hover Image Card",
    description: "A compact editorial card with a sliding author image and arrow hover state.",
    icon: ImageIcon,
  },
];

export function BlogContentSectionsBlock({ className }: { className?: string }) {
  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-zinc-950 p-4 text-white sm:p-6 lg:p-8",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-violet-200/70">
                Blog Content Sections
              </p>
              <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Content sections for your single blog posts.
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-white/50">
              Drop in centered articles, table-of-contents posts, or editorial
              feature stories with polished spacing and responsive typography.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {variants.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <div className="grid size-10 place-items-center rounded-xl bg-white text-zinc-950">
                    <Icon className="size-4" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/54">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2 xl:grid-cols-5">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
              <div className="h-[520px] overflow-hidden">
                <BlogContentCentered className="h-full min-h-full" />
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
              <div className="h-[520px] overflow-hidden">
                <BlogContentWithToc className="h-full min-h-full" />
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-zinc-950">
              <div className="h-[520px] overflow-hidden">
                <BlogContentEditorial className="h-full min-h-full" />
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
              <div className="h-[520px] overflow-hidden">
                <BlogHeaderFeaturedPosts className="h-full min-h-full" />
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white">
              <div className="h-[520px] overflow-hidden">
                <BlogHoverImageCardShowcase className="h-full min-h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function BlogContentSectionsBlockPreview() {
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-3xl bg-[#f7f7f7] dark:bg-zinc-950">
      <div className="absolute left-1/2 top-0 w-[760px] -translate-x-1/2 scale-[0.52] origin-top">
        <BlogContentCentered className="h-[620px] min-h-0 overflow-hidden rounded-3xl py-10" />
      </div>
    </div>
  );
}

export default BlogContentSectionsBlock;
