/**
 * The two shaders behind every Last Light scene, kept apart from the page so the engine in scene.ts reads clearly.
 *
 * The fragment shader is shared by all three scenes. Each scene is compiled with its own #define SCENE so only its own
 * life is included: fireflies and birds over the meadow, embers and vultures behind the Deacon, heat haze and dust
 * behind the riders. Everything is drawn per pixel from one small picture plus a glyph atlas, so no part of the
 * scene is a stack of text nodes.
 */
import type { SceneConfig } from "./data";

export const VERTEX_SHADER = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

/** The glyph indexes the shader needs by name: a dot, and a star for the brightest spark. */
export type GlyphIndex = { dot: number; star: number };

export function fragmentShader(cfg: SceneConfig, glyph: GlyphIndex): string {
  return `#version 300 es
#define SCENE ${cfg.id}
#define LETTERS ${cfg.letters}
precision highp float;
uniform sampler2D uSrc, uAtlas, uLut, uCov;
uniform vec2 uRes, uCell;
uniform vec4 uMap;
uniform float uT, uIntro, uMotion, uN, uAspect, uLensR, uDiag;
uniform vec3 uPtr;
uniform vec2 uOrigin, uSun;
uniform float uSunR, uTileMax, uDpr, uInvT;
out vec4 o;
const float GDOT = ${glyph.dot}.0, GSTAR = ${glyph.star}.0;
const vec3 TILE = vec3(${cfg.tile.map((v) => v.toFixed(3)).join(", ")});
float hash(vec2 p){ vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y); }
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
vec3 srgb(vec3 c){ return pow(max(c, 0.0), vec3(1.0 / 2.2)); }
// the cell of this grid that a point of the picture falls in
vec2 cellOf(vec2 p){ return floor((p - uMap.xy) / uMap.zw / uCell); }
float seg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }

// One bird as a silhouette in screen pixels: a small body and two jointed wings. lift raises both wings (negative
// lowers them), roll tips them for a banking turn, flex folds them in on the upstroke, dir is the way the head points.
float birdShape(vec2 q, float span, float lift, float roll, float flex, float dir, float px){
  if (abs(q.x) > span * 1.2 + 2.0 * px || abs(q.y) > span * 1.1 + 2.0 * px) return 1e5;
  float d = seg(q, vec2(-0.24 * span * dir, 0.05 * span), vec2(0.26 * span * dir, -0.02 * span)) - max(0.085 * span, 0.9 * px);
  for (int s = 0; s < 2; s++) {
    float sx = s == 0 ? -1.0 : 1.0;
    float l = lift + roll * sx;
    vec2 sh = vec2(0.06 * span * sx, -0.02 * span);
    vec2 el = vec2(0.46 * span * sx * (1.0 - 0.08 * flex), -l * 0.42 * span - 0.06 * span);
    vec2 tp = vec2(0.98 * span * sx * (1.0 - 0.3 * flex), -l * 0.92 * span + 0.08 * span + 0.14 * span * flex);
    d = min(d, seg(q, sh, el) - max(0.13 * span, 0.9 * px));
    d = min(d, seg(q, mix(sh, el, 0.55), el) - max(0.11 * span, 0.8 * px));
    d = min(d, seg(q, el, tp) - max(0.045 * span, 0.6 * px));
  }
  return d;
}
// how much of this pixel a bird covers; span is half the wingspan in pixels
float birdIn(vec2 p, vec2 bp, float span, vec3 w, float roll, float dir){
  float d = birdShape(p - (bp - uMap.xy) / uMap.zw, span, w.x, roll, w.z, dir, uDpr);
  return clamp(0.5 - d / uDpr, 0.0, 1.0);
}
// A wing beat: a strong downstroke and a quicker, folded recovery, broken by glides with the wings held a little up.
// Returns the lift, how far the body has risen, and how folded the wings are.
vec3 wings(float fi, float hz){
  float ph = uT * 6.2832 * hz * (0.9 + 0.2 * hash(vec2(fi, 9.0))) + 6.2832 * hash(vec2(fi, 4.0));
  float w = ph - 0.45 * sin(ph);
  float flapL = 0.66 * cos(w) + 0.06;
  float cyc = fract(uT / (3.4 + 2.4 * hash(vec2(fi, 2.0))) + hash(vec2(fi, 6.0)));
  float glide = smoothstep(0.5, 0.62, cyc) * (1.0 - smoothstep(0.9, 0.99, cyc));
  float flex = (1.0 - glide) * smoothstep(0.0, 0.7, -sin(w));
  return vec3(mix(flapL, 0.18, glide), (1.0 - glide) * 0.07 * sin(w), flex);
}
// a soaring bird turning on a circle, banking into the turn, with a few beats now and then
float soarer(vec2 p, vec2 c, vec2 r, float a, float span, float fi){
  float beats = smoothstep(0.84, 0.88, fract(uT / 11.0 + 0.31 * fi)) * (1.0 - smoothstep(0.97, 1.0, fract(uT / 11.0 + 0.31 * fi)));
  vec3 w = mix(vec3(0.12 + 0.05 * sin(uT * 0.9 + fi), 0.0, 0.0), wings(fi, 2.0), beats);
  return birdIn(p, c + r * vec2(cos(a), sin(a)), span, w, 0.2 * cos(a), sin(a) > 0.0 ? -1.0 : 1.0);
}

#if SCENE == 0
// all the birds: 0 where there are none, up to 1 on a silhouette; .y says how far off (for haze)
vec2 birds(vec2 p){
  float b = 0.0, far = 0.0;
  float dw = 1.0 / uMap.z;
  // A small group heading home every half minute or so, alternating direction, through the bright band of sky:
  // past the glow on the right-hand ridge, in front of the peak, and across the sun.
  float T = uT / 32.0 + 0.3;
  float cyc = floor(T), ph = fract(T);
  float dir = mod(cyc, 2.0) < 0.5 ? -1.0 : 1.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float v = 0.92 + 0.16 * hash(vec2(fi, cyc + 1.0));
    float s = -0.2 + 1.45 * ph * v - 0.05 * fi - 0.04 * hash(vec2(fi, cyc + 2.0));
    float x = dir > 0.0 ? s : 1.0 - s;
    float y = 0.2 + 0.03 * sin(x * 3.0 + cyc) + (hash(vec2(fi, cyc + 3.0)) - 0.5) * 0.06 + 0.014 * sin(x * 6.0 + cyc * 2.3 + fi * 0.8) + 0.005 * sin(uT * 0.45 + fi * 2.0);
    float span = max(dw * (0.012 + 0.005 * hash(vec2(fi, cyc + 4.0))), 7.0 * uDpr);
    vec3 w = wings(fi + cyc * 7.0, 2.6);
    b = max(b, birdIn(p, vec2(x, y - w.y * span * uMap.w), span, w, 0.0, dir));
  }
  // two far off, slow and small, along the line of the lit ridges
  for (int i = 0; i < 2; i++) {
    float fi = float(i) + 20.0;
    float x = fract(uT / 90.0 + 0.47 * float(i) + 0.2) * 1.3 - 0.15;
    float y = 0.31 + 0.025 * float(i) + 0.005 * sin(uT * 0.3 + fi);
    float span = max(dw * 0.006, 4.5 * uDpr);
    vec3 w = wings(fi, 3.2);
    float c = birdIn(p, vec2(x, y - w.y * span * uMap.w), span, w, 0.0, 1.0);
    if (c > b) { b = c; far = 1.0; }
  }
  // a hawk on a slow, wandering circle over the sunlit face of the peak
  float c = soarer(p, vec2(0.69 + 0.02 * sin(uT * 0.031), 0.2), vec2(0.065, 0.028), uT * 0.13, max(dw * 0.019, 10.0 * uDpr), 30.0);
  if (c > b) { b = c; far = 0.0; }
  return vec2(b, far);
}
#endif
#if SCENE == 1
// three vultures wheeling over the right-hand ridge
vec2 birds(vec2 p){
  float b = 0.0, dw = 1.0 / uMap.z;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(0.8 + 0.015 * sin(uT * 0.05 + fi), 0.36 + 0.05 * fi);
    float span = max(dw * 0.02 * (0.8 + 0.4 * hash(vec2(fi, 3.0))), 8.0 * uDpr);
    b = max(b, soarer(p, c, vec2(0.06 + 0.012 * fi, 0.026), uT * (0.17 - 0.02 * fi) + fi * 2.1, span, fi + 40.0));
  }
  return vec2(b, 0.0);
}
#endif

#if SCENE == 0
// Fireflies over the meadow, drifting and blinking. Returns how lit this cell is, and the warm haze around them.
vec2 sparks(vec2 cell, vec2 uv0, vec2 puv){
  vec2 B = vec2(0.05, 0.07);
  vec2 bin = floor(uv0 / B);
  float here = 0.0, glow = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 b = bin + vec2(float(i), float(j));
    if (b.y * B.y < 0.5 || b.y * B.y > 0.98 || hash(b + 7.7) > 0.42) continue;
    vec2 w = vec2(sin(uT * (0.13 + 0.2 * hash(b + 1.3)) + 6.28 * hash(b + 2.1)), sin(uT * (0.11 + 0.18 * hash(b + 3.7)) + 6.28 * hash(b + 4.9)));
    vec2 p = (b + 0.5 + 0.36 * w) * B;
    float pulse = pow(max(0.0, sin(uT * (0.5 + 0.7 * hash(b + 5.3)) + 6.28 * hash(b + 6.1))), 4.0);
    // near the light they drift towards it and glow brighter
    vec2 to = puv - p;
    float pull = uPtr.z * exp(-dot(to * vec2(uAspect, 1.0), to * vec2(uAspect, 1.0)) / 0.03);
    vec2 mv = to * 0.6 * pull;
    p += mv * min(1.0, 0.9 * B.x / max(length(mv), 1e-5));
    pulse = max(pulse, pull * (0.55 + 0.45 * sin(uT * 3.0 + 6.28 * hash(b + 8.3))));
    vec2 d = (cell + 0.5) * uCell - (p - uMap.xy) / uMap.zw;
    glow += pulse * exp(-dot(d, d) / (uCell.x * uCell.x * 2.5));
    if (cellOf(p) == cell) here = max(here, pulse);
  }
  return vec2(here, glow);
}
const vec3 SPARK = vec3(1.0, 0.7, 0.3);
#endif
#if SCENE == 1
// Embers lifting off the sunlit ground behind the riders, drifting up and away on the wind.
vec2 sparks(vec2 cell, vec2 uv0, vec2 puv){
  vec2 B = vec2(0.045, 0.12);
  vec2 bin = floor(uv0 / B);
  float here = 0.0, glow = 0.0;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 b = bin + vec2(float(i), float(j));
    if (b.y * B.y < 0.42 || b.y * B.y > 0.92 || hash(b + 7.7) > 0.5) continue;
    float life = fract(uT * (0.1 + 0.08 * hash(b + 1.3)) + hash(b + 2.1));
    vec2 p = vec2((b.x + 0.5 + 0.3 * sin(uT * (0.4 + 0.5 * hash(b + 3.7)) + 6.28 * hash(b + 4.9)) + 0.3 * life) * B.x, (b.y + 1.0 - life) * B.y);
    float pulse = pow(sin(3.1416 * life), 2.0) * (0.65 + 0.35 * sin(uT * 7.0 + 6.28 * hash(b + 5.3)));
    vec2 d = (cell + 0.5) * uCell - (p - uMap.xy) / uMap.zw;
    glow += pulse * exp(-dot(d, d) / (uCell.x * uCell.x * 2.5));
    if (cellOf(p) == cell) here = max(here, pulse);
  }
  return vec2(here, glow);
}
const vec3 SPARK = vec3(1.0, 0.62, 0.2);
#endif

void main(){
  vec2 fc = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(fc / uCell);
  vec2 local = fc - cell * uCell;
  vec2 cc = (cell + 0.5) * uCell;
  float h1 = hash(cell), h2 = hash(cell + 17.31);

  // the reveal: characters spill out from the sun and settle into the picture
  float age = uIntro - (length(cc - uOrigin) / uDiag * 1.25 + h1 * 0.22);
  if (age < 0.0) { o = vec4(srgb(vec3(0.0035, 0.0006, 0.003)), 1.0); return; }

  // the pointer carries a warm light, like a lantern held over the scene
  vec2 dp = cc - uPtr.xy;
  float lamp = uPtr.z * exp(-dot(dp, dp) / (uLensR * uLensR));
  lamp *= 1.0 + 0.08 * (noise(vec2(uT * 6.0, 1.3)) - 0.5) + 0.03 * sin(uT * 21.0);
  vec2 uv = uMap.xy + cc * uMap.zw;
  vec2 uv0 = uv;
  // grass along the bottom sways, in gusts
  float gust = 0.55 + 0.45 * sin(uT * 0.37 + uv.x * 2.0);
  float grassY = SCENE == 0 ? 0.84 : SCENE == 1 ? 0.9 : 0.86;
  uv.x += uMotion * smoothstep(grassY, 1.0, uv.y) * 0.0055 * gust * sin(uT * 1.4 + uv.x * 60.0 + sin(uv.x * 9.0) * 2.0);
#if SCENE == 2
  // heat rising off the desert floor bends the light low behind the riders
  float haze = smoothstep(0.5, 0.62, uv.y) * (1.0 - smoothstep(0.8, 0.9, uv.y));
  uv.x += uMotion * haze * 0.0018 * sin(uv.y * 260.0 + uT * 5.0) * (0.5 + noise(vec2(uv.x * 8.0, uT * 0.7)));
#endif

  // the colour under this cell, and its four neighbours one cell away
  vec2 du = uCell * uMap.zw;
  vec3 S = lin(texture(uSrc, uv).rgb);
  vec3 n0 = lin(texture(uSrc, uv - vec2(du.x, 0.0)).rgb), n1 = lin(texture(uSrc, uv + vec2(du.x, 0.0)).rgb);
  vec3 n2 = lin(texture(uSrc, uv - vec2(0.0, du.y)).rgb), n3 = lin(texture(uSrc, uv + vec2(0.0, du.y)).rgb);
  // edges snap to one side or the other, so silhouettes stay one character sharp, as in the picture
  {
    vec4 nl = pow(vec4(max(max(n0.r, n0.g), n0.b), max(max(n1.r, n1.g), n1.b), max(max(n2.r, n2.g), n2.b), max(max(n3.r, n3.g), n3.b)), vec4(1.0 / 2.2));
    float v = pow(max(max(S.r, S.g), S.b), 1.0 / 2.2);
    float lo = min(min(nl.x, nl.y), min(nl.z, nl.w)), hi = max(max(nl.x, nl.y), max(nl.z, nl.w));
    float lap = (nl.x + nl.y + nl.z + nl.w) - 4.0 * v;
    float e = hi - lo;
    float k = smoothstep(0.05, 0.16, e) * clamp(abs(lap) / max(e, 1e-3), 0.0, 1.0);
    vec3 dark = nl.x == lo ? n0 : nl.y == lo ? n1 : nl.z == lo ? n2 : n3;
    vec3 lite = nl.x == hi ? n0 : nl.y == hi ? n1 : nl.z == hi ? n2 : n3;
    S = mix(S, lap > 0.0 ? dark : lite, k * 0.75);
  }

  vec3 Sraw = S;
  // the life in it: light drifting through the clouds, the sun's heat and its slow breath
  float pb0 = pow(max(max(S.r, S.g), S.b), 1.0 / 2.2);
#if SCENE == 0
  float skyM = (1.0 - smoothstep(0.16, 0.36, uv.y)) * smoothstep(0.11, 0.19, S.g / max(S.r, 1e-4));
#elif SCENE == 1
  float skyM = smoothstep(0.3, 0.5, pb0) * (1.0 - smoothstep(0.62, 0.8, uv.y));
#else
  float skyM = smoothstep(0.3, 0.5, pb0) * (1.0 - smoothstep(0.45, 0.6, uv.y));
#endif
  float cl = noise(vec2(uv.x * 4.0 - uT * 0.022, uv.y * 24.0)) * 0.6 + noise(vec2(uv.x * 9.0 - uT * 0.04, uv.y * 40.0 + 7.0)) * 0.4;
  S *= 1.0 + uMotion * skyM * (cl - 0.5) * 0.42;
  float sd = length((uv - uSun) * vec2(uAspect, 1.0)) / uSunR;
  float sun = 1.0 - smoothstep(0.82, 1.04, sd);
  S *= 1.0 + uMotion * sun * 0.07 * sin(uT * 1.7 + uv.y * 140.0);
  S *= 1.0 + uMotion * (1.0 - sun) * exp(-max(sd - 1.0, 0.0) * 1.5) * 0.12 * (0.5 + 0.5 * sin(uT * 0.7));
#if SCENE == 0
  // mist drifting through the valley, and below the picture (tall screens) the grass dissolves into the night
  float lum = dot(S, vec3(0.2126, 0.7152, 0.0722));
  float mist = smoothstep(0.4, 0.52, uv.y) * (1.0 - smoothstep(0.8, 0.92, uv.y)) * smoothstep(0.004, 0.03, lum);
  float mn = noise(vec2(uv.x * 4.0 - uT * 0.035, uv.y * 13.0)) * 0.65 + noise(vec2(uv.x * 10.0 - uT * 0.06, uv.y * 26.0 + 4.0)) * 0.35;
  S *= 1.0 + uMotion * mist * (mn - 0.5) * 0.5;
  float below = smoothstep(0.95, 1.09, uv.y + (noise(vec2(uv.x * 30.0, 3.0)) - 0.5) * 0.05);
  S = mix(S, vec3(0.0035, 0.0006, 0.003), below);
#endif
#if SCENE == 1
  // the Deacon's eyes smoulder
  vec2 e1 = (uv - vec2(0.552, 0.239)) * vec2(uAspect, 1.0), e2 = (uv - vec2(0.62, 0.246)) * vec2(uAspect, 1.0);
  float eye = exp(-dot(e1, e1) / 0.0011) + exp(-dot(e2, e2) / 0.0011);
  S *= 1.0 + uMotion * eye * 1.1 * (0.55 + 0.45 * sin(uT * 0.9)) * (0.75 + 0.25 * noise(vec2(uT * 3.0, 2.0)));
#endif
#if SCENE == 2
  // dust drifting low across the desert floor
  float dust = smoothstep(0.82, 0.9, uv.y);
  float dn = noise(vec2(uv.x * 6.0 + uT * 0.22, uv.y * 20.0)) * noise(vec2(uv.x * 15.0 + uT * 0.4, uv.y * 30.0 + 3.0));
  S += vec3(1.0, 0.42, 0.1) * 0.06 * uMotion * dust * dn * dn;
#endif
  // the lantern warms what it falls on, towards its own amber, and lifts it a little
  S = mix(S, S * vec3(1.55, 1.2, 0.62), lamp) * (1.0 + 0.35 * lamp) + vec3(1.0, 0.55, 0.2) * 0.025 * lamp * lamp;
#if SCENE < 2
  vec2 ff = uv0.y > 0.4 ? sparks(cell, uv0, uMap.xy + uPtr.xy * uMap.zw) : vec2(0.0);
  S += SPARK * 0.018 * ff.y;
#endif

  // Halftone in characters, read from the picture. A cell's light sets how bright its mark may be, and the mark
  // grows until the cell carries that light. In stronger light the cell turns over: a lit tile with a dark character
  // cut into it, the way the pictures show their skies and suns.
  float m = max(max(S.r, S.g), S.b);
  vec3 hue = S / max(m, 1e-5);
  float pb = pow(m, 1.0 / 2.2);
  float P = pow(1.0 - pow(1.0 - clamp(pb, 0.0, 1.0), 3.4), 2.2);
  float need = m / max(P, 1e-5);
#if LETTERS
  bool inv = need > uInvT + (h1 - 0.5) * 0.04;
  // dark letters on the light, a little smaller as the light grows
  float target = inv ? clamp(0.14 + (1.0 - need) * 0.22, 0.14, 0.3) : need;
#else
  bool inv = need > uInvT + (h1 - 0.5) * 0.12;
#endif
#if LETTERS
#else
  // on a tile the dark mark shrinks as the light grows
  float target = inv ? clamp((1.0 - need) * 0.2, 0.04, 0.14) : need;
#endif
  target = clamp(target + (h2 - 0.5) * 0.03, 0.0, 1.0);

  // every few seconds a character swaps for its neighbour in weight, faster in the sun
  float slow = floor(uT * (0.14 + 0.16 * h2) + h1 * 9.0);
  float pick = hash(cell + slow * 13.17);
  float fast = sun * 0.8;
  if (uMotion > 0.0 && fast > 0.0) pick = mix(pick, hash(cell + floor(uT * (5.0 + 9.0 * fast)) * 7.7), step(0.35, fast));
  vec4 L = texture(uLut, vec2((target * 255.0 + 0.5) / 256.0, 0.5));
  bool alt = uMotion > 0.0 && pick > 0.6;
  float gi = floor((alt ? L.g : L.r) * 255.0 + 0.5);
  float cov = alt ? L.a : L.b;
#if !LETTERS
  if (inv) {
    // a dot, a dash or a tilde
    gi = target < 0.078 ? 1.0 : target < 0.12 ? 2.0 : 3.0;
    if (alt) gi = gi == 1.0 ? 2.0 : gi - 1.0;
    cov = texelFetch(uCov, ivec2(int(gi), 0), 0).r;
  }
#endif

  // while it settles, the characters cycle
  float settle = smoothstep(0.0, 0.45, age);
  if (uMotion > 0.0 && age < 0.45) {
    gi = floor(hash(cell + floor((uIntro + uT) * 22.0) * 3.3) * (uN - 1.0)) + 1.0;
#if !LETTERS
    if (inv) gi = floor(hash(cell + floor((uIntro + uT) * 22.0) * 3.3) * 3.0) + 1.0;
#endif
    cov = texelFetch(uCov, ivec2(int(gi), 0), 0).r;
  }

  float ink = texelFetch(uAtlas, ivec2(int(gi) * int(uCell.x) + int(local.x), int(local.y)), 0).r;
  float a, c;
  if (!inv) {
    a = ink;
    c = clamp(cov, 0.01, 0.95);
  } else {
#if LETTERS
    float sc = 1.0;
#else
    // the tile is sized to carry the light the mark cuts away
    float sc = max(sqrt(clamp((need + cov) / uTileMax, 0.0, 1.0)), 0.45);
#endif
    vec2 hs = 0.5 * sc * TILE.xy * uCell;
    float r = min(hs.x, hs.y) * TILE.z;
    vec2 q = abs(local - 0.5 * uCell) - hs + r;
    float sdt = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    a = clamp(0.5 - sdt, 0.0, 1.0) * (1.0 - ink);
    c = clamp(sc * sc * uTileMax - cov, 0.02, 0.95);
  }
  // the lit part takes the cell's colour at full strength; the rest carries whatever light is left, never quite black
  vec3 lit = hue * min(P, m / c);
  vec3 rest = max(max(S - lit * c, 0.0) / (1.0 - c), S * (inv ? 0.06 : 0.04));
  vec3 col = mix(rest, lit, a);
#if LETTERS
  // The ground is drawn per pixel, so silhouettes keep their true edges and cut through the characters, as in the
  // picture; the characters themselves stay on the grid. The light and life worked out for the cell carry over.
  {
    vec3 Sp = lin(texture(uSrc, uv + (fc - cc) * uMap.zw).rgb) * clamp(S / max(Sraw, vec3(1e-4)), 0.0, 3.0);
    float mp = max(max(Sp.r, Sp.g), Sp.b);
    vec3 huep = Sp / max(mp, 1e-5);
    float Pp = pow(1.0 - pow(1.0 - clamp(pow(mp, 1.0 / 2.2), 0.0, 1.0), 3.4), 2.2);
    bool invp = mp / max(Pp, 1e-5) > uInvT + (h1 - 0.5) * 0.04;
    float ap = ink, cp = clamp(cov, 0.01, 0.95);
    if (invp) {
      vec2 hs = 0.5 * TILE.xy * uCell;
      float r = min(hs.x, hs.y) * TILE.z;
      vec2 q = abs(local - 0.5 * uCell) - hs + r;
      float sdt = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
      ap = clamp(0.5 - sdt, 0.0, 1.0) * (1.0 - ink);
      cp = clamp(uTileMax - cov, 0.02, 0.95);
    }
    vec3 litp = huep * min(Pp, mp / cp);
    vec3 restp = max(max(Sp - litp * cp, 0.0) / (1.0 - cp), Sp * (invp ? 0.06 : 0.04));
    col = mix(restp, litp, ap);
  }
#endif
#if SCENE < 2
  // a spark: a warm dot, a star at its brightest
  if (ff.x > 0.02) {
    float fi2 = texelFetch(uAtlas, ivec2(int(ff.x > 0.5 ? GSTAR : GDOT) * int(uCell.x) + int(local.x), int(local.y)), 0).r;
    col = mix(col * (1.0 - 0.6 * ff.x), SPARK * (0.3 + 1.1 * ff.x), fi2 * smoothstep(0.02, 0.25, ff.x));
  }
  // birds fly in front of the far sky as true silhouettes, finer than the characters, so their wings read
  if (uv0.y < (SCENE == 0 ? 0.5 : 0.7)) {
    vec2 bd = birds(fc);
    if (bd.x > 0.0) col = mix(col, mix(vec3(0.011, 0.0028, 0.009), S * 0.45, bd.y * 0.5), bd.x);
  }
#endif
  // fresh characters flare as they land
  col *= mix(1.9, 1.0, settle) * smoothstep(0.0, 0.1, age);
  o = vec4(srgb(col), 1.0);
}`;
}
