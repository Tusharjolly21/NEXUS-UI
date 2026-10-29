"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as RKeyboardEvent,
  type PointerEvent as RPointerEvent,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ─── Palettes ──────────────────────────────────────────────────────────────────

export type LightfallMode = "dusk" | "tide" | "ember";

const MODES: Record<LightfallMode, { label: string; bg: string; haze: string; c: [string, string, string, string] }> = {
  dusk: { label: "Dusk", bg: "#06040d", haze: "#5b3bd6", c: ["#8b5cff", "#ff5fa2", "#ffb35c", "#ffffff"] },
  tide: { label: "Tide", bg: "#02070d", haze: "#1a6fd6", c: ["#1fb6ff", "#2ee6c5", "#6c7bff", "#e8fbff"] },
  ember: { label: "Ember", bg: "#0a0503", haze: "#c2410c", c: ["#ff6a2b", "#ffb000", "#ff3d6e", "#fff1d6"] },
};
const rgb = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];

// ─── Scene ─────────────────────────────────────────────────────────────────────
// One path per lane: down the wall, a quarter-round cove, then out across the
// floor towards the camera, fanning wider as it comes. Everything is measured
// in arc length s so pulses travel the bend at the same speed as the straights.

const TOP = 7.2;
const R = 1.7;
const ZW = -6;
const LW = TOP - R;
const LB = (Math.PI * R) / 2;
const LF = 7.6;
const LTOTAL = LW + LB + LF;
const LANES = 140;
const SEG = 96;

const VS = `
attribute vec2 a_v;      // s (0..1 of the whole path), side (-1 or 1)
attribute vec4 a_lane;   // x, seed, speed, pick
uniform mat4 u_vp;
uniform vec2 u_res;
uniform float u_width, u_minw, u_mirror;
uniform vec3 u_cur;      // cursor in NDC, strength
uniform float u_rad;     // parting radius in device px
varying float v_s, v_side, v_fade, v_near;
varying vec4 v_lane;
const float TOP = ${TOP.toFixed(3)};
const float R = ${R.toFixed(3)};
const float ZW = ${ZW.toFixed(3)};
const float LW = ${LW.toFixed(4)};
const float LB = ${LB.toFixed(4)};
const float LT = ${LTOTAL.toFixed(4)};
vec3 path(float s, float x){
  if (s < LW) return vec3(x, TOP - s, ZW);
  s -= LW;
  if (s < LB) { float th = s / R; return vec3(x, R - R * sin(th), ZW + R - R * cos(th)); }
  s -= LB;
  return vec3(x * (1.0 + 0.12 * s), 0.0, ZW + R + s);
}
void main(){
  float s = a_v.x * LT;
  vec3 p = path(s, a_lane.x);
  vec3 q = path(min(LT, s + 0.05), a_lane.x);
  vec3 b = path(max(0.0, s - 0.05), a_lane.x);
  if (u_mirror > 0.5) { p.y = -p.y; q.y = -q.y; b.y = -b.y; }
  vec4 cp = u_vp * vec4(p, 1.0);
  vec4 cq = u_vp * vec4(q, 1.0);
  vec4 cb = u_vp * vec4(b, 1.0);
  vec2 np = cp.xy / cp.w;
  vec2 dir = (cq.xy / cq.w - cb.xy / cb.w) * u_res;
  dir = normalize(dir + vec2(1e-6, 0.0));
  vec2 n = vec2(-dir.y, dir.x);
  // width follows perspective but never drops below a hairline
  float wpx = max(u_minw, u_width * u_res.y * 0.5 / cp.w);
  // the cursor parts the lanes like a finger in running water
  vec2 d = (np - u_cur.xy) * u_res * 0.5;
  float f = exp(-dot(d, d) / (u_rad * u_rad)) * u_cur.z;
  float push = sign(dot(d, n) + 1e-4) * f * u_rad * 0.3;
  vec2 offPx = n * (a_v.y * wpx * 0.5 + push);
  gl_Position = vec4((np + offPx / (u_res * 0.5)) * cp.w, cp.z, cp.w);
  v_s = s;
  v_side = a_v.y;
  v_lane = a_lane;
  v_near = f;
  float top = smoothstep(0.0, 1.7, s);
  float sides = 1.0 - smoothstep(3.0, 4.3, abs(a_lane.x));
  float near = smoothstep(LT, LT - 2.2, s);
  float m = 1.0;
  if (u_mirror > 0.5) m = 0.22 * (1.0 - smoothstep(LW + LB - 0.6, LW + LB + 0.4, s)) * smoothstep(LW - 2.0, LW + LB * 0.5, s);
  v_fade = top * mix(1.0, sides, step(s, LW + LB * 0.6)) * near * m;
}`;

