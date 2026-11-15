"use client";

/* eslint-disable react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DownloadButtonProps = {
  fileName?: string;
  /** shown under the name, e.g. the size */
  meta?: string;
  /** do the real download here; report progress from 0 to 1, resolve when done */
  onDownload?: (progress: (p: number) => void) => Promise<void>;
  /** the liquid's colour */
  color?: string;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
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
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
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

// a page with a folded corner, 30 x 38
const PAGE = "M5 1 H20 L29 10 V33 Q29 37 25 37 H5 Q1 37 1 33 V5 Q1 1 5 1 Z";
const FOLD = "M20 1 V7 Q20 10 23 10 H29";

type Phase = "idle" | "loading" | "done";

/** a simulated download: quick, then stalls, then rushes, like a real one */
async function fakeDownload(progress: (p: number) => void) {
  let p = 0;
  while (p < 1) {
    await new Promise((r) => setTimeout(r, 60 + Math.random() * 90));
    const step = p < 0.3 ? 0.05 : p < 0.55 ? 0.012 : p < 0.85 ? 0.04 : 0.025;
    p = Math.min(1, p + step * (0.6 + Math.random()));
    progress(p);
  }
}

/**
 * A download button whose file icon fills up like a glass. Press it and the pill opens out; liquid rises inside the
 * page icon as the percentage counts, sloshing in two layers of waves with a bright meniscus and bubbles rising
 * through it, while a wave-edged wash sweeps across the pill behind the label. At the top the liquid settles, a tick
 * drops onto the page and the pill closes up to Saved.
 */
