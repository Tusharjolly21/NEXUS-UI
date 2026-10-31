# Mercury Tabs

Add the "Mercury Tabs" component from Nexus UI to my project.

A tab bar whose selection is a frame of liquid metal, and the frame moves like mercury. The active tab sits in a rounded frame of chrome whose reflection never stops sliding: highlights drift across it, split round its corners and meet again, with short rainbows of blue and gold where a dark band's edge passes. Pick another tab and the frame does not jump: its leading edge flows out toward the new tab first, the rest follows, the metal thinning and flattening as it stretches, and it arrives with a wobble, bulging a little before it settles. Hover a tab and the frame leans toward it; any tab the metal flows across swells beneath it with faint red and blue edges, like a drop of glass. The sun at the end flips the theme: the new look spreads out from the switch in a circle and the chrome starts reflecting a bright room. Arrow keys move between tabs. Until you touch it, it tours the tabs and flips the theme by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { MercuryTabs } from "@/components/mercury-tabs";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/mercury-tabs/index.ts ---

```ts
export { MercuryTabs } from "./mercury-tabs";
export type { MercuryTabsProps } from "./mercury-tabs";
```

--- components/mercury-tabs/mercury-tabs.tsx ---

```tsx
"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type ReactElement } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionTemplate, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ the frame: a rounded-square ring of liquid chrome */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform vec4 uBox;       // centre x, centre y, half width, half height (css px, y down)
uniform float uRad, uW, uT, uDpr, uLight, uBoost, uFlow;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
float bump(float v, float at, float w){ float d = fract(v - at + 0.5) - 0.5; return exp(-(d * d) / (w * w)); }
// the room the chrome reflects, as stripes of light; a lit room is brighter and has softer bands
float env(float u){
  float b = 0.86 + 0.18 * cos(6.2831853 * (u - 0.1));
  b *= 1.0 - mix(0.92, 0.7, uLight) * bump(u, 0.36, 0.018);
  b *= 1.0 - mix(0.75, 0.55, uLight) * bump(u, 0.63, 0.012);
  b *= 1.0 - 0.3 * bump(u, 0.82, 0.08);
  b += 0.5 * bump(u, 0.06, 0.02);
  return b;
}
float sd(vec2 p){ return sdBox(p - uBox.xy, uBox.zw, uRad); }
void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  float d = sd(p);
  float a = clamp(-d * uDpr + 0.5, 0.0, 1.0) * clamp((d + uW) * uDpr + 0.5, 0.0, 1.0);
  if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = clamp((d + uW) / uW, 0.0, 1.0);      // across the tube, inside to outside
  float s = t * 2.0 - 1.0;
  vec2 e = vec2(0.6, 0.0);
  vec2 n = normalize(vec2(sd(p + e.xy) - sd(p - e.xy), -(sd(p + e.yx) - sd(p - e.yx))) + 1e-5); // y up, like a room
  // what each point sees: set mostly by which way it faces, a little by where it is along the frame, pushed about by
  // slow currents; while the frame travels the currents run faster, as if it were being stirred
  vec2 rel = (p - uBox.xy) / max(uBox.zw, vec2(1.0));
  vec2 P = n * (1.0 + 0.05 * s) + vec2(rel.x, -rel.y) * 0.3;
  float tm = uT * (1.0 + 0.6 * uBoost);
  vec2 cur = vec2(vnoise(P * 1.2 + vec2(tm * 0.16, 1.3)), vnoise(P * 1.2 + vec2(5.2, -tm * 0.13))) - 0.5;
  P += cur * (0.38 + 0.4 * uFlow);
  float u = dot(P, vec2(0.7071, 0.7071)) * 0.72 - tm * 0.1;
  float k = 0.011;
  vec3 c = vec3(env(u + k), env(u), env(u - k * 1.1));
  c *= mix(vec3(0.9, 0.92, 1.0), vec3(1.0, 0.94, 0.82), bump(u, 0.14, 0.06));
  float prof = smoothstep(0.0, 0.2, t) * (1.0 - 0.6 * smoothstep(0.8, 1.0, t));
  c *= mix(mix(0.32, 0.45, uLight), 1.06, prof) * (0.93 + 0.07 * n.y);
  gl_FragColor = vec4(c * a, a);
}`;

