"use client";

import * as React from "react";
import { motion, useReducedMotion, type Transition, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type BlogContentCenteredProps = {
  className?: string;
  title?: string;
  author?: string;
  date?: string;
  heroImage?: string;
  secondaryImage?: string;
  sectionIdPrefix?: string;
  /** Small label above the headline. */
  category?: string;
  /** Standfirst shown under the headline. */
  dek?: string;
  readingTime?: string;
};

const defaultHeroImage =
  "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1600&q=80";

const defaultSecondaryImage =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80";

const RISE: Transition = { type: "spring", stiffness: 260, damping: 32 };

function useRise(): Variants {
  const reduce = useReducedMotion();
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 16, filter: "blur(6px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: RISE },
  };
}

export function BlogContentCentered({
  className,
  title = "The future of artificial intelligence",
  author = "Ava Sterling",
  date = "February 14, 2026",
  heroImage = defaultHeroImage,
  secondaryImage = defaultSecondaryImage,
  sectionIdPrefix = "blog-centered",
  category = "Feature",
  dek = "AI is leaving the demo stage and settling into the quiet parts of everyday work. Here is what that shift asks of the people who design it.",
  readingTime = "6 min read",
}: BlogContentCenteredProps) {
  const reduce = useReducedMotion();
  const rise = useRise();

  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-white px-5 py-14 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:py-24",
        className,
      )}
    >
      <article className="mx-auto w-full max-w-[860px]">
        <motion.header
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
          className="mx-auto max-w-[680px]"
        >
          <motion.p
            variants={rise}
            className="text-[14px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]"
          >
            {category}
            <span aria-hidden className="mx-2 text-[#a1a1a6] dark:text-[#636366]">
              ·
            </span>
            <time className="font-normal">{date}</time>
          </motion.p>
          <motion.h1
            variants={rise}
            className="mt-3 text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[48px] sm:leading-[1.05]"
          >
            {title}
          </motion.h1>
          {dek && (
            <motion.p
              variants={rise}
              className="mt-5 text-pretty text-[19px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6] sm:text-[21px]"
            >
              {dek}
            </motion.p>
          )}
          <motion.div variants={rise} className="mt-7 flex items-center gap-3">
            <Monogram name={author} />
            <div className="min-w-0 text-[14px] leading-tight">
              <p className="truncate font-semibold">{author}</p>
              <p className="mt-0.5 text-[#86868b] dark:text-[#98989d]">{readingTime}</p>
            </div>
          </motion.div>
        </motion.header>

        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 30, delay: 0.25 }}
          className="mt-10 sm:mt-12"
        >
          <ArticleImage
            image={heroImage}
            label="Editorial article image"
            className="aspect-[16/10]"
            zoomIn={!reduce}
          />
        </motion.div>

        <ArticleBody secondaryImage={secondaryImage} sectionIdPrefix={sectionIdPrefix} />
      </article>
    </section>
  );
}

