import type { CSSProperties, ReactNode } from "react";
import { FONT, GRAD, MONO, P, TEXT, blobsFor, clamp, ease, gradText, lerp, rise, spring, type Frame, type VideoMeta } from "./kit";
import { Odometer } from "./parts";
import tPay from "./assets/tile-pay.jpg";
import tRouter from "./assets/tile-router.jpg";
import tPend from "./assets/tile-pend.jpg";
import tReel from "./assets/tile-reel.jpg";
import tDock from "./assets/tile-dock.jpg";
import tIsland from "./assets/tile-island.jpg";
import tFolder from "./assets/tile-folder.jpg";
import tCopy from "./assets/tile-copy.jpg";
import tplNova from "./assets/tpl-nova.jpg";
import tplHelix from "./assets/tpl-helix.jpg";
import tplLaunch from "./assets/tpl-launch.jpg";
import tplAether from "./assets/tpl-aether.jpg";

export interface BentoTourProps {
  intro: string;
  n1: string; l1: string;
  n2: string; l2: string;
  n3: string; l3: string;
  cmdLine: string;
  pkgs: string;
  brand: string;
  url: string;
  pill: string;
}

export const meta: VideoMeta<BentoTourProps> = {
  id: "bento-tour",
  title: "Bento Zoom Tour",
  platforms: ["YouTube", "Product Hunt", "Website", "X"],
  formats: ["16:9", "1:1", "9:16"],
  purpose: "Product overview",
  motion: "Camera flies into each bento tile and back out",
  app: "Nexus UI",
  duration: 14,
  bpm: 120,
  cuts: [1.0, 2.6, 3.4, 5.6, 8.0, 10.4, 12.6],
  blurb: "Your whole product as one bento grid, then a camera that dives into each tile until it fills the screen. Inside, every tile is alive: real component shots scroll, a waveform plays, templates shuffle, a terminal types.",
  defaults: {
    intro: "Everything in Nexus UI.",
    n1: "183", l1: "animated components",
    n2: "24", l2: "interface sounds",
    n3: "22", l3: "complete templates",
    cmdLine: "One command. It's your code.",
    pkgs: "price-odometer, slide-to-confirm, gooey-input, dynamic-island",
    brand: "Nexus UI",
    url: "nexus-ui.com",
    pill: "Free to start",
  },
  fields: [
    { key: "intro", label: "Opening line", type: "text", max: 28 },
    { key: "n1", label: "Tile 1 number", type: "text", max: 5 },
    { key: "l1", label: "Tile 1 label", type: "text", max: 22 },
    { key: "n2", label: "Tile 2 number", type: "text", max: 5 },
    { key: "l2", label: "Tile 2 label", type: "text", max: 22 },
    { key: "n3", label: "Tile 3 number", type: "text", max: 5 },
    { key: "l3", label: "Tile 3 label", type: "text", max: 22 },
    { key: "cmdLine", label: "Terminal tile line", type: "text", max: 32 },
    { key: "pkgs", label: "Packages it types (comma separated)", type: "text" },
    { key: "brand", label: "Name", type: "text", max: 14 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "pill", label: "End card pill", type: "text", max: 24 },
  ],
  prompt: `Make a 14-second product overview video for YouTube, Product Hunt and my website that renders in 16:9, 1:1 and 9:16 from one React component. Apple-clean light #f5f5f7, white rounded tiles with soft shadows, Inter Display. Music 120 BPM; every camera move starts on a beat.

The product is shown as a bento grid of four tiles, re-arranged for each aspect ratio (16:9: one big tile on the left, two small and one wide on the right; 1:1: wide / two small / wide; 9:16: big / two small / wide):
1. "183 animated components": odometer digits, and a mosaic of real component screenshots in three columns scrolling at different speeds behind a fade.
2. "24 interface sounds": a play button and a waveform of rounded bars that moves continuously and kicks on every beat.
3. "22 complete templates": a fan of three real template thumbnails that shuffles, the front card dropping to the back every 1.2s.
4. A dark terminal tile that types npx shadcn@latest add @nexus-labs/<name>, cycling through real package names, under "One command. It's your code."

0–1s: "Everything in Nexus UI." rises and dissolves.
1–2.6s: tiles spring in one after another (scale, lift and de-blur); numbers roll.
2.6–12.6s: a camera (one transform on the whole grid) flies into each tile in turn until it nearly fills the frame, holds while the tile's content plays, then flies to the next. Moves between tiles pull back slightly mid-flight (an arc in zoom), eased in-out, never cut. Zoom is computed from the tile rectangle so it works in every format.
12.6–14s: the camera returns to the full grid, which dims and blurs behind an end card: "Nexus UI", "nexus-ui.com" in the brand gradient, and a pill "Free to start".

Pure function of time t with frame width/height props; numbers, labels and package names are props.`,
};

