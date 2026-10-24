# Skeleton Morph

Add the "Skeleton Morph" component from Nexus UI to my project.

A card whose loading skeletons are cut to the exact shape of the content that replaces them, with one light sweeping across every block. When the data arrives each block dissolves into its real content in reading order, and nothing shifts.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { SkeletonMorph, SKELETON_MORPH_LINES } from "@/components/skeleton-morph";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/skeleton-morph/index.ts ---

```ts
export { SkeletonMorph, SKELETON_MORPH_LINES } from "./skeleton-morph";
export type { SkeletonMorphProps } from "./skeleton-morph";
```

--- components/skeleton-morph/skeleton-morph.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export interface SkeletonMorphProps {
  /** Controlled: true shows the content, false the skeletons. Leave it out to use the built-in toggle button and `defaultReady`. */
  ready?: boolean;
  /** Starting state when `ready` is not controlled. */
  defaultReady?: boolean;
  /** Called when the toggle button (or autoplay) changes the state. */
  onReadyChange?: (ready: boolean) => void;
  /** Author name. */
  author?: string;
  /** Initials in the avatar. */
  initials?: string;
  /** Avatar colour. */
  avatarColor?: string;
  /** Reading time line under the author. */
  meta?: string;
  /** Headline of the card. */
  title?: string;
  /** Lines of body copy, one skeleton each. */
  lines?: string[];
  /** Flips between skeleton and content on a loop until someone touches the card. Pauses off screen and never runs under reduced motion. Works when `ready` is not controlled. */
  autoplay?: boolean;
  /** Extra classes for the wrapper. */
  className?: string;
}

export const SKELETON_MORPH_LINES = ["The first screen people see is usually blank.", "Make it the most helpful one in the product."];

const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071e3] dark:focus-visible:outline-[#0a84ff]";

/** True while the element is on screen and the tab is visible. Only observes when `enabled`. */
function useDemoActive(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    let shown = !document.hidden;
    let inView = false;
    const sync = () => setActive(shown && inView);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    const onVisibility = () => {
      shown = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      setActive(false);
    };
  }, [ref, enabled]);
  return active;
}

