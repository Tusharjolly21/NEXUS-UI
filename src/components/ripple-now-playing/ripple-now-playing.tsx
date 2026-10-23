"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

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


export type Track = { title: string; artist: string; bpm: number; length: number; a: string; b: string; c: string; ink: string };

const TRACKS: Track[] = [
  { title: "Low Tide", artist: "Harbour Lights", bpm: 96, length: 204, a: "#ff375f", b: "#ff9f0a", c: "#5e0b2b", ink: "#ffffff" },
  { title: "Glass Floor", artist: "Morrow", bpm: 118, length: 187, a: "#64d2ff", b: "#0a84ff", c: "#071a4d", ink: "#ffffff" },
  { title: "Night Swim", artist: "Paloma Veil", bpm: 84, length: 231, a: "#bf5af2", b: "#ff2d92", c: "#1b0838", ink: "#ffffff" },
];

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** A radial ripple displacement map: red/green encode the outward push of a few rings. */
function makeRingMap(size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const img = g.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (x / size) * 2 - 1;
      const dy = (y / size) * 2 - 1;
      const r = Math.hypot(dx, dy) + 1e-6;
      const env = Math.max(0, 1 - r) * Math.min(1, r * 4);
      const s = Math.sin(r * 34) * env;
      const i = (y * size + x) * 4;
      img.data[i] = 128 + 127 * (dx / r) * s;
      img.data[i + 1] = 128 + 127 * (dy / r) * s;
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  return c.toDataURL();
}

/**
 * Ripple Now Playing: a player card whose cover sits under water. Every beat of the
 * track drops a ring that spreads through the artwork, so the cover pulses in time.
 * Pause and the water goes still; scrub the bar and a ring follows your finger;
 * skip and the new cover slides in. Space plays and pauses when the bar is focused.
 */
export interface RippleNowPlayingProps {
  /** Starts playing by itself and skips to the next track every seven seconds until someone touches the card. Pauses off screen and never runs under reduced motion. Without it the card waits, paused, until you press play. */
  autoplay?: boolean;
  /** The playlist: title, artist, bpm (the ripples follow it), length in seconds, three gradient colours (a, b, c) and the ink colour of the title. Defaults to three demo tracks. */
  tracks?: Track[];
  /** Extra classes for the card. */
  className?: string;
}

