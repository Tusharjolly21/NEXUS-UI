# Mercury Switch

Add the "Mercury Switch" component from Nexus UI to my project.

Settings toggles whose knob is a bead of mercury, shaded per pixel like a real chrome drop: a bright softbox up top, a dark horizon line, a warm floor, a fine rainbow at the rim. Flip one and the bead does not slide, it reaches: the leading side pulls ahead on a neck that thins as it parts, the rest lets go and catches up, and it lands with a squash and a wobble. Drag it and it stretches after your finger. Switched on, the groove glows and the mercury picks up that colour underneath. Space or Enter flips the focused switch. Until you touch it, it flips them by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { MercurySwitch } from "@/components/mercury-switch";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mercury-switch/index.ts ---

```ts
export { MercurySwitch } from "./mercury-switch";
export type { MercurySwitchProps } from "./mercury-switch";
```

--- components/mercury-switch/mercury-switch.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ liquid chrome, shaded per pixel
 * The shape is a signed distance field (`map`, in css px, negative inside). Its depth is a pillow: round at the rim,
 * flat on top, so every point has a real surface normal. That normal reflects a studio (a bright softbox, a dark
 * horizon line, a warm floor bounce) whose image is warped by slow currents; red, green and blue are looked up a hair
 * apart, more at the rims, which is where real chrome shows its rainbow. A soft shadow falls below and to the right. */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const chrome = (o: { uniforms: string; map: string; thick: string; shadow: [number, number, number, number]; extra?: string; outside?: string; warp?: string }) => `
precision highp float;
uniform vec2 uRes, uOff; // the canvas covers only part of the component; uOff is where its corner sits
uniform float uDpr, uT, uFlow;
${o.uniforms}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float sdE(vec2 p, vec4 b){ vec2 q = (p - b.xy) / b.zw; return (length(q) - 1.0) * min(b.z, b.w); }
float sdRound(vec2 p, vec2 c, vec2 h, float r){ vec2 q = abs(p - c) - h + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
// the studio the chrome reflects, by direction: a bright sky with a softbox up and to the left, a thin lit stripe,
// a dark horizon line, and a warm, dim floor. It turns slowly, so highlights drift over the metal.
float envL(vec3 r, float t){
  float az = atan(r.x, r.z) + t * 0.12;
  float y = r.y + 0.035 * sin(az * 3.0 + t * 0.5);
  float sky = 0.36 + 0.6 * smoothstep(0.0, 0.85, y);
  float box = exp(-pow((y - 0.6) * 4.5, 2.0)) * exp(-pow((az + 0.55) * 1.4, 2.0)) * 1.15;
  float box2 = exp(-pow((y - 0.42) * 6.0, 2.0)) * exp(-pow((az - 1.4) * 1.8, 2.0)) * 0.55;
  float stripe = exp(-pow((y - 0.24) * 14.0, 2.0)) * 0.3;
  float fl = 0.17 + 0.16 * smoothstep(-1.0, -0.15, y);
  float b = mix(fl, sky + box + box2 + stripe, smoothstep(-0.07, 0.015, y));
  b *= 1.0 - 0.8 * exp(-pow((y + 0.02) * 26.0, 2.0));
  return b;
}
${o.map}
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr + uOff;
  float d = map(p);
  // far from any metal: nothing to draw, not even a shadow (most of the canvas, so it costs almost nothing)
  if (d > ${(Math.hypot(o.shadow[0], o.shadow[1]) + o.shadow[2] * 1.6 + 2).toFixed(1)} && ${o.outside ? "true" : "false"} == false) { gl_FragColor = vec4(0.0); return; }
  float sh = (1.0 - smoothstep(-${o.shadow[2].toFixed(1)}, ${(o.shadow[2] * 1.6).toFixed(1)}, map(p - vec2(${o.shadow[0].toFixed(1)}, ${o.shadow[1].toFixed(1)})))) * ${o.shadow[3].toFixed(2)};
  float a = clamp(-d * uDpr + 0.5, 0.0, 1.0);
  ${o.outside ?? ""}
  if (a <= 0.0) { gl_FragColor = vec4(0.0, 0.0, 0.0, sh); return; }
  float R = ${o.thick};
  float x = clamp(-d / R, 0.0, 1.0);
  float h = sqrt(max(1.0 - (1.0 - x) * (1.0 - x), 0.0));
  vec2 e = vec2(0.6, 0.0);
  vec2 g = vec2(map(p + e.xy) - map(p - e.xy), map(p + e.yx) - map(p - e.yx)) / 1.2;
  g.y = -g.y;
  float t = uT * (1.0 + uFlow * 2.2);
  // the surface itself is never quite still: slow swells move across it, faster while the metal is moving
  vec2 sw = vec2(vnoise(p * 0.035 + vec2(t * 0.3, 0.0)), vnoise(p * 0.035 + vec2(4.1, t * 0.27))) - 0.5;
  vec2 sl = g * (1.0 - x) / max(h, 0.1) + sw * (0.16 + 0.3 * uFlow) * (0.4 + 0.6 * h);
  ${o.warp ?? ""}
  // red, green and blue bend by slightly different amounts: a fine rainbow where the surface turns steeply
  vec3 c;
  for (int j = 0; j < 3; j++) {
    float f = 1.0 + (float(j) - 1.0) * 0.07;
    vec3 nn = normalize(vec3(sl * f, 1.0));
    vec3 rr = reflect(normalize(vec3(0.0, 0.1, -1.0)), nn);
    float v = envL(rr, t);
    if (j == 0) c.r = v; else if (j == 1) c.g = v; else c.b = v;
  }
  vec3 n = normalize(vec3(sl, 1.0));
  vec3 r = reflect(normalize(vec3(0.0, 0.1, -1.0)), n);
  c *= mix(vec3(1.0, 0.93, 0.84), vec3(0.94, 0.95, 1.0), smoothstep(-0.25, 0.3, r.y));
  float fres = pow(1.0 - n.z, 2.0);
  c += fres * 0.1;
  c *= 0.62 + 0.38 * smoothstep(0.0, 0.14, x);
  ${o.extra ?? ""}
  gl_FragColor = vec4(c * a, a + sh * (1.0 - a));
}`;
const within = (host: HTMLElement, el: Element, pad = 0) => { const s = host.getBoundingClientRect(), b = el.getBoundingClientRect(), k = s.width / (host.offsetWidth || 1); return { l: (b.left - s.left) / k - pad, t: (b.top - s.top) / k - pad, r: (b.right - s.left) / k + pad, b: (b.bottom - s.top) / k + pad }; };
/** Fit a canvas over just the part of `host` that `area` covers (both in host px), so only those pixels are shaded. */
function fitCanvas(cv: HTMLCanvasElement, host: HTMLElement, area: { l: number; t: number; r: number; b: number }) {
  const k = host.getBoundingClientRect().width / (host.offsetWidth || 1);
  const l = Math.max(0, Math.floor(area.l)), t = Math.max(0, Math.floor(area.t));
  const w = Math.min(host.offsetWidth, Math.ceil(area.r)) - l, h = Math.min(host.offsetHeight, Math.ceil(area.b)) - t;
  const dpr = Math.min(2, window.devicePixelRatio || 1) * k;
  Object.assign(cv.style, { left: `${l}px`, top: `${t}px`, width: `${w}px`, height: `${h}px` });
  cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
  return { dpr, off: [l, t] as const };
}
/** Compile the shader into a WebGL canvas. Returns null where WebGL isn't available. */
function glSetup(cv: HTMLCanvasElement, frag: string) {
  const g = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!g) return null;
  const mk = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s)); return s; };
  const pr = g.createProgram()!;
  g.attachShader(pr, mk(g.VERTEX_SHADER, VERT)); g.attachShader(pr, mk(g.FRAGMENT_SHADER, frag)); g.linkProgram(pr);
  if (!g.getProgramParameter(pr, g.LINK_STATUS)) return null;
  g.useProgram(pr);
  const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
  g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
  const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
  const U = (n: string) => g.getUniformLocation(pr, n);
  return { g, U };
}

