"use client";

import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { Eye, SlidersHorizontal, UserCheck, Undo2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type BlogEditorialStat = { value: string; label: string };

export type BlogEditorialPrinciple = { title: string; text: string; icon: LucideIcon };

/** The three figures under the standfirst (the default for `stats`). */
export const BLOG_EDITORIAL_STATS: BlogEditorialStat[] = [
  { value: "8 min", label: "Read time" },
  { value: "Field", label: "Research" },
  { value: "2026", label: "Edition" },
];

/** The four principle cards in the story (the default for `principles`). */
export const BLOG_EDITORIAL_PRINCIPLES: BlogEditorialPrinciple[] = [
  { title: "Readable outputs", text: "Structure generated responses so people can scan, verify, and act.", icon: Eye },
  { title: "Visible controls", text: "Let people steer tone, depth, data sources, and confidence.", icon: SlidersHorizontal },
  { title: "Human checkpoints", text: "Build moments where review feels natural instead of disruptive.", icon: UserCheck },
  { title: "Calm recovery", text: "When the model is wrong, make correcting it the easy path.", icon: Undo2 },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80";

const RISE: Transition = { type: "spring", stiffness: 260, damping: 32 };

export type BlogContentEditorialProps = {
  /** Small grey label above the headline. */
  eyebrow?: string;
  /** The pinned headline. */
  title?: string;
  /** Standfirst under the headline. Leave empty to hide it. */
  description?: string;
  /** Byline name; its first two initials fill the monogram. */
  author?: string;
  /** Line under the author name. */
  authorRole?: string;
  /** Text of the blue link beside the byline. Leave empty to hide the link. */
  ctaLabel?: string;
  /** Where the link goes. */
  ctaHref?: string;
  /** Heading of the first story section. */
  sectionTitle?: string;
  /** Paragraph under that heading. */
  sectionBody?: string;
  /** Pull quote at the end of the story (curly quotes are added around it). Leave empty to hide it. */
  quote?: string;
  /** Name under the quote. Defaults to `author`. */
  quoteAttribution?: string;
  /** Figures under the standfirst (the first 3 are shown). */
  stats?: BlogEditorialStat[];
  /** Principle cards in the story. */
  principles?: BlogEditorialPrinciple[];
  /** The story image (cover-fitted). Defaults to an analytics-dashboard photo. */
  image?: string;
  /** Accessible description of the image. */
  imageAlt?: string;
  /** Merged onto the outer section. */
  className?: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function BlogContentEditorial({
  eyebrow = "Field notes, issue 14",
  title = "Designing AI products people can actually trust.",
  description = "What a year of interviews with product teams taught us about explaining, steering, and correcting machine output.",
  author = "Lena Okafor",
  authorRole = "Design lead, Fieldwork",
  ctaLabel = "Read the full issue ›",
  ctaHref = "#",
  sectionTitle = "Start with clarity, not magic.",
  sectionBody = "Teams adopt AI fastest when the interface explains what happened, what changed, and how a person can correct the outcome. The best systems feel powerful without becoming mysterious.",
  quote = "Trust is designed in layers: source, control, explanation, and a graceful way back when the output misses.",
  quoteAttribution,
  stats = BLOG_EDITORIAL_STATS,
  principles = BLOG_EDITORIAL_PRINCIPLES,
  image = DEFAULT_IMAGE,
  imageAlt = "Analytics dashboard and product research",
  className,
}: BlogContentEditorialProps) {
  const reduce = useReducedMotion();
  const statRows = (Array.isArray(stats) ? stats : []).slice(0, 3);
  const principleCards = Array.isArray(principles) ? principles : [];
  const imageUrl = image.trim() || DEFAULT_IMAGE;
  const attribution = quoteAttribution ?? author;

  const rise: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: RISE },
  };

  return (
    <section
      className={cn(
        "@container min-h-full w-full overflow-y-auto bg-white px-5 py-12 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:px-10 lg:py-20",
        className,
      )}
    >
      <article className="mx-auto grid w-full max-w-7xl gap-10 @5xl:grid-cols-[0.85fr_1.15fr] @5xl:gap-14">
        <motion.header
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
          className="flex flex-col @5xl:sticky @5xl:top-10 @5xl:self-start @5xl:pt-6"
        >
          <motion.p variants={rise} className="text-[15px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">
            {eyebrow}
          </motion.p>
          <motion.h1
            variants={rise}
            className="mt-4 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] @xl:text-[52px] @5xl:text-[60px] @5xl:leading-[1.03]"
          >
            {title}
          </motion.h1>
          {description ? (
            <motion.p
              variants={rise}
              className="mt-6 max-w-lg text-pretty text-[19px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6] @xl:text-[21px]"
            >
              {description}
            </motion.p>
          ) : null}

          <motion.dl
            variants={rise}
            className="mt-10 grid max-w-md grid-cols-3 divide-x divide-black/[0.08] border-y border-black/[0.08] dark:divide-white/[0.1] dark:border-white/[0.1]"
          >
            {statRows.map(({ value, label }, i) => (
              <div key={`${i}-${label}`} className="flex flex-col-reverse px-4 py-4 first:pl-0">
                <dt className="mt-1 text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{label}</dt>
                <dd className="text-[24px] font-semibold leading-none tracking-[-0.025em]">{value}</dd>
              </div>
            ))}
          </motion.dl>

          <motion.div variants={rise} className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-full bg-[linear-gradient(180deg,#a1a1a6,#86868b)] text-[12px] font-semibold text-white dark:bg-[linear-gradient(180deg,#8e8e93,#636366)]"
              >
                {initials(author)}
              </span>
              <div className="text-[14px] leading-tight">
                <p className="font-semibold">{author}</p>
                <p className="mt-0.5 text-[#86868b] dark:text-[#98989d]">{authorRole}</p>
              </div>
            </div>
            {ctaLabel ? (
              <a
                href={ctaHref || "#"}
                className="rounded-sm text-[15px] font-medium text-[#0066cc] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:text-[#2997ff]"
              >
                {ctaLabel}
              </a>
            ) : null}
          </motion.div>
        </motion.header>

        <div className="min-w-0">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 30, delay: 0.2 }}
            whileHover="zoom"
            className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-24px_rgba(0,0,0,.25)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)] @xl:aspect-[16/10]"
          >
            <motion.div
              variants={{ zoom: { scale: reduce ? 1 : 1.03 } }}
              transition={{ type: "spring", stiffness: 120, damping: 24 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${JSON.stringify(imageUrl)})` }}
              role="img"
              aria-label={imageAlt}
            />
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ staggerChildren: 0.07 }}
            className="mt-12 space-y-12 @5xl:px-2"
          >
            <motion.section variants={rise}>
              <h2 className="text-[28px] font-semibold leading-[1.12] tracking-[-0.025em] @xl:text-[32px]">
                {sectionTitle}
              </h2>
              <p className="mt-4 text-[17px] leading-[1.6] text-[#1d1d1f]/85 dark:text-[#f5f5f7]/85">
                {sectionBody}
              </p>
            </motion.section>

            <motion.ul variants={rise} className="grid gap-3 @xl:grid-cols-2">
              {principleCards.map(({ title: cardTitle, text, icon: Icon }, i) => (
                <li
                  key={`${i}-${cardTitle}`}
                  className="rounded-[20px] bg-[#f5f5f7] p-5 dark:bg-[#1c1c1e]"
                >
                  <Icon aria-hidden strokeWidth={1.75} className="size-5 text-[#0071e3] dark:text-[#2997ff]" />
                  <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.01em]">{cardTitle}</h3>
                  <p className="mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{text}</p>
                </li>
              ))}
            </motion.ul>

            {quote ? (
              <motion.blockquote variants={rise} className="border-t border-black/[0.08] pt-8 dark:border-white/[0.1]">
                <p className="text-balance text-[26px] font-semibold leading-[1.22] tracking-[-0.025em] @xl:text-[30px]">
                  “{quote}”
                </p>
                {attribution ? (
                  <footer className="mt-4 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{attribution}</footer>
                ) : null}
              </motion.blockquote>
            ) : null}
          </motion.div>
        </div>
      </article>
    </section>
  );
}

export default BlogContentEditorial;
