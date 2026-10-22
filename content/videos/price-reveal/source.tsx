import type { CSSProperties } from "react";
import { FONT, GRAD, H, P, TEXT, W, bgBlobs, clamp, ease, gradText, lerp, rise, type VideoMeta } from "./kit";

export interface PriceRevealProps {
  intro: string;
  items: string;
  extra: string;
  price: string;
  once: string;
  alt: string;
  brand: string;
  url: string;
  pill: string;
}

export const meta: VideoMeta<PriceRevealProps> = {
  id: "price-reveal",
  title: "Price Reveal",
  platforms: ["Reels", "TikTok", "Shorts"],
  purpose: "Pricing & offers",
  motion: "Odometer counts into a ledger",
  app: "Nexus UI",
  duration: 10,
  bpm: 120,
  cuts: [0.5, 1.5, 2.5, 3.5, 5.5, 8],
  blurb: "Show what people get before you say the price. Each number rolls in like an odometer on the beat and files itself into a ledger, then the price spins into place like a slot reel.",
  defaults: {
    intro: "Everything in Pro.",
    items: "183 components, 92 blocks, 22 templates, 24 sounds",
    extra: "+ everything we release next",
    price: "$79.99",
    once: "once, for everything.",
    alt: "or $49.99 a year",
    brand: "Nexus UI Pro",
    url: "nexus-ui.com",
    pill: "68 components free to try",
  },
  fields: [
    { key: "intro", label: "Opening line", type: "text", max: 24 },
    { key: "items", label: "What you get (number + word, comma separated, 4 max)", type: "text" },
    { key: "extra", label: "Extra ledger line", type: "text", max: 32 },
    { key: "price", label: "Price", type: "text", max: 8 },
    { key: "once", label: "Under the price", type: "text", max: 26 },
    { key: "alt", label: "Second option", type: "text", max: 24 },
    { key: "brand", label: "End card name", type: "text", max: 16 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "pill", label: "End card pill", type: "text", max: 30 },
  ],
  prompt: `Make a 10-second vertical (1080×1920, 30fps) pricing video for my component library's Pro plan, clean Apple style on light #f5f5f7 with soft drifting colour light. Inter Display, bold, tabular numbers. Music: 120 BPM, a tick on every number landing and a bigger hit when the price lands.

The idea: show what people get before showing the price, using odometer digits.

0–0.5s: "Everything in Pro." rises in near the top.
0.5–4.4s: Four counters, one per beat-bar: 183 components, 92 blocks, 22 templates, 24 sounds. Each number appears huge (300px) in the centre and every digit rolls like an odometer: each digit column spins through 0–9 one or more times and settles on its target, the rightmost digits spinning longest and landing last, with vertical motion blur while they move. The word fades up under it in grey. After a short hold, the big number shrinks and slides up into a ledger at the top: rows of "number · word", numbers right-aligned in a column, each row rising in as the big number leaves.
4.4–5.4s: A hairline draws under the ledger from left to right, then "+ everything we release next" appears in a blue→purple→pink→orange gradient.
5.5–7.8s: The ledger dims and lifts. The price "$79.99" spins into the centre like a slot machine: each digit reel spins fast and stops left to right on consecutive frames, the "$" and "." stay still. Under it "once, for everything." then a lighter "or $49.99 a year". A soft white light sweeps across the price once.
8–10s: Everything dissolves; end card "Nexus UI Pro", "nexus-ui.com" in grey and a white pill "68 components free to try" with a green dot.

Make it a React component that is a pure function of time t, with the ledger items, price and copy as props.`,
};

const abs: CSSProperties = { position: "absolute" };

