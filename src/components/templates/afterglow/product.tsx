import { useState, useRef, useEffect, type PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence, useReducedMotion, useTransform, useMotionValue, useMotionValueEvent, animate, useInView } from "framer-motion";
import { PRODUCT } from "./data";
import { COLORS, Section, SectionHead, CARD } from "./ui";

function FeatureHead({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-[19px] font-semibold tracking-[-0.025em] text-[#f3efe9]">{title}</h3>
      <p className="max-w-[46ch] text-[14.5px] leading-[1.55] text-[#a39c94]">{body}</p>
    </div>
  );
}

const SERIES_LENGTH = 40;

const RELEASE_INDEX = 22;

function buildDiffSeries() {
  let seed = 3;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647 - 0.5;
  };
  return Array.from(
    { length: SERIES_LENGTH },
    (_, i) => 4.2 + (i >= RELEASE_INDEX ? 0.6 : 0) + rand() * 0.22 + Math.sin(i * 0.7) * 0.06,
  );
}

const DIFF_SERIES = buildDiffSeries();

function ReleaseDiffCard() {
  const series = DIFF_SERIES;
  const trackRef = useRef<HTMLDivElement>(null);
  const split = useMotionValue(0.3);
  const [splitDay, setSplitDay] = useState(12);
  const dragging = useRef(false);
  const revealLeft = useTransform(split, (v) => `${v * 100}%`);
  const revealWidth = useTransform(split, (v) => `calc(100% / ${Math.max(0.02, 1 - v).toFixed(4)})`);
  useMotionValueEvent(split, "change", (v) =>
    setSplitDay(Math.max(1, Math.min(SERIES_LENGTH - 1, Math.round(v * (SERIES_LENGTH - 1))))),
  );
  const reduced = useReducedMotion();
  const inView = useInView(trackRef, { once: true, amount: 0.6 });
  useEffect(() => {
    if (!inView) return;
    animate(
      split,
      RELEASE_INDEX / (SERIES_LENGTH - 1),
      reduced ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14, delay: 0.3 },
    );
  }, [inView, reduced, split]);
  const ratioFromPointer = (event: ReactPointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    return Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  };
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    split.stop();
    split.set(ratioFromPointer(event));
  };
  const onPointerMove = (event: ReactPointerEvent) => {
    if (dragging.current) split.set(ratioFromPointer(event));
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const home = RELEASE_INDEX / (SERIES_LENGTH - 1);
    if (Math.abs(split.get() - home) < 0.07) animate(split, home, { type: "spring", stiffness: 300, damping: 22 });
  };
  const before = series.slice(0, splitDay);
  const after = series.slice(splitDay);
  const mean = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / Math.max(1, values.length);
  const change = mean(after) - mean(before);
  const viewW = 600;
  const viewH = 150;
  const yMin = 3.8;
  const yMax = 5.2;
  const xAt = (i: number) => (i / (SERIES_LENGTH - 1)) * viewW;
  const yAt = (v: number) => viewH - ((v - yMin) / (yMax - yMin)) * viewH;
  const linePath = series
    .map((v, i) => `${i ? "L" : "M"}${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
    .join(" ");
  return (
    <div className={`${CARD} flex flex-col gap-6 p-6 sm:p-7 lg:col-span-4`}>
      <FeatureHead {...PRODUCT.diff} />
      <div className="mt-auto flex flex-col gap-4">
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]" aria-live="polite">
          <span className="text-[#a39c94]">
            Before{" "}
            <span className="ml-1 text-[18px] font-semibold tabular-nums text-[#f3efe9]">
              {mean(before).toFixed(2)}%
            </span>
          </span>
          <span className="text-[#a39c94]">
            After{" "}
            <span className="ml-1 text-[18px] font-semibold tabular-nums text-[#f3efe9]">
              {mean(after).toFixed(2)}%
            </span>
          </span>
          <span className="text-[#a39c94]">
            Change{" "}
            <span
              className="ml-1 text-[18px] font-semibold tabular-nums"
              style={{ color: change >= 0 ? COLORS.up : COLORS.down }}
            >
              {change >= 0 ? "+" : ""}
              {change.toFixed(2)} pts
            </span>
          </span>
        </div>
        <div
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="relative h-[160px] cursor-ew-resize touch-pan-y select-none"
          role="slider"
          tabIndex={0}
          aria-label="Compare before and after"
          aria-valuemin={1}
          aria-valuemax={SERIES_LENGTH - 1}
          aria-valuenow={splitDay}
          aria-valuetext={`Day ${splitDay}, change ${change.toFixed(2)} points`}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            const step = (event.key === "ArrowRight" ? 1 : -1) / (SERIES_LENGTH - 1);
            split.set(Math.min(1, Math.max(0, split.get() + step)));
          }}
        >
          <svg
            viewBox={`0 0 ${viewW} ${viewH}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <line
              x1={xAt(RELEASE_INDEX)}
              x2={xAt(RELEASE_INDEX)}
              y1="0"
              y2={viewH}
              stroke="rgba(255,255,255,.2)"
              strokeDasharray="3 4"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={linePath}
              fill="none"
              stroke="rgba(255,255,255,.28)"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <motion.div
            className="pointer-events-none absolute inset-y-0 right-0 overflow-hidden"
            style={{ left: revealLeft }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,122,47,.16),transparent)]" />
            <motion.svg
              viewBox={`0 0 ${viewW} ${viewH}`}
              preserveAspectRatio="none"
              className="absolute inset-y-0 right-0 h-full"
              style={{ width: revealWidth }}
              aria-hidden="true"
            >
              <path
                d={linePath}
                fill="none"
                stroke={COLORS.honey}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </motion.svg>
          </motion.div>
          <span
            className="pointer-events-none absolute -top-1 rounded-full bg-black px-1.5 text-[10.5px] tabular-nums text-[#a39c94] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)]"
            style={{
              left: `${(RELEASE_INDEX / (SERIES_LENGTH - 1)) * 100}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            v2.16
          </span>
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-px bg-[#ffc58a]"
            style={{ left: revealLeft }}
          >
            <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f3efe9] text-black shadow-[0_0_0_4px_rgba(255,122,47,.25)]">
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" />
              </svg>
            </span>
          </motion.div>
        </div>
        <span className="text-[12.5px] text-[#6a645e]">
          Drag the handle. Let go near a release and it snaps on.
        </span>
      </div>
    </div>
  );
}

type SampleAlert = { id: number; title: string; detail: string; release: string; rolled?: boolean };

const SAMPLE_ALERTS: SampleAlert[] = [
  { id: 1, title: "Signup completion fell 12%", detail: "Started 14 minutes after deploy", release: "v2.17" },
  { id: 2, title: "Search latency up 340 ms", detail: "Only on mobile Safari", release: "v2.17" },
  { id: 3, title: "Checkout conversion up 0.6 pts", detail: "Holding for 3 days", release: "v2.16" },
];

function AlertsCard() {
  const [alerts, setAlerts] = useState<SampleAlert[]>(SAMPLE_ALERTS.slice(0, 2));
  const touched = useRef(false);
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.5 });
  useEffect(() => {
    if (!inView) return;
    const o = window.setTimeout(
      () => !touched.current && setAlerts((a) => (a.find((l) => l.id === 3) ? a : [SAMPLE_ALERTS[2], ...a])),
      2200,
    );
    return () => window.clearTimeout(o);
  }, [inView]);
  const markTouched = () => {
    touched.current = true;
  };
  return (
    <div ref={ref} className={`${CARD} flex flex-col gap-6 p-6 sm:p-7 lg:col-span-2`}>
      <FeatureHead {...PRODUCT.alerts} />
      <ul className="mt-auto flex min-h-[214px] flex-col justify-end gap-2" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {alerts.map((o) => {
            const a = o.title.includes("up 0.6");
            return (
              <motion.li
                key={o.id}
                layout={true}
                initial={{ opacity: 0, y: -16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="rounded-[14px] bg-black p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className="mt-1.5 h-2 w-2 flex-none rounded-full"
                    style={{ background: o.rolled ? COLORS.smoke : a ? COLORS.up : COLORS.down }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-medium text-[#f3efe9]">{o.title}</p>
                    <p className="mt-0.5 text-[12.5px] text-[#a39c94]">
                      {o.rolled
                        ? `Rolled back to the release before ${o.release}`
                        : `${o.detail}, after ${o.release}`}
                    </p>
                  </div>
                </div>
                {!o.rolled && (
                  <div className="mt-3 flex gap-2 pl-[18px]">
                    {!a && (
                      <button
                        type="button"
                        onClick={() => {
                          markTouched();
                          setAlerts((l) => l.map((c) => (c.id === o.id ? { ...c, rolled: true } : c)));
                        }}
                        className="h-7 rounded-full bg-[#f3efe9] px-3 text-[12px] font-medium text-black outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
                      >
                        Roll back {o.release}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        markTouched();
                        setAlerts((l) => l.filter((c) => c.id !== o.id));
                      }}
                      className="h-7 rounded-full px-3 text-[12px] text-[#a39c94] shadow-[inset_0_0_0_1px_rgba(255,255,255,.14)] outline-none hover:text-[#f3efe9] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </motion.li>
            );
          })}
          {alerts.length === 0 && (
            <motion.li
              key="empty"
              layout={true}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-start gap-3 rounded-[14px] p-3.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
            >
              <p className="text-[13.5px] text-[#a39c94]">Nothing has moved since your last release.</p>
              <button
                type="button"
                onClick={() => setAlerts(SAMPLE_ALERTS)}
                className="h-7 rounded-full px-3 text-[12px] text-[#f3efe9] shadow-[inset_0_0_0_1px_rgba(255,255,255,.16)] outline-none hover:bg-white/[.06] focus-visible:ring-2 focus-visible:ring-[#ffc58a]"
              >
                Show sample alerts again
              </button>
            </motion.li>
          )}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const FUNNEL_STEPS = [
  { step: "Visited", a: 100, b: 100 },
  { step: "Viewed product", a: 64, b: 63 },
  { step: "Added to cart", a: 31, b: 30 },
  { step: "Started checkout", a: 22, b: 17 },
  { step: "Paid", a: 18, b: 14 },
];

function FunnelCard() {
  const [version, setVersion] = useState<"a" | "b">("b");
  return (
    <div className={`${CARD} flex flex-col gap-6 p-6 sm:p-7 lg:col-span-2`}>
      <FeatureHead {...PRODUCT.funnels} />
      <div className="mt-auto flex flex-col gap-4">
        <div
          className="flex w-fit rounded-full bg-white/[.05] p-0.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]"
          role="radiogroup"
          aria-label="Release"
        >
          {(["a", "b"] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={version === n}
              onClick={() => setVersion(n)}
              className={`relative rounded-full px-3 py-1 text-[12.5px] tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-[#ffc58a] ${version === n ? "text-[#f3efe9]" : "text-[#a39c94]"}`}
            >
              {version === n && (
                <motion.span
                  layoutId="ag-funnel"
                  className="absolute inset-0 rounded-full bg-white/[.1]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{n === "a" ? "v2.16" : "v2.17"}</span>
            </button>
          ))}
        </div>
        <ul className="flex flex-col gap-2.5">
          {FUNNEL_STEPS.map((n) => {
            const r = n[version];
            const s = version === "b" && n.b < n.a - 3;
            return (
              <li key={n.step} className="flex flex-col gap-1">
                <div className="flex justify-between text-[12.5px]">
                  <span className={s ? "text-[#f3efe9]" : "text-[#a39c94]"}>{n.step}</span>
                  <span className="tabular-nums" style={{ color: s ? COLORS.down : COLORS.smoke }}>
                    {r}%{s && ` (${r - n.a} pts)`}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[.05]">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${r}%`, backgroundColor: s ? COLORS.down : COLORS.honey }}
                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const REPLAY_PATH = "M30 150 C 90 120, 120 60, 190 70 S 260 120, 232 152";

function ReplayCard() {
  const ref = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cursorX = useMotionValue(30);
  const cursorY = useMotionValue(150);
  const [pressCount, setPressCount] = useState(0);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!inView || reduced) return;
    let frame = 0;
    const startedAt = performance.now();
    let lastPressedLoop = -1;
    const tick = (now: number) => {
      const path = pathRef.current;
      if (path) {
        const t = ((now - startedAt) / 1e3) % 4.2;
        const loop = Math.floor((now - startedAt) / 1e3 / 4.2);
        const m = Math.min(1, t / 2.6);
        const eased = m < 0.5 ? 2 * m * m : 1 - Math.pow(-2 * m + 2, 2) / 2;
        const point = path.getPointAtLength(eased * path.getTotalLength());
        cursorX.set(point.x);
        cursorY.set(point.y);
        if (t > 2.75 && loop !== lastPressedLoop) {
          lastPressedLoop = loop;
          setPressCount((x) => x + 1);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduced, cursorX, cursorY]);
  return (
    <div className={`${CARD} flex flex-col gap-6 p-6 sm:p-7 lg:col-span-2`}>
      <FeatureHead {...PRODUCT.replays} />
      <div
        ref={ref}
        className="relative mt-auto overflow-hidden rounded-[14px] bg-black shadow-[inset_0_0_0_1px_rgba(255,255,255,.1)]"
      >
        <div className="flex items-center justify-between px-3 py-2 text-[11.5px] text-[#a39c94] shadow-[inset_0_-1px_0_rgba(255,255,255,.06)]">
          <span>Session 4,812, Lisbon</span>
          <span className="tabular-nums">0:42</span>
        </div>
        <svg
          viewBox="0 0 300 190"
          className="block w-full"
          aria-label="A replay of a visitor moving to the new checkout button and pressing it"
          role="img"
        >
          <rect x="20" y="20" width="150" height="10" rx="5" fill="rgba(255,255,255,.12)" />
          <rect x="20" y="40" width="110" height="8" rx="4" fill="rgba(255,255,255,.07)" />
          <rect x="20" y="64" width="120" height="60" rx="10" fill="rgba(255,255,255,.05)" />
          <rect x="150" y="64" width="130" height="60" rx="10" fill="rgba(255,255,255,.05)" />
          <motion.rect
            key={pressCount}
            x="196"
            y="138"
            width="84"
            height="28"
            rx="14"
            fill={COLORS.ember}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 0.92, 1] }}
            transition={{ duration: 0.35 }}
            style={{ transformOrigin: "238px 152px" }}
          />
          <text x="238" y="156" textAnchor="middle" fontSize="11" fontWeight="600" fill="#000">
            Pay now
          </text>
          <path
            ref={pathRef}
            d={REPLAY_PATH}
            fill="none"
            stroke="rgba(255,197,138,.25)"
            strokeWidth="1.5"
            strokeDasharray="3 5"
          />
          <motion.circle
            key={`r${pressCount}`}
            cx="232"
            cy="152"
            r="4"
            fill="none"
            stroke={COLORS.honey}
            initial={{ r: 4, opacity: 0.9 }}
            animate={{ r: 22, opacity: 0 }}
            transition={{ duration: 0.6 }}
          />
          <motion.g style={{ x: cursorX, y: cursorY }}>
            <path
              d="M0 0 L0 15 L4 11 L7 18 L9.5 17 L6.5 10 L12 10 Z"
              fill="#fff"
              stroke="#000"
              strokeWidth="1"
            />
          </motion.g>
        </svg>
      </div>
    </div>
  );
}

const INTEGRATIONS = [
  { name: "Deploy hooks", note: "Marks every release", on: true },
  { name: "Team chat", note: "Posts alerts to a channel", on: true },
  { name: "Issue tracker", note: "Files regressions as issues", on: false },
  { name: "Data warehouse", note: "Syncs events nightly", on: true },
];

function IntegrationsCard() {
  const [enabled, setEnabled] = useState(INTEGRATIONS.map((n) => n.on));
  return (
    <div className={`${CARD} flex flex-col gap-6 p-6 sm:p-7 lg:col-span-2`}>
      <FeatureHead {...PRODUCT.stack} />
      <ul className="mt-auto flex flex-col">
        {INTEGRATIONS.map((n, r) => (
          <li
            key={n.name}
            className="flex items-center justify-between gap-3 py-2.5 shadow-[inset_0_-1px_0_rgba(255,255,255,.06)] last:shadow-none"
          >
            <span className="flex flex-col">
              <span className="text-[14px] text-[#f3efe9]">{n.name}</span>
              <span className="text-[12.5px] text-[#a39c94]">{n.note}</span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled[r]}
              aria-label={n.name}
              onClick={() => setEnabled((s) => s.map((i, o) => (o === r ? !i : i)))}
              className={`flex h-6 w-10 flex-none items-center rounded-full p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc58a] ${enabled[r] ? "justify-end bg-[#ff7a2f]" : "justify-start bg-white/[.12]"}`}
            >
              <motion.span
                layout={true}
                transition={{ type: "spring", stiffness: 600, damping: 30 }}
                className="h-5 w-5 rounded-full bg-[#f3efe9] shadow-[0_1px_3px_rgba(0,0,0,.4)]"
              />
            </button>
          </li>
        ))}
      </ul>
      <span className="text-[12.5px] text-[#6a645e]">
        {enabled.filter(Boolean).length} of {INTEGRATIONS.length} connected
      </span>
    </div>
  );
}

export function Product() {
  return (
    <Section id="product" className="py-24 sm:py-28">
      <SectionHead title={PRODUCT.title} body={PRODUCT.body} />
      <div className="mt-14 grid gap-4 lg:grid-cols-6">
        <ReleaseDiffCard />
        <AlertsCard />
        <FunnelCard />
        <ReplayCard />
        <IntegrationsCard />
      </div>
    </Section>
  );
}
