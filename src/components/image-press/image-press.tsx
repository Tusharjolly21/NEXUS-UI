"use client";

/* eslint-disable @next/next/no-img-element -- previews of files the visitor picked (object URLs), which next/image cannot load */

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

export type PressLevel = { id: string; label: string; /** 0 to 1, passed to the encoder */ quality: number; /** the longest side is scaled down to this */ maxDimension: number; color?: string };
export type PressResult = {
  file: File;
  before: number;
  after: number;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  type: string;
  level: string;
  /** true when the pressed copy came out bigger, so the original was kept */
  kept: boolean;
};
export type ImagePressProps = {
  onCompressed?: (file: File, info: PressResult) => void;
  /** the dial's notches, smallest file first */
  levels?: PressLevel[];
  /** id of the level the dial starts on */
  defaultLevel?: string;
  accept?: string;
  autoplay?: boolean;
  className?: string;
};

// Phosphor (via Iconify), inlined
const ICON = {
  image: { vb: 256, body: "<path fill=\"currentColor\" d=\"M144 96a16 16 0 1 1 16 16a16 16 0 0 1-16-16m92-40v144a20 20 0 0 1-20 20H40a20 20 0 0 1-20-20V56a20 20 0 0 1 20-20h176a20 20 0 0 1 20 20M44 60v79.72l33.86-33.86a20 20 0 0 1 28.28 0L147.31 147l17.18-17.17a20 20 0 0 1 28.28 0L212 149.09V60Zm0 136h118.34L92 125.66l-48 48Zm168 0v-13l-33.37-33.37L164.28 164l32 32Z\"/>" },
  download: { vb: 256, body: "<path fill=\"currentColor\" d=\"M228 144v64a12 12 0 0 1-12 12H40a12 12 0 0 1-12-12v-64a12 12 0 0 1 24 0v52h152v-52a12 12 0 0 1 24 0m-108.49 8.49a12 12 0 0 0 17 0l40-40a12 12 0 0 0-17-17L140 115V32a12 12 0 0 0-24 0v83L96.49 95.51a12 12 0 0 0-17 17Z\"/>" },
  again: { vb: 256, body: "<path fill=\"currentColor\" d=\"M228 128a100 100 0 0 1-98.66 100H128a99.4 99.4 0 0 1-68.62-27.29a12 12 0 0 1 16.48-17.45a76 76 0 1 0-1.57-109c-.13.13-.25.25-.39.37L54.89 92H72a12 12 0 0 1 0 24H24a12 12 0 0 1-12-12V56a12 12 0 0 1 24 0v20.72l21.48-19.66A100 100 0 0 1 228 128\"/>" },
  tray: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208 28H48a20 20 0 0 0-20 20v160a20 20 0 0 0 20 20h160a20 20 0 0 0 20-20V48a20 20 0 0 0-20-20m-4 24v92h-24.69a19.86 19.86 0 0 0-14.14 5.86L147 168h-38l-18.17-18.14A19.86 19.86 0 0 0 76.69 144H52V52ZM52 204v-36h23l18.14 18.14a19.86 19.86 0 0 0 14.17 5.86h41.38a19.86 19.86 0 0 0 14.14-5.86L181 168h23v36Zm35.51-87.51a12 12 0 0 1 17-17L116 111V76a12 12 0 0 1 24 0v35l11.51-11.52a12 12 0 0 1 17 17l-32 32a12 12 0 0 1-17 0Z\"/>" },
  warn: { vb: 256, body: "<path fill=\"currentColor\" d=\"M128 20a108 108 0 1 0 108 108A108.12 108.12 0 0 0 128 20m0 192a84 84 0 1 1 84-84a84.09 84.09 0 0 1-84 84m-12-80V80a12 12 0 0 1 24 0v52a12 12 0 0 1-24 0m28 40a16 16 0 1 1-16-16a16 16 0 0 1 16 16\"/>" },
  hand: { vb: 256, body: "<path fill=\"currentColor\" d=\"M188 76a31.9 31.9 0 0 0-11.21 2A32 32 0 0 0 128 67a32 32 0 0 0-52 25v16h-8a32 32 0 0 0-32 32v12a92 92 0 0 0 184 0v-44a32 32 0 0 0-32-32m8 76a68 68 0 0 1-136 0v-12a8 8 0 0 1 8-8h8v20a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0V92a8 8 0 0 1 16 0v28a12 12 0 0 0 24 0v-12a8 8 0 0 1 16 0Z\"/>" },
} as const;

const LEVELS: PressLevel[] = [
  { id: "tiny", label: "Tiny", quality: 0.5, maxDimension: 1280, color: "#9be22d" },
  { id: "balanced", label: "Balanced", quality: 0.72, maxDimension: 1920, color: "#ffb31a" },
  { id: "crisp", label: "Crisp", quality: 0.86, maxDimension: 2560, color: "#ff4f93" },
];

const STOP = Symbol("stop");
let seq = 0;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const human = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
const extOf = (n: string) => (n.includes(".") ? n.split(".").pop()!.slice(0, 5).toUpperCase() : "FILE");
const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif|bmp|heic|heif)$/i;

const encode = (c: HTMLCanvasElement, type: string, q?: number) => new Promise<Blob | null>((r) => c.toBlob(r, type, q));

