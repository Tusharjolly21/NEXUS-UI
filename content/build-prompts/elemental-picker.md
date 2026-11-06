# Elemental Picker

Add the "Elemental Picker" component from Nexus UI to my project.

Elemental Picker: a set of mode capsules where the chosen one comes alive. Choose Ember and the capsule catches fire: flames lick up its sides, embers fly and smoke curls off the top. Solar throws long rays that turn slowly behind it, Bloom showers it in petals that flutter down and settle, and Breeze sends wind streaks curling past with tumbling leaves while the capsule sways in the gusts. The old element dies down as the new one starts, and everything is reflected in a glossy floor. Keyboard: it's a radio group. Arrow keys move the choice; Tab leaves.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { ElementalPicker } from "@/components/elemental-picker";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/elemental-picker/elemental-picker.tsx ---

```tsx
"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons via Iconify, inlined so the file has no icon dependency: Framework7 Icons (MIT) and Phosphor (MIT).
const ICON = {
  bloom: { vb: 256, body: "<path fill=\"currentColor\" d=\"M208 48a87.5 87.5 0 0 0-35.36 7.43c-15.1-25.37-39.92-38-41.06-38.59a8 8 0 0 0-7.16 0c-1.14.58-26 13.22-41.06 38.59A87.5 87.5 0 0 0 48 48a8 8 0 0 0-8 8v40a88.11 88.11 0 0 0 80 87.63v35.43l-36.42-18.22a8 8 0 1 0-7.16 14.32l48 24a8 8 0 0 0 7.16 0l48-24a8 8 0 0 0-7.16-14.32L136 219.06v-35.43A88.11 88.11 0 0 0 216 96V56a8 8 0 0 0-8-8M56 96V64.44A72.1 72.1 0 0 1 120 136v31.56A72.1 72.1 0 0 1 56 96m144 0a72.1 72.1 0 0 1-64 71.56V136a72.1 72.1 0 0 1 64-71.56Z\"/>" },
  ember: { vb: 56, body: "<path fill=\"currentColor\" d=\"M8.125 37.398c0 9.516 7.781 16.243 18.75 16.243c12.445 0 21-8.04 21-21.258c0-20.625-18.094-30.024-31.289-30.024c-2.086 0-3.117 1.032-3.117 2.227c0 .96.515 1.758 1.289 2.86c1.875 2.577 5.062 6.327 5.062 11.038c0 .399-.023.797-.07 1.22c-1.312-2.462-3.633-4.196-6.445-4.196c-.797 0-1.219.469-1.219 1.148c0 .82.187 1.407.187 3.961c0 4.899-4.148 8.203-4.148 16.781m19.219 9.657c-4.688 0-7.805-2.836-7.805-7.055c0-4.43 3.14-6 3.563-8.86c.023-.234.187-.304.351-.14c1.172 1.008 1.899 2.273 2.461 3.727c.117.257.305.28.422.07c1.289-2.25 1.523-5.602 1.219-9.82c-.047-.235.117-.352.328-.258c5.555 2.531 8.39 8.039 8.39 12.984c0 4.969-2.93 9.352-8.93 9.352\"/>" },
  solar: { vb: 56, body: "<path fill=\"currentColor\" d=\"M30.04 4.61c0-1.102-.938-2.04-2.04-2.04s-2.039.938-2.039 2.04v4.92c0 1.102.938 2.04 2.04 2.04c1.1 0 2.038-.938 2.038-2.04Zm9.538 8.929c-.773.797-.773 2.11 0 2.883c.797.797 2.086.82 2.906 0l3.493-3.492a2.065 2.065 0 0 0 0-2.907c-.774-.773-2.086-.773-2.883 0Zm-26.062 2.883c.773.797 2.086.797 2.882 0c.774-.75.774-2.11.024-2.883l-3.492-3.516c-.75-.75-2.086-.773-2.883 0c-.774.774-.774 2.11-.024 2.883ZM28 16.047c-6.539 0-11.953 5.414-11.953 11.953S21.46 39.977 28 39.977c6.516 0 11.93-5.438 11.93-11.977S34.516 16.047 28 16.047m23.32 13.992c1.102 0 2.04-.937 2.04-2.039s-.938-2.04-2.04-2.04h-4.898c-1.102 0-2.04.938-2.04 2.04s.938 2.039 2.04 2.039ZM4.68 25.961c-1.102 0-2.04.937-2.04 2.039s.938 2.039 2.04 2.039h4.898c1.102 0 2.04-.937 2.04-2.039s-.938-2.04-2.04-2.04ZM42.46 39.6a2.08 2.08 0 0 0-2.883 0c-.773.774-.773 2.087 0 2.883L43.094 46c.797.773 2.11.75 2.883-.023c.797-.774.797-2.086 0-2.883Zm-32.437 3.47c-.797.773-.797 2.109-.024 2.882c.774.774 2.11.797 2.906.024l3.492-3.493c.774-.773.774-2.086.024-2.882c-.774-.774-2.11-.774-2.906 0Zm20.015 3.398c0-1.102-.937-2.04-2.039-2.04s-2.039.938-2.039 2.04v4.922c0 1.101.938 2.039 2.04 2.039c1.1 0 2.038-.938 2.038-2.04Z\"/>" },
  breeze: { vb: 56, body: "<path fill=\"currentColor\" d=\"M6.156 21.285c3.375-1.078 6.868-1.617 10.196-1.617c4.312 0 7.476.68 11.554.68c4.219 0 6.844-2.86 6.844-6.586c0-3.82-2.93-6.54-6.539-6.54c-2.672 0-5.016 1.665-6 3.891c-.375.774-.234 1.688.586 2.11c.75.375 1.664.14 2.156-.82c.516-1.196 1.781-2.133 3.258-2.133c1.945 0 3.469 1.359 3.469 3.492S30.203 17.3 27.906 17.3c-3.89 0-7.101-.703-11.554-.703c-3.82 0-7.688.68-11.133 1.78c-.985.282-1.36 1.126-1.125 1.946c.234.797 1.008 1.266 2.062.961m36.657 10.969c5.46 0 9.328-3.469 9.328-8.32c0-4.782-3.68-8.25-8.25-8.25c-4.242 0-7.383 2.953-7.946 6.843c-.14.961.399 1.735 1.242 1.852c.868.117 1.618-.422 1.805-1.524c.399-2.437 2.438-4.125 4.899-4.125c2.86 0 5.18 2.133 5.18 5.204c0 3.117-2.461 5.273-6.258 5.273c-7.149 0-14.86-4.078-24.235-4.078c-4.828 0-9.234.773-13.36 2.25c-.96.328-1.359 1.148-1.124 1.969c.234.797 1.031 1.289 2.062.937c3.82-1.453 7.805-2.086 12.422-2.086c9.352 0 16.336 4.055 24.235 4.055M27.93 48.777c3.61 0 6.398-2.672 6.398-6.492c0-5.531-5.648-8.625-16.055-8.625c-4.359 0-9.07.844-13.054 2.227c-.961.328-1.36 1.148-1.125 1.968c.234.797 1.031 1.29 2.062.938c3.727-1.336 7.899-2.062 12.118-2.062c8.507 0 13.007 2.132 13.007 5.554c0 2.156-1.5 3.446-3.351 3.446c-1.852 0-2.977-1.243-3.305-3.212c-.14-.867-.773-1.57-1.781-1.5c-1.055.07-1.477.962-1.336 1.899c.422 3.258 2.836 5.86 6.422 5.86\"/>" },
} as const;

export type ElementName = "bloom" | "ember" | "solar" | "breeze";
export type ElementOption = { id: ElementName; label: string; hint: string };

export type ElementalPickerProps = {
  /** the choices, in order; any of bloom, ember, solar and breeze */
  options?: ElementOption[];
  value?: ElementName;
  defaultValue?: ElementName;
  onChange?: (value: ElementName) => void;
  title?: string;
  subtitle?: string;
  /** Demo itself until someone touches it. Off by default. */
  autoplay?: boolean;
  className?: string;
};

const DEMO: ElementOption[] = [
  { id: "bloom", label: "Bloom", hint: "Gentle" },
  { id: "ember", label: "Ember", hint: "Bold" },
  { id: "solar", label: "Solar", hint: "Bright" },
  { id: "breeze", label: "Breeze", hint: "Light" },
];

// each element's colours: the capsule's glow inside, the floor light, and the label
// `ink` is the label colour once chosen: the gradient is lightest at the bottom, where the label sits.
const LOOK: Record<ElementName, { inner: string; floor: string; ring: string; ink: string }> = {
  bloom: { inner: "radial-gradient(120% 90% at 50% 100%, #ff8fb1 0%, #e0487a 45%, #4a1426 100%)", floor: "255,120,170", ring: "rgba(255,170,200,.75)", ink: "#3d0a1f" },
  ember: { inner: "radial-gradient(120% 90% at 50% 100%, #ffd36b 0%, #ff6a1a 40%, #5a1206 100%)", floor: "255,110,30", ring: "rgba(255,190,120,.8)", ink: "#3a1203" },
  solar: { inner: "radial-gradient(120% 90% at 50% 100%, #fff3c4 0%, #ffc43d 42%, #5c3a05 100%)", floor: "255,200,80", ring: "rgba(255,236,170,.85)", ink: "#3a2400" },
  breeze: { inner: "radial-gradient(120% 90% at 50% 100%, #c8fff0 0%, #34c8a8 45%, #083a33 100%)", floor: "90,230,200", ring: "rgba(180,255,235,.75)", ink: "#04302a" },
};

// ─── The elements ──────────────────────────────────────────────────────────────
// One canvas over the capsules draws whichever element is alive, plus its reflection in the glossy floor.
// Fire: soft additive flames licking up the capsule's outline, embers flying, smoke curling off the top.
// Sun: long rays turning slowly behind it, a halo and twinkling sparkles. Bloom: petals that flutter down and
// settle. Breeze: wind streaks curling past with tumbling leaves, and the capsule sways in the gusts.

type P = { k: "flame" | "ember" | "smoke" | "petal" | "spark" | "streak" | "leaf"; x: number; y: number; vx: number; vy: number; life: number; age: number; size: number; rot: number; vr: number; seed: number; tint: number; trail?: { x: number; y: number }[] };
type Box = { x: number; y: number; w: number; h: number };

function sprite(r: number, g: number, b: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, `rgba(${r},${g},${b},1)`);
  gr.addColorStop(0.35, `rgba(${r},${g},${b},.55)`);
  gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr;
  x.fillRect(0, 0, 64, 64);
  return c;
}
const PETALS = ["#ffd3df", "#ffb1c8", "#fff1f5", "#ff8db0", "#ffc6d6"];
const LEAVES = ["#7be3a0", "#4fc37f", "#a8f0c0"];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

const STOP = Symbol("stop");

/**
 * Elemental Picker: a set of mode capsules where the chosen one comes alive.
 * Choose Ember and the capsule catches fire: flames lick up its sides, embers fly and smoke curls off the top.
 * Solar throws long rays that turn slowly behind it, Bloom showers it in petals that flutter down and settle, and
 * Breeze sends wind streaks curling past with tumbling leaves while the capsule sways in the gusts. The old element
 * dies down as the new one starts, and everything is reflected in a glossy floor.
 * Keyboard: it's a radio group. Arrow keys move the choice; Tab leaves.
 */
export function ElementalPicker({ options = DEMO, value: valueProp, defaultValue = "ember", onChange, title = "Choose a tone", subtitle = "Sets the mood of every answer.", autoplay = false, className = "" }: ElementalPickerProps) {
  const reduced = !!useReducedMotion();
  const [own, setOwn] = useState<ElementName>(defaultValue);
  const value = valueProp ?? own;
  const valueRef = useRef(value);
  valueRef.current = value;
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const caps = useRef(new Map<ElementName, HTMLButtonElement>());
  const floorRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const sway = useMotionValue(0);
  const swaySpring = useSpring(sway, { stiffness: 120, damping: 9 });
  const burst = useRef<{ el: ElementName; t: number } | null>(null);

  const choose = useCallback(
    (v: ElementName) => {
      if (v === valueRef.current) return;
      if (valueProp === undefined) setOwn(v);
      valueRef.current = v;
      burst.current = { el: v, t: performance.now() };
      onChange?.(v);
    },
    [onChange, valueProp],
  );

  // ─── the particles ───
  useEffect(() => {
    const cv = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const ctx = cv.getContext("2d")!;
    const S = { white: sprite(255, 246, 220), yellow: sprite(255, 214, 110), orange: sprite(255, 120, 30), red: sprite(220, 40, 10), smoke: sprite(70, 66, 64), gold: sprite(255, 220, 120), pink: sprite(255, 150, 190), mint: sprite(140, 255, 220) };
    let ps: P[] = [];
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    let rayA = 0;
    const box = (): Box | null => {
      const el = caps.current.get(valueRef.current);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const b = root.getBoundingClientRect();
      return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
    };
    const floorY = () => {
      const f = floorRef.current;
      if (!f) return root.clientHeight * 0.8;
      return f.getBoundingClientRect().top - root.getBoundingClientRect().top;
    };
    /** a point on the capsule's outline, from the top cap down its sides to fraction `down` */
    const onEdge = (bx: Box, down: number) => {
      const r = bx.w / 2;
      const len = Math.PI * r + 2 * (bx.h * down - r);
      let s = Math.random() * len;
      if (s < Math.PI * r) {
        const a = Math.PI + s / r;
        return { x: bx.x + r + Math.cos(a) * r, y: bx.y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) };
      }
      s -= Math.PI * r;
      const side = s < (len - Math.PI * r) / 2 ? -1 : 1;
      const yy = (s % ((len - Math.PI * r) / 2)) + r;
      return { x: bx.x + r + side * r, y: bx.y + yy, nx: side, ny: 0 };
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      raf = requestAnimationFrame(frame);
      if (!inViewRef.current || document.hidden) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const W = root.clientWidth;
      const H = root.clientHeight;
      if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      }
      const bx = box();
      const el = valueRef.current;
      const t = (now - t0) / 1000;
      const k = dt * 60;
      const fy = floorY();
      const calm = reduced ? 0.35 : 1;
      // ── emit ──
      if (bx) {
        const cx = bx.x + bx.w / 2;
        const fresh = burst.current && burst.current.el === el && now - burst.current.t < 500 ? 1 - (now - burst.current.t) / 500 : 0;
        if (el === "ember") {
          const rate = (3.4 + fresh * 9) * k * calm;
          const n = Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
          for (let i = 0; i < n; i++) {
            const e = onEdge(bx, 0.5);
            ps.push({ k: "flame", x: e.x - e.nx * 3, y: e.y + 6, vx: e.nx * 0.35 + (Math.random() - 0.5) * 0.3, vy: -0.9 - Math.random() * 1.2 - fresh * 1.5, life: 0.5 + Math.random() * 0.45, age: 0, size: 10 + Math.random() * 10 + (e.ny < -0.6 ? 7 : 0), rot: 0, vr: 0, seed: Math.random() * 99, tint: 0 });
          }
          if (Math.random() < 0.25 * k * calm || fresh > 0.5) ps.push({ k: "ember", x: cx + (Math.random() - 0.5) * bx.w * 0.8, y: bx.y + 10, vx: (Math.random() - 0.5) * 1.6, vy: -2.4 - Math.random() * 2.4, life: 1 + Math.random(), age: 0, size: 1.5 + Math.random() * 1.6, rot: 0, vr: 0, seed: Math.random() * 99, tint: 0 });
        } else if (el === "solar") {
          if (Math.random() < 0.18 * k * calm || fresh > 0.4) {
            const a = Math.random() * Math.PI * 2;
            const d = bx.w * 0.6 + Math.random() * 70;
            ps.push({ k: "spark", x: cx + Math.cos(a) * d, y: bx.y + bx.h * 0.45 + Math.sin(a) * d * 1.2, vx: 0, vy: -0.15, life: 0.9 + Math.random() * 0.8, age: 0, size: 3 + Math.random() * 4, rot: Math.random(), vr: 0, seed: Math.random() * 99, tint: 0 });
          }
        } else if (el === "bloom") {
          const rate = (0.32 + fresh * 2) * k * calm;
          for (let i = 0; i < Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0); i++)
            ps.push({ k: "petal", x: cx + (Math.random() - 0.5) * (bx.w + 110), y: bx.y - 30 - Math.random() * 40, vx: (Math.random() - 0.5) * 0.6, vy: 0.4 + Math.random() * 0.5, life: 6, age: 0, size: 5 + Math.random() * 4, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.08, seed: Math.random() * 99, tint: Math.floor(Math.random() * PETALS.length) });
        } else if (el === "breeze") {
          if (Math.random() < (0.3 + fresh * 1.2) * k * calm)
            ps.push({ k: "streak", x: bx.x - 120 - Math.random() * 80, y: bx.y - 10 + Math.random() * (bx.h + 20), vx: 4.5 + Math.random() * 3, vy: 0, life: 1.4, age: 0, size: 1.2 + Math.random() * 1, rot: 0, vr: 0, seed: Math.random() * 99, tint: 0, trail: [] });
          if (Math.random() < (0.07 + fresh * 0.5) * k * calm)
            ps.push({ k: "leaf", x: bx.x - 100, y: bx.y + Math.random() * bx.h, vx: 2.6 + Math.random() * 2, vy: (Math.random() - 0.5) * 1, life: 2.6, age: 0, size: 5 + Math.random() * 4, rot: Math.random() * 6.28, vr: 0.1 + Math.random() * 0.15, seed: Math.random() * 99, tint: Math.floor(Math.random() * LEAVES.length) });
          sway.set(Math.sin(t * 1.9) * 2.2 + Math.sin(t * 4.3) * 0.8);
        }
        if (el !== "breeze") sway.set(0);
      }
      // ── move ──
      ps = ps.filter((p) => {
        p.age += dt;
        if (p.age > p.life) return false;
        const u = p.age / p.life;
        if (p.k === "flame") {
          p.vx += Math.sin(t * 6 + p.seed + p.y * 0.05) * 0.06 * k;
          p.vy -= 0.02 * k;
          if (u > 0.75 && Math.random() < 0.05) ps.push({ k: "smoke", x: p.x, y: p.y, vx: p.vx * 0.4, vy: -0.6, life: 1.4, age: 0, size: p.size * 0.9, rot: 0, vr: 0, seed: p.seed, tint: 0 });
        } else if (p.k === "ember") {
          p.vx += Math.sin(t * 5 + p.seed) * 0.05 * k;
          p.vy += 0.02 * k;
        } else if (p.k === "smoke") {
          p.vx += Math.sin(t * 2 + p.seed) * 0.02 * k;
          p.size += 0.35 * k;
        } else if (p.k === "petal") {
          p.vx += Math.sin(t * 2.4 + p.seed) * 0.03 * k;
          p.vy = Math.min(p.vy + 0.004 * k, 1.1);
          if (p.y > fy - 3) {
            p.y = fy - 3;
            p.vy = 0;
            p.vx *= 0.8;
            p.vr *= 0.8;
            p.life = Math.min(p.life, p.age + 1.2); // it settles, then fades
          }
        } else if (p.k === "streak") {
          p.trail!.push({ x: p.x, y: p.y });
          if (p.trail!.length > 24) p.trail!.shift();
          // it curls round the capsule as it passes
          p.vy = Math.sin(p.x * 0.03 + p.seed) * 1.8;
        } else if (p.k === "leaf") {
          p.vy += Math.sin(t * 4 + p.seed) * 0.1 * k;
        }
        p.x += p.vx * k;
        p.y += p.vy * k;
        p.rot += p.vr * k;
        return true;
      });
      if (ps.length > 700) ps = ps.slice(ps.length - 700);

      // ── draw ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const drawAll = (mirror: boolean) => {
        ctx.save();
        if (mirror) {
          ctx.translate(0, fy * 2);
          ctx.scale(1, -1);
          ctx.globalAlpha = 0.22;
        }
        const base = mirror ? 0.22 : 1;
        // sun rays behind
        if (el === "solar" && bx) {
          rayA += dt * 0.18 * calm;
          const cx = bx.x + bx.w / 2;
          const cy = bx.y + bx.h * 0.45;
          const grow = burst.current && burst.current.el === "solar" ? clamp((now - burst.current.t) / 600) : 1;
          ctx.globalCompositeOperation = "lighter";
          for (let i = 0; i < 16; i++) {
            const a = rayA + (i / 16) * Math.PI * 2;
            const len = (110 + 50 * Math.sin(t * 1.3 + i * 1.7)) * grow * (i % 2 ? 0.7 : 1);
            const wd = 0.07;
            const g = ctx.createRadialGradient(cx, cy, bx.w * 0.3, cx, cy, len + bx.w * 0.4);
            g.addColorStop(0, `rgba(255,220,130,${0.38 * base})`);
            g.addColorStop(1, "rgba(255,200,90,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a - wd) * (len + bx.w * 0.4), cy + Math.sin(a - wd) * (len + bx.w * 0.4));
            ctx.lineTo(cx + Math.cos(a + wd) * (len + bx.w * 0.4), cy + Math.sin(a + wd) * (len + bx.w * 0.4));
            ctx.closePath();
            ctx.fill();
          }
          const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, bx.h * 0.9);
          halo.addColorStop(0, `rgba(255,236,170,${0.45 * base})`);
          halo.addColorStop(1, "rgba(255,200,90,0)");
          ctx.fillStyle = halo;
          ctx.fillRect(cx - bx.h, cy - bx.h, bx.h * 2, bx.h * 2);
          ctx.globalCompositeOperation = "source-over";
        }
        for (const p of ps) {
          const u = p.age / p.life;
          if (p.k === "flame") {
            ctx.globalCompositeOperation = "lighter";
            const spr = u < 0.12 ? S.yellow : u < 0.55 ? S.orange : S.red;
            const s = p.size * (1 - u * 0.55);
            ctx.globalAlpha = base * (u < 0.1 ? u * 10 : 1 - u) * 0.58;
            ctx.drawImage(spr, p.x - s, p.y - s, s * 2, s * 2);
          } else if (p.k === "ember") {
            ctx.globalCompositeOperation = "lighter";
            ctx.globalAlpha = base * (1 - u);
            ctx.drawImage(S.yellow, p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6);
          } else if (p.k === "smoke") {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = base * 0.16 * (1 - u);
            ctx.drawImage(S.smoke, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
          } else if (p.k === "spark") {
            ctx.globalCompositeOperation = "lighter";
            const tw = Math.sin(u * Math.PI);
            ctx.globalAlpha = base * tw;
            ctx.strokeStyle = "rgba(255,240,190,1)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(p.x - p.size * tw, p.y);
            ctx.lineTo(p.x + p.size * tw, p.y);
            ctx.moveTo(p.x, p.y - p.size * tw * 1.4);
            ctx.lineTo(p.x, p.y + p.size * tw * 1.4);
            ctx.stroke();
            ctx.drawImage(S.gold, p.x - 6, p.y - 6, 12, 12);
          } else if (p.k === "petal") {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = base * Math.min(1, (p.life - p.age) / 0.6, p.age / 0.3);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.scale(1, 0.55 + 0.45 * Math.sin(p.age * 3 + p.seed)); // it turns over as it falls
            ctx.fillStyle = PETALS[p.tint];
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(200,60,110,.25)";
            ctx.beginPath();
            ctx.ellipse(-p.size * 0.55, 0, p.size * 0.35, p.size * 0.22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          } else if (p.k === "streak" && p.trail && p.trail.length > 2) {
            ctx.globalCompositeOperation = "lighter";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const tail = p.trail[0];
            const head = p.trail[p.trail.length - 1];
            const g = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
            g.addColorStop(0, "rgba(210,255,240,0)");
            g.addColorStop(1, "rgba(225,255,248,.9)");
            ctx.globalAlpha = base * 0.6 * Math.sin(Math.PI * clamp(u * 1.1));
            ctx.strokeStyle = g;
            ctx.lineWidth = p.size * 1.5;
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.stroke();
          } else if (p.k === "leaf") {
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = base * Math.sin(Math.PI * u);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = LEAVES[p.tint];
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * 0.42, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(20,90,50,.5)";
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.stroke();
            ctx.restore();
          }
        }
        ctx.restore();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      };
      drawAll(false);
      // the reflection, clipped to the floor
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, fy, W, H - fy);
      ctx.clip();
      drawAll(true);
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced, sway]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = options.findIndex((o) => o.id === value);
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % options.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + options.length) % options.length;
    else return;
    e.preventDefault();
    choose(options[n].id);
    caps.current.get(options[n].id)?.focus();
  };

  // ─── Autoplay: a ghost finger tries each element in turn ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease: [0.4, 0, 0.2, 1], onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    const ORDER: ElementName[] = ["solar", "bloom", "breeze", "ember"];
    (async () => {
      await wait(2600);
      let i = 0;
      while (alive) {
        const el = ORDER[i++ % ORDER.length];
        const c = caps.current.get(el);
        if (!c) {
          await wait(500);
          continue;
        }
        const r = c.getBoundingClientRect();
        const b = root.getBoundingClientRect();
        const x = r.left - b.left + r.width / 2;
        const y = r.top - b.top + r.height * 0.62;
        if (go.get() < 0.5) {
          gx.set(x + 30);
          gy.set(y + 50);
          await run(go, 1, 0.25);
        }
        await Promise.all([run(gx, x, 0.55), run(gy, y, 0.55)]);
        await run(gs, 0.8, 0.1);
        choose(el);
        await run(gs, 1, 0.16);
        await run(go, 0, 0.3);
        await wait(3200);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const look = LOOK[value];
  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[640px] select-none overflow-hidden rounded-[28px] bg-[#09090b] px-5 pb-6 pt-8 text-center text-white shadow-[0_0_0_1px_rgba(255,255,255,.06),0_24px_48px_-24px_rgba(0,0,0,.6)] sm:px-8 ${className}`}
    >
      {/* the floor light under the chosen capsule */}
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]" animate={{ background: `radial-gradient(50% 60% at 50% 40%, rgba(${look.floor},.22), rgba(${look.floor},0) 70%)` }} transition={{ duration: 0.6 }} />
      <h3 className="relative m-0 text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className="relative m-0 mt-1 text-[14px] text-white/55">{subtitle}</p>

      <div role="radiogroup" aria-label={title} onKeyDown={onKey} className="relative z-10 mx-auto mt-10 flex justify-center gap-3 sm:gap-5">
        {options.map((o) => {
          const on = o.id === value;
          const L = LOOK[o.id];
          return (
            <div key={o.id} className="relative">
            <motion.button
              ref={(el) => {
                if (el) caps.current.set(o.id, el);
                else caps.current.delete(o.id);
              }}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(o.id)}
              animate={{ y: on ? -6 : 0, scale: on ? 1.05 : 1 }}
              whileHover={on ? undefined : { y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              style={on && o.id === "breeze" ? { rotate: swaySpring } : undefined}
              className="group relative h-[128px] w-[68px] overflow-hidden rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] sm:h-[152px] sm:w-[84px]"
            >
              {/* the dark glass */}
              <span aria-hidden="true" className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#232327,#111113)] shadow-[inset_0_1px_0_rgba(255,255,255,.14),inset_0_0_0_1px_rgba(255,255,255,.06)]" />
              {/* the element's light inside it */}
              <motion.span aria-hidden="true" className="absolute inset-0 rounded-full" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 0.45 }} style={{ backgroundImage: L.inner }} />
              <motion.span
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                initial={false}
                animate={on ? { opacity: [0.85, 1, 0.9, 1], boxShadow: `inset 0 0 0 1.5px ${L.ring}, 0 0 34px -4px rgba(${L.floor},.75)` } : { opacity: 1, boxShadow: "inset 0 0 0 0px rgba(255,255,255,0), 0 0 0 0 rgba(0,0,0,0)" }}
                transition={on ? { opacity: { duration: 1.6, repeat: Infinity, ease: "easeInOut" }, boxShadow: { duration: 0.4 } } : { duration: 0.3 }}
              />
              <span className="relative flex h-full flex-col items-center justify-end pb-5 sm:pb-6">
                <svg viewBox={`0 0 ${ICON[o.id].vb} ${ICON[o.id].vb}`} width={22} height={22} aria-hidden="true" className={`mb-auto mt-6 transition-colors sm:mt-7 ${on ? "text-white" : "text-white/55 group-hover:text-white/80"}`} dangerouslySetInnerHTML={{ __html: ICON[o.id].body }} />
                <span className={`text-[13px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${on ? "" : "text-white/80"}`} style={on ? { color: L.ink } : undefined}>{o.label}</span>
                <span className={`mt-0.5 text-[11px] font-medium transition-colors duration-300 ${on ? "" : "text-white/45"}`} style={on ? { color: L.ink, opacity: 0.78 } : undefined}>{o.hint}</span>
              </span>
            </motion.button>
            {/* its reflection in the floor */}
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute left-0 top-[calc(100%+30px)] h-[70%] w-full rounded-full [mask-image:linear-gradient(to_bottom,rgba(0,0,0,.5),transparent_75%)]"
              initial={false}
              animate={{ opacity: on ? 0.55 : 0.28, y: on ? 6 : 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 22 }}
              style={{ backgroundImage: on ? L.inner.replace("at 50% 100%", "at 50% 0%") : "linear-gradient(0deg,#232327,#111113)" }}
            />
            </div>
          );
        })}
      </div>
      {/* the glossy floor the capsules stand on */}
      <div ref={floorRef} aria-hidden="true" className="relative mx-auto mt-5 h-px w-[88%] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div aria-hidden="true" className="h-[64px]" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 h-full w-full"
        // sparks and streaks fade out before they reach the heading, so the title stays readable
        style={{ maskImage: "linear-gradient(to bottom, transparent 64px, #000 128px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 64px, #000 128px)" }}
      />
      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/80 bg-white/10 shadow-[0_4px_14px_rgba(0,0,0,.3)]"
      />
    </div>
  );
}
```

--- components/elemental-picker/index.ts ---

```ts
export { ElementalPicker } from "./elemental-picker";
export type { ElementName, ElementOption, ElementalPickerProps } from "./elemental-picker";
```
