"use client";

import { useReducedMotion } from "framer-motion";
import { type PointerEvent as RPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAutoplaySoundAllowed, useSoundsEnabled } from "@/lib/ui-sounds";

export type MeltTypeProps = {
  /** the heading; a line break splits lines */
  text?: string;
  /** a line under it */
  caption?: string;
  /** ink and paper */
  ink?: string;
  paper?: string;
  /** Soft synthesised sounds as you use it. They also follow the site-wide sound switch. */
  enableSound?: boolean;
  /** 0 to 1 */
  volume?: number;
  autoplay?: boolean;
  className?: string;
};

// ───────────── sound: small synthesised notes, no audio files. The browser keeps it silent until the visitor has
// clicked or pressed a key somewhere on the page, so autoplay only makes sound once someone is using the page. ─────────────

type Engine = { ctx: AudioContext; noise: AudioBuffer };
const ENGINE_KEY = "__uiSoundEngine";
const engine = () => (globalThis as unknown as Record<string, Engine | undefined>)[ENGINE_KEY] ?? null;
function unlockAudio() {
  const g = globalThis as unknown as Record<string, Engine | undefined>;
  const e = g[ENGINE_KEY];
  if (e) {
    if (e.ctx.state === "suspended") void e.ctx.resume();
    return;
  }
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  const ctx = new AC();
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  g[ENGINE_KEY] = { ctx, noise };
}

type NoteOpts = {
  at?: number;
  dur?: number;
  gain?: number;
  type?: OscillatorType;
  glide?: number;
  bell?: number;
};
type Sound = {
  /** a soft glassy note: a sine with a faint bell partial above it */
  note: (freq: number, o?: NoteOpts) => void;
  /** air moving: filtered noise swept from one pitch to another */
  whoosh: (from: number, to: number, o?: { at?: number; dur?: number; gain?: number }) => void;
  /** a tiny dry click */
  tick: (o?: { at?: number; freq?: number; gain?: number }) => void;
};

function useSound(enabled: boolean, volume: number, allow: () => boolean = () => true): Sound {
  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("pointerdown", unlockAudio, true);
    window.addEventListener("keydown", unlockAudio, true);
    return () => {
      window.removeEventListener("pointerdown", unlockAudio, true);
      window.removeEventListener("keydown", unlockAudio, true);
    };
  }, [enabled]);
  const on = useRef(enabled);
  const vol = useRef(Math.max(0, Math.min(1, volume)));
  const allowRef = useRef(allow);
  useEffect(() => {
    on.current = enabled;
    vol.current = Math.max(0, Math.min(1, volume));
    allowRef.current = allow;
  });
  return useMemo(() => {
    const live = () => {
      const e = engine();
      return e && on.current && allowRef.current() && vol.current > 0 && e.ctx.state === "running" ? e : null;
    };
    const env = (ctx: AudioContext, t: number, peak: number, attack: number, dur: number) => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      return g;
    };
    return {
      note(freq, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = o.dur ?? 0.3;
        const peak = (o.gain ?? 0.14) * vol.current;
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 7000;
        lp.connect(ctx.destination);
        const g = env(ctx, t, peak, 0.006, dur);
        g.connect(lp);
        const a = ctx.createOscillator();
        a.type = o.type ?? "sine";
        a.frequency.setValueAtTime(freq, t);
        if (o.glide) a.frequency.exponentialRampToValueAtTime(o.glide, t + dur * 0.6);
        a.connect(g);
        a.start(t);
        a.stop(t + dur + 0.05);
        const bell = o.bell ?? 0.25;
        if (bell > 0) {
          const g2 = env(ctx, t, peak * bell, 0.003, dur * 0.4);
          g2.connect(lp);
          const b = ctx.createOscillator();
          b.frequency.setValueAtTime(freq * 2.76, t);
          if (o.glide) b.frequency.exponentialRampToValueAtTime(o.glide * 2.76, t + dur * 0.6);
          b.connect(g2);
          b.start(t);
          b.stop(t + dur * 0.4 + 0.05);
        }
      },
      whoosh(from, to, o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.01 + (o.at ?? 0);
        const dur = Math.min(0.95, o.dur ?? 0.4);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.Q.value = 1.1;
        bp.frequency.setValueAtTime(from, t);
        bp.frequency.exponentialRampToValueAtTime(to, t + dur);
        const g = ctx.createGain();
        const peak = (o.gain ?? 0.08) * vol.current;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + dur * 0.35);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.3);
        src.stop(t + dur + 0.05);
      },
      tick(o = {}) {
        const e = live();
        if (!e) return;
        const { ctx, noise } = e;
        const t = ctx.currentTime + 0.005 + (o.at ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = noise;
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = o.freq ?? 3200;
        bp.Q.value = 4;
        const g = env(ctx, t, (o.gain ?? 0.09) * vol.current, 0.001, 0.03);
        src.connect(bp).connect(g).connect(ctx.destination);
        src.start(t, Math.random() * 0.5);
        src.stop(t + 0.05);
      },
    } satisfies Sound;
  }, []);
}

