"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type DictationCardProps = {
  /** what the demo "hears", word by word */
  script?: string;
  placeholder?: string;
  /** called with the full text when it has finished */
  onDone?: (text: string) => void;
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
const engine = () =>
  (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ??
  null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
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
  whoosh: (
    from: number,
    to: number,
    o?: { at?: number; dur?: number; gain?: number },
  ) => void;
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
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running"
        ? e
        : null;
    };
    const env = (
      ctx: AudioContext,
      t: number,
      peak: number,
      attack: number,
      dur: number,
    ) => {
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
        if (o.glide)
          a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide)
            b.frequency.exponentialRampToValueAtTime(
              o.glide * 2.76,
              t + dur * 0.6,
            );
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
        g.gain.exponentialRampToValueAtTime(
          Math.max(0.0002, peak),
          t + dur * 0.35,
        );
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

const sans =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', system-ui, sans-serif";
const mono = "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace";
const I = {
  mic: "M80 128V64a48 48 0 0 1 96 0v64a48 48 0 0 1-96 0m128 0a8 8 0 0 0-16 0a64 64 0 0 1-128 0a8 8 0 0 0-16 0a80.11 80.11 0 0 0 72 79.6V240a8 8 0 0 0 16 0v-32.4a80.11 80.11 0 0 0 72-79.6",
  stop: "M216 56v144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V56a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16",
};
const FIELD = 78; // height of the dot field at the bottom
const GAP = 7; // dot spacing
const ROWS = 10;

type Word = {
  id: number;
  text: string;
  final: string;
  fixed: boolean;
  shown: boolean;
};
type Spark = {
  x: number;
  y: number;
  px: number;
  py: number;
  ox: number;
  oy: number;
  cx: number;
  cy: number;
  tx: number;
  ty: number;
  t: number;
  dur: number;
  size: number;
  wid: number;
  gone: number;
};

/** where the ink of a word falls, as dots about a pixel apart, measured from its left edge and baseline */
const glyphCache = new Map<string, { pts: [number, number][]; w: number }>();
function glyphs(text: string, font: string) {
  const k = font + "|" + text;
  const hit = glyphCache.get(k);
  if (hit) return hit;
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 4;
  const S = 2;
  c.width = w * S;
  c.height = 30 * S;
  g.scale(S, S);
  g.font = font;
  g.fillStyle = "#000";
  g.textBaseline = "alphabetic";
  g.fillText(text, 0, 22);
  const d = g.getImageData(0, 0, c.width, c.height).data;
  const pts: [number, number][] = [];
  for (let y = 0; y < c.height; y += 3)
    for (let x = 0; x < c.width; x += 3)
      if (d[(y * c.width + x) * 4 + 3] > 110)
        pts.push([
          x / S + (Math.random() - 0.5) * 0.6,
          y / S - 22 + (Math.random() - 0.5) * 0.6,
        ]);
  const out = { pts, w: w - 4 };
  glyphCache.set(k, out);
  return out;
}
/** how a recogniser hears a word before it tidies up: lower case, no punctuation */
const rough = (w: string, i: number) =>
  (i === 0 ? w.toLowerCase() : w).replace(/[.,!?;:]/g, "");

/**
 * Dictation you can watch turning into words.
 *
 * While you speak, a field of tiny dots along the bottom of the card rises into a soft mound of light that swells and
 * shifts with your voice, the dots growing and brightening where it is loudest. As each word is recognised a spray of
 * those dots breaks off the top of the mound and streams up in an arc, leaving short streaks behind it, to the place
 * on the line where the word belongs; the word arrives blurred and pixelated and settles sharp. A small clock counts
 * up in the corner. Stop, and the mound sinks into a thin travelling line while it finishes thinking, then rests.
 * This demo plays a script instead of using the microphone; feed your own words in to use it for real.
 */
