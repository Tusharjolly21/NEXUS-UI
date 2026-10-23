"use client";

import type { CSSProperties, ReactNode } from "react";
import { FONT, P, TEXT, clamp, ease, lerp, rand, spring, type Frame, type VideoMeta } from "./kit";

export interface GlassOrbitProps {
  name: string;
  sub: string;
  menu: string;
  drum: string;
  hub: string;
  end1: string;
  end2: string;
  chip: string;
  url: string;
  blue: string;
}

export const meta: VideoMeta<GlassOrbitProps> = {
  id: "glass-orbit",
  title: "Glass Orbit",
  platforms: ["Instagram carousel", "Reels", "LinkedIn"],
  formats: ["4:5", "9:16", "1:1"],
  purpose: "Brand identity reveal / carousel",
  motion: "Deep-navy brand reveal: a blue orb uncovers the name, a glass app icon drives a menu, a 3D word drum spins and glass icons orbit",
  app: "Nexus UI",
  duration: 24.6,
  bpm: 100,
  cuts: [0.3, 2.5, 3.3, 7.2, 15.6, 21.0],
  dark: true,
  blurb:
    "A brand-identity piece in four chapters, built to post as one video or cut into a carousel. On deep navy with a dot grid, a glowing blue orb sweeps across and uncovers the name, a cursor taps it, the letters glitch and collapse into a glass app icon that drives a menu. Then a 3D drum of words spins behind a ribbon of blue light, glass icons orbit a label in depth, and it closes on \"Let's make it move.\"",
  defaults: {
    name: "Nexus UI",
    sub: "Nexus UI — Component Library",
    menu: "Components|Blocks|Templates|Videos|Sounds",
    drum: "Springs|Gestures|Layout|Scroll|Hover|Physics|Sound",
    hub: "Components",
    end1: "LET'S MAKE IT",
    end2: "MOVE.",
    chip: "next launch",
    url: "nexus-ui.com",
    blue: "#2f6bff",
  },
  fields: [
    { key: "name", label: "Name", type: "text", max: 12 },
    { key: "sub", label: "Header line", type: "text", max: 40 },
    { key: "menu", label: "Menu items (| between)", type: "text", max: 80 },
    { key: "drum", label: "Drum words (| between)", type: "text", max: 90 },
    { key: "hub", label: "Orbit label", type: "text", max: 14 },
    { key: "end1", label: "Closing line 1", type: "text", max: 16 },
    { key: "end2", label: "Closing line 2 (blue)", type: "text", max: 10 },
    { key: "chip", label: "Typed chip", type: "text", max: 16 },
    { key: "url", label: "URL", type: "text", max: 24 },
    { key: "blue", label: "Blue", type: "color" },
  ],
};

const abs: CSSProperties = { position: "absolute" };
const FR = (t: number) => Math.floor(t * 30);

function Grid({ w, h }: { w: number; h: number }) {
  const m = "radial-gradient(ellipse at 50% 50%, #000 20%, transparent 75%)";
  return <div style={{ ...abs, inset: 0, backgroundImage: "radial-gradient(rgba(150,175,255,.22) 1.4px, transparent 1.6px)", backgroundSize: "34px 34px", WebkitMaskImage: m, maskImage: m, opacity: 0.7, width: w, height: h }} />;
}

