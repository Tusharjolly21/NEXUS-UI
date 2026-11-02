import type { CSSProperties } from "react";
import { FONT, P, TEXT, blobsFor, clamp, ease, lerp, rand, rise, spring, type Frame, type VideoMeta, assetUrl } from "./kit";
import { Cursor, Odometer } from "./parts";
import logoImgFile from "./assets/nexus-logo.png";
import tReelFile from "./assets/tile-reel.jpg";
import tDockFile from "./assets/tile-dock.jpg";
import tRouterFile from "./assets/tile-router.jpg";
import tPendFile from "./assets/tile-pend.jpg";
import tIslandFile from "./assets/tile-island.jpg";

// Imported files as URL strings, whichever bundler you use (see assetUrl in kit.ts).
const logoImg = assetUrl(logoImgFile);
const tReel = assetUrl(tReelFile);
const tDock = assetUrl(tDockFile);
const tRouter = assetUrl(tRouterFile);
const tPend = assetUrl(tPendFile);
const tIsland = assetUrl(tIslandFile);

export interface LaunchDayProps {
  where: string;
  name: string;
  tagline: string;
  tags: string;
  votes: string;
  accent: string;
  ask: string;
  cta: string;
}

export const meta: VideoMeta<LaunchDayProps> = {
  id: "launch-day",
  title: "Launch Day",
  platforms: ["Product Hunt", "X", "LinkedIn"],
  formats: ["16:9", "1:1", "9:16"],
  purpose: "Launch announcement",
  motion: "Upvote press bursts into physics confetti",
  app: "Nexus UI",
  duration: 10,
  bpm: 120,
  cuts: [1.0, 2.0, 3.5, 5.5, 8.0],
  blurb: "For the morning you launch. The listing card springs in, a cursor presses upvote and the arrow shoots off in a burst of little triangles that fall with real gravity, while your gallery scrolls underneath.",
  defaults: {
    where: "Product Hunt",
    name: "Nexus UI",
    tagline: "Animated React components you copy and paste",
    tags: "Design Tools, Developer Tools, Open Source",
    votes: "",
    accent: "#ff6154",
    ask: "We're live on Product Hunt today.",
    cta: "Search “Nexus UI” on Product Hunt",
  },
  fields: [
    { key: "where", label: "Where you launched", type: "text", max: 16 },
    { key: "name", label: "Product name", type: "text", max: 16 },
    { key: "tagline", label: "Tagline", type: "text", max: 48 },
    { key: "tags", label: "Topics (comma separated)", type: "text" },
    { key: "votes", label: "Upvotes (optional, your real number)", type: "text", max: 5 },
    { key: "accent", label: "Accent", type: "color" },
    { key: "ask", label: "Headline", type: "text", max: 36 },
    { key: "cta", label: "Call to action", type: "text", max: 40 },
  ],
  prompt: `Make a 10-second launch-day video for Product Hunt, X and LinkedIn that renders in 16:9, 1:1 and 9:16 from one React component. Apple-clean light #f5f5f7, Inter Display, one warm accent (#ff6154). Music 120 BPM, bright; a pop on the upvote and a sparkle as the burst falls.

0–1.6s: "We're live on Product Hunt today." rises in word by word, then moves up to become the caption. (No third-party logos; the words do the work.)
1.6–3.4s: A listing card springs up: our app icon, name, tagline, three topic chips and a big outlined upvote button (triangle and an optional count) on the right; in portrait the button sits under the text.
3.4–4.4s: A cursor glides to the upvote and presses it: the button squashes, fills with the accent colour, the triangle shoots up and comes back, and the count (if given) rolls up by one like an odometer.
4.4–7s: The press releases a burst of ~40 tiny triangles that fly out and fall under real gravity with spin and air drag (deterministic, seeded), fading as they leave the frame.
5–8s: Under the card, a gallery strip of real product screenshots scrolls sideways like a filmstrip.
8–10s: Card and strip lift away; end card with the icon, "Search “Nexus UI” on Product Hunt" and a small "Link in bio".

Pure function of time t with frame size props; name, tagline, topics, optional upvote count and accent are props.`,
};

const abs: CSSProperties = { position: "absolute" };
const SHOTS = [tReel, tDock, tRouter, tPend, tIsland];

