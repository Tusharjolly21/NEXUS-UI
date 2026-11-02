"use client";

import * as React from "react";
import { getSoundAnalyser } from "@/lib/ui-sounds";

/** Two colours per kind of sound: the lit side and the deep side of the drop. */
export const BLOB_COLORS: Record<string, [string, string]> = {
  Actions: ["#c084fc", "#7c3aed"],
  Feedback: ["#34d399", "#0f766e"],
  Navigation: ["#60a5fa", "#1d4ed8"],
  Notifications: ["#fde047", "#f59e0b"],
  Selection: ["#f472b6", "#a855f7"],
  Movement: ["#5eead4", "#16a34a"],
  Progress: ["#fdba74", "#ef4444"],
  System: ["#cbd5e1", "#475569"],
  Glass: ["#a5f3fc", "#0284c7"],
  "Paper and wood": ["#fcd34d", "#b45309"],
  Arcade: ["#e879f9", "#16a34a"],
  Studio: ["#facc15", "#92400e"],
  Devices: ["#93c5fd", "#4338ca"],
  Gallery: ["#fbcfe8", "#6d28d9"],
  Recorded: ["#fda4af", "#be123c"],
  "Molten Hold": ["#fdba74", "#dc2626"],
  "Mercury": ["#e2e8f0", "#64748b"],
  "Status Morph": ["#a5b4fc", "#4338ca"],
  Liquid: ["#7dd3fc", "#2563eb"],
  Icons: ["#fde68a", "#d97706"],
};

// ── One animation loop for every drop on the page ─────────────────────────
//
// Each drop breathes slowly while it is on screen. The one that was just played reads the shared
// analyser, so its outline is pushed out by the live frequencies of the sound you hear.

type Drop = {
  canvas: HTMLCanvasElement;
  colors: [string, string];
  seed: number;
  visible: boolean;
  press: number;
  level: number;
  w: number;
  h: number;
  dpr: number;
};

const drops = new Set<Drop>();
let live: { drop: Drop; until: number } | null = null;
let raf = 0;
const timeData = new Float32Array(1024);
const freqData = new Uint8Array(512);
const N = 72;

function isDark() {
  return document.documentElement.classList.contains("dark");
}

function reducedMotion() {
  return typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fit(d: Drop) {
  const r = d.canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * dpr));
  const h = Math.max(1, Math.round(r.height * dpr));
  if (d.canvas.width !== w || d.canvas.height !== h) {
    d.canvas.width = w;
    d.canvas.height = h;
  }
  d.w = w;
  d.h = h;
  d.dpr = dpr;
}

function draw(d: Drop, now: number, still: boolean, isLive: boolean) {
  const g = d.canvas.getContext("2d");
  if (!g) return;
  const { w, h } = d;
  const [c1, c2] = d.colors;
  g.clearRect(0, 0, w, h);
  const cx = w / 2;
  const cy = h * 0.46;
  const R = Math.min(w, h) * 0.3;
  const t = now / 1000;
  const pts: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    let bin = 0;
    if (isLive) {
      // Average a few neighbouring bins so the edge bulges instead of bristling.
      const k = 2 + Math.floor(Math.abs(Math.sin(a * 1.5 + 0.4)) * 90);
      for (let j = -3; j <= 3; j++) bin += freqData[Math.max(0, k + j)];
      bin /= 7 * 255;
    }
    const idle = still ? 0 : 0.035 * Math.sin(t * 1.4 + i * 0.35 + d.seed) + 0.02 * Math.sin(t * 2.3 - i * 0.6 + d.seed);
    const r = R * (1 + idle + bin * 0.42 + d.level * 0.12) * (1 - d.press * 0.08);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  // floor shadow, wider while it sounds
  g.beginPath();
  g.ellipse(cx, cy + R * 1.38, R * 0.8 * (1 + d.level * 0.3), R * 0.13, 0, 0, Math.PI * 2);
  g.fillStyle = isDark() ? "rgba(0,0,0,.5)" : "rgba(0,0,0,.1)";
  g.fill();
  // the drop: a smooth closed curve through the points
  g.beginPath();
  for (let i = 0; i <= N; i++) {
    const p = pts[i % N];
    const q = pts[(i + 1) % N];
    const mx = (p[0] + q[0]) / 2;
    const my = (p[1] + q[1]) / 2;
    if (i === 0) g.moveTo(mx, my);
    else g.quadraticCurveTo(p[0], p[1], mx, my);
  }
  g.closePath();
  const fill = g.createRadialGradient(cx - R * 0.35, cy - R * 0.45, R * 0.1, cx, cy, R * 1.5);
  fill.addColorStop(0, "#ffffff");
  fill.addColorStop(0.25, c1);
  fill.addColorStop(1, c2);
  g.fillStyle = fill;
  g.shadowColor = c1;
  g.shadowBlur = 28 * d.dpr * d.level;
  g.fill();
  g.shadowBlur = 0;
  // gloss
  g.beginPath();
  g.ellipse(cx - R * 0.3, cy - R * 0.42, R * 0.32, R * 0.16, -0.5, 0, Math.PI * 2);
  g.fillStyle = "rgba(255,255,255,.55)";
  g.fill();
}

