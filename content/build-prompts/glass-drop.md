# Glass Drop

Add the "Glass Drop" component from Nexus UI to my project.

A logo intro made of liquid glass. A droplet lands as a bubble that magnifies your logo hugely and fringes it with colour, swells into a rounded glass icon whose thick walls drag the logo out to the rim and split the light, then relaxes and melts away, leaving your logo crisp with a soft domed finish. Pick the ending: the logo alone, or the logo with your name, where a clear ball lands on the logo and opens into a rippling lens that sweeps out over the name. Three looks: dark, light and blue. Drop in any SVG or PNG and it uses that instead of the default mark. Plays when it comes into view, click to replay, and the light follows the pointer.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { GlassDrop } from "@/components/glass-drop";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/glass-drop/glass-drop.tsx ---

```tsx
"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

// ─── Logo ──────────────────────────────────────────────────────────────────────
// The logo is drawn into a texture, so any image works: pass `logoSrc` (SVG or
// PNG), drop a file onto the stage, or keep the default Nexus UI mark. Your
// logo keeps its own colours; pass `tint` to cast it in the theme's ink.

type Ink = { body: string; core: string; glint: string };

function drawNexusMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, ink: Ink) {
  const s = size / 100;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.lineCap = "round";
  ctx.strokeStyle = ink.body;
  ctx.fillStyle = ink.body;
  ctx.lineWidth = 6.5;
  const tips: [number, number][] = [
    [50, 12],
    [14, 74],
    [86, 74],
  ];
  for (const [tx, ty] of tips) {
    ctx.beginPath();
    ctx.moveTo(50, 53);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = ink.core;
  ctx.beginPath();
  ctx.arc(50, 53, 11.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = ink.glint;
  ctx.beginPath();
  ctx.arc(46.4, 49.4, 3.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ─── Shaders ───────────────────────────────────────────────────────────────────
// One surface of liquid glass does everything, and the light really bends
// through it: a droplet's dome magnifies, a slab's rounded edge reaches in
// from the rim, and ripples run across it. It lands as a bubble that magnifies
// the logo hugely and fringes it magenta, swells into a rounded glass icon whose
// thick walls drag the logo out to the rim and split it into orange and blue,
// then relaxes to 1x and melts away, leaving the logo with a soft domed finish.
// For the name ending a clear ball lands on the logo, folds the name into rings,
// then opens into a lens that ripples and sweeps outward, streaking the letters
// at its rim, until the whole lockup sits there crisp.

const VS = `#version 300 es
in vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

