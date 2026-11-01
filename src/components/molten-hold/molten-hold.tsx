"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { audioAwake, playDef, useAutoplaySoundAllowed } from "@/lib/ui-sounds";
import { moltenHoldSound, type MoltenHoldSound } from "./molten-hold-sound";

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

const FRAG = chrome({
  uniforms: "uniform vec4 uCh; uniform float uFront, uHeat, uRip, uWave;",
  thick: "11.0",
  shadow: [0, 2, 2.5, 0.35],
  map: `
// the channel the metal fills (centre x, centre y, half width, half height), and the molten front
float frontAt(float y){
  float cy = uCh.y, hh = uCh.w;
  float q = (y - cy) / hh;
  // a meniscus that bulges forward in the middle, and shivers while it flows
  return uFront + 7.0 * (1.0 - q * q) + uWave * (1.6 * sin(y * 0.42 + uT * 11.0) + 1.1 * sin(y * 0.19 - uT * 7.0));
}
float map(vec2 p){
  float body = sdRound(p, uCh.xy, uCh.zw, uCh.w);
  return smax(body, p.x - frontAt(p.y), 7.0);
}`,
  outside: `
  // the heat the molten front throws onto the groove ahead of it
  if (a <= 0.0) {
    float ahead = p.x - frontAt(p.y);
    float inCh = 1.0 - smoothstep(-2.0, 6.0, sdRound(p, uCh.xy, uCh.zw + 2.0, uCh.w + 2.0));
    float gl = exp(-max(ahead, 0.0) / 14.0) * uHeat * inCh * step(0.0, ahead) * 0.55;
    vec3 hc = vec3(1.0, 0.42, 0.1) * gl;
    gl_FragColor = vec4(hc, max(sh, gl * 0.9));
    return;
  }`,
  warp: `
  // once it sets, a single ripple runs the length of the bar
  float ph = (p.x - (uCh.x - uCh.z)) - uRip * (uCh.z * 2.0 + 80.0) + 40.0;
  float wv = exp(-pow(ph / 16.0, 2.0)) * (1.0 - uRip);
  sl.x += -ph / 16.0 * wv * 1.1;`,
  extra: `
  // molten near the front: glowing white-orange at the lip, cooling through orange and red into chrome behind it;
  // the cooling skin breaks into slowly turning cells, as molten metal does
  float behind = frontAt(p.y) - p.x;
  float cells = vnoise(p * 0.045 + vec2(uT * 0.5, -uT * 0.3)) * 0.65 + vnoise(p * 0.1 - vec2(uT * 0.7, 0.0)) * 0.35;
  float heat = exp(-behind / 70.0) * uHeat * (0.75 + 0.5 * cells);
  heat = clamp(heat, 0.0, 1.0);
  vec3 hot = mix(vec3(0.75, 0.12, 0.02), mix(vec3(1.0, 0.45, 0.08), vec3(1.0, 0.9, 0.62), smoothstep(0.55, 1.0, heat)), smoothstep(0.15, 0.6, heat));
  c = mix(c, hot * (0.5 + 0.9 * heat) + c * 0.18, smoothstep(0.05, 0.7, heat));`,
});

type Phase = "idle" | "pouring" | "set" | "done" | "draining";

export interface MoltenHoldProps {
  /** plays its own sounds (a thump as the metal starts to run, a sizzle that follows the front, a drain if you let go early, and a thunk, a hiss of steam and a ring of chrome when it sets). They follow the site-wide sound switch */
  enableSound?: boolean;
  /** loudness of the sounds, 0 to 1 */
  volume?: number;
  /** the words on the bar before it is held */
  label?: string;
  /** the words pressed into the metal once the hold is complete */
  doneLabel?: string;
  /** seconds of holding it takes to fill the channel */
  duration?: number;
  /** holds and lets go by itself until the first touch */
  autoplay?: boolean;
  /** called once, when the channel is full */
  onConfirm?: () => void;
}

/**
 * MoltenHold: hold to confirm, by pouring molten metal.
 *
 * Press and hold and metal starts to pour into the button's channel from the left: slowly at first, then steadily.
 * The front is a glowing meniscus that bulges forward and shivers as it runs, white-orange at the lip and throwing
 * its heat onto the groove ahead. Behind it the metal cools: orange, then dull red, then set chrome, its skin breaking
 * into slowly turning cells as it goes. Let go too soon and it drains back. Hold to the end and the bar is full; the
 * last of the glow fades, a single ripple runs the length of the solid chrome, and the label, which the metal has
 * been rising over all along, is now pressed into it.
 *
 * `label`, `doneLabel`, `duration` (seconds to fill), `onConfirm`. Space or Enter held works the same. `autoplay`
 * shows a short hold and a full one until the first real press. Reduced motion fills without the heat.
 */
