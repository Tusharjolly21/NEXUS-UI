"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { FitPreview } from "@/components/gallery/fit-preview";
import type { GalleryItem } from "@/components/gallery/types";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Find it", body: "Search by name, or filter by how a component moves: hover, drag, type, scroll." },
  { title: "Tweak it", body: "Change speed, colour and size in the playground and watch it update as you go." },
  { title: "Add it", body: "One shadcn command drops the source into your project. No package, no lock-in." },
] as const;

const AUTO_MS = 6500;

function useIsDesktop() {
  const [desk, setDesk] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desk;
}

/**
 * Find it, tweak it, add it, each step played by one of the library's own components running live:
 * a search, a panel of sliders, a terminal. On wide screens the section pins while you scroll and
 * each step takes over as you reach it; on phones the steps play in turn by themselves.
 */
export function RepoStory({ items }: { items: GalleryItem[] }) {
  const reduce = !!useReducedMotion();
  const desk = useIsDesktop();
  const track = React.useRef<HTMLDivElement>(null);
  const [step, setStep] = React.useState(0);
  const [inView, setInView] = React.useState(false);

  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (!desk) return;
    setStep(Math.min(STEPS.length - 1, Math.floor(p * STEPS.length * 0.999)));
  });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  React.useEffect(() => {
    const node = track.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (desk || reduce || !inView) return;
    const t = setTimeout(() => setStep((s) => (s + 1) % STEPS.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [desk, reduce, inView, step]);

  const item = items[step] ?? items[0];
  if (!item) return null;

  return (
    <section aria-labelledby="steps-title" className="cx-section">
      <div ref={track} className="relative lg:h-[280vh]">
        <div className="px-4 py-24 sm:py-32 lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center lg:py-0">
          <div className="mx-auto grid w-full max-w-[1152px] items-center gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h2 id="steps-title" className="pg-display text-[clamp(38px,5.4vw,56px)] leading-[1.02] text-foreground">
                From the gallery to your repo in a minute.
              </h2>
              <p className="mt-4 max-w-[460px] text-[17px] leading-[1.55] text-muted-foreground">
                No package to keep up to date. The source lands in your project, and from then on it&apos;s your code.
              </p>
              <ol className="relative mt-10">
                <span aria-hidden className="absolute bottom-3 left-[11px] top-3 w-px bg-border">
                  <motion.span
                    style={{ height: desk ? fill : `${((step + 1) / STEPS.length) * 100}%` }}
                    className="block w-px bg-[linear-gradient(180deg,var(--cx-blue),var(--cx-violet),var(--cx-pink))] shadow-[0_0_10px_1px_var(--cx-ink-glow)]"
                  />
                </span>
                {STEPS.map((s, i) => (
                  <li key={s.title} className="relative pb-7 pl-10 last:pb-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (desk && track.current) {
                          const top = track.current.getBoundingClientRect().top + window.scrollY;
                          const span = track.current.offsetHeight - window.innerHeight;
                          window.scrollTo({ top: top + span * ((i + 0.5) / STEPS.length), behavior: "smooth" });
                        } else setStep(i);
                      }}
                      className="text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute left-0 top-0.5 grid size-[23px] place-items-center rounded-full text-[11px] font-semibold transition-all duration-300",
                          i <= step
                            ? "bg-[linear-gradient(135deg,var(--cx-blue),var(--cx-violet))] text-white shadow-[0_0_14px_2px_var(--cx-ink-glow)]"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span
                        className={cn(
                          "block text-[19px] font-semibold tracking-[-0.4px] transition-colors duration-300",
                          i === step ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {s.title}
                      </span>
                      <span
                        className={cn(
                          "mt-1 block max-w-[380px] text-[15px] leading-[1.55] text-muted-foreground transition-opacity duration-300",
                          i === step ? "opacity-100" : "opacity-50",
                        )}
                      >
                        {s.body}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>

            <div className="cx-edge">
              <div className="overflow-hidden rounded-[21px] bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden>
                    <span className="size-2.5 rounded-full bg-[#ff605c]" />
                    <span className="size-2.5 rounded-full bg-[#ffbd44]" />
                    <span className="size-2.5 rounded-full bg-[#00ca4e]" />
                  </div>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={item.slug}
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: -4 }}
                      className="mx-auto truncate rounded-md bg-muted px-3 py-1 text-[12px] font-medium text-muted-foreground"
                    >
                      {item.name}, live. Try it.
                    </motion.p>
                  </AnimatePresence>
                  <Link
                    href={`/components/${item.slug}`}
                    className="shrink-0 text-[12.5px] font-medium text-link hover:underline hover:underline-offset-4"
                  >
                    Open ›
                  </Link>
                </div>
                <div
                  className={cn("relative h-[420px] sm:h-[460px]", !item.fit.bg && "bg-background")}
                  style={item.fit.bg ? { backgroundColor: item.fit.bg } : undefined}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={item.slug}
                      className="absolute inset-0"
                      initial={reduce ? false : { opacity: 0, filter: "blur(12px)", scale: 0.97 }}
                      animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
                      exit={reduce ? undefined : { opacity: 0, filter: "blur(12px)", scale: 1.02 }}
                      transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <FitPreview
                        exportName={item.exportName}
                        canvas={item.fit.canvas}
                        focus={item.fit.focus}
                        maxScale={1.25}
                        className={cn(
                          item.fit.clearRoot &&
                            "not-dark:[&>div>*]:!rounded-none not-dark:[&>div>*]:!border-0 not-dark:[&>div>*]:!bg-transparent not-dark:[&>div>*]:!shadow-none",
                        )}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 border-t border-border px-4 py-2.5 font-mono text-[12.5px] text-muted-foreground">
                  <span className="select-none text-muted-foreground/60">$</span>
                  <span className="truncate">
                    npx shadcn@latest add @nexus-labs/<span className="text-foreground">{item.install}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
