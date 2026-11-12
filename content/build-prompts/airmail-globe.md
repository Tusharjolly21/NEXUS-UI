# Airmail Globe

Add the "Airmail Globe" component from Nexus UI to my project.

A postcard composer that sends by airmail across a real globe. Choose who it's for, write a line and press send: the card stands upright and folds itself into a paper plane, crease by crease, then is thrown up to the globe. It flies once all the way round the earth, behind it and back again, trailing a contrail, and comes down on the person you chose. The globe is lit by the sun where it is right now, and on landing it tells you the time there. The recipients are a radio group with arrow keys and the message is a real text field.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
5. Use it like this: `import { AirmailGlobe } from "@/components/airmail-globe";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/airmail-globe/airmail-globe.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs, react-hooks/purity -- these rules assume code runs while rendering; here refs, timers, clocks and setState are used in handlers, effects and animation frames, the animation state lives in refs on purpose */


import { AnimatePresence, type MotionValue, animate, motion, useAnimationControls, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { type KeyboardEvent as RKeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type AirmailPlace = { id: string; name: string; city: string; lat: number; lon: number; tz: string };

export type AirmailGlobeProps = {
  from?: AirmailPlace;
  to?: AirmailPlace[];
  defaultTo?: string;
  defaultMessage?: string;
  onSend?: (to: AirmailPlace, message: string) => void;
  /** Soft synthesised sounds: the card folding, take-off, wind, a chime on landing. They also follow the site-wide sound switch. */
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

const ICON_SEND = "M231.4 44.34v.15l-58.2 191.94a15.88 15.88 0 0 1-14 11.51q-.69.06-1.38.06a15.86 15.86 0 0 1-14.42-9.15l-36.4-74.7a4 4 0 0 1 .77-4.58l57.92-57.92a8 8 0 0 0-11.31-11.31l-57.95 57.92a4 4 0 0 1-4.58.77l-74.77-36.39a16 16 0 0 1 2.49-29.8l191.94-58.2h.15a16 16 0 0 1 19.74 19.7";
const ICON_PIN = "M128 16a88.1 88.1 0 0 0-88 88c0 75.3 80 132.17 83.41 134.55a8 8 0 0 0 9.18 0C136 236.17 216 179.3 216 104a88.1 88.1 0 0 0-88-88m0 56a32 32 0 1 1-32 32a32 32 0 0 1 32-32";
const ICON_CHECK = "M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24m45.66 85.66l-56 56a8 8 0 0 1-11.32 0l-24-24a8 8 0 0 1 11.32-11.32L112 148.69l50.34-50.35a8 8 0 0 1 11.32 11.32";
const ICON_AGAIN = "M224 128a96 96 0 0 1-94.71 96H128a95.38 95.38 0 0 1-65.9-26.2a8 8 0 0 1 11-11.63a80 80 0 1 0-1.67-114.78a3 3 0 0 1-.26.25L44.59 96H72a8 8 0 0 1 0 16H24a8 8 0 0 1-8-8V56a8 8 0 0 1 16 0v29.8L60.25 60A96 96 0 0 1 224 128";
const ICON_MOON = "M235.54 150.21a104.84 104.84 0 0 1-37 52.91A104 104 0 0 1 32 120a103.1 103.1 0 0 1 20.88-62.52a104.84 104.84 0 0 1 52.91-37a8 8 0 0 1 10 10a88.08 88.08 0 0 0 109.8 109.8a8 8 0 0 1 10 10Z";
const ICON_SUN = "M120 40V16a8 8 0 0 1 16 0v24a8 8 0 0 1-16 0m8 24a64 64 0 1 0 64 64a64.07 64.07 0 0 0-64-64m-69.66 5.66a8 8 0 0 0 11.32-11.32l-16-16a8 8 0 0 0-11.32 11.32Zm0 116.68l-16 16a8 8 0 0 0 11.32 11.32l16-16a8 8 0 0 0-11.32-11.32M192 72a8 8 0 0 0 5.66-2.34l16-16a8 8 0 0 0-11.32-11.32l-16 16A8 8 0 0 0 192 72m5.66 114.34a8 8 0 0 0-11.32 11.32l16 16a8 8 0 0 0 11.32-11.32ZM48 128a8 8 0 0 0-8-8H16a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8m80 80a8 8 0 0 0-8 8v24a8 8 0 0 0 16 0v-24a8 8 0 0 0-8-8m112-88h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 0-16";

const FROM: AirmailPlace = { id: "you", name: "You", city: "Kyoto", lat: 35.01, lon: 135.77, tz: "Asia/Tokyo" };
const PEOPLE: AirmailPlace[] = [
  { id: "mia", name: "Mia", city: "Lisbon", lat: 38.72, lon: -9.14, tz: "Europe/Lisbon" },
  { id: "theo", name: "Theo", city: "Reykjavík", lat: 64.15, lon: -21.94, tz: "Atlantic/Reykjavik" },
  { id: "ana", name: "Ana", city: "São Paulo", lat: -23.55, lon: -46.63, tz: "America/Sao_Paulo" },
  { id: "kai", name: "Kai", city: "Honolulu", lat: 21.31, lon: -157.86, tz: "Pacific/Honolulu" },
];

// The land, from Natural Earth (public domain) at 1:50m: a 1440 by 720 map of the world, one bit per quarter of a
// degree, stored as run lengths.
const LAND_W = 1440;
const LAND_H = 720;
const LAND =
  "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gwEDhgEFBcEBDUwCDbkBDw0MHQQBhAQCCwcCNBB+BYoBAwfBAQxdtwEQBgEEDhWfBAIGMxB9Ao8BAwm9AQEECF26AQ0GExIBAaEEAQYzDZICAgq9AQIDCFy5AQ4FFAEEDaIEAgcyCzgC2wECCb4BDFy4AQ4JFwujBAIGNAltAaoBAQq9AQxbtwEPCBgLowQCBjQJPAEuAqwBAQu8AQpctgENCRkLrAQ1CF0CAgEBAcEBvgEHXLcBCgoaC6UEAgY1B1UBDQHCAb8BBAECWbsBBBIVCqYEAwY1BqkCvgECWAQF0AEBAREIpgQFBjQEqwKUAgcFzgEWBakEBgU1AasCAgICAY4CCATOARYCrQQFB+ACBQKMAgkEzgEGAgMCAQusBAYHMAKvApECCQTNAQcUrAQGBy8CsQL1ARMBDwXLAQMarAQGCC0BtQIJAecBCgUWBAEE4QGvBAYI5QIIAQEB4wENBRMIBwHRAQIFsgQGCeYCCATgAQ8GDwwBBdABBQKyBAYJKQG+AggC3AEGCQcEDhPNAQEBuAQHBO8CCALYAQUNFxPJAQEGuAQHBAYB6gIGAQEB1QEEEBUVAgHCAQcBuwQHBPQCAwLWAQIRFxfBAcMECAPyAtwBAg0BAxgWxAHBBAkD8wLbAQEPBAEVFgECwwG+BAsC9ALaAQEUFgwBBwEFxgG6BAsD9ALXAQEVDAEaAgMFyQG2BAwE8wLWAQEWJQMEBcoBpAECjgMNBPQC7QECAQ0CEQIFAQEDzAGdAQUvC9YCDgUiAdAC7QECAQwD6QGZAQYwDtUCDQMBA/IC7gECCAMD7AGBAQQPCi0Q1AIOAgQB8gLwAQQCBAfqAX8HCw0qEdQCEAEfAtYC8gEIAgED6wF+DQYLKxLTAjAC1wL+Ae0BOQNADQkJKAEBE9MCMAHZAuoBAw/vATYFQQsMAQMBAQIoEQQB0QISAhkB3QLnAQUO8QE3BAMBPQ4NASoQ1gITBBUC3wLkAQYN9AE3BQEBAQE7EAcIJxDWAhUEEgLhAuIBBgv4ATYKORIEDiMPAQLUAhYFEAHjAt8BCAj8ATYLNxQBESMN1wIXBwoB5gLdAQsH/QEmBQwKNykhD9MCFwoEAQIB5wLbAQ0G/QEmCQsKNSogD9ICGA8BAegC2AESAuQBBAIEESMMDQoyLCAP0AIZD+oC1wH3ATIECA8NCzAuHg/P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";
let landCache: Uint8Array | null = null;
const decodeLand = () => {
  if (landCache) return landCache;
  const bin = atob(LAND);
  const out = new Uint8Array(LAND_W * LAND_H);
  let p = 0,
    v = 0,
    i = 0;
  while (i < bin.length) {
    let run = 0,
      shift = 0;
    for (;;) {
      const b = bin.charCodeAt(i++);
      run |= (b & 127) << shift;
      if (b < 128) break;
      shift += 7;
    }
    if (v) out.fill(255, p, p + run);
    p += run;
    v ^= 1;
  }
  landCache = out;
  return out;
};

const GH = 300; // the globe's window, css px
const D2R = Math.PI / 180;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
type V3 = [number, number, number];
const vec = (lat: number, lon: number): V3 => [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const slerp = (a: V3, b: V3, t: number): V3 => {
  const w = Math.acos(clamp(dot(a, b), -1, 1));
  if (w < 1e-4) return a;
  const s = Math.sin(w);
  const k0 = Math.sin((1 - t) * w) / s,
    k1 = Math.sin(t * w) / s;
  return [a[0] * k0 + b[0] * k1, a[1] * k0 + b[1] * k1, a[2] * k0 + b[2] * k1];
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** the plane of the trip: the great circle through A and B, and the way round it from A toward B */
const tripAxes = (A: V3, B: V3) => {
  let n = cross(A, B);
  if (Math.hypot(n[0], n[1], n[2]) < 1e-4) n = cross(A, [0, 1, 0]);
  n = norm(n);
  return { n, T: norm(cross(n, A)), w: Math.acos(clamp(dot(A, B), -1, 1)) };
};
/**
 * Where the plane is at u (0 to 1): it climbs off A, goes once all the way round the earth along the trip's great
 * circle (out past B, behind the earth and back round), and comes down on B.
 */
const flightAt = (A: V3, B: V3, u: number): { p: V3; ground: V3; alt: number } => {
  const { T, w } = tripAxes(A, B);
  const e = u - Math.sin(2 * Math.PI * u) / (2 * Math.PI); // gentle at both ends
  const th = (Math.PI * 2 + w) * e;
  const g: V3 = [A[0] * Math.cos(th) + T[0] * Math.sin(th), A[1] * Math.cos(th) + T[1] * Math.sin(th), A[2] * Math.cos(th) + T[2] * Math.sin(th)];
  const s1 = clamp(u / 0.14),
    s2 = clamp((u - 0.78) / 0.22);
  const alt = 0.42 * s1 * s1 * (3 - 2 * s1) * (1 - s2 * s2 * (3 - 2 * s2));
  return { p: [g[0] * (1 + alt), g[1] * (1 + alt), g[2] * (1 + alt)], ground: g, alt };
};
/** the view for the flight: looking at the middle of the trip, raised 32 degrees out of the orbit's plane */
const orbitView = (A: V3, B: V3): V3 => {
  const { n } = tripAxes(A, B);
  const mid = slerp(A, B, 0.5);
  const a = 32 * D2R;
  return norm([mid[0] * Math.cos(a) + n[0] * Math.sin(a), mid[1] * Math.cos(a) + n[1] * Math.sin(a), mid[2] * Math.cos(a) + n[2] * Math.sin(a)]);
};
const latLon = (v: V3) => ({ lat: Math.asin(clamp(v[1], -1, 1)) / D2R, lon: Math.atan2(v[0], v[2]) / D2R });
/** world to view: turn the globe so (lat, lon) faces you */
const viewMatrix = (lat: number, lon: number) => {
  const cy = Math.cos(-lon * D2R),
    sy = Math.sin(-lon * D2R),
    cx = Math.cos(lat * D2R),
    sx = Math.sin(lat * D2R);
  // Rx(lat) · Ry(-lon), rows
  return [cy, 0, sy, -sx * -sy, cx, -sx * cy, cx * -sy, sx, cx * cy];
};
const apply = (m: number[], v: V3): V3 => [m[0] * v[0] + m[1] * v[1] + m[2] * v[2], m[3] * v[0] + m[4] * v[1] + m[5] * v[2], m[6] * v[0] + m[7] * v[1] + m[8] * v[2]];
/** where the sun is overhead right now */
const sunNow = (d = new Date()): V3 => {
  const start = Date.UTC(d.getUTCFullYear(), 0, 0);
  const doy = (d.getTime() - start) / 86400000;
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (doy + 10));
  const hours = d.getUTCHours() + d.getUTCMinutes() / 60;
  return vec(decl, (12 - hours) * 15);
};
const km = (a: AirmailPlace, b: AirmailPlace) => Math.round((Math.acos(clamp(dot(vec(a.lat, a.lon), vec(b.lat, b.lon)), -1, 1)) * 6371) / 10) * 10;
const localTime = (tz: string, d = new Date()) => {
  try {
    return { text: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: tz }), hour: Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: tz }).format(d)) };
  } catch {
    return { text: d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }), hour: d.getHours() };
  }
};

/**
 * A postcard that travels by airmail, across a real globe.
 *
 * Write a few lines and choose who it's for; the globe turns to show the route, a great circle from you to them.
 * Send it and the card stands itself upright and folds into a paper plane, nose up, crease by crease (corners in,
 * edges in, in half, wings out); it dips and is thrown straight up to the globe, which turns to watch its flight from a
 * little above. The plane climbs, goes once all the way round the earth along the trip's great circle (out past them,
 * behind the earth and back round) trailing a fading contrail, then comes down on them. The globe is lit by the
 * sun where it is right now, so one end of the trip may be in daylight and the other at night under city lights. It
 * lands with ripples spreading over the curve of the earth, and tells you what time it is there and whether they're
 * likely asleep. The globe is a WebGL shader (the land is Natural Earth's coastline as a dotted grid, oceans with a sun
 * glint, an atmosphere at the rim); the route, the plane and the ripples are drawn over it in 2D. Without WebGL the globe
 * is drawn with dots on a 2D canvas.
 *   <AirmailGlobe to={friends} onSend={(to, text) => api.send(to.id, text)} />
 */
export default function AirmailGlobe({
  from = FROM,
  to = PEOPLE,
  defaultTo = "mia",
  defaultMessage = "Greetings from Kyoto! The temples are unreal and I've had far too much matcha. Save me a seat at our café when I'm back.",
  onSend,
  enableSound = true,
  volume = 0.8,
  autoplay = false,
  className = "",
}: AirmailGlobeProps) {
  const reduce = !!useReducedMotion();
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const touched = useRef(false);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const rootRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(rootRef, { margin: "100px" });
  const [width, setWidth] = useState(420);
  const [dest, setDest] = useState(to.find((p) => p.id === defaultTo) ?? to[0]);
  const [message, setMessage] = useState(defaultMessage);
  const [phase, setPhase] = useState<"write" | "fold" | "fly" | "landed">("write");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [now, setNow] = useState(() => new Date());
  const card = useAnimationControls();
  const plane = useAnimationControls();
  const fold = useMotionValue(0); // 0: a flat card, 4: a paper plane
  const [folding, setFolding] = useState<{ w: number; h: number } | null>(null);
  const cb = useRef({ onSend });
  cb.current = { onSend };

  const sim = useRef({
    view: { lat: from.lat, lon: from.lon },
    t: 0, // flight progress
    flying: false,
    landT: -1, // seconds since landing
    windAt: 0,
    dest: dest,
  });
  sim.current.dest = dest;

  useEffect(() => {
    const el = winRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const land = useMemo(() => (typeof window === "undefined" ? null : decodeLand()), []);

  const choose = (p: AirmailPlace, user = true) => {
    if (user) touched.current = true;
    if (phaseRef.current === "fold" || phaseRef.current === "fly") return;
    setDest(p);
    if (phaseRef.current === "landed") setPhase("write");
    sim.current.landT = -1;
    sfx.tick({ freq: 2000, gain: 0.02 });
  };
  const onKey = (e: RKeyboardEvent, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + to.length) % to.length;
    btnRefs.current[n]?.focus();
    choose(to[n]);
  };

  /** where a place sits on screen right now, relative to the globe window */
  const screenOf = (p: AirmailPlace) => {
    const s = sim.current;
    const m = viewMatrix(s.view.lat, s.view.lon);
    const v = apply(m, vec(p.lat, p.lon));
    const R = Math.min(width, GH) * 0.4;
    return { x: width / 2 + v[0] * R, y: GH / 2 - v[1] * R, front: v[2] > 0 };
  };

  const send = async (user: boolean) => {
    if (user) touched.current = true;
    if (phaseRef.current !== "write") return;
    unlockAudio();
    setPhase("fold");
    phaseRef.current = "fold";
    cb.current.onSend?.(dest, message);
    const s = sim.current;
    s.t = 0;
    s.landT = -1;
    sfx.whoosh(900, 300, { dur: 0.25, gain: 0.04 });
    if (reduce) card.set({ opacity: 0 });
    else {
      // fold: the card is swapped for a sheet of the same size that folds itself into a paper plane, crease by crease
      const cardEl = cardRef.current,
        win = winRef.current;
      const cr = cardEl?.getBoundingClientRect();
      fold.set(0);
      setFolding({ w: cr?.width ?? 400, h: cr?.height ?? 130 });
      plane.set({ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
      card.set({ opacity: 0 });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      const crease = (to: number, dur: number) => {
        sfx.whoosh(1400, 500, { dur: 0.16, gain: 0.03 });
        window.setTimeout(() => sfx.tick({ freq: 700 + to * 120, gain: 0.04 }), dur * 900);
        return animate(fold, to, { duration: dur, ease: [0.65, 0, 0.35, 1] });
      };
      // first the sheet is stood upright, so the plane will be folded nose up
      sfx.whoosh(600, 1100, { dur: 0.3, gain: 0.025 });
      await plane.start({ rotate: -90, scale: 0.5, y: -34, transition: { type: "spring", stiffness: 210, damping: 22 } });
      await crease(1, 0.32); // the two top corners fold in to the centre line
      await crease(2, 0.3); // the new edges fold in again, to a point
      await crease(3, 0.28); // it folds in half down the middle
      await crease(4, 0.3); // and the wings fold out
      // then it's thrown: a little dip, and straight up and away toward where the trip begins
      let dx = 0,
        dy = -200;
      if (cr && win) {
        const wr = win.getBoundingClientRect();
        const a = screenOf(from);
        dx = wr.left + a.x - (cr.left + cr.width / 2);
        dy = wr.top + a.y - (cr.top + cr.height / 2);
      }
      const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
      await plane.start({ y: -24, scale: 0.48, transition: { duration: 0.16, ease: "easeOut" } });
      sfx.whoosh(250, 1500, { dur: 0.7, gain: 0.06 });
      await plane.start({
        x: [0, dx * 0.3, dx],
        y: [-24, dy * 0.55 - 40, dy],
        rotate: [-90, -90 + (ang + 90) * 0.4, ang],
        scale: [0.48, 0.28, 0.06],
        opacity: [1, 1, 1, 0],
        transition: { duration: 0.7, ease: [0.4, 0, 0.6, 1], opacity: { duration: 0.7, times: [0, 0.5, 0.85, 1] } },
      });
      setFolding(null);
    }
    setPhase("fly");
    phaseRef.current = "fly";
    s.flying = true;
  };

  const again = async (user: boolean) => {
    if (user) touched.current = true;
    sim.current.landT = -1;
    setPhase("write");
    phaseRef.current = "write";
    setFolding(null);
    card.set({ x: 0, y: 24, scale: 0.96, rotate: 0, opacity: 0 });
    await card.start({ y: 0, scale: 1, opacity: 1, transition: { type: "spring", stiffness: 260, damping: 24 } });
  };
  // ── the loop: the camera, the flight, the drawing ──
  useEffect(() => {
    const gl0 = glRef.current,
      cv = cvRef.current,
      fx = fxRef.current;
    if (!gl0 || !cv || !fx || !inView || !land) return;
    const s = sim.current;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const W = width;
    const R = Math.min(W, GH) * 0.4;
    const globe = makeGlobe(gl0, land);
    const flat = globe ? null : cv.getContext("2d");
    const fctx = fx.getContext("2d")!;
    fx.width = Math.round(W * dpr);
    fx.height = Math.round(GH * dpr);
    let raf = 0,
      last = performance.now();
    const t0 = last;
    const FLIGHT = reduce ? 0.01 : 5.6;
    const frame = (nowT: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (nowT - last) / 1000);
      last = nowT;
      const A = vec(from.lat, from.lon),
        B = vec(s.dest.lat, s.dest.lon);
      const ph = phaseRef.current;
      // the flight
      if (ph === "fly" && s.flying) {
        s.t = Math.min(1, s.t + dt / FLIGHT);
        if (nowT > s.windAt) {
          s.windAt = nowT + 380;
          sfx.whoosh(300, 520, { dur: 0.42, gain: 0.014 });
        }
        if (s.t >= 1) {
          s.flying = false;
          s.landT = 0;
          setPhase("landed");
          phaseRef.current = "landed";
          sfx.note(660, { dur: 0.5, gain: 0.05, bell: 0.4 });
          sfx.note(990, { at: 0.12, dur: 0.7, gain: 0.04, bell: 0.4 });
        }
      }
      if (s.landT >= 0) s.landT += dt;
      // the camera: before sending it frames the route; for the flight it pulls round to look at the plane's orbit a
      // little from above, so the orbit is an ellipse with its far side behind the earth; at the end it comes round to
      // rest on them
      const angle = Math.acos(clamp(dot(A, B), -1, 1));
      const orbitV = orbitView(A, B);
      let want: { lat: number; lon: number };
      let latCap = 40;
      if (ph === "write") want = angle > 1.6 ? latLon(slerp(A, B, 0.3)) : latLon(slerp(A, B, 0.5));
      else if (ph === "fold") {
        want = latLon(orbitV);
        latCap = 70;
      } else if (ph === "fly") {
        const k = clamp((s.t - 0.8) / 0.2);
        want = latLon(slerp(orbitV, B, k * k * (3 - 2 * k)));
        latCap = 70;
      } else want = latLon(B);
      const wantLat = clamp(ph === "write" || ph === "landed" ? want.lat * 0.75 : want.lat, -latCap, latCap);
      let dl = want.lon - s.view.lon;
      dl = ((dl + 540) % 360) - 180;
      const rate = 1 - Math.exp(-dt * (ph === "fly" ? 3 : 2.4));
      s.view.lon += dl * rate + (ph === "write" && !reduce ? Math.sin((nowT - t0) / 2600) * 0.02 : 0);
      s.view.lat += (wantLat - s.view.lat) * rate;
      const m = viewMatrix(s.view.lat, s.view.lon);
      const sun = sunNow(now);
      if (globe) globe.render({ W, H: GH, dpr, R, m, sun, t: (nowT - t0) / 1000 });
      else if (flat) drawFlatGlobe(flat, cv, W, dpr, R, m, sun, land);
      // the route, the plane, the ripples
      drawOverlay(fctx, W, dpr, R, m, A, B, ph, s.t, s.landT, reduce);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      globe?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, width, land, reduce, now, from]);

  // ── autoplay: pick someone, send, watch it land, start again ──
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    let k = Math.max(0, to.findIndex((p) => p.id === dest.id));
    let t = 0;
    const loop = () => {
      if (touched.current) return;
      if (phaseRef.current === "write") {
        void send(false);
        t = window.setTimeout(loop, 5600);
      } else if (phaseRef.current === "landed") {
        k = (k + 1) % to.length;
        void again(false).then(() => {
          if (!touched.current) choose(to[k], false);
        });
        t = window.setTimeout(loop, 2600);
      } else t = window.setTimeout(loop, 800);
    };
    t = window.setTimeout(loop, 1600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView, reduce]);

  const there = localTime(dest.tz, now);
  const here = localTime(from.tz, now);
  const asleep = there.hour < 7 || there.hour >= 23;
  const dist = km(from, dest);

  return (
    <div ref={rootRef} className={`w-full max-w-[460px] rounded-[24px] bg-white p-5 text-[#1d1d1f] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-[17px] font-semibold tracking-[-0.02em]">Send a postcard</div>
        <div className="text-[12px] tabular-nums text-[#86868b]">
          {from.city}, {here.text}
        </div>
      </div>
      {/* the globe */}
      <div ref={winRef} className="relative mt-3 overflow-hidden rounded-[18px]" style={{ height: GH, background: "radial-gradient(120% 90% at 50% 40%, #0e1530 0%, #060912 70%)" }}>
        <canvas ref={glRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
        <canvas ref={cvRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <canvas ref={fxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium tabular-nums text-white/85 backdrop-blur-md">
          {from.city} to {dest.city}, {dist.toLocaleString()} km
        </div>
        <AnimatePresence>
          {phase === "landed" && (
            <motion.div
              key="landed"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: reduce ? 0 : 0.5, type: "spring", stiffness: 300, damping: 26 }}
              className="absolute inset-x-3 bottom-3 flex items-center gap-2.5 rounded-[14px] bg-white/12 px-3 py-2.5 text-white backdrop-blur-md"
              role="status"
            >
              <svg viewBox="0 0 256 256" className="h-5 w-5 shrink-0 text-[#30d158]" aria-hidden="true">
                <path fill="currentColor" d={ICON_CHECK} />
              </svg>
              <div className="min-w-0 text-[13px] leading-tight">
                <div className="font-semibold">Delivered to {dest.name}</div>
                <div className="flex items-center gap-1 text-white/70">
                  <svg viewBox="0 0 256 256" className="h-3 w-3" aria-hidden="true">
                    <path fill="currentColor" d={asleep ? ICON_MOON : ICON_SUN} />
                  </svg>
                  It&rsquo;s {there.text} in {dest.city}
                  {asleep ? ", they'll see it in the morning" : ""}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* who it's for */}
      <div role="radiogroup" aria-label="Send to" className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {to.map((p, i) => {
          const on = p.id === dest.id;
          return (
            <button
              key={p.id}
              ref={(el) => {
            btnRefs.current[i] = el;
          }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(p)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] outline-none transition-colors focus-visible:shadow-[0_0_0_2px_#0071e3] ${on ? "bg-[#1d1d1f] font-semibold text-white" : "bg-[#f5f5f7] font-medium text-[#424245] hover:bg-[#ebebef]"}`}
            >
              <svg viewBox="0 0 256 256" className={`h-3 w-3 ${on ? "text-[#ff375f]" : "text-[#86868b]"}`} aria-hidden="true">
                <path fill="currentColor" d={ICON_PIN} />
              </svg>
              {p.name}, {p.city}
            </button>
          );
        })}
      </div>
      {/* the postcard */}
      <div className="relative mt-3" style={{ perspective: 900 }}>
        {/* where the card was, while it's away */}
        <AnimatePresence>
          {phase !== "write" && !folding && (
            <motion.div
              key="away"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center rounded-[6px] border border-dashed border-black/15 text-center"
            >
              <div className="text-[13px] font-medium text-[#1d1d1f]">{phase === "landed" ? `${dest.name} has your postcard` : "Your postcard is in the air"}</div>
              <div className="mt-0.5 max-w-[80%] truncate font-mono text-[11.5px] text-[#86868b]">{message}</div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div ref={cardRef} animate={card} initial={false} className={`relative rounded-[6px] ${folding ? "invisible" : ""} bg-[#fbf8f1] p-3.5 shadow-[0_0_0_1px_rgba(0,0,0,.07),0_10px_24px_-14px_rgba(0,0,0,.4)]`} style={{ transformOrigin: "50% 50%" }}>
          {/* the airmail edge */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[6px]" style={{ padding: 4, background: "repeating-linear-gradient(135deg,#d6303a 0 10px,#fbf8f1 10px 15px,#1f5fbf 15px 25px,#fbf8f1 25px 30px)", WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
          <div className="relative flex gap-3">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Message</span>
              <textarea
                value={message}
                onChange={(e) => {
                  touched.current = true;
                  setMessage(e.target.value);
                }}
                disabled={phase !== "write"}
                rows={4}
                maxLength={220}
                className="h-[92px] w-full resize-none bg-transparent font-mono text-[12.5px] leading-[1.45] text-[#2c2a26] outline-none placeholder:text-[#a9a49a]"
                style={{ backgroundImage: "repeating-linear-gradient(transparent 0 17.1px, rgba(60,50,30,.12) 17.1px 18.1px)" }}
                placeholder="Write a postcard"
              />
            </label>
            <div className="flex w-[104px] shrink-0 flex-col border-l border-dashed border-black/15 pl-3">
              <div className="ml-auto grid h-[46px] w-[38px] place-items-center rounded-[2px] bg-[#ff375f] text-white shadow-[0_0_0_2px_#fbf8f1,0_0_0_3px_rgba(0,0,0,.12)]" aria-hidden="true">
                <svg viewBox="0 0 256 256" className="h-5 w-5">
                  <path fill="currentColor" d={ICON_SEND} />
                </svg>
              </div>
              <div className="mt-auto text-[11px] leading-tight text-[#2c2a26]">
                <div className="font-semibold">{dest.name}</div>
                <div className="text-[#6e6e73]">{dest.city}</div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* the sheet that folds into a paper plane and is thrown */}
        {folding && (
          <motion.div aria-hidden="true" animate={plane} className="pointer-events-none absolute left-0 top-0 z-10" style={{ width: folding.w, height: folding.h }}>
            <PaperPlane w={folding.w} h={folding.h} fold={fold} message={message} />
          </motion.div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="min-w-0 truncate text-[12px] text-[#86868b]">
          {phase === "fly" ? `On its way to ${dest.city}` : phase === "landed" ? "Delivered" : `It's ${there.text} in ${dest.city}`}
        </div>
        {phase === "landed" ? (
          <button key="again" type="button" onClick={() => again(true)} className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#f5f5f7] px-4 py-2 text-[14px] font-medium text-[#1d1d1f] outline-none hover:bg-[#ebebef] focus-visible:shadow-[0_0_0_2px_#0071e3]">
            <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d={ICON_AGAIN} />
            </svg>
            Write another
          </button>
        ) : (
          <button
            key="send"
            type="button"
            onClick={() => send(true)}
            disabled={phase !== "write" || !message.trim()}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#0071e3] px-4 py-2 text-[14px] font-medium text-white outline-none focus-visible:shadow-[0_0_0_2px_#0071e3] focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50"
          >
            <svg viewBox="0 0 256 256" className="h-4 w-4" aria-hidden="true">
              <path fill="currentColor" d={ICON_SEND} />
            </svg>
            {phase === "write" ? "Send by airmail" : "Sending"}
          </button>
        )}
      </div>
    </div>
  );
}

type Pts = number[][];
const lerpPts = (a: Pts, b: Pts, t: number) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
const at = (stages: Pts[], f: number) => {
  const i = Math.min(stages.length - 2, Math.floor(f));
  return lerpPts(stages[i], stages[i + 1], f - i);
};
const pathOf = (pts: Pts) => "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L") + " Z";

/** the postcard's sheet folding into a paper plane: nose to the right, one stage per crease */
function PaperPlane({ w, h, fold, message }: { w: number; h: number; fold: MotionValue<number>; message: string }) {
  const clip = `pp${useId().replace(/:/g, "")}`;
  const S = useMemo(() => {
    const m = h / 2;
    const outline: Pts[] = [
      [[0, 0], [w, 0], [w, 0], [w, m], [w, h], [w, h], [0, h], [0, m]],
      [[0, 0], [w - m, 0], [w - m, 0], [w, m], [w - m, h], [w - m, h], [0, h], [0, m]],
      [[0, h * 0.2], [w * 0.5, h * 0.31], [w * 0.5, h * 0.31], [w, m], [w * 0.5, h * 0.69], [w * 0.5, h * 0.69], [0, h * 0.8], [0, m]],
      [[w * 0.04, h * 0.44], [w * 0.5, h * 0.47], [w * 0.5, h * 0.47], [w, m], [w * 0.5, h * 0.55], [w * 0.25, h * 0.6], [w * 0.04, h * 0.64], [w * 0.04, m]],
      [[w * 0.06, h * 0.06], [w * 0.32, h * 0.36], [w * 0.32, h * 0.36], [w, m], [w * 0.32, h * 0.64], [w * 0.32, h * 0.64], [w * 0.06, h * 0.94], [w * 0.14, m]],
    ];
    // the folded-over parts, a shade darker: the corners, then the long flaps, then one wing in shadow
    const top: Pts[] = [
      [[w, 0], [w, 0], [w, 0]],
      [[w - m, 0], [w, m], [w - m, m]],
      [[0, h * 0.2], [w, m], [0, m]],
      [[w * 0.04, h * 0.44], [w, m], [w * 0.04, m]],
      [[w * 0.06, h * 0.06], [w, m], [w * 0.14, m]],
    ];
    const bottom: Pts[] = [
      [[w, h], [w, h], [w, h]],
      [[w - m, h], [w, m], [w - m, m]],
      [[0, h * 0.8], [w, m], [0, m]],
      [[w * 0.04, h * 0.64], [w, m], [w * 0.04, m]],
      [[w * 0.06, h * 0.94], [w, m], [w * 0.14, m]],
    ];
    return { outline, top, bottom };
  }, [w, h]);
  const d = useTransform(fold, (f) => pathOf(at(S.outline, f)));
  const dt = useTransform(fold, (f) => pathOf(at(S.top, f)));
  const db = useTransform(fold, (f) => pathOf(at(S.bottom, f)));
  // the top flap is lit until the last stage, where it becomes the sunny wing; the bottom one ends as the wing in shade
  const topFill = useTransform(fold, [0, 3, 4], ["#efe8da", "#ece5d6", "#fffdf8"]);
  const botFill = useTransform(fold, [0, 3, 4], ["#efe8da", "#e4dccb", "#ddd3c0"]);
  const shadow = useTransform(fold, [0, 4], [0.18, 0.32]);
  const filt = useTransform(shadow, (a) => `drop-shadow(0 10px 14px rgba(0,0,0,${a}))`);
  const ink = useTransform(fold, [0, 0.9, 1.6], [1, 0.6, 0]);
  return (
    <motion.svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" style={{ filter: filt }}>
      <defs>
        <clipPath id={clip}>
          <motion.path d={d} />
        </clipPath>
      </defs>
      <motion.path d={d} fill="#fbf8f1" stroke="rgba(60,50,30,.18)" strokeWidth={1} strokeLinejoin="round" />
      {/* the words, still on the paper as the first creases go in */}
      <motion.g clipPath={`url(#${clip})`} style={{ opacity: ink }}>
        <foreignObject x={0} y={0} width={w} height={h}>
          <div style={{ padding: "14px 132px 14px 14px", font: "12.5px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace", color: "#2c2a26", overflow: "hidden", height: h }}>{message}</div>
        </foreignObject>
      </motion.g>
      {/* the airmail edge, still on the paper as it folds */}
      <motion.path d={d} fill="none" stroke="#d6303a" strokeWidth={3} strokeDasharray="9 18" strokeLinejoin="round" opacity={0.85} />
      <motion.path d={d} fill="none" stroke="#1f5fbf" strokeWidth={3} strokeDasharray="9 18" strokeDashoffset={13.5} strokeLinejoin="round" opacity={0.85} />
      <motion.path d={dt} fill={topFill} stroke="rgba(60,50,30,.22)" strokeWidth={1} strokeLinejoin="round" />
      <motion.path d={db} fill={botFill} stroke="rgba(60,50,30,.22)" strokeWidth={1} strokeLinejoin="round" />
    </motion.svg>
  );
}

/** the route, the plane in flight with its shadow and contrail, and the ripples where it lands */
function drawOverlay(g: CanvasRenderingContext2D, W: number, dpr: number, R: number, m: number[], A: V3, B: V3, ph: string, t: number, landT: number, reduce: boolean) {
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, GH);
  const cx = W / 2,
    cy = GH / 2;
  const proj = (v: V3) => {
    const p = apply(m, v);
    return { x: cx + p[0] * R, y: cy - p[1] * R, z: p[2], vis: p[2] > 0 || Math.hypot(p[0], p[1]) > 1.0 };
  };
  const arcAt = (u: number): V3 => {
    const d = slerp(A, B, u);
    const h = 1 + 0.2 * Math.sin(Math.PI * u) * Math.min(1, Math.acos(clamp(dot(A, B), -1, 1)) / 1.2);
    return [d[0] * h, d[1] * h, d[2] * h];
  };
  const N = 90;
  // the planned route: a dashed great circle, hidden where it passes behind the earth
  g.lineWidth = 1.6;
  g.setLineDash([4, 5]);
  g.shadowColor = "rgba(120,180,255,.9)";
  g.shadowBlur = ph === "write" ? 6 : 0;
  g.strokeStyle = ph === "write" ? "rgba(255,255,255,.9)" : "rgba(255,255,255,.22)";
  g.beginPath();
  let pen = false;
  for (let i = 0; i <= N; i++) {
    const q = proj(arcAt(i / N));
    if (!q.vis) {
      pen = false;
      continue;
    }
    if (!pen) g.moveTo(q.x, q.y);
    else g.lineTo(q.x, q.y);
    pen = true;
  }
  g.stroke();
  g.setLineDash([]);
  g.shadowBlur = 0;
  // the two ends
  for (const [v, col] of [
    [A, "#ffffff"],
    [B, "#ff375f"],
  ] as const) {
    const q = proj(v);
    if (q.z <= 0) continue;
    g.fillStyle = col;
    g.beginPath();
    g.arc(q.x, q.y, 3, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = col;
    g.globalAlpha = 0.35;
    g.beginPath();
    g.arc(q.x, q.y, 6, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 1;
  }
  if ((ph === "fly" || ph === "landed") && !reduce) {
    // the contrail: the last stretch of the flight, brightest just behind the plane, hidden behind the earth
    const end = ph === "fly" ? t : 1;
    const start = Math.max(0, end - 0.3);
    const M = 80;
    for (let i = 0; i < M; i++) {
      const u0 = start + ((end - start) * i) / M,
        u1 = start + ((end - start) * (i + 1)) / M;
      const a = proj(flightAt(A, B, u0).p),
        b = proj(flightAt(A, B, u1).p);
      if (!a.vis || !b.vis) continue;
      const k = Math.pow(i / M, 1.8);
      const fade = ph === "fly" ? k : Math.max(0, 1 - landT / 1.5) * k;
      // fainter where it runs behind the globe's limb
      const depth = a.z < 0 ? 0.45 : 1;
      g.strokeStyle = `rgba(255,214,150,${fade * 0.85 * depth})`;
      g.lineWidth = 0.6 + fade * 1.8;
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.stroke();
    }
  }
  if (ph === "fly" && !reduce) {
    const F = flightAt(A, B, t),
      Fn = flightAt(A, B, Math.min(1, t + 0.004));
    const q = proj(F.p),
      qn = proj(Fn.p);
    if (q.vis) {
      // its shadow on the ground, only while it's low
      const gq = proj(F.ground);
      const alt = F.alt;
      if (gq.z > 0 && alt < 0.3) {
        g.fillStyle = `rgba(0,0,0,${0.32 - alt})`;
        g.beginPath();
        g.ellipse(gq.x + 4, gq.y + 3, 9 + alt * 30, (4 + alt * 12) * Math.max(0.3, gq.z), 0, 0, Math.PI * 2);
        g.fill();
      }
      // nearer looks bigger, and it dims a touch while it's round the back
      g.globalAlpha = q.z < 0 ? 0.7 : 1;
      const depthScale = 1 + 0.2 * clamp(q.z, -1.5, 1.5);
      // the paper plane, turned along its course, its wings rocking a little as it banks
      const ang = Math.atan2(qn.y - q.y, qn.x - q.x);
      const s = (1 + alt * 1.2) * depthScale;
      const bank = Math.sin(t * 22) * 0.35;
      g.save();
      g.translate(q.x, q.y);
      g.rotate(ang);
      g.scale(s, s);
      g.shadowColor = "rgba(255,225,170,.55)";
      g.shadowBlur = 10;
      // the wing toward the light
      g.fillStyle = "#fffdf8";
      g.beginPath();
      g.moveTo(12, 0);
      g.lineTo(-10, -9 * (1 - bank * 0.4));
      g.lineTo(-6, 0);
      g.closePath();
      g.fill();
      g.shadowBlur = 0;
      // the wing in shade
      g.fillStyle = "#d9cfbb";
      g.beginPath();
      g.moveTo(12, 0);
      g.lineTo(-10, 9 * (1 + bank * 0.4));
      g.lineTo(-6, 0);
      g.closePath();
      g.fill();
      // the keel under the centre crease
      g.fillStyle = "#c7bca6";
      g.beginPath();
      g.moveTo(12, 0);
      g.lineTo(-7, 0);
      g.lineTo(-5, 2.6);
      g.closePath();
      g.fill();
      g.strokeStyle = "rgba(60,50,30,.35)";
      g.lineWidth = 0.6;
      g.beginPath();
      g.moveTo(12, 0);
      g.lineTo(-6, 0);
      g.stroke();
      g.restore();
      g.globalAlpha = 1;
    }
  }
  if (landT >= 0) {
    // ripples spreading over the curve of the earth, drawn as small circles on the sphere
    const q0 = proj(B);
    if (q0.z > 0) {
      const tang = norm([-B[2], 0, B[0]]);
      const bit = norm([B[1] * tang[2] - B[2] * tang[1], B[2] * tang[0] - B[0] * tang[2], B[0] * tang[1] - B[1] * tang[0]]);
      for (let k = 0; k < 3; k++) {
        const age = landT - k * 0.35;
        if (age < 0 || age > 1.8) continue;
        const rho = 0.02 + age * 0.12;
        g.strokeStyle = `rgba(255,55,95,${(1 - age / 1.8) * 0.9})`;
        g.lineWidth = 1.5;
        g.beginPath();
        for (let i = 0; i <= 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          const v: V3 = norm([B[0] + (tang[0] * Math.cos(a) + bit[0] * Math.sin(a)) * rho, B[1] + (tang[1] * Math.cos(a) + bit[1] * Math.sin(a)) * rho, B[2] + (tang[2] * Math.cos(a) + bit[2] * Math.sin(a)) * rho]);
          const p = proj(v);
          if (i === 0) g.moveTo(p.x, p.y);
          else g.lineTo(p.x, p.y);
        }
        g.stroke();
      }
      // the pin
      const drop = reduce ? 1 : clamp(landT / 0.35);
      const py = q0.y - 18 * (1 - drop) * (1 - drop);
      g.fillStyle = "#ff375f";
      g.beginPath();
      g.arc(q0.x, py - 9, 5.5, Math.PI, 0);
      g.lineTo(q0.x, py);
      g.closePath();
      g.fill();
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(q0.x, py - 9, 2, 0, Math.PI * 2);
      g.fill();
    }
  }
}

/** without WebGL: the globe as a disc with land dots */
function drawFlatGlobe(g: CanvasRenderingContext2D, cv: HTMLCanvasElement, W: number, dpr: number, R: number, m: number[], sun: V3, land: Uint8Array) {
  if (cv.width !== Math.round(W * dpr)) {
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(GH * dpr);
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, GH);
  const cx = W / 2,
    cy = GH / 2;
  const grad = g.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
  grad.addColorStop(0, "#1d4c8a");
  grad.addColorStop(1, "#071530");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();
  for (let lat = -84; lat <= 84; lat += 2.4) {
    const n = Math.max(1, Math.floor((360 * Math.cos(lat * D2R)) / 2.4));
    for (let j = 0; j < n; j++) {
      const lon = -180 + (j + 0.5) * (360 / n);
      const x = Math.floor(((lon + 180) / 360) * LAND_W) % LAND_W,
        y = Math.floor(((90 - lat) / 180) * LAND_H);
      if (!land[y * LAND_W + x]) continue;
      const v = vec(lat, lon);
      const p = apply(m, v);
      if (p[2] <= 0) continue;
      const day = clamp(dot(v, sun) * 4 + 0.5);
      g.fillStyle = day > 0.3 ? `rgba(200,220,240,${0.4 + 0.5 * day})` : "rgba(255,190,110,.6)";
      g.fillRect(cx + p[0] * R - 0.8, cy - p[1] * R - 0.8, 1.6, 1.6);
    }
  }
}

// ───────────── the globe, in WebGL ─────────────
const GLOBE_VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const GLOBE_FS = `precision highp float;
uniform sampler2D uLand;
uniform vec2 uRes; uniform float uDpr, uR, uT;
uniform mat3 uRot; // view to world
uniform vec3 uSun;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float landAt(float lat, float lon){
  vec2 uv = vec2(fract((lon + 180.0) / 360.0), (90.0 - lat) / 180.0);
  return texture2D(uLand, uv).r;
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;
  vec2 d = (px - uRes * 0.5) / uR;
  float r2 = dot(d, d);
  vec3 sunV = uSun * uRot; // the sun in view space (uRot is view to world, so this is its inverse)
  if (r2 > 1.0) {
    // the atmosphere beyond the rim, brighter on the sunlit side
    float rr = sqrt(r2);
    float lit = clamp(dot(normalize(vec3(d.x, -d.y, 0.0)), sunV) * 0.6 + 0.5, 0.15, 1.0);
    float a = exp(-(rr - 1.0) * 14.0) * 0.55 * lit;
    gl_FragColor = vec4(vec3(0.35, 0.6, 1.0) * a, a);
    return;
  }
  vec3 nv = vec3(d.x, -d.y, sqrt(1.0 - r2));
  vec3 w = uRot * nv;
  float lat = degrees(asin(clamp(w.y, -1.0, 1.0)));
  float lon = degrees(atan(w.x, w.z));
  float sunDot = dot(w, uSun);
  float day = smoothstep(-0.12, 0.18, sunDot);
  float lambert = clamp(sunDot, 0.0, 1.0);
  // the ocean: deep blue by day, near black by night, with the sun's glint
  vec3 col = mix(vec3(0.012, 0.02, 0.05), vec3(0.04, 0.14, 0.32) * (0.45 + 0.75 * lambert), day);
  vec3 h = normalize(sunV + vec3(0.0, 0.0, 1.0));
  float glint = pow(max(dot(nv, h), 0.0), 140.0) * day;
  // the land as a grid of dots, evenly spaced over the sphere
  float S = 1.15;
  float row = floor((lat + 90.0) / S);
  float latc = row * S + S * 0.5 - 90.0;
  float count = max(1.0, floor(360.0 * cos(radians(latc)) / S));
  float col_i = floor((lon + 180.0) / 360.0 * count);
  float lonc = (col_i + 0.5) / count * 360.0 - 180.0;
  float isLand = step(0.5, landAt(latc, lonc));
  float dd = length(vec2(lat - latc, (lon - lonc) * cos(radians(lat))));
  float pxDeg = 57.3 / (uR * max(nv.z, 0.2));
  float dotR = S * 0.34;
  float dotA = smoothstep(dotR + pxDeg * 0.7, dotR - pxDeg * 0.7, dd) * isLand;
  // the land also tints the ground under the dots a little, so coasts read at a glance
  float landSoft = landAt(lat, lon);
  col = mix(col, col * 1.25 + vec3(0.02, 0.03, 0.04) * day, landSoft * 0.6);
  vec3 dayDot = vec3(0.72, 0.84, 0.96) * (0.35 + 0.75 * lambert);
  // by night, some of the land dots are towns, warm and flickering a touch
  float town = step(0.84, hash(vec2(row, col_i))) * (0.8 + 0.2 * sin(uT * 3.0 + hash(vec2(col_i, row)) * 30.0));
  vec3 nightDot = mix(vec3(0.14, 0.18, 0.3), vec3(1.0, 0.74, 0.4), town);
  col = mix(col, mix(nightDot, dayDot, day), dotA);
  col += vec3(1.0, 0.95, 0.85) * glint * (1.0 - landSoft) * 0.55;
  // the atmosphere at the rim
  float rim = pow(1.0 - nv.z, 3.0);
  col += vec3(0.3, 0.55, 1.0) * rim * (0.25 + 0.75 * day) * 0.9;
  // the terminator glows faintly orange
  col += vec3(0.6, 0.25, 0.05) * exp(-pow(sunDot / 0.06, 2.0)) * 0.12;
  float aa = clamp((1.0 - sqrt(r2)) * uR + 0.5, 0.0, 1.0);
  gl_FragColor = vec4(col * aa, aa);
}`;
function makeGlobe(canvas: HTMLCanvasElement, land: Uint8Array) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return null;
  const sh = (t: number, s: string) => {
    const x = gl.createShader(t)!;
    gl.shaderSource(x, s);
    gl.compileShader(x);
    return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null;
  };
  const vs = sh(gl.VERTEX_SHADER, GLOBE_VS),
    fs = sh(gl.FRAGMENT_SHADER, GLOBE_FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram()!;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.bindAttribLocation(prog, 0, "p");
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, LAND_W, LAND_H, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, land);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  gl.uniform1i(u("uLand"), 0);
  const U = { res: u("uRes"), dpr: u("uDpr"), r: u("uR"), t: u("uT"), rot: u("uRot"), sun: u("uSun") };
  return {
    render(o: { W: number; H: number; dpr: number; R: number; m: number[]; sun: V3; t: number }) {
      const w = Math.round(o.W * o.dpr),
        h = Math.round(o.H * o.dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
      gl.uniform2f(U.res, o.W, o.H);
      gl.uniform1f(U.dpr, o.dpr);
      gl.uniform1f(U.r, o.R);
      gl.uniform1f(U.t, o.t);
      // the view matrix's rows, handed over as columns, is its transpose: view to world
      gl.uniformMatrix3fv(U.rot, false, new Float32Array(o.m));
      gl.uniform3f(U.sun, o.sun[0], o.sun[1], o.sun[2]);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    dispose() {
      gl.deleteTexture(tex);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
    },
  };
}
```

--- components/airmail-globe/index.ts ---

```ts
export { default as AirmailGlobe } from "./airmail-globe";
export type { AirmailGlobeProps } from "./airmail-globe";
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