function Orb({ x, y, r, blue, o = 1 }: { x: number; y: number; r: number; blue: string; o?: number }) {
  return (
    <div style={{ ...abs, left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", opacity: o, background: `radial-gradient(circle at 42% 40%, #bcd3ff 0%, #5d8dff 14%, ${blue} 32%, rgba(20,50,200,.55) 52%, rgba(10,30,120,.0) 70%)`, filter: `blur(${r * 0.04}px)` }} />
  );
}

/** the Nexus mark, white spokes and a blue node */
function Mark({ size, blue }: { size: number; blue: string }) {
  const A = [-90, 150, 30].map((d) => (d * Math.PI) / 180);
  return (
    <svg width={size} height={size} viewBox="-100 -100 200 200">
      {A.map((a, i) => <line key={i} x1={0} y1={0} x2={Math.cos(a) * 58} y2={Math.sin(a) * 58} stroke="#eef2ff" strokeWidth={11} strokeLinecap="round" />)}
      {A.map((a, i) => <circle key={`e${i}`} cx={Math.cos(a) * 58} cy={Math.sin(a) * 58} r={14} fill="#eef2ff" />)}
      <circle r={18} fill={blue} />
    </svg>
  );
}

function GlassIcon({ size, blue, children, glow = 1 }: { size: number; blue: string; children: ReactNode; glow?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ ...abs, left: -size * 0.6, top: -size * 0.6, width: size * 2.2, height: size * 2.2, borderRadius: "50%", background: `radial-gradient(circle, ${blue}cc 0%, ${blue}55 30%, transparent 62%)`, opacity: glow }} />
      <div style={{ ...abs, inset: 0, borderRadius: size * 0.27, background: "linear-gradient(160deg, rgba(60,75,110,.9), rgba(14,20,38,.95))", boxShadow: `inset 0 1px 0 rgba(255,255,255,.25), inset 0 0 0 1.5px rgba(150,180,255,.25), 0 0 ${size * 0.25}px ${blue}66, 0 ${size * 0.12}px ${size * 0.3}px rgba(0,0,0,.6)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
}

function Glyph({ k, s }: { k: number; s: number }) {
  const st = { stroke: "#eef2ff", strokeWidth: 2.4, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const g = [
    <path key="c" d="M7 5 L7 24 L12 19.5 L15.5 27 L19 25.5 L15.6 18 L22 18 Z" fill="#eef2ff" />,
    <><rect x="4" y="10" width="24" height="13" rx="6.5" {...st} /><circle cx="21.5" cy="16.5" r="4.2" fill="#eef2ff" /></>,
    <path key="g0" d="M6 10h20M6 22h20M12 7v6M20 19v6" {...st} />,
    <path key="g1" d="M16 5 L28 11 L16 17 L4 11Z M4 16 L16 22 L28 16 M4 21 L16 27 L28 21" {...st} />,
    <path key="g2" d="M16 4 L18.4 13.6 L28 16 L18.4 18.4 L16 28 L13.6 18.4 L4 16 L13.6 13.6Z" fill="#eef2ff" />,
    <path key="g3" d="M11 9 L4 16 L11 23 M21 9 L28 16 L21 23" {...st} />,
  ][k % 6];
  return <svg width={s} height={s} viewBox="0 0 32 32">{g}</svg>;
}

/* ------------------------------------------------------------------ */

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&*+/<>";

export default function GlassOrbit({ t, w = 1080, h = 1350, ...props }: { t: number } & Frame & Partial<GlassOrbitProps>) {
  const p = { ...meta.defaults, ...props };
  const u = w / 1080;
  const cx = w / 2, cy = h / 2;
  const chapter = t < 7.2 ? 0 : t < 15.6 ? 1 : t < 21 ? 2 : 3;
  // wipe orbs between chapters
  const wipes = [7.2, 15.6, 21.0].map((at) => {
    const q = P(t, at - 0.45, at + 0.45);
    return { at, q };
  });
  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, overflow: "hidden", background: "#04070f", fontFamily: FONT, color: "#fff" }}>
      <div style={{ ...abs, left: cx - w, top: cy - w, width: w * 2, height: w * 2, borderRadius: "50%", background: "radial-gradient(circle, rgba(18,40,95,.85), rgba(6,12,30,.6) 40%, transparent 65%)" }} />
      <Grid w={w} h={h} />
      <div style={{ ...abs, inset: 0, transform: `scale(${u})`, transformOrigin: "0 0", width: 1080, height: h / u }}>
        {chapter === 0 && <Act1 t={t} H={h / u} p={p} />}
        {chapter === 1 && <Act2 t={t - 7.2} H={h / u} p={p} />}
        {chapter === 2 && <Act3 t={t - 15.6} H={h / u} p={p} />}
        {chapter === 3 && <Act4 t={t - 21} H={h / u} p={p} />}
        {wipes.map(({ at, q }) => q > 0 && q < 1 && <Orb key={at} x={lerp(1500, -420, ease.inOut(q))} y={(h / u) * 0.5} r={lerp(520, 760, Math.sin(q * Math.PI))} blue={p.blue} o={Math.sin(q * Math.PI)} />)}
        {/* frame furniture */}
        <div style={{ ...abs, left: 60, top: 54 }}>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: "-0.02em" }}>’26</div>
          <div style={{ fontFamily: TEXT, fontSize: 22, color: "rgba(230,236,255,.72)", marginTop: 4 }}>{p.sub}</div>
        </div>
        <div style={{ ...abs, left: 60, bottom: 52, fontFamily: TEXT, fontSize: 20, color: "rgba(230,236,255,.7)" }}>{p.url}</div>
        <div style={{ ...abs, right: 60, bottom: 46, height: 36, padding: "0 16px", borderRadius: 18, border: "1px solid rgba(160,185,255,.35)", display: "flex", alignItems: "center", gap: 8, fontFamily: TEXT, fontSize: 18, color: "rgba(230,236,255,.85)" }}>
          {chapter + 1} / 4
        </div>
        <div style={{ ...abs, left: 540 - 36, bottom: 60, display: "flex", gap: 8 }}>
          {[0, 1, 2, 3].map((i) => <span key={i} style={{ width: i === chapter ? 22 : 8, height: 8, borderRadius: 4, background: i === chapter ? "#fff" : "rgba(255,255,255,.35)" }} />)}
        </div>
      </div>
      <div style={{ ...abs, inset: 0, background: "#000", opacity: 1 - P(t, 0, 0.35) + P(t, 24.25, 24.6), pointerEvents: "none" }} />
    </div>
  );
}

type AP = { t: number; H: number; p: GlassOrbitProps };

/* chapter 1 ------------------------------------------------------------ */
function Act1({ t, H, p }: AP) {
  const cy = H / 2;
  const orbX = lerp(1500, 150, ease.inOut(P(t, 0.3, 2.0)));
  const letters = Array.from(p.name);
  const fs = 168;
  const glitch = P(t, 2.6, 3.3);
  const inGlitch = t > 2.6 && t < 3.3;
  const collapse = ease.in(P(t, 3.05, 3.35));
  const icon = spring(t - 3.3, 0.55, 9);
  const slide = ease.inOut(P(t, 3.9, 4.5));
  const iconX = lerp(540, 330, slide);
  const items = p.menu.split("|");
  const sel = clamp((t - 4.6) / 0.6, 0, items.length - 1);
  const selI = Math.floor(sel) + ease.inOut(clamp((sel - Math.floor(sel)) * 2.2));
  const menuIn = ease.expo(P(t, 4.2, 4.9));
  const out = ease.in(P(t, 6.75, 7.2));
  const ptr = ease.inOut(P(t, 1.7, 2.45));
  const px = lerp(980, 640, ptr), py = lerp(H - 180, cy + 40, ptr);
  const press = t > 2.45 && t < 2.6 ? 0.85 : 1;
  const totalW = letters.length * fs * 0.56;
  return (
    <div style={{ ...abs, inset: 0, transform: `scale(${1 + out * 0.15})`, opacity: 1 - out, filter: out > 0.02 ? `blur(${out * 16}px)` : undefined }}>
      <Orb x={orbX} y={cy + 10} r={lerp(420, 380, P(t, 0.3, 2))} blue={p.blue} o={1 - collapse * 0.6} />
      {/* wordmark revealed by the orb */}
      {t < 3.4 && (
        <div style={{ ...abs, left: 0, right: 0, top: cy - fs * 0.62, height: fs * 1.24, display: "flex", justifyContent: "center", alignItems: "center", fontSize: fs, fontWeight: 700, letterSpacing: "-0.04em" }}>
          {letters.map((c, i) => {
            const lx = 540 - totalW / 2 + (i + 0.5) * (totalW / letters.length);
            const rev = clamp((lx - orbX + 200) / 220);
            const ch = inGlitch && rand(i * 13 + FR(t)) > 0.45 + glitch * 0.3 ? GLYPHS[Math.floor(rand(i * 7 + FR(t) * 3) * GLYPHS.length)] : c;
            const jx = inGlitch ? (rand(i + FR(t) * 1.3) - 0.5) * 30 : 0;
            const toC = collapse;
            return (
              <span key={i} style={{ position: "relative", display: "inline-block", whiteSpace: "pre", opacity: clamp(rev * 1.4) * (1 - toC), transform: `translate(${jx + (540 - lx) * toC}px, ${(1 - clamp(rev)) * 30}px) scale(${1 - toC * 0.7})`, filter: `blur(${(1 - clamp(rev)) * 12}px)`, textShadow: inGlitch ? "-5px 0 rgba(255,40,90,.85), 5px 0 rgba(40,220,255,.85)" : "0 0 30px rgba(150,180,255,.35)" }}>{ch}</span>
            );
          })}
        </div>
      )}
      {/* cursor */}
      {t > 1.6 && t < 3.2 && (
        <svg width={64} height={64} viewBox="0 0 24 24" style={{ ...abs, left: px, top: py, transform: `scale(${press})`, filter: "drop-shadow(0 6px 12px rgba(0,0,0,.5))" }}>
          <path d="M3 3 L21 11 L13 13 L11 21 Z" fill="#fff" />
        </svg>
      )}
      {/* glass icon */}
      {t > 3.25 && (
        <div style={{ ...abs, left: iconX - 110, top: cy - 110, transform: `scale(${icon})` }}>
          <GlassIcon size={220} blue={p.blue}><Mark size={150} blue={p.blue} /></GlassIcon>
        </div>
      )}
      {/* menu */}
      {t > 4.1 && (
        <div style={{ ...abs, left: 520, top: cy, opacity: menuIn }}>
          {items.map((it, i) => {
            const d = i - selI;
            const ad = Math.abs(d);
            return (
              <div key={it} style={{ ...abs, left: (1 - menuIn) * 60, top: d * 78 - 30, fontSize: 52, fontWeight: 500, letterSpacing: "-0.02em", whiteSpace: "nowrap", color: "#fff", opacity: clamp(1 - ad * 0.32), filter: `blur(${Math.min(8, ad * 3.2)}px)`, transform: `scale(${1 - Math.min(0.25, ad * 0.08)})`, transformOrigin: "0 50%" }}>{it}</div>
            );
          })}
          <div style={{ ...abs, left: -34, top: -10, width: 18, height: 18, borderRadius: 9, background: "#9ec0ff", boxShadow: `0 0 18px ${p.blue}, 0 0 40px ${p.blue}` }} />
        </div>
      )}
      {/* light travelling from icon to the active item on every step */}
      {t > 4.6 && t < 6.9 && (() => {
        const q = (sel % 1) * 2.2;
        if (q > 1) return null;
        return <div style={{ ...abs, left: lerp(iconX + 90, 500, ease.inOut(q)), top: cy - 40, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, #cfe0ff, ${p.blue}88 40%, transparent 70%)`, opacity: Math.sin(q * Math.PI) }} />;
      })()}
    </div>
  );
}

