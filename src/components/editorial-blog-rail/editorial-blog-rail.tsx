"use client";
import { useEffect, useId, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export type EditorialPost = {
  title: string;
  category: string;
  date: string;
  readTime: string;
  href?: string;
  excerpt?: string;
  author?: { name: string; role?: string };
  /** Two colours for the generated cover art. */
  cover?: [string, string];
};

export type EditorialRailProps = {
  heading?: string;
  /** Link for the "View all" action. */
  allHref?: string;
  featured?: EditorialPost;
  posts?: EditorialPost[];
  /** Previews each story in the featured slot in turn until someone points at the rail. */
  autoplay?: boolean;
  className?: string;
};

const FEATURED: EditorialPost = {
  title: "Designing scroll choreography that people actually feel",
  category: "Guide",
  date: "Oct 14",
  readTime: "12 min read",
  excerpt: "Pacing, anchors and the three-beat rule: how we stage scroll-linked motion so it explains the product instead of decorating it.",
  author: { name: "Mara Okafor", role: "Design engineer" },
  cover: ["#0071e3", "#bf5af2"],
  href: "#",
};

const POSTS: EditorialPost[] = [
  { title: "Springs, not curves: tuning motion by feel", category: "Craft", date: "Oct 09", readTime: "7 min", href: "#", excerpt: "Stiffness, damping and the one number that decides whether a UI feels heavy." },
  { title: "Shipping a design system in six weeks", category: "Case study", date: "Oct 02", readTime: "9 min", href: "#", excerpt: "What we cut, what we kept and the doc that saved the timeline." },
  { title: "The quiet power of a 1px hairline", category: "Details", date: "Sep 26", readTime: "4 min", href: "#", excerpt: "Borders, shadows and why the best separators are barely there." },
  { title: "Reduced motion is a design brief, not a toggle", category: "Accessibility", date: "Sep 18", readTime: "6 min", href: "#", excerpt: "Designing the calm version first, and why it makes the loud one better." },
];

const PALETTES: [string, string][] = [
  ["#ff9f0a", "#ff375f"],
  ["#30d158", "#0071e3"],
  ["#5e5ce6", "#64d2ff"],
  ["#bf5af2", "#ff9f0a"],
  ["#ff375f", "#5e5ce6"],
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
    </svg>
  );
}

/**
 * A magazine-style rail: a featured story with generated cover art beside a
 * numbered list. Point at a story in the list and the featured slot becomes
 * a preview of it: the cover blooms into that story's colours, the title and
 * excerpt slide in, and the lines on the cover drift with the pointer.
 */