/* ------------------------------------------------------------------ icons, drawn for this */
const I = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS: Record<string, ReactElement> = {
  overview: <svg viewBox="0 0 24 24" {...I}><rect x="4" y="4" width="6.5" height="8" rx="1.8" /><rect x="13.5" y="4" width="6.5" height="5" rx="1.8" /><rect x="4" y="15" width="6.5" height="5" rx="1.8" /><rect x="13.5" y="12" width="6.5" height="8" rx="1.8" /></svg>,
  insights: <svg viewBox="0 0 24 24" {...I}><path d="M6 19v-5M10 19V9M14 19v-7M18 19V5" /></svg>,
  layers: <svg viewBox="0 0 24 24" {...I}><path d="M12 4 20.5 8.5 12 13 3.5 8.5Z" /><path d="m3.5 12.3 8.5 4.5 8.5-4.5" /><path d="m3.5 16 8.5 4.5 8.5-4.5" /></svg>,
  wallet: <svg viewBox="0 0 24 24" {...I}><path d="M4.5 7.5A2.5 2.5 0 0 1 7 5h10.5v2.5" /><rect x="4.5" y="7.5" width="15" height="11.5" rx="2.6" /><path d="M19.5 11h-3a2 2 0 0 0 0 4h3" /></svg>,
};
const Sun = () => <svg viewBox="0 0 24 24" {...I}><circle cx="12" cy="12" r="4" /><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M5.5 18.5l1.4-1.4M17.1 6.9l1.4-1.4" /></svg>;
const Moon = () => <svg viewBox="0 0 24 24" {...I}><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" /><path d="M17 3.5v3M15.5 5h3M20.5 8v2M19.5 9h2" /></svg>;

const TABS = [
  { id: "overview", label: "Overview", line: "Everything at a glance." },
  { id: "insights", label: "Insights", line: "Up 12% on last week." },
  { id: "layers", label: "Layers", line: "Four layers, two hidden." },
  { id: "wallet", label: "Wallet", line: "Three cards, one default." },
];

const LOOK = {
  dark: { stage: "radial-gradient(120% 90% at 50% 0%, #2a2a2d 0%, #151517 55%, #0c0c0d 100%)", bar: "linear-gradient(180deg,#1d1d20,#141416)", barEdge: "inset 0 1px 0 rgba(255,255,255,.06), inset 0 -1px 0 rgba(0,0,0,.6), 0 0 0 1px #050506, 0 18px 40px -18px rgba(0,0,0,.9)", well: "#0e0e10", wellEdge: "inset 0 1px 3px rgba(0,0,0,.7)", tile: "linear-gradient(180deg,#232327,#18181b)", icon: "#8d8d93", on: "#f2f2f5", rule: "rgba(255,255,255,.06)", text: "#f2f2f5", sub: "rgba(255,255,255,.45)" },
  light: { stage: "radial-gradient(120% 90% at 50% 0%, #fbfbfc 0%, #ededef 60%, #e2e2e5 100%)", bar: "linear-gradient(180deg,#ffffff,#f6f6f7)", barEdge: "inset 0 1px 0 #fff, 0 0 0 1px rgba(0,0,0,.06), 0 18px 40px -20px rgba(0,0,0,.28)", well: "#e9e9ec", wellEdge: "inset 0 1px 3px rgba(0,0,0,.12)", tile: "linear-gradient(180deg,#ffffff,#f3f3f5)", icon: "#9a9aa1", on: "#1d1d1f", rule: "rgba(0,0,0,.07)", text: "#1d1d1f", sub: "rgba(0,0,0,.62)" },
};

export interface MercuryTabsProps {
  /** Tours the tabs and flips the theme until the first real interaction. Held still under reduced motion. */
  autoplay?: boolean;
  /** The tab that starts selected: "overview", "insights", "layers" or "wallet". */
  defaultTab?: string;
  /** Called with the id of the tab that was just chosen. */
  onChange?: (id: string) => void;
  /** Control the theme yourself. Leave it out and the sun/moon switch keeps its own. */
  theme?: "dark" | "light";
  /** Called with the theme the switch is asking for. */
  onThemeChange?: (t: "dark" | "light") => void;
  /** The tab's name and one-line caption above the bar. Turn it off to show the bar alone. */
  showHeading?: boolean;
  className?: string;
}

