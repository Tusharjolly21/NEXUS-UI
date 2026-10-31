# Liquid Pagination

Add the "Liquid Pagination" component from Nexus UI to my project.

Page controls where the selection is a drop of water. Pick a page and the drop stretches toward it, its front edge racing ahead of its back edge, then pulls itself round; numbers turn white only where the drop covers them, and the row of numbers reflows a beat later, sliding in from the side you are heading. Grab the drop and drag it, fling it and it coasts to a page, pull it past either end and it stretches against the edge. The dots variant is the iPhone page control: tap either side to step, or press and slide along it to scrub. Arrow keys, Home and End work in both. Use it controlled with page and onChange, or uncontrolled with defaultPage. Until you touch it, it moves through the pages by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { LiquidPagination } from "@/components/liquid-pagination";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/liquid-pagination/index.ts ---

```ts
export { LiquidPagination } from "./liquid-pagination";
export type { LiquidPaginationProps } from "./liquid-pagination";
```

--- components/liquid-pagination/liquid-pagination.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  chevron_left: "<path fill=\"currentColor\" d=\"M35.805 47.723c.398.398.914.633 1.523.633c1.219 0 2.133-.915 2.133-2.133c0-.586-.234-1.125-.61-1.524L21.79 28.012l17.063-16.688c.375-.398.609-.96.609-1.523c0-1.219-.914-2.157-2.133-2.157c-.61 0-1.125.235-1.523.633L17.242 26.441c-.445.375-.703.961-.703 1.57c0 .587.258 1.126.703 1.571Z\"/>",
  chevron_right: "<path fill=\"currentColor\" d=\"M18.695 48.367c.586 0 1.102-.234 1.524-.633L38.78 29.57c.446-.445.68-.984.68-1.57c0-.61-.234-1.172-.68-1.57L20.22 8.289a2.07 2.07 0 0 0-1.524-.656a2.12 2.12 0 0 0-2.156 2.156c0 .563.258 1.125.633 1.524L34.21 28L17.17 44.688c-.374.398-.632.937-.632 1.523c0 1.219.938 2.156 2.156 2.156\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

/* The indicator is a pill with two edges on two different springs. The edge in
   front is stiff, the edge behind is soft, so the pill stretches as it travels
   and pulls itself back together when it lands, like a drop of water. */
const HEAD = { type: "spring", stiffness: 720, damping: 44 } as const;
const TAIL = { type: "spring", stiffness: 230, damping: 27 } as const;
const FLOW = { type: "spring", stiffness: 420, damping: 38 } as const;
const GRAB_HEAD = { type: "spring", stiffness: 1500, damping: 72 } as const;
const GRAB_TAIL = { type: "spring", stiffness: 560, damping: 44 } as const;
const PRESS = { type: "spring", stiffness: 520, damping: 30 } as const;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
/** resistance past an end: it gives a little, then less and less */
const rubber = (o: number, limit = 26) => limit * (1 - Math.exp(-o / 64));

type Edges = { l: MotionValue<number>; r: MotionValue<number> };
type Mode = "travel" | "flow" | "grab";

function moveEdges({ l, r }: Edges, lTo: number, rTo: number, mode: Mode, reduced: boolean | null) {
  if (reduced) {
    l.set(lTo);
    r.set(rTo);
    return;
  }
  if (mode === "flow") {
    animate(l, lTo, FLOW);
    animate(r, rTo, FLOW);
    return;
  }
  const head = mode === "grab" ? GRAB_HEAD : HEAD;
  const tail = mode === "grab" ? GRAB_TAIL : TAIL;
  const right = (lTo + rTo) / 2 >= (l.get() + r.get()) / 2;
  animate(r, rTo, right ? head : tail);
  animate(l, lTo, right ? tail : head);
}

/** the jiggle when you push past the first or last page */
function bumpEdges({ l, r }: Edges, nudge: MotionValue<number>, dir: number, reduced: boolean | null, size: number) {
  if (reduced) return;
  // scaled to the size of the drop, so a dot jiggles like a dot
  const k = size / 40;
  const lead = dir > 0 ? r : l;
  const trail = dir > 0 ? l : r;
  animate(lead, lead.get(), { type: "spring", stiffness: 620, damping: 15, velocity: dir * 720 * k });
  animate(trail, trail.get(), { type: "spring", stiffness: 520, damping: 18, velocity: dir * 220 * k });
  animate(nudge, 0, { type: "spring", stiffness: 520, damping: 16, velocity: dir * 110 * Math.max(k, 0.5) });
}