export function EditorialRail({
  heading = "From the journal",
  allHref = "#",
  featured = FEATURED,
  posts = POSTS,
  autoplay = false,
  className = "",
}: EditorialRailProps) {
  const reduce = useReducedMotion() === true;
  const uid = useId().replace(/:/g, "");
  // -1 is the featured story itself; 0.. are rail posts.
  const [shown, setShown] = useState(-1);
  const touched = useRef(false);
  const post = shown < 0 ? featured : (posts[shown] ?? featured);
  const [a, b] = post.cover ?? (shown < 0 ? (featured.cover ?? ["#0071e3", "#bf5af2"]) : PALETTES[shown % PALETTES.length]);

  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 120, damping: 18 });
  const sy = useSpring(py, { stiffness: 120, damping: 18 });
  const farX = useTransform(sx, (v) => v * 10);
  const farY = useTransform(sy, (v) => v * 6);
  const nearX = useTransform(sx, (v) => v * -18);
  const nearY = useTransform(sy, (v) => v * -10);

  const count = posts.length;
  useEffect(() => {
    if (!autoplay || count === 0) return;
    const t = window.setInterval(() => {
      if (touched.current) {
        window.clearInterval(t);
        return;
      }
      setShown((s) => (s + 1 >= count ? -1 : s + 1));
    }, 2600);
    return () => window.clearInterval(t);
  }, [autoplay, count]);

  const drift = (e: RPointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const swap = reduce ? { duration: 0 } : { type: "spring" as const, stiffness: 320, damping: 30 };

  return (
    <section
      onPointerDown={() => {
        touched.current = true;
      }}
      className={`@container flex w-full flex-col rounded-[28px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] @min-[520px]:p-7 dark:bg-[#1c1c1e] dark:text-[#f5f5f7] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)] ${className}`}
    >
      <header className="flex items-end justify-between gap-4">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em]">{heading}</h2>
        <a
          href={allHref}
          className="group inline-flex items-center gap-1 rounded-full text-[13px] font-medium text-[#0066cc] outline-none hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:text-[#64a8ff] dark:focus-visible:outline-[#0a84ff]"
        >
          View all <Arrow className="size-3 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
      </header>

      <div className="mt-5 grid flex-1 gap-5 @min-[600px]:grid-cols-[1.1fr_1fr]">
        <a
          href={post.href ?? "#"}
          onPointerMove={drift}
          onPointerLeave={() => {
            px.set(0);
            py.set(0);
          }}
          className="group flex flex-col overflow-hidden rounded-[22px] bg-[#f5f5f7] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:bg-[#2c2c2e] dark:focus-visible:outline-[#0a84ff]"
        >
          <div className="relative aspect-[16/9] overflow-hidden bg-[#0b0b10]" aria-hidden="true">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${a}-${b}`}
                className="absolute inset-0"
                initial={reduce ? false : { opacity: 0, scale: 1.12 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={reduce ? { duration: 0 } : { opacity: { duration: 0.45 }, scale: { type: "spring", stiffness: 120, damping: 20 } }}
                style={{ background: `radial-gradient(110% 90% at 18% 22%, ${a} 0%, transparent 58%), radial-gradient(90% 90% at 88% 82%, ${b} 0%, transparent 62%), #0b0b10` }}
              />
            </AnimatePresence>
            <motion.svg className="absolute -inset-6 size-[calc(100%+48px)] opacity-40 mix-blend-overlay" viewBox="0 0 400 225" preserveAspectRatio="none" style={{ x: farX, y: farY }}>
              {Array.from({ length: 9 }, (_, i) => (
                <path key={i} d={`M -20 ${40 + i * 22} C 120 ${10 + i * 22}, 260 ${90 + i * 18}, 420 ${30 + i * 24}`} fill="none" stroke="white" strokeWidth="1" />
              ))}
            </motion.svg>
            <motion.span
              className="absolute right-[14%] top-[22%] size-16 rounded-full bg-white/25 blur-md"
              style={{ x: nearX, y: nearY }}
            />
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={post.category}
                className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1d1d1f] backdrop-blur"
                initial={reduce ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={swap}
              >
                {post.category}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="relative flex min-h-[124px] flex-1 flex-col overflow-hidden p-4">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={post.title}
                className="flex flex-1 flex-col"
                initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, y: -10, filter: "blur(6px)" }}
                transition={swap}
              >
                <h3 className="text-[18px] font-semibold leading-snug tracking-[-0.02em] [text-wrap:balance]">{post.title}</h3>
                {post.excerpt ? <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">{post.excerpt}</p> : null}
                <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 whitespace-nowrap pt-3 text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">
                  {post.author ? (
                    <>
                      <span className="grid size-6 place-items-center rounded-full text-[10px] font-semibold text-white" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} aria-hidden="true">
                        {initials(post.author.name)}
                      </span>
                      <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{post.author.name}</span>
                      <span aria-hidden="true">·</span>
                    </>
                  ) : null}
                  <span className="tabular-nums">{post.date}</span>
                  <span aria-hidden="true">·</span>
                  <span>{post.readTime}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </a>

        <ol
          className="flex flex-col"
          onPointerEnter={() => {
            touched.current = true;
          }}
          onPointerLeave={() => setShown(-1)}
        >
          {posts.map((p, i) => {
            const on = shown === i;
            const [ca] = p.cover ?? PALETTES[i % PALETTES.length];
            return (
              <li key={p.title} className="relative flex-1">
                {on ? (
                  <motion.span
                    layoutId={`${uid}-hl`}
                    aria-hidden="true"
                    className="absolute inset-0 rounded-[16px] bg-[#f5f5f7] dark:bg-[#2c2c2e]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }}
                  />
                ) : null}
                <a
                  href={p.href ?? "#"}
                  onPointerEnter={() => setShown(i)}
                  onFocus={() => {
                    touched.current = true;
                    setShown(i);
                  }}
                  onBlur={() => setShown((s) => (s === i ? -1 : s))}
                  className="group relative flex h-full items-start gap-3 rounded-[16px] px-3 py-3 outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]"
                >
                  <span className="w-5 shrink-0 pt-0.5 text-[12px] font-semibold tabular-nums text-[#86868b] dark:text-[#8e8e93]">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6e6e73] dark:text-[#a1a1a6]">
                      <motion.span className="size-1.5 rounded-full" style={{ background: ca }} animate={{ scale: on ? 1.5 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 15 }} />
                      {p.category}
                    </span>
                    <span className="mt-1 block text-[14px] font-medium leading-snug tracking-[-0.01em]">{p.title}</span>
                    <span className="mt-1 block text-[12px] tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
                      {p.date} · {p.readTime}
                    </span>
                  </span>
                  <motion.span
                    className="mt-1 text-[#aeaeb2] group-hover:text-[#1d1d1f] dark:text-[#636366] dark:group-hover:text-[#f5f5f7]"
                    animate={on && !reduce ? { x: 2, y: -2 } : { x: 0, y: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  >
                    <Arrow className="size-3.5" />
                  </motion.span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