export default function LaunchDay({ t, w = 1920, h = 1080, ...props }: { t: number } & Frame & Partial<LaunchDayProps>) {
  const p = { ...meta.defaults, ...props };
  const A = p.accent;
  const land = w > h * 1.2, tall = h > w * 1.2;
  const u = Math.min(w, h) / 1080;
  const words = p.ask.split(" ");
  const up = ease.inOut(P(t, 1.5, 2.1));
  const capY = lerp(h / 2 - 70 * u, (tall ? 0.1 : 0.07) * h, up);
  const capS = lerp(1, land ? 0.7 : 0.62, up);
  const out = ease.in(P(t, 7.9, 8.4));

  // card geometry
  const cw = land ? 1240 * u : w - 120 * u;
  const chh = tall ? 560 * u : 300 * u;
  const cx = (w - cw) / 2;
  const cy = land ? h * 0.3 : tall ? h * 0.27 : h * 0.26;
  const cardIn = spring(t - 1.65, 0.7, 10);
  const btnW = tall ? cw - 96 * u : 170 * u, btnH = tall ? 120 * u : 190 * u;
  const bx = tall ? cx + 48 * u : cx + cw - btnW - 48 * u;
  const by = tall ? cy + chh - btnH - 48 * u : cy + (chh - btnH) / 2;
  const press = P(t, 4.05, 4.2);
  const pressed = t > 4.12;
  const squash = t > 4.05 ? 1 - Math.sin(clamp(P(t, 4.05, 4.3)) * Math.PI) * 0.08 : 1;
  const arrowJump = t > 4.12 ? Math.sin(clamp(P(t, 4.12, 4.6)) * Math.PI) * 26 * u : 0;
  const curP = ease.inOut(P(t, 3.3, 4.0));
  const curX = lerp(w * 0.9, bx + btnW * 0.55, curP), curY = lerp(h * 1.02, by + btnH * 0.62, curP);
  const votes = p.votes.replace(/\D/g, "");
  const shownVotes = votes ? (pressed ? votes : String(Math.max(0, +votes - 1))) : "";

  // physics burst (closed form: ballistic with drag)
  const bx0 = bx + btnW / 2, by0 = by + btnH * 0.3;
  const parts = t > 4.12 ? Array.from({ length: 42 }, (_, i) => {
    const s = t - 4.12 - rand(i) * 0.08;
    if (s <= 0) return null;
    const ang = -Math.PI / 2 + (rand(i + 50) - 0.5) * 2.4;
    const v = (700 + rand(i + 99) * 900) * u;
    const k = 1.6; // drag
    const g = 2200 * u;
    const e = (1 - Math.exp(-k * s)) / k;
    const x = bx0 + Math.cos(ang) * v * e;
    const y = by0 + Math.sin(ang) * v * e + (g / k) * (s - e);
    const rot = (rand(i + 7) - 0.5) * 900 * s;
    const sz = (14 + rand(i + 3) * 18) * u;
    return { x, y, rot, sz, o: 1 - P(s, 1.6, 2.6), c: i % 3 === 0 ? "#1d1d1f" : i % 3 === 1 ? A : "#ffb340" };
  }) : [];

  const tags = p.tags.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);
  const stripY = cy + chh + (tall ? 70 : 60) * u;
  const tileW = (tall ? 520 : land ? 460 : 420) * u, tileH = tileW * 0.55;
  const stripOff = (t - 4.6) * 120 * u;

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {blobsFor(t, w, h, `${A}22`, "rgba(255,179,64,.14)").map((s, i) => <div key={i} style={s} />)}

      {/* headline -> caption */}
      <div style={{ ...abs, left: 0, right: 0, top: capY, textAlign: "center", transformOrigin: "50% 0", transform: `scale(${capS})`, opacity: 1 - out, padding: `0 ${40 * u}px` }}>
        <div style={{ fontSize: (land ? 104 : 92) * u, fontWeight: 700, letterSpacing: "-0.05em", lineHeight: 1.08 }}>
          {words.map((wd, i) => (
            <span key={i} style={{ display: "inline-block", whiteSpace: "pre", color: /hunt/i.test(wd) || /product/i.test(wd) ? A : undefined, ...rise(ease.expo(P(t, 0.05 + i * 0.08, 0.6 + i * 0.08)), 50, 12) }}>{wd + (i < words.length - 1 ? " " : "")}</span>
          ))}
        </div>
      </div>

      <div style={{ ...abs, inset: 0, opacity: 1 - out, transform: `translateY(${-out * 120 * u}px)`, filter: out ? `blur(${out * 12}px)` : undefined }}>
        {/* gallery strip */}
        {t > 4.6 && (
          <div style={{ ...abs, left: 0, right: 0, top: stripY, height: tileH, opacity: clamp(P(t, 4.6, 5.0)), WebkitMaskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)", maskImage: "linear-gradient(90deg, transparent, #000 10%, #000 90%, transparent)" }}>
            {Array.from({ length: 10 }, (_, i) => {
              const loop = SHOTS.length * (tileW + 24 * u);
              const x = ((i * (tileW + 24 * u) - stripOff) % (2 * loop) + 2 * loop) % (2 * loop) - tileW;
              return (
                <div key={i} style={{ ...abs, left: x, top: (1 - spring(t - 4.6 - i * 0.05, 0.7, 10)) * 80 * u, width: tileW, height: tileH, borderRadius: 22 * u, overflow: "hidden", background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 20px 40px -26px rgba(0,0,0,.4)" }}>
                  <img src={SHOTS[i % SHOTS.length]} alt="" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              );
            })}
          </div>
        )}

        {/* listing card */}
        {t > 1.6 && (
          <div style={{ ...abs, left: cx, top: cy, width: cw, height: chh, borderRadius: 34 * u, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 40px 80px -40px rgba(0,0,0,.45)", transform: `translateY(${(1 - cardIn) * 260 * u}px)`, opacity: clamp(cardIn * 3) }}>
            <img src={logoImg} alt="" style={{ ...abs, left: 48 * u, top: 48 * u, width: 132 * u, height: 132 * u, borderRadius: 32 * u }} />
            <div style={{ ...abs, left: 210 * u, top: 50 * u, right: tall ? 48 * u : btnW + 96 * u }}>
              <div style={{ fontSize: 56 * u, fontWeight: 700, letterSpacing: "-0.04em" }}>{p.name}</div>
              <div style={{ marginTop: 6 * u, fontFamily: TEXT, fontSize: 28 * u, color: "#6e6e73", lineHeight: 1.3 }}>{p.tagline}</div>
            </div>
            <div style={{ ...abs, left: 48 * u, top: tall ? 250 * u : 212 * u, display: "flex", flexWrap: "wrap", gap: 12 * u, right: tall ? 48 * u : btnW + 96 * u }}>
              {tags.map((s, i) => <span key={s} style={{ padding: `${8 * u}px ${18 * u}px`, borderRadius: 999, background: "#f5f5f7", fontFamily: TEXT, fontSize: 22 * u, fontWeight: 600, color: "#424245", transform: `scale(${spring(t - 2.2 - i * 0.08, 0.5, 13)})` }}>{s}</span>)}
            </div>
          </div>
        )}
        {/* upvote button */}
        {t > 1.6 && (
          <div style={{ ...abs, left: bx, top: by + (1 - cardIn) * 260 * u, width: btnW, height: btnH, borderRadius: 28 * u, border: `${3 * u}px solid ${pressed ? A : "#d2d2d7"}`, background: pressed ? A : "#fff", display: "flex", flexDirection: tall ? "row" : "column", alignItems: "center", justifyContent: "center", gap: 10 * u, color: pressed ? "#fff" : "#1d1d1f", transform: `scale(${squash})`, opacity: clamp(cardIn * 3) }}>
            <svg width={52 * u} height={44 * u} viewBox="0 0 26 22" style={{ transform: `translateY(${-arrowJump}px)` }}><path d="M13 2L24 20H2z" fill={pressed ? "#fff" : "none"} stroke={pressed ? "#fff" : "#1d1d1f"} strokeWidth="2.6" strokeLinejoin="round" /></svg>
            <span style={{ fontSize: 40 * u, fontWeight: 700, letterSpacing: "-0.03em" }}>
              {shownVotes ? (pressed && t < 4.9 ? <Odometer text={shownVotes} q={P(t, 4.12, 4.7)} size={40 * u} /> : shownVotes) : "Upvote"}
            </span>
          </div>
        )}
        {parts.map((q, i) => q && q.o > 0 && q.y < h + 40 && (
          <svg key={i} width={q.sz} height={q.sz} viewBox="0 0 10 10" style={{ ...abs, left: q.x - q.sz / 2, top: q.y - q.sz / 2, transform: `rotate(${q.rot}deg)`, opacity: q.o }}><path d="M5 1L9.5 9H.5z" fill={q.c} /></svg>
        ))}
        {t > 3.2 && t < 5.0 && <Cursor x={curX} y={curY} size={54 * u} press={press > 0 && press < 1 ? 1 : 0} opacity={1 - P(t, 4.6, 5.0)} />}
      </div>

      {t > 8.1 && (
        <div style={{ ...abs, inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24 * u, padding: `0 ${60 * u}px`, textAlign: "center" }}>
          <img src={logoImg} alt="" style={{ width: 150 * u, height: 150 * u, borderRadius: 38 * u, transform: `scale(${lerp(0.3, 1, spring(t - 8.15, 0.5, 13))}) rotate(${(1 - spring(t - 8.15, 0.5, 13)) * -25}deg)`, boxShadow: "0 30px 60px -24px rgba(0,0,0,.45)" }} />
          <div style={{ fontSize: (land ? 84 : 72) * u, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.1, ...rise(ease.expo(P(t, 8.3, 8.9)), 40, 12) }}>{p.cta}</div>
          <div style={{ ...rise(ease.expo(P(t, 8.55, 9.1)), 24, 8) }}>
            <span style={{ display: "inline-flex", padding: `${14 * u}px ${28 * u}px`, borderRadius: 999, background: A, color: "#fff", fontFamily: TEXT, fontSize: 30 * u, fontWeight: 700 }}>Link in bio</span>
          </div>
        </div>
      )}
    </div>
  );
}
