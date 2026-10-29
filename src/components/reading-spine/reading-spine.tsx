"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

interface Section { id: string; title: string; body: string[] }
const ARTICLE: Section[] = [
  {
    id: "why",
    title: "Why motion",
    body: [
      "Motion is the part of an interface that explains itself. When a sheet slides up from the edge you tapped, you know where it came from and where it will go when you dismiss it. Nobody had to write that down.",
      "Most of the motion we ship does not do this. It decorates. A card fades in because cards fade in, a button bounces because the library makes bouncing cheap. Decoration is not wrong, but it spends attention without paying any back.",
    ],
  },
  {
    id: "timing",
    title: "Timing",
    body: [
      "Durations are a guess about how far something travels and how much it matters. Short distances want short times; anything under a hundred milliseconds reads as instant, anything over four hundred starts to feel like waiting.",
      "Springs remove the guess. Give an element a stiffness and a damping and it finds its own duration from the distance it has to cover. Interrupt it halfway and it turns around from where it is, carrying its speed, instead of snapping back to the start.",
      "That last part matters more than it sounds. People change their minds mid-gesture all the time, and an interface that can follow them feels like it is listening.",
    ],
  },
  {
    id: "continuity",
    title: "Continuity",
    body: [
      "An element that moves should stay the same element. If a photo in a grid becomes the photo in a detail view, it should travel there, keeping its corners and its crop as it grows, so the eye never has to search for it.",
      "Breaks in continuity are where people get lost. A list that re-sorts by vanishing and reappearing asks the reader to compare two pictures. A list that slides each row to its new place lets them watch it happen.",
    ],
  },
  {
    id: "restraint",
    title: "Restraint",
    body: [
      "The best motion is usually the motion you cut. If a transition does not tell anyone something they would otherwise have to work out, it is a candidate for removal.",
      "Respect the setting that asks for less motion. Replace travel with a crossfade, keep the information, drop the flourish.",
    ],
  },
  {
    id: "checklist",
    title: "A short checklist",
    body: [
      "Does it start from where the person acted? Can it be interrupted? Does it end where the thing now lives? Would anyone miss it if it were gone?",
      "If the answers are yes, yes, yes and yes, keep it. Otherwise, cut it and see if anyone notices.",
    ],
  },
];
const SPRING = { type: "spring", stiffness: 420, damping: 36 } as const;
const WPM = 230;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const words = (s: Section) => s.body.join(" ").split(/\s+/).length;

/**
 * ReadingSpine: a scroll bar that knows the article. A slim rail carries a tick where each section begins and a capsule
 * that is your place. Scroll, or grab the capsule and scrub, and a glass label rides beside it naming the section you
 * are in and how long is left, the way Photos labels its scrubber with dates. Rest the pointer on the rail and a glass
 * panel lists every section with how much of each you have read; press one to go there.
 *
 * `sections` replaces the demo article. `autoplay` reads, scrubs and jumps on its own until the first real interaction.
 */
