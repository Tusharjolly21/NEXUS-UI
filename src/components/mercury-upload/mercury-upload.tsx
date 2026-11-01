"use client";

import { useEffect, useLayoutEffect, useRef, useState, type DragEvent as RDragEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
  uniforms: "uniform vec4 uPool; uniform vec3 uHang; uniform vec4 uDrop[6]; uniform vec2 uRip[4];",
  thick: "8.0",
  shadow: [0, 3, 3, 0.45],
  map: `
float map(vec2 p){
  // the pool in the channel: a stadium that spreads from the middle, or a single bead once it has pulled together
  float d = uPool.w > 0.5 ? sdRound(p, uPool.xy, vec2(uPool.z + uPool.w, uPool.w), uPool.w) : 1e5;
  // the bead hanging from the file, and the drops falling from it; they neck as they part and merge as they land
  if (uHang.z > 0.3) d = min(d, length(p - uHang.xy) - uHang.z);
  for (int i = 0; i < 6; i++) {
    vec4 q = uDrop[i];
    if (q.z > 0.1) {
      float e = sdE(p, q);
      float kh = 5.0 * (1.0 - smoothstep(4.0, 22.0, q.y - uHang.y));
      d = smin(d, e, max(kh, 4.0 * (1.0 - smoothstep(0.0, 14.0, uPool.y - q.y))) + 0.01);
    }
  }
  return d;
}`,
  warp: `
  // every drop that lands sends ripples running both ways along the pool
  for (int i = 0; i < 4; i++) {
    vec2 r0 = uRip[i];
    if (r0.y >= 0.0 && r0.y < 1.0) {
      float dx = p.x - r0.x, s0 = sign(dx);
      float ph = abs(dx) - r0.y * 150.0;
      float wv = exp(-ph * ph / 40.0) * (1.0 - r0.y) * exp(-abs(p.y - uPool.y) / 12.0);
      sl.x += s0 * -ph / 6.0 * wv * 0.7;
    }
  }`,
});

type Phase = "idle" | "uploading" | "pulling" | "done";
interface Drop { x: number; y: number; vy: number; r: number; on: boolean }

export interface MercuryUploadProps {
  /** uploads a sample file by itself until the first touch */
  autoplay?: boolean;
  /** called with the file the moment one is chosen or dropped */
  onUpload?: (file: File) => void;
  /** real progress from 0 to 1; leave it out and the pour runs on its own timing */
  progress?: number;
}

/**
 * MercuryUpload: a file upload that pours the file in as mercury.
 *
 * Choose or drop a file and its chip hangs above an empty channel. A bead of liquid metal swells under the chip,
 * stretches on a thinning neck, lets go and falls; the drop lengthens as it speeds up and, on landing, merges into
 * the pool below with a ripple that runs off both ways. Drop by drop the pool spreads from the middle of the channel
 * outward, which is the progress. When the last drop lands the whole pool draws itself together into a single round
 * bead, overshooting and settling, and a check is pressed into it.
 *
 * `onUpload(file)` fires when a file is chosen; the progress is simulated here (wire `progress` to your real upload
 * to drive it yourself, 0 to 1). `autoplay` uploads a sample file until the first real interaction. Reduced motion
 * fills the channel without the drops.
 */