/* chapter 2: word drum -------------------------------------------------- */
function Act2({ t, H, p }: AP) {
  const cy = H / 2;
  const words = p.drum.split("|");
  const n = words.length;
  const stepDur = 0.9;
  const pos = (tt: number) => {
    const k = Math.floor(tt / stepDur);
    const f = (tt - k * stepDur) / 0.55;
    const e = f >= 1 ? 1 : 1 - Math.pow(1 - f, 3) * Math.cos(f * 4.2);
    return k + clamp(e, -0.2, 1.15);
  };
  const ang = pos(t);
  const vel = Math.abs(pos(t) - pos(t - 1 / 30)) * 30;
  const R = 330;
  const inn = ease.expo(P(t, 0, 0.6));
  const out = ease.in(P(t, 8.0, 8.4));
  const step = (2 * Math.PI) / Math.max(n, 6);
  return (
    <div style={{ ...abs, inset: 0, opacity: inn * (1 - out), transform: `scale(${lerp(0.9, 1, inn) * (1 + out * 0.1)})` }}>
      {/* ribbon of blue light */}
      {[0, 1, 2].map((k) => (
        <div key={k} style={{ ...abs, left: 560 + Math.sin(t * 0.8 + k * 2) * 40 - 150, top: cy - 520 + k * 300 + Math.cos(t * 0.6 + k) * 30, width: 360, height: 420, borderRadius: 200, background: `radial-gradient(ellipse, #8fb2ff 0%, ${p.blue} 30%, rgba(20,50,200,.5) 52%, transparent 70%)`, filter: "blur(28px)", transform: `rotate(${-24 + k * 24 + Math.sin(t + k) * 6}deg)`, opacity: 0.85 }} />
      ))}
      {words.map((wd, i) => {
        const th = (i - ang) * step;
        const z = Math.cos(th);
        if (z < -0.15) return null;
        const y = Math.sin(th) * R;
        const sc = 0.7 + 0.3 * z;
        const centre = Math.abs(th) < step * 0.5;
        return (
          <div key={i} style={{ ...abs, left: 0, right: 0, top: cy + y - 80, height: 160, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 148, fontWeight: 600, letterSpacing: "-0.035em", color: "#fff", opacity: clamp(z * 1.3) * (centre ? 1 : 0.75), transform: `scale(${sc}, ${sc * (0.55 + 0.45 * z)})`, filter: `blur(${(1 - z) * 9 + vel * 3}px)`, textShadow: centre ? "0 0 30px rgba(160,190,255,.5)" : undefined }}>
            {wd}
          </div>
        );
      })}
    </div>
  );
}