export function ReadingSpine({ autoplay = false, sections = ARTICLE }: { autoplay?: boolean; sections?: Section[] }) {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [geo, setGeo] = useState({ tops: [] as number[], ends: [] as number[], max: 1, view: 1, total: 1 });
  const [active, setActive] = useState(0);
  const [read, setRead] = useState<number[]>(() => sections.map(() => 0));
  const [moving, setMoving] = useState(false);
  const [drag, setDrag] = useState(false);
  const [panel, setPanel] = useState(false);
  const pos = useMotionValue(0);
  const smooth = useSpring(pos, { stiffness: 600, damping: 50 });
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hover = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touched = useRef(false);

  const RAIL = 352; // the rail's length
  const measure = useCallback(() => {
    const b = box.current;
    if (!b) return;
    const tops = refs.current.map((el) => (el ? el.offsetTop : 0));
    const ends = tops.map((t, i) => (i + 1 < tops.length ? tops[i + 1] : b.scrollHeight - 96));
    setGeo({ tops, ends, max: Math.max(1, b.scrollHeight - b.clientHeight), view: b.clientHeight, total: b.scrollHeight });
  }, []);
  useLayoutEffect(() => { measure(); }, [measure, sections]);
  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, [measure]);

  const thumbH = Math.max(34, (geo.view / geo.total) * RAIL);
  const span = RAIL - thumbH;
  const thumbY = useTransform(smooth, (p) => p * span);
  const tickY = (i: number) => Math.min(1, Math.max(0, ((geo.tops[i] ?? 0) - 12) / geo.max)) * span + thumbH / 2;

  const onScroll = () => {
    const b = box.current;
    if (!b) return;
    pos.set(b.scrollTop / geo.max);
    const line = b.scrollTop + b.clientHeight * 0.3;
    let a = 0;
    geo.tops.forEach((t, i) => { if (t <= line) a = i; });
    if (b.scrollTop >= geo.max - 2) a = sections.length - 1;
    setActive(a);
    // how much of each section has passed the bottom of the view
    const seen = b.scrollTop + b.clientHeight;
    setRead(geo.tops.map((t, i) => Math.min(1, Math.max(0, (seen - t) / Math.max(1, geo.ends[i] - t)))));
    setMoving(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setMoving(false), 900);
  };
  useEffect(() => { onScroll(); setMoving(false); }, [geo]); // eslint-disable-line react-hooks/exhaustive-deps

  const scrollTo = (to: number, glide = true) => {
    const b = box.current;
    if (!b) return;
    if (!glide || reduce) b.scrollTop = to;
    else animate(b.scrollTop, to, { type: "spring", stiffness: 140, damping: 26, onUpdate: (v) => { b.scrollTop = v; } });
  };
  const jump = (i: number) => scrollTo(Math.min(geo.tops[i] - 12, geo.max));

  // scrubbing: press anywhere on the rail and drag; the capsule follows your finger
  const scrubAt = (clientY: number) => {
    const el = rail.current;
    const r = el?.getBoundingClientRect();
    if (!el || !r) return;
    const k = el.offsetHeight ? r.height / el.offsetHeight : 1; // the rail may sit inside a scaled preview
    const p = Math.min(1, Math.max(0, ((clientY - r.top) / k - thumbH / 2) / span));
    scrollTo(p * geo.max, false);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); setDrag(true); setPanel(false); scrubAt(e.clientY); };
  const move = (e: RPointerEvent<HTMLDivElement>) => { if (drag) scrubAt(e.clientY); };
  const up = () => setDrag(false);
  const enter = () => { if (hover.current) clearTimeout(hover.current); hover.current = setTimeout(() => { if (!drag) setPanel(true); }, 280); };
  const leave = () => { if (hover.current) clearTimeout(hover.current); hover.current = setTimeout(() => setPanel(false), 200); };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const ok = () => live && !touched.current;
    (async () => {
      await sleep(1200);
      while (ok()) {
        const b = box.current;
        if (!b) break;
        // read for a while
        await new Promise<void>((done) => {
          const c = animate(b.scrollTop, geo.max * 0.38, { duration: 4.5, ease: "linear", onUpdate: (v) => { if (ok()) b.scrollTop = v; else c.stop(); }, onComplete: () => done() });
          const t = setInterval(() => { if (!ok()) { c.stop(); clearInterval(t); done(); } }, 100);
          void c.then(() => clearInterval(t));
        });
        if (!ok()) break;
        await sleep(900);
        if (!ok()) break;
        setPanel(true);
        await sleep(1700);
        if (!ok()) break;
        jump(4);
        await sleep(500);
        setPanel(false);
        await sleep(2000);
        if (!ok()) break;
        scrollTo(0);
        await sleep(1700);
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, geo.max]);

  const take = () => { touched.current = true; };
  const left = Math.max(1, Math.round(sections.slice(active).reduce((n, s, i) => n + words(s) * (i === 0 ? 1 - read[active] * 0.6 : 1), 0) / WPM));
  const showLabel = (moving || drag) && !panel;
  const labelY = useTransform(thumbY, (y) => y + thumbH / 2);

  return (
    <div
      onPointerDownCapture={take}
      onWheelCapture={take}
      onKeyDownCapture={take}
      onTouchStartCapture={take}
      className="relative w-full max-w-[600px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}
    >
      <div ref={box} onScroll={onScroll} tabIndex={0} aria-label="Article" className="h-[420px] overflow-y-auto px-9 py-9 pr-14 outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="m-0 text-[13px] font-semibold text-[#86868b]">Essay</p>
        <h3 className="m-0 mt-1.5 text-[30px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f]">Motion that explains itself</h3>
        <p className="m-0 mt-2 text-[15px] text-[#6e6e73]">{Math.round(sections.reduce((n, s) => n + words(s), 0) / WPM)} min read</p>
        {sections.map((s, i) => (
          <section key={s.id} ref={(el) => { refs.current[i] = el; }} className="pt-8">
            <h4 className="m-0 text-[21px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{s.title}</h4>
            {s.body.map((p, j) => <p key={j} className="m-0 mt-3 text-[17px] leading-[1.47] tracking-[-0.01em] text-[#1d1d1f]">{p}</p>)}
          </section>
        ))}
        <div className="h-24" />
      </div>

      {/* the rail: ticks where sections begin, and a capsule for where you are */}
      <div className="absolute right-0 top-[34px] w-11" style={{ height: RAIL }} onPointerEnter={enter} onPointerLeave={leave}>
        <div
          ref={rail}
          role="scrollbar"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos.get() * 100)}
          aria-label="Reading position"
          tabIndex={-1}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
        >
          <span aria-hidden="true" className="absolute right-[18px] top-0 h-full w-[2px] rounded-full bg-[#ececf0]" />
          {sections.map((s, i) => (
            <motion.span key={s.id} aria-hidden="true" className="absolute right-[15px] h-[2px] rounded-full" style={{ top: tickY(i) - 1 }} animate={{ width: i === active ? 10 : 8, backgroundColor: read[i] > 0.98 || i < active ? "#1d1d1f" : "#c7c7cc" }} transition={SPRING} />
          ))}
          <motion.span
            aria-hidden="true"
            className="absolute rounded-full bg-[#1d1d1f]/80"
            style={{ y: thumbY, height: thumbH, top: 0 }}
            animate={{ width: drag ? 8 : 5, right: drag ? 15 : 16.5, opacity: moving || drag || panel ? 1 : 0.55 }}
            transition={SPRING}
          />
        </div>

        {/* the label that rides beside the capsule while you move */}
        <AnimatePresence>
          {showLabel && (
            <motion.div key="label" aria-hidden="true" className="pointer-events-none absolute right-[34px] top-0" style={{ y: labelY }} initial={{ opacity: 0, x: 8, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 8, scale: 0.96, transition: { duration: 0.18 } }} transition={SPRING}>
              <div className="-translate-y-1/2 whitespace-nowrap rounded-[12px] px-3 py-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.08),0_8px_24px_-8px_rgba(0,0,0,.28)] backdrop-blur-xl" style={{ background: "rgba(250,250,252,.82)" }}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={active} className="block text-[13px] font-semibold leading-tight text-[#1d1d1f]" initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }} transition={SPRING}>{sections[active]?.title}</motion.span>
                </AnimatePresence>
                <span className="block text-[11.5px] leading-tight tabular-nums text-[#86868b]">{left} min left</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the contents panel */}
        <AnimatePresence>
          {panel && (
            <motion.nav
              key="panel"
              aria-label="Sections"
              className="absolute right-[38px] top-1/2 w-[232px] rounded-[18px] p-1.5 shadow-[0_0_0_.5px_rgba(0,0,0,.1),0_24px_48px_-16px_rgba(0,0,0,.3)] backdrop-blur-2xl"
              style={{ background: "rgba(250,250,252,.86)", transformOrigin: "100% 50%" }}
              initial={{ opacity: 0, scale: 0.94, x: 10, y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: 0, y: "-50%" }}
              exit={{ opacity: 0, scale: 0.96, x: 6, y: "-50%", transition: { duration: 0.16 } }}
              transition={SPRING}
            >
              <p className="m-0 px-2.5 pb-1 pt-1.5 text-[11.5px] font-semibold text-[#86868b]">Contents</p>
              {sections.map((s, i) => {
                const on = i === active;
                return (
                  <button key={s.id} type="button" onClick={() => jump(i)} aria-current={on ? "location" : undefined} className="relative flex w-full items-center gap-2.5 rounded-[11px] px-2.5 py-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
                    {on && <motion.span layoutId="rs-on" className="absolute inset-0 rounded-[11px] bg-black/[.05]" transition={SPRING} />}
                    <Ring v={read[i]} />
                    <span className={`relative min-w-0 flex-1 truncate text-[14px] ${on ? "font-semibold text-[#1d1d1f]" : "text-[#1d1d1f]"}`}>{s.title}</span>
                    <span className="relative text-[12px] tabular-nums text-[#86868b]">{Math.max(1, Math.round(words(s) / WPM * 2) / 2)}m</span>
                  </button>
                );
              })}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>

      {/* keyboard and screen readers get the contents without hovering */}
      <nav aria-label="Jump to section" className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:bottom-3 focus-within:left-3 focus-within:flex focus-within:gap-1 focus-within:rounded-full focus-within:bg-white focus-within:p-1 focus-within:shadow">
        {sections.map((s, i) => <button key={s.id} type="button" onClick={() => jump(i)} className="rounded-full px-2 py-1 text-[12px] focus-visible:ring-2 focus-visible:ring-[#0071e3]">{s.title}</button>)}
      </nav>
    </div>
  );
}

