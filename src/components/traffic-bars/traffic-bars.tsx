"use client";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";

export type TrafficBarsTheme = "auto" | "light" | "dark";

export interface TrafficBarsProps {
  /** "auto" follows the page (`.dark` on an ancestor); "light" or "dark" pins the card's palette. */
  theme?: TrafficBarsTheme;
  /** Fill for the Direct, Search and Referral slices, bottom to top. */
  colors?: string[];
  /** Corner radius of each slice, in SVG units. */
  radius?: number;
  /** Delay between neighbouring days when slices regroup, in ms. */
  stagger?: number;
  /** Scrubs along the columns and flips Day/Week every few seconds until someone interacts. */
  autoplay?: boolean;
}

/**
 * Palette as CSS variables so springs and SVG fills can follow the theme.
 * Written out in full so Tailwind sees every class.
 */
const THEME_VARS: Record<TrafficBarsTheme, string> = {
  light:
    "[--tb-card:#ffffff] [--tb-text:#1d1d1f] [--tb-sub:#6e6e73] [--tb-grid:#ececf0] [--tb-seg:#f0f0f3] [--tb-seg-on:#ffffff] [--tb-tip:#1d1d1f] [--tb-tip-text:#ffffff] [--tb-tip-sub:rgba(255,255,255,.6)] [--tb-ring:#1d1d1f] [--tb-edge:0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)]",
  dark:
    "[--tb-card:#1c1c1e] [--tb-text:#f5f5f7] [--tb-sub:#98989d] [--tb-grid:#2c2c2e] [--tb-seg:#2c2c2e] [--tb-seg-on:#48484a] [--tb-tip:#f5f5f7] [--tb-tip-text:#1d1d1f] [--tb-tip-sub:rgba(29,29,31,.6)] [--tb-ring:#f5f5f7] [--tb-edge:0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
  auto:
    "[--tb-card:#ffffff] [--tb-text:#1d1d1f] [--tb-sub:#6e6e73] [--tb-grid:#ececf0] [--tb-seg:#f0f0f3] [--tb-seg-on:#ffffff] [--tb-tip:#1d1d1f] [--tb-tip-text:#ffffff] [--tb-tip-sub:rgba(255,255,255,.6)] [--tb-ring:#1d1d1f] [--tb-edge:0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:[--tb-card:#1c1c1e] dark:[--tb-text:#f5f5f7] dark:[--tb-sub:#98989d] dark:[--tb-grid:#2c2c2e] dark:[--tb-seg:#2c2c2e] dark:[--tb-seg-on:#48484a] dark:[--tb-tip:#f5f5f7] dark:[--tb-tip-text:#1d1d1f] dark:[--tb-tip-sub:rgba(29,29,31,.6)] dark:[--tb-ring:#f5f5f7] dark:[--tb-edge:0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]",
};

const SERIES = [
  { key: "direct", label: "Direct" },
  { key: "search", label: "Search" },
  { key: "referral", label: "Referral" },
] as const;
const DEFAULT_COLORS = ["#0071e3", "#64d2ff", "#bf5af2"];
const DAYS = 28, W = 336, H = 150, TW = 140;