function Reveal({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const rise = useRise();
  return (
    <motion.section
      id={id}
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

const h2 = "text-[24px] font-semibold leading-[1.15] tracking-[-0.025em] sm:text-[28px]";

function ArticleBody({
  secondaryImage,
  sectionIdPrefix,
}: {
  secondaryImage: string;
  sectionIdPrefix: string;
}) {
  return (
    <div className="mx-auto mt-14 max-w-[680px] space-y-12 text-[17px] leading-[1.6] text-[#1d1d1f]/85 dark:text-[#f5f5f7]/85">
      <Reveal id={`${sectionIdPrefix}-introduction`} className="scroll-mt-10">
        <h2 className={cn(h2, "text-[#1d1d1f] dark:text-[#f5f5f7]")}>Introduction</h2>
        <p className="mt-4">
          Artificial intelligence is moving from experimental demos into the
          quiet parts of daily work. It drafts, reviews, summarizes, designs,
          and helps teams make better decisions with less context switching.
        </p>
      </Reveal>

      <Reveal id={`${sectionIdPrefix}-key-areas`} className="scroll-mt-10">
        <h2 className={cn(h2, "text-[#1d1d1f] dark:text-[#f5f5f7]")}>Key areas of AI development</h2>
        <ol className="mt-6 space-y-6">
          {[
            {
              title: "Machine learning",
              points: [
                "Deep learning for image, text, and audio reasoning",
                "Reinforcement systems that improve through feedback",
                "Recommendation engines for personalized experiences",
              ],
            },
            {
              title: "Natural language processing",
              points: [
                "Conversation interfaces for support and research",
                "Semantic search across private knowledge bases",
                "Language translation for global product teams",
              ],
            },
            {
              title: "Computer vision",
              points: [
                "Visual inspection for manufacturing and healthcare",
                "Spatial awareness for robotics and mobility",
                "Creative tooling for media generation",
              ],
            },
          ].map((area, index) => (
            <li key={area.title} className="flex gap-4">
              <span className="mt-[3px] grid size-6 shrink-0 place-items-center rounded-full bg-[#f5f5f7] text-[13px] font-semibold tabular-nums text-[#1d1d1f] dark:bg-[#1c1c1e] dark:text-[#f5f5f7]">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{area.title}</p>
                <ul className="mt-2 space-y-1.5 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {area.points.map((point) => (
                    <li key={point} className="flex gap-2.5">
                      <span aria-hidden className="mt-[9px] size-1 shrink-0 rounded-full bg-[#a1a1a6] dark:bg-[#636366]" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal id={`${sectionIdPrefix}-ethics`} className="scroll-mt-10">
        <h2 className={cn(h2, "text-[#1d1d1f] dark:text-[#f5f5f7]")}>Ethical considerations</h2>
        <p className="mt-4">
          The most useful systems are also the most accountable. Privacy,
          fairness, explainability, and human oversight should be designed into
          AI products from the first prototype rather than added at launch.
        </p>
        <blockquote className="mt-10 border-t border-black/[0.08] pt-8 dark:border-white/[0.1]">
          <p className="text-balance text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7] sm:text-[28px]">
            “The value of AI is not speed alone. It is the quality of judgment it
            helps people bring to complex work.”
          </p>
          <footer className="mt-4 text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">
            Priya Ramesh, head of research at Northfield
          </footer>
        </blockquote>
      </Reveal>

      <Reveal>
        <figure>
          <ArticleImage image={secondaryImage} label="Circuit board close-up" className="aspect-[3/2]" />
          <figcaption className="mt-3 text-[13px] leading-[1.45] text-[#6e6e73] dark:text-[#a1a1a6]">
            Specialised chips now run most inference close to where the data lives.
          </figcaption>
        </figure>
      </Reveal>

      <Reveal id={`${sectionIdPrefix}-conclusion`} className="scroll-mt-10">
        <h2 className={cn(h2, "text-[#1d1d1f] dark:text-[#f5f5f7]")}>Conclusion</h2>
        <p className="mt-4">
          AI will keep reshaping software, but the strongest products will
          remain deeply human: clear, trustworthy, calm under pressure, and easy
          to understand when the stakes are high.
        </p>
        <p className="mt-6 text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">
          For more research notes, visit{" "}
          <a
            href="#"
            className="rounded-sm font-medium text-[#0066cc] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:text-[#2997ff]"
          >
            Northfield Research ›
          </a>
        </p>
      </Reveal>
    </div>
  );
}

function ArticleImage({
  image,
  label,
  className,
  zoomIn = false,
}: {
  image: string;
  label: string;
  className?: string;
  zoomIn?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[24px] bg-[#f5f5f7] shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
        className,
      )}
    >
      <motion.div
        initial={zoomIn ? { scale: 1.08 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.25 }}
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
        role="img"
        aria-label={label}
      />
    </div>
  );
}

function Monogram({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      aria-hidden
      className="grid size-9 shrink-0 place-items-center rounded-full bg-[linear-gradient(180deg,#a1a1a6,#86868b)] text-[12px] font-semibold text-white dark:bg-[linear-gradient(180deg,#8e8e93,#636366)]"
    >
      {initials}
    </span>
  );
}

export default BlogContentCentered;
