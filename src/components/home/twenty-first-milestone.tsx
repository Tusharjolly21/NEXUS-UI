"use client";

import { useRef, useSyncExternalStore, type PointerEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { TwentyFirstLogo } from "@/components/home/twenty-first-logo";
import { CHECKED_LABEL, PROFILE_URL, SNAPSHOT, estimateLifetime, thousands } from "@/lib/twenty-first-stats";

/**
 * Figures from the nexus-ui profile on 21st.dev, kept in src/lib/twenty-first-stats.ts. The views and
 * bookmarks roll to today's estimate once the page is open. `digits` is what the odometer rolls to; `spoken`
 * is what a screen reader hears.
 */
function buildStats(views: string, bookmarks: string) {
  return [
    { digits: views, suffix: "K", label: "views", spoken: `about ${views} thousand views` },
    { digits: bookmarks, suffix: "K", label: "bookmarks", spoken: `about ${bookmarks} thousand bookmarks` },
    { digits: String(SNAPSHOT.components), suffix: "", label: "components listed", spoken: `${SNAPSHOT.components} components listed` },
  ];
}

const subscribeNever = () => () => {};
const EASE = [0.2, 0.8, 0.2, 1] as const;
const BLUE = "oklch(0.485 0.291 264.121)";
const GRID = "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)";

/** One odometer column: the digits 0 to 9 stacked, slid so the target one shows. */
function Reel({ digit, index, inView, still }: { digit: number; index: number; inView: boolean; still: boolean }) {
  return (
    <span className="relative inline-block h-[1.04em] overflow-hidden align-top">
      <span className="invisible block h-[1.04em] leading-[1.04]">{digit}</span>
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-0 flex flex-col"
        initial={still ? { y: `-${digit * 10}%` } : { y: "0%" }}
        animate={{ y: inView || still ? `-${digit * 10}%` : "0%" }}
        transition={{ duration: 1.5 + index * 0.18, ease: EASE, delay: 0.5 }}
      >
        {Array.from({ length: 10 }, (_, n) => (
          <span key={n} className="block h-[1.04em] text-center leading-[1.04]">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

function Odometer({ digits, suffix, inView, still }: { digits: string; suffix: string; inView: boolean; still: boolean }) {
  let i = 0;
  return (
    <span aria-hidden className="pg-display inline-flex items-baseline text-[clamp(48px,5.6vw,76px)] tabular-nums">
      <span className="inline-flex text-white">
        {digits.split("").map((c, k) =>
          /\d/.test(c) ? <Reel key={k} digit={Number(c)} index={i++} inView={inView} still={still} /> : <span key={k}>{c}</span>,
        )}
      </span>
      {suffix && <span className="ml-[0.03em] text-[#6f88ff]">{suffix}</span>}
    </span>
  );
}

/** Follows the pointer inside a cell: writes two CSS variables, no re-render. */
function track(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/**
 * The milestone band, dressed to match 21st.dev: near-black stage, a faint grid, one blue glow, hairline
 * borders. A pulse of light runs from the 21st mark to the Nexus mark, the numbers roll up, and each cell
 * lights under the pointer. Reduced motion shows the finished page with nothing moving.
 */
export function TwentyFirstMilestone() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const still = !!useReducedMotion();
  const go = inView || still;
  // Server and first paint show the last counted value; the browser then switches to today's estimate.
  const views = useSyncExternalStore(subscribeNever, () => thousands(estimateLifetime().views), () => thousands(SNAPSHOT.views));
  const bookmarks = useSyncExternalStore(subscribeNever, () => thousands(estimateLifetime().bookmarks), () => thousands(SNAPSHOT.bookmarks));
  const STATS = buildStats(views, bookmarks);

  return (
    <section id="21st" aria-labelledby="milestone-title" className="scroll-mt-20 px-4 pb-24 pt-4 sm:pb-28">
      <div
        ref={ref}
        className="relative mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-[#09090b] px-6 py-12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_40px_90px_-40px_rgba(30,50,255,0.55)] sm:px-12 sm:py-16"
      >
        {/* faint grid, fading out from the top left */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: GRID,
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 70% 80% at 12% 0%, #000, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 12% 0%, #000, transparent 75%)",
          }}
        />
        {/* the one glow: 21st blue, breathing slowly */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-56 size-[620px] rounded-full blur-[110px]"
          style={{ background: BLUE }}
          initial={{ opacity: 0.32 }}
          animate={still ? undefined : { opacity: [0.26, 0.4, 0.26] }}
          transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
        />
        {/* a thin highlight along the top edge */}
        <div aria-hidden className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-4" aria-hidden>
            <motion.img
              src="/nexus-ui-logo.png"
              alt=""
              width={44}
              height={44}
              className="size-11 rounded-[12px] shadow-[0_0_0_1px_rgba(255,255,255,0.14)]"
              initial={still ? false : { opacity: 0, scale: 0.8 }}
              animate={go ? { opacity: 1, scale: 1 } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            />
            <span className="relative block h-px w-16 overflow-hidden bg-white/18 sm:w-28">
              {!still && inView && (
                <motion.span
                  className="absolute inset-y-0 left-0 block w-10"
                  style={{ background: "linear-gradient(90deg, transparent, #6f88ff, transparent)" }}
                  initial={{ x: "300%" }}
                  animate={{ x: "-100%" }}
                  transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 1.6, delay: 1 }}
                />
              )}
            </span>
            <motion.div
              className="text-white"
              initial={still ? false : { opacity: 0, x: -8 }}
              animate={go ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            >
              <TwentyFirstLogo className="h-6 w-auto sm:h-7" />
            </motion.div>
          </div>

          <h2 id="milestone-title" className="pg-display mt-9 max-w-[760px] text-[clamp(36px,5.6vw,62px)] leading-[1.03]">
            Almost a million views on 21st.dev
          </h2>
          <p className="mt-4 max-w-[500px] text-[17px] leading-[1.55] text-white/62">
            21st.dev is a community library where developers browse and copy React components.
          </p>

          <dl className="mt-12 grid grid-cols-1 overflow-hidden rounded-[20px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] sm:grid-cols-3">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                onPointerMove={track}
                className={`group relative bg-white/[0.025] px-6 py-8 sm:px-8 sm:py-10 ${i > 0 ? "border-t border-white/10 sm:border-l sm:border-t-0" : ""}`}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(70,100,255,0.22), transparent 70%)" }}
                />
                <dt className="sr-only">{s.spoken}</dt>
                <dd className="relative">
                  <Odometer digits={s.digits} suffix={s.suffix} inView={inView} still={still} />
                  <span className="mt-1 block text-[16px] text-white/60">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[48px] items-center gap-2 self-start rounded-full bg-white px-6 text-[15px] font-medium tracking-[-0.01em] text-[#09090b] transition-[transform,filter] duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              See our profile on 21st.dev
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <p className="text-[13px] text-white/55">Estimated from our 21st.dev profile, last checked {CHECKED_LABEL}. <a href="/impact" className="underline underline-offset-2 hover:text-white">See our impact</a>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