const FS = `
precision mediump float;
varying float v_s, v_side, v_fade, v_near;
varying vec4 v_lane;
uniform float u_time, u_glow;
uniform vec3 u_c0, u_c1, u_c2, u_c3;
uniform vec3 u_surge[3];   // start time, strength, unused
float h(float n){ return fract(sin(n * 127.1) * 43758.5453); }
void main(){
  float seed = v_lane.y;
  float speed = v_lane.z;
  float spacing = mix(2.6, 5.2, h(seed * 3.1));
  float q = (v_s - u_time * speed) / spacing + seed * 7.0;
  float id = floor(q);
  float u = fract(q);
  float on = step(0.32, h(id * 1.31 + seed * 13.0));
  float len = mix(0.25, 0.85, h(id * 1.7 + seed));
  float head = smoothstep(1.0, 0.965, u);
  float tail = pow(clamp((u - (1.0 - len)) / len, 0.0, 1.0), 2.2);
  float pulse = on * tail * head;
  float surge = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = u_time - u_surge[i].x;
    if (age > 0.0 && age < 4.0) {
      float front = age * 8.5;
      float g = (v_s - front) / 0.7;
      surge += exp(-g * g) * u_surge[i].y * exp(-age * 0.35);
    }
  }
  float pick = v_lane.w;
  vec3 col = pick < 0.55 ? u_c0 : pick < 0.8 ? u_c1 : pick < 0.93 ? u_c2 : u_c3;
  float prof = u_glow > 0.5 ? exp(-v_side * v_side * 2.2) * 0.16 : exp(-v_side * v_side * 1.6);
  float laneGain = 0.55 + 0.9 * h(seed * 5.3);
  float b = (0.13 + pulse * 1.5) * laneGain + surge * 1.4 + v_near * (0.25 + pulse);
  vec3 c = mix(col, vec3(1.0), clamp(pow(pulse, 3.0) * 0.55 + surge * 0.5, 0.0, 1.0)) * b * prof * v_fade;
  gl_FragColor = vec4(c, max(c.r, max(c.g, c.b)));
}`;

function mat4Perspective(fovy: number, aspect: number, near: number, far: number) {
  const f = 1 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}
function mat4LookAt(e: number[], c: number[], up: number[]) {
  const sub = (a: number[], b: number[]) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const norm = (a: number[]) => {
    const l = Math.hypot(a[0], a[1], a[2]) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  };
  const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = norm(sub(e, c));
  const x = norm(cross(up, z));
  const y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
}
function mul(a: number[], b: number[]) {
  const o = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return o;
}