/** How much of a section you have read, as a small ring that fills and turns into a check. */
function Ring({ v }: { v: number }) {
  const done = v > 0.98;
  return (
    <span className="relative grid h-[18px] w-[18px] shrink-0 place-items-center" aria-hidden="true">
      <svg viewBox="0 0 20 20" width="18" height="18" className="-rotate-90">
        <circle cx="10" cy="10" r="8" fill="none" stroke="#e3e3e8" strokeWidth="2" />
        <motion.circle cx="10" cy="10" r="8" fill="none" stroke={done ? "#30a14e" : "#0071e3"} strokeWidth="2" strokeLinecap="round" initial={false} animate={{ pathLength: Math.max(0.001, v), opacity: v > 0.02 ? 1 : 0 }} transition={SPRING} />
      </svg>
      {done && (
        <svg viewBox="0 0 56 56" width="9" height="9" className="absolute text-[#30a14e]" fill="currentColor">
          <path d={CHECK} />
        </svg>
      )}
    </span>
  );
}

/* icon: Framework7 Icons (MIT), via Iconify */
const CHECK = "m45.646 14.646l.708.708a2 2 0 0 1 0 2.828l-22.94 22.94a2 2 0 0 1-2.828 0l-9.94-9.94a2 2 0 0 1 0-2.828l.708-.708a2 2 0 0 1 2.828 0l6.404 6.404a2 2 0 0 0 2.828 0l19.404-19.404a2 2 0 0 1 2.828 0";
