"use client";

/* eslint-disable react-hooks/purity, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  type DragEvent as RDragEvent,
  type PointerEvent as RPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type FileDropProps = {
  /** largest file accepted, in megabytes */
  maxMB?: number;
  accept?: string;
  /** do the real upload; report progress 0 to 1, resolve when done */
  upload?: (file: File, progress: (p: number) => void) => Promise<void>;
  onDone?: (files: File[]) => void;
  /** photos offered as samples to drag in; each is downloaded and dropped as a real file */
  samples?: { name: string; src: string }[];
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

const I = {
  cloud:
    "M247.93 124.52C246.11 77.54 207.07 40 160.06 40a88.1 88.1 0 0 0-78.77 48.67A87.5 87.5 0 0 0 72 127.73a8.18 8.18 0 0 1-7.43 8.27a8 8 0 0 1-8.57-8a103.7 103.7 0 0 1 5.34-32.92a4 4 0 0 0-4.75-5.18A64.09 64.09 0 0 0 8 152c0 35.19 29.75 64 65 64h87a88.09 88.09 0 0 0 87.93-91.48m-50.27 9.14a8 8 0 0 1-11.32 0L168 115.31V176a8 8 0 0 1-16 0v-60.69l-18.34 18.35a8 8 0 0 1-11.32-11.32l32-32a8 8 0 0 1 11.32 0l32 32a8 8 0 0 1 0 11.32",
  check: "m232.49 80.49l-128 128a12 12 0 0 1-17 0l-56-56a12 12 0 1 1 17-17L96 183L215.51 63.51a12 12 0 0 1 17 17Z",
  trash:
    "M216 48H40a8 8 0 0 0 0 16h8v144a16 16 0 0 0 16 16h128a16 16 0 0 0 16-16V64h8a8 8 0 0 0 0-16m-24 160H64V64h128ZM80 24a8 8 0 0 1 8-8h80a8 8 0 0 1 0 16H88a8 8 0 0 1-8-8",
  warn: "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m-8 56a8 8 0 0 1 16 0v56a8 8 0 0 1-16 0Zm8 104a12 12 0 1 1 12-12a12 12 0 0 1-12 12",
  file: "m213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66M152 88V44l44 44Z",
};
const Ico = ({ d, size }: { d: string; size: number }) => (
  <svg viewBox="0 0 256 256" width={size} height={size} style={{ display: "block" }} aria-hidden="true">
    <path fill="currentColor" d={d} />
  </svg>
);

type Item = {
  id: number;
  name: string;
  size: number;
  url: string | null;
  color: string;
  p: number;
  state: "up" | "done" | "error";
  err?: string;
  file: File;
};

/** Unsplash photos (Johny Goerend, Samuel Chenard, Madhu Shesharam), at up to 3840 px */
const SAMPLES = [
  {
    name: "reine-lofoten.jpg",
    src: "https://images.unsplash.com/photo-1593378026483-2a1fd46a35bd?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    name: "torres-del-paine.jpg",
    src: "https://images.unsplash.com/photo-1546569397-ab326af881f5?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
  {
    name: "antelope-canyon.jpg",
    src: "https://images.unsplash.com/photo-1505521377774-103a8cc2f735?fm=jpg&q=80&fit=max&w=3840&h=3840",
  },
];

/** a painted stand-in, used only if a sample photo can't be downloaded */
function paintedFile(name: string): Promise<File> {
  const c = document.createElement("canvas");
  c.width = 240;
  c.height = 180;
  const g = c.getContext("2d")!;
  const gr = g.createLinearGradient(0, 0, 240, 180);
  gr.addColorStop(0, "#9ec5ff");
  gr.addColorStop(1, "#2f4f8f");
  g.fillStyle = gr;
  g.fillRect(0, 0, 240, 180);
  return new Promise((res) =>
    c.toBlob((b) => res(new File([b!], name.replace(/\.\w+$/, ".png"), { type: "image/png" })), "image/png"),
  );
}

async function sampleFile(s: { name: string; src: string }): Promise<File> {
  try {
    const r = await fetch(s.src);
    if (!r.ok) throw new Error(String(r.status));
    const b = await r.blob();
    return new File([b], s.name, { type: b.type || "image/jpeg" });
  } catch {
    return paintedFile(s.name);
  }
}

async function fakeUpload(_f: File, progress: (p: number) => void) {
  let p = 0;
  while (p < 1) {
    await new Promise((r) => setTimeout(r, 70 + Math.random() * 90));
    p = Math.min(1, p + (p < 0.4 ? 0.07 : p < 0.7 ? 0.035 : 0.06) * (0.6 + Math.random()));
    progress(p);
  }
}

const fmt = (b: number) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

async function averageColor(url: string): Promise<string> {
  return new Promise((res) => {
    const im = new Image();
    im.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 8;
      const g = c.getContext("2d")!;
      g.drawImage(im, 0, 0, 8, 8);
      const d = g.getImageData(0, 0, 8, 8).data;
      let r = 0;
      let gg = 0;
      let b = 0;
      for (let i = 0; i < d.length; i += 4) {
        r += d[i];
        gg += d[i + 1];
        b += d[i + 2];
      }
      // a little richer than the plain average, so it reads as the picture's colour
      const h = (v: number) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, "0");
      const m = (r + gg + b) / 192;
      const k = 1.35;
      res(`#${h(m + (r / 64 - m) * k)}${h(m + (gg / 64 - m) * k)}${h(m + (b / 64 - m) * k)}`);
    };
    im.onerror = () => res("#0a84ff");
    im.src = url;
  });
}