// ─── the sample photo: a sunset over a lake, painted once and kept as a camera-sized JPEG ───
let samplePromise: Promise<File> | null = null;
function makeSample(): Promise<File> {
  if (samplePromise) return samplePromise;
  samplePromise = new Promise<File>((resolve, reject) => {
    const W = 2400;
    const H = 1600;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    if (!g) return reject(new Error("no canvas"));
    let gr = g.createLinearGradient(0, 0, 0, H * 0.66);
    gr.addColorStop(0, "#26196e");
    gr.addColorStop(0.42, "#b93a8e");
    gr.addColorStop(0.78, "#ff7656");
    gr.addColorStop(1, "#ffc56a");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    const sx = W * 0.64;
    const sy = H * 0.52;
    gr = g.createRadialGradient(sx, sy, 0, sx, sy, 640);
    gr.addColorStop(0, "rgba(255,236,170,.95)");
    gr.addColorStop(0.35, "rgba(255,190,120,.45)");
    gr.addColorStop(1, "rgba(255,150,120,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    g.fillStyle = "#ffe78f";
    g.beginPath();
    g.arc(sx, sy, 128, 0, Math.PI * 2);
    g.fill();
    // long thin clouds
    for (let i = 0; i < 9; i++) {
      g.fillStyle = `rgba(255,${150 + i * 9},${170 + i * 6},${0.18 + (i % 3) * 0.07})`;
      g.beginPath();
      g.ellipse(160 + ((i * 523) % W), 180 + i * 62, 300 + (i % 4) * 90, 16 + (i % 3) * 7, 0, 0, Math.PI * 2);
      g.fill();
    }
    const ridge = (base: number, amp: number, seed: number, color: string) => {
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(0, H);
      for (let x = 0; x <= W; x += 10) {
        const y = base - amp * (0.55 * Math.sin(x * 0.0021 + seed) + 0.3 * Math.sin(x * 0.0057 + seed * 2.3) + 0.15 * Math.sin(x * 0.019 + seed * 5.1));
        g.lineTo(x, y);
      }
      g.lineTo(W, H);
      g.closePath();
      g.fill();
    };
    ridge(H * 0.55, 160, 1.2, "#9a54c8");
    ridge(H * 0.6, 120, 3.1, "#6236a6");
    ridge(H * 0.64, 80, 5.4, "#37216f");
    const ly = H * 0.66;
    gr = g.createLinearGradient(0, ly, 0, H);
    gr.addColorStop(0, "#ff9a6a");
    gr.addColorStop(0.35, "#a8448e");
    gr.addColorStop(1, "#21155a");
    g.fillStyle = gr;
    g.fillRect(0, ly, W, H - ly);
    // the sun's road on the water
    for (let i = 0; i < 46; i++) {
      const y = ly + 8 + i * i * 0.26;
      const w = 300 - i * 4 + ((i * 37) % 60);
      g.fillStyle = `rgba(255,226,140,${Math.max(0.05, 0.6 - i * 0.012)})`;
      g.fillRect(sx - w / 2 + ((i * 53) % 40) - 20, y, w, 3 + i * 0.12);
    }
    for (let i = 0; i < 60; i++) {
      g.fillStyle = "rgba(255,255,255,.08)";
      g.fillRect((i * 389) % W, ly + 30 + ((i * 211) % (H - ly - 40)), 120 + (i % 5) * 40, 2);
    }
    // pines on the near shore
    g.fillStyle = "#170d3d";
    g.fillRect(0, H * 0.9, W * 0.42, H * 0.1);
    for (let i = 0; i < 26; i++) {
      const x = (i * 97) % (W * 0.42);
      const h = 140 + ((i * 53) % 160);
      g.beginPath();
      g.moveTo(x - 34, H * 0.91);
      g.lineTo(x, H * 0.91 - h);
      g.lineTo(x + 34, H * 0.91);
      g.closePath();
      g.fill();
    }
    // film grain, so the file is as heavy as a real camera photo
    const img = g.getImageData(0, 0, W, H);
    const d = img.data;
    let s = 1234567;
    for (let i = 0; i < d.length; i += 4) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const n = ((s >> 16) & 47) - 23;
      d[i] += n;
      d[i + 1] += n;
      d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    encode(c, "image/jpeg", 0.95).then((b) => (b ? resolve(new File([b], "lake-sunset.jpg", { type: "image/jpeg", lastModified: Date.now() })) : reject(new Error("encode"))));
  }).catch((e) => {
    samplePromise = null;
    throw e;
  });
  return samplePromise;
}

// ─── compression ───
type Decoded = { draw: CanvasImageSource; w: number; h: number; close: () => void };
async function decode(blob: Blob): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const b = await createImageBitmap(blob);
      return { draw: b, w: b.width, h: b.height, close: () => b.close() };
    } catch {
      // fall through to an <img>
    }
  }
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    URL.revokeObjectURL(url);
    throw new Error("decode");
  }
  return { draw: img, w: img.naturalWidth, h: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
}


async function pressImage(src: File, level: PressLevel, img: Decoded): Promise<Omit<PressResult, "file"> & { file: File }> {
  const k = Math.min(1, level.maxDimension / Math.max(img.w, img.h));
  const w = Math.max(1, Math.round(img.w * k));
  const h = Math.max(1, Math.round(img.h * k));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) throw new Error("canvas");
  g.imageSmoothingQuality = "high";
  g.drawImage(img.draw, 0, 0, w, h);
  let blob = await encode(c, "image/webp", level.quality);
  if (!blob || blob.type !== "image/webp") {
    // no WebP encoder (older Safari): JPEG, on white so transparent areas don't turn black
    g.globalCompositeOperation = "destination-over";
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    blob = await encode(c, "image/jpeg", level.quality);
  }
  if (!blob) throw new Error("encode");
  const base = src.name.replace(/\.[^.]+$/, "") || "photo";
  const kept = blob.size >= src.size;
  const file = kept ? src : new File([blob], `${base}.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type, lastModified: Date.now() });
  return { file, before: src.size, after: file.size, width: kept ? img.w : w, height: kept ? img.h : h, originalWidth: img.w, originalHeight: img.h, type: file.type, level: level.id, kept };
}

type Src = { id: number; file: File; url?: string; ok: boolean; w: number; h: number };
type Out = PressResult & { url: string };
type Phase = "empty" | "loading" | "loaded" | "pressing" | "done" | "error";

// a perforated edge, like a stamp or a photo-booth strip, cut on all four sides
const PERF = (() => {
  const r = 2.6;
  const img = [`radial-gradient(circle ${r}px at 50% 0, #0000 96%, #000)`, `radial-gradient(circle ${r}px at 50% 100%, #0000 96%, #000)`, `radial-gradient(circle ${r}px at 0 50%, #0000 96%, #000)`, `radial-gradient(circle ${r}px at 100% 50%, #0000 96%, #000)`].join(",");
  const size = "9px 100%, 9px 100%, 100% 9px, 100% 9px";
  const rep = "repeat-x, repeat-x, repeat-y, repeat-y";
  return { WebkitMaskImage: img, maskImage: img, WebkitMaskSize: size, maskSize: size, WebkitMaskRepeat: rep, maskRepeat: rep, WebkitMaskComposite: "source-in", maskComposite: "intersect" } as const;
})();