function program(gl: WebGLRenderingContext, vs: string, fs: string) {
  const mk = (t: number, src: string) => {
    const s = gl.createShader(t)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
    return s;
  };
  const p = gl.createProgram()!;
  gl.attachShader(p, mk(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

export interface LightfallProps {
  /** Stage height in px. */
  height?: number;
  /** Starting palette. The built-in switcher can change it afterwards. */
  mode?: LightfallMode;
  /** Pulse speed multiplier. */
  speed?: number;
  /** Until the first touch, an invisible hand drifts across the lanes and surges fire on their own. */
  autoplay?: boolean;
  /** Show the Dusk / Tide / Ember palette switcher. */
  showModes?: boolean;
  /** Optional caption under the stage. */
  hint?: ReactNode;
  /** Content layered over the lights. Defaults to a small title; pass `null` for none. */
  children?: ReactNode;
  className?: string;
}

/**
 * Lightfall: a WebGL background. Lanes of light pour down a back wall, round a
 * cove and run out across a glossy floor towards you, pulses streaking along
 * every lane, the wall faintly mirrored in the floor. Move over it and the
 * lanes part around your cursor like water around a finger; click (or press
 * Space) to send a surge of light down every lane at once. Three palettes.
 * Until you touch it, an invisible hand drifts across it and surges fire on
 * their own. Put any content on top with `children`.
 */
export function Lightfall({
  height = 500,
  mode: modeProp = "dusk",
  speed = 1,
  autoplay = true,
  showModes = true,
  hint,
  children,
  className = "",
}: LightfallProps) {
  const reduce = useReducedMotion();
  const pillId = `lightfall-pill-${useId().replace(/:/g, "")}`;
  const stage = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.2 });
  const inViewRef = useRef(false);
  const speedRef = useRef(speed);
  const reduceRef = useRef(false);
  const [mode, setMode] = useState<LightfallMode>(modeProp);
  const [prevModeProp, setPrevModeProp] = useState(modeProp);
  if (prevModeProp !== modeProp) {
    setPrevModeProp(modeProp);
    setMode(modeProp);
  }
  const [failed, setFailed] = useState(false);
  const touched = useRef(!autoplay);
  const sim = useRef({
    t: 0,
    pal: MODES[modeProp].c.map(rgb),
    target: MODES[modeProp].c.map(rgb),
    cur: { x: 0, y: -0.4, s: 0 },
    want: { x: 0, y: -0.4, s: 0 },
    surges: [-99, 0, 0, -99, 0, 0, -99, 0, 0],
    nextSurge: 0,
    lastAuto: 0,
    cam: 0,
  });

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);
  useEffect(() => {
    speedRef.current = speed;
    reduceRef.current = !!reduce;
  }, [speed, reduce]);
  useEffect(() => {
    touched.current = !autoplay;
  }, [autoplay]);
  useEffect(() => {
    sim.current.target = MODES[mode].c.map(rgb);
  }, [mode]);

  const surge = (strength = 1) => {
    const S = sim.current;
    const i = S.nextSurge % 3;
    S.surges[i * 3] = S.t;
    S.surges[i * 3 + 1] = strength;
    S.nextSurge++;
  };

  useEffect(() => {
    const mount = host.current;
    if (!mount) return;
    // The canvas is created here, not in JSX: releasing a WebGL context for good
    // (so a page of tiles never runs out of them) must not leave a dead canvas
    // behind for a remount, which is what React Strict Mode does in development.
    const cv = document.createElement("canvas");
    cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    mount.appendChild(cv);
    const gl = cv.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true });
    const prog = gl ? program(gl, VS, FS) : null;
    if (!gl || !prog) {
      // No WebGL: leave a quiet pinstripe instead of an empty box.
      cv.style.background = `repeating-linear-gradient(90deg, transparent 0 9px, ${MODES[modeProp].c[0]}22 9px 10px)`;
      return () => cv.remove();
    }

    // geometry: every lane is a ribbon of SEG segments; lane data rides on each vertex
    let seed = 99;
    const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const per = (SEG + 1) * 2;
    const verts = new Float32Array(LANES * per * 6);
    const idx = new Uint16Array(LANES * SEG * 6);
    let vi = 0;
    let ii = 0;
    for (let l = 0; l < LANES; l++) {
      const x = -4.3 + ((l + 0.5) / LANES) * 8.6 + (rand() - 0.5) * 0.04;
      const sd = rand();
      const sp = 3.4 + rand() * 1.4;
      const pick = rand();
      for (let k = 0; k <= SEG; k++) {
        const u = k / SEG;
        for (const side of [-1, 1]) {
          verts.set([u, side, x, sd, sp, pick], vi);
          vi += 6;
        }
      }
      const base = l * per;
      for (let k = 0; k < SEG; k++) {
        const a = base + k * 2;
        idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], ii);
        ii += 6;
      }
    }
    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.useProgram(prog);
    const aV = gl.getAttribLocation(prog, "a_v");
    const aL = gl.getAttribLocation(prog, "a_lane");
    gl.enableVertexAttribArray(aV);
    gl.vertexAttribPointer(aV, 2, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aL);
    gl.vertexAttribPointer(aL, 4, gl.FLOAT, false, 24, 8);
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      vp: U("u_vp"), res: U("u_res"), width: U("u_width"), minw: U("u_minw"), mirror: U("u_mirror"),
      cur: U("u_cur"), rad: U("u_rad"), time: U("u_time"), glow: U("u_glow"), surge: U("u_surge[0]"),
      c: [U("u_c0"), U("u_c1"), U("u_c2"), U("u_c3")],
    };
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);

    const onLost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    cv.addEventListener("webglcontextlost", onLost);

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(2, Math.round(cv.clientWidth * dpr));
      const h = Math.max(2, Math.round(cv.clientHeight * dpr));
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();

    let raf = 0;
    let last = performance.now();
    const S = sim.current;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current) return;
      const slow = reduceRef.current;
      S.t += dt * speedRef.current * (slow ? 0.18 : 1);

      // palette eases between modes
      const k = 1 - Math.exp(-dt * 4);
      S.pal.forEach((c, i) => c.forEach((_, j) => (c[j] += (S.target[i][j] - c[j]) * k)));

      // invisible hand until the first touch
      if (!touched.current && !slow) {
        const tt = S.t * 0.35;
        S.want.x = Math.sin(tt) * 0.45;
        S.want.y = -0.5 + Math.sin(tt * 1.7) * 0.15;
        S.want.s = 0.8;
        if (S.t - S.lastAuto > 3.6) {
          S.lastAuto = S.t;
          surge(0.9);
        }
      }
      const kc = 1 - Math.exp(-dt * 7);
      S.cur.x += (S.want.x - S.cur.x) * kc;
      S.cur.y += (S.want.y - S.cur.y) * kc;
      S.cur.s += (S.want.s - S.cur.s) * (1 - Math.exp(-dt * 4));
      S.cam += (S.cur.x * S.cur.s - S.cam) * (1 - Math.exp(-dt * 1.5));

      const W = cv.width;
      const H = cv.height;
      const aspect = W / H;
      const proj = mat4Perspective((52 * Math.PI) / 180, aspect, 0.1, 60);
      const view = mat4LookAt([S.cam * 0.35, 2.1, 4.4], [0, 1.7, -6], [0, 1, 0]);
      const vp = mul(proj, view);

      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniformMatrix4fv(u.vp, false, new Float32Array(vp));
      gl.uniform2f(u.res, W, H);
      gl.uniform3f(u.cur, S.cur.x, S.cur.y, S.cur.s);
      gl.uniform1f(u.rad, 64 * (W / Math.max(1, cv.clientWidth)));
      gl.uniform1f(u.time, S.t);
      gl.uniform3fv(u.surge, new Float32Array(S.surges));
      S.pal.forEach((c, i) => gl.uniform3f(u.c[i], c[0], c[1], c[2]));
      const dpr = W / Math.max(1, cv.clientWidth);
      const pass = (mirror: number, glow: number) => {
        gl.uniform1f(u.mirror, mirror);
        gl.uniform1f(u.glow, glow);
        gl.uniform1f(u.width, glow ? 0.16 : 0.026);
        gl.uniform1f(u.minw, (glow ? 6 : 1.1) * dpr);
        gl.drawElements(gl.TRIANGLES, LANES * SEG * 6, gl.UNSIGNED_SHORT, 0);
      };
      pass(1, 1);
      pass(1, 0);
      pass(0, 1);
      pass(0, 0);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("webglcontextlost", onLost);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      cv.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toNdc = (e: RPointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - b.left) / b.width) * 2 - 1, y: 1 - ((e.clientY - b.top) / b.height) * 2 };
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen" && !e.isPrimary) return;
    const p = toNdc(e);
    const S = sim.current;
    S.want.x = p.x;
    S.want.y = p.y;
    S.want.s = 1;
    if (e.pointerType === "mouse") touched.current = true;
  };
  const onLeave = () => {
    if (touched.current) sim.current.want.s = 0;
  };
  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const p = toNdc(e);
    Object.assign(sim.current.want, { x: p.x, y: p.y, s: 1 });
    surge(1);
  };
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      touched.current = true;
      surge(1);
    }
  };

  const M = MODES[mode];
  return (
    <div className={`flex w-full flex-col gap-3 ${className}`}>
      <div
        ref={stage}
        tabIndex={0}
        role="img"
        aria-label="Lanes of light pouring down a wall and across a floor. Click or press Space to send a surge of light."
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        onPointerDown={onDown}
        onKeyDown={onKey}
        className="relative w-full cursor-crosshair overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] outline-none transition-[background-color] duration-700 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0071e3]"
        style={{ height, background: M.bg, touchAction: "pan-y" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{ background: `radial-gradient(34% 46% at 50% 40%, ${M.haze}55, transparent 70%), radial-gradient(60% 30% at 50% 78%, ${M.haze}26, transparent 70%)` }}
        />
        <div ref={host} aria-hidden="true" className="absolute inset-0" />
        {failed && (
          <div className="absolute inset-0" style={{ background: `repeating-linear-gradient(90deg, transparent 0 9px, ${M.c[0]}22 9px 10px)` }} aria-hidden="true" />
        )}
        {children === undefined ? (
          <div className="pointer-events-none absolute left-6 top-6 flex flex-col gap-1.5 sm:left-8 sm:top-7">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-white/70">Background</span>
            <span className="text-[30px] font-semibold leading-none tracking-[-0.03em] text-white">Lightfall</span>
          </div>
        ) : (
          children
        )}
        {showModes && (
          <div role="radiogroup" aria-label="Palette" className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-[rgba(10,10,18,.6)] p-1 shadow-[0_0_0_1px_rgba(255,255,255,.12)]" onPointerDown={(e) => e.stopPropagation()}>
            {(Object.keys(MODES) as LightfallMode[]).map((m) => {
              const on = m === mode;
              return (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    touched.current = true;
                    setMode(m);
                  }}
                  className="relative flex h-8 items-center gap-2 rounded-full border-0 bg-transparent px-2.5 text-[12.5px] font-medium text-white outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-white"
                >
                  {on && <motion.span layoutId={pillId} className="absolute inset-0 rounded-full bg-white/[.16]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
                  <span className="relative h-3 w-3 rounded-full" style={{ background: `linear-gradient(135deg, ${MODES[m].c[0]}, ${MODES[m].c[1]})`, boxShadow: on ? "0 0 0 2px rgba(255,255,255,.9)" : "0 0 0 1px rgba(255,255,255,.35)" }} />
                  <span className="relative">{MODES[m].label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {hint != null && <p className="m-0 px-1 text-[12.5px] text-[#86868b]">{hint}</p>}
    </div>
  );
}

export default Lightfall;
