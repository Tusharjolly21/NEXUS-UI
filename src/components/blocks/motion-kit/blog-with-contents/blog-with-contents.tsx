"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

export interface BlogSection {
  /** Unique id for the section. Used for the anchor and the contents row. */
  id: string;
  /** Section heading, also the row in the contents. */
  title: string;
  /** Paragraphs under the heading. */
  paragraphs: string[];
}

export interface BlogWithContentsProps {
  /** Article title. */
  title?: string;
  /** Small line above the title, for example the kind of piece. */
  category?: string;
  /** Reading time in minutes. Shown beside the category and counted down in the rail as you read. */
  readMinutes?: number;
  /** Sections of the article, in order. Use a stable array. */
  sections?: BlogSection[];
  /** Height of the scrolling reader in px. The article scrolls inside this box. */
  height?: number;
  className?: string;
}

/* Invented article copy for the demo. */
export const DEFAULT_BLOG_SECTIONS: BlogSection[] = [
  {
    id: "why",
    title: "Why motion matters",
    paragraphs: [
      "Motion is how an interface explains itself. When a panel slides out of the button you pressed, you know where it came from and how to put it back.",
      "Good motion is mostly invisible. People don’t notice it; they just find the product easier.",
    ],
  },
  {
    id: "springs",
    title: "Springs over durations",
    paragraphs: [
      "Durations ask you to guess how long something should take. Springs ask how heavy it is and how much it should bounce, which is a question your eye can actually answer.",
      "A spring also carries velocity, so a flicked card keeps the speed your finger gave it instead of restarting from zero.",
    ],
  },
  {
    id: "layout",
    title: "Let layout do the work",
    paragraphs: [
      "Most of the motion in a product is things changing size or position. Animate the layout and let the browser work out the in-between.",
      "Shared elements are the best part: the same thumbnail grows into the full view, so the eye never loses it.",
    ],
  },
  {
    id: "restraint",
    title: "Restraint",
    paragraphs: [
      "Everything moving is the same as nothing moving. Pick the one thing on the screen that matters right now and animate that.",
      "Respect reduced motion. Fades are fine; big movement isn’t.",
    ],
  },
  {
    id: "ship",
    title: "Shipping it",
    paragraphs: [
      "Keep motion in the component, not the page. Then it travels with the component wherever it’s used.",
      "Measure on a slow phone. If it stutters there, it isn’t finished.",
    ],
  },
];

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/**
 * A long-read layout with a contents rail that keeps up. The active heading slides a marker down the rail,
 * the line beside each section fills as you read it, the bar at the top tracks the whole article and the
 * time left counts down. On narrow screens the rail becomes a pill you can open (Escape closes it). The
 * article scrolls inside its own box, so the block previews anywhere. Under reduced motion the marker and
 * bars move instantly and jumps do not smooth-scroll.
 */