/**
 * A drop zone that feels alive. Carry a file over it and the dashed border starts to run, the zone lights up and a
 * swirl of motes gathers under your pointer, pulled in like a well. Let go and a ripple of light in the picture's own
 * colour spreads from where it landed, a new row drops in, and the row fills like liquid as it uploads, then glows and gets a check.
 * Too-big files shake red; delete splits a row in two and lets the halves fall. Try the sample chips: drag one in
 * or tap it. The zone also opens the file picker and works by keyboard.
 */
export default function FileDrop({
  maxMB = 10,
  accept = "image/png,image/jpeg,image/gif,image/webp",
  upload = fakeUpload,
  onDone,
  samples = SAMPLES,
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: FileDropProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const zone = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const motes = useRef<HTMLCanvasElement>(null);
  const [over, setOver] = useState(false);
  const overRef = useRef(false);
  const hand = useRef({ x: 0.5, y: 0.5 });
  const [items, setItems] = useState<Item[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; c: string }[]>([]);
  const [broken, setBroken] = useState<(Item & { top: number })[]>([]);
  const [ghost, setGhost] = useState<{
    i: number;
    x: number;
    y: number;
  } | null>(null);
  const touched = useRef(false);
  const list = useRef<HTMLDivElement>(null);

  const setOverS = (v: boolean) => {
    overRef.current = v;
    setOver(v);
  };

  // the motes: a swirl of light that gathers under the pointer while something is carried over
  useEffect(() => {
    const c = motes.current;
    const el = zone.current;
    const ctx = c?.getContext("2d");
    if (!c || !el || !ctx) return;
    const P = Array.from({ length: 70 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: 0,
      vy: 0,
      a: 0,
      s: 0.6 + Math.random() * 1.2,
    }));
    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.04, (now - last) / 1000);
      last = now;
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = el.clientWidth;
      const H = el.clientHeight;
      if (c.width !== Math.round(W * dpr)) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const on = overRef.current && !reduce;
      const hx = hand.current.x;
      const hy = hand.current.y;
      for (const p of P) {
        p.a += ((on ? 1 : 0) - p.a) * Math.min(1, dt * (on ? 3 : 5));
        if (p.a < 0.01) continue;
        const dx = hx - p.x;
        const dy = (hy - p.y) * (H / W);
        const d = Math.hypot(dx, dy) + 0.02;
        // pulled in and swirled round
        p.vx += ((dx / d) * 0.6 - (dy / d) * 0.9) * dt * 0.9;
        p.vy += ((dy / d) * 0.6 + (dx / d) * 0.9) * dt * 0.9 * (W / H);
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (d < 0.03) {
          p.x = Math.random();
          p.y = Math.random();
          p.vx = p.vy = 0;
        }
        // the middle, where the icon and the words sit, is kept clear: motes fade out as they drift into it
        const ex = (p.x - 0.5) / 0.34;
        const ey = (p.y - 0.5) / 0.46;
        const e = ex * ex + ey * ey;
        const clear = Math.min(1, Math.max(0, (e - 0.75) / 0.6));
        if (clear <= 0.01) continue;
        const r = p.s * (1 + (1 - Math.min(1, d * 3)) * 0.5);
        ctx.fillStyle = `rgba(10,132,255,${(0.2 + 0.45 * (1 - Math.min(1, d * 2))) * p.a * clear})`;
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  const add = async (files: File[], at?: { x: number; y: number }) => {
    for (const f of files) {
      const id = Date.now() + Math.random();
      const isImg = f.type.startsWith("image/");
      const url = isImg ? URL.createObjectURL(f) : null;
      const color = url ? await averageColor(url) : "#0a84ff";
      const tooBig = f.size > maxMB * 1e6;
      const okType =
        !accept ||
        accept.split(",").some((a) => a.trim() === f.type || (a.endsWith("/*") && f.type.startsWith(a.slice(0, -1))));
      const item: Item = {
        id,
        name: f.name,
        size: f.size,
        url,
        color,
        p: 0,
        state: tooBig || !okType ? "error" : "up",
        err: tooBig ? `Larger than ${maxMB} MB` : !okType ? "Not an image" : undefined,
        file: f,
      };
      setItems((xs) => [item, ...xs]);
      if (at) setRipples((r) => [...r, { id, x: at.x, y: at.y, c: color }]);
      if (item.state === "error") {
        sfx.note(220, { dur: 0.25, gain: 0.05, type: "triangle" });
        continue;
      }
      sfx.whoosh(500, 1800, { dur: 0.35, gain: 0.04 });
      void upload(f, (p) => setItems((xs) => xs.map((x) => (x.id === id ? { ...x, p } : x)))).then(() => {
        setItems((xs) => {
          const nx = xs.map((x) => (x.id === id ? { ...x, p: 1, state: "done" as const } : x));
          if (nx.every((x) => x.state !== "up")) onDone?.(nx.filter((x) => x.state === "done").map((x) => x.file));
          return nx;
        });
        sfx.note(784, { dur: 0.25, gain: 0.05, bell: 0.5 });
        sfx.note(1175, { at: 0.08, dur: 0.4, gain: 0.04, bell: 0.6 });
      });
    }
  };

  const remove = (it: Item) => {
    const el = list.current?.querySelector<HTMLElement>(`[data-id="${it.id}"]`);
    const top = el && list.current ? el.offsetTop : 0;
    setBroken((b) => [...b, { ...it, top }]);
    setItems((xs) => xs.filter((x) => x.id !== it.id));
    sfx.tick({ freq: 400, gain: 0.08 });
    sfx.whoosh(2400, 400, { dur: 0.35, gain: 0.04 });
    window.setTimeout(() => setBroken((b) => b.filter((x) => x.id !== it.id)), 1000);
  };

  const local = (e: { clientX: number; clientY: number }) => {
    const r = zone.current?.getBoundingClientRect();
    return r ? { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height } : { x: 0.5, y: 0.5 };
  };
  const onDragOver = (e: RDragEvent) => {
    e.preventDefault();
    touched.current = true;
    hand.current = local(e);
    if (!overRef.current) {
      setOverS(true);
      sfx.whoosh(300, 900, { dur: 0.4, gain: 0.03 });
    }
  };
  const onDrop = (e: RDragEvent) => {
    e.preventDefault();
    setOverS(false);
    const files = [...e.dataTransfer.files];
    if (files.length) void add(files, local(e));
  };

  // the sample chips can be dragged with the pointer (no real files needed) or tapped
  const chipDrag = useRef<{
    i: number;
    sx: number;
    sy: number;
    moved: boolean;
  } | null>(null);
  const chipDown = (i: number) => (e: RPointerEvent<HTMLButtonElement>) => {
    touched.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    chipDrag.current = { i, sx: e.clientX, sy: e.clientY, moved: false };
  };
  const chipMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = chipDrag.current;
    if (!d) return;
    if (Math.hypot(e.clientX - d.sx, e.clientY - d.sy) > 6) d.moved = true;
    if (!d.moved) return;
    setGhost({ i: d.i, x: e.clientX, y: e.clientY });
    const r = zone.current?.getBoundingClientRect();
    const inside = !!r && e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom;
    if (inside) hand.current = local(e);
    if (inside !== overRef.current) {
      setOverS(inside);
      if (inside) sfx.whoosh(300, 900, { dur: 0.4, gain: 0.03 });
    }
  };
  const chipUp = async (e: RPointerEvent<HTMLButtonElement>) => {
    const d = chipDrag.current;
    chipDrag.current = null;
    setGhost(null);
    if (!d) return;
    const wasOver = overRef.current;
    setOverS(false);
    if (!d.moved || wasOver)
      void add([await sampleFile(samples[d.i % samples.length])], wasOver ? local(e) : { x: 0.5, y: 0.5 });
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const run = async () => {
      await wait(1000);
      let k = 0;
      while (alive && !touched.current) {
        setOverS(true);
        for (let s = 0; s < 22 && alive; s++) {
          hand.current = {
            x: 0.5 + Math.cos(s / 3) * 0.2,
            y: 0.5 + Math.sin(s / 3) * 0.2,
          };
          await wait(50);
        }
        if (!alive || touched.current) return;
        setOverS(false);
        await add([await sampleFile(samples[k++ % samples.length])], {
          ...hand.current,
        });
        await wait(2800);
        if (k % 3 === 0) {
          setItems((xs) => {
            const last = xs[xs.length - 1];
            if (last) window.setTimeout(() => remove(last), 0);
            return xs;
          });
          await wait(1200);
          setItems([]);
          await wait(600);
        }
      }
    };
    void run();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const row = (it: Item, half?: "l" | "r") => (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 12,
        height: 62,
        padding: "0 12px 0 8px",
        borderRadius: 18,
        background: "#f7f7f9",
        overflow: "hidden",
      }}
    >
      {/* the liquid fill */}
      {it.state !== "error" && (
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{
            width: `${it.p * 100}%`,
            opacity: it.state === "done" ? 0 : 1,
          }}
          transition={{
            width: { type: "spring", stiffness: 120, damping: 22 },
            opacity: { duration: 0.8, delay: 0.5 },
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            background: `linear-gradient(90deg, ${it.color}22, ${it.color}55)`,
          }}
        >
          {/* a wavy front that rolls along as it fills */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -8,
              top: 0,
              width: 8,
              height: "100%",
              overflow: "hidden",
            }}
          >
            <motion.svg
              viewBox="0 0 8 124"
              width="8"
              height="124"
              animate={reduce ? undefined : { y: [0, -31] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
              style={{ display: "block" }}
            >
              <path
                d="M0 0 Q 8 7.75 0 15.5 Q 8 23.25 0 31 Q 8 38.75 0 46.5 Q 8 54.25 0 62 Q 8 69.75 0 77.5 Q 8 85.25 0 93 Q 8 100.75 0 108.5 Q 8 116.25 0 124 Z"
                fill={`${it.color}55`}
              />
            </motion.svg>
          </div>
        </motion.div>
      )}
      {it.state === "done" && !half && (
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 0 2px #30d158, 0 0 24px #30d15866",
            borderRadius: 18,
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: 46,
          height: 46,
          borderRadius: 12,
          overflow: "hidden",
          flexShrink: 0,
          background: it.color,
          display: "grid",
          placeItems: "center",
          color: "#fff",
          boxShadow: "0 4px 10px -4px rgba(0,0,0,0.3)",
        }}
      >
        {it.url ? (
          <img src={it.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <Ico d={I.file} size={20} />
        )}
      </div>
      <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
        {/* a long name is cut in the middle, so the extension always shows */}
        <div
          title={it.name}
          style={{
            display: "flex",
            minWidth: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "#1d1d1f",
            whiteSpace: "nowrap",
          }}
        >
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
            }}
          >
            {it.name.replace(/(\.[a-z0-9]{1,5})$/i, "")}
          </span>
          <span style={{ flexShrink: 0 }}>{(/\.[a-z0-9]{1,5}$/i.exec(it.name) ?? [""])[0]}</span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: it.state === "error" ? "#d70015" : "#6e6e73",
            fontVariantNumeric: "tabular-nums",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {it.state === "error" ? (
            <>
              <Ico d={I.warn} size={12} /> {it.err}
            </>
          ) : it.state === "done" ? (
            `${fmt(it.size)}, uploaded`
          ) : (
            `${Math.round(it.p * 100)}% of ${fmt(it.size)}`
          )}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <AnimatePresence>
          {it.state === "done" && (
            <motion.span
              key="ok"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 16 }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                background: "#30d158",
                color: "#fff",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Ico d={I.check} size={13} />
            </motion.span>
          )}
        </AnimatePresence>
        {!half && (
          <button
            type="button"
            aria-label={`Remove ${it.name}`}
            onClick={() => {
              touched.current = true;
              remove(it);
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              border: 0,
              background: "transparent",
              color: "#86868b",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Ico d={I.trash} size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`relative w-full rounded-[24px] bg-[#f2f2f4] select-none ${className}`}
      style={{
        padding: "36px 16px",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        justifyItems: "center",
      }}
    >
      <div
        style={{
          width: "min(100%, 420px)",
          background: "#fff",
          borderRadius: 28,
          padding: 16,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 30px 60px -36px rgba(0,0,0,0.4)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "2px 4px 12px",
          }}
        >
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1d1d1f",
              letterSpacing: "-0.01em",
            }}
          >
            Upload images
          </span>
          <span style={{ fontSize: 12, color: "#86868b" }}>PNG, JPG, GIF up to {maxMB} MB</span>
        </div>
        <motion.div
          ref={zone}
          role="button"
          tabIndex={0}
          aria-label="Drop images here, or press to choose files"
          onClick={() => input.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              input.current?.click();
            }
          }}
          onDragEnter={onDragOver}
          onDragOver={onDragOver}
          onDragLeave={(e) => {
            if (!zone.current?.contains(e.relatedTarget as Node)) setOverS(false);
          }}
          onDrop={onDrop}
          animate={{ scale: over ? 1.02 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 26 }}
          className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
          style={{
            position: "relative",
            height: 170,
            borderRadius: 20,
            cursor: "pointer",
            overflow: "hidden",
            background: over ? "radial-gradient(70% 80% at 50% 50%, #eaf3ff, #f7faff)" : "#fafafb",
            transition: "background 0.3s",
          }}
        >
          <svg aria-hidden="true" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            <rect
              x="1"
              y="1"
              width="calc(100% - 2px)"
              height="calc(100% - 2px)"
              rx="19"
              fill="none"
              stroke={over ? "#0a84ff" : "#d2d2d8"}
              strokeWidth={over ? 2 : 1.5}
              strokeDasharray="7 7"
              style={{ transition: "stroke 0.3s" }}
            >
              {!reduce && (
                <animate
                  attributeName="stroke-dashoffset"
                  from="0"
                  to="-28"
                  dur={over ? "0.45s" : "1.6s"}
                  repeatCount="indefinite"
                />
              )}
            </rect>
          </svg>
          <canvas
            ref={motes}
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
          {ripples.map((r) => (
            <motion.span
              key={r.id}
              aria-hidden="true"
              initial={{ scale: 0.2, opacity: 0.9 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              onAnimationComplete={() => setRipples((rs) => rs.filter((x) => x.id !== r.id))}
              style={{
                position: "absolute",
                left: `${r.x * 100}%`,
                top: `${r.y * 100}%`,
                width: 60,
                height: 60,
                marginLeft: -30,
                marginTop: -30,
                borderRadius: "50%",
                border: `1.5px solid ${r.c}`,
                boxShadow: `0 0 12px ${r.c}55`,
                pointerEvents: "none",
              }}
            />
          ))}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div>
              <motion.div
                animate={over ? { y: -8, scale: 1.12, rotate: [0, -6, 6, 0] } : { y: 0, scale: 1, rotate: 0 }}
                transition={
                  over
                    ? {
                        rotate: { duration: 0.6, repeat: Infinity },
                        default: {
                          type: "spring",
                          stiffness: 400,
                          damping: 18,
                        },
                      }
                    : { type: "spring", stiffness: 400, damping: 18 }
                }
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  margin: "0 auto",
                  display: "grid",
                  placeItems: "center",
                  color: over ? "#fff" : "#0a84ff",
                  background: over ? "linear-gradient(180deg,#3d9bff,#0a6be0)" : "#eef5ff",
                  boxShadow: over ? "0 12px 26px -10px #0a84ff" : "none",
                  transition: "background 0.3s, color 0.3s",
                }}
              >
                <Ico d={I.cloud} size={26} />
              </motion.div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14.5,
                  fontWeight: 600,
                  color: "#1d1d1f",
                }}
              >
                {over ? (
                  "Let go to upload"
                ) : (
                  <>
                    Drop images here or <span style={{ color: "#0a84ff" }}>browse</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#86868b", marginTop: 2 }}>You can add several at once</div>
            </div>
          </div>
          <input
            ref={input}
            type="file"
            multiple
            accept={accept}
            onChange={(e) => e.target.files && void add([...e.target.files])}
            style={{ display: "none" }}
          />
        </motion.div>
        <div
          ref={list}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr)",
            gap: 8,
            marginTop: items.length || broken.length ? 12 : 0,
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((it) => (
              <motion.div
                key={it.id}
                data-id={it.id}
                layout
                initial={{
                  opacity: 0,
                  y: -16,
                  scale: 0.94,
                  filter: "blur(6px)",
                }}
                animate={
                  it.state === "error"
                    ? {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        x: [0, -8, 7, -5, 3, 0],
                      }
                    : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                }
                exit={{ opacity: 0, height: 0, marginTop: -8 }}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                  x: { duration: 0.45 },
                  filter: { duration: 0.3 },
                }}
              >
                {row(it)}
              </motion.div>
            ))}
          </AnimatePresence>
          {/* a deleted row snaps in two and the halves fall */}
          {broken.map((it) =>
            (["l", "r"] as const).map((h) => (
              <motion.div
                key={it.id + h}
                aria-hidden="true"
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{
                  x: h === "l" ? -40 : 40,
                  y: 120,
                  rotate: h === "l" ? -14 : 16,
                  opacity: 0,
                }}
                transition={{ duration: 0.85, ease: [0.4, 0, 1, 0.7] }}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: it.top,
                  clipPath:
                    h === "l"
                      ? "polygon(0 0, 52% 0, 47% 35%, 53% 62%, 48% 100%, 0 100%)"
                      : "polygon(52% 0, 100% 0, 100% 100%, 48% 100%, 53% 62%, 47% 35%)",
                  transformOrigin: h === "l" ? "20% 100%" : "80% 100%",
                  pointerEvents: "none",
                }}
              >
                {row(it, h)}
              </motion.div>
            )),
          )}
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          gap: 10,
          alignItems: "center",
        }}
      >
        {samples.map((s, i) => (
          <motion.button
            key={s.name}
            type="button"
            aria-label={`Add the sample photo ${s.name}`}
            onPointerDown={chipDown(i)}
            onPointerMove={chipMove}
            onPointerUp={chipUp}
            whileHover={{ y: -3, rotate: i % 2 ? 3 : -3 }}
            whileTap={{ scale: 0.94 }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{
              position: "relative",
              width: 46,
              height: 56,
              borderRadius: 10,
              border: "3px solid #fff",
              padding: 0,
              overflow: "hidden",
              cursor: "grab",
              touchAction: "none",
              background: "#dfe3ea",
              boxShadow: "0 8px 16px -8px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.06)",
              opacity: ghost?.i === i ? 0.4 : 1,
            }}
          >
            <img
              src={s.src}
              alt=""
              draggable={false}
              decoding="async"
              loading="lazy"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />
          </motion.button>
        ))}
        <span
          style={{
            fontSize: 12,
            color: "#86868b",
            marginLeft: 4,
            lineHeight: 1.35,
          }}
        >
          Try a photo: drag it in, or tap it
        </span>
      </div>
      {ghost && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed",
            left: ghost.x - 23,
            top: ghost.y - 28,
            width: 46,
            height: 56,
            borderRadius: 10,
            border: "3px solid #fff",
            overflow: "hidden",
            background: "#dfe3ea",
            transform: "rotate(-8deg) scale(1.1)",
            boxShadow: "0 20px 30px -12px rgba(0,0,0,0.45)",
            pointerEvents: "none",
            zIndex: 50,
          }}
        >
          <img
            src={samples[ghost.i % samples.length].src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      )}
      <p className="sr-only" aria-live="polite">
        {items.filter((x) => x.state === "done").length} uploaded
        {over ? ". Let go to upload" : ""}
      </p>
    </div>
  );
}
