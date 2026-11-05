"use client";

/* eslint-disable react-hooks/refs -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, animate, motion, motionValue, useInView, useMotionValue, useReducedMotion, type AnimationPlaybackControls, type MotionValue } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  sparkles: "<path fill=\"currentColor\" d=\"M26.688 12.66c.28 0 .421-.164.492-.422c.726-3.914.68-4.008 4.758-4.781c.28-.047.445-.21.445-.492c0-.281-.164-.445-.446-.492c-4.054-.82-3.937-.914-4.757-4.782c-.07-.257-.211-.421-.492-.421s-.422.164-.493.421c-.82 3.868-.68 3.961-4.757 4.782c-.258.046-.446.21-.446.492c0 .281.188.445.445.492c4.079.82 4.032.867 4.758 4.781c.07.258.211.422.492.422M15.344 28.785c.445 0 .75-.281.797-.703c.843-6.258 1.054-6.258 7.523-7.5c.422-.07.727-.352.727-.797c0-.422-.305-.726-.727-.797c-6.469-.89-6.703-1.101-7.523-7.476c-.047-.422-.352-.727-.797-.727c-.422 0-.727.305-.774.75c-.773 6.281-1.101 6.258-7.523 7.453c-.422.094-.727.375-.727.797c0 .469.305.727.82.797c6.376 1.031 6.657 1.195 7.43 7.453c.047.469.352.75.774.75m15.89 25.946c.61 0 1.055-.446 1.172-1.079c1.664-12.843 3.469-14.789 16.172-16.195c.656-.07 1.102-.562 1.102-1.172s-.446-1.078-1.102-1.172c-12.703-1.406-14.508-3.351-16.172-16.195c-.117-.633-.562-1.055-1.172-1.055s-1.054.422-1.148 1.055c-1.664 12.844-3.492 14.789-16.172 16.195c-.68.094-1.125.563-1.125 1.172c0 .61.445 1.102 1.125 1.172c12.656 1.664 14.414 3.375 16.172 16.195c.094.633.539 1.078 1.148 1.078\"/>",
} as const;

export type OracleOrbProps = {
  /** your assistant: return (or resolve) the answer to a question. Without it the orb answers from samples. */
  onAsk?: (question: string) => Promise<string> | string;
  /** questions offered as chips */
  suggestions?: string[];
  placeholder?: string;
  /** Demo itself until someone touches it. Off by default. */
  autoplay?: boolean;
  className?: string;
};

const SUGGEST = ["What should I build next?", "How do I make my launch land?", "Name my design studio"];
const ANSWERS: Record<string, string> = {
  "What should I build next?": "Build the smallest version someone would pay for this week, then let them tell you what's missing.",
  "How do I make my launch land?": "Pick one moment people will want to share, make it flawless, and launch on a Tuesday morning.",
  "Name my design studio": "Kiln, Lumen or Fieldwork. Say each out loud; the one you'd use in a sentence wins.",
};
const FALLBACK = ["The answer is already in your notes. Look at the thing you keep postponing.", "Smaller than you think, sooner than you planned.", "Ask the person who'd use it. Then ask them again next week."];

// ─── The orb ───────────────────────────────────────────────────────────────────
// One WebGL quad. Inside a glass sphere, layers of folded noise make a liquid nebula that swirls round the
// centre, faster while it thinks, magnified towards the rim the way a glass ball bends what's in it. A fresnel
// rim, a window highlight and a soft specular sit on the glass, and light pooled through the ball glows on the
// floor beneath it. The pointer stirs it and tilts the nebula towards itself.

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform float uThink;
uniform float uSwirl;
uniform vec2 uLook;
uniform float uPulse;

