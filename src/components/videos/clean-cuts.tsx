"use client";

import type { CSSProperties, ReactNode } from "react";
import { FONT, MONO, P, TEXT, clamp, ease, lerp, spring, type Frame, type VideoMeta } from "./kit";

export interface CleanCutsProps {
  install: string;
  search: string;
  caller: string;
  amount: string;
  phrase: string;
  name: string;
  tagline: string;
  url: string;
}

export const meta: VideoMeta<CleanCutsProps> = {
  id: "clean-cuts",
  title: "Clean Cuts",
  platforms: ["Reels", "X", "LinkedIn"],
  formats: ["1:1", "9:16", "4:5"],
  purpose: "Component showcase reel",
  motion: "Beat-cut macro shots of single components: shallow depth of field, a cursor that clicks, everything on white",
  app: "Nexus UI",
  duration: 15.3,
  bpm: 172,
  cuts: [0.3, 1.7, 3.09, 4.49, 5.88, 7.28, 8.67, 10.07, 11.46, 12.86],
  blurb:
    "A 15-second reel cut on the beat, one component per cut, shot like macro photography. Each one is an extreme close-up on white with shallow depth of field: the copy pill, a search field, a magnifying dock, an incoming-call island, a number wheel, a payment card, a text highlight, a folder that opens and a theme switch that flips the frame to dark for the end card. A cursor drives every shot.",
  defaults: {
    install: "npx shadcn add @nexus-labs/dock",
    search: "magnetic dock",
    caller: "Alex Rivera",
    amount: "$62.40",
    phrase: "motion is a material",
    name: "Nexus UI",
    tagline: "Components with the motion built in.",
    url: "nexus-ui.com",
  },
  fields: [
    { key: "install", label: "Install command", type: "text", max: 40 },
    { key: "search", label: "Search text", type: "text", max: 18 },
    { key: "caller", label: "Caller", type: "text", max: 16 },
    { key: "amount", label: "Amount", type: "text", max: 9 },
    { key: "phrase", label: "Highlighted phrase", type: "text", max: 24 },
    { key: "name", label: "Brand", type: "text", max: 12 },
    { key: "tagline", label: "Tagline", type: "text", max: 40 },
    { key: "url", label: "URL", type: "text", max: 24 },
  ],
};

/* ------------------------------------------------------------------ */

const abs: CSSProperties = { position: "absolute" };
const BPM = 172;
const BEAT = 60 / BPM;
const SHOT = BEAT * 4;
const T0 = 0.3;
const N_SHOTS = 9;
const END = T0 + N_SHOTS * SHOT;

/** Shallow depth of field: blurred copy + sharp copy masked around the focus point. */
function DOF({ fx, fy, r, blur = 10, children }: { fx: number; fy: number; r: number; blur?: number; children: ReactNode }) {
  const m = `radial-gradient(circle at ${fx}px ${fy}px, #000 ${r * 0.55}px, transparent ${r}px)`;
  return (
    <>
      <div style={{ ...abs, inset: 0, filter: `blur(${blur}px)` }}>{children}</div>
      <div style={{ ...abs, inset: 0, WebkitMaskImage: m, maskImage: m }}>{children}</div>
    </>
  );
}