type Rect = { x: number; y: number; w: number; h: number };
type TileId = "comp" | "sound" | "tpl" | "cmd";
const abs: CSSProperties = { position: "absolute" };

function grid(w: number, h: number, u: number): Record<TileId | "all", Rect> {
  const g = 24 * u;
  if (w > h * 1.2) {
    const A = { x: 120 * u, y: 120 * u, w: w - 240 * u, h: h - 240 * u };
    const cw = (A.w - 3 * g) / 4, rh = (A.h - g) / 2;
    return {
      all: A,
      comp: { x: A.x, y: A.y, w: 2 * cw + g, h: A.h },
      sound: { x: A.x + 2 * (cw + g), y: A.y, w: cw, h: rh },
      tpl: { x: A.x + 3 * (cw + g), y: A.y, w: cw, h: rh },
      cmd: { x: A.x + 2 * (cw + g), y: A.y + rh + g, w: 2 * cw + g, h: rh },
    };
  }
  const tall = h > w * 1.2;
  const A = tall ? { x: 60 * u, y: 160 * u, w: w - 120 * u, h: h - 320 * u } : { x: 60 * u, y: 60 * u, w: w - 120 * u, h: h - 120 * u };
  const rows = tall ? 4 : 3;
  const cw = (A.w - g) / 2, rh = (A.h - (rows - 1) * g) / rows;
  const r = (i: number) => A.y + i * (rh + g);
  const big = tall ? 2 : 1;
  return {
    all: A,
    comp: { x: A.x, y: r(0), w: A.w, h: big * rh + (big - 1) * g },
    sound: { x: A.x, y: r(big), w: cw, h: rh },
    tpl: { x: A.x + cw + g, y: r(big), w: cw, h: rh },
    cmd: { x: A.x, y: r(big + 1), w: A.w, h: rh },
  };
}

const KEYS: [number, TileId | "all"][] = [[0, "all"], [2.6, "all"], [3.4, "comp"], [4.8, "comp"], [5.8, "sound"], [7.2, "sound"], [8.2, "tpl"], [9.6, "tpl"], [10.6, "cmd"], [11.9, "cmd"], [12.7, "all"]];

function camera(t: number, G: Record<TileId | "all", Rect>, w: number, h: number) {
  const view = (k: TileId | "all") => {
    const r = G[k];
    const s = k === "all" ? 1 : Math.max(Math.min(w / r.w, h / r.h) * 0.88, 1.22);
    // when a wide tile is zoomed past the frame, keep its label edge (top-left) in view
    const cx = r.w * s > w * 0.94 ? r.x + (w * 0.5 - 40) / s : r.x + r.w / 2;
    const cy = r.h * s > h * 0.94 ? r.y + (h * 0.5 - 40) / s : r.y + r.h / 2;
    return { cx, cy, s };
  };
  let i = 0;
  while (i < KEYS.length - 1 && t > KEYS[i + 1][0]) i++;
  const [ta, ka] = KEYS[i], [tb, kb] = KEYS[Math.min(i + 1, KEYS.length - 1)];
  const a = view(ka), b = view(kb);
  if (ka === kb || tb === ta) return a;
  const q = ease.inOut(P(t, ta, tb));
  const arc = ka !== "all" && kb !== "all" ? 1 - 0.22 * Math.sin(q * Math.PI) : 1;
  return { cx: lerp(a.cx, b.cx, q), cy: lerp(a.cy, b.cy, q), s: Math.exp(lerp(Math.log(a.s), Math.log(b.s), q)) * arc };
}

const SHOTS = [tPend, tReel, tDock, tPay, tRouter, tIsland, tFolder, tCopy];
const TPLS = [tplNova, tplHelix, tplLaunch, tplAether];

function Tile({ r, t, i, dark, children }: { r: Rect; t: number; i: number; dark?: boolean; children: ReactNode }) {
  const at = 1.05 + i * 0.16;
  const s = spring(t - at, 0.62, 10);
  return (
    <div style={{ ...abs, left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: Math.min(r.w, r.h) * 0.08, overflow: "hidden", background: dark ? "#1c1c1e" : "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 30px 60px -36px rgba(0,0,0,.4)", opacity: clamp((t - at) * 5), transform: `translateY(${(1 - s) * 80}px) scale(${lerp(0.86, 1, s)})`, filter: s < 0.98 ? `blur(${(1 - clamp(s)) * 10}px)` : undefined }}>
      {children}
    </div>
  );
}

