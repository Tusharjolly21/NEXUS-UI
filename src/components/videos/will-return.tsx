"use client";

import { useEffect, useRef } from "react";
import { clamp, ease, P, type VideoMeta } from "./kit";

/**
 * Will Return: a 15s post-credit sting for nexus-ui.com.
 *
 * 0 to 11.1s is a recorded tour of the live site (hero, components grid,
 * Catch Undo and Symbiote Cursor pages), cut on every note of the cue.
 * The recording is a plain MP4 that is seeked to `t`, so the component stays a
 * pure function of time. From 11.1s the end card is live DOM, so its words are
 * props you can edit.
 */
export interface WillReturnProps {
  line1: string;
  line2: string;
  brand: string;
  url: string;
  handle: string;
  accent: string;
}

export const meta: VideoMeta<WillReturnProps> = {
  id: "will-return",
  title: "Will Return",
  platforms: ["YouTube", "X", "Reels", "TikTok", "Shorts"],
  formats: ["16:9", "9:16"],
  purpose: "Post-credit teaser",
  motion: "Site tour cut on the notes, then a post-credit card",
  app: "Nexus UI",
  duration: 15,
  bpm: 60,
  cuts: [0.74, 1.42, 2.31, 2.68, 2.97, 5.69, 8.01, 11.1],
  blurb:
    "A post-credit sting for nexus-ui.com, cut to the Doomsday post-credit cue. Each note lands a beat on the live site: the hero types its command, the page scrolls into a grid of components that move, and the two big chords cut to the Catch Undo and Symbiote Cursor pages. On the last chord it drops to black and the words come back one line at a time.",
  defaults: {
    line1: "These components",
    line2: "will return in",
    brand: "Nexus UI",
    url: "nexus-ui.com",
    handle: "@nexusuilabs",
    accent: "#c9c8ff",
  },
  fields: [
    { key: "line1", label: "First line", type: "text", max: 22 },
    { key: "line2", label: "Second line", type: "text", max: 22 },
    { key: "brand", label: "Brand", type: "text", max: 12 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "handle", label: "Handle", type: "text", max: 20 },
    { key: "accent", label: "Shine colour", type: "color" },
  ],
};

const CUT = 11.1;
const END = 15.04;
const out = (x: number) => 1 - Math.pow(1 - x, 3);

export default function WillReturn({ t, w = 1920, h = 1080, ...o }: { t: number; w?: number; h?: number } & Partial<WillReturnProps>) {
  const p = { ...meta.defaults, ...o };
  const vertical = h > w;
  // the site recording was captured at 960x540 (or 540x960) CSS px, 2x device pixels
  const bw = vertical ? 540 : 960;
  const bh = vertical ? 960 : 540;
  const video = useRef<HTMLVideoElement>(null);

  // keep the recording locked to t: play while t advances, seek when it jumps
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    const target = clamp(t, 0, CUT - 0.04);
    if (Math.abs(v.currentTime - target) > 0.03) v.currentTime = target;
  }, [t]);

  const a = Math.min(out(P(t, 11.1, 11.9)), 1 - P(t, 14.55, END));
  const tight = out(P(t, 11.1, 14.8));
  const glow = 0.55 + 0.25 * Math.sin(t * 2.2);
  const l1 = ease.expo(P(t, 11.25, 12.1));
  const l2 = ease.expo(P(t, 11.75, 12.6));
  const l3 = ease.expo(P(t, 12.15, 13.2));
  const l4 = ease.expo(P(t, 12.9, 13.8));
  const shine = P(t, 14.45, 15.0);
  const shineOn = shine > 0 && shine < 1;
  const big = vertical ? 58 : 76;

  return (
    <div style={{ position: "absolute", inset: 0, width: w, height: h, overflow: "hidden", background: "#000" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: bw, height: bh, transform: `scale(${w / bw})`, transformOrigin: "0 0" }}>
        <video
          ref={video}
          src={vertical ? "/videos/files/will-return-9x16.mp4" : "/videos/files/will-return-16x9.mp4"}
          muted
          playsInline
          preload="auto"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", visibility: t < CUT ? "visible" : "hidden" }}
        />

        {t >= CUT && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: a, background: "radial-gradient(60% 45% at 50% 50%, rgba(110,110,255,0.10), rgba(0,0,0,0) 70%), #000" }}>
            <NexusMark size={vertical ? 64 : 52} glow={glow} grow={ease.expo(P(t, 11.1, 12.0))} />
            <Line size={vertical ? 15 : 14} track={0.62 - 0.2 * tight} alpha={0.82} p={l1}>{p.line1}</Line>
            <Line size={vertical ? 12 : 11} track={0.7 - 0.22 * tight} alpha={0.55} p={l2} top={12}>{p.line2}</Line>
            <span
              style={{
                marginTop: 14,
                fontSize: big,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: `${0.42 - 0.3 * tight}em`,
                paddingLeft: `${0.42 - 0.3 * tight}em`,
                color: "#fff",
                textTransform: "uppercase",
                opacity: l3,
                filter: `blur(${(1 - l3) * 12}px)`,
                textShadow: `0 0 ${26 * glow}px rgba(150,150,255,${0.4 * glow})`,
                backgroundImage: shineOn ? `linear-gradient(100deg, #fff 0%, #fff ${shine * 140 - 30}%, ${p.accent} ${shine * 140 - 15}%, #fff ${shine * 140}%, #fff 100%)` : undefined,
                WebkitBackgroundClip: shineOn ? "text" : undefined,
                WebkitTextFillColor: shineOn ? "transparent" : undefined,
              }}
            >
              {p.brand}
            </span>
            <span style={{ marginTop: vertical ? 26 : 22, width: 24 + (vertical ? 160 : 200) * tight, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))" }} />
            <span style={{ marginTop: 18, fontSize: vertical ? 17 : 16, fontWeight: 500, letterSpacing: `${0.28 - 0.06 * tight}em`, color: "rgba(255,255,255,0.92)", opacity: l4, filter: `blur(${(1 - l4) * 6}px)` }}>{p.url}</span>
            <span style={{ marginTop: 10, fontSize: vertical ? 12 : 11, letterSpacing: "0.12em", color: "rgba(255,255,255,0.45)", opacity: ease.expo(P(t, 13.3, 14.1)) }}>{p.handle}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ children, size, track, alpha, p, top = 0 }: { children: string; size: number; track: number; alpha: number; p: number; top?: number }) {
  return (
    <span style={{ marginTop: top, fontSize: size, fontWeight: 500, letterSpacing: `${track}em`, paddingLeft: "0.5em", color: `rgba(255,255,255,${alpha})`, textTransform: "uppercase", opacity: p, filter: `blur(${(1 - p) * 6}px)` }}>
      {children}
    </span>
  );
}

/* Nexus UI mark: three spokes from a lit core */
function NexusMark({ size, glow, grow }: { size: number; glow: number; grow: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: "visible", marginBottom: size / 2, opacity: grow, transform: `scale(${0.86 + 0.14 * grow})`, filter: `drop-shadow(0 0 ${8 * glow}px rgba(140,140,255,${0.7 * glow}))` }}>
      {[[50, 12], [17, 71], [83, 71]].map(([x, y], i) => (
        <g key={i}>
          <line x1={50} y1={52} x2={x} y2={y} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          <circle cx={x} cy={y} r={7.5} fill="#fff" />
        </g>
      ))}
      <circle cx={50} cy={52} r={10} fill="#8f8cff" />
    </svg>
  );
}