const R0 = 11; // the bead's radius at rest
const FRAG = chrome({
  uniforms: "uniform vec4 uB[6]; uniform vec4 uS[3]; uniform vec3 uA[3];",
  thick: "11.0",
  shadow: [1, 4, 3, 0.5],
  map: `
float map(vec2 p){
  float d = 1e5;
  for (int i = 0; i < 3; i++) {
    vec4 a = uB[i * 2], b = uB[i * 2 + 1];
    // two blobs of one bead: when they part, the bridge between them thins to a neck, as mercury does
    float k = 9.0 - 3.5 * clamp(abs(a.x - b.x) / 26.0, 0.0, 1.0);
    d = min(d, smin(sdE(p, a), sdE(p, b), k));
  }
  return d;
}`,
  extra: `
  // the groove under a switched-on bead glows, and the metal picks the colour up on its underside
  for (int i = 0; i < 3; i++) {
    vec2 q = p - uS[i].xy;
    float w = exp(-dot(q, q) / 900.0) * uS[i].z;
    c += uA[i] * w * smoothstep(-0.25, -0.9, r.y) * 0.55 * (1.0 - 0.55 * h);
  }`,
});

const ROWS = [
  { id: "wifi", label: "Wi-Fi", on: "Connected to Studio", off: "Off", accent: [0.2, 0.85, 0.42] as const, css: "48,209,88", start: true, icon: <path d="M4.5 9.5a11 11 0 0 1 15 0M7.3 12.6a7 7 0 0 1 9.4 0M10 15.6a3 3 0 0 1 4 0M12 18.6h.01" /> },
  { id: "focus", label: "Do Not Disturb", on: "Until tomorrow, 7:00", off: "Off", accent: [0.46, 0.42, 1.0] as const, css: "94,92,230", start: false, icon: <path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" /> },
  { id: "power", label: "Low Power Mode", on: "Background activity paused", off: "Off", accent: [1.0, 0.72, 0.18] as const, css: "255,159,10", start: false, icon: <><rect x="3.5" y="8" width="15" height="8" rx="2.2" /><path d="M21 11v2M7 11v2" /></> },
];

interface Bead { L: number; vL: number; T: number; vT: number; j: number; vj: number; on: number; drag: number | null; y: number; l: number; r: number }

export interface MercurySwitchProps {
  /** flips the switches by itself until the first touch */
  autoplay?: boolean;
  /** called with the id of the switch (wifi, focus or power) and its new state */
  onChange?: (id: string, on: boolean) => void;
}

/**
 * MercurySwitch: settings toggles whose knob is a bead of mercury.
 *
 * Each knob is liquid chrome, shaded per pixel: rounded like a real drop, reflecting a studio whose image drifts as
 * if the metal were moving, with a faint rainbow at its rim. Flip a switch and the bead doesn't slide: it reaches.
 * Its leading side pulls ahead toward the other end while the rest holds back, the two drawn together by a neck that
 * thins as they part; then the back lets go and catches up, and the bead lands with a squash and a wobble. Drag it
 * and it stretches after your finger. When a switch is on, the groove beneath glows in its colour and the mercury
 * reflects that glow on its underside.
 *
 * `onChange(id, on)` fires on each flip. Space toggles from the keyboard. `autoplay` flips them until the first
 * real interaction. Reduced motion moves the bead without the stretch.
 */
export function MercurySwitch({ autoplay = false, onChange }: MercurySwitchProps) {
  const reduce = useReducedMotion();
  const card = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const tracks = useRef<(HTMLButtonElement | null)[]>([]);
  const touched = useRef(false);
  const [on, setOn] = useState(ROWS.map((r) => r.start));
  const onRef = useRef(on);
  useLayoutEffect(() => { onRef.current = on; }, [on]);
  const beads = useRef<Bead[]>(ROWS.map((r) => ({ L: 0, vL: 0, T: 0, vT: 0, j: 0, vj: 0, on: r.start ? 1 : 0, drag: null, y: 0, l: 0, r: 0 })));
  const [gl, setGl] = useState(true);

  const set = (i: number, v: boolean) => {
    if (onRef.current[i] === v) return;
    const n = [...onRef.current]; n[i] = v;
    onRef.current = n; setOn(n);
    onChange?.(ROWS[i].id, v);
  };

  useEffect(() => {
    const cv = cvs.current, st = card.current; if (!cv || !st) return;
    const w = glSetup(cv, FRAG);
    if (!w) { setGl(false); return; }
    const { g, U } = w;
    const uRes = U("uRes"), uDpr = U("uDpr"), uT = U("uT"), uFlow = U("uFlow"), uB = U("uB"), uS = U("uS"), uA = U("uA");
    g.uniform3fv(uA, new Float32Array(ROWS.flatMap((r) => [...r.accent])));
    let dpr = 1, k = 1, off: readonly [number, number] = [0, 0];
    const uOff = U("uOff");
    // the canvas covers only the column of switches, with room for a stretched bead and its shadow
    const size = () => {
      const rs = tracks.current.filter(Boolean).map((el) => within(st, el!, 14));
      if (!rs.length) return;
      const f = fitCanvas(cv, st, { l: Math.min(...rs.map((r) => r.l)), t: Math.min(...rs.map((r) => r.t)), r: Math.max(...rs.map((r) => r.r)), b: Math.max(...rs.map((r) => r.b)) });
      dpr = f.dpr; off = f.off;
      g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    const B = new Float32Array(24), S = new Float32Array(12);
    let raf = 0, last = performance.now(), time = 2, init = false;
    const draw = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      const sr = st.getBoundingClientRect(); k = sr.width / (st.offsetWidth || 1);
      let moving = 0;
      beads.current.forEach((b, i) => {
        const el = tracks.current[i]; if (!el) return;
        const tr = el.getBoundingClientRect();
        b.l = (tr.left - sr.left) / k + 4 + R0; b.r = (tr.right - sr.left) / k - 4 - R0; b.y = (tr.top + tr.height / 2 - sr.top) / k;
        const want = b.drag ?? (onRef.current[i] ? b.r : b.l);
        if (!init) { b.L = b.T = want; }
        if (reduce) { b.L = b.T = want; b.vL = b.vT = 0; }
        else {
          // the side facing where it's going leads, stiff; the rest trails, soft
          const kl = b.drag !== null ? 700 : 130, kt = b.drag !== null ? 120 : 46;
          const aL = (want - b.L) * kl - b.vL * 2 * Math.sqrt(kl) * 0.62;
          const vPrev = b.vL;
          b.vL += aL * dt; b.L += b.vL * dt;
          b.vT += ((b.L - b.T) * kt - b.vT * 2 * Math.sqrt(kt) * 0.72) * dt; b.T += b.vT * dt;
          // when the lead side stops short it squashes against the wall and wobbles
          b.vj += (-(b.vL - vPrev) / Math.max(dt, 1e-3) * 0.00011 - b.j * 950 - b.vj * 15) * dt; b.j += b.vj * dt;
          b.j = Math.max(-0.3, Math.min(0.3, b.j));
        }
        b.on += ((onRef.current[i] ? 1 : 0) - b.on) * Math.min(1, dt * 6);
        const s = Math.min(1, Math.abs(b.L - b.T) / (2.2 * R0));
        const rL = R0 * (1 - 0.16 * s), rT = R0 * (1 - 0.42 * s);
        const dir = Math.sign(b.L - b.T) || 1;
        const sq = b.j * dir;
        B.set([b.L, b.y, rL * (1 + sq), rL * (1 - sq * 0.7), b.T, b.y, rT * (1 + s * 0.12), rT], i * 8);
        S.set([(b.L + b.T) / 2, b.y + 6, b.on, 0], i * 4);
        moving = Math.max(moving, Math.min(1, (Math.abs(b.vL) + Math.abs(b.vT)) / 500));
      });
      init = true;
      time += dt * (1 + moving * 2);
      g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
      g.uniform2f(uRes, cv.width, cv.height); g.uniform2f(uOff, off[0], off[1]); g.uniform1f(uDpr, dpr); g.uniform1f(uT, reduce ? 2 : time); g.uniform1f(uFlow, moving);
      g.uniform4fv(uB, B); g.uniform4fv(uS, S);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(draw); } });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); };
  }, [reduce]);

  // the demo: flip each switch in turn, then put them back
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1200);
      while (live && !touched.current) {
        for (const i of [1, 2, 0]) { if (!live || touched.current) return; set(i, !onRef.current[i]); await sleep(1300); }
        for (const i of [0, 1, 2]) { if (!live || touched.current) return; set(i, ROWS[i].start); await sleep(1000); }
        await sleep(900);
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  // drag: the bead stretches after your finger; a tap just flips it
  const start = useRef<{ x: number; moved: boolean } | null>(null);
  const local = (e: RPointerEvent<HTMLButtonElement>) => { const s = card.current!.getBoundingClientRect(), k = s.width / (card.current!.offsetWidth || 1); return (e.clientX - s.left) / k; };
  const down = () => (e: RPointerEvent<HTMLButtonElement>) => { touched.current = true; e.currentTarget.setPointerCapture(e.pointerId); start.current = { x: local(e), moved: false }; };
  const move = (i: number) => (e: RPointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const x = local(e), b = beads.current[i];
    if (Math.abs(x - start.current.x) > 4) start.current.moved = true;
    if (start.current.moved) b.drag = Math.max(b.l - 6, Math.min(b.r + 6, x));
  };
  const up = (i: number) => () => {
    const b = beads.current[i], s = start.current; start.current = null;
    if (!s) return;
    if (s.moved && b.drag !== null) set(i, b.drag > (b.l + b.r) / 2); else set(i, !onRef.current[i]);
    b.drag = null;
  };

  return (
    <div ref={card} className="relative w-full max-w-[460px] select-none rounded-[26px] bg-[linear-gradient(180deg,#1c1c1f,#121214)] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_0_0_1px_#050506,0_30px_60px_-30px_rgba(0,0,0,.8)]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      {ROWS.map((r, i) => (
        <div key={r.id} className={`flex items-center gap-3.5 px-4 py-3.5 ${i ? "border-t border-white/[.06]" : ""}`}>
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] transition-colors duration-500" style={{ background: on[i] ? `rgba(${r.css},.16)` : "rgba(255,255,255,.05)", color: on[i] ? `rgb(${r.css})` : "#8e8e93" }}>
            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{r.icon}</svg>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-medium tracking-[-0.01em] text-[#f2f2f5]">{r.label}</span>
            <span className="block truncate text-[12.5px] text-white/55">{on[i] ? r.on : r.off}</span>
          </span>
          <button
            ref={(el) => { tracks.current[i] = el; }}
            type="button"
            role="switch"
            aria-checked={on[i]}
            aria-label={r.label}
            onPointerDown={down()}
            onPointerMove={move(i)}
            onPointerUp={up(i)}
            onPointerCancel={up(i)}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); touched.current = true; set(i, !onRef.current[i]); } }}
            className="relative h-[30px] w-[54px] shrink-0 touch-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            style={{ background: "#0a0a0b", boxShadow: "inset 0 2px 5px rgba(0,0,0,.85), inset 0 -1px 0 rgba(255,255,255,.07), 0 1px 0 rgba(255,255,255,.04)" }}
          >
            {/* the glow in the groove when it's on */}
            <span aria-hidden className="absolute inset-[2px] rounded-full transition-opacity duration-500" style={{ opacity: on[i] ? 1 : 0, background: `radial-gradient(70% 120% at 70% 60%, rgba(${r.css},.55), rgba(${r.css},.12) 60%, transparent 100%)`, boxShadow: `inset 0 2px 4px rgba(0,0,0,.6)` }} />
            {!gl && <span aria-hidden className="absolute top-[4px] h-[22px] w-[22px] rounded-full transition-[left] duration-300" style={{ left: on[i] ? 28 : 4, background: "radial-gradient(circle at 40% 30%, #fff, #b9bcc8 45%, #5d606c 80%, #2a2b31)" }} />}
          </button>
        </div>
      ))}
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute" style={{ display: gl ? "block" : "none" }} />
    </div>
  );
}
```
