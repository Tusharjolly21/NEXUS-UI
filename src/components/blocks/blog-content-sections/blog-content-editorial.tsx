"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BlogContentEditorialProps = {
  className?: string;
};

const image =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80";

export function BlogContentEditorial({ className }: BlogContentEditorialProps) {
  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-zinc-950 px-5 py-10 text-white sm:px-8 lg:px-10 lg:py-14",
        className,
      )}
    >
      <article className="mx-auto grid w-full max-w-7xl gap-8 lg:min-h-[760px] lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 sm:p-8 lg:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_16%,rgba(124,58,237,0.24),transparent_32%),radial-gradient(circle_at_82%_76%,rgba(14,165,233,0.20),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-[13px] font-medium text-violet-200/80">
                Field notes, issue 14
              </p>
              <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Designing AI products people can actually trust.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
                A practical editorial layout for opinion pieces, product essays,
                founder notes, and long-form launch stories.
              </p>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                ["8 min", "read time"],
                ["Field", "research"],
                ["2026", "edition"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-lg font-semibold">{value}</p>
                  <p className="mt-1 text-[12px] text-white/55">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.header>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white text-zinc-950 shadow-2xl shadow-black/30 dark:bg-zinc-900 dark:text-white">
          <div
            className="h-72 bg-cover bg-center sm:h-96"
            style={{ backgroundImage: `url('${image}')` }}
            role="img"
            aria-label="Analytics dashboard and product research"
          >
            <div className="h-full w-full bg-gradient-to-t from-zinc-950/45 via-transparent to-transparent" />
          </div>

          <div className="space-y-8 p-6 sm:p-8 lg:p-10">
            <section>
              <h2 className="text-2xl font-semibold tracking-tight">Start with clarity, not magic.</h2>
              <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-300">
                Teams adopt AI fastest when the interface explains what happened,
                what changed, and how a person can correct the outcome. The best
                systems feel powerful without becoming mysterious.
              </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {[
                ["Readable outputs", "Structure generated responses so people can scan, verify, and act."],
                ["Visible controls", "Let users steer tone, depth, data sources, and confidence."],
                ["Human checkpoints", "Build moments where review is natural instead of disruptive."],
                ["Calm recovery", "When the model is wrong, the interface should make correction easy."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-white/5">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">{text}</p>
                </div>
              ))}
            </section>

            <blockquote className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 text-lg font-medium leading-8 dark:border-white/10 dark:bg-white/5">
              “Trust is designed in layers: source, control, explanation, and a
              graceful way back when the output misses.”
            </blockquote>
          </div>
        </div>
      </article>
    </section>
  );
}

export default BlogContentEditorial;