/* chapter 3: orbit ------------------------------------------------------ */
function Act3({ t, H, p }: AP) {
  const cy = H / 2;
  const inn = ease.expo(P(t, 0, 0.6));
  const out = ease.in(P(t, 4.95, 5.4));
  const icons = Array.from({ length: 6 }, (_, i) => {
    const fly = spring(t - 0.15 - i * 0.07, 0.6, 8);
    const a = (i / 6) * Math.PI * 2 + t * 0.55;
    const rx = 370 * fly, ry = 170 * fly;
    const x = 540 + Math.cos(a) * rx;
    const y = cy + Math.sin(a) * ry - Math.cos(a) * 40;
    const z = Math.sin(a);
    return { i, x, y, z, fly };
  });
  const label = (
    <div style={{ ...abs, left: 0, right: 0, top: cy - 50, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 600, letterSpacing: "-0.03em", color: "#fff", opacity: inn, textShadow: "0 0 30px rgba(160,190,255,.4)" }}>{p.hub}</div>
  );
  const ic = (o: (typeof icons)[number]) => {
    const s = (0.72 + 0.28 * ((o.z + 1) / 2)) * o.fly;
    return (
      <div key={o.i} style={{ ...abs, left: o.x - 85, top: o.y - 85, transform: `scale(${s})`, filter: `blur(${Math.max(0, -o.z) * 6}px)`, opacity: clamp(o.fly * 2) * (0.6 + 0.4 * ((o.z + 1) / 2)) }}>
        <GlassIcon size={170} blue={p.blue} glow={0.7 + 0.3 * o.z}><Glyph k={o.i} s={78} /></GlassIcon>
      </div>
    );
  };
  return (
    <div style={{ ...abs, inset: 0, opacity: 1 - out, transform: `scale(${1 + out * 0.12})`, filter: out > 0.02 ? `blur(${out * 14}px)` : undefined }}>
      {icons.filter((o) => o.z < 0).map(ic)}
      {label}
      {icons.filter((o) => o.z >= 0).map(ic)}
    </div>
  );
}

