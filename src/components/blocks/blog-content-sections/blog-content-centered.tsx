"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type BlogContentCenteredProps = {
  className?: string;
  title?: string;
  author?: string;
  date?: string;
  heroImage?: string;
  secondaryImage?: string;
  sectionIdPrefix?: string;
};

const defaultHeroImage =
  "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=1600&q=80";

const defaultSecondaryImage =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=80";

export function BlogContentCentered({
  className,
  title = "The Future of Artificial Intelligence",
  author = "Ava Sterling",
  date = "February 14, 2026",
  heroImage = defaultHeroImage,
  secondaryImage = defaultSecondaryImage,
  sectionIdPrefix = "blog-centered",
}: BlogContentCenteredProps) {
  return (
    <section
      className={cn(
        "min-h-full w-full overflow-y-auto bg-[#f7f7f7] px-5 py-12 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-8 lg:py-20",
        className,
      )}
    >
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[620px]"
      >
        <HeroImage image={heroImage} className="aspect-[1.38/1]" />

        <header className="mt-7">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="grid size-6 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-[10px] font-bold text-white">
              AS
            </span>
            <span>{author}</span>
            <span className="size-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <time>{date}</time>
          </div>
        </header>

        <ArticleBody secondaryImage={secondaryImage} sectionIdPrefix={sectionIdPrefix} />
      </motion.article>
    </section>
  );
}

function ArticleBody({
  secondaryImage,
  sectionIdPrefix,
}: {
  secondaryImage: string;
  sectionIdPrefix: string;
}) {
  return (
    <div className="mt-12 space-y-10 text-[15px] leading-8 text-zinc-600 dark:text-zinc-300 sm:text-base sm:leading-8">
      <section id={`${sectionIdPrefix}-introduction`} className="scroll-mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          Introduction
        </h2>
        <p className="mt-4">
          Artificial intelligence is moving from experimental demos into the
          quiet parts of daily work. It drafts, reviews, summarizes, designs,
          and helps teams make better decisions with less context switching.
        </p>
      </section>

      <section id={`${sectionIdPrefix}-key-areas`} className="scroll-mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          Key Areas of AI Development
        </h2>
        <ol className="mt-5 list-decimal space-y-5 pl-5">
          <li>
            <strong className="font-semibold text-zinc-900 dark:text-white">Machine learning</strong>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-500 dark:text-zinc-400">
              <li>Deep learning for image, text, and audio reasoning</li>
              <li>Reinforcement systems that improve through feedback</li>
              <li>Recommendation engines for personalized experiences</li>
            </ul>
          </li>
          <li>
            <strong className="font-semibold text-zinc-900 dark:text-white">Natural language processing</strong>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-500 dark:text-zinc-400">
              <li>Conversation interfaces for support and research</li>
              <li>Semantic search across private knowledge bases</li>
              <li>Language translation for global product teams</li>
            </ul>
          </li>
          <li>
            <strong className="font-semibold text-zinc-900 dark:text-white">Computer vision</strong>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-500 dark:text-zinc-400">
              <li>Visual inspection for manufacturing and healthcare</li>
              <li>Spatial awareness for robotics and mobility</li>
              <li>Creative tooling for media generation</li>
            </ul>
          </li>
        </ol>
      </section>

      <section id={`${sectionIdPrefix}-ethics`} className="scroll-mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          Ethical Considerations
        </h2>
        <p className="mt-4">
          The most useful systems are also the most accountable. Privacy,
          fairness, explainability, and human oversight should be designed into
          AI products from the first prototype rather than added at launch.
        </p>
        <blockquote className="mt-6 border-l-2 border-zinc-950 pl-5 text-sm font-medium italic text-zinc-800 dark:border-white dark:text-zinc-200">
          “The value of AI is not speed alone. It is the quality of judgment it
          helps people bring to complex work.”
        </blockquote>
      </section>

      <HeroImage image={secondaryImage} className="aspect-[1.55/1]" />

      <section id={`${sectionIdPrefix}-conclusion`} className="scroll-mt-10">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          Conclusion
        </h2>
        <p className="mt-4">
          AI will keep reshaping software, but the strongest products will
          remain deeply human: clear, trustworthy, calm under pressure, and easy
          to understand when the stakes are high.
        </p>
        <p className="mt-5 text-sm">
          For more research notes, visit{" "}
          <a href="#" className="font-semibold text-zinc-950 underline underline-offset-4 dark:text-white">
            Northfield Research
          </a>
          .
        </p>
      </section>
    </div>
  );
}

function HeroImage({ image, className }: { image: string; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-zinc-200 bg-cover bg-center shadow-2xl shadow-zinc-950/8 dark:border-white/10 dark:shadow-black/30",
        className,
      )}
      style={{ backgroundImage: `url('${image}')` }}
      role="img"
      aria-label="Editorial article image"
    >
      <div className="h-full w-full bg-gradient-to-tr from-zinc-950/12 via-transparent to-white/12" />
    </div>
  );
}

export default BlogContentCentered;