/** 28 days of seeded demo traffic: weekends dip, the month trends up. */
function makeData(seed = 11) {
  let s = seed;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: DAYS }, (_, d) => {
    const weekend = d % 7 === 5 || d % 7 === 6 ? 0.62 : 1;
    const trend = 1 + d / 60;
    return [Math.round((300 + r() * 260) * weekend * trend), Math.round((200 + r() * 220) * weekend * trend), Math.round((60 + r() * 120) * weekend * trend)];
  });
}
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const dateLabel = (d: number) => new Date(2026, 8, 22 + d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

function Count({ value }: { value: number }) {
  const mv = useSpring(value, { stiffness: 140, damping: 22 });
  useEffect(() => {
    mv.set(value);
  }, [value, mv]);
  const text = useTransform(mv, fmt);
  return <motion.span style={{ color: "var(--tb-text)" }}>{text}</motion.span>;
}

/**
 * Stacked traffic bars you can run your pointer along. The column under you
 * is ringed, the rest dim, and a tooltip glides beside it. Switch Day to Week
 * and every day's slices fly over and pile up into their week, so you can see
 * where each total came from.
 */
export function TrafficBars({ theme = "auto", colors = DEFAULT_COLORS, radius = 2, stagger = 12, autoplay = false }: TrafficBarsProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const data = useMemo(() => makeData(), []);
  const [mode, setMode] = useState<"day" | "week">("day");
  const [hover, setHover] = useState<number | null>(null);
  const [engaged, setEngaged] = useState(false);
  const touched = useRef(false);
  const plot = useRef<HTMLDivElement>(null);

  const cols = mode === "day" ? DAYS : 4;
  const gap = mode === "day" ? 4 : 18;
  const bw = (W - gap * (cols - 1)) / cols;
  const hi = hover !== null && hover < cols ? hover : null;
  const weekTotals = useMemo(() => [0, 1, 2, 3].map((w) => SERIES.map((_, s) => data.slice(w * 7, w * 7 + 7).reduce((a, d) => a + d[s], 0))), [data]);
  const colTotals = mode === "day" ? data.map((d) => d[0] + d[1] + d[2]) : weekTotals.map((w) => w[0] + w[1] + w[2]);
  const max = Math.max(...colTotals) * 1.08;
  const yk = (H - 6) / max;
  const total = data.reduce((a, d) => a + d[0] + d[1] + d[2], 0);

  // Where every slice sits in both layouts. In Week mode a day's slice is
  // stacked inside its week's band for that series, so the regroup is literal.
  const rects = useMemo(() => {
    const out: { key: string; d: number; s: number; x: number; y: number; w: number; h: number }[] = [];
    data.forEach((day, d) => {
      if (mode === "day") {
        let base = H;
        day.forEach((v, s) => {
          const h = v * yk;
          base -= h;
          out.push({ key: `${d}-${s}`, d, s, x: d * (bw + gap), y: base, w: bw, h });
        });
      } else {
        const wk = Math.floor(d / 7), k = d % 7;
        let bandBase = H;
        for (let s = 0; s < 3; s++) {
          const below = data.slice(wk * 7, wk * 7 + k).reduce((a, dd) => a + dd[s], 0);
          const h = day[s] * yk;
          const y = bandBase - below * yk - h;
          out.push({ key: `${d}-${s}`, d, s, x: wk * (bw + gap), y, w: bw, h });
          bandBase -= weekTotals[wk][s] * yk;
        }
      }
    });
    return out;
  }, [data, mode, yk, bw, gap, weekTotals]);

  const colOf = (d: number) => (mode === "day" ? d : Math.floor(d / 7));
  const ringX = useMotionValue(0);
  const ringXs = useSpring(ringX, { stiffness: 420, damping: 34 });
  // Tooltip sits beside the column, flips to the other side near the edge and
  // never leaves the card.
  const pw = useMotionValue(W);
  const bwMv = useMotionValue(bw);
  useEffect(() => {
    bwMv.set(bw);
  }, [bw, bwMv]);
  const tipX = useTransform([ringXs, pw, bwMv] as MotionValue<number>[], ([x, w, b]: number[]) => {
    const k = w / W, cx = x * k, bp = b * k;
    let L = cx + bp + 10;
    if (L + TW > w + 12) L = cx - 10 - TW;
    return Math.max(-12, Math.min(w + 12 - TW, L));
  });
  useEffect(() => {
    const el = plot.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      pw.set(el.offsetWidth);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [pw]);
  const wasHover = useRef(false);
  useEffect(() => {
    if (hi === null) {
      wasHover.current = false;
      return;
    }
    const x = hi * (bw + gap);
    if (!wasHover.current) {
      ringX.jump(x);
      ringXs.jump(x);
    } else ringX.set(x);
    wasHover.current = true;
  }, [hi, bw, gap, ringX, ringXs]);

  const engage = () => {
    touched.current = true;
    setEngaged(true);
  };

  const pick = (e: RPointerEvent) => {
    engage();
    const el = plot.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * W;
    setHover(Math.max(0, Math.min(cols - 1, Math.floor((x + gap / 2) / (bw + gap)))));
  };

  const onKey = (e: RKeyboardEvent) => {
    const last = cols - 1;
    let next: number | null | undefined;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = hi === null ? 0 : Math.min(last, hi + 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = hi === null ? last : Math.max(0, hi - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "Escape") next = null;
    if (next === undefined) return;
    e.preventDefault();
    engage();
    setHover(next);
  };

  const switchMode = (m: "day" | "week") => {
    engage();
    setHover(null);
    setMode(m);
  };

  useEffect(() => {
    if (!autoplay) return;
    let i = 0;
    const id = setInterval(() => {
      if (touched.current) return clearInterval(id);
      i++;
      if (i % 26 === 0) {
        setHover(null);
        setMode((m) => (m === "day" ? "week" : "day"));
        return;
      }
      setHover((h) => (h === null ? 0 : (h + 1) % (mode === "day" ? DAYS : 4)));
    }, 260);
    return () => clearInterval(id);
  }, [autoplay, mode]);

  const hv = hi !== null ? (mode === "day" ? data[hi] : weekTotals[hi]) : null;
  const labelOf = (c: number) => (mode === "day" ? dateLabel(c) : `${dateLabel(c * 7)} – ${dateLabel(c * 7 + 6)}`);
  const hLabel = hi === null ? "" : labelOf(hi);
  const unit = mode === "day" ? "day" : "week";
  const announce =
    engaged && hv ? `${hLabel}: ${fmt(hv[0] + hv[1] + hv[2])} visits. ${SERIES.map((s, i) => `${s.label} ${fmt(hv[i])}`).join(", ")}.` : "";
  const tableRows = mode === "day" ? data : weekTotals;

  return (
    <div
      className={`w-[380px] max-w-full rounded-[24px] p-5 transition-colors duration-300 ${THEME_VARS[theme]}`}
      style={{ background: "var(--tb-card)", boxShadow: "var(--tb-edge)" }}
      onPointerDown={() => {
        touched.current = true;
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[14px] font-semibold" style={{ color: "var(--tb-text)" }}>Traffic</span>
          <span className="text-[12px]" style={{ color: "var(--tb-sub)" }}>{hi === null ? "Last 28 days" : hLabel}</span>
        </div>
        <div role="tablist" aria-label="Group by" className="relative flex rounded-full p-[3px]" style={{ background: "var(--tb-seg)" }}>
          {(["day", "week"] as const).map((m) => (
            <button
              key={m}
              role="tab"
              type="button"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className="relative h-7 rounded-full px-3 text-[12px] font-medium capitalize outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]"
              style={{ color: mode === m ? "var(--tb-text)" : "var(--tb-sub)" }}
            >
              {mode === m && (
                <motion.span
                  layoutId={`tb-seg-${uid}`}
                  className="absolute inset-0 rounded-full shadow-[0_1px_3px_rgba(0,0,0,.15)]"
                  style={{ background: "var(--tb-seg-on)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative">{m}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1.5 text-[30px] font-semibold tabular-nums tracking-[-0.03em]">
        <Count value={hv ? hv[0] + hv[1] + hv[2] : total} />
        <span className="text-[13px] font-normal tracking-normal" style={{ color: "var(--tb-sub)" }}>visits</span>
      </div>

      <div
        ref={plot}
        tabIndex={0}
        role="group"
        aria-roledescription="chart"
        aria-label={`Stacked bar chart of visits by ${unit}, ${dateLabel(0)} to ${dateLabel(DAYS - 1)}. Total ${fmt(total)}. Use the arrow keys to move between ${unit}s.`}
        className="relative mt-4 touch-none select-none rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-4 focus-visible:ring-offset-[color:var(--tb-card)] dark:focus-visible:ring-[#0a84ff]"
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHover(null)}
        onKeyDown={onKey}
        onBlur={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          {[0.25, 0.5, 0.75].map((g) => (
            <line key={g} x1="0" x2={W} y1={H * g} y2={H * g} style={{ stroke: "var(--tb-grid)" }} strokeDasharray="2 4" />
          ))}
          <line x1="0" x2={W} y1={H + 0.5} y2={H + 0.5} style={{ stroke: "var(--tb-grid)" }} />
          {rects.map((r) => {
            const dim = hi !== null && colOf(r.d) !== hi;
            return (
              <motion.rect
                key={r.key}
                initial={false}
                animate={{ x: r.x, y: r.y, width: Math.max(0.5, r.w), height: Math.max(0, r.h), opacity: dim ? 0.32 : 1 }}
                transition={{
                  type: "spring",
                  stiffness: 210,
                  damping: 26,
                  delay: mode === "week" ? (r.d % 7) * (stagger / 1000) + r.s * 0.02 : (6 - (r.d % 7)) * (stagger / 1000),
                  opacity: { duration: 0.15, delay: 0 },
                }}
                rx={Math.min(radius, Math.max(0, r.w / 2))}
                fill={colors[r.s]}
                style={{ stroke: mode === "week" ? "var(--tb-card)" : "none" }}
                strokeWidth={mode === "week" ? 0.6 : 0}
              />
            );
          })}
          {hi !== null && (
            <motion.g style={{ x: ringXs }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x={-3} y={-4} width={bw + 6} height={H + 8} rx={Math.min(8, bw / 2 + 3)} fill="none" style={{ stroke: "var(--tb-ring)" }} strokeOpacity=".5" strokeWidth="1.2" />
            </motion.g>
          )}
        </svg>

        {hv && (
          <motion.div
            className="pointer-events-none absolute top-0 z-10 min-w-[136px] rounded-[12px] px-3 py-2 text-[11px] shadow-[0_10px_30px_-10px_rgba(0,0,0,.5)]"
            style={{ left: tipX, background: "var(--tb-tip)", color: "var(--tb-tip-text)" }}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
            aria-hidden="true"
          >
            <div className="mb-1 font-semibold">{hLabel}</div>
            {SERIES.map((s, i) => (
              <div key={s.key} className="flex items-center justify-between gap-3 tabular-nums">
                <span className="flex items-center gap-1.5" style={{ color: "var(--tb-tip-sub)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: colors[i] }} />
                  {s.label}
                </span>
                <span>{fmt(hv[i])}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="sr-only" aria-live="polite">{announce}</div>
      <table className="sr-only">
        <caption>Visits by {unit}</caption>
        <thead>
          <tr>
            <th scope="col">{mode === "day" ? "Day" : "Week"}</th>
            {SERIES.map((s) => (
              <th key={s.key} scope="col">{s.label}</th>
            ))}
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, c) => (
            <tr key={c}>
              <th scope="row">{labelOf(c)}</th>
              {row.map((v, s) => (
                <td key={s}>{fmt(v)}</td>
              ))}
              <td>{fmt(row[0] + row[1] + row[2])}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-2 flex justify-between text-[11px] tabular-nums" style={{ color: "var(--tb-sub)" }} aria-hidden="true">
        <span>{dateLabel(0)}</span>
        <span>{dateLabel(DAYS - 1)}</span>
      </div>
      <div className="mt-3 flex gap-4 text-[12px]" style={{ color: "var(--tb-sub)" }}>
        {SERIES.map((s, i) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: colors[i] }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
