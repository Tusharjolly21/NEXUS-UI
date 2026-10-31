"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ the ring: a tube of liquid chrome, drawn by a shader */
const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uT, uR, uW, uDpr, uBoost, uSqueeze, uReady, uRun, uHead, uFlash;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float bump(float v, float at, float w){ float d = fract(v - at + 0.5) - 0.5; return exp(-(d * d) / (w * w)); }
// the room the chrome reflects, as one stripe of light: bright sky, a soft grey horizon, two hard dark bands and a
// white-hot window with a warm glow beside it
float env(float u){
  float b = 0.9 + 0.16 * cos(6.2831853 * (u - 0.1));
  b *= 1.0 - 0.92 * bump(u, 0.36, 0.018);
  b *= 1.0 - 0.7 * bump(u, 0.63, 0.012);
  b *= 1.0 - 0.3 * bump(u, 0.82, 0.08);
  b += 0.5 * bump(u, 0.06, 0.02);
  return b;
}
void main(){
  vec2 q = (gl_FragCoord.xy - 0.5 * uRes) / uDpr;
  q.y *= 1.0 + uSqueeze;
  float d = length(q);
  float rIn = uR - uW;
  float aOut = clamp(uR - d + 0.5, 0.0, 1.0), aIn = clamp(d - rIn + 0.5, 0.0, 1.0);
  float a = aOut * aIn;
  if (a <= 0.0) { gl_FragColor = vec4(0.0); return; }
  float t = clamp((d - rIn) / uW, 0.0, 1.0);    // across the tube, inside to outside
  float s = t * 2.0 - 1.0;
  vec2 n = q / max(d, 0.001);
  // what each point of the ring sees: a point in the reflected room set by the ring's direction, shifted a little
  // across the tube's curve, and pushed around by slow currents so it moves like liquid rather than turning
  vec2 P = n * (1.0 + 0.05 * s);
  float tm = uT * (1.0 + 0.6 * uBoost);
  vec2 cur = vec2(vnoise(P * 1.2 + vec2(tm * 0.16, 1.3)), vnoise(P * 1.2 + vec2(5.2, -tm * 0.13))) - 0.5;
  P += cur * 0.38;
  // the room's light lies in stripes; they drift from the bottom-left to the top-right, so every feature enters the
  // ring at one point, splits, runs up both sides and leaves at the opposite point
  float u = dot(P, vec2(0.7071, 0.7071)) * 0.72 - tm * 0.1;
  // light splits slightly by colour where the reflection changes sharply: short rainbows of blue, white and gold
  float k = 0.011;
  vec3 c = vec3(env(u + k), env(u), env(u - k * 1.1));
  vec3 tint = mix(vec3(0.9, 0.92, 1.0), vec3(1.0, 0.94, 0.82), bump(u, 0.14, 0.06));
  c *= tint;
  // the tube's profile: a thin dark lip at its outer edge, a soft shade at its inner edge, brightest across the crown
  float prof = smoothstep(0.0, 0.2, t) * (1.0 - 0.6 * smoothstep(0.8, 1.0, t));
  c *= mix(0.36, 1.08, prof) * (0.93 + 0.07 * n.y) * (1.0 + 0.1 * uBoost);
  // with nothing to send the metal is dull and grey; it brightens as soon as there is something to send
  float lum = dot(c, vec3(0.3, 0.5, 0.2));
  c = mix(vec3(lum) * 0.62, c, 0.5 + 0.5 * uReady);
  // sending: a bead of molten light runs round the ring, trailing a tail that cools behind it
  float th = atan(q.y, q.x);
  float behind = mod(th - uHead, 6.2831853);
  c += vec3(1.0, 0.96, 0.9) * exp(-behind * 1.4) * uRun * (0.35 + 0.65 * prof);
  // sent: the whole ring flashes once
  c *= 1.0 + uFlash * 0.7;
  gl_FragColor = vec4(c * a, a);
}`;

/** Paperclip, outlined. */
function Clip({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M16.5 7.5 8.6 15.4a2.1 2.1 0 0 0 3 3l8.3-8.3a4.2 4.2 0 0 0-6-6L5.6 12.4a6.3 6.3 0 0 0 8.9 8.9l6-6" transform="rotate(8 12 12)" />
    </svg>
  );
}
/** Two four-pointed sparkles. */
function Sparkle({ size }: { size: number }) {
  const star = (cx: number, cy: number, r: number) => `M${cx} ${cy - r}C${cx + r * 0.16} ${cy - r * 0.16} ${cx + r * 0.16} ${cy - r * 0.16} ${cx + r} ${cy}C${cx + r * 0.16} ${cy + r * 0.16} ${cx + r * 0.16} ${cy + r * 0.16} ${cx} ${cy + r}C${cx - r * 0.16} ${cy + r * 0.16} ${cx - r * 0.16} ${cy + r * 0.16} ${cx - r} ${cy}C${cx - r * 0.16} ${cy - r * 0.16} ${cx - r * 0.16} ${cy - r * 0.16} ${cx} ${cy - r}Z`;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={star(13.8, 14, 9.6)} />
      <path d={star(5.4, 5.2, 4.4)} />
    </svg>
  );
}

interface Msg { id: number; text: string; file?: string }
const SUGGESTIONS = ["Sounds good, see you at 6.", "Can you send me the final deck?", "Running 5 minutes late, start without me.", "Love it. Ship it."];

/**
 * LiquidSend: a message composer whose send button is ringed in liquid metal, and actually sends.
 *
 * The ring is a tube of chrome whose reflection is never still: stripes of light drift across it from the bottom
 * left to the top right, so every highlight enters at one point, splits, runs up both sides and leaves at the
 * opposite one, pushed about by slow currents like liquid; where a dark band's edge passes, the light splits into
 * short rainbows of blue, white and gold. With nothing typed, the metal is dull and grey; type and it brightens.
 *
 * Send (click, or Enter) and a bead of molten light races round the ring while the arrow lifts away; the message
 * rises from the field into the thread above in a dark bubble edged in the same chrome; the ring flashes once, a
 * check appears, and the arrow comes back. The sparkle writes a suggestion into the field, letter by letter, and the
 * paperclip attaches a real file. `onSend(text, file)` fires with each message. `autoplay` writes and sends a few
 * messages until the first real interaction. Reduced motion holds the metal still. `size` sets the send button's
 * diameter (the composer scales with it); left out, it follows the composer's width, from 52 to 68.
 */
export function LiquidSend({ autoplay = false, onSend, placeholder = "Message", size }: { autoplay?: boolean; onSend?: (text: string, file?: string) => void; placeholder?: string; size?: number }) {
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const picker = useRef<HTMLInputElement>(null);
  const state = useRef({ hover: 0, hoverTo: 0, squeeze: 0, squeezeTo: 0, ready: 0, readyTo: 0, run: 0, runTo: 0, head: 1.6, flash: 0 });
  const touched = useRef(false);
  const typing = useRef(0);
  const fixed = size !== undefined && Number.isFinite(size) ? Math.round(Math.max(40, Math.min(240, size))) : undefined;
  const [fitD, setFitD] = useState(64);
  const D = fixed ?? fitD;
  const [gl, setGl] = useState(true);
  const [text, setText] = useState("");
  const [file, setFile] = useState<string | undefined>();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const arrow = useAnimationControls();
  const can = (text.trim().length > 0 || !!file) && phase === "idle";
  // the shader reads this every frame; set it after render, not during
  useEffect(() => {
    state.current.readyTo = can || phase !== "idle" ? 1 : 0;
  }, [can, phase]);

  useEffect(() => {
    if (fixed !== undefined) return;
    const el = wrap.current; if (!el) return;
    const fit = () => setFitD(Math.round(Math.max(52, Math.min(68, el.getBoundingClientRect().width * 0.11))));
    fit();
    const ro = new ResizeObserver(fit); ro.observe(el);
    return () => ro.disconnect();
  }, [fixed]);

  useEffect(() => {
    const cv = cvs.current; if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), S = D + 4;
    cv.width = Math.round(S * dpr); cv.height = Math.round(S * dpr);
    const g = cv.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!g) { setGl(false); return; }
    const sh = (type: number, src: string) => { const x = g.createShader(type)!; g.shaderSource(x, src); g.compileShader(x); return x; };
    const pr = g.createProgram()!;
    g.attachShader(pr, sh(g.VERTEX_SHADER, VERT)); g.attachShader(pr, sh(g.FRAGMENT_SHADER, FRAG)); g.linkProgram(pr);
    if (!g.getProgramParameter(pr, g.LINK_STATUS)) { setGl(false); return; }
    g.useProgram(pr);
    const b = g.createBuffer(); g.bindBuffer(g.ARRAY_BUFFER, b);
    g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), g.STATIC_DRAW);
    const loc = g.getAttribLocation(pr, "p"); g.enableVertexAttribArray(loc); g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
    const U = (n: string) => g.getUniformLocation(pr, n);
    const uT = U("uT"), uBoost = U("uBoost"), uSq = U("uSqueeze"), uReady = U("uReady"), uRun = U("uRun"), uHead = U("uHead"), uFlash = U("uFlash");
    g.viewport(0, 0, cv.width, cv.height);
    g.uniform2f(U("uRes"), cv.width, cv.height); g.uniform1f(U("uR"), D / 2); g.uniform1f(U("uW"), Math.max(3, D * 0.056)); g.uniform1f(U("uDpr"), dpr);
    g.clearColor(0, 0, 0, 0);
    let raf = 0, last = performance.now(), time = 6;
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const st = state.current;
      st.hover += (st.hoverTo - st.hover) * Math.min(1, dt * 6);
      st.squeeze += (st.squeezeTo - st.squeeze) * Math.min(1, dt * 18);
      st.ready += (st.readyTo - st.ready) * Math.min(1, dt * 5);
      st.run += (st.runTo - st.run) * Math.min(1, dt * 9);
      st.flash *= Math.exp(-dt * 4);
      time += dt * (1 + st.hover * 0.8 + st.run * 5);
      st.head -= dt * 9 * st.run; // clockwise on screen
      g.clear(g.COLOR_BUFFER_BIT);
      g.uniform1f(uT, reduce ? 6 : time); g.uniform1f(uBoost, st.hover); g.uniform1f(uSq, st.squeeze * 0.04);
      g.uniform1f(uReady, st.ready); g.uniform1f(uRun, st.run); g.uniform1f(uHead, st.head); g.uniform1f(uFlash, st.flash);
      g.drawArrays(g.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    const vis = new IntersectionObserver(([en]) => { cancelAnimationFrame(raf); if (en.isIntersecting) { last = performance.now(); raf = requestAnimationFrame(draw); } });
    vis.observe(cv);
    return () => { cancelAnimationFrame(raf); vis.disconnect(); };
  }, [D, reduce]);

  const press = (down: boolean) => { state.current.squeezeTo = down ? 1 : 0; };
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const send = async () => {
    const body = text.trim();
    if ((!body && !file) || phase !== "idle") return;
    typing.current++;
    const st = state.current;
    setPhase("sending");
    st.runTo = 1;
    arrow.start({ y: -D * 0.45, opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } });
    const msg: Msg = { id: Date.now(), text: body, file };
    setText(""); setFile(undefined);
    await sleep(reduce ? 0 : 520);
    setMsgs((m) => [...m, msg].slice(-3));
    onSend?.(body, msg.file);
    await sleep(reduce ? 0 : 380);
    st.runTo = 0; st.flash = 1;
    setPhase("sent");
    await sleep(reduce ? 300 : 900);
    setPhase("idle");
    arrow.set({ y: D * 0.4, opacity: 0 });
    arrow.start({ y: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 22 } });
  };

  // the sparkle: writes a suggestion in, a letter at a time, as if someone were typing it
  const suggest = async (real = true) => {
    if (real) touched.current = true;
    if (phase !== "idle") return;
    const run = ++typing.current;
    const line = SUGGESTIONS[(msgs.length + Math.floor(Math.random() * 3)) % SUGGESTIONS.length];
    setText("");
    for (let i = 1; i <= line.length; i++) {
      if (typing.current !== run) return;
      setText(line.slice(0, i));
      await sleep(reduce ? 0 : 28 + Math.random() * 40);
    }
    field.current?.focus({ preventScroll: true });
  };

  // the demo: write, send, again, until someone touches it
  const sendRef = useRef(send);
  const suggestRef = useRef(suggest);
  useEffect(() => {
    sendRef.current = send;
    suggestRef.current = suggest;
  });
  useEffect(() => {
    if (!autoplay || reduce) return;
    let live = true;
    (async () => {
      await sleep(1200);
      while (live && !touched.current) {
        await suggestRef.current(false); if (!live || touched.current) break;
        await sleep(700); if (!live || touched.current) break;
        state.current.hoverTo = 1; await sleep(500); if (!live || touched.current) break;
        press(true); await sleep(130); press(false);
        await sendRef.current();
        state.current.hoverTo = 0;
        await sleep(2400);
      }
    })();
    return () => { live = false; };
  }, [autoplay, reduce]);

  const icon = Math.round(D * 0.4), ring = Math.max(3, D * 0.056);
  const chrome = "linear-gradient(135deg, #f4f5fb 0%, #9ea3b6 22%, #ffffff 38%, #6d7183 55%, #e8e9f2 72%, #ffe3b8 84%, #bfc3d4 100%)";

  return (
    <div ref={wrap} className="w-full max-w-[720px] rounded-[28px] bg-[#222] px-4 pb-6 pt-5 sm:px-8" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif" }}>
      {/* the thread */}
      <div className="mx-auto flex min-h-[176px] max-w-[520px] flex-col items-end justify-end gap-2 pb-4" aria-live="polite">
        {msgs.length === 0 && <p className="m-0 self-center pb-6 text-[13px] text-white/30">Messages you send appear here.</p>}
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 44, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.96, transition: { duration: 0.25 } }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="max-w-[80%] rounded-[20px] p-px"
              style={{ background: chrome }}
            >
              <div className="rounded-[19px] bg-[linear-gradient(180deg,#2b2b2e,#111113)] px-4 py-2.5 text-[15px] leading-snug text-[#e9e9ee]">
                {m.file && <div className="mb-1 flex items-center gap-1.5 text-[12.5px] text-white/55"><Clip size={14} />{m.file}</div>}
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* the composer */}
      <form
        onSubmit={(e) => { e.preventDefault(); touched.current = true; send(); }}
        className="mx-auto flex max-w-[560px] items-center rounded-full bg-black"
        style={{ padding: Math.round(D * 0.13), paddingLeft: Math.round(D * 0.22), gap: Math.round(D * 0.1) }}
      >
        <input ref={picker} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f.name); e.target.value = ""; }} />
        <button type="button" onClick={() => { touched.current = true; picker.current?.click(); }} aria-label="Attach a file" className="grid shrink-0 place-items-center rounded-full text-[#7d7d80] outline-none transition-colors hover:text-[#b4b4b8] focus-visible:ring-2 focus-visible:ring-white/40" style={{ width: icon * 1.25, height: icon * 1.25 }}>
          <Clip size={icon} />
        </button>
        <button type="button" onClick={() => suggest(true)} aria-label="Suggest a message" className="grid shrink-0 place-items-center rounded-full text-[#7d7d80] outline-none transition-colors hover:text-[#b4b4b8] focus-visible:ring-2 focus-visible:ring-white/40" style={{ width: icon * 1.25, height: icon * 1.25 }}>
          <Sparkle size={icon} />
        </button>
        <div className="flex min-w-0 flex-1 flex-col justify-center px-1">
          <AnimatePresence>
            {file && (
              <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-0.5 flex min-w-0 items-center gap-1 text-[12px] text-white/55">
                <Clip size={12} /><span className="truncate">{file}</span>
                <button type="button" onClick={() => setFile(undefined)} aria-label="Remove attachment" className="ml-1 rounded px-1 text-white/40 outline-none hover:text-white/80 focus-visible:ring-1 focus-visible:ring-white/40">×</button>
              </motion.span>
            )}
          </AnimatePresence>
          <input
            ref={field}
            value={text}
            onChange={(e) => { touched.current = true; typing.current++; setText(e.target.value); }}
            placeholder={placeholder}
            aria-label={placeholder}
            className="w-full min-w-0 bg-transparent text-[16px] text-[#ececf0] caret-[#c9cbd8] outline-none placeholder:text-white/30"
          />
        </div>
        <motion.button
          type="submit"
          aria-label={phase === "sending" ? "Sending" : phase === "sent" ? "Sent" : "Send"}
          aria-disabled={!can}
          onPointerEnter={() => { state.current.hoverTo = 1; }}
          onPointerLeave={() => { state.current.hoverTo = 0; press(false); }}
          onPointerDown={() => { touched.current = true; if (can) press(true); }}
          onPointerUp={() => press(false)}
          onFocus={() => (state.current.hoverTo = 1)}
          onBlur={() => (state.current.hoverTo = 0)}
          whileTap={can ? { scale: 0.96 } : undefined}
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          className="relative grid shrink-0 place-items-center rounded-full outline-none focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,.35)]"
          style={{ width: D, height: D, cursor: can ? "pointer" : "default" }}
        >
          <span className="absolute rounded-full" style={{ inset: ring + 1, background: "radial-gradient(120% 95% at 50% -8%, #444446 0%, #232325 38%, #0b0b0c 70%, #050505 100%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.06), inset 0 -6px 14px rgba(0,0,0,.6)" }} />
          <canvas ref={cvs} aria-hidden className="pointer-events-none absolute" style={{ width: D + 4, height: D + 4, left: -2, top: -2, display: gl ? "block" : "none" }} />
          {!gl && <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full" style={{ background: chrome, WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring - 1}px))`, mask: `radial-gradient(farthest-side, transparent calc(100% - ${ring}px), #000 calc(100% - ${ring - 1}px))` }} />}
          <span className="relative grid place-items-center overflow-hidden" style={{ width: D * 0.42, height: D * 0.42 }}>
            <motion.svg animate={arrow} initial={{ y: 0, opacity: 1 }} viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke={can ? "#b9bac2" : "#6e6e73"} strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ transition: "stroke .3s" }}>
              <path d="M12 20V4.5M5.5 11 12 4.5 18.5 11" />
            </motion.svg>
            <AnimatePresence>
              {phase === "sent" && (
                <motion.svg key="ok" className="absolute inset-0" viewBox="0 0 24 24" fill="none" stroke="#e7e8f0" strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" aria-hidden initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.18 } }} transition={{ type: "spring", stiffness: 420, damping: 22 }}>
                  <motion.path d="M5.5 12.5 10 17 18.5 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} />
                </motion.svg>
              )}
            </AnimatePresence>
          </span>
        </motion.button>
      </form>
    </div>
  );
}

export default LiquidSend;