const FS = `#version 300 es
precision highp float;
out vec4 o;
uniform vec2 u_res;
uniform float u_T;          // icon half size, px
uniform vec2 u_half;        // lens half size, icon units
uniform float u_rad;        // lens corner radius
// the glass surface
uniform float u_dome;       // 0..1, how much of the droplet's dome is left
uniform float u_domeD;      // dome depth: the centre magnifies 1 / (1 - domeD)
uniform float u_domeCap;    // how steep the dome's rim gets (high folds it into rings)
uniform float u_bevel;      // 0..1, the rounded edge of the slab
uniform float u_bw;         // bevel width, share of the short half
uniform float u_bevD;       // bevel reach: how far in from the rim the walls look, share of the short half
uniform float u_wallK;      // how much the thick walls scatter: light from a thin stroke spreads into a broad glow
uniform float u_disp;       // dispersion at the walls: red bends least, blue most
uniform float u_dispD;      // dispersion through the dome
uniform float u_dispK;      // the theme's dispersion strength
uniform float u_M;          // overall zoom
uniform vec2 u_focus;       // where the zoom is centred
uniform float u_blur;       // mip bias, out of focus early on
uniform float u_band;       // the name lens's rim: letters streak out through rippled glass
uniform float u_jag;        // ripples running out from where the drop landed
uniform float u_ring2;      // the inner line of a thick glass wall
uniform float u_bodyA;      // glass body opacity
uniform float u_lift;       // a bubble is lighter inside than the icon
uniform float u_rimA;       // rim light
uniform float u_spec;       // specular highlights
uniform float u_rings;      // ripples in the halo around the lens
uniform float u_lensA;
uniform float u_mix;        // lens content: 0 logo, 1 logo with name
uniform float u_time;
uniform float u_outA;       // the logo outside any lens
uniform float u_outMix;
uniform float u_outScale;
uniform float u_outGrey;
uniform float u_puff;       // domed finish on the logo
uniform float u_fade;
uniform vec2 u_lHalf;
uniform vec2 u_kHalf;
uniform sampler2D u_logo;
uniform sampler2D u_lock;
uniform sampler2D u_lblur;
uniform sampler2D u_kblur;
uniform vec3 u_tint;
uniform vec3 u_liftC;
uniform vec3 u_rim;
uniform vec3 u_env;
uniform vec3 u_bg;
uniform vec3 u_glowC;
uniform vec2 u_light;
uniform float u_glow;

float sdRB(vec2 p, vec2 b, float r){
  r = min(r, min(b.x, b.y));
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
vec4 tex(sampler2D s, vec2 q, vec2 h, float bias){
  vec2 uv = q / (2.0 * h) + 0.5;
  uv.y = 1.0 - uv.y;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) return vec4(0.0);
  return texture(s, uv, bias);
}
vec4 content(vec2 q, float bias, float m){
  if (m < 0.5) return tex(u_logo, q, u_lHalf, bias);
  return tex(u_lock, q, u_kHalf, bias);
}
float soft(vec2 q, float m){
  if (m < 0.5) return tex(u_lblur, q, u_lHalf, 0.0).r;
  return tex(u_kblur, q, u_kHalf, 0.0).r;
}
// the domed finish: bright in the middle of every stroke, rolling off at the
// edges, a touch darker on the side facing away from the light
float puffAt(vec2 q, float m){
  float h = m < 0.5 ? 0.012 : 0.0065;
  float c = soft(q, m);
  float bx = soft(q + vec2(h, 0.0), m) - soft(q - vec2(h, 0.0), m);
  float by = soft(q + vec2(0.0, h), m) - soft(q - vec2(0.0, h), m);
  vec3 N = normalize(vec3(-bx * 2.6, -by * 2.6, 1.0));
  float dif = dot(N, normalize(vec3(-0.45, 0.55, 0.8)));
  float inner = smoothstep(0.5, 0.8, c);
  return clamp(mix(0.8, 1.0, inner) * (0.9 + 0.12 * dif), 0.0, 1.0);
}
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
// slope of a round profile, 0 on the flat and climbing steeply at the rim
float roundSlope(float x, float cap){
  x = clamp(x, 0.0, 0.995);
  return min(x / sqrt(1.0 - x * x), cap);
}

// the logo outside any lens
vec4 outsideLogo(vec2 p){
  if (u_outA <= 0.001) return vec4(0.0);
  vec2 po = p / u_outScale;
  vec4 oc = content(po, 0.0, u_outMix);
  vec3 ocol = oc.rgb;
  if (u_puff > 0.001 && oc.a > 0.002) ocol *= mix(1.0, puffAt(po, u_outMix), u_puff);
  ocol = mix(ocol, u_bg * oc.a, u_outGrey);
  return vec4(ocol, oc.a) * u_outA;
}
// a soft halo around the lens on light pages, with the ripples running through it
float haloAt(float sd, float minHalf, float aa){
  float ho = max(sd, 0.0);
  float halo = exp(-ho / (0.3 * minHalf)) * (1.0 - aa) * u_lensA * u_glow * (1.0 + 0.8 * u_dome) * (1.0 - u_bevel * (1.0 - u_ring2));
  return halo * (1.0 + u_rings * 0.35 * cos(ho * 45.0 - u_time * 22.0) * exp(-ho / (0.6 * minHalf)));
}

// Light through the glass. Each colour is bent by a different amount (red the
// least, blue the most), and each output channel takes its own channel from its
// own bent sample. That alone makes every colour the real thing makes: where a
// white edge is pulled apart it goes yellow on one side and cyan then blue on
// the other, and dark gaps between white strokes fill with magenta.
// Inside a thick wall the light scatters, so a thin stroke seen through it
// spreads into a broad soft glow: the blurred coverage is lifted toward one.
vec4 scatter(vec4 c, float gain){
  float a2 = 1.0 - pow(max(1.0 - c.a, 0.0), gain);
  vec3 rgb = c.a > 0.002 ? c.rgb / c.a : vec3(1.0);
  return vec4(rgb * a2, a2);
}
void refracted(vec2 q0, vec2 dR, vec2 dG, vec2 dB, float bias, float gain, out vec3 rgb, out vec3 cov){
  vec4 cR = scatter(content(q0 - dR, bias, u_mix), gain);
  vec4 cG = scatter(content(q0 - dG, bias, u_mix), gain);
  vec4 cB = scatter(content(q0 - dB, bias, u_mix), gain);
  rgb = vec3(cR.r, cG.g, cB.b);
  cov = vec3(cR.a, cG.a, cB.a);
}

void main(){
  vec2 p = (gl_FragCoord.xy - u_res * 0.5) / u_T;
  float px = 1.0 / u_T;
  vec2 L = normalize(u_light);

  // ── the lens outline ──
  float sd = sdRB(p, u_half, u_rad);
  vec2 e = vec2(0.002, 0.0);
  vec2 g = vec2(sdRB(p + e.xy, u_half, u_rad) - sdRB(p - e.xy, u_half, u_rad), sdRB(p + e.yx, u_half, u_rad) - sdRB(p - e.yx, u_half, u_rad));
  vec2 n2 = normalize(g + 1e-6);
  float inside = -sd;
  float minHalf = min(u_half.x, u_half.y);
  // outside the glass there is only the bare logo and the halo: skip the lens
  if (sd > 2.0 * px || u_lensA <= 0.001) {
    vec4 res0 = outsideLogo(p);
    float h0 = haloAt(sd, minHalf, 0.0);
    res0.rgb += u_glowC * h0 * 0.4;
    res0.a = clamp(res0.a + h0 * 0.4, 0.0, 1.0);
    o = res0 * u_fade;
    return;
  }
  float r = length(p);
  vec2 rdir = r > 1e-5 ? p / r : vec2(0.0);

  // ── the surface: a droplet's dome that flattens into a slab whose edge rolls
  // over, and whose walls look a long way in from the rim ──
  float xd = clamp(1.0 - inside / minHalf, 0.0, 1.0);
  float sDome = roundSlope(xd, u_domeCap);
  float bw = minHalf * u_bw;
  float xb = clamp(1.0 - inside / bw, 0.0, 1.0);
  // the wall's reach grows smoothly across the whole bevel, steepest at the rim
  float sBev = xb * (0.45 + 0.55 * xb);
  // ripples in the name lens's rim: rows of the glass bend by different amounts
  sBev *= 1.0 + u_band * 0.35 * sin(p.y * 150.0 + sin(p.y * 41.0) * 1.7 + u_time * 6.0);
  vec2 dDome = n2 * sDome * u_dome * u_domeD * minHalf;
  vec2 dBev = n2 * sBev * u_bevel * u_bevD * minHalf;
  vec2 q0 = p / u_M + u_focus;
  // ripples running out from where the drop landed: fine rings; where they
  // cross an edge in the picture it turns wavy and serrated
  if (u_jag > 0.001) {
    float ang2 = atan(p.y, p.x);
    float rr2 = r + 0.012 * minHalf * sin(ang2 * 5.0 + u_time * 7.0);
    float k = 6.2831 / 0.2;
    float chop = u_bevel;
    vec2 wob = rdir * sin(rr2 * k - u_time * 38.0) + 0.6 * chop * vec2(sin(p.y * 31.0 + u_time * 23.0), sin(p.x * 29.0 - u_time * 19.0));
    q0 += wob * u_jag * 0.03 * smoothstep(0.0, 0.12 * minHalf, r) * (1.0 - chop * 0.4 * vnoise(p * 7.0 + u_time * 3.0));
  }
  // through the walls red bends least and blue most; through the drop's dome
  // green focuses tightest, so a white shape wears a magenta edge all round
  float kD = u_dispD * u_dispK * (1.0 - pow(xd, 3.0));
  float kB = u_disp * u_dispK;
  // the blue side of the split is the strong one; the warm side stays faint
  vec2 dR = dDome * (1.0 + kD) + dBev * (1.0 - 0.3 * kB);
  vec2 dG = dDome + dBev;
  vec2 dB = dDome * (1.0 + kD * 1.3) + dBev * (1.0 + kB);
  float wall = smoothstep(0.0, 0.5, xb) * u_bevel;
  float bias = u_blur + 3.0 * wall + pow(xd, 4.0) * 2.0 * u_dome;
  bias = mix(bias, min(bias, 1.2), u_band);
  float gain = 1.0 + u_wallK * wall * (1.0 - u_band);

  vec3 colour, cov;
  refracted(q0, dR, dG, dB, bias, gain, colour, cov);
  if (u_band > 0.001 && xb > 0.001) {
    // at the name lens's rim the letters streak out along the light's path
    vec3 accC = vec3(0.0), accA = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float k = 0.55 + 0.9 * float(i) / 5.0;
      vec3 c1, a1;
      refracted(q0, dR * k, dG * k, dB * k, bias + 0.4, 1.0, c1, a1);
      accC += c1;
      accA += a1;
    }
    float w = u_band * smoothstep(0.0, 0.3, xb);
    colour = mix(colour, accC / 6.0, w);
    cov = mix(cov, accA / 6.0, w);
  }
  float covA = max(max(cov.r, cov.g), cov.b);
  if (u_puff > 0.001 && covA > 0.002) colour *= mix(1.0, puffAt(q0 - dG, u_mix), u_puff * (1.0 - u_dome) * (1.0 - wall));

  float rr = length(p / max(u_half, vec2(0.001)));
  vec3 body = u_tint + u_liftC * u_lift * (0.6 + 0.4 * clamp(1.0 - rr, 0.0, 1.0));
  vec3 lensRGB = colour + body * u_bodyA * (1.0 - cov);
  float covM = max(max(cov.r, cov.g), cov.b);
  float lensA = covM + u_bodyA * (1.0 - covM);

  // ── light on the surface: a glint off the rim, a soft window on the drop ──
  vec2 grad = n2 * (sDome * u_dome * 0.8 + sBev * u_bevel * 0.9);
  vec3 N = normalize(vec3(grad, 1.0));
  vec3 L3 = normalize(vec3(L, 1.1));
  vec3 Hv = normalize(L3 + vec3(0.0, 0.0, 1.0));
  float nh = max(dot(N, Hv), 0.0);
  float spec = pow(nh, 120.0) * 1.1 + pow(nh, 18.0) * 0.08;
  vec2 sw = (p - vec2(-0.32, 0.36) * minHalf) / minHalf;
  spec += u_dome * 0.55 * exp(-dot(sw, sw) / 0.02);
  float fres = pow(1.0 - N.z, 1.6);
  float lit = 0.5 + 0.5 * dot(n2, L);
  float rim1 = exp(-pow(inside / (1.4 * px), 2.0));
  float rim2 = exp(-pow((inside - minHalf * 0.1) / (1.6 * px), 2.0));
  lensRGB += mix(u_env, u_rim, lit) * fres * (0.04 + 0.16 * lit) * u_rimA * (0.12 + 0.88 * u_bevel);
  lensRGB += u_rim * rim1 * (0.05 + 0.35 * lit * lit) * u_rimA;
  lensRGB += u_rim * rim2 * (0.03 + 0.2 * lit * lit) * u_ring2;
  lensRGB += vec3(1.0) * spec * u_spec;
  lensA = clamp(max(lensA, max(rim1 * 0.5 * u_rimA, max(fres * 0.5 * u_rimA * (0.12 + 0.88 * u_bevel), spec * u_spec))), 0.0, 1.0);

  float aa = clamp(0.5 - sd / px, 0.0, 1.0) * u_lensA;

  vec4 outside = outsideLogo(p);
  float halo = haloAt(sd, minHalf, aa);

  vec4 res = vec4(lensRGB, lensA) * aa + outside * (1.0 - lensA * aa);
  res.rgb += u_glowC * halo * 0.4;
  res.a = clamp(res.a + halo * 0.4, 0.0, 1.0);
  o = res * u_fade;
}`;

