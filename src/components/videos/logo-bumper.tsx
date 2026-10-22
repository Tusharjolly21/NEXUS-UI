"use client";

import type { CSSProperties } from "react";
import { FONT, P, TEXT, clamp, ease, lerp, spring, type Frame, type VideoMeta } from "./kit";

export interface LogoBumperProps {
  name: string;
  tagline: string;
  bg: string;
  tile: string;
  ink: string;
  node: string;
}

export const meta: VideoMeta<LogoBumperProps> = {
  id: "logo-bumper",
  title: "Logo Bumper",
  platforms: ["YouTube", "X", "Shorts"],
  formats: ["16:9", "1:1", "9:16"],
  purpose: "Channel intro & outro",
  motion: "The mark draws itself, then locks up with the name",
  app: "Nexus UI",
  duration: 5,
  bpm: 120,
  cuts: [0.35, 1.1, 1.6, 4.5],
  blurb: "A five-second sting for the start or end of every video. The centre node lands, three spokes shoot out and their ends pop, the tile grows in behind them, and the name slides out of the mark with a light sweep.",
  defaults: { name: "Nexus UI", tagline: "Motion you can copy and paste.", bg: "#f5f5f7", tile: "#111113", ink: "#f4f1ea", node: "#7d96ff" },
  fields: [
    { key: "name", label: "Name", type: "text", max: 14 },
    { key: "tagline", label: "Tagline", type: "text", max: 34 },
    { key: "bg", label: "Background", type: "color" },
    { key: "tile", label: "Logo tile", type: "color" },
    { key: "ink", label: "Spokes", type: "color" },
    { key: "node", label: "Centre node", type: "color" },
  ],
};

const abs: CSSProperties = { position: "absolute" };
const ENDS: [number, number][] = [[0, -1], [-0.866, 0.5], [0.866, 0.5]];