export default function DictationCard({
  script = "Remind me to call Maya tomorrow morning, then book a quiet table for two by the river.",
  placeholder = "Tap the mic and speak.",
  onDone,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: DictationCardProps) {
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const [phase, setPhase] = useState<
    "idle" | "listening" | "thinking" | "done"
  >("idle");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [words, setWords] = useState<Word[]>([]);
  const wordsRef = useRef(words);
  wordsRef.current = words;
  const [secs, setSecs] = useState(0);
  const card = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const spans = useRef(new Map<number, HTMLSpanElement>());
  const shownIds = useRef(new Set<number>());
  shownIds.current = new Set(words.filter((w) => w.shown).map((w) => w.id));
  const pending = useRef<number[]>([]);
  const voice = useRef({ level: 0, target: 0, mound: 0, flat: 0, peak: 0.5 });
  const sparks = useRef<Spark[]>([]);
  const touched = useRef(false);
  const run = useRef(0);
  const kick = useRef<() => void>(() => {});

  // a recognised word: once it is laid out, send a spray from the mound to it
  useLayoutEffect(() => {
    const ids = pending.current.splice(0);
    const c = card.current;
    if (!c || ids.length === 0) return;
    const cr = c.getBoundingClientRect();
    const W = cr.width,
      H = cr.height;
    for (const id of ids) {
      const el = spans.current.get(id);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const word = el.textContent ?? "";
      const gl = glyphs(word, `400 16px ${sans}`);
      const sx = r.width / Math.max(1, gl.w);
      // the baseline of 16 px type in a 22 px line
      const base = r.top - cr.top + 16.5;
      const pick =
        gl.pts.length > 90
          ? gl.pts.filter(() => Math.random() < 90 / gl.pts.length)
          : gl.pts;
      const v = voice.current;
      for (const [gx, gy] of pick) {
        // from near the top of the mound to its own spot in the letters
        const ox = W * (v.peak + (Math.random() - 0.5) * 0.16);
        const oy =
          H -
          14 -
          (FIELD - 16) * (0.55 + Math.random() * 0.4) * Math.max(0.35, v.mound);
        const tx = r.left - cr.left + gx * sx;
        const ty = base + gy;
        sparks.current.push({
          x: ox,
          y: oy,
          px: ox,
          py: oy,
          ox,
          oy,
          cx: ox + (tx - ox) * 0.2 + (Math.random() - 0.5) * 40,
          cy: Math.min(ty, oy) - 18 - Math.random() * 30,
          tx,
          ty,
          t: -Math.random() * 0.16,
          dur: 0.38 + Math.random() * 0.26,
          size: 1 + Math.random() * 0.9,
          wid: id,
          gone: 0,
        });
      }
      // when the dots have spelt it, the real word comes up through them
      setTimeout(
        () =>
          setWords((ws) =>
            ws.map((w) => (w.id === id ? { ...w, shown: true } : w)),
          ),
        760,
      );
    }
    kick.current();
  }, [words]);

  // the dot field and the sparks
  useEffect(() => {
    const c = cv.current,
      el = card.current;
    if (!c || !el) return;
    const g = c.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let W = 0,
      H = 0,
      dpr = 1,
      raf = 0,
      last = performance.now(),
      t = 0,
      visible = true,
      calm = 0;
    const resize = () => {
      W = el.offsetWidth;
      H = el.offsetHeight;
      dpr = Math.min(3, window.devicePixelRatio || 1);
      c.width = W * dpr;
      c.height = H * dpr;
    };
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      t += dt;
      const v = voice.current;
      const ph = phaseRef.current;
      v.level +=
        (v.target - v.level) * Math.min(1, dt * (v.target > v.level ? 22 : 9));
      const goalM = ph === "listening" ? 0.35 + v.level * 0.65 : 0;
      v.mound +=
        (goalM - v.mound) * Math.min(1, dt * (ph === "thinking" ? 5 : 7));
      v.flat += ((ph === "thinking" ? 1 : 0) - v.flat) * Math.min(1, dt * 4);
      // the loudest part wanders a little, like a voice moving through its range
      v.peak = 0.5 + Math.sin(t * 0.7) * 0.07 + Math.sin(t * 1.9 + 1) * 0.04;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, W, H);

      // the field
      const cols = Math.floor((W - 24) / GAP);
      const x0 = (W - (cols - 1) * GAP) / 2;
      const yb = H - 12;
      for (let i = 0; i < cols; i++) {
        const u = i / (cols - 1);
        // the mound: a few soft bumps around the peak
        const d1 = (u - v.peak) / 0.16,
          d2 = (u - v.peak + 0.11 + Math.sin(t * 2.3) * 0.03) / 0.09,
          d3 = (u - v.peak - 0.12 - Math.sin(t * 1.7) * 0.03) / 0.1;
        const shimmer =
          0.85 +
          0.15 * Math.sin(t * 11 + i * 0.9) * Math.sin(t * 7.3 + i * 0.37);
        const h =
          (Math.exp(-d1 * d1) * 0.85 +
            Math.exp(-d2 * d2) * 0.45 * v.level +
            Math.exp(-d3 * d3) * 0.4 * v.level) *
          v.mound *
          shimmer;
        // while thinking: a thin line with a pulse running along it
        const run =
          Math.exp(-Math.pow((u - ((t * 0.55) % 1.4) + 0.2) / 0.08, 2)) *
          v.flat;
        const lit = h * ROWS;
        for (let j = 0; j < ROWS; j++) {
          const y = yb - j * GAP;
          let s = 0,
            a = 0;
          if (j === 0) {
            s = 1.1 + run * 1.8 + Math.min(1, lit) * 1.6;
            a = 0.22 + run * 0.7 + Math.min(1, lit) * 0.7;
          } else {
            // each dot flickers on its own, so the mound sparkles instead of sitting there solid
            const n = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453;
            const r = n - Math.floor(n);
            const fl =
              0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * (4 + r * 9) + r * 40));
            const k =
              Math.max(0, Math.min(1, lit - j)) * (r < 0.18 ? 0.35 : fl);
            const edge = Math.max(0, Math.min(1, lit - j + 1)) - k; // the top row of the mound, partly lit
            s = k * 2.6 + edge * 1.3 + (lit > j - 2.5 ? 0.6 : 0);
            a = k * 0.92 + edge * 0.5 + (lit > j - 2.5 ? 0.12 : 0);
            if (h < 0.02) s = 0;
          }
          if (s <= 0.05 || a <= 0.01) continue;
          g.globalAlpha = Math.min(1, a);
          g.fillStyle = "#fff";
          if (s > 2) {
            g.beginPath();
            g.arc(x0 + i * GAP, y, s / 1.6, 0, Math.PI * 2);
            g.fill();
          } else g.fillRect(x0 + i * GAP - s / 2, y - s / 2, s, s);
        }
      }
      // a soft glow over the mound
      if (v.mound > 0.02) {
        const gx = x0 + v.peak * (cols - 1) * GAP;
        const gr = g.createRadialGradient(gx, yb, 4, gx, yb, 150);
        gr.addColorStop(0, `rgba(255,255,255,${0.1 * v.mound})`);
        gr.addColorStop(1, "rgba(255,255,255,0)");
        g.globalAlpha = 1;
        g.fillStyle = gr;
        g.fillRect(gx - 150, yb - 150, 300, 160);
      }
      // the sparks
      const list = sparks.current;
      g.lineCap = "round";
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.t += dt;
        if (p.t < 0) continue;
        const u = Math.min(1, p.t / p.dur);
        const e = 1 - Math.pow(1 - u, 2.2);
        const k = 1 - e;
        p.px = p.x;
        p.py = p.y;
        p.x = k * k * p.ox + 2 * k * e * p.cx + e * e * p.tx;
        p.y = k * k * p.oy + 2 * k * e * p.cy + e * e * p.ty;
        if (u < 1) {
          g.globalAlpha = 0.5;
          g.strokeStyle = "#fff";
          g.lineWidth = p.size * 0.8;
          g.beginPath();
          g.moveTo(p.px - (p.x - p.px) * 1.2, p.py - (p.y - p.py) * 1.2);
          g.lineTo(p.x, p.y);
          g.stroke();
          g.globalAlpha = 1;
          g.fillStyle = "#fff";
          g.beginPath();
          g.arc(p.x, p.y, p.size * 0.6, 0, Math.PI * 2);
          g.fill();
          continue;
        }
        // landed: it stays as a dot of the letter until the word itself shows, then melts into it
        if (shownIds.current.has(p.wid)) p.gone += dt / 0.32;
        const al =
          Math.max(0, 1 - p.gone) * (0.8 + 0.2 * Math.sin(t * 20 + p.tx));
        g.globalAlpha = al;
        g.fillStyle = "#fff";
        g.fillRect(p.tx - 0.6, p.ty - 0.6, 1.2, 1.2);
        if (p.gone >= 1) list.splice(i, 1);
      }
      g.globalAlpha = 1;
      calm =
        v.mound < 0.003 &&
        v.flat < 0.003 &&
        list.length === 0 &&
        ph !== "listening"
          ? calm + dt
          : 0;
      raf = visible && calm < 0.3 ? requestAnimationFrame(frame) : 0;
    };
    kick.current = () => {
      if (!raf && visible) {
        calm = 0;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const ro = new ResizeObserver(() => {
      resize();
      kick.current();
    });
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick.current();
    });
    io.observe(el);
    resize();
    void reduce;
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const start = async (user: boolean) => {
    if (user) touched.current = true;
    const me = ++run.current;
    const alive = () => run.current === me;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setWords([]);
    setSecs(0);
    setPhase("listening");
    kick.current();
    sfx.note(880, { dur: 0.25, gain: 0.05 });
    sfx.note(1320, { at: 0.08, dur: 0.3, gain: 0.04 });
    const t0 = performance.now();
    const clock = setInterval(
      () => alive() && setSecs(Math.floor((performance.now() - t0) / 1000)),
      250,
    );
    const parts = script.split(/\s+/).filter(Boolean);
    let id = 0;
    await wait(500);
    for (const w of parts) {
      if (!alive() || phaseRef.current !== "listening") break;
      // the syllables of the word, as bursts of loudness
      const syl = Math.max(1, Math.round(w.replace(/[^a-z]/gi, "").length / 3));
      for (let s = 0; s < syl; s++) {
        voice.current.target = 0.55 + Math.random() * 0.45;
        await wait(95 + Math.random() * 60);
        voice.current.target = 0.25 + Math.random() * 0.15;
        await wait(40);
      }
      const wid = ++id;
      const heard = rough(w, wid - 1);
      if (reduce)
        setWords((ws) => [
          ...ws,
          { id: wid, text: heard, final: w, fixed: false, shown: true },
        ]);
      else {
        pending.current.push(wid);
        setWords((ws) => [
          ...ws,
          { id: wid, text: heard, final: w, fixed: false, shown: false },
        ]);
      }
      voice.current.target = /[,.]$/.test(w) ? 0.05 : 0.2;
      await wait(/[,.]$/.test(w) ? 380 : 70 + Math.random() * 90);
    }
    clearInterval(clock);
    if (!alive()) return;
    voice.current.target = 0;
    finish(me);
  };
  const finish = async (me: number) => {
    if (phaseRef.current !== "listening") return;
    setPhase("thinking");
    sfx.note(660, { dur: 0.2, gain: 0.04 });
    await new Promise((r) => setTimeout(r, 450));
    if (run.current !== me) return;
    // the tidy-up: capitals and punctuation arrive word by word, left to right
    setWords((ws) => ws.map((w) => ({ ...w, shown: true })));
    const all = wordsRef.current;
    for (let i = 0; i < all.length; i++) {
      if (run.current !== me) return;
      if (all[i].text !== all[i].final) {
        setWords((ws) =>
          ws.map((w) => (w.id === all[i].id ? { ...w, fixed: true } : w)),
        );
        sfx.tick({ freq: 3000, gain: 0.03 });
      }
      await new Promise((r) => setTimeout(r, 38));
    }
    await new Promise((r) => setTimeout(r, 450));
    if (run.current !== me) return;
    setPhase("done");
    onDone?.(script);
  };
  const stop = (user: boolean) => {
    if (user) touched.current = true;
    voice.current.target = 0;
    void finish(run.current);
  };

  useEffect(() => {
    if (!autoplay) return;
    let alive = true;
    (async () => {
      await new Promise((r) => setTimeout(r, 900));
      while (alive && !touched.current) {
        await start(false);
        await new Promise((r) => setTimeout(r, 3600));
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay]);

  const rec = phase === "listening";
  const mm = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div
      ref={card}
      className={`relative w-full max-w-[460px] overflow-hidden rounded-[26px] bg-[#1c1c1e] text-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}
      style={{ fontFamily: sans, height: 232 }}
    >
      <div className="relative z-[1] flex items-start gap-3 px-5 pt-[18px]">
        <p
          className="min-h-[44px] flex-1 text-[16px] leading-[22px]"
          aria-live="polite"
        >
          {words.length === 0 && phase !== "listening" && (
            <span className="text-[#8e8e93]">{placeholder}</span>
          )}
          {words.length === 0 && phase === "listening" && (
            <span className="text-[#8e8e93]">Listening...</span>
          )}
          {words.map((w) => (
            <span key={w.id}>
              <motion.span
                ref={(n) => {
                  if (n) spans.current.set(w.id, n);
                  else spans.current.delete(w.id);
                }}
                className="relative inline-block"
                initial={false}
                animate={
                  w.shown
                    ? { opacity: 1, filter: "blur(0px)" }
                    : { opacity: 0, filter: "blur(3px)" }
                }
                transition={{
                  duration: w.shown ? 0.34 : 0,
                  ease: [0.2, 0.7, 0.3, 1],
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={w.fixed ? "f" : "r"}
                    className="inline-block"
                    initial={{ opacity: 0, filter: "blur(4px)", y: 3 }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      y: 0,
                      color: w.fixed
                        ? ["#ffffff", "#cfe6ff", "#ffffff"]
                        : "#ffffff",
                    }}
                    exit={{ opacity: 0, filter: "blur(4px)", y: -3 }}
                    transition={{ duration: 0.3 }}
                  >
                    {w.fixed ? w.final : w.text}
                  </motion.span>
                </AnimatePresence>
              </motion.span>{" "}
            </span>
          ))}
        </p>
        <span
          className="flex h-[22px] shrink-0 items-center gap-1.5 text-[12px] tabular-nums text-[#aeaeb2]"
          style={{ fontFamily: mono }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {rec && (
              <motion.span
                key="r"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.span
                  className="h-[6px] w-[6px] rounded-full bg-white"
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
                {mm}
              </motion.span>
            )}
            {phase === "thinking" && (
              <motion.span
                key="t"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="h-[6px] w-[6px] rounded-full bg-[#8e8e93]" />
                thinking
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </div>
      <canvas
        ref={cv}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <motion.button
        type="button"
        onClick={() =>
          rec ? stop(true) : phase === "thinking" ? undefined : void start(true)
        }
        aria-label={rec ? "Stop dictation" : "Start dictation"}
        whileTap={{ scale: 0.9 }}
        className="absolute right-4 top-[88px] z-[2] grid h-10 w-10 place-items-center rounded-full bg-[#3a3a3c] text-white outline-none focus-visible:shadow-[0_0_0_3px_#0a84ff]"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={phase === "thinking" ? "th" : rec ? "st" : "mi"}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
          >
            {phase === "thinking" ? (
              <span className="flex gap-[3px]">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-[3px] w-[3px] rounded-full bg-white"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </span>
            ) : (
              <svg
                viewBox="0 0 256 256"
                width={rec ? 14 : 17}
                height={rec ? 14 : 17}
                aria-hidden="true"
                style={{ display: "block" }}
              >
                <path fill="currentColor" d={rec ? I.stop : I.mic} />
              </svg>
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