// ─── Timeline ──────────────────────────────────────────────────────────────────

export type GlassDropEnding = "logo" | "logo-text";
export type GlassDropTheme = "dark" | "light" | "blue";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const outQuad = (x: number) => 1 - Math.pow(1 - clamp01(x), 2);
const mixv = (a: number, b: number, k: number) => a + (b - a) * k;

const A = 0.06; // the droplet lands
const F = A + 1.22; // the glass has melted away
const G = F + 0.14; // the clear drop lands (name ending)
const LOGO_STEP_BACK = 0.7; // the logo shrinks to this before the drop lands on it
const LOGO_IN_LOCKUP = 0.5; // and sits at this size beside the name

const FRAME_KEYS = [
  "rad", "dome", "domeD", "domeCap", "bevel", "bw", "bevD", "wallK", "disp", "dispD", "M", "blur", "band", "jag", "ring2",
  "bodyA", "lift", "rimA", "spec", "rings", "lensA", "mix", "outA", "outMix", "outScale", "outGrey",
] as const;
type Frame = Record<(typeof FRAME_KEYS)[number] | "hx" | "hy" | "fx" | "fy", number>;

function frame(t: number, ending: GlassDropEnding, lockHX: number, focus: number[]): Frame {
  const s = Math.max(0, t - A);
  // The droplet swells from a small bubble to the icon's size over a third of a
  // second, and rounds from a ball into the squircle on the way. Its centre
  // magnifies the logo nearly four times at first and relaxes toward one; the
  // dome does that magnifying while it is a drop, and the zoom takes over as it
  // flattens, so the picture never jumps.
  const R = mixv(0.4, 1.0, outQuad(s / 0.32));
  const m = smooth(A + 0.15, A + 0.27, t);
  const settle = 1 - smooth(A + 0.95, A + 1.12, t);
  const Mc = 1 + (2.5 * Math.exp(-s / 0.11) + 0.42 * Math.exp(-s / 0.4)) * settle;
  const domeD = 1 - 1 / Mc;
  const f: Frame = {
    hx: R,
    hy: R,
    rad: mixv(R, 0.44, m),
    dome: 1 - m,
    domeD,
    domeCap: 1.25,
    bevel: m,
    bw: 0.4,
    bevD: 0.62,
    wallK: 3.5,
    dispD: 0.035,
    disp: 0.1,
    M: 1 / (1 - m * domeD),
    // the drop lands a little above the middle, over the top of the logo, and its view drifts to the centre
    fx: -0.03 * Math.exp(-s / 0.18),
    fy: 0.4 * Math.exp(-s / 0.18),
    blur: 3.2 * Math.exp(-s / 0.1),
    band: 0,
    jag: 0,
    ring2: 1,
    bodyA: mixv(0.5, 1, m),
    lift: 1 - m,
    rimA: 1,
    spec: 0.2,
    rings: 0,
    lensA: smooth(A, A + 0.07, t),
    mix: 0,
    outA: 0,
    outMix: 0,
    outScale: 1,
    outGrey: 0,
  };

  // the glass melts away and leaves the logo
  const melt = smooth(A + 1.04, A + 1.2, t);
  f.lensA *= 1 - melt;
  f.outA = smooth(A + 1.0, A + 1.08, t);
  if (ending === "logo" || t < F) return f;

  // the logo steps back and greys; a clear drop lands on it
  const shrink = smooth(F, F + 0.1, t);
  f.outScale = mixv(1, LOGO_STEP_BACK, shrink);
  f.outGrey = 0.45 * smooth(F + 0.04, F + 0.12, t);
  f.outA = 1 - smooth(G, G + 0.05, t);
  f.outMix = 0;
  if (t < G) return f;

  // A round drop magnifies the middle of the name and folds the rest into rings
  // at its rim. Ripples build in it until it overshoots through its focus (the
  // picture flips), then it collapses flat and keeps spreading, in one unbroken
  // motion, out over the whole lockup, the letters streaking at its edge until
  // it has passed them.
  const g = t - G;
  const Rend = lockHX * 1.3 + 0.5;
  const Rn = mixv(0.9, Rend, smooth(0, 1.3, g));
  const flip = smooth(G + 0.29, G + 0.305, t);
  const flat = smooth(G + 0.31, G + 0.345, t);
  const dt = Math.max(0, t - (G + 0.335));
  const gone = smooth(G + 1.25, G + 1.5, t);
  const calm = 1 - smooth(G + 0.33, G + 0.5, t);
  const passed = smooth(G + 1.0, G + 1.35, t);
  return {
    hx: Rn,
    hy: Rn,
    rad: Rn,
    dome: 1 - flat,
    domeD: mixv(0.62, 1.05, flip),
    domeCap: 6,
    bevel: smooth(G + 0.33, G + 0.42, t),
    bw: 0.34,
    bevD: 0.18 * (1 - 0.6 * passed),
    wallK: 0,
    disp: 0.22,
    dispD: 0.03,
    M: g < 0.335 ? 1 : 1 + 1.2 * Math.exp(-dt / 0.08),
    fx: focus[0] * (1 - smooth(G + 0.335, G + 0.36, t)),
    fy: focus[1] * (1 - smooth(G + 0.335, G + 0.36, t)),
    blur: 0.3,
    band: smooth(G + 0.4, G + 0.5, t) * (1 - passed),
    jag: g < 0.31 ? 0.8 * smooth(G + 0.21, G + 0.3, t) : 1.2 * Math.exp(-Math.max(0, t - G - 0.31) / 0.08),
    ring2: 0,
    bodyA: mixv(0.55, 0.06, flat) * calm,
    lift: 0,
    rimA: mixv(0.75, 0.12, flat) * calm,
    spec: mixv(0.8, 0.25, flat) * calm,
    rings: 1 - smooth(G + 0.3, G + 0.4, t),
    lensA: smooth(G, G + 0.03, t) * (1 - gone),
    mix: 1,
    outA: smooth(G + 1.0, G + 1.12, t),
    outMix: 1,
    outScale: 1,
    outGrey: 0,
  };
}
const LENGTH = { logo: A + 1.3, "logo-text": G + 1.6 };