function useAutoplay(on: boolean, live: boolean, touched: { current: boolean }, steps: ((p: number) => number)[], pageRef: { current: number }, go: (p: number) => void) {
  const goRef = useRef(go);
  useLayoutEffect(() => {
    goRef.current = go;
  });
  useEffect(() => {
    if (!on || !live) return;
    let i = 0;
    let t = 0;
    const tick = () => {
      if (touched.current) return;
      goRef.current(steps[i % steps.length](pageRef.current));
      i++;
      t = window.setTimeout(tick, 1250);
    };
    t = window.setTimeout(tick, 900);
    return () => window.clearTimeout(t);
    // steps are a fixed script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, live]);
}

function useControllable(count: number, page: number | undefined, defaultPage: number, onChange?: (p: number) => void) {
  const [inner, setInner] = useState(() => clamp(defaultPage, 1, count));
  const current = clamp(page ?? inner, 1, count);
  const set = useCallback(
    (p: number) => {
      if (page === undefined) setInner(p);
      onChange?.(p);
    },
    [page, onChange],
  );
  return [current, set] as const;
}

/* ------------------------------------------------------------------ numbers */

type Slot = { key: string; kind: "page"; page: number } | { key: string; kind: "gap"; side: "L" | "R"; target: number };

/** first, last, the pages around the current one, and a gap where pages are hidden. Always the same number of slots. */
function slotsFor(page: number, count: number, sib: number): Slot[] {
  const n = 2 * sib + 5;
  const P = (p: number): Slot => ({ key: `p${p}`, kind: "page", page: p });
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => P(a + i));
  if (count <= n) return range(1, count);
  const jump = 2 * sib + 3;
  const left = Math.max(page - sib, 1);
  const right = Math.min(page + sib, count);
  const gapL = left > 3;
  const gapR = right < count - 2;
  const L: Slot = { key: "gL", kind: "gap", side: "L", target: Math.max(2, page - jump) };
  const R: Slot = { key: "gR", kind: "gap", side: "R", target: Math.min(count - 1, page + jump) };
  if (!gapL) return [...range(1, 3 + 2 * sib), R, P(count)];
  if (!gapR) return [P(1), L, ...range(count - 2 - 2 * sib, count)];
  return [P(1), L, ...range(left, right), R, P(count)];
}

function GapDots() {
  return (
    <>
      <span className="flex gap-[3px] transition-opacity duration-150 group-hover:opacity-0 group-focus-visible:opacity-0">
        {[0, 1, 2].map((i) => (
          <span key={i} className="block h-[3.5px] w-[3.5px] rounded-full bg-current" />
        ))}
      </span>
    </>
  );
}

function Numbers({
  count,
  page,
  setPage,
  siblings,
  color,
  label,
  autoplay,
  className,
}: {
  count: number;
  page: number;
  setPage: (p: number) => void;
  siblings: number;
  color: string;
  label: string;
  autoplay: boolean;
  className: string;
}) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const touched = useRef(false);

  // fit: shrink the slots, then drop the side pages, when the row is too wide for its container
  const [fit, setFit] = useState({ slot: 40, gap: 6, sib: siblings });
  useLayoutEffect(() => {
    const host = root.current?.parentElement;
    if (!host) return;
    const pick = () => {
      const w = host.clientWidth;
      const need = (slot: number, gap: number, sib: number) => {
        const n = Math.min(count, 2 * sib + 5);
        return n * (slot + gap) - gap + 2 * slot + 22;
      };
      let next = { slot: 40, gap: 6, sib: siblings };
      if (need(40, 6, siblings) > w) next = { slot: 34, gap: 2, sib: siblings };
      if (need(34, 2, siblings) > w && siblings > 0) next = { slot: 34, gap: 2, sib: 0 };
      setFit((f) => (f.slot === next.slot && f.sib === next.sib ? f : next));
    };
    pick();
    const ro = new ResizeObserver(pick);
    ro.observe(host);
    return () => ro.disconnect();
  }, [count, siblings]);
  const { slot: SLOT, gap: GAP, sib } = fit;
  const STEP = SLOT + GAP;
  const BUMP = SLOT;

  // the window of numbers lags the selection a beat, so the pill travels first and the row reflows after
  const [win, setWin] = useState(page);
  const winRef = useRef(win);
  useLayoutEffect(() => {
    winRef.current = win;
  });
  // which way the row of numbers slides in, set together with the new window
  const [dir, setDir] = useState(0);
  const slots = useMemo(() => slotsFor(win, count, sib), [win, count, sib]);
  const n = slots.length;
  const trackW = n * STEP - GAP;

  const indexOf = useCallback((list: Slot[], p: number) => list.findIndex((s) => s.kind === "page" && s.page === p), []);
  const start = Math.max(0, indexOf(slots, page));
  const l = useMotionValue(start * STEP);
  const r = useMotionValue(start * STEP + SLOT);
  const nudge = useMotionValue(0);
  const edges = useMemo(() => ({ l, r }), [l, r]);

  const w = useTransform(() => r.get() - l.get());
  // keeps its volume: a stretched drop gets thinner
  const h = useTransform(w, (v) => SLOT * clamp(Math.pow(SLOT / Math.max(v, 1), 0.2), 0.76, 1));
  const top = useTransform(h, (v) => (SLOT - v) / 2);
  const right = useTransform(r, (v) => trackW - v);
  const rad = useTransform(h, (v) => v / 2);
  const clip = useMotionTemplate`inset(${top}px ${right}px ${top}px ${l}px round ${rad}px)`;

  const place = useCallback(
    (i: number, mode: Mode) => moveEdges(edges, i * STEP, i * STEP + SLOT, mode, reduced),
    [edges, STEP, SLOT, reduced],
  );

  // re-seat the pill if the fit changes
  useLayoutEffect(() => {
    const i = indexOf(slots, page);
    if (i >= 0) {
      // an animation started with the old sizes must not carry on to its old target
      l.stop();
      r.stop();
      l.set(i * STEP);
      r.set(i * STEP + SLOT);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [SLOT, sib]);

  const grabbing = useRef(false);
  const kbFocus = useRef(false);
  const prev = useRef(page);
  const timer = useRef(0);
  useEffect(() => {
    if (prev.current === page) return;
    const from = prev.current;
    prev.current = page;
    const cur = slotsFor(winRef.current, count, sib);
    let i = indexOf(cur, page);
    if (i < 0) i = cur.findIndex((s) => s.kind === "gap" && s.side === (page < from ? "L" : "R"));
    if (i >= 0 && !grabbing.current) place(i, "travel");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => {
        setDir(Math.sign(page - winRef.current));
        setWin(page);
      },
      reduced || i < 0 ? 0 : 190,
    );
  }, [page, count, sib, indexOf, place, reduced]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  useEffect(() => {
    const i = indexOf(slots, page);
    if (i >= 0 && !grabbing.current) place(i, "flow");
    if (kbFocus.current) {
      kbFocus.current = false;
      root.current?.querySelector<HTMLButtonElement>(`[data-page="${page}"]`)?.focus({ preventScroll: true });
    }
    // only when the window moves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win, slots]);

  const go = useCallback(
    (p: number) => {
      if (p < 1 || p > count) {
        bumpEdges(edges, nudge, p < 1 ? -1 : 1, reduced, BUMP);
        return;
      }
      if (p !== page) setPage(p);
    },
    [count, page, setPage, edges, nudge, reduced, BUMP],
  );

  const pageRef = useRef(page);
  useLayoutEffect(() => {
    pageRef.current = page;
  });
  useAutoplay(
    autoplay,
    inView,
    touched,
    [(p) => p + 1, (p) => p + 1, (p) => Math.min(count - 1, p + 2 * sib + 3), () => count, () => count + 1, () => count - 4, () => 1, () => 0, () => Math.min(count, 6)],
    pageRef,
    go,
  );

  // grab the pill and drag it; let go and it coasts to the nearest page
  const drag = useRef<{ id: number; x0: number; c0: number; last: number; moved: boolean; idx: number; s: { t: number; x: number }[] } | null>(null);
  const [held, setHeld] = useState(false);
  const [tick, setTick] = useState<{ i: number; n: number }>({ i: -1, n: 0 });
  const suppress = useRef(false);

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (e.button !== 0 || !track.current) return;
    const x = e.clientX - track.current.getBoundingClientRect().left;
    if (x < l.get() - 6 || x > r.get() + 6) return;
    const c0 = (l.get() + r.get()) / 2;
    drag.current = { id: e.pointerId, x0: e.clientX, c0, last: c0, moved: false, idx: Math.round((c0 - SLOT / 2) / STEP), s: [{ t: performance.now(), x: e.clientX }] };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    if (!d.moved && Math.abs(dx) < 4) return;
    if (!d.moved) {
      d.moved = true;
      grabbing.current = true;
      setHeld(true);
    }
    const t = performance.now();
    d.s.push({ t, x: e.clientX });
    while (d.s.length > 2 && t - d.s[0].t > 90) d.s.shift();
    const lo = SLOT / 2;
    const hi = trackW - SLOT / 2;
    const raw = d.c0 + dx;
    if (raw < lo || raw > hi) {
      // past an end: the far edge sticks, the near edge stretches toward your finger
      const side = raw < lo ? -1 : 1;
      const give = rubber(side < 0 ? lo - raw : raw - hi);
      const base = side < 0 ? 0 : (n - 1) * STEP;
      moveEdges(edges, base - (side < 0 ? give : -give * 0.25), base + SLOT + (side > 0 ? give : -give * 0.25), "grab", reduced);
      nudge.set(side * give * 0.18);
      d.last = raw;
      return;
    }
    nudge.set(0);
    moveEdges(edges, raw - SLOT / 2, raw + SLOT / 2, "grab", reduced);
    d.last = raw;
    const idx = clamp(Math.round((raw - SLOT / 2) / STEP), 0, n - 1);
    if (idx !== d.idx) {
      d.idx = idx;
      setTick((k) => ({ i: idx, n: k.n + 1 }));
    }
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (!d.moved) return;
    grabbing.current = false;
    setHeld(false);
    suppress.current = true;
    window.setTimeout(() => (suppress.current = false), 0);
    const a = d.s[0];
    const b = d.s[d.s.length - 1];
    // a finger that stopped before letting go throws nothing
    const v = b.t > a.t && performance.now() - b.t < 60 ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    const proj = clamp(d.last, SLOT / 2, trackW - SLOT / 2) + v * 0.12;
    const idx = clamp(Math.round((proj - SLOT / 2) / STEP), 0, n - 1);
    if (!reduced) animate(nudge, 0, PRESS);
    else nudge.set(0);
    const s = slots[idx];
    const target = s.kind === "page" ? s.page : s.target;
    place(idx, "travel");
    if (target !== page) setPage(target);
  };

  const onKey = (e: KeyboardEvent) => {
    touched.current = true;
    const next = e.key === "ArrowRight" ? page + 1 : e.key === "ArrowLeft" ? page - 1 : e.key === "Home" ? 1 : e.key === "End" ? count : null;
    if (next === null) return;
    e.preventDefault();
    kbFocus.current = true;
    go(next);
  };

  const click = (p: number) => {
    if (suppress.current) return;
    touched.current = true;
    go(p);
  };

  const layer = (light: boolean) => (
    <AnimatePresence initial={false} custom={dir}>
      {slots.map((s, i) => {
        const x = i * STEP;
        const active = s.kind === "page" && s.page === page;
        const ticked = tick.i === i && held;
        const common = {
          custom: dir,
          initial: { x: x + dir * STEP, opacity: 0, scale: 0.6 },
          animate: { x, opacity: 1, scale: ticked ? [1, 1.16, 1] : 1 },
          exit: "out",
          variants: { out: (d: number) => ({ x: x - d * STEP, opacity: 0, scale: 0.6 }) },
          transition: { ...FLOW, scale: ticked ? { duration: 0.3, ease: "easeOut" } : FLOW },
          style: { width: SLOT, height: SLOT },
          className: "absolute left-0 top-0 flex items-center justify-center rounded-full text-[15px] font-medium tabular-nums",
        } as const;
        if (light)
          return (
            <motion.span key={s.key} {...common}>
              {s.kind === "page" ? s.page : <GapDots />}
            </motion.span>
          );
        return (
          <motion.button
            key={s.key}
            {...common}
            type="button"
            data-page={s.kind === "page" ? s.page : undefined}
            aria-label={s.kind === "page" ? `Page ${s.page}` : `Jump to page ${s.target}`}
            aria-current={active ? "page" : undefined}
            onClick={() => click(s.kind === "page" ? s.page : s.target)}
            className={`${common.className} group cursor-pointer border-0 bg-transparent p-0 text-[#1d1d1f] outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${active ? "" : "hover:bg-black/[.045]"}`}
          >
            {s.kind === "page" ? (
              s.page
            ) : (
              <>
                <GapDots />
                <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="flex -space-x-[9px] text-[#6e6e73]">
                    <Icon name={s.side === "L" ? "chevron_left" : "chevron_right"} size={14} />
                    <Icon name={s.side === "L" ? "chevron_left" : "chevron_right"} size={14} />
                  </span>
                </span>
              </>
            )}
          </motion.button>
        );
      })}
    </AnimatePresence>
  );

  const arrow = (side: -1 | 1) => {
    const off = side < 0 ? page <= 1 : page >= count;
    return (
      <motion.button
        type="button"
        aria-label={side < 0 ? "Previous page" : "Next page"}
        aria-disabled={off || undefined}
        onClick={() => click(page + side)}
        whileTap={{ scale: 0.86 }}
        transition={PRESS}
        style={{ width: SLOT, height: SLOT }}
        className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 outline-none transition-colors duration-150 hover:bg-black/[.045] focus-visible:ring-2 focus-visible:ring-[#0071e3] ${off ? "text-[#c7c7cc]" : "text-[#1d1d1f]"}`}
      >
        <Icon name={side < 0 ? "chevron_left" : "chevron_right"} size={15} />
      </motion.button>
    );
  };

  return (
    <nav
      ref={root}
      aria-label={label}
      onKeyDown={onKey}
      className={`inline-flex select-none items-center gap-[3px] rounded-full bg-white p-[5px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
    >
      {arrow(-1)}
      <motion.div
        ref={track}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className={`relative shrink-0 touch-pan-y ${held ? "cursor-grabbing" : ""}`}
        style={{ width: trackW, height: SLOT, x: nudge }}
      >
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0"
          animate={{ boxShadow: held ? "0 10px 22px -8px rgba(0,0,0,.45)" : "0 4px 10px -6px rgba(0,0,0,.4)" }}
          transition={{ duration: 0.2 }}
          style={{ x: l, width: w, top, height: h, borderRadius: rad, background: color }}
        />
        <div className="absolute inset-0">{layer(false)}</div>
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 text-white" style={{ clipPath: clip }}>
          {layer(true)}
        </motion.div>
      </motion.div>
      {arrow(1)}
      <span className="sr-only" aria-live="polite">{`Page ${page} of ${count}`}</span>
    </nav>
  );
}

/* --------------------------------------------------------------------- dots */

const DOT = 7;
const DSTEP = 16;

function Dots({ count, page, setPage, color, label, autoplay, className }: { count: number; page: number; setPage: (p: number) => void; color: string; label: string; autoplay: boolean; className: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const touched = useRef(false);
  const width = (count - 1) * DSTEP + DOT;
  const BUMP = DOT * 1.6;

  const l = useMotionValue((page - 1) * DSTEP);
  const r = useMotionValue((page - 1) * DSTEP + DOT);
  const nudge = useMotionValue(0);
  const edges = useMemo(() => ({ l, r }), [l, r]);
  const w = useTransform(() => r.get() - l.get());
  const h = useTransform(w, (v) => DOT * clamp(Math.pow(DOT / Math.max(v, 1), 0.16), 0.74, 1));
  const top = useTransform(h, (v) => (DOT - v) / 2);

  const scrubbing = useRef(false);
  const [scrub, setScrub] = useState(false);
  const prev = useRef(page);
  useEffect(() => {
    if (prev.current === page) return;
    prev.current = page;
    if (!scrubbing.current) moveEdges(edges, (page - 1) * DSTEP, (page - 1) * DSTEP + DOT, "travel", reduced);
  }, [page, edges, reduced]);

  const go = useCallback(
    (p: number) => {
      if (p < 1 || p > count) {
        bumpEdges(edges, nudge, p < 1 ? -1 : 1, reduced, BUMP);
        return;
      }
      if (p !== page) setPage(p);
    },
    [count, page, setPage, edges, nudge, reduced, BUMP],
  );

  const pageRef = useRef(page);
  useLayoutEffect(() => {
    pageRef.current = page;
  });
  useAutoplay(autoplay, inView, touched, [() => 2, () => 3, () => count, () => count + 1, () => Math.max(1, count - 2), () => 1, () => 0], pageRef, go);

  // press and slide along the dots to scrub, like the page control on iPhone
  const drag = useRef<{ id: number; x0: number; moved: boolean; last: number } | null>(null);
  const local = (clientX: number) => {
    const b = row.current?.getBoundingClientRect();
    // the control grows while you scrub, so map screen pixels back to dot spacing
    return b && b.width ? ((clientX - b.left) * width) / b.width : 0;
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    if (e.button !== 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, moved: false, last: page };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.abs(e.clientX - d.x0) < 4) return;
    if (!d.moved) {
      d.moved = true;
      scrubbing.current = true;
      setScrub(true);
    }
    const x = local(e.clientX);
    const p = clamp(Math.round((x - DOT / 2) / DSTEP), 0, count - 1) + 1;
    const base = (p - 1) * DSTEP;
    const overL = x < 0 ? rubber(-x, 14) : 0;
    const overR = x > width ? rubber(x - width, 14) : 0;
    moveEdges(edges, base - overL + overR * 0.3, base + DOT + overR - overL * 0.3, "travel", reduced);
    if (p !== d.last) {
      d.last = p;
      setPage(p);
    }
  };
  const onUp = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    if (d.moved) {
      scrubbing.current = false;
      setScrub(false);
      const p = pageRef.current;
      moveEdges(edges, (p - 1) * DSTEP, (p - 1) * DSTEP + DOT, "travel", reduced);
      return;
    }
    // a tap goes one page toward the side you tapped
    const x = local(e.clientX);
    go(x < (l.get() + r.get()) / 2 ? page - 1 : page + 1);
  };
  const onKey = (e: KeyboardEvent) => {
    touched.current = true;
    const next = e.key === "ArrowRight" || e.key === "ArrowUp" ? page + 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? page - 1 : e.key === "Home" ? 1 : e.key === "End" ? count : null;
    if (next === null) return;
    e.preventDefault();
    go(next);
  };

  return (
    <motion.div
      ref={root}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={count}
      aria-valuenow={page}
      aria-valuetext={`Page ${page} of ${count}`}
      onKeyDown={onKey}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      animate={{ scale: scrub ? 1.16 : 1 }}
      transition={PRESS}
      className={`relative inline-flex cursor-pointer touch-pan-y select-none items-center rounded-full px-[13px] py-[11px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${className}`}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full"
        initial={false}
        animate={{ opacity: scrub ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        style={{ background: "rgba(0,0,0,.065)", boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.05)" }}
      />
      <motion.div ref={row} className="relative" style={{ width, height: DOT, x: nudge }}>
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className="absolute top-0 rounded-full" style={{ left: i * DSTEP, width: DOT, height: DOT, background: color, opacity: 0.2 }} />
        ))}
        <motion.span aria-hidden="true" className="absolute left-0 rounded-full" style={{ x: l, width: w, top, height: h, background: color }} />
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------- entry */

export type LiquidPaginationProps = {
  /** number of pages */
  count?: number;
  /** the current page (1-based), for a controlled pager */
  page?: number;
  defaultPage?: number;
  onChange?: (page: number) => void;
  /** numbered pages with arrows, or a row of dots like the iPhone page control */
  variant?: "numbers" | "dots";
  /** pages shown either side of the current one (numbers) */
  siblings?: number;
  /** colour of the drop */
  color?: string;
  label?: string;
  /** move through pages by itself until the first interaction */
  autoplay?: boolean;
  className?: string;
};

/**
 * Liquid Pagination: page controls where the selection is a drop of water.
 * Pick a page and the drop stretches toward it, its front edge racing ahead
 * of its back edge, then pulls itself round again; numbers turn white only
 * where the drop actually covers them. The row of numbers reflows a beat
 * later, sliding in from the side you are heading. Grab the drop and drag it,
 * fling it and it coasts to a page, pull it past either end and it stretches
 * against the edge; push past the first or last page and it jiggles.
 * The dots variant is the iPhone page control: tap either side to step, or
 * press and slide along it to scrub. Arrow keys, Home and End work in both.
 */
export function LiquidPagination({
  count,
  page,
  defaultPage,
  onChange,
  variant = "numbers",
  siblings = 1,
  color = "#1d1d1f",
  label,
  autoplay = false,
  className = "",
}: LiquidPaginationProps) {
  const total = Math.max(1, count ?? (variant === "dots" ? 6 : 24));
  const [current, set] = useControllable(total, page, defaultPage ?? (variant === "dots" ? 1 : 6), onChange);
  if (variant === "dots") return <Dots count={total} page={current} setPage={set} color={color} label={label ?? "Page"} autoplay={autoplay} className={className} />;
  return <Numbers count={total} page={current} setPage={set} siblings={Math.max(0, siblings)} color={color} label={label ?? "Pagination"} autoplay={autoplay} className={className} />;
}

export default LiquidPagination;
```
