"use client";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

/*
 * Liquid Smoke: a GPU fluid you stir with the pointer.
 * The solver is the classic stable-fluids loop on the GPU (advect, curl and vorticity, divergence, Jacobi pressure,
 * project), the approach popularised by Pavel Dobryakov's WebGL Fluid Simulation (MIT). Written for this kit with a
 * gloss pass, an ink mode for light pages, a stretchy ring cursor, idle sleep and a self-demo.
 */

export type Blend = "normal" | "screen" | "multiply" | "difference";
export type CursorKind = "native" | "dot" | "ring";
export interface SmokeSettings {
  /** Dye colour. Ignored when `rainbow` is on. Defaults to silver, or near-black with `blend="multiply"`. */
  color?: string;
  /** Cycle the hue on its own as you move. */
  rainbow?: boolean;
  /** How the smoke sits on what's behind it. Screen for dark pages, Multiply (ink) for light ones. */
  blend?: Blend;
  /** What the pointer looks like over the area. */
  cursor?: CursorKind;
  /** How fast the trail fades. Higher is shorter. */
  fade?: number;
  /** How hard the pointer pushes the fluid. */
  force?: number;
  /** Size of each puff. */
  radius?: number;
  /** Vorticity: how much it curls into eddies. */
  swirl?: number;
  /** Light the surface so it reads as a body of smoke rather than a flat stain. */
  shading?: boolean;
  /** A wet specular glint on the shaded surface, 0 to 1. */
  gloss?: number;
}
export interface LiquidSmokeProps extends SmokeSettings {
  /** "inside" fills and listens to its parent (give the parent position: relative). "page" is a fixed full-screen layer. */
  area?: "inside" | "page";
  /** Stir itself along a lazy path until someone moves over it. For previews; off by default. */
  autoplay?: boolean;
  /** Run on software-rendered WebGL too (slow). Off by default so machines without a GPU never pay for it. */
  allowSoftware?: boolean;
  /** Highest device pixel ratio the canvas renders at. Lower is lighter on the GPU. */
  pixelRatio?: number;
  /** Ring and dot colour. Defaults to white on dark blends and near-black in ink mode. */
  cursorColor?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULTS: Required<SmokeSettings> = { color: "#e9e9ee", rainbow: false, blend: "screen", cursor: "ring", fade: 2.4, force: 6000, radius: 0.25, swirl: 14, shading: true, gloss: 0.5 };

// ---------- shaders ----------
const VERT = `precision highp float;
attribute vec2 aPosition; varying vec2 vUv, vL, vR, vT, vB; uniform vec2 texelSize;
void main(){ vUv = aPosition * 0.5 + 0.5; vL = vUv - vec2(texelSize.x, 0.0); vR = vUv + vec2(texelSize.x, 0.0); vT = vUv + vec2(0.0, texelSize.y); vB = vUv - vec2(0.0, texelSize.y); gl_Position = vec4(aPosition, 0.0, 1.0); }`;
const F = (body: string, defs = "") => `precision highp float; precision highp sampler2D; ${defs}
varying vec2 vUv, vL, vR, vT, vB; ${body}`;
const CLEAR = F(`uniform sampler2D uTexture; uniform float value; void main(){ gl_FragColor = value * texture2D(uTexture, vUv); }`);
const SPLAT = F(`uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main(){ vec2 p = vUv - point; p.x *= aspectRatio; vec3 s = exp(-dot(p, p) / radius) * color; gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + s, 1.0); }`);
const ADVECT = (manual: boolean) => F(`uniform sampler2D uVelocity, uSource; uniform vec2 texelSize, dyeTexelSize; uniform float dt, dissipation;
vec4 bilerp(sampler2D s, vec2 uv, vec2 ts){ vec2 st = uv / ts - 0.5; vec2 i = floor(st); vec2 f = fract(st);
  vec4 a = texture2D(s, (i + vec2(0.5, 0.5)) * ts), b = texture2D(s, (i + vec2(1.5, 0.5)) * ts), c = texture2D(s, (i + vec2(0.5, 1.5)) * ts), d = texture2D(s, (i + vec2(1.5, 1.5)) * ts);
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); }
void main(){
#ifdef MANUAL
  vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize; vec4 r = bilerp(uSource, coord, dyeTexelSize);
#else
  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize; vec4 r = texture2D(uSource, coord);
#endif
  gl_FragColor = r / (1.0 + dissipation * dt); }`, manual ? "#define MANUAL" : "");
const DIVERGENCE = F(`uniform sampler2D uVelocity; void main(){
  float L = texture2D(uVelocity, vL).x, R = texture2D(uVelocity, vR).x, T = texture2D(uVelocity, vT).y, B = texture2D(uVelocity, vB).y; vec2 C = texture2D(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x; if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0); }`);
const CURL = F(`uniform sampler2D uVelocity; void main(){
  float L = texture2D(uVelocity, vL).y, R = texture2D(uVelocity, vR).y, T = texture2D(uVelocity, vT).x, B = texture2D(uVelocity, vB).x;
  gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0); }`);
const VORTICITY = F(`uniform sampler2D uVelocity, uCurl; uniform float curl, dt; void main(){
  float L = texture2D(uCurl, vL).x, R = texture2D(uCurl, vR).x, T = texture2D(uCurl, vT).x, B = texture2D(uCurl, vB).x, C = texture2D(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L)); force /= length(force) + 0.0001; force *= curl * C; force.y *= -1.0;
  vec2 v = texture2D(uVelocity, vUv).xy + force * dt; gl_FragColor = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0); }`);
const PRESSURE = F(`uniform sampler2D uPressure, uDivergence; void main(){
  float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4((L + R + B + T - texture2D(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0); }`);
const GRADIENT = F(`uniform sampler2D uPressure, uVelocity; void main(){
  float L = texture2D(uPressure, vL).x, R = texture2D(uPressure, vR).x, T = texture2D(uPressure, vT).x, B = texture2D(uPressure, vB).x;
  gl_FragColor = vec4(texture2D(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0); }`);
// the picture: dye, lit from the front by its own height, with an optional glint, or as ink for multiply
const DISPLAY = F(`uniform sampler2D uTexture; uniform vec2 texelSize; uniform float shading, gloss, ink; uniform vec3 tint;
void main(){
  vec3 c = texture2D(uTexture, vUv).rgb;
  float spec = 0.0;
  if (shading > 0.5) {
    vec2 e = texelSize * 1.5;
    float dx = length(texture2D(uTexture, vUv + vec2(e.x, 0.0)).rgb) - length(texture2D(uTexture, vUv - vec2(e.x, 0.0)).rgb);
    float dy = length(texture2D(uTexture, vUv + vec2(0.0, e.y)).rgb) - length(texture2D(uTexture, vUv - vec2(0.0, e.y)).rgb);
    vec3 n = normalize(vec3(dx, dy, length(e)));
    c *= clamp(dot(n, vec3(0.0, 0.0, 1.0)) + 0.7, 0.7, 1.0);
    // the glint reads a broader slope (three texels each way), so it slides over the body instead of sparkling on grain
    vec2 o = texelSize * 3.0;
    float gx = length(texture2D(uTexture, vUv + vec2(o.x, 0.0)).rgb) - length(texture2D(uTexture, vUv - vec2(o.x, 0.0)).rgb);
    float gy = length(texture2D(uTexture, vUv + vec2(0.0, o.y)).rgb) - length(texture2D(uTexture, vUv - vec2(0.0, o.y)).rgb);
    vec3 m = normalize(vec3(gx, gy, length(o) * 1.6));
    vec3 h = normalize(normalize(vec3(-0.45, 0.6, 1.0)) + vec3(0.0, 0.0, 1.0));
    spec = pow(max(dot(m, h), 0.0), 28.0) * gloss * 0.8;
  }
  // a soft shoulder instead of a hard clip, so thick smoke keeps its folds rather than going flat white
  c = vec3(1.0) - exp(-c * 1.7);
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  if (ink > 0.5) { float k = clamp(a * 1.1, 0.0, 1.0); gl_FragColor = vec4(tint * k, k); return; }
  c += spec * smoothstep(0.18, 0.6, a);
  a = clamp(max(a, max(c.r, max(c.g, c.b))), 0.0, 1.0);
  gl_FragColor = vec4(min(c, vec3(a)), a); }`);

const hex = (h: string): [number, number, number] => {
  const m = h.replace("#", ""); const n = parseInt(m.length === 3 ? m.split("").map((x) => x + x).join("") : m.slice(0, 6), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const hsv = (h: number): [number, number, number] => {
  const i = Math.floor(h * 6), f = h * 6 - i, q = 1 - f;
  return ([[1, f, 0], [q, 1, 0], [0, 1, f], [0, q, 1], [f, 0, 1], [1, 0, q]] as [number, number, number][])[i % 6];
};

/**
 * A fresh canvas for each run of the solver. Tearing the solver down loses its WebGL context, and a canvas whose
 * context was lost hands the same dead context back, so a canvas is never reused (React runs effects twice in
 * development, and changing `area` or `autoplay` starts the solver again).
 */
function mountCanvas(wrap: HTMLElement, blend: CSSProperties["mixBlendMode"]) {
  const cv = document.createElement("canvas");
  Object.assign(cv.style, { position: "absolute", inset: "0", width: "100%", height: "100%", display: "block", mixBlendMode: blend });
  wrap.prepend(cv);
  return cv;
}
function setBlend(wrap: HTMLElement | null, blend: CSSProperties["mixBlendMode"]) {
  const cv = wrap?.querySelector("canvas");
  if (cv) cv.style.mixBlendMode = String(blend);
}

/** Hides the system pointer over an element while our own is drawn; returns the undo. */
function hideCursor(el: HTMLElement) {
  const prev = el.style.cursor;
  el.style.cursor = "none";
  return () => { el.style.cursor = prev; };
}

interface Engine { move: (x: number, y: number, w: number, h: number) => void; wake: () => void; destroy: () => void }

/** Sets up the solver on a canvas. Returns null when WebGL isn't there, or is software-rendered and not allowed. */
function createEngine(canvas: HTMLCanvasElement, cfg: { current: Required<SmokeSettings> }, allowSoftware: boolean, maxDpr: number, onSleep: () => void): Engine | null {
  const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false, premultipliedAlpha: true };
  let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | WebGLRenderingContext | null;
  const isGL2 = !!gl;
  if (!gl) gl = canvas.getContext("webgl", params) as WebGLRenderingContext | null;
  if (!gl) return null;
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : "";
  if (!allowSoftware && /swiftshader|llvmpipe|software|basic render/i.test(renderer)) return null;

  let halfFloat: number, linear: boolean;
  if (isGL2) { (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float"); linear = true; halfFloat = (gl as WebGL2RenderingContext).HALF_FLOAT; }
  else { const hf = gl.getExtension("OES_texture_half_float"); if (!hf) return null; halfFloat = hf.HALF_FLOAT_OES; linear = !!gl.getExtension("OES_texture_half_float_linear"); }
  const g = gl;
  const RGBA = isGL2 ? (g as WebGL2RenderingContext).RGBA16F : g.RGBA;
  g.clearColor(0, 0, 0, 0);

  const sh = (type: number, src: string) => { const s = g.createShader(type)!; g.shaderSource(s, src); g.compileShader(s); if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s)); return s; };
  const vs = sh(g.VERTEX_SHADER, VERT);
  const prog = (fs: string) => {
    const p = g.createProgram()!; g.attachShader(p, vs); g.attachShader(p, sh(g.FRAGMENT_SHADER, fs)); g.bindAttribLocation(p, 0, "aPosition"); g.linkProgram(p);
    const u: Record<string, WebGLUniformLocation | null> = {}; const n = g.getProgramParameter(p, g.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = g.getActiveUniform(p, i)!.name; u[name] = g.getUniformLocation(p, name); }
    return { p, u, use: () => g.useProgram(p) };
  };
  const P = { clear: prog(CLEAR), splat: prog(SPLAT), advect: prog(ADVECT(!linear)), div: prog(DIVERGENCE), curl: prog(CURL), vort: prog(VORTICITY), pres: prog(PRESSURE), grad: prog(GRADIENT), show: prog(DISPLAY) };

  g.bindBuffer(g.ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), g.STATIC_DRAW);
  g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, g.createBuffer()); g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), g.STATIC_DRAW);
  g.vertexAttribPointer(0, 2, g.FLOAT, false, 0, 0); g.enableVertexAttribArray(0);

  type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number; tx: number; ty: number; attach: (i: number) => number };
  const fbo = (w: number, h: number, filter: number): FBO => {
    g.activeTexture(g.TEXTURE0); const tex = g.createTexture()!; g.bindTexture(g.TEXTURE_2D, tex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, filter); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, filter);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.texImage2D(g.TEXTURE_2D, 0, RGBA, w, h, 0, g.RGBA, halfFloat, null);
    const f = g.createFramebuffer()!; g.bindFramebuffer(g.FRAMEBUFFER, f); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, tex, 0);
    g.viewport(0, 0, w, h); g.clear(g.COLOR_BUFFER_BIT);
    return { tex, fbo: f, w, h, tx: 1 / w, ty: 1 / h, attach: (i) => { g.activeTexture(g.TEXTURE0 + i); g.bindTexture(g.TEXTURE_2D, tex); return i; } };
  };
  const double = (w: number, h: number, filter: number) => { let a = fbo(w, h, filter), b = fbo(w, h, filter); return { get read() { return a; }, get write() { return b; }, swap() { const t = a; a = b; b = t; } }; };
  const res = (r: number) => { const ar = g.drawingBufferWidth / g.drawingBufferHeight, a = ar < 1 ? 1 / ar : ar; const mn = Math.round(r), mx = Math.round(r * a); return ar > 1 ? { w: mx, h: mn } : { w: mn, h: mx }; };
  const filt = linear ? g.LINEAR : g.NEAREST;
  let sim = res(128), dyeR = res(720);
  let vel = double(sim.w, sim.h, filt), dye = double(dyeR.w, dyeR.h, filt), pres = double(sim.w, sim.h, g.NEAREST);
  let divg = fbo(sim.w, sim.h, g.NEAREST), curl = fbo(sim.w, sim.h, g.NEAREST);
  const drop = (f: FBO) => { g.deleteTexture(f.tex); g.deleteFramebuffer(f.fbo); };
  const realloc = () => {
    [vel.read, vel.write, dye.read, dye.write, pres.read, pres.write, divg, curl].forEach(drop);
    sim = res(128); dyeR = res(Math.min(1024, Math.max(384, Math.max(g.drawingBufferWidth, g.drawingBufferHeight) * 0.6)));
    vel = double(sim.w, sim.h, filt); dye = double(dyeR.w, dyeR.h, filt); pres = double(sim.w, sim.h, g.NEAREST); divg = fbo(sim.w, sim.h, g.NEAREST); curl = fbo(sim.w, sim.h, g.NEAREST);
  };

  const blit = (t: FBO | null) => {
    if (t) { g.viewport(0, 0, t.w, t.h); g.bindFramebuffer(g.FRAMEBUFFER, t.fbo); } else { g.viewport(0, 0, g.drawingBufferWidth, g.drawingBufferHeight); g.bindFramebuffer(g.FRAMEBUFFER, null); }
    g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0);
  };
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; realloc(); }
  };
  resize();

  const splat = (x: number, y: number, dx: number, dy: number, col: [number, number, number]) => {
    const ar = canvas.width / canvas.height, r = (cfg.current.radius / 100) * (ar > 1 ? ar : 1);
    P.splat.use(); g.uniform1i(P.splat.u.uTarget, vel.read.attach(0)); g.uniform1f(P.splat.u.aspectRatio, ar); g.uniform2f(P.splat.u.point, x, y);
    g.uniform3f(P.splat.u.color, dx, dy, 0); g.uniform1f(P.splat.u.radius, r); g.uniform2f(P.splat.u.texelSize, vel.read.tx, vel.read.ty); blit(vel.write); vel.swap();
    g.uniform1i(P.splat.u.uTarget, dye.read.attach(0)); g.uniform3f(P.splat.u.color, col[0], col[1], col[2]); blit(dye.write); dye.swap();
  };

  const step = (dt: number) => {
    const c = cfg.current;
    g.disable(g.BLEND);
    P.curl.use(); g.uniform2f(P.curl.u.texelSize, vel.read.tx, vel.read.ty); g.uniform1i(P.curl.u.uVelocity, vel.read.attach(0)); blit(curl);
    P.vort.use(); g.uniform2f(P.vort.u.texelSize, vel.read.tx, vel.read.ty); g.uniform1i(P.vort.u.uVelocity, vel.read.attach(0)); g.uniform1i(P.vort.u.uCurl, curl.attach(1));
    g.uniform1f(P.vort.u.curl, c.swirl); g.uniform1f(P.vort.u.dt, dt); blit(vel.write); vel.swap();
    P.div.use(); g.uniform2f(P.div.u.texelSize, vel.read.tx, vel.read.ty); g.uniform1i(P.div.u.uVelocity, vel.read.attach(0)); blit(divg);
    P.clear.use(); g.uniform1i(P.clear.u.uTexture, pres.read.attach(0)); g.uniform1f(P.clear.u.value, 0.8); blit(pres.write); pres.swap();
    P.pres.use(); g.uniform2f(P.pres.u.texelSize, vel.read.tx, vel.read.ty); g.uniform1i(P.pres.u.uDivergence, divg.attach(0));
    for (let i = 0; i < 20; i++) { g.uniform1i(P.pres.u.uPressure, pres.read.attach(1)); blit(pres.write); pres.swap(); }
    P.grad.use(); g.uniform2f(P.grad.u.texelSize, vel.read.tx, vel.read.ty); g.uniform1i(P.grad.u.uPressure, pres.read.attach(0)); g.uniform1i(P.grad.u.uVelocity, vel.read.attach(1)); blit(vel.write); vel.swap();
    P.advect.use(); g.uniform2f(P.advect.u.texelSize, vel.read.tx, vel.read.ty); if (!linear) g.uniform2f(P.advect.u.dyeTexelSize, vel.read.tx, vel.read.ty);
    const vid = vel.read.attach(0); g.uniform1i(P.advect.u.uVelocity, vid); g.uniform1i(P.advect.u.uSource, vid); g.uniform1f(P.advect.u.dt, dt); g.uniform1f(P.advect.u.dissipation, 0.2 + c.fade * 0.28); blit(vel.write); vel.swap();
    if (!linear) g.uniform2f(P.advect.u.dyeTexelSize, dye.read.tx, dye.read.ty);
    g.uniform1i(P.advect.u.uVelocity, vel.read.attach(0)); g.uniform1i(P.advect.u.uSource, dye.read.attach(1)); g.uniform1f(P.advect.u.dissipation, c.fade); blit(dye.write); dye.swap();
  };
  const render = () => {
    const c = cfg.current, ink = c.blend === "multiply";
    g.blendFunc(g.ONE, g.ONE_MINUS_SRC_ALPHA); g.disable(g.BLEND);
    P.show.use(); g.uniform2f(P.show.u.texelSize, 1 / dye.read.w, 1 / dye.read.h); g.uniform1i(P.show.u.uTexture, dye.read.attach(0));
    g.uniform1f(P.show.u.shading, c.shading ? 1 : 0); g.uniform1f(P.show.u.gloss, c.gloss * 1.4); g.uniform1f(P.show.u.ink, ink ? 1 : 0);
    const t = hex(c.color); g.uniform3f(P.show.u.tint, t[0], t[1], t[2]);
    blit(null);
  };

  // pointer bookkeeping and the loop, which sleeps once the trail has faded
  const ptr = { x: 0, y: 0, px: 0, py: 0, moved: false, first: true };
  let raf = 0, last = performance.now(), lastMove = 0, hue = Math.random(), alive = true;
  const frame = () => {
    raf = 0; if (!alive) return;
    const now = performance.now(), dt = Math.min((now - last) / 1000, 1 / 60); last = now;
    resize();
    if (ptr.moved) {
      ptr.moved = false;
      const c = cfg.current, ar = canvas.width / canvas.height;
      let dx = ptr.x - ptr.px, dy = ptr.y - ptr.py; if (ar < 1) dx *= ar; if (ar > 1) dy /= ar;
      const speed = Math.hypot(dx, dy);
      if (speed > 0) {
        hue = (hue + speed * 0.22 + dt * 0.1) % 1;
        const base = c.rainbow ? hsv(hue) : c.blend === "multiply" ? ([1, 1, 1] as [number, number, number]) : hex(c.color);
        // dye follows how far you moved, so a slow drift leaves a wisp and a sweep pours
        const k = (c.blend === "multiply" ? 0.04 : c.rainbow ? 0.075 : 0.06) * Math.min(1.5, Math.max(0.12, speed / 0.006));
        splat(ptr.x, ptr.y, dx * c.force, dy * c.force, [base[0] * k, base[1] * k, base[2] * k]);
      }
      ptr.px = ptr.x; ptr.py = ptr.y;
    }
    step(dt); render();
    if (now - lastMove < 1200 + 9000 / Math.max(0.3, cfg.current.fade)) raf = requestAnimationFrame(frame);
    else { g.bindFramebuffer(g.FRAMEBUFFER, null); g.clear(g.COLOR_BUFFER_BIT); onSleep(); }
  };
  const wake = () => { if (!raf && alive) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  return {
    move: (x, y, w, h) => {
      const u = x / w, v = 1 - y / h;
      if (ptr.first) { ptr.px = u; ptr.py = v; ptr.first = false; }
      ptr.x = u; ptr.y = v; ptr.moved = true; lastMove = performance.now(); wake();
    },
    wake,
    destroy: () => { alive = false; cancelAnimationFrame(raf); g.getExtension("WEBGL_lose_context")?.loseContext(); },
  };
}