const THEMES: Record<
  GlassDropTheme,
  { bg: string; bgC: number[]; ink: string; mark: Ink; tint: number[]; lift: number[]; rim: number[]; env: number[]; glowC: number[]; glow: number; puff: number; label: string; dark: boolean }
> = {
  dark: { label: "Dark", dark: true, bg: "#000000", bgC: [0, 0, 0], ink: "#eef0f5", mark: { body: "#eef0f5", core: "#8f8cff", glint: "#e3e2ff" }, tint: [0.018, 0.026, 0.05], lift: [0.07, 0.08, 0.1], rim: [0.78, 0.84, 0.95], env: [0.3, 0.36, 0.5], glowC: [0, 0, 0], glow: 0, puff: 1 },
  light: { label: "Light", dark: false, bg: "#e3e3e6", bgC: [0.89, 0.89, 0.9], ink: "#0f1222", mark: { body: "#0f1222", core: "#6d68ff", glint: "#c9c7ff" }, tint: [0.925, 0.935, 0.955], lift: [0.03, 0.03, 0.03], rim: [1, 1, 1], env: [0.72, 0.8, 1], glowC: [0.76, 0.83, 1], glow: 0.5, puff: 0 },
  blue: { label: "Blue", dark: true, bg: "radial-gradient(60% 70% at 50% 50%, #1b2a6e 0%, #0d1540 50%, #04061a 100%)", bgC: [0.07, 0.1, 0.27], ink: "#eef0f5", mark: { body: "#eef0f5", core: "#8f8cff", glint: "#e3e2ff" }, tint: [0.018, 0.026, 0.055], lift: [0.07, 0.08, 0.11], rim: [0.8, 0.86, 1], env: [0.26, 0.36, 0.86], glowC: [0, 0, 0], glow: 0, puff: 1 },
};

