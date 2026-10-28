# Vinyl Player

Add the "Vinyl Player" component from Nexus UI to my project.

A music player you play like a turntable: press play and the tonearm swings on while the platter spins up, grab the record to scrub exactly as far as you turn it, or fling it to coast. Skipping slides a new record onto the platter.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { VinylPlayer } from "@/components/vinyl-player";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/vinyl-player/index.ts ---

```ts
export { VinylPlayer } from "./vinyl-player";
export type { VinylPlayerProps, VinylTrack } from "./vinyl-player";
```

--- components/vinyl-player/vinyl-player.tsx ---

```tsx
"use client";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion";

export interface VinylTrack {
  title: string;
  artist: string;
  /** Length in seconds. */
  length: number;
  /** Two CSS colours for the centre label gradient. */
  label: [string, string];
}

export interface VinylPlayerProps {
  /** Records on the shelf. Defaults to three sample tracks. */
  tracks?: VinylTrack[];
  /** Starts the record, scratches now and then and changes records until someone touches it. */
  autoplay?: boolean;
  /** How fast the platter turns, as a share of 33⅓ rpm: 1 is the default, 1.35 is a 45, 2.3 is a 78. A faster record carries less audio per turn, so scrubbing follows. */
  speed?: number;
  /** How long a flung record keeps coasting after you let go, 1 is the default. Higher coasts for longer. */
  coast?: number;
  /** How briskly the tonearm swings on and off the record, 80 is the default. Higher snaps and overshoots a little, lower glides. */
  armStiffness?: number;
  /** How strongly light glints across the grooves, 1 is the default. 0 turns the glint off. */
  gloss?: number;
}

const DEFAULT_TRACKS: VinylTrack[] = [
  { title: "Slow Hours", artist: "Mira Lune", length: 214, label: ["#ff9f0a", "#ff375f"] },
  { title: "Paper Boats", artist: "The Quiet Fleet", length: 187, label: ["#64d2ff", "#0071e3"] },
  { title: "Night Garden", artist: "Oda & Kei", length: 242, label: ["#30d158", "#0b7a3b"] },
];
const RPM = 33.333;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(v) ? v : lo));
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * A music player you play like a turntable. Press play and the tonearm swings
 * onto the record and the platter spins up to speed; pause and it winds down.
 * Grab the record to scrub (it moves exactly as much audio as you turn it),
 * fling it and it coasts. The arm creeps inward as the track plays, and
 * skipping a track slides a new record onto the platter.
 *
 * The player is a visual instrument only: it never makes a sound.
 */
export function VinylPlayer({ tracks, autoplay = false, speed: speedProp = 1, coast = 1, armStiffness = 80, gloss = 1 }: VinylPlayerProps) {
  const list = tracks && tracks.length ? tracks : DEFAULT_TRACKS;
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [atRest, setAtRest] = useState(true); // tonearm parked off the record
  const reduced = useReducedMotion();
  const angle = useMotionValue(0); // degrees, the record's rotation
  const pos = useRef(0); // seconds into the track
  const speed = useRef(0); // 0..1 of full speed
  const spin = useRef(0); // free spin after a fling, deg/s
  const drag = useRef<{ a: number; last: number; t: number } | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const touched = useRef(false);
  const onScreen = useRef(true);
  const track = list[Math.min(i, list.length - 1)];
  const playingRef = useRef(playing);
  const trackRef = useRef(track);
  // the feel settings are read through a ref, so changing them never restarts the record
  const feel = useRef({ secPerTurn: 60 / RPM, coast: 1 });
  const rate = clamp(speedProp, 0.5, 2.5);
  const secPerTurn = 60 / (RPM * rate); // one revolution of the platter = this many seconds of audio (1.8 at 33⅓)
  const glint = clamp(gloss, 0, 3);
  useEffect(() => {
    playingRef.current = playing;
    trackRef.current = track;
    feel.current = { secPerTurn, coast: clamp(coast, 0.25, 4) };
  });

  // pause the simulation while the player is off screen or the tab is hidden
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => { onScreen.current = e.isIntersecting; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (!onScreen.current || document.hidden) return;
    const dt = Math.min(0.05, delta / 1000);
    if (drag.current) return;
    const len = trackRef.current.length;
    speed.current += ((playingRef.current ? 1 : 0) - speed.current) * Math.min(1, dt * (playingRef.current ? 2.2 : 1.4));
    setAtRest(!playingRef.current && speed.current < 0.05);
    let degPerSec = speed.current * (360 / feel.current.secPerTurn);
    if (Math.abs(spin.current) > 1) { degPerSec += spin.current; spin.current *= Math.pow(0.08, dt / feel.current.coast); } else spin.current = 0;
    const d = degPerSec * dt;
    if (!d) return;
    angle.set(angle.get() + d);
    pos.current = Math.max(0, Math.min(len, pos.current + (d / 360) * feel.current.secPerTurn));
    if (pos.current >= len) setPlaying(false);
    setTime(pos.current);
  });

  // rest just off the record; when playing the needle rides from the outer groove inwards
  const armAngle = atRest ? -6 : 21 + (time / track.length) * 14;

  const centre = () => { const r = disc.current!.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };
  const angleAt = (e: RPointerEvent) => { const c = centre(); return (Math.atan2(e.clientY - c.y, e.clientX - c.x) * 180) / Math.PI; };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { a: angleAt(e), last: performance.now(), t: 0 };
    spin.current = 0;
  };
  const move = (e: RPointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const a = angleAt(e);
    let d = a - g.a;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    const now = performance.now();
    g.t = d / Math.max(0.008, (now - g.last) / 1000);
    g.a = a; g.last = now;
    angle.set(angle.get() + d);
    pos.current = Math.max(0, Math.min(track.length, pos.current + (d / 360) * secPerTurn));
    setTime(pos.current);
  };
  const up = () => {
    const g = drag.current;
    if (!g) return;
    drag.current = null;
    spin.current = Math.max(-1400, Math.min(1400, g.t));
  };
  const key = (e: KeyboardEvent) => {
    const d = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
    if (d) {
      e.preventDefault();
      touched.current = true;
      pos.current = Math.max(0, Math.min(track.length, pos.current + d));
      angle.set(angle.get() + (d / secPerTurn) * 360);
      setTime(pos.current);
    }
  };
  const skip = (dir: 1 | -1) => {
    touched.current = true;
    setI((n) => (n + dir + list.length) % list.length);
    pos.current = 0;
    setTime(0);
    spin.current = 0;
  };

  useEffect(() => {
    if (!autoplay || reduced) return;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const t1 = setTimeout(() => { if (!touched.current) setPlaying(true); }, 700);
    timers.add(t1);
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      if (!onScreen.current || document.hidden) return;
      spin.current = -900; // a little scratch now and then
      const t2 = setTimeout(() => { if (!touched.current) spin.current = 600; }, 260);
      timers.add(t2);
    }, 4200);
    const id2 = setInterval(() => {
      if (touched.current) return clearInterval(id2);
      if (!onScreen.current || document.hidden) return;
      setI((n) => (n + 1) % list.length);
      pos.current = 0;
    }, 12600);
    return () => { timers.forEach(clearTimeout); clearInterval(id); clearInterval(id2); };
  }, [autoplay, reduced, list.length]);

  const labelRot = useTransform(angle, (a) => `rotate(${a}deg)`);
  return (
    <div
      ref={root}
      className="w-[360px] max-w-full rounded-[28px] bg-white p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]"
    >
      <div className="relative mx-auto aspect-square w-full max-w-[300px] rounded-[22px] bg-[#f5f5f7] shadow-[inset_0_1px_0_rgba(255,255,255,.9),inset_0_-1px_2px_rgba(0,0,0,.05)] dark:bg-[#2c2c2e] dark:shadow-[inset_0_1px_0_rgba(255,255,255,.06),inset_0_-1px_2px_rgba(0,0,0,.4)]">
        {/* platter + record */}
        <div
          ref={disc}
          className="absolute left-[7%] top-[7%] aspect-square w-[78%] cursor-grab touch-none rounded-full bg-[#d2d2d7] p-[2.5%] shadow-[0_10px_24px_-10px_rgba(0,0,0,.45)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] active:cursor-grabbing dark:bg-[#3a3a3c] dark:focus-visible:ring-[#2997ff]"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="slider"
          tabIndex={0}
          aria-label={`Scrub ${track.title}`}
          aria-valuemin={0}
          aria-valuemax={track.length}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} of ${fmt(track.length)}`}
          onKeyDown={key}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={i} className="relative h-full w-full" initial={{ x: "-120%", rotate: -60 }} animate={{ x: 0, rotate: 0 }} exit={{ x: "120%", rotate: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 160, damping: 22 }}>
              <motion.div className="absolute inset-0 rounded-full" style={{ transform: labelRot, background: "radial-gradient(circle, transparent 47%, rgba(255,255,255,.05) 47.5%, transparent 48.5%, transparent 66%, rgba(255,255,255,.05) 66.5%, transparent 67.5%), repeating-radial-gradient(circle at 50% 50%, #151517 0 2px, #1a1a1c 2px 4px)" }}>
                {/* label */}
                <div className="absolute left-1/2 top-1/2 flex h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center" style={{ background: `radial-gradient(circle at 35% 30%, ${track.label[0]}, ${track.label[1]})` }}>
                  <span className="max-w-[80%] truncate text-[9px] font-semibold uppercase tracking-[0.08em] text-white">{track.title}</span>
                  <span className="mt-[2px] text-[7px] text-white/75">{track.artist}</span>
                  <span className="absolute h-[9%] w-[9%] rounded-full bg-[#e8e8ed] shadow-[inset_0_1px_1px_rgba(0,0,0,.4)]" />
                </div>
              </motion.div>
              {/* the sheen stays put while the record turns under it */}
              <div className="pointer-events-none absolute inset-0 rounded-full" style={{ background: `conic-gradient(from 20deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,${0.16 * glint}) 28deg, rgba(255,255,255,0) 60deg, rgba(255,255,255,0) 180deg, rgba(255,255,255,${0.12 * glint}) 208deg, rgba(255,255,255,0) 240deg)`, WebkitMaskImage: "radial-gradient(circle, transparent 18%, #000 19%)", maskImage: "radial-gradient(circle, transparent 18%, #000 19%)" }} />
            </motion.div>
          </AnimatePresence>
        </div>
        {/* tonearm */}
        <motion.div className="pointer-events-none absolute right-[9%] top-[8%] h-[58%] w-[14px]" style={{ transformOrigin: "50% 9px" }} animate={{ rotate: armAngle }} transition={{ type: "spring", stiffness: clamp(armStiffness, 20, 300), damping: 16 }}>
          <span className="absolute left-1/2 top-0 h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#f5f5f7] to-[#a1a1a6] shadow-[0_2px_4px_rgba(0,0,0,.3)]" />
          <span className="absolute left-1/2 top-[9px] h-[calc(100%-9px)] w-[4px] -translate-x-1/2 rounded-full bg-gradient-to-r from-[#e8e8ed] to-[#aeaeb2]" />
          <span className="absolute bottom-[-6px] left-1/2 h-[16px] w-[10px] -translate-x-1/2 rotate-[18deg] rounded-[3px] bg-gradient-to-b from-[#d2d2d7] to-[#8e8e93] shadow-[0_2px_4px_rgba(0,0,0,.35)]" />
        </motion.div>
        <span className="absolute bottom-[6%] right-[8%] flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#86868b] dark:text-[#8e8e93]">
          <span className={`h-1.5 w-1.5 rounded-full ${playing ? "bg-[#30d158]" : "bg-[#c7c7cc] dark:bg-[#48484a]"}`} />{rate === 1 ? "33⅓" : Math.round(RPM * rate * 10) / 10}
        </span>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <div className="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{track.title}</div>
              <div className="truncate text-[13px] text-[#6e6e73] dark:text-[#a1a1a6]">{track.artist}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="flex-none text-[12px] tabular-nums text-[#86868b] dark:text-[#8e8e93]">{fmt(time)} / {fmt(track.length)}</span>
      </div>
      <div className="mt-2 h-[4px] overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]"><div className="h-full rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ width: `${(time / track.length) * 100}%` }} /></div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <button type="button" onClick={() => skip(-1)} aria-label="Previous track" className="flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#2997ff]"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg></button>
        <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => { touched.current = true; if (pos.current >= track.length) pos.current = 0; setPlaying((p) => !p); }} aria-label={playing ? "Pause" : "Play"} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1d1d1f] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:focus-visible:ring-[#2997ff] dark:focus-visible:ring-offset-[#1c1c1e]">
          <AnimatePresence mode="popLayout" initial={false}>
            {playing ? <motion.svg key="p" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></motion.svg> : <motion.svg key="pl" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} aria-hidden="true"><path d="M8 5l12 7-12 7z" /></motion.svg>}
          </AnimatePresence>
        </motion.button>
        <button type="button" onClick={() => skip(1)} aria-label="Next track" className="flex h-10 w-10 items-center justify-center rounded-full text-[#1d1d1f] outline-none hover:bg-[#f5f5f7] focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7] dark:hover:bg-[#2c2c2e] dark:focus-visible:ring-[#2997ff]"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z" /></svg></button>
      </div>
    </div>
  );
}
```