let lastIdle = 0;
function frame(now: number) {
  raf = 0;
  const still = reducedMotion();
  const playing = !!live && now < live.until;
  if (live && !playing) live = null;
  let rms = 0;
  if (playing) {
    const an = getSoundAnalyser();
    if (an) {
      an.getFloatTimeDomainData(timeData);
      an.getByteFrequencyData(freqData);
      for (let i = 0; i < timeData.length; i++) rms += timeData[i] * timeData[i];
      rms = Math.min(1, Math.sqrt(rms / timeData.length) * 5);
    }
  }
  // Idle breathing is slow, so 30 frames a second is plenty; the playing drop and any drop still
  // settling get every frame.
  const idleTick = now - lastIdle > 33;
  if (idleTick) lastIdle = now;
  let busy = false;
  drops.forEach((d) => {
    if (!d.visible) return;
    const mine = playing && live!.drop === d;
    d.level = mine ? Math.max(rms, d.level * 0.8) : d.level * 0.88;
    d.press *= 0.82;
    const settling = d.level > 0.003 || d.press > 0.003;
    if (mine || settling || (idleTick && !still)) {
      if (!d.w) fit(d);
      draw(d, now, still, mine);
    }
    if (mine || settling) busy = true;
  });
  // Keep looping while anything moves; with reduced motion only while a drop plays or settles.
  if (busy || (!still && drops.size > 0)) raf = requestAnimationFrame(frame);
}

function wake() {
  if (!raf && typeof window !== "undefined") raf = requestAnimationFrame(frame);
}

/**
 * A glossy drop that breathes at rest and, when its sound plays, is pushed out by that sound's
 * live frequencies: a ping ripples finely, a thud bulges. `hit` changes on every play.
 */
export function SoundBlob({ category, hit, className = "" }: { category: string; hit: number; className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const dropRef = React.useRef<Drop | null>(null);
  const colors = BLOB_COLORS[category] ?? BLOB_COLORS.System;

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const d: Drop = { canvas, colors, seed: Math.random() * 10, visible: false, press: 0, level: 0, w: 0, h: 0, dpr: 1 };
    dropRef.current = d;
    drops.add(d);
    const io = new IntersectionObserver(([e]) => {
      d.visible = e.isIntersecting;
      if (d.visible) {
        fit(d);
        draw(d, performance.now(), reducedMotion(), false);
        wake();
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      fit(d);
      draw(d, performance.now(), reducedMotion(), false);
    });
    ro.observe(canvas);
    return () => {
      io.disconnect();
      ro.disconnect();
      drops.delete(d);
      if (live?.drop === d) live = null;
    };
    // colors only change with the category, which keys the tile
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const d = dropRef.current;
    if (d) d.colors = colors;
  }, [colors]);

  React.useEffect(() => {
    const d = dropRef.current;
    if (!d || !hit) return;
    d.press = 1;
    // Long enough for the longest sound's tail; the drop settles on its own after.
    live = { drop: d, until: performance.now() + 1800 };
    wake();
  }, [hit]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