export default function BentoTour({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<BentoTourProps>) {
  const p = { ...meta.defaults, ...props };
  const u = Math.min(w, h) / 1080;
  const G = grid(w, h, u);
  const cam = camera(t, G, w, h);
  const end = ease.inOut(P(t, 12.6, 13.1));
  const beat = Math.exp(-((t % 0.5) / 0.12));
  const pkgs = p.pkgs.split(",").map((s) => s.trim()).filter(Boolean);

  const label = (r: Rect, n: string, l: string, q: number, dark?: boolean) => {
    const fs = Math.min(r.w, r.h) * 0.2;
    return (
      <div style={{ ...abs, left: fs * 0.45, top: fs * 0.4, zIndex: 20 }}>
        <Odometer text={n} q={q} size={fs} style={{ fontWeight: 700, letterSpacing: "-0.045em", fontSize: fs, color: dark ? "#fff" : "#1d1d1f" }} />
        <div style={{ marginTop: fs * 0.1, fontFamily: TEXT, fontSize: fs * 0.22, fontWeight: 600, color: dark ? "rgba(255,255,255,.6)" : "#86868b", letterSpacing: "-0.01em" }}>{l}</div>
      </div>
    );
  };

  const C = G.comp, S = G.sound, T = G.tpl, D = G.cmd;
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {blobsFor(t, w, h).map((s, i) => <div key={i} style={s} />)}

      {t < 1.3 && (
        <div style={{ ...abs, left: 0, right: 0, top: h / 2 - 70 * u, textAlign: "center", fontSize: 112 * u, fontWeight: 700, letterSpacing: "-0.05em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, 0, 0.55)), 60, 14), opacity: clamp(ease.expo(P(t, 0, 0.55)) * 1.6) * (1 - P(t, 0.8, 1.15)) }}>{p.intro}</div>
      )}

      <div style={{ ...abs, left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", transform: `translate(${w / 2 - cam.cx * cam.s}px, ${h / 2 - cam.cy * cam.s}px) scale(${cam.s})`, filter: end ? `blur(${end * 12}px)` : undefined, opacity: 1 - end * 0.55 }}>
        {/* components */}
        <Tile r={C} t={t} i={0}>
          {label(C, p.n1, p.l1, P(t, 1.2, 2.4))}
          <div style={{ ...abs, left: C.w * 0.04, right: C.w * 0.04, top: Math.min(C.w, C.h) * 0.36, bottom: 0, display: "flex", gap: C.w * 0.025, WebkitMaskImage: "linear-gradient(transparent, #000 12%, #000 80%, transparent)", maskImage: "linear-gradient(transparent, #000 12%, #000 80%, transparent)" }}>
            {[0, 1, 2].map((col) => {
              const colW = (C.w * 0.92 - 2 * C.w * 0.025) / 3;
              const ih = colW * 0.6, gap = C.w * 0.025;
              const list = [0, 1, 2, 3].map((k) => SHOTS[(col + k * 3) % SHOTS.length]);
              const loop = 4 * (ih + gap);
              const off = ((t * (40 + col * 18) * u + col * 70) % loop + loop) % loop;
              return (
                <div key={col} style={{ position: "relative", flex: 1, overflow: "hidden" }}>
                  <div style={{ ...abs, left: 0, right: 0, top: -off + (col % 2 ? -ih * 0.4 : 0) }}>
                    {[...list, ...list, ...list].map((src, k) => (
                      <div key={k} style={{ height: ih, marginBottom: gap, borderRadius: colW * 0.08, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.06)" }}>
                        <img src={src} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Tile>

        {/* sounds */}
        <Tile r={S} t={t} i={1}>
          {label(S, p.n2, p.l2, P(t, 1.35, 2.5))}
          {(() => {
            const m = Math.min(S.w, S.h);
            const n = 22, bw = (S.w * 0.84) / n;
            return (
              <>
                <div style={{ ...abs, right: m * 0.09, top: m * 0.09, width: m * 0.2, height: m * 0.2, borderRadius: "50%", background: "#0071e3", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + beat * 0.08})` }}>
                  <svg width={m * 0.09} height={m * 0.09} viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5v15l12-7.5z" /></svg>
                </div>
                <div style={{ ...abs, left: S.w * 0.08, right: S.w * 0.08, bottom: S.h * 0.12, height: S.h * 0.36, display: "flex", alignItems: "center", gap: bw * 0.35 }}>
                  {Array.from({ length: n }, (_, i) => {
                    const v = 0.25 + 0.35 * Math.abs(Math.sin(t * 3.1 + i * 0.7)) * Math.abs(Math.cos(t * 1.7 + i * 0.31)) + beat * 0.4 * Math.exp(-Math.abs(i - n / 2) / 5);
                    return <span key={i} style={{ flex: 1, height: `${clamp(v) * 100}%`, borderRadius: bw, background: i < ((t * 4) % n) ? "#0071e3" : "#cfe3ff" }} />;
                  })}
                </div>
              </>
            );
          })()}
        </Tile>

        {/* templates */}
        <Tile r={T} t={t} i={2}>
          {label(T, p.n3, p.l3, P(t, 1.5, 2.6))}
          {(() => {
            const cw = T.w * 0.5, chh = cw * 0.83;
            const phase = t / 1.2;
            const step = Math.floor(phase), f = ease.inOut(clamp((phase - step) / 0.45));
            return [0, 1, 2].map((slot) => {
              // card at depth `slot` (0 = front); the front card falls to the back each step
              const idx = (step + slot) % TPLS.length;
              const d = slot - f; // moving forward
              const isLeaving = slot === 0;
              const depth = isLeaving ? lerp(0, 2.6, f) : d;
              const x = T.w * 0.5 + depth * T.w * 0.09 - cw / 2 + (isLeaving ? Math.sin(f * Math.PI) * T.w * 0.28 : 0);
              const y = T.h * 0.47 + depth * -T.h * 0.045;
              return (
                <div key={`${idx}-${step}`} style={{ ...abs, left: x, top: y, width: cw, height: chh, borderRadius: cw * 0.07, overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.08),0 18px 30px -18px rgba(0,0,0,.45)", transform: `rotate(${depth * 5 - 4}deg) scale(${1 - depth * 0.06})`, zIndex: isLeaving && f > 0.5 ? 0 : 10 - Math.round(depth * 2), opacity: depth > 2.4 ? 1 - (depth - 2.4) * 4 : 1 }}>
                  <img src={TPLS[idx]} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              );
            });
          })()}
        </Tile>

        {/* command */}
        <Tile r={D} t={t} i={3} dark>
          {(() => {
            const m = Math.min(D.w, D.h);
            const cycle = 2.2;
            const k = Math.floor(Math.max(0, t - 1.6) / cycle) % Math.max(1, pkgs.length);
            const local = (Math.max(0, t - 1.6) % cycle) / cycle;
            const cmd = `npx shadcn@latest add @nexus-labs/${pkgs[k] ?? ""}`;
            const shown = cmd.slice(0, Math.floor(clamp(local / 0.6) * cmd.length));
            const ok = local > 0.66;
            return (
              <>
                <div style={{ ...abs, left: m * 0.12, top: m * 0.14, fontSize: m * 0.11, fontWeight: 700, letterSpacing: "-0.04em", color: "#fff", whiteSpace: "nowrap" }}>{p.cmdLine}</div>
                <div style={{ ...abs, left: m * 0.12, right: m * 0.12, top: m * 0.42, fontFamily: MONO, fontSize: m * 0.065, lineHeight: 1.5, color: "#f5f5f7", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
                  <span style={{ color: "#30d158" }}>$</span> {shown}
                  {!ok && <span style={{ display: "inline-block", width: m * 0.035, height: m * 0.07, background: "#f5f5f7", verticalAlign: -m * 0.012, marginLeft: m * 0.008 }} />}
                  {ok && <div style={{ color: "#30d158", opacity: clamp((local - 0.66) * 10) }}>✓ Created components/ui/{pkgs[k]}.tsx</div>}
                </div>
              </>
            );
          })()}
        </Tile>
      </div>

      {t > 12.7 && (
        <div style={{ ...abs, inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 * u }}>
          <div style={{ fontSize: 150 * u, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 12.75, 13.3)), 50, 14) }}>{p.brand}</div>
          <div style={{ fontSize: 60 * u, fontWeight: 600, letterSpacing: "-0.03em", ...rise(ease.expo(P(t, 12.95, 13.5)), 30, 10) }}><span style={gradText(GRAD)}>{p.url}</span></div>
          <div style={{ marginTop: 12 * u, ...rise(ease.expo(P(t, 13.15, 13.7)), 24, 8) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12 * u, padding: `${14 * u}px ${28 * u}px`, borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 30 * u, fontWeight: 600 }}>
              <span style={{ width: 12 * u, height: 12 * u, borderRadius: 6 * u, background: "#30d158" }} />{p.pill}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