/** A block that is a skeleton until `ready`, then crossfades into its content in the same box. */
function Slot({ ready, delay, className, round = 8, children, shimmer, reduce }: { ready: boolean; delay: number; className?: string; round?: number; children: ReactNode; shimmer: number; reduce: boolean }) {
  return (
    <span className={`relative block ${className ?? ""}`}>
      <AnimatePresence initial={false}>
        {!ready && (
          <motion.span
            key="sk"
            aria-hidden="true"
            className="absolute inset-0 overflow-hidden bg-[#ececf0] dark:bg-[#2c2c2e]"
            style={{ borderRadius: round }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, scale: 1.02, filter: "blur(4px)", transition: { duration: 0.35, delay } }}
          >
            {/* every block runs the same sweep, offset by where it sits, so it reads as one light */}
            {!reduce && (
              <motion.span
                className="absolute inset-y-0 -left-full w-full bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/[.09]"
                animate={{ x: ["0%", "300%"] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: shimmer, repeatDelay: 0.3 }}
              />
            )}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        className="block"
        aria-hidden={!ready || undefined}
        initial={false}
        animate={reduce ? { opacity: ready ? 1 : 0 } : { opacity: ready ? 1 : 0, y: ready ? 0 : 4, filter: ready ? "blur(0px)" : "blur(3px)" }}
        transition={reduce ? { duration: 0.15 } : { duration: 0.4, delay: ready ? delay + 0.1 : 0 }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/**
 * Skeletons that turn into the thing they stood for. Every placeholder is
 * cut to the exact shape of the content that replaces it, a single light
 * sweeps across all of them, and when data arrives each block dissolves
 * into its real content in reading order, with nothing shifting around.
 * The card is marked busy while loading and the switch is announced.
 */
export function SkeletonMorph({
  ready: readyProp,
  defaultReady = false,
  onReadyChange,
  author = "Maya Chen",
  initials = "MC",
  avatarColor = "#ff9f0a",
  meta = "4 min read",
  title = "Designing for the empty state",
  lines = SKELETON_MORPH_LINES,
  autoplay = false,
  className = "",
}: SkeletonMorphProps) {
  const reduce = useReducedMotion() ?? false;
  const controlled = readyProp !== undefined;
  const [inner, setInner] = useState(defaultReady);
  const ready = controlled ? readyProp : inner;
  const root = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const active = useDemoActive(root, autoplay && !reduce && !controlled);

  const set = (next: boolean) => {
    if (!controlled) setInner(next);
    onReadyChange?.(next);
  };
  const latest = useRef(set);
  useEffect(() => {
    latest.current = set;
  });

  useEffect(() => {
    if (!autoplay || reduce || controlled || !active) return;
    const id = window.setTimeout(() => {
      if (!touched.current) latest.current(!ready);
    }, ready ? 4000 : 2600);
    return () => window.clearTimeout(id);
  }, [ready, autoplay, reduce, controlled, active]);

  const d = (k: number) => (reduce ? 0 : k * 0.07);
  const common = { ready, reduce };

  return (
    <div
      ref={root}
      className={`flex w-[440px] max-w-full flex-col gap-4 ${className}`}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <article
        className="rounded-[26px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_50px_-30px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_24px_50px_-30px_rgba(0,0,0,.9)]"
        aria-busy={!ready}
        aria-label={ready ? title : "Loading article"}
      >
        <Slot {...common} delay={d(0)} shimmer={0} round={20} className="h-[180px] w-full">
          <span className="block h-[180px] w-full overflow-hidden rounded-[20px]" style={{ background: "linear-gradient(160deg,#a1c4fd,#c2e9fb 45%,#fbc2eb)" }}>
            <svg className="h-full w-full" viewBox="0 0 400 180" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 120 C 80 90, 140 140, 220 110 S 340 80, 400 100 V180 H0Z" fill="#5f7fb8" opacity=".55" />
              <path d="M0 150 C 90 130, 160 165, 260 140 S 360 135, 400 145 V180 H0Z" fill="#33507f" opacity=".75" />
            </svg>
          </span>
        </Slot>
        <div className="mt-4 flex items-center gap-3">
          <Slot {...common} delay={d(1)} shimmer={0.05} round={999} className="h-10 w-10 flex-none">
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-[#1d1d1f]" style={{ background: avatarColor }}>
              {initials}
            </span>
          </Slot>
          <div className="min-w-0 flex-1 space-y-1.5">
            <Slot {...common} delay={d(2)} shimmer={0.12} className="w-fit min-w-[45%]">
              <span className="block text-[14px] font-semibold leading-5 text-[#1d1d1f] dark:text-[#f5f5f7]">{author}</span>
            </Slot>
            <Slot {...common} delay={d(3)} shimmer={0.12} className="w-fit min-w-[30%]">
              <span className="block text-[12.5px] leading-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{meta}</span>
            </Slot>
          </div>
        </div>
        <Slot {...common} delay={d(4)} shimmer={0.08} className="mt-4">
          <span className="block text-[21px] font-semibold leading-[26px] tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{title}</span>
        </Slot>
        <div className="mt-3 space-y-2">
          {lines.map((t, k) => (
            <Slot key={k} {...common} delay={d(5 + k)} shimmer={0.08}>
              <span className="block text-[14.5px] leading-[18px] text-[#6e6e73] dark:text-[#a1a1a6]">{t}</span>
            </Slot>
          ))}
        </div>
      </article>
      <span className="sr-only" role="status" aria-live="polite">
        {ready ? "Content loaded" : "Loading content"}
      </span>
      {!controlled && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              set(!ready);
            }}
            className={`h-9 rounded-full bg-[#f5f5f7] px-4 text-[13px] font-medium text-[#1d1d1f] hover:bg-[#ececf0] dark:bg-[#2c2c2e] dark:text-[#f5f5f7] dark:hover:bg-[#3a3a3c] ${FOCUS}`}
          >
            {ready ? "Show loading" : "Load content"}
          </button>
        </div>
      )}
    </div>
  );
}
```