function Arrow({ hand = false, down = false }: { hand?: boolean; down?: boolean }) {
  const s = down ? 0.86 : 1;
  return (
    <div style={{ transform: `scale(${s})`, transformOrigin: hand ? "38% 0" : "0 0", filter: "drop-shadow(0 4px 8px rgba(0,0,0,.28))" }}>
      {hand ? (
        <svg width={46} height={52} viewBox="0 0 23 26">
          <path d="M8 1.6c1 0 1.8.8 1.8 1.8v7.2l.5-.1V8.4c0-1 .8-1.7 1.7-1.7s1.7.8 1.7 1.7v2.2l.5.1V9.4c0-1 .8-1.7 1.7-1.7.9 0 1.7.8 1.7 1.7v1.9l.4.1c.2-.8.9-1.4 1.7-1.4 1 0 1.7.8 1.7 1.7v6.6c0 3.9-3 6.9-6.9 6.9h-1.6c-2.2 0-4.2-1-5.5-2.8L2.3 15c-.5-.8-.4-1.9.4-2.4.7-.5 1.7-.4 2.3.3l1.2 1.5V3.4C6.2 2.4 7 1.6 8 1.6Z" fill="#fff" stroke="#111" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width={40} height={56} viewBox="0 0 20 28">
          <path d="M1.5 1.5 L1.5 22 L6.6 17.4 L10.2 25.6 L13.6 24.1 L10.1 16.1 L17 16.1 Z" fill="#111" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

/** cursor path: keyframes [time, x, y]; eased between them */
function path(t: number, keys: [number, number, number][]): [number, number] {
  if (t <= keys[0][0]) return [keys[0][1], keys[0][2]];
  for (let i = 1; i < keys.length; i++) {
    const [a, x0, y0] = keys[i - 1];
    const [b, x1, y1] = keys[i];
    if (t <= b) {
      const p = ease.inOut(P(t, a, b));
      return [lerp(x0, x1, p), lerp(y0, y1, p)];
    }
  }
  const k = keys[keys.length - 1];
  return [k[1], k[2]];
}

/** stage backdrop for every shot */
function Backdrop({ glow, gx = 540, gy = 520, dark = 0 }: { glow: string; gx?: number; gy?: number; dark?: number }) {
  return (
    <>
      <div style={{ ...abs, left: -600, top: -900, right: -600, bottom: -900, background: "#f6f6f8" }} />
      <div style={{ ...abs, left: gx - 700, top: gy - 700, width: 1400, height: 1400, borderRadius: "50%", background: `radial-gradient(circle, ${glow} 0%, transparent 60%)` }} />
      <div style={{ ...abs, left: -600, right: -600, top: 860, bottom: -900, background: "linear-gradient(180deg, rgba(225,225,230,0) 0%, rgba(205,205,212,.9) 30%, #c9c9cf 100%)" }} />
      {dark > 0 && <div style={{ ...abs, left: -600, top: -900, right: -600, bottom: -900, background: "#000", opacity: dark }} />}
    </>
  );
}

/* ------------------------------------------------------------------ */

export default function CleanCuts({ t, w = 1080, h = 1080, ...props }: { t: number } & Frame & Partial<CleanCutsProps>) {
  const p = { ...meta.defaults, ...props };
  const u = (Math.min(w, h) / 1080) * (h > w * 1.3 ? 1.28 : h > w * 1.1 ? 1.1 : 1);
  const i = Math.floor((t - T0) / SHOT);
  const lt = t - T0 - i * SHOT;
  let body: ReactNode = null;
  if (t >= T0 && i < N_SHOTS) {
    const enter = ease.out(clamp(lt / 0.22));
    const leave = ease.in(clamp((lt - (SHOT - 0.1)) / 0.1));
    const sc = lerp(1.12, 1, enter) * (1 + leave * 0.12);
    const bl = (1 - enter) * 14 + leave * 12;
    const Shot = SHOTS[i];
    body = (
      <div style={{ ...abs, inset: 0, transform: `scale(${sc})`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined }}>
        <Shot t={lt} p={p} />
      </div>
    );
  }
  const endT = t - END;
  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, overflow: "hidden", background: endT >= 0 ? "#000" : "#f6f6f8", fontFamily: FONT }}>
      <div style={{ ...abs, left: w / 2 - 540, top: h / 2 - 540, width: 1080, height: 1080, transform: `scale(${u})`, transformOrigin: "50% 50%" }}>
        {body}
        {endT >= 0 && <EndCard t={endT} p={p} />}
      </div>
      {/* the switch's dark circle needs the full frame */}
      {i === 8 && <SwitchDark t={lt} w={w} h={h} u={u} />}
      {t < T0 && <div style={{ ...abs, inset: 0, background: "#f6f6f8" }} />}
      <div style={{ ...abs, inset: 0, background: "#000", opacity: P(t, 15.0, 15.3) }} />
    </div>
  );
}

type ST = { t: number; p: CleanCutsProps };

/* 1 — copy pill -------------------------------------------------------- */
function CopyPill({ t, p }: ST) {
  const click = 0.78;
  const done = ease.inOut(P(t, click + 0.02, click + 0.28));
  const [cx, cy] = path(t, [[0, 980, 820], [0.7, 836, 548]]);
  const cam = 1.55 + t * 0.12;
  const fx = lerp(560, 800, ease.inOut(P(t, 0.05, 0.6)));
  const bounce = t > click ? Math.sin((t - click) * 22) * Math.exp(-(t - click) * 8) * 0.03 : 0;
  const content = (
    <>
      <Backdrop glow={done > 0 ? "rgba(48,209,88,.16)" : "rgba(10,132,255,.1)"} />
      <div style={{ ...abs, left: 120, top: 480, width: 840, height: 124, borderRadius: 62, background: "#1d1d1f", boxShadow: "0 30px 60px -28px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)", display: "flex", alignItems: "center", padding: "0 18px 0 46px", transform: `scale(${1 + bounce})` }}>
        <span style={{ fontFamily: MONO, fontSize: 30, color: "#8e8e93", marginRight: 16 }}>$</span>
        <span style={{ fontFamily: MONO, fontSize: 30, color: "#f5f5f7", whiteSpace: "nowrap", flex: 1, overflow: "hidden" }}>{p.install}</span>
        <div style={{ height: 88, padding: "0 30px", borderRadius: 44, display: "flex", alignItems: "center", gap: 12, fontFamily: TEXT, fontWeight: 600, fontSize: 28, color: done > 0.5 ? "#fff" : "#1d1d1f", background: done > 0 ? `rgb(${lerp(255, 48, done)},${lerp(255, 209, done)},${lerp(255, 88, done)})` : "#fff", transform: `scale(${t > click && t < click + 0.12 ? 0.92 : 1})` }}>
          {done > 0.5 && <svg width={26} height={26} viewBox="0 0 20 20" style={{ transform: `scale(${spring(t - click - 0.12, 0.45, 14)})` }}><path d="M4 10.5l4 4 8-9" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          {done > 0.5 ? "Copied" : "Copy"}
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy }}><Arrow hand={t > 0.45} down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${cam})`, transformOrigin: `${lerp(640, 760, P(t, 0, 1.4))}px 540px` }}>
      <DOF fx={fx} fy={542} r={330} blur={9}>{content}</DOF>
    </div>
  );
}

/* 2 — search field ----------------------------------------------------- */
function Search({ t, p }: ST) {
  const typed = Math.floor(clamp((t - 0.12) / 0.6) * p.search.length);
  const click = 0.98;
  const sent = t > click;
  const [cx, cy] = path(t, [[0.4, 1000, 800], [0.92, 885, 560]]);
  const fx = lerp(420, 860, ease.inOut(P(t, 0.55, 0.95)));
  const sweep = ((t - click) * 1.6) % 1;
  const content = (
    <>
      <Backdrop glow="rgba(80,190,255,.22)" gx={860} />
      <div style={{ ...abs, left: 110, top: 470, width: 860, height: 140, borderRadius: 70, background: "linear-gradient(180deg,#f3f3f5,#ececef)", boxShadow: "inset 0 2px 6px rgba(0,0,0,.06), 0 30px 60px -36px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.04)", display: "flex", alignItems: "center", padding: "0 18px 0 56px" }}>
        <span style={{ flex: 1, fontFamily: FONT, fontSize: 52, fontWeight: 500, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: sent ? "transparent" : "#1d1d1f", ...(sent ? { backgroundImage: `linear-gradient(90deg,#b8b8bf ${sweep * 140 - 40}%,#5a5a62 ${sweep * 140 - 20}%,#b8b8bf ${sweep * 140}%)`, WebkitBackgroundClip: "text", backgroundClip: "text" } : {}) }}>
          {sent ? "Searching…" : p.search.slice(0, typed)}
          {!sent && <span style={{ display: "inline-block", width: 3, height: 50, marginLeft: 3, verticalAlign: "-8px", background: "#0a84ff", opacity: Math.floor(t * 4) % 2 ? 1 : 0.15 }} />}
        </span>
        <div style={{ width: 104, height: 104, borderRadius: 52, background: "radial-gradient(circle at 35% 30%, #c8f0ff, #5cc8ff 55%, #2fa8f5)", boxShadow: `0 0 ${40 + (sent ? 30 : 0)}px rgba(60,180,255,.65), inset 0 2px 0 rgba(255,255,255,.7)`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t > click && t < click + 0.12 ? 0.9 : 1})` }}>
          <svg width={44} height={44} viewBox="0 0 30 30"><path d="M15 24 V7 M8 13 L15 6 L22 13" stroke="#fff" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy }}><Arrow hand={t > 0.8} down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.5 + t * 0.15})`, transformOrigin: `${lerp(560, 820, ease.inOut(P(t, 0.5, 1.1)))}px 540px` }}>
      <DOF fx={fx} fy={540} r={300} blur={10}>{content}</DOF>
    </div>
  );
}