/** A number whose digits roll like an odometer. q runs 0..1 over the roll. */
function Odo({ text, q, size, stagger = 0.18, spins = 1, color = "#1d1d1f", style }: { text: string; q: number; size: number; stagger?: number; spins?: number; color?: string; style?: CSSProperties }) {
  const chars = [...text];
  const digitIdx = chars.map((c, i) => (/\d/.test(c) ? i : -1)).filter((i) => i >= 0);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", fontSize: size, lineHeight: 1, fontWeight: 700, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums", color, ...style }}>
      {chars.map((c, i) => {
        if (!/\d/.test(c)) return <span key={i}>{c}</span>;
        const order = digitIdx.indexOf(i);
        const n = digitIdx.length;
        const a = (order / Math.max(1, n)) * stagger;
        const local = clamp((q - a) / (1 - stagger));
        const e = ease.quint(local);
        const target = +c + 10 * (spins + order);
        const pos = target * e;
        const v = Math.abs(ease.quint(clamp(local + 0.03)) - e) * target;
        return (
          <span key={i} style={{ position: "relative", display: "inline-block", height: size * 1.2, lineHeight: 1.2, overflow: "hidden", margin: `${-size * 0.1}px 0`, WebkitMaskImage: "linear-gradient(transparent, #000 14%, #000 86%, transparent)", maskImage: "linear-gradient(transparent, #000 14%, #000 86%, transparent)" }}>
            <span style={{ visibility: "hidden" }}>0</span>
            <span style={{ position: "absolute", left: 0, top: 0, transform: `translateY(${-pos * size * 1.2}px)`, filter: v > 0.15 ? `blur(${Math.min(6, v * 3)}px)` : undefined }}>
              {Array.from({ length: target + 1 }, (_, k) => <span key={k} style={{ display: "block", height: size * 1.2 }}>{k % 10}</span>)}
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function PriceReveal({ t, ...props }: { t: number } & Partial<PriceRevealProps>) {
  const p = { ...meta.defaults, ...props };
  const items = p.items.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4).map((s) => {
    const m = s.match(/^(\S+)\s+(.*)$/);
    return m ? { n: m[1], w: m[2] } : { n: s, w: "" };
  });
  const LEDGER_Y = 470, ROW = 92;
  const dim = ease.inOut(P(t, 5.3, 5.9));
  const endOut = P(t, 7.8, 8.15);

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {bgBlobs(t, "rgba(94,92,230,.14)", "rgba(242,92,5,.10)").map((s, i) => <div key={i} style={s} />)}

      <div style={{ ...abs, inset: 0, opacity: 1 - endOut, filter: endOut ? `blur(${endOut * 10}px)` : undefined }}>
        {/* intro line */}
        <div style={{ ...abs, left: 0, right: 0, top: 300, textAlign: "center", fontSize: 64, fontWeight: 600, letterSpacing: "-0.035em", ...rise(ease.expo(P(t, 0.05, 0.6)), 40, 12), opacity: clamp(ease.expo(P(t, 0.05, 0.6)) * 1.6) * (1 - dim * 0.7) }}>{p.intro}</div>

        {/* big counters */}
        {items.map((it, k) => {
          const s = 0.5 + k * 1.0;
          if (t < s - 0.05 || t > s + 1.25) return null;
          const q = P(t, s, s + 0.62);
          const leave = ease.inOut(P(t, s + 0.85, s + 1.2));
          const ty = lerp(0, LEDGER_Y + k * ROW - 760, leave);
          const sc = lerp(1, 0.24, leave);
          return (
            <div key={k} style={{ ...abs, left: 0, right: 0, top: 760, textAlign: "center", transformOrigin: "540px 0", transform: `translate(${-180 * leave}px, ${ty}px) scale(${sc})`, opacity: clamp(P(t, s - 0.05, s + 0.08)) * (1 - P(t, s + 1.0, s + 1.2)) }}>
              <Odo text={it.n} q={q} size={300} />
              <div style={{ fontSize: 64, fontWeight: 600, color: "#86868b", letterSpacing: "-0.03em", marginTop: 26, ...rise(ease.expo(P(t, s + 0.25, s + 0.7)), 26, 8) }}>{it.w}</div>
            </div>
          );
        })}

        {/* ledger */}
        <div style={{ ...abs, left: 0, top: 0, width: W, transformOrigin: "540px 470px", transform: `translateY(${-dim * 60}px) scale(${lerp(1, 0.92, dim)})`, opacity: lerp(1, 0.4, dim) }}>
          {items.map((it, k) => {
            const s = 0.5 + k * 1.0 + 0.95;
            const pr = ease.expo(P(t, s, s + 0.45));
            return (
              <div key={k} style={{ ...abs, top: LEDGER_Y + k * ROW, left: 0, width: W, display: "flex", alignItems: "baseline", ...rise(pr, 24, 8) }}>
                <span style={{ width: 430, textAlign: "right", fontSize: 72, fontWeight: 700, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>{it.n}</span>
                <span style={{ marginLeft: 28, fontSize: 56, fontWeight: 500, color: "#6e6e73", letterSpacing: "-0.025em" }}>{it.w}</span>
              </div>
            );
          })}
          <div style={{ ...abs, left: 200, top: LEDGER_Y + items.length * ROW + 18, height: 3, borderRadius: 2, background: "#1d1d1f", width: 680 * ease.inOut(P(t, 4.4, 4.85)), opacity: 0.85 }} />
          <div style={{ ...abs, left: 0, right: 0, top: LEDGER_Y + items.length * ROW + 52, textAlign: "center", fontSize: 50, fontWeight: 600, letterSpacing: "-0.03em", ...rise(ease.expo(P(t, 4.75, 5.25)), 24, 10) }}>
            <span style={gradText()}>{p.extra}</span>
          </div>
        </div>

        {/* price */}
        {t > 5.35 && (
          <>
            <div style={{ ...abs, left: 0, right: 0, top: 1060, textAlign: "center", opacity: clamp(P(t, 5.4, 5.55)) }}>
              <span style={{ position: "relative", display: "inline-block" }}>
                <Odo text={p.price} q={P(t, 5.5, 6.35)} size={260} stagger={0.35} spins={2} />
                {/* light sweep */}
                <span style={{ ...abs, inset: 0, background: "linear-gradient(100deg, transparent 35%, rgba(255,255,255,.9) 50%, transparent 65%)", backgroundSize: "300% 100%", backgroundPosition: `${lerp(120, -20, ease.inOut(P(t, 6.9, 7.6)))}% 0`, mixBlendMode: "soft-light", opacity: P(t, 6.85, 6.95) * (1 - P(t, 7.55, 7.7)) }} />
              </span>
            </div>
            <div style={{ ...abs, left: 0, right: 0, top: 1350, textAlign: "center", fontSize: 64, fontWeight: 600, letterSpacing: "-0.035em", ...rise(ease.expo(P(t, 6.1, 6.6)), 30, 10) }}>{p.once}</div>
            <div style={{ ...abs, left: 0, right: 0, top: 1450, textAlign: "center", fontSize: 44, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 6.5, 7.0)), 24, 8) }}>{p.alt}</div>
          </>
        )}
      </div>

      {/* end card */}
      {t > 7.95 && (
        <div style={{ ...abs, inset: 0 }}>
          <div style={{ ...abs, left: 0, right: 0, top: 760, textAlign: "center", fontSize: 124, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 8.1, 8.7)), 60, 16) }}>
            {p.brand.split(" ").map((w, i, a) => i === a.length - 1 && a.length > 1 ? <span key={i} style={gradText(GRAD)}>{w}</span> : <span key={i}>{w} </span>)}
          </div>
          <div style={{ ...abs, left: 0, right: 0, top: 920, textAlign: "center", fontSize: 54, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 8.3, 8.85)), 40, 12) }}>{p.url}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 1050, textAlign: "center", ...rise(ease.expo(P(t, 8.5, 9.05)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 18px 36px -20px rgba(0,0,0,.3)", fontFamily: TEXT, fontSize: 32, fontWeight: 500 }}>
              <span style={{ width: 13, height: 13, borderRadius: 7, background: "#30d158" }} />{p.pill}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
