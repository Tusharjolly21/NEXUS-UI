"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface ScrollReadManifestoProps {
  /** Small line above the paragraph. */
  eyebrow?: string;
  text?: string;
  /** Words (matched exactly, punctuation included) that land in the accent colour. */
  hot?: string[];
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /**
   * Reads the paragraph by itself once it comes into view, without pinning, and stays fully read.
   * Use it in previews and anywhere the section cannot be scrolled through.
   */
  autoplay?: boolean;
  className?: string;
}

const DEFAULT_TEXT =
  "We think software should feel calm. Fast enough that you never wait, quiet enough that you never notice it, and honest enough that you always know what it's doing with your work.";

function Word({ w, i, n, p, hot }: { w: string; i: number; n: number; p: MotionValue<number>; hot: boolean }) {
  const a = i / n;
  const b = (i + 1) / n;
  const opacity = useTransform(p, [a, b], [0.14, 1]);
  const y = useTransform(p, [a, b], [6, 0]);
  const filter = useTransform(p, [a, b], ["blur(3px)", "blur(0px)"]);
  return (
    <motion.span className={cn("mr-[0.24em] inline-block", hot && "text-[var(--sr-accent)]")} style={{ opacity, y, filter }}>
      {w}
    </motion.span>
  );
}

type Layout = "pin" | "flat";

/** The element `position: sticky` would stick inside: the nearest ancestor that clips or scrolls. */
function stickyContainer(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node && node !== document.body && node !== document.documentElement; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (/(auto|scroll|hidden)/.test(overflowY + overflowX)) return node;
  }
  return null;
}

/**
 * Manifesto paragraph that reads itself as you scroll. The section pins in place while each word
 * sharpens from grey to ink in order, with the key words landing in the accent colour, and a thin
 * bar shows how far along you are.
 *
 * Wherever it cannot be scrolled through (a clipped preview, a page too short to scroll) it lays
 * out flat and reads itself once on a timer, ending with every word fully legible; `autoplay`
 * asks for that up front. Under reduced motion it is plain, fully legible text.
 */
export function ScrollReadManifesto({
  eyebrow = "What we believe",
  text = DEFAULT_TEXT,
  hot = ["calm.", "never", "honest"],
  accent,
  autoplay = false,
  className,
}: ScrollReadManifestoProps) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const p = useMotionValue(0);
  const [fallback, setFallback] = useState(false);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const scrollDriven = !autoplay && !reduce && !fallback;
  const timed = (autoplay || fallback) && !reduce;
  const layout: Layout = scrollDriven ? "pin" : "flat";

  // Reduced motion: everything legible, nothing moves.
  useEffect(() => {
    if (reduce) p.set(1);
  }, [reduce, p]);

  // Autoplay (or the scroll fallback): one read-through when it comes into view, ending fully read.
  useEffect(() => {
    if (!timed || !inView) return;
    const c = animate(p, [0, 1], { duration: Math.min(5, Math.max(2.4, words.length * 0.11)), ease: "linear", delay: 0.2 });
    return () => c.stop();
  }, [timed, inView, p, words.length]);

  // Scroll: follow the nearest scroller (the window or a scrolling ancestor such as a full-screen
  // view). If the section sits inside something that clips without scrolling, pinning cannot work,
  // so fall back to the flat layout and read it through on a timer instead.
  useEffect(() => {
    if (autoplay || reduce || fallback) return;
    const el = ref.current;
    if (!el) return;
    const box = stickyContainer(el);
    const scroller = box && /(auto|scroll)/.test(getComputedStyle(box).overflowY) ? box : null;
    let raf = 0;
    const update = () => {
      raf = 0;
      if (box && !scroller) {
        setFallback(true);
        return;
      }
      const vpTop = scroller ? scroller.getBoundingClientRect().top : 0;
      const vpH = scroller ? scroller.clientHeight : window.innerHeight;
      const canScroll = scroller
        ? scroller.scrollHeight > scroller.clientHeight + 1
        : document.documentElement.scrollHeight > window.innerHeight + 1;
      if (!canScroll) {
        setFallback(true);
        return;
      }
      const r = el.getBoundingClientRect();
      const range = r.height - vpH;
      const raw = range > 0 ? (vpTop - r.top) / range : 1;
      p.set(Math.min(1, Math.max(0, (raw - 0.05) / 0.8)));
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    // Capture catches scrolls of any ancestor, not just the window.
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
    };
  }, [autoplay, reduce, fallback, p]);

  // Reduced motion shows the finished read as plain text.
  const settled = reduce;

  return (
    <section
      ref={ref}
      className={cn(
        "relative w-full bg-[#fbfbfd] dark:bg-black",
        layout === "pin" ? "h-[220vh]" : "py-20 sm:py-28",
        !accent && "[--sr-accent:#0071e3] dark:[--sr-accent:#2997ff]",
        className,
      )}
      style={accent ? ({ "--sr-accent": accent } as CSSProperties) : undefined}
    >
      <div className={cn("flex items-center px-5", layout === "pin" && "sticky top-0 h-screen max-h-[900px]")}>
        <div className="mx-auto w-full max-w-[1000px]">
          <span className="text-[14px] font-semibold text-[var(--sr-accent)]">{eyebrow}</span>
          <p className="m-0 mt-6 text-[clamp(28px,4.6vw,58px)] font-semibold leading-[1.12] tracking-[-0.035em] text-[#1d1d1f] dark:text-[#f5f5f7]">
            {words.map((w, i) =>
              settled ? (
                <span key={i} className={cn("mr-[0.24em] inline-block", hot.includes(w) && "text-[var(--sr-accent)]")}>
                  {w}
                </span>
              ) : (
                <Word key={i} w={w} i={i} n={words.length} p={p} hot={hot.includes(w)} />
              ),
            )}
          </p>
          <div className="mt-10 h-[3px] w-40 overflow-hidden rounded-full bg-black/[.08] dark:bg-white/[.14]" aria-hidden="true">
            <motion.div
              className="h-full origin-left rounded-full bg-[var(--sr-accent)]"
              style={settled ? { scaleX: 1 } : { scaleX: p }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