/* 3 — dock ------------------------------------------------------------- */
const DOCK = [
  ["#3ea2ff", "#0a6cff", "home"], ["#5ac8fa", "#147efb", "mail"], ["#ffe066", "#ffb300", "notes"], ["#ff5f6d", "#ff2d55", "music"],
  ["#c7f464", "#34c759", "maps"], ["#b4b4bb", "#6e6e73", "gear"], ["#bf8bff", "#7a5af8", "spark"],
];
function Glyph({ k }: { k: string }) {
  const s = { stroke: "#fff", strokeWidth: 3, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (k === "home") return <path d="M8 21 L20 10 L32 21 V31 H8Z" {...s} />;
  if (k === "mail") return <><rect x="7" y="11" width="26" height="18" rx="3" {...s} /><path d="M8 13 L20 22 L32 13" {...s} /></>;
  if (k === "notes") return <path d="M11 13 H29 M11 20 H29 M11 27 H22" {...s} />;
  if (k === "music") return <path d="M16 28 V12 L29 9 V25 M16 28a3.5 3.5 0 1 1-3.5-3.5A3.5 3.5 0 0 1 16 28Zm13-3a3.5 3.5 0 1 1-3.5-3.5A3.5 3.5 0 0 1 29 25Z" {...s} />;
  if (k === "maps") return <path d="M20 31s-8-8-8-14a8 8 0 0 1 16 0c0 6-8 14-8 14Zm0-11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" {...s} />;
  if (k === "gear") return <><circle cx="20" cy="20" r="5" {...s} /><path d="M20 8v4M20 28v4M8 20h4M28 20h4M11.5 11.5l3 3M25.5 25.5l3 3M11.5 28.5l3-3M25.5 14.5l3-3" {...s} /></>;
  return <path d="M20 8 L22.5 17.5 L32 20 L22.5 22.5 L20 32 L17.5 22.5 L8 20 L17.5 17.5Z" {...s} />;
}
function Dock({ t }: ST) {
  const [cx, cy] = path(t, [[0, 120, 700], [0.95, 790, 600]]);
  const click = 1.0;
  const n = DOCK.length;
  const base = 104;
  const gap = 18;
  const x0 = 540 - (n * base + (n - 1) * gap) / 2;
  const focusX = cx;
  const content = (
    <>
      <Backdrop glow="rgba(10,132,255,.14)" gy={600} />
      <div style={{ ...abs, left: x0 - 26, top: 560, width: n * base + (n - 1) * gap + 52, height: 140, borderRadius: 40, background: "rgba(255,255,255,.62)", boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 30px 60px -30px rgba(0,0,0,.35), inset 0 1px 0 #fff" }} />
      {DOCK.map(([a, b, k], j) => {
        const ix = x0 + j * (base + gap) + base / 2;
        const d = (ix - focusX) / 120;
        const mag = 1 + 0.62 * Math.exp(-d * d);
        const hop = j === 5 && t > click ? Math.abs(Math.sin((t - click) * 9)) * Math.exp(-(t - click) * 2.2) * 60 : 0;
        return (
          <div key={k} style={{ ...abs, left: ix - base / 2, top: 578 - (mag - 1) * 60 - hop, width: base, height: base, borderRadius: 26, background: `linear-gradient(160deg,${a},${b})`, boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 10px 20px -10px rgba(0,0,0,.4)", transform: `scale(${mag})`, transformOrigin: "50% 100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width={64} height={64} viewBox="0 0 40 40"><Glyph k={k} /></svg>
          </div>
        );
      })}
      {t > click + 0.15 && <div style={{ ...abs, left: x0 + 5 * (base + gap) + base / 2 - 5, top: 708, width: 10, height: 10, borderRadius: 5, background: "#1d1d1f", opacity: P(t, click + 0.15, click + 0.3) }} />}
      <div style={{ ...abs, left: cx, top: cy }}><Arrow down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.25 + t * 0.12})`, transformOrigin: `${cx}px 600px` }}>
      <DOF fx={focusX} fy={600} r={340} blur={9}>{content}</DOF>
    </div>
  );
}

/* 4 — call island ------------------------------------------------------ */
function Island({ t, p }: ST) {
  const open = spring(t - 0.08, 0.6, 9);
  const click = 0.82;
  const live = ease.inOut(P(t, click + 0.05, click + 0.4));
  const W = lerp(220, 700, open) - live * 160;
  const H = lerp(64, 132, open) - live * 30;
  const [cx, cy] = path(t, [[0.3, 1000, 820], [0.78, 850, 560]]);
  const ring = (t * 1.6) % 1;
  const secs = Math.max(0, Math.floor((t - click - 0.3) * 1 + 1));
  const content = (
    <>
      <Backdrop glow={live > 0.5 ? "rgba(48,209,88,.16)" : "rgba(0,0,0,.06)"} />
      <div style={{ ...abs, left: 540 - W / 2, top: 540 - H / 2, width: W, height: H, borderRadius: H / 2, background: "#000", boxShadow: "0 30px 60px -26px rgba(0,0,0,.6)", overflow: "hidden" }}>
        <div style={{ ...abs, left: 22, top: H / 2 - 44, width: 88, height: 88, borderRadius: 44, background: "linear-gradient(140deg,#8e7bff,#5b44f2)", color: "#fff", fontFamily: TEXT, fontWeight: 600, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(open * 2 - 1), transform: `scale(${1 - live * 0.3})` }}>{p.caller.split(" ").map((x) => x[0]).join("")}</div>
        <div style={{ ...abs, left: 130, top: H / 2 - 34, opacity: clamp(open * 2 - 1) * (1 - live), fontFamily: TEXT }}>
          <div style={{ fontSize: 22, color: "#8e8e93" }}>Incoming call</div>
          <div style={{ fontSize: 34, fontWeight: 600, color: "#fff", marginTop: 2 }}>{p.caller}</div>
        </div>
        {[["#ff3b30", 135], ["#30d158", 0]].map(([c, rot], k) => (
          <div key={k} style={{ ...abs, left: W - 22 - 92 - (1 - k) * 108, top: H / 2 - 46, width: 92, height: 92, borderRadius: 46, background: c as string, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp(open * 2 - 1) * (1 - live), transform: `scale(${k === 1 && t > click && t < click + 0.12 ? 0.9 : 1})`, boxShadow: k === 1 ? `0 0 0 ${ring * 16}px rgba(48,209,88,${0.4 * (1 - ring)})` : undefined }}>
            <svg width={40} height={40} viewBox="0 0 24 24" style={{ transform: `rotate(${rot}deg)` }}><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z" fill="#fff" /></svg>
          </div>
        ))}
        <div style={{ ...abs, left: 130, top: H / 2 - 22, display: "flex", alignItems: "center", gap: 14, opacity: live, fontFamily: TEXT }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: "#30d158" }} />
          <span style={{ fontSize: 34, fontWeight: 600, color: "#30d158", fontVariantNumeric: "tabular-nums" }}>0:{String(secs).padStart(2, "0")}</span>
        </div>
        <div style={{ ...abs, right: 40, top: H / 2 - 22, display: "flex", gap: 6, alignItems: "center", height: 44, opacity: live }}>
          {Array.from({ length: 7 }, (_, k) => <span key={k} style={{ width: 6, borderRadius: 3, background: "#30d158", height: 10 + Math.abs(Math.sin(t * 9 + k * 1.3)) * 30 }} />)}
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy, opacity: 1 - live }}><Arrow hand={t > 0.55} down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.45 + t * 0.1})`, transformOrigin: `${lerp(700, 560, live)}px 540px` }}>
      <DOF fx={lerp(800, 560, live)} fy={540} r={320} blur={8}>{content}</DOF>
    </div>
  );
}

/* 5 — number wheel ----------------------------------------------------- */
function Wheel({ t }: ST) {
  const steps = 5;
  const prog = ease.inOut(P(t, 0.18, 1.0)) * steps;
  const centre = 7 + prog;
  const caps = [-1, 0, 1];
  const content = (
    <>
      <Backdrop glow="rgba(255,70,90,.2)" />
      <svg width={30} height={22} viewBox="0 0 30 22" style={{ ...abs, left: 525, top: 350 }}><path d="M2 2 H28 L15 20Z" fill="#3a3a3c" /></svg>
      {caps.map((k) => {
        const big = k === 0;
        const cw = big ? 170 : 150;
        const ch = big ? 250 : 210;
        const x = 540 + k * 210 - cw / 2;
        return (
          <div key={k} style={{ ...abs, left: x, top: 540 - ch / 2, width: cw, height: ch, borderRadius: cw / 2, background: "#fff", boxShadow: big ? "0 0 0 1px rgba(255,59,80,.12), 0 0 60px rgba(255,59,80,.25), 0 30px 50px -30px rgba(0,0,0,.3)" : "0 0 0 1px rgba(255,59,80,.08), 0 0 40px rgba(255,59,80,.14)", overflow: "hidden" }}>
            {big ? (
              <div style={{ ...abs, left: cw / 2 - 66, top: ch / 2 - 66, width: 132, height: 132, borderRadius: "50%", overflow: "hidden", background: "radial-gradient(circle at 35% 30%, #ff7a8a, #e8213f 60%, #b5122c)", boxShadow: "inset 0 3px 0 rgba(255,255,255,.35), 0 10px 20px -8px rgba(232,33,63,.6)" }}>
                {[-1, 0, 1].map((o) => {
                  const v = Math.floor(centre) + o;
                  const off = (o - (centre - Math.floor(centre))) * 132;
                  return <div key={o} style={{ ...abs, left: 0, right: 0, top: off, height: 132, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 600, fontSize: 52, color: "#fff" }}>{v}</div>;
                })}
              </div>
            ) : (
              [-1, 0, 1].map((o) => {
                const v = Math.floor(centre) + k + o;
                const off = (o - (centre - Math.floor(centre))) * ch * 0.75;
                return (
                  <div key={o} style={{ ...abs, left: cw / 2 - 50, top: ch / 2 - 50 + off, width: 100, height: 100, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 600, fontSize: 40, color: "rgba(255,59,80,.45)", boxShadow: "inset 0 0 0 2px rgba(255,59,80,.12)" }}>{v}</div>
                );
              })
            )}
          </div>
        );
      })}
      <div style={{ ...abs, left: 532, top: 700, width: 16, height: 16, borderRadius: 8, background: "#ff3b50" }} />
      <div style={{ ...abs, left: 0, right: 0, top: 740, textAlign: "center", fontFamily: TEXT, fontSize: 26, color: "#8e8e93" }}>seats</div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.25 + t * 0.12})`, transformOrigin: "540px 540px" }}>
      <DOF fx={540} fy={540} r={260} blur={7}>{content}</DOF>
    </div>
  );
}

/* 6 — payment card ----------------------------------------------------- */
function Pay({ t, p }: ST) {
  const click = 0.8;
  const ok = ease.inOut(P(t, click + 0.04, click + 0.3));
  const [cx, cy] = path(t, [[0.2, 980, 900], [0.75, 790, 735]]);
  const fy = lerp(470, 710, ease.inOut(P(t, 0.35, 0.8)));
  const content = (
    <>
      <Backdrop glow={ok > 0.5 ? "rgba(48,209,88,.16)" : "rgba(175,82,222,.12)"} />
      <div style={{ ...abs, left: 260, top: 330, width: 560, height: 440, borderRadius: 40, background: "#fff", boxShadow: "0 40px 80px -40px rgba(0,0,0,.35), 0 0 0 1px rgba(0,0,0,.04)", fontFamily: TEXT }}>
        <div style={{ ...abs, left: 48, top: 48, fontFamily: FONT, fontSize: 84, fontWeight: 700, letterSpacing: "-0.04em", color: "#1d1d1f" }}>{p.amount}</div>
        <div style={{ ...abs, right: 48, top: 64, display: "flex" }}>
          <span style={{ width: 64, height: 64, borderRadius: 32, background: "linear-gradient(140deg,#d16cff,#8e44ad)", boxShadow: "0 0 0 4px #fff" }} />
          <span style={{ width: 64, height: 64, borderRadius: 32, marginLeft: -20, background: "linear-gradient(140deg,#c8e66b,#7fb800)", boxShadow: "0 0 0 4px #fff" }} />
        </div>
        <div style={{ ...abs, left: 48, top: 170, fontSize: 30, color: "#1d1d1f" }}><b style={{ fontWeight: 600 }}>you</b> paid <b style={{ fontWeight: 600 }}>Maya</b></div>
        <div style={{ ...abs, left: 48, top: 214, fontSize: 26, color: "#8e8e93", fontStyle: "italic" }}>“concert tickets”</div>
        <div style={{ ...abs, left: 32, right: 32, bottom: 34, height: 96, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ width: 84, height: 84, borderRadius: 42, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 0 2px #f1f1f3", opacity: 1 - ok }}><svg width={30} height={30} viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="#ff3b30" strokeWidth={2.6} strokeLinecap="round" /></svg></span>
          <span style={{ fontSize: 28, color: ok > 0.5 ? "#1f9d47" : "#8e8e93", fontWeight: ok > 0.5 ? 600 : 400 }}>{ok > 0.5 ? `Approved $320` : "Approve $320"}</span>
          <span style={{ width: 84, height: 84, borderRadius: 42, display: "flex", alignItems: "center", justifyContent: "center", background: ok > 0 ? `rgba(48,209,88,${ok})` : "transparent", boxShadow: `inset 0 0 0 2px ${ok > 0 ? "transparent" : "#f1f1f3"}, 0 0 0 ${P(t, click, click + 0.5) * 30}px rgba(48,209,88,${0.35 * (1 - P(t, click, click + 0.5))})`, transform: `scale(${t > click && t < click + 0.12 ? 0.9 : 1})` }}>
            <svg width={34} height={34} viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9" stroke={ok > 0.5 ? "#fff" : "#30d158"} strokeWidth={2.8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy }}><Arrow hand={t > 0.55} down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.3 + t * 0.12})`, transformOrigin: `${lerp(480, 680, P(t, 0.3, 0.9))}px ${fy}px` }}>
      <DOF fx={lerp(400, 700, P(t, 0.3, 0.85))} fy={fy} r={320} blur={8}>{content}</DOF>
    </div>
  );
}

