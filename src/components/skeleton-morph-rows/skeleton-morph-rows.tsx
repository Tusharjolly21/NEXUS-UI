"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type CSSProperties } from "react";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";

interface Activity { who: string; tone: string; action: string; target: string; time: string; quote?: string; art?: [string, string] }
const FEED: Activity[] = [
  { who: "Anna Lee", tone: "#d6e4f5", action: "commented on", target: "Onboarding v3", time: "2m", quote: "The second screen finally reads in one glance. Ship it." , art: ["#bcd2e3", "#0071e3"] },
  { who: "Marcus Webb", tone: "#f3e0cc", action: "uploaded", target: "Invoice October.pdf", time: "18m" },
  { who: "Priya Shah", tone: "#dcecd6", action: "shared", target: "Q4 roadmap", time: "1h", quote: "Dates are locked for design and engineering.", art: ["#dcecd6", "#30a14e"] },
];
const SPRING = { type: "spring", stiffness: 380, damping: 34 } as const;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * SkeletonMorphRows: a loading state that becomes the content instead of being swapped for it. Each grey placeholder knows
 * which piece of content it stands for; when the data arrives it stretches to that piece's exact size and position,
 * then dissolves as the real thing appears inside it, row by row as each item lands. Nothing jumps, because the
 * shapes you were looking at turn into the content you came for.
 *
 * `load()` returns your items; until it resolves the skeleton shows. `autoplay` reloads in a loop until the first
 * real interaction.
 */