export default function DownloadButton({
  fileName = "Brand guidelines.pdf",
  meta = "24.6 MB",
  onDownload = fakeDownload,
  color = "#0a84ff",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DownloadButtonProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const uid = useId().replace(/:/g, "");
  const [phase, setPhaseS] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  const setPhase = (p: Phase) => {
    phaseRef.current = p;
    setPhaseS(p);
  };
  const [pct, setPct] = useState(0);
  const target = useRef(0);
  const level = useRef(0);
  const touched = useRef(false);
  const back = useRef<SVGPathElement>(null);
  const front = useRef<SVGPathElement>(null);
  const shine = useRef<SVGPathElement>(null);
  const wash = useRef<SVGPathElement>(null);
  const bubbles = useRef<SVGGElement>(null);
  const lastTen = useRef(0);

  // the liquid: two wave layers over a level that eases toward the progress
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    let last = t0;
    const bub = Array.from({ length: 7 }, (_, i) => ({
      x: 6 + ((i * 7) % 20),
      y: 40 + i * 5,
      r: 0.8 + (i % 3) * 0.5,
      v: 7 + (i % 4) * 3,
    }));
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;
      level.current += (target.current - level.current) * Math.min(1, dt * (reduce ? 60 : 5));
      const lv = level.current;
      // agitation: busy while filling, calm when full
      const amp = reduce ? 0 : phaseRef.current === "loading" ? 1.6 : 0.6 * Math.exp(-t * 0.1);
      const y0 = 38 - lv * 37;
      const wave = (phase: number, k: number, a: number) => {
        let d = `M -2 40 L -2 ${y0.toFixed(2)}`;
        for (let x = -2; x <= 32; x += 2) d += ` L ${x} ${(y0 + Math.sin(x * k + phase) * a).toFixed(2)}`;
        return d + " L 32 40 Z";
      };
      back.current?.setAttribute("d", wave(t * 3.1 + 1.8, 0.32, amp * 1.1));
      front.current?.setAttribute("d", wave(-t * 4.2, 0.26, amp));
      if (shine.current) {
        let d = "";
        for (let x = 0; x <= 30; x += 2)
          d += `${x === 0 ? "M" : " L"} ${x} ${(y0 + Math.sin(x * 0.26 - t * 4.2) * amp + 0.7).toFixed(2)}`;
        shine.current.setAttribute("d", d);
        shine.current.setAttribute("opacity", lv > 0.02 && lv < 0.995 ? "0.9" : "0");
      }
      // bubbles rise through the liquid only
      if (bubbles.current) {
        const cs = bubbles.current.children;
        bub.forEach((b, i) => {
          b.y -= b.v * dt * (phaseRef.current === "loading" ? 1 : 0.4);
          if (b.y < y0 + 2) b.y = 38 + Math.random() * 4;
          const c = cs[i] as SVGCircleElement | undefined;
          if (c) {
            c.setAttribute("cx", (b.x + Math.sin(t * 3 + i) * 0.8).toFixed(2));
            c.setAttribute("cy", b.y.toFixed(2));
            c.setAttribute("opacity", lv > 0.08 ? "0.7" : "0");
          }
        });
      }
      // the wash across the pill, wave-edged at its front
      if (wash.current) {
        const W = 100;
        const x = lv * (W + 8) - 4;
        let d = `M 0 0 L ${x.toFixed(2)} 0`;
        for (let y = 0; y <= 20; y += 2)
          d += ` L ${(x + Math.sin(y * 0.6 + t * 7) * 1.6 * (phaseRef.current === "loading" ? 1 : 0)).toFixed(2)} ${y}`;
        wash.current.setAttribute("d", d + " L 0 20 Z");
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const start = async () => {
    if (phaseRef.current !== "idle") return;
    setPhase("loading");
    target.current = 0;
    lastTen.current = 0;
    setPct(0);
    sfx.note(440, { dur: 0.15, gain: 0.05 });
    await onDownload((p) => {
      target.current = Math.max(0, Math.min(1, p));
      const v = Math.round(target.current * 100);
      setPct(v);
      const ten = Math.floor(v / 10);
      if (ten > lastTen.current) {
        lastTen.current = ten;
        // a soft gulp as it fills, rising in pitch
        sfx.note(220 + ten * 40, {
          dur: 0.12,
          gain: 0.03,
          glide: 260 + ten * 45,
        });
      }
    });
    target.current = 1;
    setPct(100);
    await new Promise((r) => setTimeout(r, reduce ? 50 : 380));
    setPhase("done");
    sfx.note(784, { dur: 0.3, gain: 0.06, bell: 0.6 });
    sfx.note(1175, { at: 0.08, dur: 0.6, gain: 0.05, bell: 0.7 });
    await new Promise((r) => setTimeout(r, 2600));
    if ((phaseRef.current as Phase) === "done") {
      setPhase("idle");
      target.current = 0;
      setPct(0);
    }
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 900));
      while (alive && !touched.current) {
        await start();
        await new Promise((r) => setTimeout(r, 1500));
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const loading = phase === "loading";
  const done = phase === "done";
  const label = done ? "Saved" : loading ? `${pct}%` : "Download";
  const deep = useMemo(() => color, [color]);

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f5f5f7] ${className}`}
      style={{
        padding: "56px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        placeItems: "center",
        minHeight: 300,
      }}
    >
      <div style={{ display: "grid", justifyItems: "center", gap: 16 }}>
        <motion.button
          type="button"
          layout
          onClick={() => {
            touched.current = true;
            void start();
          }}
          disabled={loading}
          aria-label={
            done
              ? `${fileName} saved`
              : loading
                ? `Downloading ${fileName}, ${pct} percent`
                : `Download ${fileName}, ${meta}`
          }
          whileTap={phase === "idle" ? { scale: 0.96 } : undefined}
          transition={{ type: "spring", stiffness: 420, damping: 30 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f5f7]"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 12,
            height: 60,
            padding: loading ? "0 26px 0 14px" : "0 24px 0 14px",
            minWidth: loading ? 236 : 0,
            borderRadius: 30,
            border: 0,
            background: "#fff",
            color: "#1d1d1f",
            cursor: loading ? "progress" : "pointer",
            overflow: "hidden",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 14px 30px -18px rgba(0,0,0,0.35)",
          }}
        >
          {/* the wash behind the label */}
          <svg
            aria-hidden="true"
            viewBox="0 0 100 20"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: loading ? 1 : 0,
              transition: "opacity 0.4s",
            }}
          >
            <path ref={wash} fill={deep} opacity={0.09} />
          </svg>
          {/* the page that fills */}
          <motion.span
            animate={done && !reduce ? { y: [0, 3, -2, 0], rotate: [0, -4, 2, 0] } : { y: 0, rotate: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: "relative",
              width: 40,
              height: 44,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="30"
              height="38"
              viewBox="0 0 30 38"
              aria-hidden="true"
              style={{ display: "block", overflow: "visible" }}
            >
              <defs>
                <clipPath id={`pg-${uid}`}>
                  <path d={PAGE} />
                </clipPath>
                <linearGradient id={`lq-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={deep} stopOpacity="0.85" />
                  <stop offset="1" stopColor={deep} />
                </linearGradient>
              </defs>
              <path d={PAGE} fill="#fff" />
              <g clipPath={`url(#pg-${uid})`}>
                <path ref={back} fill={deep} opacity={0.45} />
                <path ref={front} fill={`url(#lq-${uid})`} />
                <path ref={shine} fill="none" stroke="#fff" strokeWidth={0.9} strokeLinecap="round" opacity={0} />
                <g ref={bubbles} fill="#fff">
                  {Array.from({ length: 7 }, (_, i) => (
                    <circle key={i} r={0.6 + (i % 3) * 0.45} opacity={0} />
                  ))}
                </g>
                {/* light on the glass of the page */}
                <path d="M4 4 V30" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" strokeLinecap="round" />
              </g>
              <path d={PAGE} fill="none" stroke="#1d1d1f" strokeWidth={1.6} strokeLinejoin="round" />
              <path d={FOLD} fill="none" stroke="#1d1d1f" strokeWidth={1.6} strokeLinejoin="round" />
              <AnimatePresence>
                {phase === "idle" && (
                  <motion.g
                    key="arrow"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                  >
                    <path
                      d="M15 14 V26 M10 21.5 L15 26.5 L20 21.5"
                      fill="none"
                      stroke="#1d1d1f"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.g>
                )}
                {done && (
                  <motion.path
                    key="tick"
                    d="M9 22 L13.5 26.5 L21.5 17"
                    fill="none"
                    stroke="#fff"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, y: -10, opacity: 0 }}
                    animate={{ pathLength: 1, y: 0, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      pathLength: { duration: 0.35, delay: 0.12 },
                      y: { type: "spring", stiffness: 500, damping: 14 },
                      opacity: { duration: 0.1 },
                    }}
                  />
                )}
              </AnimatePresence>
            </svg>
          </motion.span>
          <span style={{ position: "relative", display: "grid", textAlign: "left" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={loading ? "pct" : label}
                initial={{ y: 12, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -12, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  fontVariantNumeric: "tabular-nums",
                  color: done ? "#1a8f3e" : "#1d1d1f",
                }}
              >
                {loading ? (
                  <span>
                    Downloading <span style={{ color: deep }}>{pct}%</span>
                  </span>
                ) : (
                  label
                )}
              </motion.span>
            </AnimatePresence>
            <span style={{ fontSize: 12, color: "#86868b", whiteSpace: "nowrap" }}>{loading ? fileName : meta}</span>
          </span>
        </motion.button>
      </div>
      <p className="sr-only" aria-live="polite">
        {done ? `${fileName} saved` : ""}
      </p>
    </div>
  );
}