float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise(vec3 x){
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }
mat2 rot(float a){ float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 palette(float t){
  vec3 a = vec3(0.04, 0.02, 0.14), b = vec3(0.36, 0.16, 0.86), c = vec3(0.98, 0.32, 0.62), d = vec3(1.0, 0.66, 0.3);
  t = clamp(t, 0.0, 1.0);
  if (t < 0.4) return mix(a, b, t / 0.4);
  if (t < 0.72) return mix(b, c, (t - 0.4) / 0.32);
  return mix(c, d, (t - 0.72) / 0.28);
}
void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / (0.5 * uRes.y);
  float R = 0.72;
  vec2 c = vec2(0.0, 0.14);
  vec2 p = uv - c;
  float r = length(p) / R;
  vec4 outc = vec4(0.0);
  // light pooled on the floor under the ball, and its shadow
  vec2 fp = uv - vec2(0.0, c.y - R - 0.07);
  float pool = exp(-pow(fp.x / 0.42, 2.0) - pow(fp.y / 0.06, 2.0));
  float shadow = exp(-pow(fp.x / 0.6, 2.0) - pow(fp.y / 0.1, 2.0));
  vec3 poolCol = mix(vec3(0.55, 0.3, 0.95), vec3(1.0, 0.5, 0.45), 0.5 + 0.5 * sin(uTime * 0.6)) * (0.55 + 0.6 * uThink + 0.3 * uPulse);
  outc = vec4(poolCol * pool * 0.55, pool * 0.45 + shadow * 0.25);
  if (r < 1.0) {
    float z = sqrt(1.0 - r * r);
    vec3 n = vec3(p / R, z);
    // the glass bends what's inside: things near the rim look bigger
    vec2 q = (p / R) * (0.55 + 0.45 * z);
    q += uLook * 0.12 * z;
    float spin = uTime * (0.12 + 0.75 * uThink) + uSwirl;
    float swirl = spin + (1.0 - length(q)) * (1.6 + 2.2 * uThink);
    q = rot(swirl) * q;
    float t = uTime * (0.08 + 0.2 * uThink);
    float f = fbm(vec3(q * 2.4, t));
    float g = fbm(vec3(q * 3.2 + vec2(f * 1.8, -f), t * 1.4 + 3.0));
    float h = fbm(vec3(q * 5.0 + g, t * 2.0 + 7.0));
    float v = g * 0.9 + h * 0.35 - 0.1 + 0.25 * uThink * sin(uTime * 3.0 + g * 6.0) * 0.4;
    vec3 col = palette(v + 0.08 * uPulse);
    // depth: dimmer towards the rim, a bright heart while thinking
    col *= 0.45 + 0.75 * z;
    col += palette(0.85) * exp(-length(q) * 4.0) * (0.15 + 0.5 * uThink + 0.4 * uPulse);
    // stars caught in the liquid
    vec2 sq = q * 26.0;
    vec2 cell = floor(sq);
    float rnd = hash(vec3(cell, 3.0));
    float twinkle = 0.5 + 0.5 * sin(uTime * (2.0 + rnd * 5.0) + rnd * 40.0);
    float star = smoothstep(0.12, 0.0, length(fract(sq) - 0.5)) * step(0.93, rnd) * twinkle;
    col += vec3(1.0, 0.95, 0.9) * star * 0.9;
    // glass: fresnel rim, a soft specular and a window reflection up and to the left
    float fres = pow(1.0 - z, 2.6);
    col = mix(col, vec3(0.86, 0.88, 1.0), fres * 0.55);
    vec3 L = normalize(vec3(-0.45, 0.55, 0.7));
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 70.0);
    col += spec * 0.85;
    vec2 wp = n.xy - vec2(-0.34, 0.42);
    float win = smoothstep(0.24, 0.16, length(wp * vec2(1.0, 1.6))) * smoothstep(-0.1, 0.25, n.y);
    col += vec3(1.0) * win * 0.22;
    // a caustic glint at the bottom inside the ball
    vec2 cp = n.xy - vec2(0.12, -0.72);
    col += vec3(1.0, 0.75, 0.6) * exp(-dot(cp, cp) * 60.0) * 0.45;
    float a = smoothstep(1.0, 0.985, r);
    outc = vec4(col * a, a) + outc * (1.0 - a);
  }
  // a halo round the ball while it thinks
  float halo = exp(-pow(max(r - 1.0, 0.0) * 4.0, 2.0)) * step(1.0, r) * (0.15 + 0.45 * uThink + 0.35 * uPulse);
  outc.rgb += palette(0.55) * halo * 0.5;
  outc.a = max(outc.a, halo * 0.35);
  gl_FragColor = outc;
}`;

type Gl = { gl: WebGLRenderingContext; u: Record<string, WebGLUniformLocation | null> };
function makeGl(canvas: HTMLCanvasElement): Gl | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
    return s;
  };
  try {
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return null;
    gl.useProgram(pr);
    const b = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u: Gl["u"] = {};
    ["uRes", "uTime", "uThink", "uSwirl", "uLook", "uPulse"].forEach((k) => (u[k] = gl.getUniformLocation(pr, k)));
    gl.clearColor(0, 0, 0, 0);
    return { gl, u };
  } catch {
    return null;
  }
}

const STOP = Symbol("stop");

/**
 * Oracle Orb: a crystal ball for AI answers.
 * A glass sphere holds a liquid nebula of violet, pink and amber that drifts and swirls, with stars caught in it
 * and light pooling on the floor beneath. Ask something and the orb thinks: the swirl quickens, its heart glows and
 * a halo breathes round it. Then the answer condenses out of the mist below, word by word, sharpening from a blur.
 * Move the pointer over the ball to tilt the nebula toward you; drag across it to stir.
 * Keyboard: type a question and press Enter, or Tab to a suggestion.
 */
export function OracleOrb({ onAsk, suggestions = SUGGEST, placeholder = "Ask the orb anything", autoplay = false, className = "" }: OracleOrbProps) {
  const reduced = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState("");
  const [state, setState] = useState<"idle" | "thinking" | "answered">("idle");
  const [answer, setAnswer] = useState<{ id: number; text: string } | null>(null);
  const [noGl, setNoGl] = useState(false);
  const inView = useInView(rootRef, { amount: 0.2 });
  const inViewRef = useRef(inView);
  inViewRef.current = inView;
  const live = useRef({ think: 0, thinkTo: 0, swirl: 0, swirlV: 0, lx: 0, ly: 0, lxTo: 0, lyTo: 0, pulse: 0 });
  const answerId = useId();

  useEffect(() => {
    live.current.thinkTo = state === "thinking" ? 1 : 0;
    if (state === "answered") live.current.pulse = 1;
  }, [state]);

  // ─── render loop ───
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const g = makeGl(cv);
    if (!g) {
      setNoGl(true);
      return;
    }
    const { gl, u } = g;
    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inViewRef.current || document.hidden) return;
      const L = live.current;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.round(cv.clientWidth * dpr);
      const h = Math.round(cv.clientHeight * dpr);
      if (cv.width !== w || cv.height !== h) {
        cv.width = w;
        cv.height = h;
      }
      L.think += (L.thinkTo - L.think) * Math.min(1, dt * 2.5);
      L.swirlV *= Math.pow(0.15, dt);
      L.swirl += L.swirlV * dt;
      L.lx += (L.lxTo - L.lx) * Math.min(1, dt * 4);
      L.ly += (L.lyTo - L.ly) * Math.min(1, dt * 4);
      L.pulse *= Math.pow(0.25, dt);
      gl.viewport(0, 0, w, h);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(u.uRes, w, h);
      gl.uniform1f(u.uTime, ((now - t0) / 1000) * (reduced ? 0.3 : 1));
      gl.uniform1f(u.uThink, L.think);
      gl.uniform1f(u.uSwirl, L.swirl);
      gl.uniform2f(u.uLook, L.lx, L.ly);
      gl.uniform1f(u.uPulse, L.pulse);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduced]);

  // ─── the pointer: look, and stir ───
  const prev = useRef<{ a: number; t: number } | null>(null);
  const onOrbMove = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const L = live.current;
    L.lxTo = x;
    L.lyTo = y;
    const a = Math.atan2(y, x);
    const now = performance.now();
    if (prev.current && Math.hypot(x, y) < 1) {
      let da = a - prev.current.a;
      if (da > Math.PI) da -= Math.PI * 2;
      if (da < -Math.PI) da += Math.PI * 2;
      L.swirlV += (da / Math.max(0.008, (now - prev.current.t) / 1000)) * 0.08;
      L.swirlV = Math.max(-6, Math.min(6, L.swirlV));
    }
    prev.current = { a, t: now };
  };
  const onOrbLeave = () => {
    live.current.lxTo = 0;
    live.current.lyTo = 0;
    prev.current = null;
  };

  // ─── asking ───
  const ask = useCallback(
    async (question: string) => {
      const v = question.trim();
      if (!v || state === "thinking") return;
      setQ("");
      setAnswer(null);
      setState("thinking");
      const started = performance.now();
      let text: string;
      try {
        text = onAsk ? await onAsk(v) : ANSWERS[v] ?? FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
      } catch {
        text = "The mist is too thick right now. Ask again in a moment.";
      }
      // give the orb a moment to think, even when the answer is instant
      const wait = Math.max(0, (reduced ? 300 : 1700) - (performance.now() - started));
      setTimeout(() => {
        setAnswer({ id: Date.now(), text });
        setState("answered");
      }, wait);
    },
    [onAsk, reduced, state],
  );
  const submit = (e: FormEvent) => {
    e.preventDefault();
    void ask(q);
  };

  // ─── Autoplay: a ghost finger stirs the ball and asks each suggestion ───
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const gs = useMotionValue(1);
  const go = useMotionValue(0);
  const askRef = useRef(ask);
  askRef.current = ask;
  useEffect(() => {
    if (!autoplay || reduced) return;
    const root = rootRef.current;
    if (!root) return;
    let alive = true;
    const running = new Set<AnimationPlaybackControls>();
    const abort = () => {
      if (!alive) return;
      alive = false;
      running.forEach((c) => c.stop());
      animate(go, 0, { duration: 0.2 });
    };
    const onTouch = (e: Event) => e.isTrusted && abort();
    root.addEventListener("pointerdown", onTouch, true);
    root.addEventListener("keydown", onTouch, true);
    const wait = (ms: number) =>
      new Promise<void>((res, rej) => {
        let left = ms;
        let lastT = performance.now();
        const tick = () => {
          if (!alive) return rej(STOP);
          const t = performance.now();
          if (inViewRef.current) left -= t - lastT;
          lastT = t;
          if (left <= 0) res();
          else setTimeout(tick, Math.min(60, Math.max(16, left)));
        };
        tick();
      });
    const run = (mv: MotionValue<number>, target: number, duration: number, e: [number, number, number, number] = [0.4, 0, 0.2, 1]) =>
      new Promise<void>((res, rej) => {
        if (!alive) return rej(STOP);
        if (Math.abs(mv.get() - target) < 0.01) return res();
        const c = animate(mv, target, { duration, ease: e, onComplete: () => (running.delete(c), res()) });
        running.add(c);
      });
    (async () => {
      let i = 0;
      await wait(900);
      while (alive) {
        const cv = orbRef.current!.getBoundingClientRect();
        const b = root.getBoundingClientRect();
        const cx = cv.left - b.left + cv.width / 2;
        const cy = cv.top - b.top + cv.height * 0.43;
        const rad = cv.width * 0.3;
        // stir the ball in a circle
        gx.set(cx + rad);
        gy.set(cy);
        await run(go, 1, 0.3);
        const ang = motionValue(0);
        const off = ang.on("change", (a) => {
          gx.set(cx + Math.cos(a) * rad);
          gy.set(cy + Math.sin(a) * rad * 0.8);
          const x = Math.cos(a) * 0.6;
          const y = -Math.sin(a) * 0.5;
          const L = live.current;
          L.lxTo = x;
          L.lyTo = y;
          L.swirlV = Math.min(5, L.swirlV + 0.25);
        });
        await run(ang, Math.PI * 2, 1.6, [0.4, 0, 0.6, 1]);
        off();
        live.current.lxTo = 0;
        live.current.lyTo = 0;
        // tap a suggestion
        const chip = root.querySelectorAll<HTMLButtonElement>("[data-suggest]")[i++ % suggestions.length];
        if (chip) {
          const r = chip.getBoundingClientRect();
          await Promise.all([run(gx, r.left - b.left + r.width / 2, 0.6), run(gy, r.top - b.top + r.height / 2, 0.6)]);
          await run(gs, 0.8, 0.1);
          chip.click();
          await run(gs, 1, 0.14);
        }
        await run(go, 0, 0.3);
        await wait(6200);
      }
    })().catch((e) => e !== STOP && console.error(e));
    return () => {
      abort();
      root.removeEventListener("pointerdown", onTouch, true);
      root.removeEventListener("keydown", onTouch, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, reduced]);

  const words = answer?.text.split(" ") ?? [];
  return (
    <div
      ref={rootRef}
      className={`relative w-full max-w-[520px] overflow-hidden rounded-[28px] bg-[#07060c] px-6 pb-6 pt-4 text-center text-white shadow-[0_0_0_1px_rgba(255,255,255,.06),0_24px_48px_-24px_rgba(0,0,0,.65)] ${className}`}
      style={{ backgroundImage: "radial-gradient(80% 50% at 50% 0%, rgba(120,80,255,.16), rgba(0,0,0,0) 70%)" }}
    >
      <div ref={orbRef} className="relative mx-auto h-[300px] w-[300px] max-w-full" onPointerMove={onOrbMove} onPointerLeave={onOrbLeave}>
        {noGl ? (
          <div aria-hidden="true" className="absolute left-1/2 top-[22px] h-[216px] w-[216px] -translate-x-1/2 rounded-full shadow-[inset_0_-20px_40px_rgba(0,0,0,.5),inset_0_8px_20px_rgba(255,255,255,.25),0_0_60px_rgba(140,90,255,.35)]" style={{ background: "radial-gradient(circle at 40% 35%, #ff9f6e, #c0399c 45%, #3a1a8a 75%, #120830)" }} />
        ) : (
          <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full cursor-grab active:cursor-grabbing" />
        )}
      </div>

      {/* the answer condenses out of the mist */}
      <div id={answerId} aria-live="polite" className="relative mx-auto -mt-2 flex min-h-[88px] max-w-[400px] items-center justify-center">
        <AnimatePresence mode="wait">
          {state === "thinking" ? (
            <motion.p
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, backgroundPosition: ["150% 0%", "-50% 0%"] }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ opacity: { duration: 0.3 }, backgroundPosition: { duration: 1.6, repeat: Infinity, ease: "linear" } }}
              className="m-0 bg-[linear-gradient(90deg,rgba(255,255,255,.3)_30%,#fff_50%,rgba(255,255,255,.3)_70%)] bg-[length:200%_100%] bg-clip-text text-[15px] font-medium text-transparent"
            >
              The orb is thinking
            </motion.p>
          ) : answer ? (
            <motion.p key={answer.id} className="relative m-0 text-[17px] font-medium leading-[1.45] tracking-[-0.01em] text-white/90" exit={{ opacity: 0, filter: "blur(8px)", transition: { duration: 0.3 } }}>
              <motion.span aria-hidden="true" className="pointer-events-none absolute -inset-x-10 -inset-y-6 rounded-full" initial={{ opacity: 0.8, scale: 0.7 }} animate={{ opacity: 0, scale: 1.3 }} transition={{ duration: 1.6, ease: "easeOut" }} style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(190,150,255,.35), rgba(190,150,255,0))" }} />
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(10px)", y: 8, scale: 1.08 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
                  transition={{ duration: 0.7, delay: i * 0.055, ease: [0.2, 0.7, 0.3, 1] }}
                >
                  {w}
                  {i < words.length - 1 ? " " : ""}
                </motion.span>
              ))}
            </motion.p>
          ) : (
            <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="m-0 text-[14px] text-white/45">
              Hold your question in mind, then ask.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={submit} className="mt-3 flex items-center gap-2 rounded-full bg-white/[.06] p-1.5 pl-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label="Your question" aria-describedby={answerId} className="h-9 min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/35" />
        <motion.button type="submit" whileTap={{ scale: 0.92 }} disabled={!q.trim() || state === "thinking"} aria-label="Ask" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-[#07060c] outline-none transition-opacity disabled:opacity-30 focus-visible:ring-2 focus-visible:ring-[#a98bff]">
          <svg viewBox="0 0 56 56" width={16} height={16} aria-hidden="true" dangerouslySetInnerHTML={{ __html: ICON.sparkles }} />
        </motion.button>
      </form>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {suggestions.map((s) => (
          <motion.button
            key={s}
            type="button"
            data-suggest
            onClick={() => void ask(s)}
            disabled={state === "thinking"}
            whileTap={{ scale: 0.95 }}
            className="rounded-full bg-white/[.06] px-3 py-1.5 text-[12.5px] text-white/75 outline-none transition-colors hover:bg-white/[.12] hover:text-white focus-visible:ring-2 focus-visible:ring-[#a98bff] disabled:opacity-40"
          >
            {s}
          </motion.button>
        ))}
      </div>
      <motion.span
        aria-hidden="true"
        style={{ x: gx, y: gy, scale: gs, opacity: go }}
        className="pointer-events-none absolute left-0 top-0 z-30 -ml-[15px] -mt-[15px] h-[30px] w-[30px] rounded-full border-[1.5px] border-white/80 bg-white/15 shadow-[0_4px_14px_rgba(0,0,0,.3)] backdrop-blur-[2px]"
      />
    </div>
  );
}
