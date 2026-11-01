# Web Sling Button

Add the "Web Sling Button" component from Nexus UI to my project.

A red call-to-action button on a light stage where the cursor is a web-shooter. Click anywhere and a line of silk splats onto the button in a burst of flung fibres and glue; hold and pull and it drags and tilts the button on stretching silk beaded with glue knots. Let go and the line dangles and swings, and pull too far and it snaps and frays. A web fluid meter drains with every shot and refills slowly, and a counter keeps score of shots fired.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. It uses `@/lib/ui-sounds` for its interaction sounds, which are synthesised in the browser, so no audio files are needed. Create it at lib/ from the file below.
6. Use it like this: `import { WebSlingButton } from "@/components/web-sling-button";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/web-sling-button/index.ts ---

```ts
export { WebSlingButton } from "./web-sling-button";
export type { WebSlingButtonProps } from "./web-sling-button";
```

--- components/web-sling-button/web-sling-button.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { audioAwake, hiss, playDef, tone, useAutoplaySoundAllowed, type SoundDef } from "@/lib/ui-sounds";

const N = 22; // points per strand
const MAX = 7; // strands at once

type Strand = {
  x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array;
  /** Anchor on the button, relative to its centre, before the button turns. */
  ax: number; ay: number;
  /** Resting length of each link. */
  rest: number;
  state: "flying" | "held" | "dangling" | "falling";
  t: number;
  age: number;
  seed: number;
  /** Where the fibres of the splat grip the button, relative to the anchor. */
  fibers: [number, number][];
  /** Spokes of the splat: angle and length. */
  spokes: [number, number][];
  /** The fibres the line is spun from: lateral offset, waviness, phase, width, opacity, loose. */
  fib: { off: number; freq: number; phase: number; w: number; a: number; loose: boolean; speed: number }[];
  /** A messy splat: fibres flung out from the hit, with a curve and maybe a branch. */
  splat: { ang: number; len: number; curve: number; w: number; a: number; branch: number }[];
  /** Threads strung between neighbouring splat fibres: fibre, fraction, fibre, fraction. */
  cross: [number, number, number, number][];
  /** Where along the line the fibres are glued together into knots (0 to 1). */
  knots: number[];
  /** How much the free end has frayed (after a snap). */
  fray: number;
  sx: number; sy: number; // where it was fired from
  stretch: number;
  alpha: number;
  /** Age when it struck, and the direction it was travelling in button space. */
  hitAge: number;
  dIn: [number, number];
  /** Fired by the autoplay ghost, so its sounds wait for the visitor to have used the page. */
  ghost: boolean;
  /** The highest creak step played while pulled. */
  creaks: number;
};

/*
 * Sounds, synthesised with the Web Audio API (no files). Each one is built fresh with a little random
 * spread in pitch and length, so a run of shots never sounds like the same sample on repeat.
 */
const jit = (k = 0.12) => 1 + (Math.random() * 2 - 1) * k;
const def = (label: string, play: SoundDef["play"]): SoundDef => ({ category: "Web", label, play });
const SFX = {
  /** The shot: a short, pressurised burst of air through the nozzle, rising then dropping away. */
  thwip: () => {
    const r = jit();
    return def("Thwip", (c, o) => {
      hiss(c, o, { attack: 0.004, decay: 0.016, freq: 7000 * r, gain: 0.16, filter: "highpass" });
      hiss(c, o, { attack: 0.006, decay: 0.085 * jit(0.2), freq: 2600 * r, to: 900 * r, gain: 0.32, q: 1.6 });
      hiss(c, o, { at: 0.012, attack: 0.01, decay: 0.07, freq: 5200 * r, to: 1800, gain: 0.12, q: 3 });
      tone(c, o, { freq: 190 * r, to: 95, decay: 0.045, gain: 0.12 });
    });
  },
  /** Out of fluid: the trigger clicks on an empty cartridge and coughs a tiny puff. */
  dry: () =>
    def("Dry click", (c, o) => {
      hiss(c, o, { decay: 0.007, freq: 6500, gain: 0.22, filter: "highpass" });
      tone(c, o, { freq: 1500 * jit(0.05), decay: 0.012, gain: 0.05, type: "square" });
      hiss(c, o, { at: 0.02, attack: 0.008, decay: 0.05, freq: 1300, gain: 0.05, q: 0.8 });
    }),
  /** The line lands and grabs the button: a wet, sticky slap with a crackle of glue after it. */
  splat: (force: number) => {
    const r = jit(0.08);
    return def("Splat", (c, o) => {
      hiss(c, o, { attack: 0.002, decay: 0.06, freq: 1100 * r, to: 260, gain: 0.34 * force, filter: "lowpass", q: 0.7 });
      tone(c, o, { freq: 150 * r, to: 72, decay: 0.08, gain: 0.3 * force });
      hiss(c, o, { attack: 0.002, decay: 0.012, freq: 3400 * r, gain: 0.12 * force, q: 2.5 });
      for (let k = 0; k < 4; k++) hiss(c, o, { at: 0.03 + k * 0.022 + Math.random() * 0.012, decay: 0.008, freq: 2500 + Math.random() * 2500, gain: 0.05 * force, q: 4 });
    });
  },
  /** Under tension the silk creaks, a little higher the further it is pulled. */
  creak: (stretch: number) =>
    def("Creak", (c, o) => {
      const f = 240 + (stretch - 1) * 420;
      tone(c, o, { freq: f, to: f * 1.18, attack: 0.012, decay: 0.07, gain: 0.05, type: "triangle" });
      hiss(c, o, { attack: 0.01, decay: 0.07, freq: f * 3, gain: 0.07, q: 9 });
    }),
  /** Let go: the slack line recoils with a soft swish. */
  recoil: () =>
    def("Recoil", (c, o) => {
      hiss(c, o, { attack: 0.01, decay: 0.09, freq: 1900 * jit(), to: 520, gain: 0.11, q: 1.1 });
    }),
  /** Pulled too far: the fibres crack, the line twangs and whips back. */
  snap: () => {
    const r = jit(0.08);
    return def("Snap", (c, o) => {
      hiss(c, o, { decay: 0.014, freq: 3200 * r, gain: 0.42, filter: "highpass" });
      tone(c, o, { freq: 820 * r, to: 210, glide: 0.16, decay: 0.2, gain: 0.13, type: "triangle" });
      hiss(c, o, { at: 0.015, attack: 0.012, decay: 0.13, freq: 4200 * r, to: 700, gain: 0.16, q: 1.4 });
    });
  },
  /** A loose end brushes the cursor and sticks to it again. */
  stick: () =>
    def("Stick", (c, o) => {
      hiss(c, o, { attack: 0.002, decay: 0.03, freq: 1500 * jit(), to: 500, gain: 0.13, filter: "lowpass" });
      hiss(c, o, { at: 0.012, decay: 0.006, freq: 3800, gain: 0.04, q: 4 });
    }),
  /** An old strand dries out and peels off the button. */
  peel: () =>
    def("Peel", (c, o) => {
      for (let k = 0; k < 5; k++) hiss(c, o, { at: k * 0.018 + Math.random() * 0.01, decay: 0.01, freq: 1800 + Math.random() * 3000, gain: 0.035, q: 3 });
    }),
};

/* deterministic noise, so beads keep their sizes from frame to frame */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/**
 * Web Sling Button: your cursor is a web-shooter. Click anywhere around the button and a line of
 * silk fires out and splats onto it in a messy burst of flung fibres and a smear of glue. Hold and
 * pull: the bundle of fibres closes up as it goes taut, glue knots are drawn out along it, fibres
 * peel out of the splat, and the button is dragged and tilted on the line. Let go and the strand
 * recoils and dangles from the button, swinging; brush a loose end and it sticks to your cursor
 * again. Pull too far and it snaps and curls back. Old strands dry out and peel away.
 *
 * A line is drawn as a loose bundle of fine fibres that drift apart, pinch together at sticky knots
 * and fray when broken, with a few loose strands sagging away from the rest. The
 * button is a real button; clicks on it still work. With `autoplay` a ghost shoots, pulls and
 * snaps strands until the pointer arrives. Pauses off screen. Under reduced motion the stage stays
 * still: the button and its hint are shown and no webs are fired, though the button still works.
 */
export type WebSlingButtonProps = {
  /** Text on the button. */
  label?: string;
  /** Called when the button itself is clicked. */
  onClick?: () => void;
  /** Height of the stage, in px. */
  height?: number;
  /** How far a strand can be stretched (times its length) before it snaps. */
  snapAt?: number;
  /** A ghost shoots, pulls and snaps strands in a loop until a real pointer arrives. */
  autoplay?: boolean;
  /** Thwips, splats, creaks and snaps. Follows the site's sound switch; false keeps it silent. */
  enableSound?: boolean;
  className?: string;
};

export function WebSlingButton({
  label = "Get started",
  onClick,
  height = 460,
  snapAt = 2.3,
  autoplay = false,
  enableSound = true,
  className,
}: WebSlingButtonProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const fluidRef = useRef<HTMLDivElement>(null);
  const fluidLabelRef = useRef<HTMLSpanElement>(null);
  const shotsRef = useRef<HTMLSpanElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const autoSound = useAutoplaySoundAllowed();
  const soundRef = useRef({ on: enableSound, auto: autoSound });
  useLayoutEffect(() => {
    soundRef.current = { on: enableSound, auto: autoSound };
  }, [enableSound, autoSound]);

  useEffect(() => {
    const stage = stageRef.current!, btn = btnRef.current!, canvas = canvasRef.current!;
    const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1;
    // the button's resting box, measured without its transform
    const B = { cx: 0, cy: 0, w: 0, h: 0 };
    const fit = () => {
      const r = stage.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      // layout size, not on-screen size, so a scaled stage still draws at the right size
      w = stage.offsetWidth || r.width; h = stage.offsetHeight || r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      B.w = btn.offsetWidth; B.h = btn.offsetHeight;
      B.cx = btn.offsetLeft + B.w / 2; B.cy = btn.offsetTop + B.h / 2;
    };
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    ro.observe(btn);
    fit();

    // button pose: offset and turn, on springs
    const pose = { x: 0, y: 0, vx: 0, vy: 0, rot: 0, vr: 0, hit: 0 };
    const toWorld = (lx: number, ly: number) => {
      const c = Math.cos(pose.rot), s = Math.sin(pose.rot);
      return { x: B.cx + pose.x + lx * c - ly * s, y: B.cy + pose.y + lx * s + ly * c };
    };
    // nearest point on the (resting) stadium outline to a world point, in button-local coords
    const nearestLocal = (qx: number, qy: number) => {
      const c = Math.cos(-pose.rot), s = Math.sin(-pose.rot);
      const dx = qx - (B.cx + pose.x), dy = qy - (B.cy + pose.y);
      const lx = dx * c - dy * s, ly = dx * s + dy * c;
      const r = B.h / 2, a = Math.max(0, B.w / 2 - r);
      const cx = Math.max(-a, Math.min(a, lx));
      const vx = lx - cx, vy = ly;
      const d = Math.hypot(vx, vy) || 1;
      // a touch inside the edge, so the glue sits on the surface
      return { x: cx + (vx / d) * (r - 2), y: (vy / d) * (r - 2), nx: vx / d, ny: vy / d };
    };

    let strands: Strand[] = [];
    let splash: { x: number; y: number; vx: number; vy: number; r: number; age: number; seed: number }[] = [];
    let held: Strand | null = null;
    const ptr = { x: -999, y: -999, inside: false, down: false, last: 0 };
    let touched = false;
    let seedN = 1;
    /* a sound from the visitor plays at once; one from the ghost waits until the page has been used */
    const sfx = (d: SoundDef, vol: number, ghost: boolean) => {
      const o = soundRef.current;
      if (!o.on || (ghost && (!o.auto || !audioAwake()))) return;
      playDef(`web-${d.label}`, d, vol);
    };
    let ghosting = false;

    /* web fluid: every shot uses a cartridge's worth, it refills slowly. Run dry and the shooter sputters. */
    let fluid = 1;
    let shots = 0;
    let dryUntil = 0;
    const fire = (x: number, y: number) => {
      if (reduced) return;
      if (fluid < 0.12) {
        // a dry click: a puff of a few flecks and nothing else
        for (let k = 0; k < 5; k++) {
          const a = Math.random() * Math.PI * 2, sp = 30 + Math.random() * 70;
          splash.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: 0.6 + Math.random(), age: 0, seed: Math.random() * 10 });
        }
        dryUntil = performance.now() + 1400;
        sfx(SFX.dry(), 0.8, ghosting);
        return;
      }
      fluid -= 0.12;
      shots++;
      sfx(SFX.thwip(), 0.75, ghosting);
      const a = nearestLocal(x, y);
      const end = toWorld(a.x, a.y);
      const dist = Math.hypot(end.x - x, end.y - y);
      const s: Strand = {
        x: new Float32Array(N).fill(x), y: new Float32Array(N).fill(y),
        px: new Float32Array(N).fill(x), py: new Float32Array(N).fill(y),
        ax: a.x, ay: a.y,
        rest: (dist * 1.02) / (N - 1),
        state: "flying", t: 0, age: 0, seed: seedN++,
        fibers: Array.from({ length: 5 }, (_, k) => {
          // grip points spread along the surface either side of the anchor
          const tang = [-a.ny, a.nx];
          const off = (k - 2) * 6 + (Math.random() - 0.5) * 3;
          return [tang[0] * off - a.nx * Math.random() * 4, tang[1] * off - a.ny * Math.random() * 4] as [number, number];
        }),
        spokes: Array.from({ length: 9 }, (_, k) => [(k / 9) * Math.PI * 2 + (Math.random() - 0.5) * 0.4, 8 + Math.random() * 12] as [number, number]),
        sx: x, sy: y, stretch: 1, alpha: 1,
        fib: Array.from({ length: 9 }, (_, k) => ({
          off: (k / 8) * 2 - 1 + (Math.random() - 0.5) * 0.3,
          freq: 6 + Math.random() * 10,
          phase: Math.random() * Math.PI * 2,
          w: 0.35 + Math.random() * 0.55,
          a: 0.4 + Math.random() * 0.45,
          loose: Math.random() < 0.22,
          speed: 0.5 + Math.random(),
        })),
        splat: Array.from({ length: 14 }, (_, k) => ({
          ang: (k / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.35,
          len: 10 + Math.pow(Math.random(), 1.4) * 24,
          curve: (Math.random() - 0.5) * 0.7,
          w: 0.4 + Math.random() * 0.6,
          a: 0.45 + Math.random() * 0.45,
          branch: Math.random() < 0.35 ? (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.5) : 0,
        })).sort((p, q) => p.ang - q.ang),
        cross: [],
        knots: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => 0.12 + Math.random() * 0.76),
        fray: 0,
        hitAge: 0,
        dIn: [-a.nx, -a.ny],
        ghost: ghosting,
        creaks: 0,
      };
      // a few threads strung across the splat between neighbouring fibres
      for (let k = 0; k < 7; k++) {
        const i = Math.floor(Math.random() * s.splat.length);
        s.cross.push([i, (i + 1) % s.splat.length, 0.3 + Math.random() * 0.6, 0.3 + Math.random() * 0.6]);
      }
      strands.push(s);
      // too many: the oldest loose one dries out and peels away
      if (strands.length > MAX) {
        const old = strands.find((t) => t !== s && t.state === "dangling") ?? strands.find((t) => t !== s && t.state !== "falling");
        if (old) { old.state = "falling"; sfx(SFX.peel(), 0.6, ghosting); }
      }
      return s;
    };
    const release = () => {
      // a line still in flight keeps going and lands as a dangling one (see the flying branch)
      if (held && held.state === "held") {
        held.state = "dangling";
        held.rest *= 0.82; // a little recoil as it lets go
        held.t = 0;
        sfx(SFX.recoil(), 0.7, held.ghost);
      }
      held = null;
    };
    const press = (x: number, y: number) => {
      release(); // a line caught by brushing the cursor is let go before a new one is fired
      held = fire(x, y) ?? null;
    };

    // pointer position in the stage's own (layout) space, undoing any CSS scale on a parent
    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      const k = stage.offsetWidth ? r.width / stage.offsetWidth : 1;
      return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      touched = true;
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y; ptr.down = true; ptr.last = performance.now();
      try { stage.setPointerCapture(e.pointerId); } catch { /* the pointer may already be gone */ }
      press(p.x, p.y);
    };
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      ptr.x = p.x; ptr.y = p.y;
      ptr.inside = p.x >= 0 && p.y >= 0 && p.x <= w && p.y <= h;
      if (ptr.inside) { touched = true; ptr.last = performance.now(); }
    };
    const onUp = () => { ptr.down = false; release(); };
    stage.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // ---- ghost: [time, x, y, pressed] in fractions of the stage ----
    const KEYS: [number, number, number, number][] = [
      [0, 0.16, 0.86, 0], [0.7, 0.18, 0.82, 0], [0.75, 0.18, 0.82, 1], [1.6, 0.24, 0.62, 1], [2.4, 0.12, 0.42, 1], [3.0, 0.2, 0.72, 1],
      [3.05, 0.2, 0.72, 0], [3.9, 0.82, 0.24, 0], [3.95, 0.82, 0.24, 1], [4.8, 0.92, 0.14, 1], [5.6, 0.99, 0.04, 1], [5.65, 0.99, 0.04, 0],
      [6.6, 0.66, 0.86, 0], [6.65, 0.66, 0.86, 1], [7.6, 0.8, 0.9, 1], [8.3, 0.58, 0.95, 1], [8.35, 0.58, 0.95, 0], [9.6, 0.5, 0.95, 0],
    ];
    const GHOST_LEN = 10;
    let gt = 0, gDown = false;
    const ghostAt = (t: number) => {
      let i = 0;
      while (i < KEYS.length - 2 && KEYS[i + 1][0] <= t) i++;
      const a = KEYS[i], b = KEYS[i + 1];
      const f = Math.max(0, Math.min(1, (t - a[0]) / Math.max(0.001, b[0] - a[0])));
      const e = f * f * (3 - 2 * f);
      return { x: (a[1] + (b[1] - a[1]) * e) * w, y: (a[2] + (b[2] - a[2]) * e) * h, down: a[3] === 1 };
    };

    // ---- WebGL silk: every fibre is a shaded ribbon, drawn on the GPU ----
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true }) as WebGLRenderingContext | null;
    const mk = (vs: string, fs: string) => {
      if (!gl) return null;
      const sh = (t: number, src: string) => { const o = gl.createShader(t)!; gl.shaderSource(o, src); gl.compileShader(o); return o; };
      const pr = gl.createProgram()!;
      gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs));
      gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { console.warn("WebSlingButton shader", gl.getProgramInfoLog(pr)); return null; }
      return pr;
    };
    const RVS = `attribute vec2 aPos;attribute vec4 aV;attribute vec2 aSK;uniform vec2 uRes;varying vec4 vV;varying vec2 vSK;
