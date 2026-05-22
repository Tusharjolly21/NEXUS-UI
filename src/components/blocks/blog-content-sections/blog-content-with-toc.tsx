"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { BlogContentCentered } from "./blog-content-centered";

export type BlogContentWithTocProps = {
  className?: string;
};

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "key-areas", label: "Key Areas of AI Development" },
  { id: "ethics", label: "Ethical Considerations" },
  { id: "conclusion", label: "Conclusion" },
];

export function BlogContentWithToc({ className }: BlogContentWithTocProps) {
  const sectionIdPrefix = "blog-with-toc";

  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-[#f7f7f7] text-zinc-950 dark:bg-zinc-950 dark:text-white",
        className,
      )}
    >
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[250px_minmax(0,760px)] lg:px-10 lg:py-20">
        <aside className="hidden lg:block">
          <motion.nav
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="sticky top-10 space-y-1 text-sm text-zinc-500 dark:text-zinc-400"
            aria-label="Table of contents"
          >
            {tocItems.map((item, index) => (
              <a
                key={item.id}
                href={`#${sectionIdPrefix}-${item.id}`}
                className={cn(
                  "block rounded-xl px-3 py-2 transition hover:bg-white hover:text-zinc-950 hover:shadow-sm dark:hover:bg-white/8 dark:hover:text-white",
                  index === 1 && "border border-zinc-300 text-zinc-950 dark:border-white/25 dark:text-white",
                )}
              >
                {item.label}
              </a>
            ))}
          </motion.nav>
        </aside>

        <BlogContentCentered
          className="min-h-0 overflow-visible bg-transparent px-0 py-0"
          sectionIdPrefix={sectionIdPrefix}
        />
      </div>
    </section>
  );
}

export default BlogContentWithToc;