/**
 * MercuryTabs: a tab bar whose selection is a frame of liquid metal, and the frame moves like mercury.
 *
 * The active tab sits in a rounded frame of chrome whose reflection never stops sliding: highlights drift across it,
 * split round its corners and meet again, with short rainbows of blue and gold where a dark band's edge passes. Pick
 * another tab and the frame doesn't jump or slide: its leading edge flows out toward the new tab first, the rest
 * follows, the metal thinning and the frame flattening as it stretches, and it arrives with a wobble, bulging a little
 * before it settles round the new tile. Hover a tab and the frame leans toward it. The reflection churns while it
 * travels, and any tab it flows across swells beneath it with faint red and blue edges, as if seen through a drop of
 * glass. The sun at the end flips the theme: the new look spreads out from the switch in a circle, and the chrome
 * starts reflecting a bright room instead of a dark one.
 *
 * `defaultTab`, `onChange(id)`, `theme` / `onThemeChange` (uncontrolled by default). Arrow keys move between tabs.
 * `autoplay` tours the tabs and flips the theme until the first real interaction. Reduced motion moves the frame
 * without the flow.
 */
export function MercuryTabs({ autoplay = false, defaultTab = "overview", onChange, theme: themeProp, onThemeChange, showHeading = true, className = "" }: MercuryTabsProps) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const tiles = useRef<(HTMLButtonElement | null)[]>([]);
  const toggle = useRef<HTMLButtonElement>(null);
  const touched = useRef(false);
  const [active, setActive] = useState(Math.max(0, TABS.findIndex((t) => t.id === defaultTab)));
  const [hover, setHover] = useState<number | null>(null);
  const [themeState, setThemeState] = useState<"dark" | "light">("dark");
  const theme = themeProp ?? themeState;
  const [gl, setGl] = useState(true);
  const live = useRef({ active, hover: hover as number | null, light: theme === "light" ? 1 : 0 });
  useLayoutEffect(() => {
    live.current.active = active;
    live.current.hover = hover;
  });
  // the light theme spreads from the switch in a growing circle
  const reveal = useMotionValue(theme === "light" ? 150 : 0);
  const ox = useMotionValue(90), oy = useMotionValue(50);
  const clip = useMotionTemplate`circle(${reveal}% at ${ox}% ${oy}%)`;
  const revealTo = useRef(theme === "light" ? 150 : 0);
  // the icons the travelling metal passes over, so it can magnify them like a drop of glass
  const glyphs = useRef<(HTMLSpanElement | null)[][]>([[], []]);

  const choose = (i: number, real = true) => {
    if (real) touched.current = true;
    if (i === live.current.active) return;
    setActive(i); onChange?.(TABS[i].id);
  };
  const flip = (real = true) => {
    if (real) touched.current = true;
    const next = theme === "dark" ? "light" : "dark";
    const s = stage.current, b = toggle.current;
    if (s && b) {
      const r = s.getBoundingClientRect(), q = b.getBoundingClientRect();
      ox.set(((q.left + q.width / 2 - r.left) / r.width) * 100); oy.set(((q.top + q.height / 2 - r.top) / r.height) * 100);
    }
    if (!themeProp) setThemeState(next);
    onThemeChange?.(next);
    show(next);
  };
  const show = (t: "dark" | "light") => {
    const to = t === "light" ? 150 : 0;
    live.current.light = t === "light" ? 1 : 0;
    if (revealTo.current === to) return;
    revealTo.current = to;
    if (reduce) reveal.set(to);
    else animate(reveal, to, { duration: 0.9, ease: [0.65, 0, 0.35, 1] });
  };
  // a theme handed in from outside takes the same road as the switch
  useEffect(() => {
    show(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // the metal frame: springs for its two ends, so it flows from tile to tile like a drop of mercury
  useEffect(() => {
    const cv = cvs.current, st = stage.current; if (!cv || !st) return;
    const g = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!g) { setGl(false); return; }
    const mk = (type: number, src: string) => { const x = g.createShader(type)!; g.shaderSource(x, src); g.compileShader(x); return x; };
    const pr = g.createProgram()!;
    g.attachShader(pr, mk(g.VERTEX_SHADER, VERT)); g.attachShader(pr, mk(g.FRAGMENT_SHADER, FRAG)); g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) { setGl(false); return; }
    g.useProgram(pr);
    const buf = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n: string) => g.getUniformLocation(pr, n);
    const uRes = U("uRes"), uBox = U("uBox"), uRad = U("uRad"), uW = U("uW"), uT = U("uT"), uDpr = U("uDpr"), uLight = U("uLight"), uBoost = U("uBoost"), uFlow = U("uFlow");
    let dpr = 1, W = 0, H = 0;
    const size = () => {
      const r = st.getBoundingClientRect(), k = r.width / (st.offsetWidth || 1);
      W = st.offsetWidth; H = st.offsetHeight; dpr = Math.min(2, window.devicePixelRatio || 1) * k;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    // where a tile is, in the stage's own pixels (so it works inside scaled previews too)
    const rect = (i: number) => {
      const el = tiles.current[i]; if (!el) return null;
      const s = st.getBoundingClientRect(), b = el.getBoundingClientRect(), k = s.width / (st.offsetWidth || 1);
      return { l: (b.left - s.left) / k, r: (b.right - s.left) / k, t: (b.top - s.top) / k, b: (b.bottom - s.top) / k };
    };
    const M = 4.5; // the frame sits this far outside the tile
    let L = 0, R = 0, vL = 0, vR = 0, Tp = 0, Bt = 0, init = false, time = 3, light = live.current.light, boost = 0, flow = 0;
    let raf = 0, last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000); last = now;
      const a = rect(live.current.active);
      if (a) {
        let tL = a.l - M, tR = a.r + M;
        // hovering another tab: the frame leans toward it, as if drawn by it
        const h = live.current.hover;
        if (h !== null && h !== live.current.active) { const lean = h > live.current.active ? 5 : -5; if (lean > 0) tR += lean; else tL += lean; }
        if (!init) { L = tL; R = tR; Tp = a.t - M; Bt = a.b + M; init = true; }
        Tp = a.t - M; Bt = a.b + M;
        if (reduce) { L = tL; R = tR; vL = vR = 0; }
        else {
          // the end nearest the new tab leads, stiff and quick; the other trails, softer: the frame stretches, then catches up
          const dir = Math.sign((tL + tR) / 2 - (L + R) / 2);
          const kLead = 150, kTrail = 62;
          const kl = dir < 0 ? kLead : kTrail, kr = dir > 0 ? kLead : kTrail;
          vL += ((tL - L) * kl - vL * 2 * Math.sqrt(kl) * 0.68) * dt; L += vL * dt;
          vR += ((tR - R) * kr - vR * 2 * Math.sqrt(kr) * 0.68) * dt; R += vR * dt;
        }
        const base = a.r - a.l + 2 * M, width = Math.max(10, R - L), stretch = width / base;
        // the metal keeps its volume: stretched, it thins and flattens; squeezed, it fattens and bulges
        const hh = ((Bt - Tp) / 2) * Math.pow(1 / stretch, 0.32);
        const w = Math.max(1.6, Math.min(5.5, 3.4 / Math.pow(stretch, 0.6)));
        const moving = Math.min(1, (Math.abs(vL) + Math.abs(vR)) / 900);
        flow += (moving - flow) * Math.min(1, dt * 6);
        boost += ((live.current.hover !== null ? 1 : 0) - boost) * Math.min(1, dt * 5);
        light += (live.current.light - light) * Math.min(1, dt * 3);
        time += dt * (1 + flow * 2.5 + boost * 0.4);
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes, cv.width, cv.height);
        g.uniform4f(uBox, (L + R) / 2, (Tp + Bt) / 2, width / 2, hh);
        g.uniform1f(uRad, Math.min(hh, Math.min(19, width / 2)));
        g.uniform1f(uW, w); g.uniform1f(uT, reduce ? 3 : time); g.uniform1f(uDpr, dpr);
        g.uniform1f(uLight, light); g.uniform1f(uBoost, boost); g.uniform1f(uFlow, flow);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
        // as the metal flows over the tabs between, it lenses them: each icon swells under the drop and its edges split
        // into faint red and blue, the way a bead of glass bends what is beneath it
        const mid = (L + R) / 2;
        for (let i = 0; i < TABS.length; i++) {
          const ti = rect(i); if (!ti) continue;
          const c = (ti.l + ti.r) / 2, inside = mid > L - 4 && c > L && c < R ? 1 : 0;
          const near = Math.max(0, 1 - Math.abs(c - mid) / (width / 2 + 10));
          const lens = i === live.current.active ? 0 : Math.min(1, flow * 1.4) * Math.max(near, inside * 0.6);
          for (const set of glyphs.current) {
            const el = set[i]; if (!el) continue;
            el.style.transform = lens > 0.01 ? `scale(${(1 + 0.22 * lens).toFixed(3)})` : "";
            el.style.filter = lens > 0.05 ? `drop-shadow(${(-0.9 * lens).toFixed(2)}px 0 0 rgba(255,60,60,${(0.55 * lens).toFixed(2)})) drop-shadow(${(0.9 * lens).toFixed(2)}px 0 0 rgba(60,140,255,${(0.55 * lens).toFixed(2)}))` : "";
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(draw); } });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); vis.disconnect(); };
  }, [reduce]);

  // the demo: tour the tabs, flip the theme, tour back
  useEffect(() => {
    if (!autoplay || reduce) return;
    let on = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1400);
      const seq = [1, 3, 2, 0];
      while (on && !touched.current) {
        for (const i of seq) { if (!on || touched.current) return; setHover(i); await sleep(380); setHover(null); choose(i, false); await sleep(1500); }
        if (!on || touched.current) return;
        flip(false); await sleep(2200);
      }
    })();
    return () => { on = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const keys = (e: RKeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const i = (active + d + TABS.length) % TABS.length;
    choose(i); tiles.current[i]?.focus();
  };

  // one look, drawn for either theme; the light one is laid over the dark and revealed in a circle
  const face = (look: typeof LOOK.dark, interactive: boolean, layer: number) => (
    <div className="absolute inset-0 grid place-items-center" style={{ background: look.stage }} aria-hidden={!interactive || undefined}>
      <div className="flex w-full max-w-[520px] flex-col items-center gap-7 px-2 sm:px-4">
        {showHeading && (
          <div className="h-[52px] text-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={TABS[active].id} initial={{ opacity: 0, y: 10, filter: "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ y: { type: "spring", stiffness: 260, damping: 26 }, opacity: { duration: 0.3 }, filter: { duration: 0.3, ease: "easeOut" } }}>
                <p className="m-0 text-[22px] font-semibold tracking-[-0.02em]" style={{ color: look.text }}>{TABS[active].label}</p>
                <p className="m-0 mt-1 text-[13px]" style={{ color: look.sub }}>{TABS[active].line}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        <div className="flex items-stretch rounded-[26px] p-[5px] sm:p-[7px]" style={{ background: look.bar, boxShadow: look.barEdge }}>
          <div role={interactive ? "tablist" : undefined} aria-label={interactive ? "Sections" : undefined} onKeyDown={interactive ? keys : undefined} className="flex items-center">
            {TABS.map((t, i) => (
              <div key={t.id} className="flex items-center">
                {i > 0 && <span className="mx-[3px] h-7 w-px sm:mx-[5px]" style={{ background: look.rule }} />}
                <button
                  ref={interactive ? (el) => { tiles.current[i] = el; } : undefined}
                  type="button"
                  role={interactive ? "tab" : undefined}
                  aria-selected={interactive ? i === active : undefined}
                  aria-label={interactive ? t.label : undefined}
                  tabIndex={interactive ? (i === active ? 0 : -1) : -1}
                  onClick={interactive ? () => choose(i) : undefined}
                  onPointerEnter={interactive ? () => setHover(i) : undefined}
                  onPointerLeave={interactive ? () => setHover(null) : undefined}
                  className="relative grid h-[clamp(36px,10vw,54px)] w-[clamp(36px,10vw,54px)] place-items-center rounded-[16px] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
                  style={{ background: i === active ? look.tile : "transparent", color: i === active ? look.on : look.icon }}
                >
                  <span ref={(el) => { glyphs.current[layer][i] = el; }} className="block h-[42%] w-[42%]" style={{ willChange: "transform" }}>{ICONS[t.id]}</span>
                </button>
              </div>
            ))}
          </div>
          <div className="ml-[6px] grid place-items-center rounded-[20px] px-[3px] sm:ml-[10px]" style={{ background: look.well, boxShadow: look.wellEdge }}>
            <button
              ref={interactive ? toggle : undefined}
              type="button"
              aria-label={interactive ? (theme === "dark" ? "Switch to light" : "Switch to dark") : undefined}
              aria-pressed={interactive ? theme === "light" : undefined}
              tabIndex={interactive ? 0 : -1}
              onClick={interactive ? () => flip() : undefined}
              className="grid h-[clamp(36px,10vw,54px)] w-[clamp(36px,10vw,54px)] place-items-center rounded-[16px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]/50"
              style={{ color: look.on }}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span key={theme} className="block h-[42%] w-[42%]" initial={{ opacity: 0, rotate: -70, scale: 0.6 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 70, scale: 0.6 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  {theme === "dark" ? <Sun /> : <Moon />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={stage} className={`relative h-[300px] w-full max-w-[720px] select-none overflow-hidden rounded-[28px] ${className}`} style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      {face(LOOK.dark, theme === "dark", 0)}
      <motion.div className="absolute inset-0" style={{ clipPath: clip, pointerEvents: theme === "light" ? "auto" : "none" }}>
        {face(LOOK.light, theme === "light", 1)}
      </motion.div>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" style={{ display: gl ? "block" : "none" }} />
    </div>
  );
}
```
