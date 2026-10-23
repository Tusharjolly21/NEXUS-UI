"use client";

import type { CSSProperties } from "react";
import { FONT, P, TEXT, clamp, ease, lerp, type Frame, type VideoMeta } from "./kit";

export interface WordRushProps {
  words: string;
  last: string;
  url: string;
  mint: string;
  haze: string;
}

export const meta: VideoMeta<WordRushProps> = {
  id: "word-rush",
  title: "Word Rush",
  platforms: ["Reels", "TikTok", "Shorts", "X"],
  formats: ["9:16", "1:1", "4:5"],
  purpose: "Brand manifesto in 10 seconds",
  motion: "One word per beat, flipping between a mint and a hazy lavender stage; the last word types itself",
  app: "Nexus UI",
  duration: 9.6,
  bpm: 150,
  cuts: [],
  blurb:
    "Nine and a half seconds of kinetic type at 150 BPM: one word on every beat, each cut flipping the stage between a mint gradient with black type and a hazy grey-lavender gradient with white type. It opens with a two-line statement, rattles through what the library does, and lands on the brand typing itself out. Every cut is scored.",
  defaults: {
    words: "we|we don't|just|just copy|we|animate|springs|hover|gestures|layout|scroll|physics|sound|polish|feelings",
    last: "nexus ui.",
    url: "nexus-ui.com",
    mint: "#7ee3a0",
    haze: "#a7b2ff",
  },
  fields: [
    { key: "words", label: "Words (| between, a space makes two lines)", type: "text", max: 200 },
    { key: "last", label: "Last word (typed)", type: "text", max: 14 },
    { key: "url", label: "URL", type: "text", max: 24 },
    { key: "mint", label: "Light stage", type: "color" },
    { key: "haze", label: "Dark stage tint", type: "color" },
  ],
};

const abs: CSSProperties = { position: "absolute" };
const BPM = 150;
const BEAT = 60 / BPM;
const T0 = 0.0;

function Stage({ light, w, h, mint, haze }: { light: boolean; w: number; h: number; mint: string; haze: string }) {
  const S = Math.max(w, h);
  if (light)
    return (
      <div style={{ ...abs, inset: 0, background: `linear-gradient(140deg, #f7fbf8 0%, #e6f8eb 30%, #bdf0cb 62%, ${mint} 100%)` }}>
        <div style={{ ...abs, left: -S * 0.4, top: -S * 0.4, width: S, height: S, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.9), transparent 60%)" }} />
      </div>
    );
  return (
    <div style={{ ...abs, inset: 0, background: "#8f8f96" }}>
      <div style={{ ...abs, left: -S * 0.45, top: -S * 0.5, width: S * 1.1, height: S * 1.1, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.95), rgba(255,255,255,.4) 30%, transparent 62%)" }} />
      <div style={{ ...abs, left: w - S * 0.5, top: -S * 0.55, width: S, height: S, borderRadius: "50%", background: `radial-gradient(circle, ${haze}, transparent 62%)`, opacity: 0.95 }} />
      <div style={{ ...abs, left: -S * 0.2, top: h * 0.55, width: S * 0.9, height: S * 0.9, borderRadius: "50%", background: "radial-gradient(circle, rgba(70,70,78,.55), transparent 65%)" }} />
    </div>
  );
}

export default function WordRush({ t, w = 1080, h = 1920, ...props }: { t: number } & Frame & Partial<WordRushProps>) {
  const p = { ...meta.defaults, ...props };
  const words = p.words.split("|").map((s) => s.trim()).filter(Boolean);
  const n = words.length;
  const k = Math.floor((t - T0) / BEAT);
  const lt = t - T0 - k * BEAT;
  const typing = k >= n;
  const light = typing ? true : k % 2 === 0;
  const fs0 = Math.min(w, h * 0.75) * 0.27;
  const settle = ease.out(clamp(lt / 0.12));
  const sc = lerp(1.06, 1, settle);
  const bl = (1 - clamp(lt / 0.07)) * 6;
  const ink = light ? "#0b0b0c" : "#ffffff";
  const typeStart = T0 + n * BEAT;
  const chars = Array.from(p.last);
  const typed = clamp(Math.floor((t - typeStart) / (BEAT / 2)) + 1, 0, chars.length);
  const grow = ease.out(clamp((t - typeStart) / (chars.length * BEAT / 2)));
  const word = typing ? "" : words[Math.max(0, k)];
  const parts = word.split(" ");
  const longest = Math.max(...(typing ? [p.last.length * 1.35] : parts.map((x) => x.length)), 2);
  const fs = Math.min(fs0, (w * 0.84) / (longest * 0.56));
  const two = parts.length === 2;
  return (
    <div style={{ ...abs, inset: 0, width: w, height: h, overflow: "hidden", fontFamily: FONT }}>
      <Stage light={light} w={w} h={h} mint={p.mint} haze={p.haze} />
      {!typing && (
        <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sc})`, filter: bl > 0.3 ? `blur(${bl}px)` : undefined }}>
          {two ? (
            <div style={{ textAlign: "center", color: ink, fontWeight: 700, letterSpacing: "-0.055em", lineHeight: 0.82 }}>
              <div style={{ fontSize: fs * 0.82 }}>{parts[0]}</div>
              <div style={{ fontSize: fs * 1.12 }}>{parts[1]}</div>
            </div>
          ) : (
            <div style={{ color: ink, fontWeight: 700, fontSize: fs, letterSpacing: "-0.055em", lineHeight: 1 }}>{word}</div>
          )}
        </div>
      )}
      {typing && (
        <>
          <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ color: "#0b0b0c", fontWeight: 700, fontSize: fs * lerp(1, 1.35, grow), letterSpacing: "-0.055em", whiteSpace: "pre" }}>{chars.slice(0, typed).join("")}</div>
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: h / 2 + fs * 0.95, textAlign: "center", fontFamily: TEXT, fontWeight: 500, fontSize: fs * 0.2, color: "rgba(11,11,12,.6)", opacity: ease.out(P(t, typeStart + chars.length * BEAT / 2 + 0.2, typeStart + chars.length * BEAT / 2 + 0.7)) }}>{p.url}</div>
        </>
      )}
      <div style={{ ...abs, inset: 0, background: "#fff", opacity: (1 - P(t, 0, 0.12)) * 0.6, pointerEvents: "none" }} />
    </div>
  );
}