/**
 * A toy press that really shrinks photos before you upload them. Drop a photo on it (or choose one, or drag the
 * sample in) and it sits on top of the machine, wobbling. Turn the cobalt dial to Tiny, Balanced or Crisp and
 * hit the red button: the photo is pulled into the slot between striped rollers, the machine rumbles while the
 * LCD counts the size down, and the pressed copy slides out of the bottom slot, smaller, with a perforated edge
 * and a sticker showing how much it saved. Download it or press another. Anything that isn't a photo is spat
 * back out. The compression is real: the photo is redrawn at the level's size limit and exported as WebP
 * (JPEG where WebP isn't available), and onCompressed hands you the new File.
 * Keyboard: the tray is a button that opens the file picker, the dial is a slider (arrow keys, Home, End), and
 * the red button presses. Progress is announced politely.
 */
export function ImagePress({ onCompressed, levels = LEVELS, defaultLevel, accept = "image/*", autoplay = false, className = "" }: ImagePressProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.25 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;

  const [W, setW] = useState(360);
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const startLevel = Math.max(0, levels.findIndex((l) => l.id === defaultLevel));
  const [level, setLevel] = useState(defaultLevel ? startLevel : Math.floor((levels.length - 1) / 2));
  const levelRef = useRef(level);
  levelRef.current = level;
  const [phase, setPhase] = useState<Phase>("empty");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [src, setSrc] = useState<Src | null>(null);
  const srcRef = useRef(src);
  srcRef.current = src;
  const [out, setOut] = useState<Out | null>(null);
  const outRef = useRef(out);
  outRef.current = out;
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [over, setOver] = useState(false);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [spinIn, setSpinIn] = useState(false);
  const [spinOut, setSpinOut] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const decodedRef = useRef<Decoded | null>(null);

  // machine and paper
  const inY = useMotionValue(0); // how far the photo has gone into the top slot
  const shakeX = useMotionValue(0);
  const mSY = useMotionValue(1);
  const mX = useMotionValue(0);
  const lcdBytes = useMotionValue(0);
  const lcdText = useTransform(lcdBytes, (b) => human(b));
  const dialRot = useMotionValue(0);
  const chipX = useMotionValue(0);
  const chipY = useMotionValue(0);
  const dialDrag = useRef(false);
  const chipMoved = useRef(false);

  const n = levels.length;
  const angleFor = useCallback((i: number) => (n === 1 ? 0 : -70 + (140 * i) / (n - 1)), [n]);
  const nearest = useCallback((a: number) => Math.max(0, Math.min(n - 1, Math.round(((a + 70) / 140) * (n - 1)))), [n]);
  useEffect(() => {
    if (dialDrag.current) return;
    const c = animate(dialRot, angleFor(level), reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 18 });
    return () => c.stop();
  }, [level, angleFor, dialRot, reduced]);

  // sizes follow the width of the component
  const MW = Math.min(360, W);
  const small = MW < 280;
  const tiny = MW < 250; // the LCD gets its own row
  const D = small ? 54 : 68; // dial
  const P = small ? 40 : 50; // press button
  const slotW = Math.round(MW * 0.76);
  const IH = 172; // room above the machine
  const OH = 142; // room below it
  const boxFor = (w: number, h: number) => {
    const maxW = Math.min(214, MW * 0.66 - 12);
    const maxH = 112;
    const a = w > 0 && h > 0 ? w / h : 4 / 3;
    let cw = maxW;
    let ch = cw / a;
    if (ch > maxH) {
      ch = maxH;
      cw = ch * a;
    }
    return { cw: Math.round(cw), ch: Math.round(ch) };
  };
  const inBox = src ? (src.ok ? boxFor(src.w, src.h) : { cw: 112, ch: 84 }) : { cw: 0, ch: 0 };
  const inOuterH = inBox.ch + 12;
  const level0 = levels[level] ?? levels[0];

  const rumble = useRef<AnimationPlaybackControls[]>([]);
  const startRumble = useCallback(() => {
    if (reduced) return;
    rumble.current.forEach((c) => c.stop());
    rumble.current = [animate(mSY, [1, 0.955, 1.03, 0.97, 1], { duration: 0.42, repeat: Infinity, ease: "easeInOut" }), animate(mX, [0, -1.6, 1.4, -1, 0], { duration: 0.17, repeat: Infinity })];
  }, [mSY, mX, reduced]);
  const stopRumble = useCallback(() => {
    rumble.current.forEach((c) => c.stop());
    rumble.current = [];
    animate(mSY, 1, { type: "spring", stiffness: 520, damping: 14 });
    animate(mX, 0, { duration: 0.15 });
  }, [mSY, mX]);

  const announce = (t: string) => setMsg(t);

  const clearAll = useCallback(() => {
    if (srcRef.current?.url) URL.revokeObjectURL(srcRef.current.url);
    if (outRef.current?.url) {
      const u = outRef.current.url;
      window.setTimeout(() => URL.revokeObjectURL(u), 1500);
    }
    decodedRef.current?.close();
    decodedRef.current = null;
  }, []);
  useEffect(() => () => clearAll(), [clearAll]);

  // spit it back out: half in, a grind, then up and a shake
  const spit = useCallback(
    async (text: string) => {
      setPhase("error");
      setError(text);
      announce(text);
      if (reduced) return;
      setSpinIn(true);
      await animate(inY, 42, { duration: 0.42, ease: [0.5, 0, 0.9, 0.5] });
      startRumble();
      await sleep(380);
      stopRumble();
      await animate(inY, -22, { duration: 0.2, ease: "easeOut" });
      setSpinIn(false);
      animate(inY, 0, { type: "spring", stiffness: 520, damping: 16 });
      animate(shakeX, [0, -11, 9, -7, 5, -2, 0], { duration: 0.55 });
    },
    [inY, shakeX, reduced, startRumble, stopRumble],
  );

  const load = useCallback(
    async (file: File) => {
      if (phaseRef.current === "pressing") return;
      clearAll();
      setOut(null);
      setError("");
      inY.set(0);
      const looksImage = file.type.startsWith("image/") || IMAGE_RE.test(file.name);
      const id = ++seq;
      setSrc({ id, file, url: looksImage ? URL.createObjectURL(file) : undefined, ok: looksImage, w: 0, h: 0 });
      setCardKey((k) => k + 1);
      setPhase("loading");
      lcdBytes.set(file.size);
      if (!looksImage) {
        await sleep(650);
        if (srcRef.current?.id === id) spit(`That's a ${extOf(file.name)} file, not a photo. The press takes JPG, PNG, WebP, GIF or AVIF.`);
        return;
      }
      try {
        const d = await decode(file);
        if (srcRef.current?.id !== id) return d.close();
        decodedRef.current = d;
        setSrc((s) => (s && s.id === id ? { ...s, w: d.w, h: d.h } : s));
        setPhase("loaded");
        announce(`${file.name} is on the press, ${human(file.size)}. Choose a level and press the red button.`);
      } catch {
        await sleep(450);
        if (srcRef.current?.id === id) spit("This photo couldn't be opened in the browser. Try a JPG, PNG or WebP.");
      }
    },
    [clearAll, inY, lcdBytes, spit],
  );

  const loadSample = useCallback(async () => {
    if (phaseRef.current === "pressing") return;
    setSampleBusy(true);
    try {
      const f = await makeSample();
      await load(f);
    } catch {
      setError("The sample couldn't be painted in this browser.");
    } finally {
      setSampleBusy(false);
      chipX.set(0);
      chipY.set(0);
    }
  }, [load, chipX, chipY]);

  const reset = useCallback(() => {
    if (phaseRef.current === "pressing") return;
    clearAll();
    setSrc(null);
    setOut(null);
    setError("");
    setPhase("empty");
    inY.set(0);
    lcdBytes.set(0);
    chipX.set(0);
    chipY.set(0);
    announce("The press is empty. Drop a photo on it.");
  }, [clearAll, inY, lcdBytes, chipX, chipY]);

  const press = useCallback(async () => {
    const s = srcRef.current;
    if (!s?.ok || !decodedRef.current) return;
    if (phaseRef.current === "done") {
      // the same photo again, maybe at another level: it drops back on top first
      if (outRef.current?.url) {
        const u = outRef.current.url;
        window.setTimeout(() => URL.revokeObjectURL(u), 1500);
      }
      setOut(null);
      inY.set(0);
      lcdBytes.set(s.file.size);
      setCardKey((k) => k + 1);
      setPhase("loaded");
      phaseRef.current = "loaded";
      await sleep(reduced ? 150 : 650);
    }
    if (phaseRef.current !== "loaded" || srcRef.current?.id !== s.id || !decodedRef.current) return;
    const L = levels[levelRef.current] ?? levels[0];
    setPhase("pressing");
    phaseRef.current = "pressing";
    announce(`Pressing at ${L.label}.`);
    setSpinIn(true);
    startRumble();
    const t0 = performance.now();
    const job = pressImage(s.file, L, decodedRef.current).catch((e: unknown) => (e instanceof Error ? e : new Error("encode")));
    // take the promise now: awaiting a framer animation after it has finished never resolves
    const feed = animate(inY, inOuterH + 18, { duration: reduced ? 0.3 : 0.95, ease: [0.6, 0, 0.9, 0.45] }).then(() => undefined);
    const count = animate(lcdBytes, s.file.size * 0.55, { duration: reduced ? 0.2 : 1.5, ease: "easeOut" });
    const res = await job;
    await feed;
    const left = (reduced ? 300 : 1500) - (performance.now() - t0);
    if (left > 0) await sleep(left);
    count.stop();
    if (res instanceof Error) {
      stopRumble();
      setSpinIn(false);
      inY.set(inOuterH * 0.5);
      lcdBytes.set(s.file.size);
      spit("The press jammed on this photo. Try a different one.");
      return;
    }
    await animate(lcdBytes, res.after, { duration: reduced ? 0.1 : 0.6, ease: "easeOut" });
    stopRumble();
    setSpinIn(false);
    setOut({ ...res, url: URL.createObjectURL(res.file) });
    setPhase("done");
    setSpinOut(true);
    window.setTimeout(() => setSpinOut(false), 1000);
    const pct = Math.round((1 - res.after / res.before) * 100);
    announce(res.kept ? `This photo is already lean, so the original is kept. ${human(res.before)}.` : `Done. ${human(res.before)} down to ${human(res.after)}, ${pct} percent smaller, ${res.width} by ${res.height}.`);
    onCompressed?.(res.file, res);
  }, [inY, lcdBytes, inOuterH, levels, onCompressed, reduced, spit, startRumble, stopRumble]);

  const pick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) void load(f);
    e.target.value = "";
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void load(f);
  };

  // ─── the dial ───
  const dialFrom = (e: { clientX: number; clientY: number }) => {
    const r = ringRef.current?.getBoundingClientRect();
    if (!r) return 0;
    const a = (Math.atan2(e.clientX - (r.left + r.width / 2), -(e.clientY - (r.top + r.height / 2))) * 180) / Math.PI;
    return Math.max(-82, Math.min(82, a));
  };
  const onDialDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (phaseRef.current === "pressing") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dialDrag.current = true;
    const a = dialFrom(e);
    dialRot.set(a);
    setLevel(nearest(a));
  };
  const onDialMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (!dialDrag.current) return;
    const a = dialFrom(e);
    dialRot.set(a);
    const k = nearest(a);
    if (k !== levelRef.current) setLevel(k);
  };
  const onDialUp = () => {
    if (!dialDrag.current) return;
    dialDrag.current = false;
    animate(dialRot, angleFor(levelRef.current), reduced ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 16 });
  };
  const onDialKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (phaseRef.current === "pressing") return;
    let k = level;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") k = Math.min(n - 1, level + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") k = Math.max(0, level - 1);
    else if (e.key === "Home") k = 0;
    else if (e.key === "End") k = n - 1;
    else return;
    e.preventDefault();
    setLevel(k);
  };

  // ─── autoplay: drag the sample in, turn the dial, press, take it out, again ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const ghostAng = useMotionValue(0);
  const fns = useRef({ press, reset, loadSample });
  fns.current = { press, reset, loadSample };
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const own = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      own.forEach((c) => c.stop());
      dialDrag.current = false;
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tk = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tk, Math.min(60, Math.max(16, left)));
        };
        tk();
      });
    const run = (mv: MotionValue<number>, v: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - v) < 0.01) return res();
        const c = animate(mv, v, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (own.delete(c), res()) });
        own.add(c);
      });
    const at = (el: Element | null, fx = 0.5, fy = 0.5) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: r.left - b.left + r.width * fx, y: r.top - b.top + r.height * fy };
    };
    const moveTo = async (x: number, y: number, d = 0.45) => {
      if (go.get() < 0.5) {
        gx.set(x + 30);
        gy.set(y + 40);
        await run(go, 1, 0.25);
      }
      await Promise.all([run(gx, x, d), run(gy, y, d)]);
    };
    const tap = async (el: Element | null, act: () => void) => {
      const p = at(el);
      if (!p) return;
      await moveTo(p.x, p.y);
      await run(gs, 0.8, 0.09);
      act();
      await run(gs, 1, 0.11);
    };
    const until = async (ok: () => boolean, ms: number) => {
      for (let t = 0; t < ms && !ok(); t += 100) await wait(100);
    };
    const order = [0, n - 1, Math.floor((n - 1) / 2)];
    let loop = 0;
    (async () => {
      makeSample().catch(() => undefined);
      await wait(900);
      while (alive) {
        // 1. drag the sample photo onto the press
        if (phaseRef.current !== "empty") {
          fns.current.reset();
          await wait(700);
        }
        const chip = root.querySelector("[data-sample]");
        const a = at(chip);
        const b = at(root.querySelector("[data-tray]"), 0.5, 0.42);
        if (a && b) {
          await moveTo(a.x, a.y);
          await run(gs, 0.82, 0.1);
          await Promise.all([run(gx, b.x, 0.75), run(gy, b.y, 0.75), run(chipX, b.x - a.x, 0.75), run(chipY, b.y - a.y, 0.75)]);
          await run(gs, 1, 0.1);
          void fns.current.loadSample();
          await Promise.all([run(gx, b.x + 70, 0.5), run(gy, b.y + 30, 0.5)]);
        }
        await until(() => phaseRef.current === "loaded", 4000);
        await wait(1100);
        // 2. turn the dial to the next level
        const ring = ringRef.current;
        const target = order[loop++ % order.length];
        if (ring && target !== levelRef.current) {
          const r = ring.getBoundingClientRect();
          const bb = root.getBoundingClientRect();
          const cx = r.left - bb.left + r.width / 2;
          const cy = r.top - bb.top + r.height / 2;
          const rad = r.width / 2 - 9;
          const pt = (deg: number) => ({ x: cx + Math.sin((deg * Math.PI) / 180) * rad, y: cy - Math.cos((deg * Math.PI) / 180) * rad });
          const a0 = dialRot.get();
          const p0 = pt(a0);
          await moveTo(p0.x, p0.y);
          await run(gs, 0.82, 0.1);
          dialDrag.current = true;
          ghostAng.set(a0);
          const off = ghostAng.on("change", (v) => {
            const p = pt(v);
            gx.set(p.x);
            gy.set(p.y);
            dialRot.set(v);
            const k = nearest(v);
            if (k !== levelRef.current) setLevel(k);
          });
          try {
            await run(ghostAng, angleFor(target), 0.85);
          } finally {
            off();
            dialDrag.current = false;
          }
          await run(gs, 1, 0.1);
          await wait(450);
        }
        // 3. press
        await tap(root.querySelector("[data-press]"), () => void fns.current.press());
        await Promise.all([run(gx, gx.get() + 40, 0.5), run(gy, gy.get() + 60, 0.5)]);
        await until(() => phaseRef.current === "done", 9000);
        await wait(2600);
        // 4. press another
        await tap(root.querySelector("[data-again]"), () => fns.current.reset());
        await run(go, 0, 0.3);
        await wait(900);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const ic = (k: keyof typeof ICON, s = 16) => <svg viewBox={`0 0 ${ICON[k].vb} ${ICON[k].vb}`} width={s} height={s} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON[k].body }} />;

  const pressing = phase === "pressing";
  const canPress = (phase === "loaded" || phase === "done") && !!src?.ok;
  const lcdTop = phase === "empty" ? "Ready" : phase === "error" ? "Err" : phase === "loading" ? "..." : null;
  const lcdBottom =
    phase === "empty"
      ? sampleBusy
        ? "Painting"
        : "Feed me"
      : phase === "loading"
        ? "Reading"
        : phase === "error"
          ? "No photo"
          : phase === "pressing"
            ? `${level0.label}`
            : phase === "done" && out
              ? `${out.width}x${out.height}`
              : src
                ? `${src.w}x${src.h}`
                : "";
  const outBox = out ? boxFor(out.width, out.height) : { cw: 0, ch: 0 };
  const ratio = out ? out.after / out.before : 1;
  const outScale = Math.max(0.62, Math.min(0.95, 0.5 + 0.45 * Math.sqrt(ratio)));
  const saved = out ? Math.round((1 - ratio) * 100) : 0;
  const ring = "outline-none focus-visible:ring-2 focus-visible:ring-[#2f55ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff3df]";

  return (
    <div
      ref={rootRef}
      onDragOver={(e) => {
        e.preventDefault();
        if (!over) setOver(true);
      }}
      onDragLeave={(e) => !rootRef.current?.contains(e.relatedTarget as Node) && setOver(false)}
      onDrop={onDrop}
      className={`relative w-full max-w-[420px] select-none overflow-hidden rounded-[28px] p-3 text-[#3a2416] shadow-[0_0_0_1px_rgba(242,97,31,.14),0_26px_48px_-28px_rgba(242,97,31,.6)] sm:p-4 ${className}`}
      style={{ background: "radial-gradient(rgba(242,97,31,.13) 1px, transparent 1.5px) 0 0 / 14px 14px, linear-gradient(165deg, #fff4df, #ffe5ee)" }}
    >
      <input ref={fileRef} type="file" accept={accept} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={pick} />
      <p className="sr-only" aria-live="polite" role="status">
        {msg}
      </p>
      <div ref={bodyRef} className="relative w-full">
        {/* ─── above the machine: the tray, then the photo waiting to go in ─── */}
        <div className="relative mx-auto overflow-hidden" style={{ height: IH, width: MW }}>
          <AnimatePresence initial={false}>
            {!src && (
              <motion.div key="tray" className="absolute inset-0 flex flex-col items-center gap-2 pb-3 pt-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}>
                <button
                  type="button"
                  data-tray
                  onClick={() => fileRef.current?.click()}
                  className={`flex w-full flex-1 flex-col items-center justify-center gap-1 rounded-[20px] border-2 border-dashed px-3 text-center transition-colors ${over ? "border-[#7bc41a] bg-[#eaffc9]" : "border-[#f2a77c] bg-white/55 hover:bg-white/80"} ${ring}`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[#ff7a3d] text-white shadow-[0_6px_14px_-6px_rgba(242,97,31,.9)]">{ic("tray", 18)}</span>
                  <span className="text-[14px] font-semibold">{over ? "Let go to load it" : "Drop a photo here"}</span>
                  <span className="text-[12px] text-[#7a5a48]">or choose one from your device</span>
                </button>
                <motion.button
                  type="button"
                  data-sample
                  drag
                  dragSnapToOrigin
                  dragElastic={0.15}
                  dragMomentum={false}
                  onDragStart={() => (chipMoved.current = true)}
                  onDragEnd={(_, info) => {
                    if (info.offset.y < -36) void loadSample();
                    window.setTimeout(() => (chipMoved.current = false), 0);
                  }}
                  onClick={() => !chipMoved.current && void loadSample()}
                  disabled={sampleBusy}
                  style={{ x: chipX, y: chipY }}
                  className={`relative z-10 flex h-9 shrink-0 cursor-grab items-center gap-2 whitespace-nowrap rounded-full bg-white py-1 pl-1 pr-3 text-[12.5px] font-medium shadow-[0_0_0_1px_rgba(242,97,31,.18),0_8px_16px_-10px_rgba(120,40,0,.6)] active:cursor-grabbing ${ring}`}
                >
                  <span className="h-7 w-9 overflow-hidden rounded-[6px]" style={{ background: "linear-gradient(180deg,#26196e,#b93a8e 40%,#ff7656 60%,#6236a6 62%,#21155a)" }} aria-hidden="true" />
                  {sampleBusy ? "Getting it ready" : tiny ? "Try a sample" : "Try the sample photo"}
                  <span className="text-[#ff7a3d]">{ic("hand", 14)}</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {src && (
            <motion.div className="absolute left-1/2" style={{ bottom: 10, x: shakeX, marginLeft: -(inBox.cw + 12) / 2, y: inY }}>
              <motion.div
                key={cardKey}
                initial={reduced ? { opacity: 0 } : { y: -IH, rotate: -8, opacity: 0 }}
                animate={reduced ? { opacity: 1 } : { y: 0, rotate: phase === "loaded" ? [0, -2.4, 2, -1.4, 0] : 0, opacity: 1 }}
                transition={
                  reduced
                    ? { duration: 0.2 }
                    : { y: { type: "spring", stiffness: 260, damping: 17 }, opacity: { duration: 0.2 }, rotate: phase === "loaded" ? { duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: 0.5 } : { duration: 0.3 } }
                }
                className={`relative rounded-[9px] p-[6px] shadow-[0_14px_22px_-12px_rgba(90,30,0,.55)] ${phase === "error" ? "bg-[#ffe1e6] ring-2 ring-[#ff2e4d]" : "bg-white"}`}
                style={{ width: inBox.cw + 12, height: inBox.ch + 12 }}
              >
                {src.ok && src.url ? (
                  <img src={src.url} alt="" draggable={false} className="h-full w-full rounded-[4px] object-cover" />
                ) : (
                  <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[4px] bg-[linear-gradient(150deg,#8f9bb3,#5d6a85)] text-white">
                    <span className="text-[15px] font-bold tracking-[0.04em]">{extOf(src.file.name)}</span>
                    <span className="text-[11px] text-white/85">not a photo</span>
                  </span>
                )}
                <span className="absolute -top-2 left-2 max-w-[80%] truncate rounded-full bg-[#3a2416] px-2 py-0.5 text-[11px] font-medium text-white shadow">{src.file.name}</span>
                {phase === "error" && <span className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-[#ff2e4d] text-white shadow">{ic("warn", 14)}</span>}
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* ─── the machine ─── */}
        <motion.div className="relative z-10 mx-auto -mt-[6px]" style={{ width: MW, scaleY: mSY, x: mX, originY: 1 }}>
          {/* teal cap with the feed slot */}
          <div className="relative h-[36px] rounded-t-[22px] bg-[linear-gradient(180deg,#36d6c3,#109a8c)] shadow-[inset_0_2px_0_rgba(255,255,255,.4)]">
            <Slot width={slotW} top={4} glow={over || phase === "loaded"} spin={spinIn} reduced={reduced} />
            <span className="absolute bottom-[4px] left-4 text-[10.5px] font-bold tracking-[0.02em] text-[#063f3a]">Image Press</span>
            <span className="absolute bottom-[6px] right-4 flex items-center gap-1.5" aria-hidden="true">
              <span className={`h-2 w-2 rounded-full ${src ? "bg-[#b8ff3d] shadow-[0_0_6px_#b8ff3d]" : "bg-[#0a5e56]"}`} />
              <motion.span className="h-2 w-2 rounded-full bg-[#ffc531]" animate={{ opacity: pressing ? [1, 0.25, 1] : phase === "done" ? 1 : 0.25 }} transition={pressing ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }} style={{ boxShadow: "0 0 6px #ffc531" }} />
            </span>
          </div>
          {/* tangerine body with the control panel */}
          <div className="relative bg-[linear-gradient(180deg,#ff8f4f,#f2611f)] p-[10px] shadow-[inset_0_2px_0_rgba(255,255,255,.22)]">
            {[
              [6, 6],
              [6, -6],
            ].map(([t, l], i) => (
              <span key={i} aria-hidden="true" className="absolute h-[5px] w-[5px] rounded-full bg-[#b8430d] shadow-[inset_0_1px_0_rgba(255,255,255,.35)]" style={{ top: t, left: l > 0 ? l : undefined, right: l < 0 ? -l : undefined }} />
            ))}
            <div className={`flex items-center rounded-[16px] bg-[#fff3df] p-[9px] shadow-[inset_0_2px_5px_rgba(140,60,0,.22)] ${tiny ? "flex-wrap justify-center gap-x-5 gap-y-2" : "gap-2 sm:gap-3"}`}>
              {/* LCD */}
              <div className={`relative min-w-0 overflow-hidden rounded-[10px] bg-[#0f2a1b] px-2.5 py-2 font-mono shadow-[inset_0_2px_6px_rgba(0,0,0,.65)] ${tiny ? "basis-full" : "flex-1"}`} aria-hidden="true">
                <p className="m-0 truncate text-[17px] font-bold leading-[1.15] text-[#b8ff4d] tabular-nums [text-shadow:0_0_6px_rgba(184,255,77,.55)]">{lcdTop ?? <motion.span>{lcdText}</motion.span>}</p>
                <p className="m-0 mt-0.5 truncate text-[10.5px] leading-[1.2] text-[#8fdc4a] tabular-nums">{lcdBottom}</p>
                <span className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,.2)_0_1px,transparent_1px_3px)]" />
              </div>
              {/* dial */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <div
                  data-dial
                  role="slider"
                  tabIndex={0}
                  aria-label="Size and quality"
                  aria-valuemin={0}
                  aria-valuemax={n - 1}
                  aria-valuenow={level}
                  aria-valuetext={`${level0.label}: up to ${level0.maxDimension} pixels, quality ${Math.round(level0.quality * 100)}`}
                  aria-disabled={pressing}
                  onKeyDown={onDialKey}
                  onPointerDown={onDialDown}
                  onPointerMove={onDialMove}
                  onPointerUp={onDialUp}
                  onPointerCancel={onDialUp}
                  className={`cursor-grab touch-none rounded-full active:cursor-grabbing ${ring}`}
                >
                  <div ref={ringRef} className="relative rounded-full bg-[radial-gradient(circle,#fff8ec_58%,#f6dcc0)] shadow-[0_2px_0_rgba(140,60,0,.25)]" style={{ width: D, height: D }}>
                    {levels.map((l, i) => {
                      const a = (angleFor(i) * Math.PI) / 180;
                      const r = D / 2 - 4.5;
                      const on = i === level;
                      return <span key={l.id} aria-hidden="true" className="absolute rounded-full transition-transform" style={{ width: 6, height: 6, left: D / 2 + Math.sin(a) * r - 3, top: D / 2 - Math.cos(a) * r - 3, background: l.color ?? "#2f55ff", transform: `scale(${on ? 1.35 : 0.85})`, boxShadow: on ? `0 0 6px ${l.color ?? "#2f55ff"}` : "none" }} />;
                    })}
                    <motion.div className="absolute rounded-full shadow-[0_4px_8px_-2px_rgba(20,30,120,.6),inset_0_2px_0_rgba(255,255,255,.35)]" style={{ inset: D * 0.16, rotate: dialRot, background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,.16) 0 5deg, transparent 5deg 15deg), radial-gradient(circle at 35% 30%, #6f8bff, #2f55ff 55%, #1c33b8)" }}>
                      <span className="absolute left-1/2 top-[4px] h-[34%] w-[3px] -ml-[1.5px] rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,.8)]" />
                    </motion.div>
                  </div>
                </div>
                <span className="text-[11px] font-semibold leading-none text-[#6b3a12]">{level0.label}</span>
              </div>
              {/* press */}
              <div className="flex shrink-0 flex-col items-center gap-1">
                <motion.button
                  type="button"
                  data-press
                  onClick={() => void press()}
                  disabled={!canPress}
                  aria-label={phase === "done" ? "Press this photo again" : "Press the photo"}
                  whileTap={canPress ? { y: 3, boxShadow: "0 1px 0 #8a0a1f, 0 2px 6px rgba(0,0,0,.25)" } : undefined}
                  animate={{ opacity: canPress || pressing ? 1 : 0.55 }}
                  className="relative grid place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#2f55ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fff3df] disabled:cursor-not-allowed"
                  style={{ width: P, height: P, background: "radial-gradient(circle at 38% 30%, #ff8a98, #ff2e4d 55%, #c8102e)", boxShadow: "0 4px 0 #8a0a1f, 0 8px 14px -6px rgba(160,10,30,.7)" }}
                >
                  {phase === "loaded" && !reduced && <motion.span aria-hidden="true" className="absolute inset-0 rounded-full border-2 border-[#ff2e4d]" initial={{ scale: 1, opacity: 0.7 }} animate={{ scale: 1.55, opacity: 0 }} transition={{ duration: 1.2, repeat: Infinity }} />}
                  <span className="h-[34%] w-[34%] rounded-full bg-white/25" aria-hidden="true" />
                </motion.button>
                <span className="text-[11px] font-semibold leading-none text-[#6b3a12]">Press</span>
              </div>
            </div>
          </div>
          {/* lip with the out slot */}
          <div className="relative h-[24px] rounded-b-[18px] bg-[linear-gradient(180deg,#e9561a,#c8440f)] shadow-[inset_0_1px_0_rgba(255,255,255,.2)]">
            <Slot width={slotW} top={8} glow={phase === "done"} spin={spinOut} reduced={reduced} />
          </div>
          <span aria-hidden="true" className="absolute -bottom-[5px] left-[18px] h-[8px] w-[34px] rounded-b-[6px] bg-[#4a2716]" />
          <span aria-hidden="true" className="absolute -bottom-[5px] right-[18px] h-[8px] w-[34px] rounded-b-[6px] bg-[#4a2716]" />
        </motion.div>

        {/* ─── below the machine: the pressed copy ─── */}
        <div className="relative z-0 mx-auto -mt-[10px] overflow-hidden" style={{ height: OH, width: MW }}>
          <AnimatePresence>
            {out && (
              <motion.div
                key={out.url}
                className="absolute left-1/2"
                style={{ top: 12, marginLeft: -((outBox.cw + 12) * outScale) / 2 }}
                initial={reduced ? { opacity: 0 } : { y: -((outBox.ch + 12) * outScale) - 16 }}
                animate={reduced ? { opacity: 1 } : { y: 0 }}
                exit={reduced ? { opacity: 0 } : { y: OH, rotate: 8, opacity: 0, transition: { duration: 0.4, ease: [0.5, 0, 0.9, 0.5] } }}
                transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 120, damping: 17, delay: 0.05 }}
              >
                <div style={{ filter: "drop-shadow(0 10px 12px rgba(110,40,0,.3))" }}>
                  <div className="bg-[#fffaf1] p-[6px]" style={{ width: (outBox.cw + 12) * outScale, height: (outBox.ch + 12) * outScale, ...PERF }}>
                    <img src={out.url} alt={`Pressed copy of ${src?.file.name ?? "the photo"}`} draggable={false} className="h-full w-full object-cover" />
                  </div>
                </div>
                <motion.span
                  aria-hidden="true"
                  className="absolute -right-6 -top-5 grid h-[54px] w-[54px] place-items-center text-[13px] font-extrabold leading-none tracking-[-0.02em] text-[#1b2c04]"
                  style={{ clipPath: STAR, background: out.kept ? "#ffd84d" : "#c6ff3d" }}
                  initial={reduced ? { opacity: 0 } : { scale: 2.4, rotate: -50, opacity: 0 }}
                  animate={reduced ? { opacity: 1, rotate: 12 } : { scale: [2.4, 0.82, 1.1, 1], rotate: 12, opacity: 1 }}
                  transition={reduced ? { duration: 0.2 } : { delay: 0.75, duration: 0.5, times: [0, 0.55, 0.8, 1], ease: "easeOut" }}
                >
                  {out.kept ? "Kept" : `-${saved}%`}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {!out && (
              <motion.p
                key="hint"
                className="absolute inset-x-4 m-0 text-center text-[12.5px] text-[#8a5a3e]"
                style={{ top: OH / 2 - 10 }}
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.45, duration: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
              >
                {pressing ? "Pressing..." : "The pressed copy comes out here."}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ─── what happened, and what to do next ─── */}
        <div className="relative mt-1 flex min-h-[88px] flex-wrap content-center items-center justify-between gap-x-3 gap-y-2 px-1">
          {phase === "done" && out ? (
            <>
              <div className="min-w-0">
                <p className="m-0 text-[15px] font-semibold tabular-nums">
                  <span className="mr-1.5 font-medium text-[#8a6250] line-through decoration-[#ff2e4d]/70">{human(out.before)}</span>
                  {human(out.after)}
                </p>
                <p className="m-0 text-[12px] text-[#7a5a48] tabular-nums">
                  {out.kept ? "Already lean, original kept" : `${out.width} x ${out.height}, ${out.type === "image/webp" ? "WebP" : "JPEG"}, ${level0.label}`}
                </p>
              </div>
              <div className={`flex gap-2 ${tiny ? "w-full" : ""}`}>
                <a href={out.url} download={out.file.name} className={`flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-[#2f55ff] px-3.5 text-[13.5px] font-semibold text-white no-underline shadow-[0_8px_16px_-8px_rgba(47,85,255,.9)] ${tiny ? "flex-1" : ""} ${ring}`}>
                  {ic("download", 15)}
                  Download
                </a>
                <button type="button" data-again onClick={reset} aria-label={tiny ? "Press another" : undefined} className={`flex h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-white text-[13.5px] font-semibold text-[#1f3bd6] shadow-[0_0_0_1px_rgba(47,85,255,.25)] ${tiny ? "w-9" : "px-3.5"} ${ring}`}>
                  {ic("again", 14)}
                  {!tiny && "Press another"}
                </button>
              </div>
            </>
          ) : phase === "error" ? (
            <>
              <p className="m-0 flex min-w-0 flex-1 items-start gap-1.5 text-[13px] font-medium leading-[1.4] text-[#c0112e]">
                <span className="mt-[2px] shrink-0">{ic("warn", 15)}</span>
                {error}
              </p>
              <button type="button" onClick={() => fileRef.current?.click()} className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 text-[13.5px] font-semibold text-[#1f3bd6] shadow-[0_0_0_1px_rgba(47,85,255,.25)] ${ring}`}>
                {ic("image", 15)}
                Choose a photo
              </button>
            </>
          ) : (
            <p className="m-0 w-full text-center text-[13px] leading-[1.45] text-[#7a5a48]">
              {phase === "loaded" ? (
                <>
                  Turn the dial to <span className="font-semibold text-[#3a2416]">Tiny</span>, <span className="font-semibold text-[#3a2416]">Balanced</span> or <span className="font-semibold text-[#3a2416]">Crisp</span>, then hit the red button.
                </>
              ) : pressing ? (
                `Pressing at ${level0.label}: up to ${level0.maxDimension}px on the long side.`
              ) : phase === "loading" ? (
                "Reading the photo..."
              ) : (
                "Photos are pressed right here in your browser. Nothing is uploaded."
              )}
            </p>
          )}
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/90 bg-[#1d1d1f]/20 shadow-[0_4px_14px_rgba(0,0,0,.18)] backdrop-blur-[2px]"
      />
    </div>
  );
}

const STAR = `polygon(${Array.from({ length: 24 }, (_, i) => {
  const a = (i / 24) * Math.PI * 2;
  const r = i % 2 ? 41 : 50;
  return `${(50 + Math.cos(a) * r).toFixed(1)}% ${(50 + Math.sin(a) * r).toFixed(1)}%`;
}).join(",")})`;

/** A slot in the machine with a pair of striped rollers in it. */
function Slot({ width, top, glow, spin, reduced }: { width: number; top: number; glow: boolean; spin: boolean; reduced: boolean }) {
  return (
    <div className="absolute left-1/2 h-[11px] overflow-hidden rounded-[6px] bg-[#071f1d]" style={{ width, top, marginLeft: -width / 2, boxShadow: glow ? "0 0 0 2px rgba(184,255,61,.55), 0 0 12px rgba(184,255,61,.6), inset 0 2px 3px rgba(0,0,0,.8)" : "inset 0 2px 3px rgba(0,0,0,.8)" }}>
      <motion.div
        className="absolute inset-x-[5px] top-[3px] h-[5px] rounded-full"
        style={{ backgroundImage: "linear-gradient(135deg, #ffd43b 25%, #ff5c8a 25% 50%, #ffd43b 50% 75%, #ff5c8a 75%)", backgroundSize: "10px 10px" }}
        animate={{ backgroundPositionX: spin && !reduced ? ["0px", "-20px"] : "0px" }}
        transition={spin && !reduced ? { duration: 0.28, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
      />
      <span className="absolute inset-x-[5px] top-[3px] h-[5px] rounded-full bg-[linear-gradient(180deg,rgba(0,0,0,.45),rgba(255,255,255,.3)_45%,rgba(0,0,0,.45))]" />
    </div>
  );
}