/* 7 — highlight -------------------------------------------------------- */
const LINES = [
  "The morning sky was painted with soft shades of",
  "A small bird landed quietly on the window and looked",
  "Somewhere nearby, a bicycle bell rang through the",
  "I wondered what adventures the day might bring.",
  "A warm cup of tea sat beside an unfinished book.",
  "The wind moved gently through the trees, carrying",
  "People hurried along the road, each lost in their own",
];
function Highlight({ t, p }: ST) {
  const sel = ease.inOut(P(t, 0.3, 0.95));
  const first = `${p.phrase}`;
  const [cx, cy] = path(t, [[0, 520, 700], [0.3, 248, 452], [0.95, 248 + first.length * 20.5, 452]]);
  const content = (
    <>
      <Backdrop glow="rgba(10,132,255,.08)" />
      <div style={{ ...abs, left: 150, top: 180, width: 1000, height: 820, borderRadius: 56, background: "#fbfbfc", boxShadow: "0 0 0 1px rgba(0,0,0,.05), 0 50px 90px -50px rgba(0,0,0,.35)" }}>
        <div style={{ ...abs, left: 56, top: 50, display: "flex", gap: 22 }}>
          {[["#ff5f57", "×"], ["#febc2e", "–"], ["#28c840", "⤢"]].map(([c, g]) => <span key={c} style={{ width: 66, height: 66, borderRadius: 33, background: c, color: "rgba(0,0,0,.45)", fontSize: 34, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 -3px 0 rgba(0,0,0,.08)" }}>{g}</span>)}
        </div>
        <div style={{ ...abs, left: 330, top: 46, width: 560, height: 74, borderRadius: 37, background: "#f1f1f3", boxShadow: "inset 0 1px 3px rgba(0,0,0,.06)" }} />
        <div style={{ ...abs, left: 70, top: 190, fontFamily: TEXT, fontSize: 34, lineHeight: "62px", color: "#b9b9bf", whiteSpace: "nowrap" }}>
          <div>
            <span style={{ position: "relative", color: sel > 0.05 ? "#1d1d1f" : "#b9b9bf" }}>
              <span style={{ ...abs, left: -4, top: 8, bottom: 8, width: `calc(${sel * 100}% + 8px)`, background: "rgba(10,132,255,.22)", borderRadius: 6 }} />
              <span style={{ position: "relative" }}>{first}</span>
            </span>{" "}with soft shades
          </div>
          {LINES.slice(1).map((l) => <div key={l}>{l}</div>)}
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy }}>
        <svg width={18} height={52} viewBox="0 0 9 26" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,.3))" }}><path d="M1 1h7M1 25h7M4.5 1v24" stroke="#111" strokeWidth={1.6} /></svg>
      </div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.35 + t * 0.1})`, transformOrigin: "330px 420px" }}>
      <DOF fx={lerp(300, 440, sel)} fy={440} r={360} blur={7}>{content}</DOF>
    </div>
  );
}

/* 8 — folder ----------------------------------------------------------- */
function Folder({ t }: ST) {
  const hover = ease.inOut(P(t, 0.25, 0.55));
  const [cx, cy] = path(t, [[0, 960, 900], [0.4, 640, 700]]);
  const files = [
    { c: "#fff", x: -110, r: -12, d: 0.42, k: "doc" },
    { c: "linear-gradient(140deg,#ffb36b,#ff5ea8 60%,#7b6cff)", x: 0, r: 2, d: 0.5, k: "img" },
    { c: "#fff", x: 110, r: 12, d: 0.58, k: "chart" },
  ];
  const content = (
    <>
      <Backdrop glow="rgba(10,132,255,.16)" />
      {/* back panel */}
      <div style={{ ...abs, left: 300, top: 360, width: 480, height: 360, borderRadius: 30, background: "linear-gradient(180deg,#4fa3ff,#2f86f5)" }}>
        <div style={{ ...abs, left: 0, top: -34, width: 190, height: 60, borderRadius: "22px 22px 0 0", background: "#4fa3ff" }} />
      </div>
      {files.map((f, j) => {
        const s = spring(t - f.d, 0.55, 10) * hover;
        return (
          <div key={j} style={{ ...abs, left: 540 - 95 + f.x * s, top: 430 - s * 150, width: 190, height: 240, borderRadius: 18, background: f.c, boxShadow: "0 14px 30px -14px rgba(0,0,0,.4)", transform: `rotate(${f.r * s}deg)`, padding: 20 }}>
            {f.k === "doc" && [80, 120, 100, 130, 70].map((wd, q) => <div key={q} style={{ width: wd, height: 9, borderRadius: 5, background: q ? "#e5e5ea" : "#1d1d1f", marginBottom: 14 }} />)}
            {f.k === "chart" && <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 190 }}>{[60, 110, 80, 150, 120].map((hh, q) => <span key={q} style={{ width: 20, height: hh * s, borderRadius: 6, background: q === 3 ? "#34c759" : "#a7e3b5" }} />)}</div>}
          </div>
        );
      })}
      {/* front panel tilts open */}
      <div style={{ ...abs, left: 300, top: 420, width: 480, height: 300, borderRadius: 30, background: "linear-gradient(180deg,#6cb6ff,#2a7bf0)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.5), 0 30px 50px -30px rgba(0,0,0,.4)", transform: `perspective(900px) rotateX(${-hover * 24}deg)`, transformOrigin: "50% 100%", fontFamily: TEXT, color: "#fff" }}>
        <div style={{ ...abs, left: 34, bottom: 34 }}>
          <div style={{ fontSize: 34, fontWeight: 600 }}>Brand assets</div>
          <div style={{ fontSize: 24, opacity: 0.8, marginTop: 4 }}>24 files · Updated today</div>
        </div>
      </div>
      <div style={{ ...abs, left: cx, top: cy }}><Arrow /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.25 + t * 0.12})`, transformOrigin: "540px 520px" }}>
      <DOF fx={540} fy={lerp(560, 420, hover)} r={340} blur={8}>{content}</DOF>
    </div>
  );
}