export function BlogWithContents({
  title = "Notes on motion that earns its place",
  category = "Essay",
  readMinutes = 4,
  sections = DEFAULT_BLOG_SECTIONS,
  height = 560,
  className,
}: BlogWithContentsProps) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(sections[0]?.id ?? "");
  const [prog, setProg] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll({ container: box });
  const bar = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  const sectionEl = useCallback((el: HTMLElement, id: string) => el.querySelector<HTMLElement>(`[data-toc="${id}"]`), []);

  const update = useCallback(() => {
    const el = box.current;
    if (!el) return;
    const top = el.scrollTop + el.clientHeight * 0.3;
    const p: Record<string, number> = {};
    let cur = sections[0]?.id ?? "";
    sections.forEach((s) => {
      const sec = sectionEl(el, s.id);
      if (!sec) return;
      const a = sec.offsetTop;
      const b = a + sec.offsetHeight;
      p[s.id] = Math.max(0, Math.min(1, (top - a) / Math.max(1, b - a)));
      if (top >= a) cur = s.id;
    });
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 4) {
      cur = sections[sections.length - 1]?.id ?? cur;
      sections.forEach((s) => (p[s.id] = 1));
    }
    setProg(p);
    setActive(cur);
  }, [sections, sectionEl]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const first = requestAnimationFrame(update);
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      cancelAnimationFrame(first);
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  const go = (id: string) => {
    const el = box.current;
    const sec = el ? sectionEl(el, id) : null;
    if (el && sec) el.scrollTo({ top: sec.offsetTop - 12, behavior: reduce ? "auto" : "smooth" });
    setOpen(false);
  };

  const total = Object.values(prog).reduce((a, b) => a + b, 0) / Math.max(1, sections.length);
  const left = Math.max(1, Math.round(readMinutes * (1 - total)));
  const idx = Math.max(0, sections.findIndex((s) => s.id === active));
  const move = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 380, damping: 32 };

  const rail = (where: string) => (
    <LayoutGroup id={`${uid}-${where}`}>
      <ol className="m-0 list-none space-y-1 p-0">
        {sections.map((s, i) => (
          <li key={s.id} className="relative">
            <button
              type="button"
              onClick={() => go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={cn("relative flex w-full items-center gap-3 rounded-[10px] py-1.5 pl-4 pr-2 text-left text-[13.5px]", FOCUS)}
            >
              <span className="absolute bottom-1 left-0 top-1 w-[2px] overflow-hidden rounded-full bg-[#e5e5ea] dark:bg-[#3a3a3c]" aria-hidden="true">
                <motion.span
                  className="block h-full w-full origin-top bg-[#1d1d1f] dark:bg-[#f5f5f7]"
                  initial={false}
                  animate={{ scaleY: prog[s.id] ?? 0 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 40 }}
                />
              </span>
              {active === s.id && <motion.span layoutId={`${uid}-active-${where}`} className="absolute inset-0 rounded-[10px] bg-[#f5f5f7] dark:bg-[#2c2c2e]" transition={move} aria-hidden="true" />}
              <span className={cn("relative", active === s.id ? "font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]" : "text-[#6e6e73] dark:text-[#a1a1a6]")}>
                {i + 1}. {s.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </LayoutGroup>
  );

  return (
    <section aria-label="Article" className={cn("w-full bg-[#f5f5f7] px-4 py-12 dark:bg-black", className)}>
      <div
        className="relative mx-auto w-full max-w-[1080px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.3)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]"
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) setOpen(false);
        }}
      >
        <motion.div
          className="absolute inset-x-0 top-0 z-20 h-[3px] origin-left bg-[#0071e3] dark:bg-[#0a84ff]"
          style={{ scaleX: reduce ? scrollYProgress : bar }}
          aria-hidden="true"
        />
        {/* The scroll box takes focus so the article can be read with the keyboard. */}
        <div ref={box} role="region" tabIndex={0} aria-label="Article" className={cn("overflow-y-auto overscroll-contain", FOCUS)} style={{ height }}>
          <div className="mx-auto grid max-w-[980px] gap-10 px-5 py-10 md:grid-cols-[220px_1fr] md:px-8">
            <aside className="hidden md:block">
              <nav aria-label="Contents" className="sticky top-6">
                <div className="mb-3 flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.12em] text-[#6e6e73] dark:text-[#a1a1a6]">
                  <span>Contents</span>
                  <span className="normal-case tracking-normal tabular-nums">{left} min left</span>
                </div>
                {rail("side")}
              </nav>
            </aside>
            <article>
              <p className="m-0 text-[13px] font-semibold text-[#0071e3] dark:text-[#2997ff]">
                {category} · {readMinutes} min read
              </p>
              <h1 className="m-0 mt-2 text-[clamp(30px,4.5vw,44px)] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</h1>
              {sections.map((s) => (
                <section key={s.id} id={`${uid}-${s.id}`} data-toc={s.id} className="pt-10">
                  <h2 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{s.title}</h2>
                  {s.paragraphs.map((x, k) => (
                    <p key={k} className="m-0 mt-3 text-[16.5px] leading-[1.7] text-[#424245] dark:text-[#d1d1d6]">
                      {x}
                    </p>
                  ))}
                  <div className="mt-5 h-[120px] rounded-[18px] bg-[#f5f5f7] dark:bg-[#2c2c2e]" aria-hidden="true" />
                </section>
              ))}
              <div className="h-[160px]" />
            </article>
          </div>
        </div>
        {/* Narrow screens: a pill that opens the contents. */}
        <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center md:hidden">
          <motion.div
            layout={!reduce}
            className="overflow-hidden rounded-[22px] bg-white/90 shadow-[0_12px_30px_-12px_rgba(0,0,0,.35),0_0_0_1px_rgba(0,0,0,.06)] backdrop-blur-md dark:bg-[#2c2c2e]/90 dark:shadow-[0_12px_30px_-12px_rgba(0,0,0,.9),0_0_0_1px_rgba(255,255,255,.08)]"
            style={{ width: open ? 300 : "auto", maxWidth: "calc(100% - 32px)" }}
            transition={move}
          >
            <AnimatePresence initial={false}>
              {open && (
                <motion.nav id={`${uid}-pill`} aria-label="Contents" className="p-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduce ? 0 : 0.2 }}>
                  {rail("pill")}
                </motion.nav>
              )}
            </AnimatePresence>
            <motion.button
              layout={reduce ? false : "position"}
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls={`${uid}-pill`}
              aria-label={`Contents, section ${idx + 1} of ${sections.length}: ${sections[idx]?.title ?? ""}`}
              className={cn("flex h-11 w-full items-center gap-2 px-4 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]", FOCUS)}
            >
              <span className="tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]" aria-hidden="true">
                {idx + 1}/{sections.length}
              </span>
              <span className="max-w-[180px] truncate" aria-hidden="true">
                {sections[idx]?.title}
              </span>
              <motion.svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.2 }} aria-hidden="true">
                <path d="M6 15l6-6 6 6" />
              </motion.svg>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