/**
 * A fluid you stir with the pointer, solved on the GPU. Move and it pours out of the cursor and curls into eddies,
 * lit like a body of smoke with a wet glint, then fades. Screen it over dark pages or set Multiply for ink on light
 * ones. Put it inside any `position: relative` element (`area="inside"`), or as a fixed full-page layer. Clicks
 * pass straight through. It sleeps once the trail has gone, skips machines without a GPU, and stays off for people
 * who ask for reduced motion.
 */
export function LiquidSmoke({ area = "inside", autoplay = false, allowSoftware = false, pixelRatio = 1.5, cursorColor, className, style, ...settings }: LiquidSmokeProps) {
  const s = { ...DEFAULTS, ...Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== undefined)) } as Required<SmokeSettings>;
  // ink needs a dark dye: with no colour given, multiply draws in near-black instead of the default silver
  if (s.blend === "multiply" && settings.color === undefined) s.color = "#1d1d1f";
  // the solver reads the latest settings each frame, so changing a prop never restarts it
  const cfg = useRef(s);
  useLayoutEffect(() => { cfg.current = s; });
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  // false once the GPU check fails, so the drawn cursor is dropped and the system one comes back
  const [gpu, setGpu] = useState(true);
  const ok = gpu && !reduced;
  // the cursor: follows tightly, stretches along its own speed, fades when you stop
  const cx = useMotionValue(-100), cy = useMotionValue(-100), vis = useMotionValue(0);
  const sx = useSpring(cx, { stiffness: 1200, damping: 60 }), sy = useSpring(cy, { stiffness: 1200, damping: 60 });
  const stretch = useMotionValue(1), angle = useMotionValue(0);
  const stretchS = useSpring(stretch, { stiffness: 300, damping: 22 });
  const squash = useTransform(stretchS, (v) => 1 / Math.sqrt(v));
  const op = useSpring(vis, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const wrap = wrapRef.current; if (!wrap || reduced) return;
    const host: HTMLElement | Window = area === "page" ? window : (wrap.parentElement ?? wrap);
    const mode = cfg.current.blend;
    const cv = mountCanvas(wrap, mode === "normal" ? "normal" : mode);
    let touched = false, auto = 0, autoT = 0, resume = 0, hideT = 0, inView = true;
    const eng = createEngine(cv, cfg, allowSoftware, pixelRatio, () => {});
    // no GPU (or only a software one): leave the area empty and give the system pointer back
    if (!eng) { cv.remove(); setGpu(false); return; }
    let lx = 0, ly = 0, lt = performance.now();
    const at = (x: number, y: number, real: boolean) => {
      const r = cv.getBoundingClientRect(); const px = x - r.left, py = y - r.top;
      eng.move(px, py, r.width, r.height);
      if (real) {
        cx.set(px); cy.set(py); vis.set(1);
        const now = performance.now(), dt = Math.max(8, now - lt), v = Math.hypot(px - lx, py - ly) / dt;
        stretch.set(1 + Math.min(0.9, v * 0.35)); if (v > 0.05) angle.set((Math.atan2(py - ly, px - lx) * 180) / Math.PI);
        lx = px; ly = py; lt = now;
        clearTimeout(hideT); hideT = window.setTimeout(() => { vis.set(0); stretch.set(1); }, 1100);
      }
    };
    const onMove = (e: PointerEvent) => {
      if (area === "inside") { const r = cv.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return; }
      touched = true; cancelAnimationFrame(auto); auto = 0; clearTimeout(resume);
      at(e.clientX, e.clientY, true);
    };
    const onLeave = () => { vis.set(0); if (autoplay) { clearTimeout(resume); resume = window.setTimeout(() => { touched = false; startAuto(); }, 2600); } };
    // a lazy self-stir for previews: two slow waves, never quite repeating
    const startAuto = () => {
      if (!autoplay || touched || auto) return;
      const t0 = performance.now() - autoT * 1000;
      const tick = () => {
        if (touched || !inView) { auto = 0; return; }
        const t = (performance.now() - t0) / 1000; autoT = t;
        const r = cv.getBoundingClientRect();
        const x = r.left + r.width * (0.5 + 0.34 * Math.sin(t * 0.9) * Math.cos(t * 0.37)), y = r.top + r.height * (0.5 + 0.3 * Math.sin(t * 1.43 + 1.1));
        at(x, y, false); auto = requestAnimationFrame(tick);
      };
      auto = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => { inView = en.isIntersecting; if (inView) startAuto(); }, { threshold: 0.05 });
    io.observe(cv);
    host.addEventListener("pointermove", onMove as EventListener, { passive: true });
    host.addEventListener("pointerdown", onMove as EventListener, { passive: true });
    if (area === "inside") (host as HTMLElement).addEventListener("pointerleave", onLeave);
    startAuto();
    return () => {
      io.disconnect(); cancelAnimationFrame(auto); clearTimeout(resume); clearTimeout(hideT);
      host.removeEventListener("pointermove", onMove as EventListener); host.removeEventListener("pointerdown", onMove as EventListener);
      if (area === "inside") (host as HTMLElement).removeEventListener("pointerleave", onLeave);
      eng.destroy();
      cv.remove();
    };
  }, [area, autoplay, allowSoftware, pixelRatio, reduced, cx, cy, vis, stretch, angle]);

  // hide the system cursor over the area while ours is drawn
  useEffect(() => {
    const host = area === "page" ? document.documentElement : wrapRef.current?.parentElement;
    if (!host || !ok || s.cursor === "native") return;
    return hideCursor(host);
  }, [area, ok, s.cursor]);

  // the blend can change without restarting the solver
  useEffect(() => setBlend(wrapRef.current, s.blend === "normal" ? "normal" : s.blend), [s.blend]);

  const ink = s.blend === "multiply";
  const cc = cursorColor ?? (ink ? "rgba(29,29,31,.75)" : "rgba(255,255,255,.8)");
  const wrap: CSSProperties = area === "page" ? { position: "fixed", inset: 0, zIndex: 50 } : { position: "absolute", inset: 0 };

  return (
    <div ref={wrapRef} aria-hidden className={className} style={{ ...wrap, pointerEvents: "none", overflow: "hidden", borderRadius: "inherit", ...style }}>
      {ok && s.cursor !== "native" && (
        <motion.div style={{ position: "absolute", left: 0, top: 0, x: sx, y: sy, opacity: op }}>
          <motion.div style={{
            width: s.cursor === "ring" ? 26 : 8, height: s.cursor === "ring" ? 26 : 8, marginLeft: s.cursor === "ring" ? -13 : -4, marginTop: s.cursor === "ring" ? -13 : -4, borderRadius: "50%",
            border: s.cursor === "ring" ? `1.5px solid ${cc}` : "none", background: s.cursor === "dot" ? cc : "transparent", rotate: angle, scaleX: stretchS, scaleY: squash,
            boxShadow: s.cursor === "ring" ? `0 0 0 .5px ${ink ? "rgba(255,255,255,.4)" : "rgba(0,0,0,.25)"}` : "none",
          }} />
        </motion.div>
      )}
    </div>
  );
}
