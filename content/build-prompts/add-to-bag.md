# Add to Bag

Add the "Add to Bag" component from Nexus UI to my project.

The add-to-cart moment, made physical. Press the button and the product lifts off and arcs through the air into the bag, which squashes as it lands while the badge rolls to the new count. The button folds into a quantity stepper, and taking one out hops it back out of the bag. The demo product is a stoneware mug ray-marched live in WebGL that you can drag to turn; give each colourway an image to show your own product photo instead. Point target at your header's bag icon and the product flies there. It handles the motion and the count; adding to a real cart is up to your onChange. Until you touch it, it adds, switches colour and removes by itself.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. Use it like this: `import { AddToBag } from "@/components/add-to-bag";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/add-to-bag/add-to-bag.tsx ---

```tsx
"use client";

import { forwardRef, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent, type RefObject } from "react";
import { AnimatePresence, animate, motion, useAnimationControls, useInView, useMotionValue, useMotionValueEvent, useReducedMotion } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  bag: "<path fill=\"currentColor\" d=\"M14.559 51.953h27.586c4.218 0 6.656-2.437 6.656-7.266V20.43c0-4.828-2.461-7.266-7.36-7.266h-3.726c-.14-4.922-4.406-9.117-9.703-9.117c-5.32 0-9.586 4.195-9.727 9.117H14.56c-4.875 0-7.36 2.414-7.36 7.266v24.258c0 4.851 2.485 7.265 7.36 7.265M28.012 7.61c3.304 0 5.812 2.485 5.93 5.555h-11.86c.094-3.07 2.602-5.555 5.93-5.555M14.629 48.18c-2.344 0-3.656-1.242-3.656-3.679V20.617c0-2.437 1.312-3.68 3.656-3.68h26.766c2.296 0 3.632 1.243 3.632 3.68V44.5c0 2.438-1.336 3.68-2.953 3.68Z\"/>",
  bag_fill: "<path fill=\"currentColor\" d=\"M14.559 51.953h27.586c4.218 0 6.656-2.437 6.656-7.266V20.43c0-4.828-2.461-7.266-7.36-7.266h-3.726c-.14-4.922-4.406-9.117-9.703-9.117c-5.32 0-9.586 4.195-9.727 9.117H14.56c-4.875 0-7.36 2.414-7.36 7.266v24.258c0 4.851 2.485 7.265 7.36 7.265M28.012 7.61c3.304 0 5.812 2.485 5.93 5.555h-11.86c.094-3.07 2.602-5.555 5.93-5.555\"/>",
  plus: "<path fill=\"currentColor\" d=\"M27.988 47.734c1.149 0 2.11-.914 2.11-2.039V30.11h15.14c1.125 0 2.11-.96 2.11-2.109c0-1.148-.985-2.086-2.11-2.086h-15.14v-15.61c0-1.124-.961-2.038-2.11-2.038c-1.148 0-2.086.914-2.086 2.039v15.61h-15.14c-1.125 0-2.11.937-2.11 2.085s.985 2.11 2.11 2.11h15.14v15.585c0 1.125.938 2.04 2.086 2.04\"/>",
  minus: "<path fill=\"currentColor\" d=\"M10.762 30.098h34.476c1.125 0 2.11-.961 2.11-2.11c0-1.148-.985-2.086-2.11-2.086H10.762c-1.125 0-2.11.938-2.11 2.086c0 1.149.985 2.11 2.11 2.11\"/>",
  trash: "<path fill=\"currentColor\" d=\"m44.524 48.66l1.617-34.265h2.343c.961 0 1.735-.797 1.735-1.758s-.774-1.782-1.735-1.782H38.242V7.34c0-3.352-2.273-5.531-5.882-5.531h-8.766c-3.61 0-5.86 2.18-5.86 5.53v3.516H7.54c-.937 0-1.758.82-1.758 1.782c0 .96.82 1.758 1.758 1.758h2.344L11.5 48.684c.164 3.375 2.39 5.507 5.766 5.507h21.492c3.351 0 5.601-2.156 5.765-5.53M21.484 7.574c0-1.336.985-2.273 2.391-2.273h8.227c1.43 0 2.414.937 2.414 2.273v3.281H21.484Zm-3.867 43.102c-1.36 0-2.367-1.032-2.437-2.39l-1.64-33.891h28.85l-1.546 33.89c-.07 1.383-1.055 2.39-2.438 2.39Zm17.344-4.125c.773 0 1.36-.633 1.383-1.524l.703-24.75c.023-.89-.586-1.547-1.383-1.547c-.726 0-1.336.68-1.36 1.524l-.702 24.773c-.024.844.562 1.524 1.359 1.524m-13.898 0c.797 0 1.382-.68 1.359-1.524l-.703-24.773c-.024-.844-.656-1.524-1.383-1.524c-.797 0-1.383.657-1.36 1.547l.727 24.75c.024.891.586 1.524 1.36 1.524m8.367-1.524V20.254c0-.844-.633-1.524-1.407-1.524c-.773 0-1.43.68-1.43 1.524v24.773c0 .844.657 1.524 1.43 1.524c.75 0 1.407-.68 1.407-1.524\"/>",
  checkmark: "<path fill=\"currentColor\" d=\"M23.078 48.027c1.008 0 1.805-.445 2.367-1.312L47.594 11.84c.422-.68.61-1.195.61-1.735c0-1.289-.868-2.132-2.157-2.132c-.914 0-1.453.304-2.016 1.195L22.984 42.707L12.062 28.41c-.585-.82-1.148-1.148-2.015-1.148c-1.313 0-2.25.914-2.25 2.203c0 .539.234 1.148.68 1.71L20.64 46.669c.726.914 1.43 1.36 2.437 1.36\"/>",
  arrow_2_circlepath: "<path fill=\"currentColor\" d=\"M53.949 26.303h-3.087c-1.24-11.47-11.11-20.597-22.873-20.597c-6.851 0-13.07 3.11-17.307 8c-.857.97-.722 2.163.157 2.794c.902.631 1.96.429 2.705-.405a19.12 19.12 0 0 1 14.445-6.558a19.074 19.074 0 0 1 18.997 16.766h-3.358c-1.6 0-2.028 1.082-1.15 2.321l5.026 7.189c.721 1.037 1.803 1.06 2.547 0l5.047-7.166c.902-1.262.474-2.344-1.149-2.344m-51.898 4.8h3.087c1.24 11.47 11.11 20.575 22.85 20.575c6.896 0 13.116-3.133 17.353-8c.811-.97.698-2.186-.158-2.817c-.901-.631-1.96-.406-2.704.428c-3.47 4.034-8.654 6.558-14.49 6.558A19.05 19.05 0 0 1 9.014 31.103h3.358c1.6 0 2.028-1.104 1.15-2.32l-5.049-7.19c-.72-1.036-1.78-1.059-2.524 0L.901 28.76C0 30 .428 31.104 2.051 31.104\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type BagProduct = {
  name: string;
  detail: string;
  price: number;
  /** each colourway; give `image` (a product photo URL) to show it instead of the built-in 3D mug */
  colors: { name: string; hex: string; image?: string }[];
};

const PRODUCT: BagProduct = {
  name: "Pour-Over Mug",
  detail: "Stoneware · 350 ml",
  price: 38,
  colors: [
    { name: "Sage", hex: "#8fae8b" },
    { name: "Clay", hex: "#c98b6b" },
    { name: "Ink", hex: "#3d4250" },
  ],
};

const SPRING = { type: "spring", stiffness: 520, damping: 30 } as const;

/* ------------------------------------------------------------------------
   The product: a speckled stoneware mug, ray-marched in WebGL and lit like a
   studio shot (soft key light, strip-light reflections, contact shadow).
   Drag to turn it; flick and it spins down. Swap in real photos with
   `colors[i].image` and this is skipped.
   ------------------------------------------------------------------------ */

const MUG_VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
const MUG_FS = `
precision highp float;
uniform vec2 u_res;
uniform float u_rot;
uniform vec3 u_glaze;
uniform vec3 u_bg;
const float H = 0.5;
float hash3(vec3 p){ p = fract(p*0.3183099 + vec3(0.71, 0.113, 0.419)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x + p.y + p.z)); }
float vnoise(vec3 p){
  vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0 - 2.0*f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0,0.0,0.0)), f.x), mix(hash3(i + vec3(0.0,1.0,0.0)), hash3(i + vec3(1.0,1.0,0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0,0.0,1.0)), hash3(i + vec3(1.0,0.0,1.0)), f.x), mix(hash3(i + vec3(0.0,1.0,1.0)), hash3(i + vec3(1.0,1.0,1.0)), f.x), f.y), f.z);
}
// a gentle belly, a tapered foot ring and a slightly flared lip
float rOf(float y){
  float t = clamp(y + 0.5, 0.0, 1.0);
  float r = mix(0.386, 0.426, t) + 0.016*sin(3.14159*t);
  r -= 0.026*(1.0 - smoothstep(0.0, 0.085, t));
  r += 0.008*smoothstep(0.93, 1.0, t);
  return r;
}
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5*(b - a)/k, 0.0, 1.0); return mix(b, a, h) - k*h*(1.0 - h); }
float smax(float a, float b, float k){ return -smin(-a, -b, k); }
float rcyl(vec3 p, float r, float cy, float hh, float rr){
  vec2 w = vec2(length(p.xz) - (r - rr), abs(p.y - cy) - (hh - rr));
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - rr;
}
float body(vec3 p){ return rcyl(p, rOf(p.y), 0.0, H, 0.05); }
float cavity(vec3 p){
  float fl = -H + 0.1; float top = H + 0.4;
  return rcyl(p, rOf(p.y) - 0.05, 0.5*(fl + top), 0.5*(top - fl), 0.06);
}
float handle(vec3 p){
  vec3 q = p - vec3(0.56, 0.03, 0.0);
  q.y *= 0.76;
  float thick = 0.04 + 0.015*smoothstep(0.0, 0.17, abs(q.y));
  vec2 t = vec2(length(q.xy) - 0.175, q.z*0.72);
  return max((length(t) - thick)*0.85, 0.40 - p.x);
}
float mug(vec3 p){ return smax(smin(body(p), handle(p), 0.05), -cavity(p), 0.026); }
vec3 toObj(vec3 p){ float c = cos(u_rot), s = sin(u_rot); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
float map(vec3 p){ return mug(toObj(p)); }
vec3 nrm(vec3 p){
  vec2 e = vec2(0.0012, 0.0);
  return normalize(vec3(map(p + e.xyy) - map(p - e.xyy), map(p + e.yxy) - map(p - e.yxy), map(p + e.yyx) - map(p - e.yyx)));
}
float shadow(vec3 ro, vec3 rd){
  float res = 1.0, t = 0.015;
  for (int i = 0; i < 48; i++){
    float h = map(ro + rd*t);
    res = min(res, 9.0*h/t);
    t += clamp(h, 0.01, 0.1);
    if (res < 0.001 || t > 3.0) break;
  }
  return clamp(res, 0.0, 1.0);
}
float occl(vec3 p, vec3 n){
  float o = 0.0, s = 1.0;
  for (int i = 1; i <= 5; i++){ float h = 0.03*float(i); o += (h - map(p + n*h))*s; s *= 0.7; }
  return clamp(1.0 - 2.2*o, 0.0, 1.0);
}
float specks(vec3 q, float scale, float density, float size){
  vec3 g = q*scale; vec3 c = floor(g); vec3 f = fract(g) - 0.5;
  vec3 o = vec3(hash3(c + 1.3), hash3(c + 2.7), hash3(c + 5.1)) - 0.5;
  return step(density, hash3(c)) * smoothstep(size, size*0.4, length(f - o*0.45));
}
vec3 env(vec3 r){
  vec3 c = mix(vec3(0.58, 0.59, 0.63), vec3(1.0), smoothstep(-0.3, 0.8, r.y));
  c += vec3(2.6) * smoothstep(0.78, 0.93, dot(r, normalize(vec3(-0.6, 0.65, 0.5))));
  c += vec3(4.2) * smoothstep(0.13, 0.035, abs(r.x + 0.62)) * smoothstep(-0.2, 0.15, r.y) * smoothstep(0.0, 0.35, r.z);
  c += vec3(1.5) * smoothstep(0.17, 0.05, abs(r.x - 0.82)) * smoothstep(-0.1, 0.25, r.y) * smoothstep(-0.6, 0.0, r.z);
  c += vec3(0.9, 0.8, 0.7) * smoothstep(0.35, 0.0, abs(r.y + 0.12)) * 0.35;
  return mix(c, u_bg*0.85, smoothstep(0.0, -0.25, r.y));
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
  float el = 0.30;
  vec3 ta = vec3(0.0, -0.04, 0.0);
  vec3 ro = ta + vec3(0.0, sin(el), cos(el)) * 4.6;
  vec3 ww = normalize(ta - ro); vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0))); vec3 vv = cross(uu, ww);
  vec3 rd = normalize(uv.x*uu + uv.y*vv + 3.05*ww);
  vec3 L = normalize(vec3(-0.55, 0.85, 0.45));
  vec3 col = u_bg;
  bool hit = false; float t = 0.0;
  float b = dot(ro, rd); float disc = b*b - (dot(ro, ro) - 0.9025);
  if (disc > 0.0){
    t = max(-b - sqrt(disc), 0.0); float tEnd = -b + sqrt(disc);
    for (int i = 0; i < 120; i++){
      float d = map(ro + rd*t);
      if (d < 0.0005){ hit = true; break; }
      t += d*0.85;
      if (t > tEnd) break;
    }
  }
  float tg = rd.y < 0.0 ? (-H - ro.y) / rd.y : 1e9;
  if (hit && t < tg){
    vec3 p = ro + rd*t; vec3 n = nrm(p); vec3 q = toObj(p);
    float inside = 1.0 - smoothstep(0.004, 0.03, cavity(q));
    float outside = 1.0 - inside;
    float side = 1.0 - smoothstep(0.35, 0.75, abs(n.y));
    // hand-thrown ridges, strongest on the raw clay
    float ang = atan(q.z, q.x);
    float glazedEarly = smoothstep(-H + 0.15, -H + 0.2, q.y);
    float wob = vnoise(vec3(q.y*7.0, ang*1.2, 1.7));
    float ridge = sin(q.y*(112.0 + 40.0*wob) + vnoise(vec3(q.y*11.0, ang*2.0, 0.0))*6.0);
    n = normalize(n + vec3(0.0, ridge*0.042*mix(1.0, 1.9, 1.0 - glazedEarly), 0.0)*side*outside);
    // the glaze is dipped: it stops at a wobbly line and runs down in a few drips
    float drip = pow(max(0.0, sin(ang*7.0 + 1.0)), 10.0)*0.03 + pow(max(0.0, sin(ang*4.0 + 3.1)), 14.0)*0.02;
    float line = -H + 0.17 + 0.028*sin(ang*2.0 + 0.7) + 0.016*sin(ang*5.0 + 2.1) + 0.006*sin(ang*13.0) - drip;
    float glazed = smoothstep(line - 0.004, line + 0.007, q.y);
    float pool = (1.0 - smoothstep(0.0, 0.055, q.y - line))*glazed;
    float cloud = vnoise(q*vec3(6.0, 11.0, 6.0))*0.6 + vnoise(q*vec3(15.0, 28.0, 15.0))*0.4;
    vec3 glaze = u_glaze * mix(0.84, 1.06, smoothstep(line, H, q.y)) * (0.92 + 0.16*cloud);
    glaze = mix(glaze, pow(glaze, vec3(1.3))*0.88, pool*0.85);
    // thin glaze breaks to warm clay at the very lip
    float lip = smoothstep(H - 0.03, H - 0.004, q.y);
    glaze = mix(glaze, vec3(0.62, 0.46, 0.34), lip*0.75*outside);
    vec3 clay = vec3(0.70, 0.55, 0.42) * (0.9 + 0.2*vnoise(q*40.0));
    vec3 liner = mix(glaze*1.12 + 0.07, vec3(0.88, 0.84, 0.77), 0.55) * (0.95 + 0.1*cloud);
    vec3 alb = mix(clay, glaze, glazed);
    alb = mix(alb, liner, inside);
    float sp = max(specks(q, 34.0, 0.88, 0.26), specks(q + 3.7, 70.0, 0.9, 0.22)*0.8);
    alb = mix(alb, vec3(0.14, 0.10, 0.075), sp*mix(0.75, 0.55, inside));
    float gloss = mix(0.14, 1.0, max(glazed, inside));
    float dif = max(dot(n, L)*0.92 + 0.08, 0.0);
    float sh = dif > 0.0 ? shadow(p + n*0.004, L) : 0.0;
    float occ = occl(p, n);
    vec3 lin = vec3(1.0, 0.97, 0.93)*dif*sh*1.5 + vec3(0.62, 0.66, 0.74)*(0.5 + 0.5*n.y)*0.55*occ + u_bg*0.25*clamp(0.5 - 0.5*n.y, 0.0, 1.0)*occ;
    lin += vec3(0.95, 0.78, 0.6)*0.12*clamp(0.5 - 0.5*n.y, 0.0, 1.0)*occ;
    vec3 c = alb*lin;
    vec3 v = -rd; vec3 h = normalize(L + v);
    float spec = pow(max(dot(n, h), 0.0), mix(18.0, 170.0, gloss))*dif*sh;
    float fres = 0.04 + 0.96*pow(1.0 - max(dot(n, v), 0.0), 5.0);
    vec3 r = reflect(rd, n);
    c = mix(c, env(r)*occ*mix(1.0, 0.3, inside), fres*gloss) + spec*mix(0.25, 1.6, gloss);
    col = c;
  } else if (rd.y < 0.0){
    vec3 g = ro + rd*tg;
    float sh = shadow(g + vec3(0.0, 0.002, 0.0), L);
    float o = 0.0, s = 1.0;
    for (int i = 1; i <= 5; i++){ float h = 0.05*float(i); o += (h - min(map(g + vec3(0.0, h, 0.0)), h))*s; s *= 0.6; }
    col = u_bg * mix(0.70, 1.0, sh) * mix(0.55, 1.0, clamp(1.0 - 1.6*o, 0.0, 1.0));
  }
  gl_FragColor = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