export function SkeletonMorphRows({ autoplay = false, load }: { autoplay?: boolean; load?: () => Promise<Activity[]> }) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [items, setItems] = useState<Activity[]>(FEED);
  const [ready, setReady] = useState<boolean[]>([false, false, false]);
  const touched = useRef(false);
  const run = useRef(0);

  const reload = async () => {
    const me = ++run.current;
    setReady([false, false, false]);
    const data = load ? await load() : (await sleep(1500), FEED);
    if (me !== run.current) return;
    setItems(data);
    // items land one after another, as they would from a real feed
    for (let i = 0; i < data.length; i++) {
      if (me !== run.current) return;
      setReady((r) => r.map((v, j) => (j === i ? true : v)));
      await sleep(reduce ? 0 : 220);
    }
  };
  useEffect(() => { void reload(); return () => { run.current++; }; }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    (async () => {
      while (live && !touched.current) {
        await sleep(5200);
        if (!live || touched.current) break;
        void reload();
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const take = () => { touched.current = true; };
  const busy = ready.some((r) => !r);

  return (
    <div
      onPointerDownCapture={take}
      onKeyDownCapture={take}
      aria-busy={busy}
      className="w-full max-w-[480px] rounded-[24px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <div className="flex items-center justify-between pb-2">
        <h3 className="m-0 text-[19px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">Activity</h3>
        <button type="button" onClick={() => void reload()} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-3 text-[13px] font-medium text-[#1d1d1f] outline-none hover:bg-[#ebebed] focus-visible:ring-2 focus-visible:ring-[#0071e3]">
          <motion.span className="grid place-items-center" animate={{ rotate: busy ? 360 : 0 }} transition={busy ? { repeat: Infinity, duration: 1, ease: "linear" } : { duration: 0 }}><Glyph d={ICON.arrow_clockwise} size={13} /></motion.span>
          Reload
        </button>
      </div>
      <ul className="m-0 flex list-none flex-col p-0">
        {items.map((a, i) => (
          <LayoutGroup key={i} id={`${uid}-${i}`}>
            <li className="border-b border-[#f0f0f2] py-3.5 last:border-0">
              {ready[i] ? <Real a={a} id={`${uid}-${i}`} /> : <Skeleton a={a} id={`${uid}-${i}`} reduce={!!reduce} />}
            </li>
          </LayoutGroup>
        ))}
      </ul>
      <p className="sr-only" aria-live="polite">{busy ? "Loading activity" : "Activity loaded"}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ the placeholder: each shape is named after what it will become */
function Skeleton({ a, id, reduce }: { a: Activity; id: string; reduce: boolean }) {
  return (
    <div className="flex gap-3" aria-hidden="true">
      <Bone id={`${id}-av`} w={36} h={36} r={18} reduce={reduce} />
      <div className="flex min-w-0 flex-1 flex-col gap-2 pt-[3px]">
        <Bone id={`${id}-line`} w="82%" h={12} r={6} reduce={reduce} />
        {a.quote && <Bone id={`${id}-quote`} w="96%" h={30} r={8} reduce={reduce} />}
        <Bone id={`${id}-time`} w={46} h={10} r={5} reduce={reduce} />
      </div>
      {a.art && <Bone id={`${id}-art`} w={56} h={56} r={12} reduce={reduce} />}
    </div>
  );
}
function Bone({ id, w, h, r, reduce }: { id: string; w: number | string; h: number; r: number; reduce: boolean }) {
  return (
    <motion.span layoutId={id} transition={SPRING} initial={{ opacity: 1 }} animate={{ opacity: 1 }} className="relative block shrink-0 overflow-hidden" style={{ width: w, height: h, borderRadius: r, backgroundColor: "#ececf0" }}>
      {!reduce && (
        <motion.span className="absolute inset-y-0 w-[60%]" style={{ background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.7), rgba(255,255,255,0))" }} initial={{ left: "-60%" }} animate={{ left: "120%" }} transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }} />
      )}
    </motion.span>
  );
}

/* ------------------------------------------------------------------ the content, each piece sitting in the shape that became it */
function Real({ a, id }: { a: Activity; id: string }) {
  return (
    <div className="flex gap-3">
      <Slot id={`${id}-av`} r={18} className="h-9 w-9 shrink-0">
        <span className="grid h-9 w-9 place-items-center rounded-full text-[12px] font-semibold text-[#1d1d1f]" style={{ background: a.tone }}>
          {a.who.split(" ").map((w) => w[0]).join("")}
        </span>
      </Slot>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
        <Slot id={`${id}-line`} r={6} className="max-w-full">
          <span className="block text-[14px] leading-[19px] text-[#1d1d1f]"><span className="font-semibold">{a.who}</span> <span className="text-[#6e6e73]">{a.action}</span> <span className="font-medium">{a.target}</span></span>
        </Slot>
        {a.quote && (
          <Slot id={`${id}-quote`} r={8} className="w-full">
            <span className="block rounded-[10px] bg-[#f5f5f7] px-3 py-2 text-[13.5px] leading-[18px] text-[#3a3a3c]">{a.quote}</span>
          </Slot>
        )}
        <Slot id={`${id}-time`} r={5}>
          <span className="block text-[12px] leading-[16px] text-[#86868b]">{a.time} ago</span>
        </Slot>
      </div>
      {a.art && (
        <Slot id={`${id}-art`} r={12} className="h-14 w-14 shrink-0">
          <svg viewBox="0 0 56 56" width="56" height="56" className="block rounded-[12px]" aria-hidden="true">
            <rect width="56" height="56" fill={a.art[0]} />
            <circle cx="22" cy="24" r="11" fill={a.art[1]} opacity=".85" />
            <rect x="10" y="40" width="36" height="5" rx="2.5" fill="#fff" opacity=".8" />
          </svg>
        </Slot>
      )}
    </div>
  );
}

/** A grey shape that grows into this piece's exact box, then fades as the piece appears in it. */
function Slot({ id, r, className, children }: { id: string; r: number; className?: string; children: ReactNode }) {
  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <motion.span layoutId={id} aria-hidden="true" className="absolute inset-0" style={{ borderRadius: r, backgroundColor: "#ececf0" }} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ layout: SPRING, opacity: { duration: 0.3, delay: 0.32 } }} />
      <motion.span className="relative block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.24 }}>
        {children}
      </motion.span>
    </span>
  );
}

/* ------------------------------------------------------------------ icons: Framework7 Icons (MIT), via Iconify */
const ICON = {
  arrow_clockwise: "M27.145 26.184c.562 0 1.007-.188 1.359-.54l9.656-9.703a1.9 1.9 0 0 0 .586-1.406c0-.515-.21-1.031-.586-1.406l-9.656-9.797c-.328-.375-.797-.562-1.383-.562c-1.031 0-1.828.843-1.828 1.921c0 .493.164.961.516 1.336l6.257 6.14a24 24 0 0 0-4.078-.374A20.626 20.626 0 0 0 7.293 32.488c0 11.508 9.21 20.743 20.695 20.743a20.67 20.67 0 0 0 20.719-20.743c0-1.125-.797-1.945-1.969-1.945c-1.101 0-1.804.82-1.804 1.945a16.9 16.9 0 0 1-16.946 16.969c-9.398 0-16.922-7.547-16.922-16.969a16.855 16.855 0 0 1 16.922-16.922c1.805 0 3.422.141 4.852.446l-7.008 6.96a1.84 1.84 0 0 0-.539 1.337c0 1.078.797 1.875 1.852 1.875",
};
function Glyph({ d, size = 16, className, style }: { d: string; size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} fill="currentColor" aria-hidden="true" className={className} style={style}>
      <path d={d} />
    </svg>
  );
}