export function MercuryUpload({ autoplay = false, onUpload, progress }: MercuryUploadProps) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const chan = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const touched = useRef(false);
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const phaseRef = useRef<Phase>("idle");
  useLayoutEffect(() => { phaseRef.current = phase; }, [phase]);
  const prog = useRef(0);
  const ext = useRef<number | undefined>(progress);
  useLayoutEffect(() => { ext.current = progress; }, [progress]);
  const [pct, setPct] = useState(0);
  const [gl, setGl] = useState(true);
  const [over, setOver] = useState(false);

  const begin = (name: string, bytes: number) => {
    const size = bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
    setFile({ name, size }); prog.current = 0; setPct(0); phaseRef.current = "uploading"; setPhase("uploading");
  };
  const reset = () => { setFile(null); prog.current = 0; setPct(0); phaseRef.current = "idle"; setPhase("idle"); };

  useEffect(() => {
    const cv = cvs.current, st = wrap.current; if (!cv || !st) return;
    const w = glSetup(cv, FRAG);
    if (!w) setGl(false);
    const { g, U } = w ?? { g: null as unknown as WebGLRenderingContext, U: () => null };
    const uRes = U("uRes"), uDpr = U("uDpr"), uT = U("uT"), uFlow = U("uFlow"), uPool = U("uPool"), uHang = U("uHang"), uDrop = U("uDrop"), uRip = U("uRip");
    let dpr = 1, off: readonly [number, number] = [0, 0];
    const uOff = U("uOff");
    // the canvas covers the channel and the drop's path down from the chip: a narrow column and a strip
    const size = () => {
      if (!chan.current) return;
      const c = within(st, chan.current, 12);
      const f = fitCanvas(cv, st, { l: c.l, t: 40, r: c.r, b: c.b + 6 });
      dpr = f.dpr; off = f.off;
      if (g) g.viewport(0, 0, cv.width, cv.height);
    };
    size();
    const ro = new ResizeObserver(size); ro.observe(st);
    const drops: Drop[] = [];
    const rips: { x: number; age: number }[] = [];
    let raf = 0, last = performance.now(), time = 1, hang = 0, shown = 0, half = 0, rad = 0, vHalf = 0, vRad = 0, pulled = 0, flow = 0;
    const D = new Float32Array(24), R = new Float32Array(8);
    const draw = (now: number) => {
      const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
      const sr = st.getBoundingClientRect(), k = sr.width / (st.offsetWidth || 1);
      const cr = chan.current!.getBoundingClientRect(), hr = chip.current?.getBoundingClientRect();
      const cx = (cr.left + cr.width / 2 - sr.left) / k, cy = (cr.top + cr.height / 2 - sr.top) / k, hw = cr.width / k / 2 - 4;
      const r0 = cr.height / k / 2 - 4;
      const sx = cx, sy = hr ? (hr.bottom - sr.top) / k + 1 : cy - 80;
      const ph = phaseRef.current;
      // the upload itself: yours if you pass `progress`, otherwise a believable one with pauses
      if (ph === "uploading") {
        if (ext.current !== undefined) prog.current = Math.max(prog.current, Math.min(1, ext.current));
        else prog.current = Math.min(1, prog.current + dt * (0.12 + 0.22 * Math.max(0, Math.sin(now / 420)) + 0.06 * Math.sin(now / 130)));
        setPct(Math.round(prog.current * 100));
      }
      // the pool follows what has actually landed, not the progress: it only grows when a drop arrives
      if (ph === "uploading" && !reduce) {
        // a bead swells under the chip; when it is heavy enough it falls, and another begins
        const owed = prog.current - shown;
        hang = Math.min(1, hang + dt * (owed > 0.02 ? 3.4 : 0.6));
        if (hang >= 1 && owed > 0.02 && drops.filter((d) => d.on).length < 6) {
          drops.push({ x: sx + (Math.random() - 0.5) * 1.5, y: sy + 9, vy: 20, r: 6, on: true });
          hang = 0.15;
        }
      } else hang = Math.max(0, hang - dt * 3);
      if (reduce && ph === "uploading") shown = prog.current;
      for (const d of drops) {
        if (!d.on) continue;
        d.vy += 1500 * dt; d.y += d.vy * dt;
        // it lands in the pool: what it carried is added, and a ripple runs out
        const surf = cy - (half > 0 || rad > 0.5 ? rad : -r0);
        if (d.y > surf - 2) {
          d.on = false;
          shown = Math.min(prog.current, shown + 0.075 + Math.random() * 0.03);
          rips.push({ x: d.x, age: 0 }); if (rips.length > 4) rips.shift();
        }
      }
      for (let i = drops.length - 1; i >= 0; i--) if (!drops[i].on) drops.splice(i, 1);
      for (const r of rips) r.age += dt / 0.9;
      // when the last drop is in, the pool pulls itself together into one bead
      if (ph === "uploading" && prog.current >= 1 && (shown >= 0.999 || reduce) && !drops.length) { shown = 1; phaseRef.current = "pulling"; setPhase("pulling"); pulled = now; }
      // the last sliver is too small to be worth a drop: the pool just takes it, so it can never wait on a bead that has stopped growing
      if (ph === "uploading" && prog.current >= 1 && shown < 1 && !drops.length && prog.current - shown <= 0.02) shown = Math.min(1, shown + 0.08);
      const wantHalf = ph === "pulling" || ph === "done" ? 0 : shown * hw - r0;
      const wantRad = ph === "pulling" || ph === "done" ? r0 * 2.1 : shown > 0.001 ? r0 : 0;
      if (ph === "pulling" || ph === "done") {
        vHalf += ((wantHalf - half) * 60 - vHalf * 9) * dt; half += vHalf * dt;
        vRad += ((wantRad - rad) * 170 - vRad * 11) * dt; rad += vRad * dt;
        if (ph === "pulling" && now - pulled > 1100) { phaseRef.current = "done"; setPhase("done"); }
      } else {
        half += (Math.max(0, wantHalf) - half) * Math.min(1, dt * 7); vHalf = 0;
        rad += (wantRad - rad) * Math.min(1, dt * 9); vRad = 0;
      }
      if (ph === "idle") { shown = 0; drops.length = 0; }
      flow += ((drops.length || ph === "pulling" ? 1 : 0) - flow) * Math.min(1, dt * 4);
      time += dt;
      if (g) {
        D.fill(0); drops.slice(0, 6).forEach((d, i) => { const st2 = Math.min(1.7, 1 + d.vy / 900); D.set([d.x, d.y, d.r / Math.sqrt(st2), d.r * st2], i * 4); });
        R.fill(-1); rips.forEach((r, i) => R.set([r.x, r.age], i * 2));
        g.clearColor(0, 0, 0, 0); g.clear(g.COLOR_BUFFER_BIT);
        g.uniform2f(uRes, cv.width, cv.height); g.uniform2f(uOff, off[0], off[1]); g.uniform1f(uDpr, dpr); g.uniform1f(uT, time); g.uniform1f(uFlow, flow * 0.5);
        g.uniform4f(uPool, cx, cy, Math.max(0, half), Math.max(0, rad));
        g.uniform3f(uHang, sx, sy + 1 + hang * 4.5, ph === "uploading" ? 2 + hang * 4.5 : 0);
        g.uniform4fv(uDrop, D); g.uniform2fv(uRip, R);
        // only two parts of the canvas ever hold metal: the channel, and the column the drops fall down
        g.enable(g.SCISSOR_TEST);
        const px = (v: number) => Math.round(v * dpr);
        const H = cv.height, chT = cy - r0 * 2.6 - 14 - off[1], chB = cy + r0 * 2.6 + 12 - off[1];
        g.scissor(0, H - px(chB), cv.width, px(chB - chT)); g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
        if (ph === "uploading" || drops.length) { const colL = sx - 16 - off[0]; g.scissor(px(colL), H - px(chT), px(32), px(chT)); g.drawArrays(g.TRIANGLE_STRIP, 0, 4); }
        g.disable(g.SCISSOR_TEST);
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [reduce]);

  useEffect(() => {
    if (!autoplay) return;
    let live = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    (async () => {
      await sleep(900);
      while (live && !touched.current) {
        begin("Q3-board-deck.pdf", 4_200_000);
        while (live && phaseRef.current !== "done") await sleep(200);
        await sleep(2600); if (!live || touched.current) break;
        reset(); await sleep(1400);
      }
    })();
    return () => { live = false; };
  }, [autoplay]);

  const pick = (f?: File | null) => { if (!f) return; touched.current = true; onUpload?.(f); begin(f.name, f.size); };
  const drop = (e: RDragEvent) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); };
  const done = phase === "done";

  return (
    <div
      ref={wrap}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={drop}
      className="relative w-full max-w-[460px] select-none overflow-hidden rounded-[28px] bg-[radial-gradient(120%_90%_at_50%_0%,#262628_0%,#141415_60%,#0c0c0d_100%)] px-6 pb-7 pt-7 shadow-[inset_0_1px_0_rgba(255,255,255,.06),0_0_0_1px_#050506]"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif", outline: over ? "2px dashed rgba(255,255,255,.25)" : "none", outlineOffset: -8 }}
    >
      <input ref={picker} type="file" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      <div className="flex h-[112px] items-start justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {file ? (
            <motion.div key="chip" ref={chip} initial={{ opacity: 0, y: -14, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative z-[2] flex max-w-full items-center gap-3 rounded-[16px] px-3.5 py-2.5" style={{ background: "linear-gradient(180deg,#2a2a2e,#1c1c1f)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.08), 0 0 0 1px #050506, 0 10px 24px -14px rgba(0,0,0,.9)" }}>
              <span className="grid h-9 w-8 shrink-0 place-items-center rounded-[7px] bg-white/[.07] text-[9.5px] font-bold tracking-wide text-white/60">{file.name.split(".").pop()?.slice(0, 4).toUpperCase()}</span>
              <span className="min-w-0">
                <span className="block max-w-[220px] truncate text-[14px] font-medium text-[#f2f2f5]">{file.name}</span>
                <span className="block text-[12px] tabular-nums text-white/55">{done ? `${file.size} · Uploaded` : phase === "pulling" ? "Finishing" : `${file.size} · ${pct}%`}</span>
              </span>
            </motion.div>
          ) : (
            <motion.button key="pick" type="button" onClick={() => { touched.current = true; picker.current?.click(); }} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="mt-3 rounded-full px-5 py-2.5 text-[14px] font-medium text-[#e9e9ee] outline-none ring-1 ring-white/15 transition-colors hover:bg-white/[.06] focus-visible:ring-2 focus-visible:ring-white/50">
              Choose a file, or drop one here
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div className="relative mx-auto h-[26px] w-full max-w-[320px]">
        <div ref={chan} className="absolute inset-0 rounded-full" style={{ background: "#09090a", boxShadow: "inset 0 2px 5px rgba(0,0,0,.9), inset 0 -1px 0 rgba(255,255,255,.06), 0 1px 0 rgba(255,255,255,.03)" }}>
          {!gl && <div aria-hidden className="absolute inset-y-[4px] left-1/2 -translate-x-1/2 rounded-full transition-[width]" style={{ width: `${pct}%`, background: "linear-gradient(180deg,#f2f3f8,#9a9eb0 55%,#5b5e6b)" }} />}
        </div>
        <AnimatePresence>
          {done && (
            <motion.svg key="ok" className="absolute left-1/2 top-1/2 z-[2] h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden>
              <motion.path d="M6 12.5 10.2 16.5 18 8" stroke="rgba(20,20,24,.6)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} style={{ filter: "drop-shadow(0 1px 0 rgba(255,255,255,.5))" }} />
            </motion.svg>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-5 flex h-6 items-center justify-center" aria-live="polite">
        {done ? (
          <button type="button" onClick={() => { touched.current = true; reset(); }} className="rounded-full px-3 py-1 text-[12.5px] text-white/55 outline-none hover:text-white/85 focus-visible:ring-2 focus-visible:ring-white/40">Upload another</button>
        ) : (
          <p className="m-0 text-[12.5px] text-white/55">{phase === "idle" ? "Nothing uploaded yet" : phase === "pulling" ? "Pulling together" : "Pouring it in"}</p>
        )}
      </div>
      <canvas ref={cvs} aria-hidden className="pointer-events-none absolute z-[1]" style={{ display: gl ? "block" : "none" }} />
    </div>
  );
}