export default function LogoBumper({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<LogoBumperProps>) {
  const p = { ...meta.defaults, ...props };
  const portrait = h > w * 1.2;
  const u = (Math.min(w, h) / 1080) * (portrait ? 1 : 1.15); // layout unit
  const M = 300 * u; // mark size
  const R = M * 0.3; // spoke length

  // lock-up positions
  const lock = ease.inOut(P(t, 1.6, 2.35));
  const nameW = p.name.length * 0.56 * 150 * u; // rough width of the name at 150u
  const gap = 70 * u;
  const totalW = M * 0.62 + gap + nameW;
  const markEndX = portrait ? w / 2 : w / 2 - totalW / 2 + (M * 0.62) / 2;
  const markEndY = portrait ? h / 2 - 170 * u : h / 2 - 40 * u;
  const mx = lerp(w / 2, markEndX, lock), my = lerp(h / 2, markEndY, lock);
  const ms = lerp(1, 0.62, lock);
  const out = ease.in(P(t, 4.45, 5.0));

  const tileP = spring(t - 1.08, 0.62, 12);
  const toInk = clamp(P(t, 1.15, 1.5));
  const stroke = `color-mix(in srgb, #1d1d1f ${(1 - toInk) * 100}%, ${p.ink})`;

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: p.bg, fontFamily: FONT, color: "#1d1d1f" }}>
      <div style={{ ...abs, left: w * 0.5 - 700 * u, top: h * 0.5 - 700 * u, width: 1400 * u, height: 1400 * u, borderRadius: "50%", background: `radial-gradient(circle, ${p.node}33, transparent 62%)`, opacity: clamp(P(t, 0.3, 1.5)) * (1 - out), transform: `scale(${lerp(0.6, 1.1, ease.out(P(t, 0, 3)))})` }} />

      <div style={{ ...abs, inset: 0, transformOrigin: `${w / 2}px ${h / 2}px`, transform: `scale(${1 - out * 0.12})`, opacity: 1 - out, filter: out ? `blur(${out * 16}px)` : undefined }}>
        {/* mark */}
        <div style={{ ...abs, left: mx - M / 2, top: my - M / 2, width: M, height: M, transform: `scale(${ms})` }}>
          <div style={{ ...abs, inset: 0, background: p.tile, borderRadius: lerp(M / 2, M * 0.23, clamp(tileP)), transform: `scale(${tileP})`, boxShadow: `0 ${30 * u}px ${60 * u}px -${24 * u}px rgba(0,0,0,.45)` }} />
          <svg width={M} height={M} viewBox={`${-M / 2} ${-M / 2} ${M} ${M}`} style={{ ...abs, inset: 0, overflow: "visible" }}>
            {ENDS.map(([dx, dy], i) => {
              const q = ease.out(P(t, 0.35 + i * 0.08, 0.85 + i * 0.08));
              const pop = spring(t - (0.8 + i * 0.08), 0.45, 15);
              return (
                <g key={i}>
                  <line x1={0} y1={0} x2={dx * R * q} y2={dy * R * q} stroke={stroke} strokeWidth={M * 0.055} strokeLinecap="round" />
                  <circle cx={dx * R} cy={dy * R} r={M * 0.075 * pop} fill={stroke} />
                </g>
              );
            })}
            {/* centre node + ripple */}
            {t > 2.9 && <circle cx={0} cy={0} r={M * (0.11 + 0.35 * ease.out(P(t, 2.95, 3.9)))} fill="none" stroke={p.node} strokeWidth={M * 0.012} opacity={1 - P(t, 2.95, 3.9)} />}
            <circle cx={0} cy={0} r={M * 0.11 * spring(t - 0.02, 0.4, 16)} fill={toInk > 0 ? p.tile : p.node} />
            <circle cx={0} cy={0} r={M * 0.085 * spring(t - 0.02, 0.4, 16)} fill={p.node} />
          </svg>
        </div>

        {/* name */}
        {portrait ? (
          <div style={{ ...abs, left: 0, right: 0, top: markEndY + M * 0.36 + 40 * u, textAlign: "center", overflow: "hidden", paddingBottom: 20 * u }}>
            <div style={{ fontSize: 150 * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.05, transform: `translateY(${(1 - ease.expo(P(t, 1.75, 2.4))) * 170 * u}px)` }}><Sweep t={t} text={p.name} /></div>
          </div>
        ) : (
          <div style={{ ...abs, left: markEndX + (M * 0.62) / 2 + gap * 0.6, top: markEndY - 95 * u, height: 200 * u, width: nameW + 120 * u, overflow: "hidden", display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 150 * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.05, whiteSpace: "nowrap", transform: `translateX(${(1 - ease.expo(P(t, 1.8, 2.5))) * -(nameW + 120 * u)}px)` }}><Sweep t={t} text={p.name} /></div>
          </div>
        )}
        <div style={{ ...abs, left: 0, right: 0, top: portrait ? markEndY + M * 0.36 + 250 * u : markEndY + 130 * u, textAlign: "center", fontFamily: TEXT, fontSize: 40 * u, fontWeight: 500, color: "#86868b", letterSpacing: "-0.015em", opacity: clamp(ease.expo(P(t, 2.6, 3.2)) * 1.4), transform: `translateY(${(1 - ease.expo(P(t, 2.6, 3.2))) * 24 * u}px)`, paddingLeft: portrait ? 0 : 0 }}>{p.tagline}</div>
      </div>
    </div>
  );
}

/** Name with a single soft light sweep across it. */
function Sweep({ t, text }: { t: number; text: string }) {
  const s = P(t, 2.35, 3.05);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {text}
      {s > 0 && s < 1 && (
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: `linear-gradient(100deg, transparent ${lerp(-40, 100, s)}%, rgba(255,255,255,.95) ${lerp(-25, 115, s)}%, transparent ${lerp(-10, 130, s)}%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text}</span>
      )}
    </span>
  );
}