/* chapter 4: end card --------------------------------------------------- */
function Act4({ t, H, p }: AP) {
  const r1 = ease.expo(P(t, 0.15, 0.8));
  const r2 = ease.expo(P(t, 0.35, 1.0));
  const glow = ease.out(P(t, 0, 1.4));
  const subIn = ease.out(P(t, 0.9, 1.4));
  const typed = Math.floor(clamp((t - 1.3) / 0.8) * p.chip.length);
  const bul = ease.out(P(t, 1.6, 2.1));
  const top = H * 0.2;
  return (
    <div style={{ ...abs, inset: 0 }}>
      {/* horizon of light */}
      <div style={{ ...abs, left: -300, right: -300, top: H * 0.52 - 160 + (1 - glow) * 200, height: 420, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 50%, #bcd3ff 0%, ${p.blue} 22%, rgba(20,50,200,.55) 45%, transparent 70%)`, filter: "blur(24px)", opacity: glow }} />
      <div style={{ ...abs, left: -300, right: -300, top: H * 0.5 + 60, height: H, background: "linear-gradient(180deg, transparent, #04070f 40%)" }} />
      <div style={{ ...abs, left: 60, top, overflow: "hidden" }}>
        <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1, transform: `translateY(${(1 - r1) * 130}px)` }}>{p.end1}</div>
      </div>
      <div style={{ ...abs, left: 60, top: top + 124, overflow: "hidden" }}>
        <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: "-0.035em", lineHeight: 1, color: "#4d82ff", transform: `translateY(${(1 - r2) * 130}px)` }}>{p.end2}</div>
      </div>
      <div style={{ ...abs, left: 520, top: top + 300, fontFamily: TEXT, fontSize: 48, lineHeight: 1.15, color: "#fff", opacity: subIn, transform: `translateY(${(1 - subIn) * 16}px)` }}>
        a quick start<br />for your
        <span style={{ display: "inline-flex", alignItems: "center", marginLeft: 12, height: 60, padding: "0 18px", borderRadius: 12, background: "#fff", color: "#04070f", fontWeight: 600, fontSize: 38, verticalAlign: "middle", minWidth: 20 }}>
          {p.chip.slice(0, typed)}<span style={{ width: 2, height: 30, background: "#04070f", marginLeft: 2, opacity: FR(t) % 20 < 11 ? 1 : 0 }} />
        </span>
      </div>
      <div style={{ ...abs, left: 60, bottom: 120, fontFamily: TEXT, fontSize: 26, lineHeight: 1.7, color: "#fff", opacity: bul }}>
        <div><span style={{ color: "#6f9bff", marginRight: 14 }}>●</span>save</div>
        <div><span style={{ color: "#6f9bff", marginRight: 14 }}>●</span>share</div>
      </div>
    </div>
  );
}