void main(){vV=aV;vSK=aSK;vec2 c=aPos/uRes*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);}`;
    const RFS = `precision mediump float;varying vec4 vV;varying vec2 vSK;
float h(float n){return fract(sin(n)*43758.5453);}
float nz(float x){float i=floor(x);float f=fract(x);f=f*f*(3.0-2.0*f);return mix(h(i),h(i+1.0),f);}
void main(){
  float k=vSK.y;float light=vV.y;float along=vV.w;float ax=abs(vV.x);
  if(k>1.5){
    /* glue: a wet, glossy film, thickest in the middle */
    float e=1.0-smoothstep(0.2,1.0,ax);
    float a=vV.z*e;
    float spec=pow(light,6.0)*0.9;
    vec3 c=mix(vec3(0.70,0.74,0.82),vec3(0.98,0.99,1.0),light)+spec;
    gl_FragColor=vec4(min(c,vec3(1.0))*a,a);return;
  }
  if(k>0.5){
    /* shadow on the wall behind */
    float a=vV.z*(1.0-smoothstep(0.0,1.0,ax));
    gl_FragColor=vec4(0.0,0.0,0.0,a);return;
  }
  /* silk: flat ribbons with a crumpled, broken highlight */
  float e=1.0-smoothstep(0.35,1.0,ax);
  float cr=nz(along*0.5+vSK.x*37.0)*0.6+nz(along*2.1+vSK.x*11.0)*0.4;
  float spec=pow(light,3.0)*(0.15+1.6*cr*cr);
  vec3 base=mix(vec3(0.6,0.64,0.72),vec3(0.95,0.96,0.99),light);
  vec3 c=base*(0.6+0.4*light)+vec3(1.0,0.99,0.96)*spec;
  float a=vV.z*e;
  gl_FragColor=vec4(min(c,vec3(1.0))*a,a);
}`;
    const PVS = `attribute vec2 aPos;attribute vec2 aSA;uniform vec2 uRes;uniform float uDpr;varying float vA;
