/**
 * Nexus Videos kit: every video is a pure function of time.
 *
 * A video component receives `t` (seconds) plus its editable props and returns
 * plain DOM for a fixed 1080×1920 canvas. Nothing animates on its own, so the
 * same file plays live in the browser, scrubs frame-accurately, and renders to
 * MP4 one frame at a time (see render.mjs).
 */
import type { CSSProperties } from "react";

export const W = 1080;
export const H = 1920;

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
/** progress of t through [a, b], clamped to 0..1 */
export const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export const ease = {
  out: (p: number) => 1 - Math.pow(1 - p, 3),
  in: (p: number) => p * p * p,
  inOut: (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  expo: (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  quint: (p: number) => 1 - Math.pow(1 - p, 5),
};

/** Damped spring from 0 to 1 (slight overshoot). `s` is seconds since start. */
export function spring(s: number, damping = 0.55, freq = 11) {
  if (s <= 0) return 0;
  const wd = freq * Math.sqrt(1 - damping * damping);
  return 1 - Math.exp(-damping * freq * s) * (Math.cos(wd * s) + ((damping * freq) / wd) * Math.sin(wd * s));
}

/** The house "rise in": fade, lift and de-blur. Returns a style object. */
export function rise(p: number, dy = 40, blur = 12): CSSProperties {
  return { opacity: clamp(p * 1.6), transform: `translateY(${(1 - p) * dy}px)`, filter: blur ? `blur(${(1 - p) * blur}px)` : undefined };
}

/** Rise in at `a`, then dissolve out at `b` (pass b = Infinity to stay). */
export function inOut(t: number, a: number, b: number, d = 0.5, dy = 40, blur = 12): CSSProperties {
  const pi = ease.expo(P(t, a, a + d));
  const po = ease.out(P(t, b, b + 0.3));
  return { opacity: clamp(pi * 1.6) * (1 - po), transform: `translateY(${(1 - pi) * dy - po * dy * 0.6}px)`, filter: blur ? `blur(${(1 - pi) * blur + po * blur * 0.8}px)` : undefined };
}

/** Deterministic pseudo-random in 0..1 from an integer seed. */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const FONT = "var(--font-inter),'Inter Display','Inter',-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',sans-serif";
export const TEXT = "var(--font-inter),'Inter',-apple-system,BlinkMacSystemFont,'SF Pro Text','Segoe UI',sans-serif";
export const MONO = "ui-monospace,'SF Mono',Menlo,Consolas,monospace";
export const GRAD = "linear-gradient(90deg,#0a84ff 0%,#6a5ae0 30%,#c24fae 58%,#ee4b6a 78%,#f25c05 100%)";

export const gradText = (bg = GRAD): CSSProperties => ({ background: bg, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" });

/** Soft drifting colour light behind light-theme videos. */
export function bgBlobs(t: number, a = "rgba(10,132,255,.16)", b = "rgba(236,72,153,.12)") {
  return [
    { position: "absolute", width: 1100, height: 1100, borderRadius: "50%", filter: "blur(60px)", left: -380 + Math.sin(t * 0.5) * 60, top: -260 + Math.cos(t * 0.4) * 50, background: `radial-gradient(circle, ${a}, transparent 65%)` },
    { position: "absolute", width: 1100, height: 1100, borderRadius: "50%", filter: "blur(60px)", left: 420 + Math.cos(t * 0.45) * 70, top: 1100 + Math.sin(t * 0.5) * 60, background: `radial-gradient(circle, ${b}, transparent 65%)` },
  ] as CSSProperties[];
}

export type Field =
  | { key: string; label: string; type: "text"; max?: number }
  | { key: string; label: string; type: "color" }
  | { key: string; label: string; type: "number"; min: number; max: number; step?: number };

export type FormatId = "9:16" | "4:5" | "1:1" | "16:9" | "app" | "21:9";
export interface Format { id: FormatId; w: number; h: number; label: string; where: string }
export const FORMATS: Record<FormatId, Format> = {
  "9:16": { id: "9:16", w: 1080, h: 1920, label: "9:16", where: "Reels, TikTok, Shorts" },
  "4:5": { id: "4:5", w: 1080, h: 1350, label: "4:5", where: "LinkedIn, Instagram feed" },
  "1:1": { id: "1:1", w: 1080, h: 1080, label: "1:1", where: "X, LinkedIn" },
  "16:9": { id: "16:9", w: 1920, h: 1080, label: "16:9", where: "YouTube, X, Product Hunt" },
  "app": { id: "app", w: 886, h: 1920, label: "App Store", where: "App Store preview (6.9in)" },
  "21:9": { id: "21:9", w: 2520, h: 1080, label: "21:9", where: "Website hero" },
};
export const formatsOf = (m: { formats?: FormatId[] }) => (m.formats ?? ["9:16"]).map((f) => FORMATS[f]);

/** Frame size every video receives. Videos made for one format can ignore it. */
export interface Frame { w?: number; h?: number }

export interface VideoMeta<Props = Record<string, unknown>> {
  id: string;
  /** Where it's meant to be posted, e.g. ["YouTube", "X"] */
  platforms: string[];
  /** Formats it can render in; the first is the default. Omitted = 9:16 only. */
  formats?: FormatId[];
  /** Seamless loop (website backgrounds): no intro or end card, frame 0 == last frame */
  loop?: boolean;
  /** No soundtrack */
  silent?: boolean;
  title: string;
  /** What the video is for, e.g. "Product launch" */
  purpose: string;
  /** The animation idea in a few words */
  motion: string;
  /** Which app it was made for */
  app: string;
  duration: number;
  bpm: number;
  /** Seconds where the picture cuts; the soundtrack hits on these */
  cuts: number[];
  blurb: string;
  defaults: Props;
  fields: Field[];
  /** The full build prompt. Not shipped to the browser: it is served by the gated prompt route. */
  prompt?: string;
  dark?: boolean;
}

/** bgBlobs for any frame size: one light near the top-left, one near the bottom-right. */
export function blobsFor(t: number, w: number, h: number, a = "rgba(10,132,255,.16)", b = "rgba(236,72,153,.12)") {
  const s = Math.max(w, h) * 0.62;
  return [
    { position: "absolute", width: s, height: s, borderRadius: "50%", filter: "blur(60px)", left: -s * 0.35 + Math.sin(t * 0.5) * s * 0.05, top: -s * 0.3 + Math.cos(t * 0.4) * s * 0.05, background: `radial-gradient(circle, ${a}, transparent 65%)` },
    { position: "absolute", width: s, height: s, borderRadius: "50%", filter: "blur(60px)", left: w - s * 0.6 + Math.cos(t * 0.45) * s * 0.06, top: h - s * 0.6 + Math.sin(t * 0.5) * s * 0.05, background: `radial-gradient(circle, ${b}, transparent 65%)` },
  ] as CSSProperties[];
}