export function RippleNowPlaying({ autoplay = false, tracks = TRACKS, className }: RippleNowPlayingProps) {
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const onScreen = useDemoActive(cardRef, true);
  const onScreenRef = useRef(false);
  const activeAuto = useDemoActive(cardRef, autoplay && !reduce);
  const rawId = useId().replace(/:/g, "");
  const filterId = `rnp-${rawId}`;
  const touched = useRef(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [playing, setPlaying] = useState(autoplay && !reduce);
  const playingRef = useRef(autoplay && !reduce);
  const track = tracks[index % tracks.length];
  const trackRef = useRef(track);
  useEffect(() => {
    trackRef.current = track;
    playingRef.current = playing;
    onScreenRef.current = onScreen;
  });

  const time = useMotionValue(37);
  const progress = useTransform(time, (t) => t / trackRef.current.length);
  const elapsed = useTransform(time, (t) => fmt(t));
  const remaining = useTransform(time, (t) => `-${fmt(trackRef.current.length - t)}`);
  const width = useTransform(progress, (p) => `${Math.min(100, p * 100)}%`);

  const ring = useMotionValue(1);
  const energy = useMotionValue(0);
  const breathe = useSpring(1, { stiffness: 420, damping: 14 });
  const origin = useRef({ x: 150, y: 150 });

  const imgRef = useRef<SVGFEImageElement>(null);
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  // the ring map is drawn on a canvas, so it only exists in the browser
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMapUrl(makeRingMap()), []);

  // ring radius + strength -> filter attributes, outside React renders
  useEffect(() => {
    const apply = () => {
      const r = ring.get();
      const size = 40 + r * 520;
      const img = imgRef.current;
      const disp = dispRef.current;
      if (img) {
        img.setAttribute("x", String(origin.current.x - size / 2));
        img.setAttribute("y", String(origin.current.y - size / 2));
        img.setAttribute("width", String(size));
        img.setAttribute("height", String(size));
      }
      if (disp) disp.setAttribute("scale", String((1 - r) * 46 * energy.get()));
    };
    const a = ring.on("change", apply);
    const b = energy.on("change", apply);
    apply();
    return () => {
      a();
      b();
    };
  }, [ring, energy]);

  const pulse = (x = 150, y = 150, strength = 1) => {
    origin.current = { x, y };
    energy.set(strength);
    ring.set(0);
    animate(ring, 1, { duration: 1.25, ease: [0.2, 0.7, 0.3, 1] });
    breathe.set(1.025);
    window.setTimeout(() => breathe.set(1), 90);
  };

  // playback clock + beats
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let beatAcc = 0;
    let beatN = 0;
    const frame = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current && onScreenRef.current && !reduce) {
        const tr = trackRef.current;
        let t = time.get() + dt;
        if (t >= tr.length) t = 0;
        time.set(t);
        beatAcc += dt;
        const period = 60 / tr.bpm;
        if (beatAcc >= period) {
          beatAcc -= period;
          beatN++;
          const strong = beatN % 4 === 1;
          const off = strong ? { x: 150, y: 150 } : { x: 70 + Math.random() * 160, y: 70 + Math.random() * 160 };
          pulse(off.x, off.y, strong ? 1 : 0.55);
        }
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const touch = () => (touched.current = true);

  const skip = (d: number, user = true) => {
    if (user) touch();
    setDir(d);
    setIndex((i) => (i + d + tracks.length) % tracks.length);
    time.set(user ? 0 : 20 + Math.random() * 40);
    pulse(150, 150, 1);
  };

  useEffect(() => {
    if (!autoplay || reduce || !activeAuto) return;
    const id = window.setInterval(() => {
      if (touched.current) return window.clearInterval(id);
      skip(1, false);
    }, 7000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, activeAuto]);

  const toggle = () => {
    touch();
    setPlaying((p) => !p);
    if (playing) animate(energy, 0, { type: "spring", stiffness: 80, damping: 12 });
    else pulse(150, 150, 1);
  };

  // scrubbing
  const barRef = useRef<HTMLDivElement>(null);
  const scrubbing = useRef(false);
  const scrubTo = (clientX: number) => {
    const r = barRef.current!.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    time.set(p * trackRef.current.length);
    if (ring.get() > 0.35) pulse(40 + p * 220, 230, 0.7);
  };
  const onBarDown = (e: RPointerEvent<HTMLDivElement>) => {
    touch();
    scrubbing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scrubTo(e.clientX);
  };
  const onBarMove = (e: RPointerEvent<HTMLDivElement>) => scrubbing.current && scrubTo(e.clientX);
  const onBarUp = () => (scrubbing.current = false);
  const onBarKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    const L = trackRef.current.length;
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      touch();
      time.set(Math.min(L, Math.max(0, time.get() + (e.key === "ArrowRight" ? 5 : -5))));
      pulse(40 + (time.get() / L) * 220, 230, 0.6);
    } else if (e.key === " ") {
      e.preventDefault();
      toggle();
    }
  };

  const [ariaNow, setAriaNow] = useState(37);
  useEffect(() => {
    const id = window.setInterval(() => setAriaNow(Math.round(time.get())), 1000);
    return () => window.clearInterval(id);
  }, [time]);

  return (
    <div
      ref={cardRef}
      className={cn("w-[340px] max-w-full rounded-[24px] bg-white p-5 dark:bg-[#1c1c1e] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]", className)}
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif" }}
    >
      <motion.div style={{ scale: breathe }} className="relative aspect-square w-full overflow-hidden rounded-[18px] bg-[#1d1d1f]">
        <AnimatePresence initial={false} mode="popLayout" custom={dir}>
          <motion.svg
            key={track.title}
            viewBox="0 0 300 300"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label={`Cover art for ${track.title} by ${track.artist}`}
            custom={dir}
            initial={{ x: `${dir * 100}%`, opacity: 0.6 }}
            animate={{ x: "0%", opacity: 1 }}
            exit={{ x: `${-dir * 100}%`, opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <defs>
              <linearGradient id={`${filterId}-g-${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={track.a} />
                <stop offset="1" stopColor={track.c} />
              </linearGradient>
              <filter id={`${filterId}-blur-${index}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>
            <g filter={mapUrl ? `url(#${filterId})` : undefined}>
              <rect width="300" height="300" fill={`url(#${filterId}-g-${index})`} />
              <g filter={`url(#${filterId}-blur-${index})`}>
                <circle cx="210" cy="90" r="80" fill={track.b} opacity="0.9" />
                <circle cx="80" cy="220" r="70" fill={track.a} opacity="0.8" />
              </g>
              {[0, 1, 2, 3, 4].map((i) => (
                <path
                  key={i}
                  d={`M -10 ${150 + i * 18} C 60 ${120 + i * 18}, 120 ${190 + i * 18}, 190 ${150 + i * 18} S 280 ${120 + i * 18}, 320 ${150 + i * 18}`}
                  fill="none"
                  stroke={track.ink}
                  strokeOpacity={0.5 - i * 0.08}
                  strokeWidth="2"
                />
              ))}
              <text x="22" y="58" fill={track.ink} fontSize="40" fontWeight="700" letterSpacing="-1.6" fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif">
                {track.title}
              </text>
              <text x="24" y="84" fill={track.ink} fillOpacity="0.85" fontSize="14" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, system-ui, sans-serif">
                {track.artist}
              </text>
            </g>
          </motion.svg>
        </AnimatePresence>
        <svg width="0" height="0" className="absolute" aria-hidden="true">
          <filter id={filterId} x="0" y="0" width="300" height="300" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodColor="rgb(128,128,128)" result="flat" />
            {mapUrl && <feImage ref={imgRef} href={mapUrl} preserveAspectRatio="none" result="ring" />}
            <feMerge result="map">
              <feMergeNode in="flat" />
              <feMergeNode in="ring" />
            </feMerge>
            <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      </motion.div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={track.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: "spring", stiffness: 400, damping: 32 }}>
              <div className="truncate text-[17px] font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-[#f5f5f7]">{track.title}</div>
              <div className="truncate text-[14px] text-[#6e6e73] dark:text-[#a1a1a6]">{track.artist}</div>
            </motion.div>
          </AnimatePresence>
        </div>
        <span className="flex-none rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] font-medium tabular-nums text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">{track.bpm} BPM</span>
      </div>

      <div
        ref={barRef}
        role="slider"
        tabIndex={0}
        aria-label="Playback position"
        aria-valuemin={0}
        aria-valuemax={track.length}
        aria-valuenow={ariaNow}
        aria-valuetext={`${fmt(ariaNow)} of ${fmt(track.length)}`}
        onPointerDown={onBarDown}
        onPointerMove={onBarMove}
        onPointerUp={onBarUp}
        onPointerCancel={onBarUp}
        onKeyDown={onBarKey}
        className="group mt-4 cursor-pointer touch-none rounded-full py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      >
        <div className="relative h-1.5 overflow-hidden rounded-full bg-[#e8e8ed] dark:bg-[#3a3a3c]">
          <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[#1d1d1f] dark:bg-[#f5f5f7]" style={{ width }} />
        </div>
      </div>
      <div className="flex justify-between text-[12px] font-medium tabular-nums text-[#6e6e73] dark:text-[#a1a1a6]">
        <motion.span>{elapsed}</motion.span>
        <motion.span>{remaining}</motion.span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-6">
        <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => skip(-1)} aria-label="Previous track" className="flex h-11 w-11 items-center justify-center rounded-full text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 6v12L3 12zM20 6v12l-8-6z" /></svg>
        </motion.button>
        <motion.button
          type="button"
          whileTap={{ scale: 0.86 }}
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#1d1d1f] text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 dark:bg-[#f5f5f7] dark:text-[#1d1d1f] dark:ring-offset-[#1c1c1e]"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.svg key={playing ? "pause" : "play"} width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" initial={{ scale: 0.4, opacity: 0, rotate: -40 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.4, opacity: 0, rotate: 40 }} transition={{ type: "spring", stiffness: 500, damping: 24 }}>
              {playing ? <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /> : <path d="M8 5.5v13l11-6.5z" />}
            </motion.svg>
          </AnimatePresence>
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => skip(1)} aria-label="Next track" className="flex h-11 w-11 items-center justify-center rounded-full text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:text-[#f5f5f7]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13 6v12l8-6zM4 6v12l8-6z" /></svg>
        </motion.button>
      </div>
      <p className="m-0 mt-2 text-center text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Every beat ripples the cover. Scrub the bar to stir it.</p>
    </div>
  );
}