void main(){vA=aSA.y;vec2 c=aPos/uRes*2.0-1.0;gl_Position=vec4(c.x,-c.y,0.0,1.0);gl_PointSize=aSA.x*uDpr;}`;
    const PFS = `precision mediump float;varying float vA;
void main(){vec2 p=gl_PointCoord-0.5;float d=length(p)*2.0;float core=exp(-d*d*14.0);float halo=exp(-d*d*3.0)*0.25;
vec3 c=(vec3(1.0)*core+vec3(0.7,0.8,1.0)*halo)*vA;gl_FragColor=vec4(c,max(c.r,max(c.g,c.b)));}`;
    const rProg = mk(RVS, RFS);
    const pProg = mk(PVS, PFS);
    const rBuf = gl?.createBuffer() || null;
    const pBuf = gl?.createBuffer() || null;
    const VMAX = 90000;
    const VB = new Float32Array(VMAX * 8);
    let vn = 0;
    const PB = new Float32Array(3000 * 4);
    let pn = 0;
    const point = (x: number, y: number, size: number, a: number) => {
      if (pn >= 3000 || a < 0.02) return;
      const o = pn * 4;
      PB[o] = x; PB[o + 1] = y; PB[o + 2] = size; PB[o + 3] = Math.min(1, a);
      pn++;
    };
    const vtx = (x: number, y: number, ac: number, li: number, al: number, lo: number, sd: number, kd: number) => {
      const o = vn * 8;
      VB[o] = x; VB[o + 1] = y; VB[o + 2] = ac; VB[o + 3] = li; VB[o + 4] = al; VB[o + 5] = lo; VB[o + 6] = sd; VB[o + 7] = kd;
      vn++;
    };
    /* scratch for one ribbon: centre, width, light, alpha, distance along */
    const RN = 260;
    const rx = new Float32Array(RN), ry = new Float32Array(RN), rw = new Float32Array(RN), rl = new Float32Array(RN), ra = new Float32Array(RN), rg = new Float32Array(RN);
    const ribbon = (n: number, seed: number, kind = 0) => {
      if (n < 2 || vn + (n - 1) * 6 >= VMAX) return;
      const minW = 1.2 / dpr;
      let pnx = 0, pny = 0, pw = 0, pa = 0;
      for (let i = 0; i < n; i++) {
        const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
        let tx = rx[i1] - rx[i0], ty = ry[i1] - ry[i0];
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl; ty /= tl;
        const nx = -ty, ny = tx;
        let wd = rw[i], al = ra[i];
        if (wd < minW && kind === 0) { al *= wd / minW; wd = minW; }
        if (i > 0) {
          const j = i - 1, hj = pw / 2, hi = wd / 2;
          vtx(rx[j] + pnx * hj, ry[j] + pny * hj, -1, rl[j], pa, rg[j], seed, kind);
          vtx(rx[j] - pnx * hj, ry[j] - pny * hj, 1, rl[j], pa, rg[j], seed, kind);
          vtx(rx[i] + nx * hi, ry[i] + ny * hi, -1, rl[i], al, rg[i], seed, kind);
          vtx(rx[j] - pnx * hj, ry[j] - pny * hj, 1, rl[j], pa, rg[j], seed, kind);
          vtx(rx[i] - nx * hi, ry[i] - ny * hi, 1, rl[i], al, rg[i], seed, kind);
          vtx(rx[i] + nx * hi, ry[i] + ny * hi, -1, rl[i], al, rg[i], seed, kind);
        }
        pnx = nx; pny = ny; pw = wd; pa = al;
      }
    };
    /* a filled blob: centre fan with soft, irregular rim */
    const blob = (x: number, y: number, r: number, seed: number, alpha: number, squash = 1, ang = 0) => {
      if (r < 0.3 || vn + 28 * 3 >= VMAX) return;
      const K = 28;
      const c = Math.cos(ang), s = Math.sin(ang);
      const P = (k: number) => {
        const a = (k / K) * Math.PI * 2;
        const rr = r * (1 + 0.24 * Math.sin(a * 2 + seed) + 0.15 * Math.sin(a * 5 - seed * 1.7) + 0.08 * Math.sin(a * 9 + seed * 3));
        const lx = Math.cos(a) * rr, ly = Math.sin(a) * rr * squash;
        return [x + lx * c - ly * s, y + lx * s + ly * c, 0.5 - 0.5 * Math.sin(a + 0.8)] as const;
      };
      for (let k = 0; k < K; k++) {
        const p0 = P(k), p1 = P(k + 1);
        vtx(x, y, 0, 0.85, alpha, 0, seed, 2);
        vtx(p0[0], p0[1], 1, p0[2], alpha, 0, seed, 2);
        vtx(p1[0], p1[1], 1, p1[2], alpha, 0, seed, 2);
      }
    };
    const flush = () => {
      if (!gl || !rProg || !pProg) return;
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      if (vn) {
        gl.useProgram(rProg);
        gl.uniform2f(gl.getUniformLocation(rProg, "uRes"), w, h);
        gl.bindBuffer(gl.ARRAY_BUFFER, rBuf);
        gl.bufferData(gl.ARRAY_BUFFER, VB.subarray(0, vn * 8), gl.DYNAMIC_DRAW);
        const a0 = gl.getAttribLocation(rProg, "aPos"), a1 = gl.getAttribLocation(rProg, "aV"), a2 = gl.getAttribLocation(rProg, "aSK");
        gl.enableVertexAttribArray(a0); gl.vertexAttribPointer(a0, 2, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(a1); gl.vertexAttribPointer(a1, 4, gl.FLOAT, false, 32, 8);
        gl.enableVertexAttribArray(a2); gl.vertexAttribPointer(a2, 2, gl.FLOAT, false, 32, 24);
        gl.drawArrays(gl.TRIANGLES, 0, vn);
        gl.disableVertexAttribArray(a1); gl.disableVertexAttribArray(a2);
      }
      if (pn) {
        gl.useProgram(pProg);
        gl.uniform2f(gl.getUniformLocation(pProg, "uRes"), w, h);
        gl.uniform1f(gl.getUniformLocation(pProg, "uDpr"), dpr);
        gl.bindBuffer(gl.ARRAY_BUFFER, pBuf);
        gl.bufferData(gl.ARRAY_BUFFER, PB.subarray(0, pn * 4), gl.DYNAMIC_DRAW);
        const a0 = gl.getAttribLocation(pProg, "aPos"), a1 = gl.getAttribLocation(pProg, "aSA");
        gl.enableVertexAttribArray(a0); gl.vertexAttribPointer(a0, 2, gl.FLOAT, false, 16, 0);
        gl.enableVertexAttribArray(a1); gl.vertexAttribPointer(a1, 2, gl.FLOAT, false, 16, 8);
        gl.drawArrays(gl.POINTS, 0, pn);
        gl.disableVertexAttribArray(a1);
      }
      vn = 0; pn = 0;
    };

    /* the line: a smooth path through the simulated points */
    const SUB = 4;
    const MP = (N - 1) * SUB + 1;
    const PX = new Float32Array(MP), PY = new Float32Array(MP), NX = new Float32Array(MP), NY = new Float32Array(MP), LS = new Float32Array(MP);
    const smoothPath = (s: Strand, cx0?: number, cy0?: number) => {
      const X = (i: number) => (i === 0 && cx0 !== undefined ? cx0 : s.x[Math.max(0, Math.min(N - 1, i))]);
      const Y = (i: number) => (i === 0 && cy0 !== undefined ? cy0! : s.y[Math.max(0, Math.min(N - 1, i))]);
      let m = 0;
      for (let i = 0; i < N - 1; i++) {
        const x0 = X(i - 1), y0 = Y(i - 1), x1 = X(i), y1 = Y(i), x2 = X(i + 1), y2 = Y(i + 1), x3 = X(i + 2), y3 = Y(i + 2);
        for (let k = 0; k < SUB; k++) {
          const t = k / SUB, t2 = t * t, t3 = t2 * t;
          PX[m] = 0.5 * (2 * x1 + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3);
          PY[m] = 0.5 * (2 * y1 + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3);
          m++;
        }
      }
      PX[m] = X(N - 1); PY[m] = Y(N - 1);
      let acc = 0;
      for (let i = 0; i < MP; i++) {
        if (i > 0) acc += Math.hypot(PX[i] - PX[i - 1], PY[i] - PY[i - 1]);
        LS[i] = acc;
        const a = Math.max(0, i - 1), b = Math.min(MP - 1, i + 1);
        const dx = PX[b] - PX[a], dy = PY[b] - PY[a], dl = Math.hypot(dx, dy) || 1;
        NX[i] = -dy / dl; NY[i] = dx / dl;
      }
      return acc;
    };

    /*
     * A web line is a loose bundle of flat silk fibres twisted round each other. They drift apart along
     * the span, pinch together at glue knots, fan out into the splat where the line is stuck, and fray
     * when it breaks. Pulled taut, the bundle closes up into a thin, bright line.
     */
    const bundle = (s: Strand, alpha: number, time: number, total: number) => {
      const st = s.stretch;
      const tight = Math.min(1, (st - 1) * 2.2);
      const flying = s.state === "flying";
      const freeEnd = s.state === "dangling" || s.state === "falling";
      const spread = (flying ? 1.2 : 1.6 + 2.6 * (1 - tight)) / Math.sqrt(st);
      const thin = 1 / Math.sqrt(st);
      const env = (u: number) => {
        let e = Math.pow(Math.sin(Math.PI * Math.min(u, freeEnd || flying ? 0.5 : u)), 0.6);
        // where it is stuck, the fibres fan out into the splat like a little tent
        if (!flying) e += 1.6 * Math.exp(-u * 14);
        if (freeEnd) e *= 1 + s.fray * Math.pow(u, 4) * 2.8;
        for (const k of s.knots) e *= 1 - 0.75 * Math.exp(-Math.pow((u - k) / 0.03, 2));
        return e;
      };
      // shadow on the wall
      for (let i = 0; i < MP; i += 2) {
        const n = i >> 1;
        rx[n] = PX[i] + 5; ry[n] = PY[i] + 12; rw[n] = 4.5 * thin + 2; rl[n] = 0; ra[n] = 0.13 * alpha; rg[n] = 0;
      }
      ribbon(Math.ceil(MP / 2), 0, 1);
      // fibres
      for (let q = 0; q < s.fib.length; q++) {
        const f = s.fib[q];
        const sag = f.loose ? (5 + 9 * (1 - tight)) : 0;
        for (let i = 0; i < MP; i++) {
          const u = i / (MP - 1);
          const l = LS[i];
          const e = env(u);
          const th = f.phase + l * 0.16 + time * 0.8 * f.speed;
          const o = e * spread * ((f.loose ? 1.7 : 1) * f.off * 0.85 + 0.55 * Math.cos(th));
          rx[i] = PX[i] + NX[i] * o;
          ry[i] = PY[i] + NY[i] * o + e * sag * Math.sin(Math.PI * u);
          const psi = f.phase * 2.3 + l * (0.09 + 0.05 * f.speed) + time * 0.6;
          rw[i] = (0.55 + 1.15 * f.w) * thin * (0.3 + 0.7 * Math.abs(Math.cos(psi))) * (flying ? 1 + 0.6 * (1 - u) : 1);
          rl[i] = Math.min(1, 0.1 + 0.9 * (0.5 + 0.5 * Math.sin(th)) * Math.abs(Math.cos(psi - 0.7)));
          ra[i] = (0.55 + 0.45 * f.a) * alpha * (f.loose ? 0.7 : 1);
          rg[i] = l;
        }
        ribbon(MP, s.seed * 0.137 + q * 0.071);
      }
      // loose hairs off the line
      for (let k = 0; k < 26; k++) {
        const hs = hash(s.seed * 13 + k * 7.1);
        const i = Math.min(MP - 2, Math.max(2, Math.round((0.05 + 0.9 * hs) * (MP - 1))));
        const side = hash(k * 3.3 + s.seed) < 0.5 ? -1 : 1;
        const back = hash(k * 5.1 + s.seed) < 0.7 ? -1 : 1;
        const len = (2 + 4.5 * hash(k * 9.7 + s.seed)) * thin;
        const tx = -NY[i] * back, ty = NX[i] * back;
        const bx = PX[i] + NX[i] * side * spread * env(i / (MP - 1)) * 0.8, by = PY[i] + NY[i] * side * spread * env(i / (MP - 1)) * 0.8;
        const ex = bx + (tx * 0.8 + NX[i] * side * 0.6) * len, ey = by + (ty * 0.8 + NY[i] * side * 0.6) * len;
        rx[0] = bx; ry[0] = by; rx[1] = (bx + ex) / 2 + NX[i] * side * 0.4; ry[1] = (by + ey) / 2 + NY[i] * side * 0.4; rx[2] = ex; ry[2] = ey;
        rw[0] = 0.6; rw[1] = 0.45; rw[2] = 0.3; rl[0] = rl[1] = rl[2] = 0.3 + 0.6 * hash(k + s.seed);
        ra[0] = ra[1] = ra[2] = 0.5 * alpha; rg[0] = 0; rg[1] = 1; rg[2] = 2;
        ribbon(3, 0.5 + k * 0.01);
      }
      // glints: wet specks that flicker as the silk turns
      for (let k = 0; k < 18; k++) {
        const i = Math.min(MP - 1, Math.round(hash(s.seed * 7 + k * 1.3) * (MP - 1)));
        const tw = Math.pow(Math.max(0, Math.sin(time * (1.5 + hash(k * 2.7) * 3) + k * 1.9 + s.seed)), 6);
        const side = hash(k * 4.4 + s.seed) * 2 - 1;
        point(PX[i] + NX[i] * side * spread, PY[i] + NY[i] * side * spread, 2 + 4 * tw, (0.15 + 0.85 * tw) * alpha);
      }
      // glue knots where the fibres are stuck together, drawn out along the line under tension
      if (!flying) {
        for (const k of s.knots) {
          const i = Math.min(MP - 2, Math.round(k * (MP - 1)));
          const ang = Math.atan2(PY[i + 1] - PY[i], PX[i + 1] - PX[i]);
          const r = (1.4 + 0.5 * Math.sin(k * 40 + s.seed)) / Math.pow(st, 0.3);
          blob(PX[i], PY[i], r * 1.3, s.seed + k * 10, 0.75 * alpha, 1 / Math.min(2.4, Math.sqrt(st)), ang);
          point(PX[i] - 0.4, PY[i] - 0.5, 2.6, 0.6 * alpha);
        }
      }
      return total;
    };

    // where the line hit: the head bursts into a splat that grabs the button
    const SP = 9;
    const splat = (s: Strand, A: { x: number; y: number }, alpha: number, time: number, pull: { x: number; y: number }) => {
      const since = s.age - s.hitAge;
      const grow = 1 - Math.pow(1 - Math.min(1, since / 0.16), 3);
      const net = Math.max(0, Math.min(1, (since - 0.07) / 0.22));
      const c = Math.cos(pose.rot), sn = Math.sin(pose.rot);
      const W = (lx: number, ly: number) => ({ x: B.cx + pose.x + lx * c - ly * sn, y: B.cy + pose.y + lx * sn + ly * c });
      const R0 = B.h / 2, A0 = Math.max(0, B.w / 2 - R0);
      // the splat lies on the button: points past its edge wrap round it and fade from view
      const conform = (lx: number, ly: number) => {
        const qx = Math.max(-A0, Math.min(A0, lx));
        const vx = lx - qx, vy = ly;
        const d = Math.hypot(vx, vy) || 1;
        const sd = d - R0;
        if (sd <= 0) return { x: lx, y: ly, a: 1 };
        const keep = Math.min(sd, 2.5);
        return { x: qx + (vx / d) * (R0 + keep), y: (vy / d) * (R0 + keep), a: Math.exp(-sd / 5) };
      };
      // the centre is dragged toward the pull, so the strands around it tent up
      const cxL = s.ax + pull.x, cyL = s.ay + pull.y;
      const tips: { x: number; y: number; a: number }[][] = [];
      for (let q = 0; q < s.splat.length; q++) {
        const f = s.splat[q];
        // the web splashes forward, along the way it was travelling
        const fwd = Math.cos(f.ang - Math.atan2(s.dIn[1], s.dIn[0]));
        const L = f.len * 1.35 * (1 + 0.45 * fwd) * grow * (0.9 + 0.2 * Math.sin(since * 30 + q) * Math.exp(-since * 8));
        const ptsL: { x: number; y: number; a: number }[] = [];
        let n = 0;
        for (let j = 0; j < SP; j++) {
          const v = j / (SP - 1);
          const a = f.ang + f.curve * v * 1.2;
          const bx = s.ax + Math.cos(a) * L * v, by = s.ay + Math.sin(a) * L * v;
          // inner part follows the dragged centre
          const pullW = Math.pow(1 - v, 2);
          const p = conform(bx + (cxL - s.ax) * pullW, by + (cyL - s.ay) * pullW);
          const wp = W(p.x, p.y);
          ptsL.push(p);
          rx[n] = wp.x; ry[n] = wp.y;
          rw[n] = (f.w * 2.2 + 0.9) * (1 - v * 0.62);
          rl[n] = 0.35 + 0.6 * Math.abs(Math.sin(v * 6 + q * 1.3));
          ra[n] = alpha * p.a * (0.78 + 0.22 * (1 - v)) * (0.75 + 0.25 * f.a);
          rg[n] = v * 20 + q * 3;
          n++;
        }
        tips.push(ptsL);
        /* a faint contact shadow first, so the silk reads against the button */
        for (let j = 0; j < n; j++) { rx[j] += 0.8; ry[j] += 1.3; }
        const keepA = Array.from(ra.subarray(0, n));
        for (let j = 0; j < n; j++) ra[j] = keepA[j] * 0.35;
        ribbon(n, 0, 1);
        for (let j = 0; j < n; j++) { rx[j] -= 0.8; ry[j] -= 1.3; ra[j] = keepA[j]; }
        ribbon(n, 0.31 + q * 0.05);
        // a second, finer fibre alongside, slightly apart
        for (let j = 0; j < n; j++) {
          const v = j / (SP - 1);
          rx[j] += -Math.sin(f.ang) * 0.9 * v; ry[j] += Math.cos(f.ang) * 0.9 * v;
          rw[j] *= 0.55; ra[j] *= 0.8;
        }
        ribbon(n, 0.61 + q * 0.05);
        if (f.branch && grow > 0.5) {
          const p0 = ptsL[4];
          const ba = f.ang + f.branch;
          const bl = L * 0.38;
          const pe = conform(p0.x + Math.cos(ba) * bl, p0.y + Math.sin(ba) * bl);
          const w0 = W(p0.x, p0.y), w1 = W((p0.x + pe.x) / 2, (p0.y + pe.y) / 2), w2 = W(pe.x, pe.y);
          rx[0] = w0.x; ry[0] = w0.y; rx[1] = w1.x; ry[1] = w1.y; rx[2] = w2.x; ry[2] = w2.y;
          rw[0] = 0.8; rw[1] = 0.6; rw[2] = 0.35; rl[0] = rl[1] = rl[2] = 0.6; ra[0] = ra[1] = ra[2] = f.a * alpha * 0.8 * pe.a; rg[0] = 0; rg[1] = 3; rg[2] = 6;
          ribbon(3, 0.9 + q * 0.03);
        }
      }
      // rings of thread strung between neighbouring strands, sagging toward the middle
      if (net > 0) {
        for (const ring of [0.32, 0.6, 0.85]) {
          const jr = Math.round(ring * (SP - 1));
          for (let q = 0; q < s.splat.length; q++) {
            const q2 = (q + 1) % s.splat.length;
            let gap = s.splat[q2].ang - s.splat[q].ang;
            if (gap < 0) gap += Math.PI * 2;
            if (gap > 1.25) continue;
            const p0 = tips[q][jr], p1 = tips[q2][jr];
            let n = 0;
            for (let j = 0; j <= 6; j++) {
              const v = j / 6;
              const sag = Math.sin(Math.PI * v) * 0.22;
              const lx = p0.x + (p1.x - p0.x) * v, ly = p0.y + (p1.y - p0.y) * v;
              const wp = W(lx + (cxL - lx) * sag, ly + (cyL - ly) * sag);
              rx[n] = wp.x; ry[n] = wp.y; rw[n] = 0.95; rl[n] = 0.55 + 0.4 * Math.sin(v * 3 + q);
              ra[n] = 0.85 * alpha * net * Math.min(p0.a, p1.a) * (ring > 0.8 ? 0.6 : 1); rg[n] = v * 8; n++;
            }
            ribbon(n, 0.77 + q * 0.02);
          }
        }
      }
      // a sheet of glue in the middle of the splat, and the wet blob where it struck
      const cW = W(cxL, cyL);
      const pullAng = Math.atan2(pull.y, pull.x) + pose.rot;
      const pl = Math.hypot(pull.x, pull.y);
      blob(cW.x, cW.y, (12 + 2 * Math.sin(s.seed)) * grow, s.seed + 5, 0.4 * alpha, 1 / (1 + pl * 0.06), pullAng);
      blob(cW.x, cW.y, (6.5 + 1.2 * Math.sin(s.seed * 2)) * grow * (1 + 0.25 * pose.hit), s.seed, 0.9 * alpha, 1 / (1 + pl * 0.08), pullAng);
      point(cW.x - 1.2, cW.y - 1.4, 3.5 + 1.5 * Math.sin(time * 2 + s.seed), 0.75 * alpha);
      // the moment it lands: a flash of wet light
      if (since < 0.14) point(cW.x, cW.y, 26 * (1 - since / 0.14), 0.7 * (1 - since / 0.14) * alpha);
      return cW;
    };

    let raf = 0;
    let visible = true;
    let prev = performance.now();
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const dt = Math.max(1 / 240, Math.min(0.033, (now - prev) / 1000));
      prev = now;
      if (!w || !h) return;

      // ---- ghost ----
      const auto = autoplay && !reduced && (!touched || (!ptr.inside && !ptr.down && now - ptr.last > 4000));
      let hx = ptr.x, hy = ptr.y;
      let show = ptr.inside;
      if (auto) {
        gt = (gt + dt) % GHOST_LEN;
        const gp = ghostAt(gt);
        hx = gp.x; hy = gp.y; show = true;
        ghosting = true;
        if (gp.down && !gDown) press(hx, hy);
        if (!gp.down && gDown) release();
        ghosting = false;
        gDown = gp.down;
      } else if (gDown) { release(); gDown = false; }
      stage.style.cursor = show && !auto ? "none" : "";

      // ---- strands ----
      let pullX = 0, pullY = 0, torque = 0;
      for (const s of strands) {
        s.t += dt;
        s.age += dt;
        const A = toWorld(s.ax, s.ay);
        let pinEnd = false;
        let ex = 0, ey = 0;
        if (s.state === "flying") {
          // the line races out from the shooter to the button with a slight whip in it
          const f = Math.min(1, s.t / 0.13);
          const sx = held === s ? hx : s.sx, sy = held === s ? hy : s.sy;
          // the head flies from the shooter to the button; the line trails back to the shooter
          const headX = sx + (A.x - sx) * f, headY = sy + (A.y - sy) * f;
          const nx = -(A.y - sy), ny = A.x - sx, nl = Math.hypot(nx, ny) || 1;
          for (let i = 0; i < N; i++) {
            const u = i / (N - 1); // 0 at the head, 1 at the shooter
            const wob = Math.sin(u * Math.PI) * Math.sin(s.t * 60 + u * 9) * 6 * (1 - f);
            s.x[i] = s.px[i] = headX + (sx - headX) * u + (nx / nl) * wob;
            s.y[i] = s.py[i] = headY + (sy - headY) * u + (ny / nl) * wob;
          }
          if (f >= 1) {
            s.state = held === s ? "held" : "dangling";
            s.t = 0;
            s.hitAge = s.age;
            {
              const ddx = A.x - sx, ddy = A.y - sy, ddl = Math.hypot(ddx, ddy) || 1;
              const c = Math.cos(-pose.rot), sn = Math.sin(-pose.rot);
              s.dIn = [((ddx / ddl) * c - (ddy / ddl) * sn), ((ddx / ddl) * sn + (ddy / ddl) * c)];
            }
            pose.hit = 1;
            // the further it flew, the harder it slaps
            sfx(SFX.splat(Math.min(1, 0.55 + Math.hypot(A.x - sx, A.y - sy) / 600)), 0.85, s.ghost);
            // the impact knocks the button back a touch
            const dx = A.x - sx, dy = A.y - sy, dl = Math.hypot(dx, dy) || 1;
            pose.vx += (dx / dl) * 140; pose.vy += (dy / dl) * 140;
            // a splash of glue flies off the impact
            for (let k = 0; k < 9; k++) {
              const a = Math.atan2(-dy, -dx) + (Math.random() - 0.5) * 2.4, sp = 80 + Math.random() * 220;
              splash.push({ x: A.x, y: A.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 1 + Math.random() * 2.2, age: 0, seed: Math.random() * 10 });
            }
            const restLen = Math.hypot(A.x - sx, A.y - sy);
            s.rest = (restLen * 1.02) / (N - 1);
            for (let i = 0; i < N; i++) {
              const u = i / (N - 1);
              s.x[i] = s.px[i] = A.x + (sx - A.x) * u;
              s.y[i] = s.py[i] = A.y + (sy - A.y) * u;
            }
          }
          continue;
        }
        // a loose end brushed by the cursor sticks to it
        if (s.state === "dangling" && !held && show && s.t > 0.4) {
          if (Math.hypot(s.x[N - 1] - hx, s.y[N - 1] - hy) < 12) {
            held = s; s.state = "held"; s.t = 0;
            s.rest = Math.max(s.rest, Math.hypot(hx - A.x, hy - A.y) / (N - 1));
            s.ghost = auto; s.creaks = 0;
            sfx(SFX.stick(), 0.8, auto);
          }
        }
        if (s.state === "held") {
          pinEnd = true; ex = hx; ey = hy;
          const dist = Math.hypot(ex - A.x, ey - A.y);
          s.stretch = Math.max(1, dist / (s.rest * (N - 1)));
          if (s.stretch > snapAt) {
            // snap: the line lets go of the shooter and whips back
            s.state = "dangling"; s.t = 0;
            s.rest *= 0.42;
            s.fray = 1;
            if (held === s) held = null;
            pinEnd = false;
            sfx(SFX.snap(), 0.8, s.ghost);
          } else {
            // a creak each time the pull passes another step, and again when it eases back below it
            const step = Math.floor((s.stretch - 1.15) / 0.28) + 1;
            if (step > s.creaks && step > 0) sfx(SFX.creak(s.stretch), 0.8, s.ghost);
            if (step !== s.creaks) s.creaks = Math.max(0, step);
            // the stretched line tugs the button toward the pointer
            const k = Math.min(70, (s.stretch - 1) * 60);
            const dx = (ex - A.x) / (dist || 1), dy = (ey - A.y) / (dist || 1);
            pullX += dx * k; pullY += dy * k;
            torque += (s.ax * dy - s.ay * dx) * k * 0.00035;
          }
        } else s.stretch += (1 - s.stretch) * Math.min(1, dt * 6);
        if (s.state === "falling") s.alpha -= dt * 0.9;
        else if (s.state === "dangling" && s.age > 9) s.state = "falling";

        // verlet
        const grav = s.state === "held" ? 160 : 700;
        const damp = s.state === "held" ? 0.96 : 0.985;
        for (let i = 0; i < N; i++) {
          const vx = (s.x[i] - s.px[i]) * damp, vy = (s.y[i] - s.py[i]) * damp;
          s.px[i] = s.x[i]; s.py[i] = s.y[i];
          s.x[i] += vx; s.y[i] += vy + grav * dt * dt;
        }
        const pinStart = s.state !== "falling";
        if (pinStart) { s.x[0] = s.px[0] = A.x; s.y[0] = s.py[0] = A.y; }
        if (pinEnd) { s.x[N - 1] = ex; s.y[N - 1] = ey; }
        // links stretch when pulled taut, otherwise keep their resting length
        const link = pinEnd ? Math.max(s.rest, Math.hypot(ex - A.x, ey - A.y) / (N - 1) * 0.995) : s.rest;
        for (let it = 0; it < 14; it++) {
          for (let i = 0; i < N - 1; i++) {
            const dx = s.x[i + 1] - s.x[i], dy = s.y[i + 1] - s.y[i];
            const d = Math.hypot(dx, dy) || 0.0001;
            const diff = (d - link) / d;
            const a = i === 0 && pinStart ? 0 : 0.5;
            const b = i + 1 === N - 1 && pinEnd ? 0 : 0.5;
            const m = a + b || 1;
            s.x[i] += dx * diff * (a / m); s.y[i] += dy * diff * (a / m);
            s.x[i + 1] -= dx * diff * (b / m); s.y[i + 1] -= dy * diff * (b / m);
          }
        }
        if (!Number.isFinite(s.x[N - 1])) { s.x.fill(A.x); s.y.fill(A.y); s.px.fill(A.x); s.py.fill(A.y); }
      }
      strands = strands.filter((s) => s.alpha > 0 && s.y[0] < h + 200);

      // ---- button pose ----
      const pl = Math.hypot(pullX, pullY);
      if (pl > 80) { pullX *= 80 / pl; pullY *= 80 / pl; }
      pose.vx += ((pullX - pose.x) * 130 - pose.vx * 11) * dt;
      pose.vy += ((pullY - pose.y) * 130 - pose.vy * 11) * dt;
      pose.x += pose.vx * dt; pose.y += pose.vy * dt;
      const rt = Math.max(-0.3, Math.min(0.3, torque + pose.x * 0.0025));
      pose.vr += ((rt - pose.rot) * 110 - pose.vr * 10) * dt;
      pose.rot += pose.vr * dt;
      pose.hit = Math.max(0, pose.hit - dt * 5);
      btn.style.transform = `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px) rotate(${pose.rot.toFixed(4)}rad) scale(${(1 - pose.hit * 0.04).toFixed(4)})`;

      // ---- web fluid meter ----
      fluid = Math.min(1, fluid + dt * 0.09);
      const fm = fluidRef.current;
      if (fm) {
        fm.style.transform = `scaleX(${fluid.toFixed(3)})`;
        fm.style.background = fluid < 0.12 ? "#86868b" : "linear-gradient(90deg,#d62828,#ef4444)";
      }
      const fla = fluidLabelRef.current;
      if (fla) {
        const t = now < dryUntil ? "Out of web fluid" : "Web fluid";
        if (fla.textContent !== t) fla.textContent = t;
      }
      const sr = shotsRef.current;
      if (sr && sr.textContent !== String(shots)) sr.textContent = String(shots);

      // ---- draw ----
      if (!gl || !rProg) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const time = now / 1000;
      for (const s of strands) {
        const alpha = Math.max(0, Math.min(1, s.alpha));
        const A = toWorld(s.ax, s.ay);
        const st = s.stretch;
        if (s.fray > 0) s.fray = Math.max(0.35, s.fray - dt * 0.4);
        let start: { x: number; y: number } | undefined;
        if (s.state !== "flying" && s.state !== "falling") {
          // how hard the line pulls on the splat, in button-local coordinates
          let pull = { x: 0, y: 0 };
          if (st > 1.02) {
            const dx = s.x[3] - A.x, dy = s.y[3] - A.y, dl = Math.hypot(dx, dy) || 1;
            const m = Math.min(7, (st - 1) * 9);
            const c = Math.cos(-pose.rot), sn = Math.sin(-pose.rot);
            pull = { x: ((dx / dl) * c - (dy / dl) * sn) * m, y: ((dx / dl) * sn + (dy / dl) * c) * m };
          }
          start = splat(s, A, alpha, time, pull);
          // under tension, fibres peel out of the splat and stream into the line
          if (st > 1.04) {
            const j = Math.min(N - 1, 2 + Math.round(st * 1.5));
            const c = Math.cos(pose.rot), sn = Math.sin(pose.rot);
            const peel = Math.min(1, (st - 1) * 3);
            for (const [fx, fy] of s.fibers) {
              const gx = A.x + fx * c - fy * sn, gy = A.y + fx * sn + fy * c;
              rx[0] = gx; ry[0] = gy; rx[1] = (gx + s.x[j]) / 2; ry[1] = (gy + s.y[j]) / 2 + 1.5; rx[2] = s.x[j]; ry[2] = s.y[j];
              rw[0] = 0.9; rw[1] = 0.7; rw[2] = 0.6; rl[0] = rl[1] = rl[2] = 0.7; ra[0] = ra[1] = ra[2] = 0.7 * peel * alpha; rg[0] = 0; rg[1] = 4; rg[2] = 8;
              ribbon(3, 0.44);
              blob(gx, gy, 1.4, fx * 3 + fy, peel * alpha * 0.8);
            }
          }
        }
        const total = smoothPath(s, start?.x, start?.y);
        bundle(s, alpha, time, total);
        // the flying head: a small glob of silk out in front
        if (s.state === "flying") {
          blob(s.x[0], s.y[0], 2.6, s.seed, 0.9 * alpha);
          point(s.x[0], s.y[0], 7, 0.8 * alpha);
        }
      }
      // flecks of silk thrown off a hit
      for (const d of splash) {
        d.age += dt;
        d.vy += 700 * dt;
        d.vx *= Math.exp(-dt * 2.5);
        d.x += d.vx * dt; d.y += d.vy * dt;
        const a = Math.max(0, 1 - d.age / 0.7);
        if (a <= 0) continue;
        const ang = d.seed + d.age * 6;
        const L = 3 + d.r * 2.5;
        rx[0] = d.x - (Math.cos(ang) * L) / 2; ry[0] = d.y - (Math.sin(ang) * L) / 2;
        rx[1] = d.x + Math.sin(ang) * 1.2; ry[1] = d.y - Math.cos(ang) * 1.2;
        rx[2] = d.x + (Math.cos(ang) * L) / 2; ry[2] = d.y + (Math.sin(ang) * L) / 2;
        rw[0] = 0.5; rw[1] = 0.9; rw[2] = 0.4; rl[0] = rl[1] = rl[2] = 0.7; ra[0] = ra[1] = ra[2] = 0.8 * a; rg[0] = 0; rg[1] = 2; rg[2] = 4;
        ribbon(3, d.seed);
      }
      splash = splash.filter((d) => d.age < 0.7);
      flush();
      // the shooter's reticle
      const rt2 = reticleRef.current;
      if (rt2) {
        rt2.style.opacity = show ? "1" : "0";
        if (show) rt2.style.transform = `translate(${hx.toFixed(1)}px, ${hy.toFixed(1)}px) scale(${held ? 0.7 : 1})`;
      }
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        prev = performance.now();
        raf = requestAnimationFrame(frame);
      }
    });
    io.observe(stage);
    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      stage.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      btn.style.transform = "";
      stage.style.cursor = "";
    };
  }, [autoplay, snapAt]);

  /* a generic orb-web drawn as SVG: radials and sagging rings, used as faint decoration */
  const webPath = (cx: number, cy: number, r0: number, a0: number, a1: number, spokes: number, rings: number) => {
    let d = "";
    for (let i = 0; i <= spokes; i++) {
      const a = a0 + ((a1 - a0) * i) / spokes;
      d += `M${cx},${cy}L${(cx + Math.cos(a) * r0).toFixed(1)},${(cy + Math.sin(a) * r0).toFixed(1)}`;
    }
    for (let k = 1; k <= rings; k++) {
      const r = (r0 * k) / (rings + 0.4);
      for (let i = 0; i < spokes; i++) {
        const b0 = a0 + ((a1 - a0) * i) / spokes, b1 = a0 + ((a1 - a0) * (i + 1)) / spokes, bm = (b0 + b1) / 2;
        const p0 = [cx + Math.cos(b0) * r, cy + Math.sin(b0) * r], p1 = [cx + Math.cos(b1) * r, cy + Math.sin(b1) * r];
        const c = [cx + Math.cos(bm) * r * 0.86, cy + Math.sin(bm) * r * 0.86];
        d += `${i === 0 ? `M${p0[0].toFixed(1)},${p0[1].toFixed(1)}` : ""}Q${c[0].toFixed(1)},${c[1].toFixed(1)} ${p1[0].toFixed(1)},${p1[1].toFixed(1)}`;
      }
    }
    return d;
  };

  return (
    <div
      ref={stageRef}
      className={cn("relative flex w-full touch-none select-none items-center justify-center overflow-hidden rounded-[24px]", className)}
      style={{
        height,
        background: "radial-gradient(110% 85% at 50% 30%, #ffffff 0%, #f5f5f7 55%, #ebebf0 100%)",
        boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 20px 40px -26px rgba(0,0,0,.35)",
        color: "#1d1d1f",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', Inter, system-ui, sans-serif",
      }}
    >
      <style>{`
        .ws-btn{transition:filter .25s ease, box-shadow .25s ease}
        .ws-btn:hover{filter:brightness(1.06) saturate(1.05)}
        .ws-btn:active{filter:brightness(.94)}
        .ws-btn:focus-visible{outline:3px solid #1f4ea8;outline-offset:4px}
      `}</style>
      {/* Spider-Man red and blue as a thin rule along the top */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[3px]" style={{ background: "linear-gradient(90deg,#d62828 0%,#d62828 48%,#1f4ea8 52%,#1f4ea8 100%)" }} />
      {/* faint webs strung in two corners */}
      <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0" width="260" height="200" viewBox="0 0 260 200" style={{ opacity: 0.1 }}>
        <path d={webPath(260, 0, 260, Math.PI / 2, Math.PI, 7, 6)} fill="none" stroke="#1d1d1f" strokeWidth="0.9" />
      </svg>
      <svg aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0" width="200" height="160" viewBox="0 0 200 160" style={{ opacity: 0.07 }}>
        <path d={webPath(0, 160, 200, -Math.PI / 2, 0, 6, 5)} fill="none" stroke="#1d1d1f" strokeWidth="0.9" />
      </svg>

      {/* shooter status: web fluid and shots fired */}
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2.5 rounded-full bg-white/90 py-1.5 pl-2.5 pr-3 text-[12px] font-medium" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 6px 16px -10px rgba(0,0,0,.35)", color: "#1d1d1f" }}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-40" style={{ background: "#d62828" }} />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: "#d62828" }} />
        </span>
        <span ref={fluidLabelRef}>Web fluid</span>
        <span className="relative h-[5px] w-[54px] overflow-hidden rounded-full" style={{ background: "#e5e5ea" }}>
          <span ref={fluidRef} className="absolute inset-0 origin-left rounded-full" style={{ background: "linear-gradient(90deg,#d62828,#ef4444)" }} />
        </span>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium tabular-nums" style={{ boxShadow: "0 0 0 1px rgba(0,0,0,.06), 0 6px 16px -10px rgba(0,0,0,.35)", color: "#6e6e73" }}>
        Shots <span ref={shotsRef} style={{ color: "#1f4ea8" }}>0</span>
      </div>

      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        className="ws-btn relative z-0 h-[64px] overflow-hidden rounded-full border-0 px-10 text-[19px] font-semibold tracking-[-0.02em] text-white outline-none"
        style={{
          background: "linear-gradient(180deg,#f0453f 0%,#d62828 55%,#b51d1d 100%)",
          boxShadow:
            "0 1px 0 rgba(255,255,255,.4) inset, 0 -3px 0 rgba(31,78,168,.55) inset, 0 0 0 1px rgba(120,14,14,.45), 0 22px 40px -16px rgba(214,40,40,.6), 0 6px 14px -6px rgba(0,0,0,.35)",
          willChange: "transform",
        }}
      >
        {/* a fine web etched into the button's face */}
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 220 64" preserveAspectRatio="xMidYMid slice" style={{ opacity: 0.16 }}>
          <path d={webPath(110, 32, 130, 0, Math.PI * 2, 14, 5)} fill="none" stroke="#fff" strokeWidth="0.7" />
        </svg>
        <span className="relative" style={{ textShadow: "0 1px 1px rgba(90,0,0,.35)" }}>
          {label}
        </span>
      </button>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-10 h-full w-full" aria-hidden="true" />
      <div ref={reticleRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-20" style={{ opacity: 0, transition: "opacity .15s" }}>
        <svg width="40" height="40" viewBox="-20 -20 40 40" style={{ position: "absolute", left: -20, top: -20, overflow: "visible" }}>
          <circle r="10" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="3.2" />
          <circle r="10" fill="none" stroke="#1d1d1f" strokeWidth="1.4" />
          {[45, 135, 225, 315].map((d) => (
            <line key={d} x1={Math.cos((d * Math.PI) / 180) * 13} y1={Math.sin((d * Math.PI) / 180) * 13} x2={Math.cos((d * Math.PI) / 180) * 18} y2={Math.sin((d * Math.PI) / 180) * 18} stroke="#d62828" strokeWidth="1.6" strokeLinecap="round" />
          ))}
          <circle r="1.7" fill="#d62828" />
        </svg>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-4 m-0 px-4 text-center text-[12px]" style={{ color: "#86868b" }}>
        Click anywhere to shoot a web. Hold and pull. Pull too hard and it snaps.
      </p>
    </div>
  );
}
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

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
