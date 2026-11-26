import Link from "next/link";
import { Mail, Plus } from "lucide-react";
import { CompareLibraries } from "@/components/site/compare-libraries";

/**
 * Questions as a stack of cards. Each is a native <details>, so the answers are in the page for
 * search engines and work without JavaScript; where the browser can animate to `auto`, they slide open.
 */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <section aria-labelledby="faq-title" className="cx-section px-4 py-24 sm:py-32">
      <div className="mx-auto grid max-w-[1152px] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="faq-title" className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">
            Before you start
          </h2>
          <p className="mt-4 max-w-[400px] text-[18px] leading-[1.55] text-muted-foreground">
            The things people ask most before they install their first component.
          </p>
          <CompareLibraries className="mt-3 text-[16px] text-muted-foreground" />

          <div className="mt-10 border-t border-border pt-6">
            <p className="flex items-center gap-2.5 text-[15px] font-semibold text-foreground">
              <Mail className="size-[18px] text-muted-foreground" strokeWidth={1.75} aria-hidden />
              Didn&apos;t find your answer?
            </p>
            <p className="mt-1.5 max-w-[360px] text-[15px] leading-[1.55] text-muted-foreground">
              Ask about plans, licences, or a component you&apos;d like us to build.
            </p>
            <Link href="/contact" className="mt-3 inline-block text-[15px] font-medium text-link hover:underline hover:underline-offset-4">
              Write to us ›
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((f) => (
            <details
              key={f.q}
              className="cx-faq group rounded-[20px] bg-card shadow-[0_0_0_0.5px_var(--cx-hairline)] transition-shadow duration-300 open:shadow-[0_0_0_1px_color-mix(in_oklab,var(--cx-violet)_45%,transparent),0_20px_50px_-30px_rgba(110,91,255,0.5)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-5 text-[17px] font-semibold tracking-[-0.3px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                {f.q}
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-all duration-300 group-open:rotate-45 group-open:bg-foreground group-open:text-background motion-reduce:transition-none">
                  <Plus className="size-4" aria-hidden />
                </span>
              </summary>
              <p className="max-w-[620px] px-6 pb-6 text-[15.5px] leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
          <p className="mt-3 text-[14px] text-muted-foreground">
            More in the{" "}
            <Link href="/docs" className="text-link hover:underline hover:underline-offset-4">
              docs
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