/* 9 — theme switch ----------------------------------------------------- */
const SW = { x: 540, y: 540, w: 420, h: 252 };
function swState(t: number) {
  const click = 0.5;
  const flip = ease.inOut(P(t, click, click + 0.32));
  const knob = SW.x - SW.w / 2 + SW.h / 2 + flip * (SW.w - SW.h);
  return { click, flip, knob };
}
function Switch({ t }: ST) {
  const { click, flip, knob } = swState(t);
  const [cx, cy] = path(t, [[0, 900, 900], [0.42, knob + 30, SW.y + 20]]);
  const stretch = Math.sin(flip * Math.PI) * 70;
  const content = (
    <>
      <Backdrop glow="rgba(48,209,88,.14)" />
      <div style={{ ...abs, left: SW.x - SW.w / 2, top: SW.y - SW.h / 2, width: SW.w, height: SW.h, borderRadius: SW.h / 2, background: flip > 0.5 ? "#30d158" : "#e5e5ea", transition: "none", boxShadow: "inset 0 2px 6px rgba(0,0,0,.08)" }} />
      <div style={{ ...abs, left: knob - SW.h * 0.44 - (flip < 0.5 ? 0 : stretch), top: SW.y - SW.h * 0.44, width: SW.h * 0.88 + stretch, height: SW.h * 0.88, borderRadius: SW.h, background: "#fff", boxShadow: "0 10px 24px rgba(0,0,0,.2), 0 0 0 1px rgba(0,0,0,.04)" }} />
      <div style={{ ...abs, left: cx, top: cy }}><Arrow hand down={t > click && t < click + 0.12} /></div>
    </>
  );
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1.3 + t * 0.1})`, transformOrigin: "540px 540px" }}>
      <DOF fx={540} fy={540} r={330} blur={7}>{content}</DOF>
    </div>
  );
}
/** the dark circle growing out of the knob over the full frame */
function SwitchDark({ t, w, h, u }: { t: number; w: number; h: number; u: number }) {
  const { click, knob } = swState(t);
  const g = ease.in(P(t, click + 0.25, SHOT - 0.05));
  if (g <= 0) return null;
  const sc = (1.3 + t * 0.1) * u;
  const kx = w / 2 + (knob - 540) * sc;
  const ky = h / 2;
  const R = Math.hypot(w, h) * g;
  return <div style={{ ...abs, inset: 0, background: "#000", clipPath: `circle(${R}px at ${kx}px ${ky}px)` }} />;
}

/* end card ------------------------------------------------------------- */
function EndCard({ t, p }: { t: number; p: CleanCutsProps }) {
  const draw = ease.inOut(P(t, 0.05, 0.6));
  const node = spring(t - 0.05, 0.5, 11);
  const name = ease.expo(P(t, 0.45, 1.0));
  const tag = ease.expo(P(t, 0.8, 1.35));
  const A = [-90, 150, 30].map((d) => (d * Math.PI) / 180);
  return (
    <>
      <div style={{ ...abs, left: -400, top: -400, width: 1880, height: 1880, background: "radial-gradient(circle at 50% 46%, rgba(70,100,255,.22), transparent 45%)" }} />
      <svg width={220} height={220} viewBox="-100 -100 200 200" style={{ ...abs, left: 430, top: 250, overflow: "visible", filter: "drop-shadow(0 0 24px rgba(125,150,255,.6))" }}>
        {A.map((a, i) => (
          <g key={i}>
            <line x1={0} y1={0} x2={Math.cos(a) * 62 * draw} y2={Math.sin(a) * 62 * draw} stroke="#f4f1ea" strokeWidth={9} strokeLinecap="round" />
            <circle cx={Math.cos(a) * 62} cy={Math.sin(a) * 62} r={12 * spring(t - 0.45 - i * 0.06, 0.45, 13)} fill="#f4f1ea" />
          </g>
        ))}
        <circle r={16 * node} fill="#7d96ff" />
      </svg>
      <div style={{ ...abs, left: 0, right: 0, top: 520, textAlign: "center", fontFamily: FONT, fontSize: 120, fontWeight: 700, letterSpacing: "-0.045em", color: "#f5f5f7", opacity: name, transform: `translateY(${(1 - name) * 30}px)`, filter: `blur(${(1 - name) * 12}px)` }}>{p.name}</div>
      <div style={{ ...abs, left: 0, right: 0, top: 680, textAlign: "center", fontFamily: TEXT, fontSize: 36, color: "#a1a1a6", opacity: tag, transform: `translateY(${(1 - tag) * 18}px)` }}>{p.tagline}</div>
      <div style={{ ...abs, left: 0, right: 0, top: 750, textAlign: "center", fontFamily: TEXT, fontSize: 34, fontWeight: 500, color: "#2997ff", opacity: tag }}>{p.url}</div>
    </>
  );
}

const SHOTS = [CopyPill, Search, Dock, Island, Wheel, Pay, Highlight, Folder, Switch];
