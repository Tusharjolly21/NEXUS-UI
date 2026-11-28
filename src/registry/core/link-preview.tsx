"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { LinkPreview } from "@/components/link-preview/link-preview";

export function PreviewLinkPreview() {
  return (
    <div className="flex h-full min-h-full items-start justify-center overflow-y-auto bg-white px-6 py-16 dark:bg-neutral-950">
      <article className="mx-auto w-full max-w-xl">
        {/* Article header */}
        <header className="mb-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-500">
            Design &amp; Engineering
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            The modern web development stack
          </h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            A curated overview of the tools that define production-grade React apps in 2025.
          </p>
          <div className="mt-4 flex items-center gap-3 text-xs text-neutral-400">
            <span>6 min read</span>
            <span>·</span>
            <span>May 2025</span>
          </div>
        </header>

        {/* Article body */}
        <div className="space-y-6 text-base leading-8 text-neutral-600 dark:text-neutral-400">
          <p>
            The React ecosystem has converged on a set of tools that make shipping fast, beautiful web
            experiences feel almost effortless. At the center of it all is{" "}
            <LinkPreview
              href="https://nextjs.org"
              image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=480&q=80"
              title="Next.js — The React Framework for the Web"
              delay={0.05}
            >
              Next.js
            </LinkPreview>
            , a full-stack framework that handles routing, rendering, and edge deployment with zero
            configuration.
          </p>

          <p>
            Animation has become a first-class concern. Libraries like{" "}
            <LinkPreview
              href="https://framer.com/motion"
              image="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=480&q=80"
              title="Framer Motion — Production-ready animations"
              delay={0.06}
            >
              Framer Motion
            </LinkPreview>{" "}
            expose a declarative API that makes spring physics, layout animations, and gesture-driven
            interactions composable at the component level — no canvas, no imperative loops.
          </p>

          <p>
            Styling at scale is solved by{" "}
            <LinkPreview
              href="https://tailwindcss.com"
              image="https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=480&q=80"
              title="Tailwind CSS — A utility-first framework"
              delay={0.05}
            >
              Tailwind CSS
            </LinkPreview>
            . Its utility-first model and design-token-driven theming eliminate the class-naming overhead
            and cascade unpredictability that made CSS at scale painful for years.
          </p>

          <p>
            For deployment,{" "}
            <LinkPreview
              href="https://vercel.com"
              image="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=480&q=80"
              title="Vercel — Frontend Cloud"
              delay={0.04}
            >
              Vercel
            </LinkPreview>{" "}
            provides global edge infrastructure, instant rollbacks, and built-in analytics — turning a
            git push into a globally distributed release in under a minute. Pair it with{" "}
            <LinkPreview
              href="https://github.com"
              image="https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=480&q=80"
              title="GitHub — Where code lives"
              width={300}
              height={180}
              delay={0.06}
            >
              GitHub
            </LinkPreview>{" "}
            for CI/CD and the entire loop from commit to production takes seconds.
          </p>
        </div>

        {/* Hover instruction hint */}
        <p className="mt-10 text-center text-xs text-neutral-400 dark:text-neutral-600">
          Hover the highlighted links to see previews
        </p>
      </article>
    </div>
  );
}