const TRAIL = 24;

const VERT = `attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `precision highp float;
varying vec2 vUv;
uniform sampler2D uText;
uniform vec2 uRes;
uniform float uTime;
uniform vec4 uTrail[${TRAIL}]; // x, y, strength, direction angle
uniform vec3 uInk;
uniform vec3 uPaper;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
vec2 curl(vec2 p){
  float e = 0.02;
  float n1 = noise(p + vec2(0.0, e)), n2 = noise(p - vec2(0.0, e));
  float n3 = noise(p + vec2(e, 0.0)), n4 = noise(p - vec2(e, 0.0));
  return vec2(n1 - n2, -(n3 - n4)) / (2.0 * e);
}
void main(){
  vec2 uv = vUv;
  float asp = uRes.x / uRes.y;
  vec2 q = vec2(uv.x * asp, uv.y);
  // the trail of the pointer bends the type: each point stirs the space around it in a swirl, dragged along the way it moved
  vec2 off = vec2(0.0);
  float heat = 0.0;
  for (int i = 0; i < ${TRAIL}; i++) {
    vec4 t = uTrail[i];
    if (t.z <= 0.0) continue;
    vec2 d = q - vec2(t.x * asp, t.y);
    float fall = exp(-dot(d, d) / 0.02) * t.z;
    vec2 dir = vec2(cos(t.w), sin(t.w));
    vec2 flow = curl(q * 9.0 + uTime * 0.4 + float(i) * 0.37) * 0.5 + dir;
    off += flow * fall;
    heat += fall;
  }
  off *= 0.075;
  // banding: the stirred type breaks into flowing horizontal bands
  float band = sin(uv.y * 38.0 + uTime * 2.4) * 0.009 * min(heat, 1.0);
  vec2 s = uv - vec2(off.x / asp + band, off.y);
  float r = texture2D(uText, s + vec2(0.0035, 0.0) * min(heat, 1.0)).a;
  float g = texture2D(uText, s).a;
  float b = texture2D(uText, s - vec2(0.0035, 0.0) * min(heat, 1.0)).a;
  // each channel from its own sample: a faint spectral fringe where it is stirred hardest
  vec3 col = vec3(mix(uPaper.r, uInk.r, r), mix(uPaper.g, uInk.g, g), mix(uPaper.b, uInk.b, b));
  gl_FragColor = vec4(col, 1.0);
}`;

const pendingLose = new WeakMap<HTMLCanvasElement, ReturnType<typeof setTimeout>>();
const hex = (h: string) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

/**
 * A heading in heavy type that melts under the pointer. Move across it and the letters bend and swirl along your
 * path like ink stirred in water, breaking into flowing bands with a faint spectral fringe, then slowly settle back
 * into perfectly sharp type as the trail fades. The text is real, selectable text for screen readers; the melting is
 * drawn over it.
 */
export default function MeltType({
  text = "Bend the\nrules",
  caption = "Run the pointer through the letters.",
  ink = "#16171b",
  paper = "#f5f5f7",
  enableSound = true,
  volume = 0.6,
  autoplay = false,
  className = "",
}: MeltTypeProps) {
  const reduce = useReducedMotion() ?? false;
  const [siteSound] = useSoundsEnabled();
  // a demo playing by itself only makes sound where the page allows it (see AutoplaySound)
  const autoplaySoundOk = useAutoplaySoundAllowed();
  const autoplayOk = useRef(autoplaySoundOk);
  useEffect(() => {
    autoplayOk.current = autoplaySoundOk;
  }, [autoplaySoundOk]);
  const sfx = useSound(enableSound && siteSound, volume, () => touched.current || autoplayOk.current);
  const wrap = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const trail = useRef<{ x: number; y: number; s: number; a: number }[]>([]);
  const lastP = useRef<{ x: number; y: number } | null>(null);
  const touched = useRef(false);
  const [noGL, setNoGL] = useState(false);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    const c = cv.current;
    const el = wrap.current;
    if (!c || !el) return;
    let gl: WebGLRenderingContext | null = null;
    clearTimeout(pendingLose.get(c));
    try {
      gl = c.getContext("webgl", { antialias: false, alpha: false });
    } catch {
      gl = null;
    }
    if (!gl) {
      setNoGL(true);
      return;
    }
    const g = gl;
    const sh = (t: number, src: string) => {
      const s = g.createShader(t)!;
      g.shaderSource(s, src);
      g.compileShader(s);
      if (!g.getShaderParameter(s, g.COMPILE_STATUS)) console.warn(g.getShaderInfoLog(s));
      return s;
    };
    const prog = g.createProgram()!;
    g.attachShader(prog, sh(g.VERTEX_SHADER, VERT));
    g.attachShader(prog, sh(g.FRAGMENT_SHADER, FRAG));
    g.linkProgram(prog);
    if (!g.getProgramParameter(prog, g.LINK_STATUS)) {
      console.warn(g.getProgramInfoLog(prog));
      setNoGL(true);
      return;
    }
    g.useProgram(prog);
    const buf = g.createBuffer();
    g.bindBuffer(g.ARRAY_BUFFER, buf);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(prog, "p");
    g.enableVertexAttribArray(loc);
    g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n: string) => g.getUniformLocation(prog, n);
    const uRes = U("uRes");
    const uTime = U("uTime");
    const uTrail = U("uTrail");
    g.uniform3fv(U("uInk"), hex(ink));
    g.uniform3fv(U("uPaper"), hex(paper));
    g.uniform1i(U("uText"), 0);
    const tex = g.createTexture();
    g.bindTexture(g.TEXTURE_2D, tex);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.LINEAR);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, true);
    // the heading is set in a canvas, as large as fits, then handed to the GPU
    const paint = () => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const W = Math.max(2, Math.round(el.clientWidth * dpr));
      const H = Math.max(2, Math.round(el.clientHeight * dpr));
      c.width = W;
      c.height = H;
      g.viewport(0, 0, W, H);
      g.uniform2f(uRes, W, H);
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const x = off.getContext("2d")!;
      const lines = text.split("\n");
      let size = H / (lines.length * 1.05 + 0.6);
      x.font = `800 ${size}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", sans-serif`;
      const widest = Math.max(...lines.map((l) => x.measureText(l).width));
      if (widest > W * 0.88) size *= (W * 0.88) / widest;
      x.font = `800 ${size}px -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", "Segoe UI", sans-serif`;
      x.textAlign = "center";
      x.textBaseline = "middle";
      x.fillStyle = "#000";
      const lh = size * 0.98;
      lines.forEach((l, i) => {
        // tight negative tracking, letter by letter
        const track = -size * 0.035;
        const chars = [...l];
        const widths = chars.map((ch) => x.measureText(ch).width);
        const total = widths.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
        let cx = W / 2 - total / 2;
        x.textAlign = "left";
        chars.forEach((ch, k) => {
          x.fillText(ch, cx, H / 2 + (i - (lines.length - 1) / 2) * lh);
          cx += widths[k] + track;
        });
      });
      g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, off);
      kick.current();
    };
    paint();
    void document.fonts?.ready.then(paint);
    const ro = new ResizeObserver(paint);
    ro.observe(el);
    const arr = new Float32Array(TRAIL * 4);
    let raf = 0;
    let running = false;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (autoplay && !touched.current && !reduce) {
        const k = (now - t0) / 1000;
        const cyc = k % 5;
        if (cyc < 2.4) push(0.12 + (cyc / 2.4) * 0.76, 0.5 + Math.sin(cyc * 4) * 0.22);
        else lastP.current = null;
      }
      // the trail fades, slowly, so the type settles back
      trail.current = trail.current.map((p) => ({ ...p, s: p.s - dt * 0.38 })).filter((p) => p.s > 0);
      arr.fill(0);
      trail.current.slice(-TRAIL).forEach((p, i) => {
        arr[i * 4] = p.x;
        arr[i * 4 + 1] = p.y;
        arr[i * 4 + 2] = Math.min(1, p.s) * (p.s < 0.4 ? p.s / 0.4 : 1);
        arr[i * 4 + 3] = p.a;
      });
      g.uniform4fv(uTrail, arr);
      g.uniform1f(uTime, (now - t0) / 1000);
      g.drawArrays(g.TRIANGLES, 0, 3);
      if (trail.current.length || (autoplay && !touched.current && !reduce)) raf = requestAnimationFrame(frame);
      else running = false;
    };
    kick.current = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    kick.current();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      pendingLose.set(
        c,
        setTimeout(() => g.getExtension("WEBGL_lose_context")?.loseContext(), 300),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, ink, paper, autoplay, reduce]);

  const lastSound = useRef(0);
  function push(x: number, y: number) {
    if (reduce) return;
    const lp = lastP.current;
    if (lp) {
      const dx = x - lp.x;
      const dy = y - lp.y;
      const d = Math.hypot(dx, dy);
      if (d < 0.012) return;
      trail.current.push({
        x,
        y,
        s: Math.min(1.3, 0.22 + d * 12),
        a: Math.atan2(dy, dx),
      });
      if (trail.current.length > TRAIL) trail.current.shift();
      const now = performance.now();
      if (now - lastSound.current > 90) {
        lastSound.current = now;
        sfx.whoosh(300 + d * 6000, 200 + d * 3000, {
          dur: 0.25,
          gain: Math.min(0.04, d * 0.6),
        });
      }
    }
    lastP.current = { x, y };
    kick.current();
  }
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    const r = e.currentTarget.getBoundingClientRect();
    push((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-[24px] ${className}`} style={{ background: paper }}>
      <div
        ref={wrap}
        onPointerMove={onMove}
        onPointerLeave={() => (lastP.current = null)}
        style={{
          position: "relative",
          height: 380,
          touchAction: "pan-y",
          cursor: "crosshair",
        }}
      >
        <canvas
          ref={cv}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            display: noGL ? "none" : "block",
          }}
        />
        <h2
          style={{
            position: "absolute",
            inset: 0,
            margin: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            whiteSpace: "pre-line",
            fontSize: "clamp(48px, 12vw, 120px)",
            fontWeight: 800,
            lineHeight: 0.98,
            letterSpacing: "-0.035em",
            color: noGL ? ink : "transparent",
          }}
        >
          {text}
        </h2>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 16,
          textAlign: "center",
          fontSize: 13,
          color: "#86868b",
          pointerEvents: "none",
        }}
      >
        {caption}
      </div>
    </div>
  );
}