const lin = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => Math.pow(c / 255, 2.2)) as [number, number, number];
};

export type MugHandle = { snapshot: () => string | null };

const MugRender = forwardRef<MugHandle, { hex: string; bg?: string; onTouch?: () => void }>(function MugRender({ hex, bg = "#f5f5f7", onTouch }, ref) {
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const gl = useRef<{ g: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> } | null>(null);
  const [failed, setFailed] = useState(false);
  const [turned, setTurned] = useState(false);
  const rot = useMotionValue(-0.5);
  const glaze = useRef(lin(hex));
  const frame = useRef(0);

  const draw = () => {
    const c = gl.current;
    const el = canvas.current;
    if (!c || !el) return;
    const { g, u } = c;
    g.viewport(0, 0, el.width, el.height);
    g.uniform2f(u.res, el.width, el.height);
    g.uniform1f(u.rot, rot.get());
    g.uniform3f(u.glaze, ...glaze.current);
    g.uniform3f(u.bg, ...lin(bg));
    g.drawArrays(g.TRIANGLES, 0, 3);
  };
  const request = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      draw();
    });
  };
  useMotionValueEvent(rot, "change", request);

  useImperativeHandle(ref, () => ({
    snapshot: () => {
      if (!canvas.current || !gl.current) return null;
      draw();
      return canvas.current.toDataURL("image/png");
    },
  }));

  // set up once; the context is only dropped on unmount
  useLayoutEffect(() => {
    const el = canvas.current;
    const g = el?.getContext("webgl", { antialias: false, preserveDrawingBuffer: true, alpha: false }) ?? null;
    if (!el || !g) return setFailed(true);
    const sh = (type: number, src: string) => {
      const s = g.createShader(type)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      return s;
    };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, MUG_VS));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, MUG_FS));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) return setFailed(true);
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "a");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const u = Object.fromEntries(["res", "rot", "glaze", "bg"].map((k) => [k, g.getUniformLocation(prog, `u_${k}`)]));
    gl.current = { g, u };
    const fit = () => {
      const k = Math.min(2.5, Math.max(window.devicePixelRatio || 1, 2));
      el.width = Math.max(1, Math.round(el.clientWidth * k));
      el.height = Math.max(1, Math.round(el.clientHeight * k));
      draw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
      gl.current = null;
      // Free the GPU context only once the canvas has really left the page. React can run this cleanup and then
      // set up again on the very same canvas (Strict Mode, a hidden then shown screen), and a context that has
      // been lost cannot be revived, which would leave the product as a blur.
      window.setTimeout(() => {
        if (!el.isConnected) g.getExtension("WEBGL_lose_context")?.loseContext();
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // a new colourway: the glaze blends across while the mug turns once on its base
  const firstHex = useRef(true);
  useEffect(() => {
    if (firstHex.current) {
      firstHex.current = false;
      return;
    }
    const from = glaze.current;
    const to = lin(hex);
    if (reduced) {
      glaze.current = to;
      request();
      return;
    }
    const a = animate(0, 1, {
      duration: 0.55,
      ease: "easeInOut",
      onUpdate: (k) => {
        glaze.current = [0, 1, 2].map((i) => from[i] + (to[i] - from[i]) * k) as [number, number, number];
        request();
      },
    });
    animate(rot, rot.get() + Math.PI * 2, { type: "spring", stiffness: 55, damping: 15 });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hex]);

  // drag to turn, flick to spin
  const drag = useRef<{ id: number; x0: number; r0: number; s: { t: number; x: number }[] } | null>(null);
  const down = (e: RPointerEvent<HTMLCanvasElement>) => {
    onTouch?.();
    if (e.button !== 0) return;
    rot.stop();
    drag.current = { id: e.pointerId, x0: e.clientX, r0: rot.get(), s: [{ t: performance.now(), x: e.clientX }] };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const now = performance.now();
    d.s.push({ t: now, x: e.clientX });
    while (d.s.length > 2 && now - d.s[0].t > 90) d.s.shift();
    rot.set(d.r0 + (e.clientX - d.x0) * 0.012);
    if (!turned && Math.abs(e.clientX - d.x0) > 6) setTurned(true);
  };
  const up = (e: RPointerEvent<HTMLCanvasElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const a = d.s[0];
    const b = d.s[d.s.length - 1];
    const v = b.t > a.t && performance.now() - b.t < 60 ? ((b.x - a.x) / (b.t - a.t)) * 1000 * 0.012 : 0;
    if (Math.abs(v) > 0.05 && !reduced) animate(rot, rot.get(), { type: "inertia", velocity: v, power: 0.55, timeConstant: 520 });
  };

  if (failed) return <div className="h-full w-full" style={{ background: `radial-gradient(60% 55% at 50% 45%, ${hex}, ${bg})` }} aria-hidden="true" />;
  return (
    <>
      <canvas
        ref={canvas}
        role="img"
        aria-label="Product, drag to turn"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        className="absolute inset-0 h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
      />
      <AnimatePresence>
        {!turned && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 text-[11px] font-medium text-[#6e6e73] shadow-[0_0_0_.5px_rgba(0,0,0,.08)] backdrop-blur"
          >
            <Icon name="arrow_2_circlepath" size={12} />
            Drag to turn
          </motion.span>
        )}
      </AnimatePresence>
    </>
  );
});

type Flight = { id: number; dir: 1 | -1; from: { x: number; y: number }; to: { x: number; y: number }; hex: string; img: string | null };

/**
 * Add to Bag: the button every shop needs, with a throw. Press it and the
 * product lifts off and arcs through the air into the bag, which squashes as
 * it lands while the badge rolls to the new count. The button folds into a
 * quantity stepper; take one out and it hops back out of the bag. The demo
 * product is a real-time studio render you can drag to turn; pass photos per
 * colourway (`colors[i].image`) for your own products. Point `target` at your
 * header's bag icon to fly there instead of the built-in one.
 */
export function AddToBag({
  product = PRODUCT,
  max = 9,
  target,
  currency = "$",
  autoplay = false,
  onChange,
  className = "",
}: {
  product?: BagProduct;
  max?: number;
  /** your own bag icon to fly to (defaults to the one in the card) */
  target?: RefObject<HTMLElement>;
  currency?: string;
  /** add and remove by itself until the first interaction */
  autoplay?: boolean;
  onChange?: (quantity: number, color: string) => void;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  const mug = useRef<MugHandle>(null);
  const bagRef = useRef<HTMLButtonElement>(null);
  const inView = useInView(root, { amount: 0.5 });
  const touched = useRef(false);
  const [qty, setQty] = useState(0);
  const [landed, setLanded] = useState(0);
  const [color, setColor] = useState(0);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [said, setSaid] = useState("");
  const bag = useAnimationControls();
  const hop = useAnimationControls();
  const nextId = useRef(1);
  const qtyRef = useRef(0);
  useEffect(() => {
    qtyRef.current = qty;
  }, [qty]);
  const hex = product.colors[color]?.hex ?? "#8fae8b";
  const image = product.colors[color]?.image;

  const centre = (el: Element | null | undefined) => {
    const r = root.current?.getBoundingClientRect();
    const b = el?.getBoundingClientRect();
    if (!r || !b) return { x: 0, y: 0 };
    return { x: b.left + b.width / 2 - r.left, y: b.top + b.height / 2 - r.top };
  };

  const fly = (dir: 1 | -1) => {
    const a = centre(art.current);
    const b = centre(target?.current ?? bagRef.current);
    // what flies is a picture of the product as it looks right now
    const img = image ?? mug.current?.snapshot() ?? null;
    setFlights((f) => [...f, { id: nextId.current++, dir, from: dir === 1 ? a : b, to: dir === 1 ? b : a, hex, img }]);
  };

  const change = (d: 1 | -1) => {
    const n = Math.max(0, Math.min(max, qtyRef.current + d));
    if (n === qtyRef.current) {
      // at the limit: the stepper shrugs
      hop.start({ x: [0, -6, 5, -3, 0], transition: { duration: 0.35 } });
      return;
    }
    qtyRef.current = n;
    setQty(n);
    onChange?.(n, product.colors[color]?.name ?? "");
    if (d < 0) {
      setLanded((l) => Math.max(0, l - 1));
      bag.start({ scaleX: [1, 0.86, 1.08, 1], scaleY: [1, 1.18, 0.94, 1], transition: { duration: 0.45 } });
      setSaid(`Removed one. ${n} in bag.`);
    } else setSaid(`Added to bag. ${n} in bag.`);
    fly(d);
  };

  const land = (f: Flight) => {
    setFlights((fs) => fs.filter((x) => x.id !== f.id));
    if (f.dir === 1) {
      setLanded((l) => l + 1);
      bag.start({ scaleX: [1, 1.24, 0.9, 1.04, 1], scaleY: [1, 0.74, 1.12, 0.97, 1], rotate: [0, -6, 4, 0], transition: { duration: 0.55, ease: "easeOut" } });
    }
  };

  // the demo: add, add another, change colour, take them back out
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const wait = (ms: number) => new Promise((r) => window.setTimeout(r, ms));
    const ok = () => alive && !touched.current;
    (async () => {
      await wait(800);
      while (ok()) {
        change(1);
        await wait(1400);
        if (!ok()) break;
        change(1);
        await wait(1200);
        if (!ok()) break;
        setColor((c) => (c + 1) % product.colors.length);
        await wait(900);
        if (!ok()) break;
        change(1);
        await wait(1500);
        for (let i = 0; i < 3 && ok(); i++) {
          change(-1);
          await wait(800);
        }
        await wait(900);
      }
    })();
    return () => {
      alive = false;
    };
    // the loop reads the latest quantity through qtyRef, so it only restarts when autoplay or visibility change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  const touch = () => (touched.current = true);

  return (
    <div ref={root} onPointerDown={touch} onKeyDown={touch} className={`relative w-full max-w-[380px] ${className}`}>
      <div className="flex flex-col rounded-[28px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]">
        {/* header with the bag */}
        <div className="flex items-center justify-between px-1 pb-3">
          <span className="text-[13px] font-semibold text-[#1d1d1f]">Kitchen</span>
          <motion.button
            ref={bagRef}
            type="button"
            animate={bag}
            aria-label={`Bag, ${landed} ${landed === 1 ? "item" : "items"}`}
            className="relative grid h-10 w-10 place-items-center rounded-full border-0 bg-[#f5f5f7] p-0 text-[#1d1d1f] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            style={{ originY: 1 }}
          >
            <Icon name={landed ? "bag_fill" : "bag"} size={20} />
            <AnimatePresence>
              {landed > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 700, damping: 18 }}
                  className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center overflow-hidden rounded-full bg-[#ff3b30] px-1 text-[11px] font-semibold tabular-nums text-white ring-2 ring-white"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.span key={landed} initial={{ y: 12 }} animate={{ y: 0 }} exit={{ y: -12 }} transition={{ type: "spring", stiffness: 600, damping: 22 }}>
                      {landed}
                    </motion.span>
                  </AnimatePresence>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* the product */}
        <div ref={art} className="relative h-[220px] overflow-hidden rounded-[20px] bg-[#f5f5f7]">
          {image ? (
            <AnimatePresence initial={false}>
              <motion.img
                key={image}
                src={image}
                alt={`${product.name}, ${product.colors[color]?.name ?? ""}`}
                draggable={false}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 h-full w-full object-contain"
              />
            </AnimatePresence>
          ) : (
            <MugRender ref={mug} hex={hex} onTouch={touch} />
          )}
        </div>

        <div className="mt-4 flex items-start justify-between gap-3 px-1">
          <div>
            <h3 className="m-0 text-[17px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{product.name}</h3>
            <p className="m-0 mt-0.5 text-[13px] text-[#6e6e73]">{product.detail}</p>
          </div>
          <span className="text-[17px] font-semibold tabular-nums text-[#1d1d1f]">
            {currency}
            {product.price}
          </span>
        </div>

        {/* colour */}
        <div className="mt-3 flex items-center gap-2 px-1" role="radiogroup" aria-label="Colour">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={color === i}
              aria-label={c.name}
              onClick={() => setColor(i)}
              className="relative grid h-7 w-7 place-items-center rounded-full border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              {color === i && <motion.span layoutId={`swatch-${uid}`} className="absolute inset-0 rounded-full ring-2 ring-[#0071e3]" transition={SPRING} />}
              <span className="h-5 w-5 rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,.12)]" style={{ background: c.hex }} />
            </button>
          ))}
          <span className="ml-1 text-[12.5px] text-[#6e6e73]">{product.colors[color]?.name}</span>
        </div>

        {/* add, or the stepper it folds into */}
        <motion.div animate={hop} className="mt-4 h-12">
          <AnimatePresence initial={false} mode="popLayout">
            {qty === 0 ? (
              <motion.button
                key="add"
                type="button"
                layoutId={`cta-${uid}`}
                onClick={() => change(1)}
                whileTap={{ scale: 0.97 }}
                transition={SPRING}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-0 bg-[#0071e3] text-[15px] font-medium text-white outline-none [font-family:inherit] focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                style={{ borderRadius: 999 }}
              >
                <Icon name="bag" size={17} />
                Add to Bag
              </motion.button>
            ) : (
              <motion.div key="step" layoutId={`cta-${uid}`} transition={SPRING} className="flex h-12 w-full items-center gap-2 rounded-full bg-[#f5f5f7] p-1" style={{ borderRadius: 999 }}>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.86 }}
                  onClick={() => change(-1)}
                  aria-label={qty === 1 ? "Remove from bag" : "Remove one"}
                  className="grid h-10 w-10 place-items-center rounded-full border-0 bg-white p-0 text-[#1d1d1f] shadow-[0_1px_3px_rgba(0,0,0,.12)] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
                >
                  <Icon name={qty === 1 ? "trash" : "minus"} size={16} />
                </motion.button>
                <div className="relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden text-[15px] font-semibold text-[#1d1d1f]">
                  <span className="text-[#30a14e]">
                    <Icon name="checkmark" size={14} />
                  </span>
                  <span className="relative inline-flex h-6 items-center overflow-hidden tabular-nums">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span key={qty} initial={{ y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -18, opacity: 0 }} transition={{ type: "spring", stiffness: 600, damping: 24 }}>
                        {qty}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  in bag
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.86 }}
                  onClick={() => change(1)}
                  aria-label="Add one more"
                  className="grid h-10 w-10 place-items-center rounded-full border-0 bg-[#0071e3] p-0 text-white outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2"
                >
                  <Icon name="plus" size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* the items in flight */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-visible" aria-hidden="true">
        {flights.map((f) => {
          const peak = Math.min(f.from.y, f.to.y) - (f.dir === 1 ? 120 : 60);
          return (
            <motion.div
              key={f.id}
              className="absolute left-0 top-0 h-[72px] w-[72px] rounded-[20px] bg-[#f5f5f7] bg-cover bg-center shadow-[0_14px_30px_-12px_rgba(0,0,0,.4),0_0_0_3px_#fff]"
              style={{ backgroundImage: f.img ? `url(${f.img})` : `radial-gradient(circle, ${f.hex} 32%, #f5f5f7 34%)` }}
              initial={{ x: f.from.x - 36, y: f.from.y - 36, scale: f.dir === 1 ? 1 : 0.3, rotate: 0, opacity: f.dir === 1 ? 1 : 0 }}
              animate={{
                x: [f.from.x - 36, f.to.x - 36],
                y: [f.from.y - 36, peak - 36, f.to.y - 36],
                scale: f.dir === 1 ? [1, 0.9, 0.3] : [0.3, 0.9, 0.7],
                rotate: f.dir === 1 ? [0, -16, -38] : [-30, 10, 0],
                opacity: f.dir === 1 ? [1, 1, 0.6] : [0, 1, 0],
              }}
              transition={{
                duration: f.dir === 1 ? 0.75 : 0.6,
                x: { duration: f.dir === 1 ? 0.75 : 0.6, ease: "linear" },
                y: { duration: f.dir === 1 ? 0.75 : 0.6, times: [0, 0.42, 1], ease: ["easeOut", "easeIn"] },
              }}
              onAnimationComplete={() => land(f)}
            >
            </motion.div>
          );
        })}
      </div>
      <span className="sr-only" aria-live="polite">
        {said}
      </span>
    </div>
  );
}

export default AddToBag;
```

--- components/add-to-bag/index.ts ---

```ts
export { AddToBag } from "./add-to-bag";
export type { BagProduct, MugHandle } from "./add-to-bag";
```