const FONT_FAMILY = `Inter, -apple-system, "SF Pro Display", "Segoe UI", system-ui, sans-serif`;

/**
 * Glass Drop: a logo intro made of liquid glass. A droplet lands as a bubble that
 * magnifies your logo, swells into a glass icon whose walls bend the logo out to
 * the rim and split the light into colour, then clears to the logo, crisp and
 * full size with a soft domed finish. The "logo and name" ending then drops a clear
 * ball on the logo that opens out over your name. Three looks: dark, light and blue.
 * Drop any SVG or PNG on it and it uses that. Plays in view; click to replay.
 */
export function GlassDrop({
  logoSrc,
  name = "Nexus UI",
  ending: endingProp = "logo",
  theme: themeProp = "dark",
  tint = false,
  height = 460,
  loop = false,
  autoplay = true,
  controls = true,
  className = "",
}: {
  /** an SVG or PNG to use instead of the Nexus UI mark */
  logoSrc?: string;
  /** the name revealed by the logo-text ending */
  name?: string;
  /** "logo" ends on your logo alone; "logo-text" goes on to reveal your name beside it */
  ending?: GlassDropEnding;
  /** the stage and the glass: dark, light or blue */
  theme?: GlassDropTheme;
  /** cast your logo in the theme's ink (white on dark, ink on light) instead of its own colours */
  tint?: boolean;
  height?: number;
  /** replay forever; otherwise it plays once when it first comes into view */
  loop?: boolean;
  /** play when it comes into view */
  autoplay?: boolean;
  /** show the pickers and the upload button */
  controls?: boolean;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const inView = useInView(stage, { amount: 0.5 });
  const [ending, setEnding] = useState<GlassDropEnding>(endingProp);
  const [theme, setTheme] = useState<GlassDropTheme>(themeProp);
  // the pickers change the look on their own; a new prop value resets them
  const [seenEnding, setSeenEnding] = useState(endingProp);
  const [seenTheme, setSeenTheme] = useState(themeProp);
  if (seenEnding !== endingProp) {
    setSeenEnding(endingProp);
    setEnding(endingProp);
  }
  if (seenTheme !== themeProp) {
    setSeenTheme(themeProp);
    setTheme(themeProp);
  }
  const [failed, setFailed] = useState(false);
  const [dropped, setDropped] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const src = dropped ?? logoSrc;
  const st = useRef({ start: -1, light: [-0.55, 0.8], want: [-0.55, 0.8], ending: endingProp, loop, reduce: false });
  useEffect(() => {
    st.current.ending = ending;
    st.current.loop = loop;
    st.current.reduce = !!reduce;
  }, [ending, loop, reduce]);

  const play = useCallback(() => {
    st.current.start = performance.now();
  }, []);

  useEffect(() => {
    // plays the first time it is seen
    if (inView && autoplay && st.current.start < 0) play();
  }, [inView, autoplay, play]);
  useEffect(() => () => void (dropped && URL.revokeObjectURL(dropped)), [dropped]);

  // the GL context lives as long as the canvas; theme, logo and name changes only rebuild textures
  useEffect(() => {
    const cv = canvas.current;
    return () => void cv?.getContext("webgl2")?.getExtension("WEBGL_lose_context")?.loseContext();
  }, []);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const gl = cv.getContext("webgl2", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl || gl.isContextLost()) {
      setFailed(true);
      return;
    }
    setFailed(false);
    const shaders: WebGLShader[] = [];
    const mk = (type: number, code: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, code);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(s));
      shaders.push(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn(gl.getProgramInfoLog(prog));
      setFailed(true);
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const names = [
      "u_res", "u_T", "u_half", "u_focus", "u_time", "u_puff", "u_fade", "u_lHalf", "u_kHalf", "u_logo", "u_lock", "u_lblur", "u_kblur",
      "u_tint", "u_liftC", "u_rim", "u_env", "u_bg", "u_dispK", "u_glowC", "u_light", "u_glow", ...FRAME_KEYS.map((k) => `u_${k}`),
    ];
    const u = Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(prog, n)]));
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const TH = THEMES[theme];
    gl.uniform3fv(u.u_tint, TH.tint);
    gl.uniform3fv(u.u_liftC, TH.lift);
    gl.uniform3fv(u.u_rim, TH.rim);
    gl.uniform3fv(u.u_env, TH.env);
    gl.uniform3fv(u.u_bg, TH.bgC);
    gl.uniform1f(u.u_dispK, TH.dark ? 1 : 0.5);
    gl.uniform3fv(u.u_glowC, TH.glowC);
    gl.uniform1f(u.u_glow, TH.glow);

    // ── textures: the logo alone, the logo with the name, and soft copies for the domed finish ──
    const textures: WebGLTexture[] = [];
    const put = (unit: number, image: TexImageSource) => {
      const t = gl.createTexture()!;
      textures.push(t);
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    };
    // a soft copy of the alpha, used as a height field for the domed finish
    const softOf = (c: HTMLCanvasElement, radius: number) => {
      const b = document.createElement("canvas");
      b.width = Math.round(c.width / 2);
      b.height = Math.round(c.height / 2);
      const bx = b.getContext("2d")!;
      bx.filter = `blur(${radius / 2}px)`;
      if (bx.filter.startsWith("blur")) {
        bx.drawImage(c, 0, 0, b.width, b.height);
      } else {
        // no canvas filters: blur by shrinking and growing back
        const k = Math.max(2, Math.round(radius / 1.5));
        const sm = document.createElement("canvas");
        sm.width = Math.max(4, Math.round(c.width / k));
        sm.height = Math.max(4, Math.round(c.height / k));
        sm.getContext("2d")!.drawImage(c, 0, 0, sm.width, sm.height);
        bx.imageSmoothingQuality = "high";
        bx.drawImage(sm, 0, 0, b.width, b.height);
      }
      const id = bx.getImageData(0, 0, b.width, b.height);
      for (let i = 0; i < id.data.length; i += 4) {
        const a = id.data[i + 3];
        id.data[i] = id.data[i + 1] = id.data[i + 2] = a;
        id.data[i + 3] = 255;
      }
      bx.putImageData(id, 0, 0);
      return b;
    };
    const castInk = (c: HTMLCanvasElement) => {
      if (!tint) return;
      const x = c.getContext("2d")!;
      x.globalCompositeOperation = "source-in";
      x.fillStyle = TH.ink;
      x.fillRect(0, 0, c.width, c.height);
      x.globalCompositeOperation = "source-over";
    };

    // the logo texture: a 512 square with the mark in a 410 box, the mark
    // spanning 1.04 icon units (about half the glass tile)
    // Both are drawn at twice the size they end up on screen, so the logo the
    // glass leaves behind is sampled 2:1 and stays crisp; they are redrawn
    // whenever the stage changes size.
    const MARK_HALF = 0.68;
    let TEX = 512;
    let MARK = 410;
    let KM = 220;
    let lHalf = (TEX / MARK) * MARK_HALF;
    let lockHX = 1.6;
    let ballFocus = [0, 0];
    let builtT = 0;
    const sizeFor = (T: number) => {
      builtT = T;
      MARK = Math.max(128, Math.min(1024, Math.round(MARK_HALF * 2 * T * 2)));
      TEX = Math.round((MARK * 512) / 410);
      lHalf = (TEX / MARK) * MARK_HALF;
      KM = Math.max(80, Math.min(600, Math.round(MARK_HALF * 2 * LOGO_IN_LOCKUP * T * 2)));
    };
    let drawLogo: (c: CanvasRenderingContext2D, x: number, y: number, size: number) => void = (c, x, y, sz) => drawNexusMark(c, x, y, sz, TH.mark);
    const buildLogo = () => {
      const lc = document.createElement("canvas");
      lc.width = lc.height = TEX;
      drawLogo(lc.getContext("2d")!, (TEX - MARK) / 2, (TEX - MARK) / 2, MARK);
      castInk(lc);
      put(0, lc);
      put(2, softOf(lc, MARK * 0.04));
      gl.uniform2f(u.u_lHalf, lHalf, lHalf);
    };
    const buildLockup = () => {
      const fontPx = Math.round(KM * 1.3);
      const font = `600 ${fontPx}px ${FONT_FAMILY}`;
      const meas = document.createElement("canvas").getContext("2d")!;
      meas.font = font;
      (meas as unknown as { letterSpacing: string }).letterSpacing = `${-0.02 * fontPx}px`;
      const tw = Math.ceil(meas.measureText(name).width);
      const gap = Math.round(KM * 0.42);
      const pad = Math.round(KM * 0.3);
      const kc = document.createElement("canvas");
      kc.width = pad * 2 + KM + gap + tw;
      kc.height = pad * 2 + KM;
      const k = kc.getContext("2d")!;
      drawLogo(k, pad, pad, KM);
      castInk(kc);
      k.font = font;
      (k as unknown as { letterSpacing: string }).letterSpacing = `${-0.02 * fontPx}px`;
      k.fillStyle = TH.ink;
      k.textBaseline = "alphabetic";
      // centre the capitals on the logo
      const capH = fontPx * 0.727;
      k.fillText(name, pad + KM + gap, kc.height / 2 + capH / 2);
      put(1, kc);
      put(3, softOf(kc, KM * 0.04));
      const unit = (MARK_HALF * LOGO_IN_LOCKUP * 2) / KM; // icon units per lockup pixel
      gl.uniform2f(u.u_kHalf, (kc.width / 2) * unit, (kc.height / 2) * unit);
      lockHX = ((kc.width - pad * 2) / 2) * unit;
      // the drop centres its zoom on the round letter nearest the middle of the
      // name, so it magnifies a bowl into a dark disc instead of whatever falls there
      const bowls = "oOeadbpqgQDB0689", rounds = "cCsSuUGRP";
      const mid = tw / 2;
      let pick = -1;
      let best = Infinity;
      for (let i = 0; i < name.length; i++) {
        const ch = name[i];
        const score = bowls.includes(ch) ? 0 : rounds.includes(ch) ? 1 : -1;
        if (score < 0) continue;
        const x0 = meas.measureText(name.slice(0, i)).width;
        const cx = x0 + meas.measureText(ch).width / 2;
        const d = Math.abs(cx - mid) + score * tw * 0.25;
        if (d < best) {
          best = d;
          pick = i;
        }
      }
      if (pick >= 0) {
        const ch = name[pick];
        const cx = pad + KM + gap + meas.measureText(name.slice(0, pick)).width + meas.measureText(ch).width / 2;
        const lower = ch === ch.toLowerCase() && !/[0-9]/.test(ch);
        const baseY = kc.height / 2 + capH / 2;
        const cy = baseY - (lower ? fontPx * 0.27 : capH / 2);
        ballFocus = [(cx - kc.width / 2) * unit, (kc.height / 2 - cy) * unit];
      } else ballFocus = [0, 0];
    };
    const buildAll = () => {
      buildLogo();
      buildLockup();
      gl.uniform1i(u.u_logo, 0);
      gl.uniform1i(u.u_lock, 1);
      gl.uniform1i(u.u_lblur, 2);
      gl.uniform1i(u.u_kblur, 3);
    };
    sizeFor(Math.min((cv.clientWidth || 800) * 0.11, (cv.clientHeight || 460) * 0.18) * Math.min(2, window.devicePixelRatio || 1));
    buildAll();
    let alive = true;
    document.fonts?.load?.(`600 32px ${FONT_FAMILY}`).then(() => alive && buildLockup(), () => {});
    if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        if (!alive) return;
        drawLogo = (c, x, y, s) => {
          const w = img.naturalWidth || 512;
          const h = img.naturalHeight || 512;
          const r = Math.min(s / w, s / h);
          c.drawImage(img, x + (s - w * r) / 2, y + (s - h * r) / 2, w * r, h * r);
        };
        buildAll();
        st.current.start = performance.now();
      };
      img.src = src;
    }

    const lost = (e: Event) => {
      e.preventDefault();
      setFailed(true);
    };
    cv.addEventListener("webglcontextlost", lost);
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
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const S = st.current;
      const W = cv.width;
      const Hh = cv.height;
      gl.viewport(0, 0, W, Hh);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (S.start < 0) return;
      let t = (now - S.start) / 1000;
      let fade = 1;
      if (S.reduce) t = 99;
      else if (S.loop) {
        const hold = LENGTH[S.ending] + 3.2;
        fade = 1 - smooth(hold, hold + 0.4, t);
        if (t > hold + 0.55) {
          S.start = now;
          t = 0;
          fade = 1;
        }
      }
      const f = frame(t, S.ending, lockHX, ballFocus);
      S.light[0] += (S.want[0] - S.light[0]) * 0.08;
      S.light[1] += (S.want[1] - S.light[1]) * 0.08;
      // the glass tile is a third of the stage's height
      const T = Math.min(W * 0.11, Hh * 0.18);
      if (Math.abs(T - builtT) > 1) {
        sizeFor(T);
        buildAll();
      }
      gl.uniform2f(u.u_res, W, Hh);
      gl.uniform1f(u.u_T, T);
      gl.uniform2f(u.u_half, f.hx, f.hy);
      for (const k of FRAME_KEYS) gl.uniform1f(u[`u_${k}`], f[k]);
      gl.uniform1f(u.u_time, t);
      gl.uniform2f(u.u_focus, f.fx, f.fy);
      gl.uniform1f(u.u_puff, TH.puff);
      gl.uniform1f(u.u_fade, fade);
      gl.uniform2f(u.u_light, S.light[0], S.light[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      cv.removeEventListener("webglcontextlost", lost);
      textures.forEach((t) => gl.deleteTexture(t));
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      shaders.forEach((s) => gl.deleteShader(s));
    };
  }, [src, theme, name, tint]);

  const takeFile = (file?: File | null) => {
    if (!file || !/^image\/(svg\+xml|png|jpeg|webp)$/.test(file.type)) return;
    setDropped(URL.createObjectURL(file));
  };
  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    takeFile(e.dataTransfer.files?.[0]);
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const b = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - b.left) / b.width) * 2 - 1;
    const y = 1 - ((e.clientY - b.top) / b.height) * 2;
    st.current.want = [-0.55 + x * 0.9, 0.8 + y * 0.6];
  };

  const TH = THEMES[theme];
  const lightUI = !TH.dark;
  const pill = lightUI ? "bg-black/[.05] shadow-[inset_0_0_0_1px_rgba(0,0,0,.08)]" : "bg-white/[.07] shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]";
  const on = lightUI ? "bg-white text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,.12)]" : "bg-white/[.16] text-white";
  const off = lightUI ? "bg-transparent text-[#1d1d1f]/60 hover:text-[#1d1d1f]" : "bg-transparent text-white/60 hover:text-white";

  return (
    <div className={`flex w-full max-w-[1000px] flex-col gap-3 ${className}`}>
      <div
        ref={stage}
        onPointerMove={onMove}
        onPointerLeave={() => (st.current.want = [-0.55, 0.8])}
        onClick={play}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className="relative w-full cursor-pointer overflow-hidden rounded-[24px] shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] transition-[background] duration-500"
        style={{ height, background: TH.bg }}
        role="img"
        aria-label={`The ${name} logo forming out of liquid glass. Click to replay.`}
      >
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
        {failed && (
          <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt="" className="max-h-[96px] max-w-[96px]" />
            ) : (
              <svg width="96" height="96" viewBox="0 0 100 100">
                {[
                  [50, 12],
                  [14, 74],
                  [86, 74],
                ].map(([x, y]) => (
                  <g key={`${x}${y}`}>
                    <line x1="50" y1="53" x2={x} y2={y} stroke={TH.mark.body} strokeWidth="6.5" strokeLinecap="round" />
                    <circle cx={x} cy={y} r="7" fill={TH.mark.body} />
                  </g>
                ))}
                <circle cx="50" cy="53" r="11.5" fill={TH.mark.core} />
                <circle cx="46.4" cy="49.4" r="3.3" fill={TH.mark.glint} />
              </svg>
            )}
          </div>
        )}
        {dragOver && (
          <div className={`pointer-events-none absolute inset-3 flex items-center justify-center rounded-[18px] border-2 border-dashed text-[14px] font-medium ${lightUI ? "border-black/25 text-[#1d1d1f]" : "border-white/35 text-white"}`}>
            Drop an SVG or PNG to use it as the logo
          </div>
        )}
        {controls && (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
            <div className={`flex rounded-full p-1 text-[12.5px] font-medium ${pill}`} role="radiogroup" aria-label="Ending">
              {(
                [
                  ["logo", "Logo"],
                  ["logo-text", "Logo and name"],
                ] as [GlassDropEnding, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="radio"
                  aria-checked={ending === k}
                  onClick={() => {
                    setEnding(k);
                    st.current.ending = k;
                    play();
                  }}
                  className={`h-7 rounded-full border-0 px-3 outline-none transition-colors [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${ending === k ? on : off}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className={`flex rounded-full p-1 text-[12.5px] font-medium ${pill}`} role="radiogroup" aria-label="Theme">
                {(Object.keys(THEMES) as GlassDropTheme[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={theme === k}
                    onClick={() => {
                      setTheme(k);
                      play();
                    }}
                    className={`h-7 rounded-full border-0 px-3 outline-none transition-colors [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${theme === k ? on : off}`}
                  >
                    {THEMES[k].label}
                  </button>
                ))}
              </div>
              <input ref={fileInput} type="file" accept="image/svg+xml,image/png,image/jpeg,image/webp" className="sr-only" tabIndex={-1} onChange={(e: ChangeEvent<HTMLInputElement>) => takeFile(e.target.files?.[0])} />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className={`h-9 rounded-full border-0 px-4 text-[12.5px] font-medium outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${pill} ${lightUI ? "text-[#1d1d1f]" : "text-white"}`}
              >
                {dropped ? "Change logo" : "Use your logo"}
              </button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={play}
                className={`h-9 rounded-full border-0 px-4 text-[12.5px] font-medium outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#8f8cff] ${lightUI ? "bg-[#1d1d1f] text-white" : "bg-white text-black"}`}
              >
                Replay
              </motion.button>
            </div>
          </div>
        )}
      </div>
      <p className="m-0 px-1 text-[12.5px] text-[#86868b]">Plays when it comes into view. Click to replay, drop in any SVG or PNG, move over it to move the light.</p>
    </div>
  );
}

export default GlassDrop;
```

--- components/glass-drop/index.ts ---

```ts
import type { ComponentProps } from "react";
import { GlassDrop } from "./glass-drop";

export { GlassDrop };
export type GlassDropProps = ComponentProps<typeof GlassDrop>;
export type { GlassDropEnding, GlassDropTheme } from "./glass-drop";
```
