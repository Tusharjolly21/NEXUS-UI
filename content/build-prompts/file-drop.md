# File Drop

Add the "File Drop" component from Nexus UI to my project.

An upload area for real files. The border marches and specks of light gather towards the file you drag; photos upload with a rolling liquid fill, files that are too big shake, and a removed file splits in two.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { FileDrop } from "@/components/file-drop";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/file-drop/file-drop.tsx ---

```tsx
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
```

--- components/file-drop/index.ts ---

```ts
export { default as FileDrop } from "./file-drop";
export type { FileDropProps } from "./file-drop";
```

--- lib/ui-sounds.ts ---

```ts
/**
 * UI sounds with no audio files. Every sound is synthesised on the fly with
 * the Web Audio API (oscillators, filtered noise and envelopes), so the whole
 * library is this one file and nothing to download.
 *
 *   import { playSound } from "@/lib/ui-sounds";
 *   <button onClick={() => playSound("pop")}>Like</button>
 *
 * Browsers only allow audio after a user gesture, so call it from a click,
 * key press or pointer event.
 *
 * Components that make sound use the hook, which also honours the visitor's
 * on/off choice (see "Preference" below):
 *
 *   const play = useSound(enableSound);
 *   <button onClick={() => play("tap")}>Save</button>
 *
 * A component that plays itself (an autoplay demo) calls play.auto("tap") instead: the same sound,
 * but silent until the visitor has clicked or pressed a key once on the page.
 */

import * as React from "react";

export type SoundCategory = "Actions" | "Feedback" | "Navigation" | "Notifications" | "Selection" | "Movement" | "Progress" | "System";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let out: AudioNode | null = null;
let analyserNode: AnalyserNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    playbackSession();
    master = ctx.createGain();
    master.gain.value = isTouchDevice() ? 0.9 : 0.5; // phone speakers are small and quiet
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    out = comp;
  }
  silentTrack();
  if (ctx.state !== "running") void ctx.resume(); // "suspended" until a tap; "interrupted" after a call or a locked screen on iOS
  return ctx;
}

/**
 * Phones. iOS and Android only let a page start audio from a real tap (iOS counts touchend and click, not the
 * pointerenter that fires when a finger lands), and iOS mutes Web Audio while the ringer switch is on silent
 * unless the page asks for the "playback" audio session. So on a touch screen, once a sound has been asked for, the next tap
 * wakes the engine, plays one silent sample, and switches the session; after that every sound is audible.
 */
function playbackSession() {
  try {
    const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== "playback") session.type = "playback";
  } catch {
    // not supported: the ringer switch still applies
  }
}

/**
 * The iOS ringer switch. With it on silent, iOS mutes Web Audio but not a playing <audio> element, and while one is
 * playing it moves the whole page to the "playback" category. So on a touch device the first sound also starts a
 * silent loop (a quarter second of silence), which is what makes the sounds heard with the switch on silent. It is
 * only started once a sound has been asked for, and paused whenever the page is hidden.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA==";
let silentEl: HTMLAudioElement | null = null;
function isTouchDevice() {
  return typeof window !== "undefined" && ((navigator.maxTouchPoints ?? 0) > 0 || !!window.matchMedia?.("(pointer: coarse)").matches);
}
function silentTrack() {
  if (typeof document === "undefined" || !isTouchDevice()) return;
  try {
    if (!silentEl) {
      silentEl = new Audio(SILENT_WAV);
      silentEl.loop = true;
      silentEl.setAttribute("playsinline", "");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) silentEl?.pause();
      });
    }
    if (silentEl.paused && !document.hidden) void silentEl.play().catch(() => {});
  } catch {
    // no HTMLAudioElement: the ringer switch still applies
  }
}

let unlockArmed = false;
function armTouchUnlock() {
  if (unlockArmed || typeof window === "undefined") return;
  unlockArmed = true;
  if (!isTouchDevice()) return;
  const wake = () => {
    if (!ctx) return; // nothing to wake until a sound has been asked for (and no silent loop for visitors who never use sound)
    if (ctx.state === "running") return silentTrack();
    const c = audio();
    if (!c) return;
    try {
      const s = c.createBufferSource();
      s.buffer = c.createBuffer(1, 1, 22050);
      s.connect(c.destination);
      s.start(0);
    } catch {
      // ignore
    }
  };
  for (const type of ["touchend", "pointerup", "click", "keydown"]) window.addEventListener(type, wake, { capture: true, passive: true });
}
armTouchUnlock();

/**
 * A tap on everything the library plays, for drawing it (a level meter, a visualiser). It listens
 * only; nothing extra is heard. Null on the server or before the browser allows audio.
 */
export function getSoundAnalyser(): AnalyserNode | null {
  const c = audio();
  if (!c || !out) return null;
  if (!analyserNode) {
    analyserNode = c.createAnalyser();
    analyserNode.fftSize = 1024;
    analyserNode.smoothingTimeConstant = 0.55;
    out.connect(analyserNode);
  }
  return analyserNode;
}

function noise(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  const s = c.createBufferSource();
  s.buffer = noiseBuf;
  return s;
}

export type ToneOpts = { freq: number; to?: number; type?: OscillatorType; at?: number; attack?: number; decay?: number; gain?: number; glide?: number };
export function tone(c: AudioContext, out: AudioNode, o: ToneOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = o.type ?? "sine";
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.glide ?? o.decay ?? 0.1));
  const a = o.attack ?? 0.004, d = o.decay ?? 0.12, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + a + d + 0.05);
}

export type NoiseOpts = { at?: number; attack?: number; decay?: number; gain?: number; filter?: BiquadFilterType; freq?: number; to?: number; q?: number };
export function hiss(c: AudioContext, out: AudioNode, o: NoiseOpts) {
  const t0 = c.currentTime + (o.at ?? 0);
  const n = noise(c);
  const f = c.createBiquadFilter();
  const g = c.createGain();
  f.type = o.filter ?? "bandpass";
  f.frequency.setValueAtTime(o.freq ?? 2000, t0);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t0 + (o.attack ?? 0.01) + (o.decay ?? 0.1));
  f.Q.value = o.q ?? 1;
  const a = o.attack ?? 0.003, d = o.decay ?? 0.08, peak = o.gain ?? 0.3;
  g.gain.value = 0.0001; // a gain node starts at 1: without this the very first sample of a note can click
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + a + d);
  n.connect(f).connect(g).connect(out);
  n.start(t0, Math.random() * 0.5);
  n.stop(t0 + a + d + 0.05);
}

/** One sound: how it is made from oscillators and noise. `tone` and `hiss` are the building blocks. */
export type SoundDef = {
  category: string;
  label: string;
  play: (c: AudioContext, out: AudioNode) => void;
  /** Seconds the sound lasts, when it runs longer than the two the engine keeps it connected for (a recording). */
  length?: number;
};
type Def = SoundDef & { category: SoundCategory };

export const SOUNDS = {
  tap: { category: "Actions", label: "Tap", play: (c, o) => { tone(c, o, { freq: 900, to: 620, decay: 0.06, gain: 0.25 }); hiss(c, o, { freq: 4000, decay: 0.015, gain: 0.08, filter: "highpass" }); } },
  pop: { category: "Actions", label: "Pop", play: (c, o) => tone(c, o, { freq: 320, to: 980, glide: 0.07, decay: 0.09, gain: 0.35 }) },
  knock: { category: "Actions", label: "Knock", play: (c, o) => { tone(c, o, { freq: 160, to: 90, decay: 0.1, gain: 0.5 }); hiss(c, o, { freq: 900, decay: 0.04, gain: 0.25, q: 2 }); tone(c, o, { at: 0.11, freq: 150, to: 85, decay: 0.09, gain: 0.35 }); hiss(c, o, { at: 0.11, freq: 900, decay: 0.035, gain: 0.18, q: 2 }); } },

  success: { category: "Feedback", label: "Landed", play: (c, o) => { tone(c, o, { freq: 1046.5, decay: 0.18, gain: 0.22, type: "triangle" }); tone(c, o, { at: 0.09, freq: 1318.5, decay: 0.32, gain: 0.22, type: "triangle" }); } },
  error: { category: "Feedback", label: "Bump", play: (c, o) => { tone(c, o, { freq: 220, decay: 0.09, gain: 0.18, type: "square" }); tone(c, o, { at: 0.11, freq: 185, decay: 0.14, gain: 0.18, type: "square" }); } },
  paid: { category: "Feedback", label: "Paid", play: (c, o) => [1318.5, 1568, 2093].forEach((f, i) => tone(c, o, { at: i * 0.065, freq: f, decay: 0.35 - i * 0.05, gain: 0.16, type: "triangle" })) },

  whoosh: { category: "Navigation", label: "Whisk", play: (c, o) => hiss(c, o, { attack: 0.06, decay: 0.18, freq: 400, to: 3200, gain: 0.22, q: 0.8 }) },
  step: { category: "Navigation", label: "Step", play: (c, o) => { tone(c, o, { freq: 520, decay: 0.05, gain: 0.18 }); tone(c, o, { at: 0.06, freq: 700, decay: 0.07, gain: 0.16 }); } },
  glide: { category: "Navigation", label: "Glide", play: (c, o) => tone(c, o, { freq: 440, to: 880, glide: 0.18, attack: 0.03, decay: 0.2, gain: 0.18 }) },

  chime: { category: "Notifications", label: "Chime", play: (c, o) => [1, 2.76, 5.4].forEach((m, i) => tone(c, o, { freq: 880 * m, decay: 0.9 / (i + 1), gain: 0.18 / (i + 1) })) },
  ping: { category: "Notifications", label: "Ping", play: (c, o) => tone(c, o, { freq: 1760, decay: 0.6, gain: 0.16 }) },
  beacon: { category: "Notifications", label: "Beacon", play: (c, o) => { tone(c, o, { freq: 1175, decay: 0.25, gain: 0.18, type: "triangle" }); tone(c, o, { at: 0.18, freq: 1568, decay: 0.45, gain: 0.18, type: "triangle" }); } },

  tick: { category: "Selection", label: "Tick", play: (c, o) => hiss(c, o, { freq: 5000, decay: 0.012, gain: 0.3, filter: "highpass" }) },
  on: { category: "Selection", label: "Latch on", play: (c, o) => { hiss(c, o, { freq: 3000, decay: 0.01, gain: 0.2 }); tone(c, o, { at: 0.01, freq: 600, to: 900, decay: 0.07, gain: 0.2 }); } },
  off: { category: "Selection", label: "Latch off", play: (c, o) => { hiss(c, o, { freq: 2400, decay: 0.01, gain: 0.18 }); tone(c, o, { at: 0.01, freq: 760, to: 480, decay: 0.07, gain: 0.18 }); } },

  lift: { category: "Movement", label: "Lift", play: (c, o) => { hiss(c, o, { attack: 0.03, decay: 0.08, freq: 800, to: 2400, gain: 0.14 }); tone(c, o, { freq: 300, to: 520, decay: 0.08, gain: 0.12 }); } },
  drop: { category: "Movement", label: "Drop", play: (c, o) => { tone(c, o, { freq: 380, to: 120, glide: 0.08, decay: 0.12, gain: 0.35 }); hiss(c, o, { at: 0.06, freq: 600, decay: 0.05, gain: 0.15 }); } },
  swipe: { category: "Movement", label: "Swipe", play: (c, o) => hiss(c, o, { attack: 0.02, decay: 0.12, freq: 3200, to: 500, gain: 0.2, q: 1.2 }) },

  charge: { category: "Progress", label: "Charge", play: (c, o) => tone(c, o, { freq: 220, to: 880, glide: 0.5, attack: 0.08, decay: 0.5, gain: 0.14, type: "triangle" }) },
  done: { category: "Progress", label: "Complete", play: (c, o) => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, o, { at: i * 0.04, freq: f, attack: 0.01, decay: 0.6, gain: 0.1, type: "triangle" })) },
  loading: { category: "Progress", label: "Loading", play: (c, o) => [0, 0.12, 0.24].forEach((at, i) => tone(c, o, { at, freq: 660 + i * 40, decay: 0.05, gain: 0.12 })) },

  boot: { category: "System", label: "Boot", play: (c, o) => [130.8, 196, 261.6, 392].forEach((f, i) => tone(c, o, { at: i * 0.07, freq: f, attack: 0.08, decay: 0.9, gain: 0.08, type: "sine" })) },
  hush: { category: "System", label: "Hush", play: (c, o) => { tone(c, o, { freq: 520, to: 180, glide: 0.35, attack: 0.02, decay: 0.35, gain: 0.14 }); hiss(c, o, { attack: 0.05, decay: 0.3, freq: 1800, to: 300, gain: 0.06, filter: "lowpass" }); } },
  alert: { category: "System", label: "Alert", play: (c, o) => [0, 0.16, 0.32].forEach((at, i) => tone(c, o, { at, freq: i % 2 ? 740 : 988, decay: 0.12, gain: 0.14, type: "triangle" })) },
} satisfies Record<string, Def>;

export type SoundName = keyof typeof SOUNDS;

// ── Style ───────────────────────────────────────────────────────────
//
// A style re-voices the sounds above under the same names, so every component that plays "tap" or
// "chime" changes voice at once and no component code changes. The default style is "nexus" (the
// recipes in this file). Another file can add one: `@/lib/ui-sounds-mac` registers "mac" when it is
// imported. The visitor's choice is kept in localStorage ("ui-sounds-style").

const STYLE_KEY = "ui-sounds-style";
const styles = new Map<string, Partial<Record<SoundName, SoundDef>>>();
let style: string | null = null;
const styleListeners = new Set<() => void>();

/** Adds a style: recipes keyed by the sound names above. Missing names fall back to the default. */
export function registerSoundStyle(name: string, defs: Partial<Record<SoundName, SoundDef>>) {
  styles.set(name, defs);
  styleListeners.forEach((l) => l());
}

/** The active style: "nexus" unless the visitor or your code picked another. */
export function getSoundStyle(): string {
  if (style === null) {
    style = "nexus";
    if (typeof window !== "undefined") {
      try {
        style = window.localStorage.getItem(STYLE_KEY) || "nexus";
      } catch {
        // storage blocked: the default style
      }
    }
  }
  return style;
}

/** Pick the style every sound uses. Remembered in this browser unless `persist` is false. */
export function setSoundStyle(name: string, persist = true) {
  style = name;
  if (persist && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STYLE_KEY, name);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  styleListeners.forEach((l) => l());
}

function subscribeStyle(onChange: () => void) {
  styleListeners.add(onChange);
  return () => {
    styleListeners.delete(onChange);
  };
}

/** The style as React state: `[style, setStyle]`. The server render reads "nexus". */
export function useSoundStyle(): [string, (name: string) => void] {
  const current = React.useSyncExternalStore(subscribeStyle, getSoundStyle, () => "nexus");
  return [current, setSoundStyle];
}

// ── Preference ──────────────────────────────────────────────────────
//
// One switch for every sound on the page. A visitor's choice is kept in
// localStorage ("ui-sounds": "on" | "off"); until they choose, the default
// applies (on, unless you call configureSounds({ defaultEnabled: false })).

const STORE_KEY = "ui-sounds";
let defaultEnabled = true;
let chosen: boolean | null = null; // the visitor's saved or runtime choice
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const v = window.localStorage.getItem(STORE_KEY);
    if (v === "on") chosen = true;
    else if (v === "off") chosen = false;
  } catch {
    // storage blocked: the default applies
  }
}

function emit() {
  listeners.forEach((l) => l());
}

/** Whether sounds are on right now. */
export function getSoundsEnabled(): boolean {
  load();
  return chosen ?? defaultEnabled;
}

/** Whether sounds are on until the visitor chooses. Call once, early, in client code. */
export function configureSounds(opts: { defaultEnabled?: boolean }) {
  if (typeof opts.defaultEnabled === "boolean" && opts.defaultEnabled !== defaultEnabled) {
    defaultEnabled = opts.defaultEnabled;
    emit();
  }
}

/** Turn sounds on or off. The choice is remembered in this browser unless `persist` is false. */
export function setSoundsEnabled(on: boolean, persist = true) {
  load();
  chosen = on;
  if (persist) {
    try {
      window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }
  emit();
}

/** Mute or unmute every sound for this page load (for a "Sounds off" preference you store yourself). */
export function setSoundsMuted(value: boolean) {
  setSoundsEnabled(!value, false);
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORE_KEY) return;
    loaded = false;
    chosen = null;
    emit();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}

/**
 * The sound switch as React state: `[enabled, setEnabled]`. Use it for a speaker button. The server
 * render always reads "off", so the first paint matches and the real value arrives right after.
 */
export function useSoundsEnabled(): [boolean, (on: boolean) => void] {
  const enabled = React.useSyncExternalStore(subscribe, getSoundsEnabled, () => false);
  return [enabled, setSoundsEnabled];
}

// ── Playing ─────────────────────────────────────────────────────────

const lastPlayed = new Map<string, number>();

/**
 * Play a sound by name. volume is 0..1 on top of the master level. It stays silent while the
 * visitor has sounds off, unless `force` is set (for a button whose whole job is to play the sound).
 */
export function playSound(name: SoundName, volume = 1, force = false) {
  if (!(name in SOUNDS)) return;
  // The active style may voice this sound differently; anything it leaves out keeps the default.
  playDef(name, styles.get(getSoundStyle())?.[name] ?? SOUNDS[name], volume, force);
}

/**
 * Play any sound definition (the Pro sound pack uses this). `key` names it for the 30 ms de-bounce.
 * It follows the same on/off switch as playSound.
 */
export function playDef(key: string, def: SoundDef, volume = 1, force = false) {
  if (!force && !getSoundsEnabled()) return;
  if (typeof document !== "undefined" && document.hidden) return;
  // The same sound twice within 30ms is one sound: it keeps fast input from stacking into a buzz.
  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - (lastPlayed.get(key) ?? -1e9) < 30) return;
  lastPlayed.set(key, now);
  const c = audio();
  if (!c || !master) return;
  const g = c.createGain();
  g.gain.value = Math.max(0, Math.min(1, volume));
  g.connect(master);
  def.play(c, g);
  setTimeout(() => g.disconnect(), Math.max(2000, (def.length ?? 0) * 1000 + 300));
}

/** Whether the audio engine is awake. Browsers keep it asleep until the visitor's first click or key press. */
export function audioAwake() {
  // The visitor has clicked or pressed a key somewhere on the page: the browser lets us start audio now.
  if (!ctx && typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) audio();
  return !!ctx && ctx.state === "running";
}

/**
 * Autoplay demos make sound too, but only where you allow it. It is allowed everywhere by default.
 * Wrap a part of the page in <AutoplaySound allow={false}> to keep demos silent there (a grid of
 * previews, say) and in <AutoplaySound allow> to let the one you are showing be heard.
 */
// Server components load this file for the sound list; they have no createContext, and never render the provider.
const AutoplayCtx = (typeof React.createContext === "function" ? React.createContext(true) : null) as unknown as React.Context<boolean>;
export function AutoplaySound({ allow, children }: { allow: boolean; children?: React.ReactNode }) {
  return React.createElement(AutoplayCtx.Provider, { value: allow }, children);
}

/** Whether autoplay demos may make sound here (see AutoplaySound). Used by the Pro sound hook. */
export function useAutoplaySoundAllowed() {
  return React.useContext(AutoplayCtx);
}

export type SoundPlayer = {
  (name: SoundName, volume?: number): void;
  /** For a sound that answers the component playing itself (autoplay). Silent until the visitor has used the page once. */
  auto: (name: SoundName, volume?: number) => void;
};

/**
 * For a component with a `sound` option: returns a play function that is silent when `enabled` is
 * false and otherwise follows the visitor's on/off switch. `play.auto(...)` is the same for sounds
 * made by autoplay.
 *
 *   const play = useSound(enableSound);
 */
export function useSound(enabled = true): SoundPlayer {
  const auto = React.useContext(AutoplayCtx);
  return React.useMemo(
    () =>
      Object.assign(
        (name: SoundName, volume = 1) => {
          if (enabled) playSound(name, volume);
        },
        {
          auto: (name: SoundName, volume = 1) => {
            if (enabled && auto && audioAwake()) playSound(name, volume);
          },
        },
      ),
    [enabled, auto],
  );
}

/** Set the overall level for every sound, 0..1. */
export function setSoundVolume(v: number) {
  audio();
  if (master) master.gain.value = Math.max(0, Math.min(1, v)) * (isTouchDevice() ? 0.9 : 0.5);
}
```