export function MoltenHold({ label = "Hold to publish", doneLabel = "Published", duration = 1.8, autoplay = false, enableSound = true, volume = 0.8, onConfirm }: MoltenHoldProps) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const chan = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const lit = useRef<HTMLSpanElement>(null);
  const dim = useRef<HTMLSpanElement>(null);
  const holding = useRef(false);
  const touched = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  useLayoutEffect(() => { phaseRef.current = phase; }, [phase]);
  const [gl, setGl] = useState(true);
  const fillRef = useRef(0);
  const [fallback, setFallback] = useState(0);
  const autoSoundOk = useAutoplaySoundAllowed();
  const soundCfg = useRef({ enableSound, volume, autoSoundOk });
  useLayoutEffect(() => { soundCfg.current = { enableSound, volume, autoSoundOk }; }, [enableSound, volume, autoSoundOk]);
  // Sound plays when asked for and the site-wide switch is on. A demo playing itself makes sound only where demos may, once the visitor has used the page.
  const sound = (name: MoltenHoldSound, arg?: number) => {
    const c = soundCfg.current;
    if (!c.enableSound) return;
    if (!touched.current && !(c.autoSoundOk && audioAwake())) return;
    playDef(`molten-hold:${name}`, moltenHoldSound(name, arg), Math.min(1, Math.max(0, c.volume)));
  };

  useEffect(() => {
    const cv = cvs.current, st = wrap.current; if (!cv || !st) return;
    const w = glSetup(cv, FRAG);
    if (!w) { setGl(false); }
    const { g, U } = w ?? { g: null as unknown as WebGLRenderingContext, U: () => null };
    const uRes = U("uRes"), uDpr = U("uDpr"), uT = U("uT"), uFlow = U("uFlow"), uCh = U("uCh"), uFront = U("uFront"), uHeat = U("uHeat"), uRip = U("uRip"), uWave = U("uWave");
    let dpr = 1, off: readonly [number, number] = [0, 0];
    const uOff = U("uOff");
    // the canvas covers just the button, plus room for the heat it throws
    const size = () => {
      if (!chan.current) return;
      const f = fitCanvas(cv, st, within(st, chan.current, 8));
      dpr = f.dpr; off = f.off;
      if (g) g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    let raf = 0, last = performance.now(), time = 1, fill = 0, speed = 0, heat = 0, rip = 1, wave = 0, setAt = 0, grain = 0;
    const set = (p: Phase) => { phaseRef.current = p; setPhase(p); };
    const draw = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      const ph = phaseRef.current;
      if (holding.current && (ph === "idle" || ph === "pouring" || ph === "draining")) {
        if (ph !== "pouring") { set("pouring"); sound("ignite"); }
        // the pour gathers pace, like a crucible tipping
        speed += (1 / duration * 1.12 - speed) * Math.min(1, dt * 3.2);
        fill = Math.min(1, fill + speed * dt);
        heat += (1 - heat) * Math.min(1, dt * 6);
        // the sizzle follows the front: grains come closer together, and brighter, as the channel fills
        grain += dt;
        if (grain > 0.08 - 0.045 * fill) { grain = 0; sound("grain", fill); }
        if (fill >= 1) { set("set"); sound("set"); setAt = now; onConfirm?.(); }
      } else if (ph === "pouring" || ph === "draining") {
        if (ph !== "draining") { set("draining"); if (fill > 0.04) sound("drain", fill); }
        speed = 0;
        fill = Math.max(0, fill - dt * (0.9 + fill * 0.8));
        heat *= Math.exp(-dt * 1.2);
        if (fill <= 0) { set("idle"); heat = 0; }
      } else if (ph === "set") {
        heat *= Math.exp(-dt * 2.2);
        rip = Math.min(1, (now - setAt) / 1100 - 0.45);
        if (now - setAt > 1500) { set("done"); }
      } else if (ph === "done") {
        rip = 1;
      }
      if (reduce) heat = 0;
      const moving = ph === "pouring" || ph === "draining" ? 1 : 0;
      wave += (moving - wave) * Math.min(1, dt * 5);
      time += dt;
      fillRef.current = fill;
      const sr = st.getBoundingClientRect(), k = sr.width / (st.offsetWidth || 1), cr = chan.current!.getBoundingClientRect();
      const cx = (cr.left + cr.width / 2 - sr.left) / k, cy = (cr.top + cr.height / 2 - sr.top) / k, hw = cr.width / k / 2 - 5, hh = cr.height / k / 2 - 5;
      const x0 = cx - hw - 12, front = x0 + fill * (hw * 2 + 22);
      // the label above the metal reads as pressed into it; the rest stays a plain label on the groove
      const pct = Math.max(0, Math.min(100, ((front - (cx - hw - 5)) / (hw * 2 + 10)) * 100));
      lit.current?.style.setProperty("clip-path", `inset(0 ${100 - pct}% 0 0)`);
      dim.current?.style.setProperty("clip-path", `inset(0 0 0 ${pct}%)`);
      if (g) {
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes, cv.width, cv.height); g.uniform2f(uOff, off[0], off[1]); g.uniform1f(uDpr, dpr); g.uniform1f(uT, time); g.uniform1f(uFlow, wave * 0.4);
        g.uniform4f(uCh, cx, cy, hw, hh); g.uniform1f(uFront, fill > 0.001 ? front : -1000); g.uniform1f(uHeat, heat); g.uniform1f(uRip, Math.max(0, rip)); g.uniform1f(uWave, wave);
        g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      } else setFallback(fill);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, duration]);

  const reset = () => { holding.current = false; phaseRef.current = "draining"; setPhase("draining"); };
  const press = (v: boolean, real = true) => {
    if (real) touched.current = true;
    if (v && phaseRef.current === "done") { sound("undo"); reset(); return; }
    holding.current = v;
  };

  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(1200);
      while (live && !touched.current) {
        press(true, false); await sleep(800); press(false, false); await sleep(1500); if (!live || touched.current) break;
        press(true, false); await sleep(duration * 1000 + 600); press(false, false); await sleep(2600); if (!live || touched.current) break;
        reset(); await sleep(1800);
      }
    })();
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduce]);

  const done = phase === "done" || phase === "set";
  const hint = phase === "idle" ? "Press and hold" : phase === "pouring" ? "Keep holding" : phase === "draining" ? "Let go too soon" : phase === "set" ? "Setting" : "Press again to undo";

  return (
    <div ref={wrap} className="relative grid w-full max-w-[560px] select-none place-items-center gap-4 rounded-[28px] bg-[radial-gradient(120%_90%_at_50%_0%,#262628_0%,#141415_60%,#0c0c0d_100%)] px-6 py-12" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      <button
        type="button"
        aria-label={done ? `${doneLabel}. Press to undo` : label}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); press(true); }}
        onPointerUp={() => press(false)}
        onPointerCancel={() => press(false)}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); press(true); } }}
        onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") press(false); }}
        onContextMenu={(e) => e.preventDefault()}
        className="relative h-[68px] w-full max-w-[320px] touch-none rounded-[24px] p-[5px] outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        style={{ background: "linear-gradient(180deg,#1d1d20,#141416)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.07), 0 0 0 1px #050506, 0 16px 34px -18px rgba(0,0,0,.9)" }}
      >
        <div ref={chan} className="relative h-full w-full rounded-[19px]" style={{ background: "#09090a", boxShadow: "inset 0 2px 6px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.05)" }}>
          {!gl && <div aria-hidden className="absolute inset-y-0 left-0 rounded-[19px]" style={{ width: `${fallback * 100}%`, background: "linear-gradient(180deg,#f2f3f8,#9a9eb0 55%,#5b5e6b)" }} />}
          <span className="absolute inset-0 z-[2] grid place-items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span key={done ? "d" : "l"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} className="relative block">
                <span ref={dim} className="flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.01em] text-white/55">{done ? doneLabel : label}</span>
                {/* the same words, pressed into the metal as it rises under them */}
                <span ref={lit} aria-hidden className="absolute inset-0 flex items-center gap-1.5 text-[16px] font-semibold tracking-[-0.01em]" style={{ color: "rgba(20,20,24,.62)", textShadow: "0 1px 0 rgba(255,255,255,.45), 0 -1px 0 rgba(0,0,0,.25)" }}>{done ? doneLabel : label}</span>
              </motion.span>
            </AnimatePresence>
          </span>
        </div>
      </button>
      <p className="m-0 text-[12.5px] text-white/55" aria-live="polite">{hint}</p>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute" style={{ display: gl ? "block" : "none", zIndex: 1 }} />
    </div>
  );
}
