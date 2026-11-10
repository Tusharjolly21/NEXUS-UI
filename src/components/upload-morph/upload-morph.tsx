"use client";

import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type UploadMorphProps = {
  fileName?: string;
  fileSize?: string;
  /**
   * Upload the file yourself: call report with 0 to 1 as it goes, and resolve when it is done (throw to fail).
   * Without it, the demo fills over about three seconds.
   */
  onUpload?: (report: (progress: number) => void) => Promise<void>;
  /** width of the card in pixels */
  size?: number;
  /** Soft synthesised sounds, scored to the motion. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = { at?: number; dur?: number; gain?: number; type?: OscillatorType; glide?: number; bell?: number };
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}


type State = "idle" | "uploading" | "done" | "failed";

// ───────────── the cloud and the ring are the same outline: 48 points, read from a cloud or from a circle ─────────────

const N = 48;
const R = 34;

/** the cloud: three puffs over a rounded base, as a signed distance */
function cloudSdf(x: number, y: number) {
  const puff = (cx: number, cy: number, r: number) => Math.hypot(x - cx, y - cy) - r;
  const bx = Math.abs(x - 1) - 34, by = Math.abs(y - 15) - 2, br = 13;
  const base = Math.hypot(Math.max(bx, 0), Math.max(by, 0)) + Math.min(Math.max(bx, by), 0) - br;
  return Math.min(puff(-20, 6, 18), puff(5, -5, 25), puff(28, 8, 15), base);
}

const ANGLES = Array.from({ length: N }, (_, k) => -Math.PI / 2 + (k / N) * Math.PI * 2);
const CLOUD: [number, number][] = ANGLES.map((a) => {
  const ox = 2, oy = 8;
  let s = 0;
  while (s < 90 && cloudSdf(ox + Math.cos(a) * s, oy + Math.sin(a) * s) <= 0) s += 0.2;
  return [ox + Math.cos(a) * s, oy + Math.sin(a) * s - 4];
});
const CIRCLE: [number, number][] = ANGLES.map((a) => [Math.cos(a) * R, Math.sin(a) * R]);
// the change runs round the outline as a wave: the top goes first, the bottom last
const LAG = 0.38;
const DELAY = ANGLES.map((a) => (LAG * (1 + Math.sin(a))) / 2);

/** a smooth closed path through the points, each part of the way from cloud to circle */
function outline(t: number) {
  const P = CLOUD.map(([x, y], i) => {
    // past either end, the spring's overshoot swells the whole shape a little
    const kk = t >= 1 ? 1 + (t - 1) * 1.6 : t <= 0 ? t : Math.min(1, Math.max(0, (t - DELAY[i]!) / (1 - LAG)));
    return [x + (CIRCLE[i]![0] - x) * kk, y + (CIRCLE[i]![1] - y) * kk] as const;
  });
  const at = (i: number) => P[(i + N) % N]!;
  let d = `M${at(0)[0].toFixed(2)},${at(0)[1].toFixed(2)}`;
  for (let i = 0; i < N; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(2)},${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(2)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(2)},${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
  }
  return d + "Z";
}

// the arrow's head becomes the check: left wing to the check's left end, tip to its corner, right wing to its right end
const ARROW = { l: [-10, -1], tip: [0, -12], r: [10, -1], foot: [0, 15] } as const;
const CHECK = { l: [-13, 0], tip: [-3.5, 9.5], r: [14, -10] } as const;
const mix = (a: readonly number[], b: readonly number[], k: number) => [a[0]! + (b[0]! - a[0]!) * k, a[1]! + (b[1]! - a[1]!) * k];
// the climb, as notes: each tenth of the upload rings one step higher
const STEPS = [1047, 1175, 1319, 1568, 1760, 2093, 2349, 2637, 3136, 3520];

/**
 * An upload status that takes itself apart to do the job.
 *
 * Tap it and the cloud's puffs smooth out, from the top round to the bottom, into a ring that becomes the progress
 * track; a glowing head leads the progress round it while the arrow keeps rising up through the ring like a conveyor.
 * When it lands the ring gives a soft pulse and a ripple, puffs back out into the cloud, and the arrow's head folds
 * into a check. If the upload fails the ring turns red and shakes, and the cloud comes back with its arrow.
 * Its sounds follow the picture: a tap, air as the cloud rounds, a note for each tenth that climbs the scale, a
 * chime as it lands, and a soft fall when it fails.
 */
export default function UploadMorph({
  fileName = "Q3-report.pdf",
  fileSize = "2.4 MB",
  onUpload,
  size = 300,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: UploadMorphProps) {
  const reduce = useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [state, setState] = useState<State>("idle");
  const [pct, setPct] = useState(0);
  const rootRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(rootRef, { margin: "100px" });
  const running = useRef(false);
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });

  const t = useMotionValue(0); // cloud 0, ring 1
  const k = useMotionValue(0); // arrow 0, check 1
  const p = useMotionValue(0); // progress
  const lift = useMotionValue(0); // the arrow's conveyor
  const bob = useMotionValue(0); // the arrow hovering while it waits
  const shake = useMotionValue(0);
  const pulse = useMotionValue(1);
  const fail = useMotionValue(0);
  const ripple = useMotionValue(0);

  const d = useTransform(t, outline);
  const stroke = useTransform([t, fail] as MotionValue<number>[], ([a, f]) =>
    (f as number) > 0.5 ? "#ffd6d3" : mixColor("#1d1d1f", "#e8e8ed", Math.min(1, Math.max(0, a as number))),
  );
  const arcOpacity = useTransform([t, p] as MotionValue<number>[], ([a, b]) => ((b as number) < 0.004 ? 0 : Math.min(1, Math.max(0, ((a as number) - 0.7) / 0.3))));
  const arcColor = useTransform(fail, [0, 1], ["#0071e3", "#ff3b30"]);
  const headX = useTransform(p, (v) => Math.cos(-Math.PI / 2 + v * Math.PI * 2) * R);
  const headY = useTransform(p, (v) => Math.sin(-Math.PI / 2 + v * Math.PI * 2) * R);
  const headOpacity = useTransform([t, p] as MotionValue<number>[], ([a, b]) => ((b as number) > 0.01 && (b as number) < 0.995 ? Math.max(0, ((a as number) - 0.7) / 0.3) : 0));
  const head = useTransform(k, (v) => {
    const a = mix(ARROW.l, CHECK.l, v), b = mix(ARROW.tip, CHECK.tip, v), c = mix(ARROW.r, CHECK.r, v);
    return `M${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}`;
  });
  const shaft = useTransform(k, (v) => {
    const top = mix(ARROW.tip, CHECK.tip, v), foot = mix(ARROW.foot, CHECK.tip, v);
    return `M${top[0]},${top[1]} L${foot[0]},${foot[1]}`;
  });
  const shaftOpacity = useTransform(k, [0, 0.7], [1, 0]);
  const glyph = useTransform(k, [0, 1], ["#1d1d1f", "#248a3d"]);
  const arrowY = useTransform([lift, bob] as MotionValue<number>[], ([a, b]) => (a as number) + (b as number));
  const copyY = useTransform(lift, (v) => v + 70);
  const rippleScale = useTransform(ripple, [0, 1], [1, 1.45]);
  const rippleOpacity = useTransform(ripple, [0, 0.15, 1], [0, 0.45, 0]);

  const loop = useRef<AnimationPlaybackControls | null>(null);

  // the percentage, and a note each time it passes another tenth
  const tenth = useRef(0);
  useEffect(
    () =>
      p.on("change", (v) => {
        setPct(Math.round(v * 100));
        const n = Math.floor(v * 10 + 0.001);
        if (n > tenth.current && n >= 1 && stateRef.current === "uploading") sfx.note(STEPS[Math.min(9, n - 1)]!, { dur: 0.16, gain: 0.07, bell: 0.35 });
        tenth.current = n;
      }),
    [p, sfx],
  );

  // the arrow hovers gently while it waits to be tapped
  useEffect(() => {
    if (reduce || state !== "idle") return void animate(bob, 0, { duration: 0.2 });
    const c = animate(bob, [0, -1.8, 0], { duration: 2.4, ease: "easeInOut", repeat: Infinity });
    return () => c.stop();
  }, [state, reduce, bob]);

  const go = (mv: MotionValue<number>, to: number, stiffness = 220, damping = 20) =>
    animate(mv, to, reduce ? { duration: 0 } : { type: "spring", stiffness, damping });
  const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, reduce ? 0 : ms));

  /** stop the conveyor where an arrow sits exactly in the middle */
  const settleArrow = async () => {
    loop.current?.stop();
    const v = lift.get();
    if (reduce || v === 0) return lift.jump(0);
    await animate(lift, -70, { duration: ((70 + v) / 70) * 0.5, ease: "easeOut" });
    lift.jump(0);
  };

  const start = async () => {
    if (running.current) return;
    running.current = true;
    fail.set(0);
    p.set(0);
    tenth.current = 0;
    setState("uploading");
    sfx.tick({ freq: 2600 });
    sfx.note(1319, { dur: 0.12, gain: 0.08 });
    sfx.whoosh(420, 2200, { dur: 0.55, gain: 0.07, at: 0.04 });
    go(k, 0, 300, 26);
    // start as soon as the ring has formed; its spring keeps settling underneath
    void go(t, 1, 150, 15);
    await sleep(480);
    if (!reduce) {
      lift.jump(0);
      loop.current = animate(lift, -70, { duration: 0.9, ease: "linear", repeat: Infinity });
    }
    try {
      if (onUpload) {
        await onUpload((v) => animate(p, Math.max(p.get(), Math.min(1, v)), { duration: 0.25 }));
        await animate(p, 1, { duration: 0.25 });
      } else {
        // a believable upload: quick at first, a pause in the middle, then the rest
        await animate(p, [0, 0.36, 0.42, 0.82, 1], { duration: 3, times: [0, 0.28, 0.5, 0.82, 1], ease: "easeInOut" });
      }
      await settleArrow();
      // it lands: a chime with the pulse and the ripple, then the cloud puffs back with a check
      sfx.note(1568, { dur: 0.55, gain: 0.11, bell: 0.5 });
      sfx.note(2349, { at: 0.09, dur: 0.7, gain: 0.09, bell: 0.5 });
      if (!reduce) {
        animate(ripple, [0, 1], { duration: 0.7, ease: "easeOut" });
        await animate(pulse, [1, 1.08, 1], { duration: 0.42, ease: "easeOut" });
      }
      setState("done");
      sfx.note(330, { glide: 494, dur: 0.45, gain: 0.07, type: "triangle", bell: 0 });
      sfx.note(1976, { at: 0.2, dur: 0.16, gain: 0.08, bell: 0.4 });
      go(k, 1, 260, 18);
      await go(t, 0, 180, 12);
    } catch {
      await settleArrow();
      setState("failed");
      sfx.note(392, { dur: 0.22, gain: 0.1, type: "triangle", bell: 0 });
      sfx.note(294, { at: 0.15, dur: 0.32, gain: 0.1, type: "triangle", bell: 0 });
      animate(fail, 1, { duration: 0.2 });
      if (!reduce) await animate(shake, [0, -7, 7, -5, 4, -2, 0], { duration: 0.5 });
      await sleep(500);
      await go(t, 0, 200, 16);
    }
    running.current = false;
  };

  const reset = () => {
    if (running.current) return;
    setState("idle");
    fail.set(0);
    p.set(0);
    tenth.current = 0;
    sfx.tick({ freq: 2200, gain: 0.06 });
    go(k, 0, 300, 24);
  };

  const onTap = () => {
    touched.current = true;
    if (state === "idle" || state === "failed") void start();
    else if (state === "done") reset();
  };

  // autoplay: upload, hold, start over, until someone touches it
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    (async () => {
      await sleep(900);
      while (ok()) {
        if (!running.current && (stateRef.current === "idle" || stateRef.current === "failed")) await start();
        await sleep(2600);
        if (!ok()) return;
        reset();
        await sleep(1600);
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce, inView]);

  useEffect(() => () => loop.current?.stop(), []);

  const status =
    state === "uploading" ? `Uploading · ${pct}%` : state === "done" ? "Uploaded" : state === "failed" ? "Upload failed. Tap to try again." : `${fileSize} · Tap to upload`;
  const label =
    state === "uploading"
      ? `Uploading ${fileName}, ${pct} percent`
      : state === "done"
        ? `${fileName} uploaded. Tap to upload another file`
        : state === "failed"
          ? `Upload of ${fileName} failed. Tap to try again`
          : `Upload ${fileName}`;

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onTap}
      onKeyDown={() => {
  touched.current = true;
}}
      aria-label={label}
      aria-busy={state === "uploading"}
      className={`group flex flex-col items-center rounded-[24px] bg-white px-6 pb-6 pt-7 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none transition-transform focus-visible:ring-2 focus-visible:ring-[#0071e3]/50 active:scale-[0.985] ${state === "uploading" ? "cursor-progress" : "cursor-pointer"} ${className}`}
      style={{ width: Math.max(220, Math.min(420, size)) }}
    >
      <motion.svg viewBox="-54 -48 108 96" className="w-[58%] overflow-visible" style={{ x: shake, scale: pulse }} aria-hidden="true">
        <defs>
          <clipPath id={`in-${uid}`}>
            <circle r={R - 3.5} />
          </clipPath>
          <radialGradient id={`glow-${uid}`}>
            <stop offset="0" stopColor="#0071e3" stopOpacity=".45" />
            <stop offset="1" stopColor="#0071e3" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* the ripple as it lands */}
        <motion.circle r={R} fill="none" stroke="#0071e3" strokeWidth={2} style={{ scale: rippleScale, opacity: rippleOpacity }} />
        <motion.path d={d} fill="none" style={{ stroke }} strokeWidth={3.4} strokeLinejoin="round" />
        {/* the progress, drawn over the ring from the top, led by a glowing head */}
        <motion.circle r={R} fill="none" strokeWidth={3.4} strokeLinecap="round" transform="rotate(-90)" style={{ pathLength: p, opacity: arcOpacity, stroke: arcColor }} />
        <motion.g style={{ x: headX, y: headY, opacity: headOpacity }}>
          <circle r={9} fill={`url(#glow-${uid})`} />
          <circle r={2.6} fill="#ffffff" stroke="#0071e3" strokeWidth={1.6} />
        </motion.g>
        <g clipPath={`url(#in-${uid})`}>
          <motion.g style={{ y: arrowY }}>
            <motion.path d={shaft} fill="none" style={{ stroke: glyph, opacity: shaftOpacity }} strokeWidth={3.4} strokeLinecap="round" />
            <motion.path d={head} fill="none" style={{ stroke: glyph }} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
          {/* the next arrow on the conveyor, coming up from below */}
          <motion.g style={{ y: copyY }}>
            <path d="M0,-12 L0,15 M-10,-1 L0,-12 L10,-1" fill="none" stroke="#1d1d1f" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </motion.g>
        </g>
      </motion.svg>
      <span className="mt-3 max-w-full truncate text-[15px] font-semibold tracking-[-0.01em]">{fileName}</span>
      <span
        aria-live="polite"
        className={`mt-0.5 text-[13px] tabular-nums ${state === "done" ? "text-[#248a3d]" : state === "failed" ? "text-[#d70015]" : "text-[#6e6e73]"}`}
      >
        {status}
      </span>
    </button>
  );
}

function mixColor(a: string, b: string, k: number) {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `rgb(${pa.map((v, i) => Math.round(v + (pb[i]! - v) * k)).join(",")})`;
}
