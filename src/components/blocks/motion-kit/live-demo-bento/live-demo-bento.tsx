"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTypedText } from "@/lib/typing-sound";
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

export interface LiveDemoBentoProps {
  /** Small line above the heading. */
  eyebrow?: string;
  title?: string;
  /** Any CSS colour. Leave empty to use Apple blue, which brightens in dark mode. */
  accent?: string;
  /** Runs the little demos (typing, chart readout, cursors, workflow, scan) on a loop while on screen. */
  autoplay?: boolean;
  className?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;
const ink = "text-[#1d1d1f] dark:text-[#f5f5f7]";
const tint = (pct: number) => `color-mix(in srgb, var(--lb-accent) ${pct}%, transparent)`;

function Card({ title, body, children, className }: { title: string; body: string; children: ReactNode; className?: string }) {
  const mx = useMotionValue(-300);
  const my = useMotionValue(-300);
  const bg = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, ${tint(8)}, transparent 70%)`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-300);
        my.set(-300);
      }}
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_24px_48px_-32px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]",
        className,
      )}
    >
      <motion.div className="pointer-events-none absolute inset-0" style={{ background: bg }} aria-hidden="true" />
      <div className="relative flex min-h-[220px] flex-1 items-center justify-center overflow-hidden p-5 sm:p-6">{children}</div>
      <div className="relative px-5 pb-6 sm:px-7 sm:pb-7">
        <h3 className={cn("m-0 text-[20px] font-semibold tracking-[-0.02em]", ink)}>{title}</h3>
        <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-[#6e6e73] dark:text-[#a1a1a6]">{body}</p>
      </div>
    </motion.div>
  );
}

/** Scales a fixed-size drawing down to the width it is given, never up. */
function FitBox({ w, h, children }: { w: number; h: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) setS(Math.min(1, width / w));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w]);
  return (
    <div ref={ref} className="w-full">
      <div className="relative mx-auto" style={{ width: w * s, height: h * s }}>
        <div className="absolute left-0 top-0 origin-top-left" style={{ width: w, height: h, transform: `scale(${s})` }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const QUERIES = [
  { q: "q3 revenue", r: ["Q3 revenue report", "Revenue by region, Q3", "Board deck: Q3"] },
  { q: "onboarding", r: ["Onboarding checklist", "New hire onboarding", "Customer onboarding flow"] },
];

/** Search box that types queries and shows matching results. */
function SearchDemo({ live }: { live: boolean }) {
  const [k, setK] = useState(0);
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  useEffect(() => {
    if (!seen || !live) return;
    const len = QUERIES[k].q.length;
    const t = setTimeout(
      () => {
        if (n < len) setN(n + 1);
        else {
          setK((k + 1) % QUERIES.length);
          setN(0);
        }
      },
      n < len ? 90 : 2600,
    );
    return () => clearTimeout(t);
  }, [seen, live, k, n]);
  const q = QUERIES[live ? k : 0];
  const typed = live ? n : q.q.length;
  useTypedText(q.q.slice(0, typed));
  const done = typed >= q.q.length;
  return (
    <div ref={ref} className="w-full max-w-[340px]" aria-hidden="true">
      <div className={cn("flex h-11 items-center gap-2 rounded-2xl bg-[#f5f5f7] px-3.5 text-[14px] dark:bg-[#2c2c2e]", ink)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#86868b" strokeWidth="2.4" strokeLinecap="round">
          <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />
        </svg>
        <span className="truncate">{q.q.slice(0, typed)}</span>
        <motion.span
          className="h-4 w-[2px] shrink-0 rounded-full bg-[var(--lb-accent)]"
          animate={live ? { opacity: [1, 0, 1] } : { opacity: 1 }}
          transition={live ? { duration: 0.9, repeat: Infinity } : { duration: 0 }}
        />
        <span className="ml-auto shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[11px] text-[#86868b] shadow-[0_0_0_1px_rgba(0,0,0,.06)] dark:bg-[#3a3a3c] dark:text-[#a1a1a6] dark:shadow-none">
          ⌘K
        </span>
      </div>
      <div className="mt-2 min-h-[132px]">
        <AnimatePresence mode="popLayout">
          {done &&
            q.r.map((r, i) => (
              <motion.div
                key={r}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 400, damping: 30 }}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{ background: i === 0 ? tint(7) : "transparent" }}
              >
                <span className={cn("h-6 w-6 shrink-0 rounded-md", i === 0 ? "bg-[var(--lb-accent)]" : "bg-[#e8e8ed] dark:bg-[#3a3a3c]")} />
                <span className={cn("truncate text-[13px] font-medium", ink)}>{r}</span>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Area chart that draws in, with a dot riding the line and a live value. */
const CHART_D = "M0 90 C 30 84, 50 60, 80 64 S 130 30, 160 40 S 210 76, 240 52 S 290 16, 320 22";

function ChartDemo({ live }: { live: boolean }) {
  const path = useRef<SVGPathElement>(null);
  const cx = useMotionValue(0);
  const cy = useMotionValue(90);
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref);
  const left = useTransform(cx, (v) => `${(v / 320) * 100}%`);
  const top = useTransform(cy, (v) => `${v}%`);
  const label = useTransform(cy, (v) => `$${Math.round(1200 + (90 - v) * 42).toLocaleString("en-US")}`);
  const gid = `lb-area-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    const p = path.current;
    if (!p) return;
    if (!live) {
      cx.set(320);
      cy.set(22);
      return;
    }
    if (!seen) return;
    const L = p.getTotalLength();
    const c = animate(0, 1, {
      duration: 3.2,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      onUpdate: (t) => {
        const pt = p.getPointAtLength(t * L);
        cx.set(pt.x);
        cy.set(pt.y);
      },
    });
    return () => c.stop();
  }, [seen, live, cx, cy]);
  return (
    <div ref={ref} className="relative w-full max-w-[360px]" aria-hidden="true">
      <svg viewBox="0 0 320 100" className="w-full overflow-visible">
        <defs>
          <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopOpacity=".25" style={{ stopColor: "var(--lb-accent)" }} />
            <stop offset="1" stopOpacity="0" style={{ stopColor: "var(--lb-accent)" }} />
          </linearGradient>
        </defs>
        {[25, 50, 75].map((y) => (
          <line key={y} x1="0" x2="320" y1={y} y2={y} className="stroke-[#f0f0f3] dark:stroke-[#3a3a3c]" />
        ))}
        <path d={`${CHART_D} L320 100 L0 100Z`} fill={`url(#${gid})`} />
        <motion.path
          ref={path}
          d={CHART_D}
          fill="none"
          className="stroke-[var(--lb-accent)]"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.6, ease }}
        />
        <motion.line x1={cx} x2={cx} y1="0" y2="100" className="stroke-[var(--lb-accent)]" strokeOpacity=".25" strokeDasharray="3 3" />
        <motion.circle cx={cx} cy={cy} r="6" className="fill-white stroke-[var(--lb-accent)] dark:fill-[#1c1c1e]" strokeWidth="3" />
      </svg>
      <motion.div
        className="pointer-events-none absolute whitespace-nowrap rounded-lg bg-[#1d1d1f] px-2 py-1 text-[12px] font-semibold tabular-nums text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
        style={{ left, top, x: "-50%", y: "-150%" }}
      >
        {label}
      </motion.div>
    </div>
  );
}

/** Named cursors wandering over a small doc. */
const PEOPLE = [
  { n: "Maya", c: "#ff375f" },
  { n: "Leo", c: "#30d158" },
  { n: "Ana", c: "#ff9f0a" },
];

function CursorsDemo({ live }: { live: boolean }) {
  return (
    <div className="relative h-[190px] w-full max-w-[320px] overflow-hidden rounded-2xl bg-[#f5f5f7] p-4 dark:bg-[#2c2c2e]" aria-hidden="true">
      {[80, 60, 90, 45, 70].map((w, i) => (
        <div key={i} className="mb-3 h-2.5 rounded-full bg-white dark:bg-[#48484a]" style={{ width: `${w}%` }} />
      ))}
      <motion.div
        className="absolute left-4 top-[54px] h-2.5 rounded-full bg-[#ff375f40]"
        initial={false}
        animate={live ? { width: ["0%", "48%", "48%", "0%"] } : { width: "48%" }}
        transition={live ? { duration: 6, repeat: Infinity, times: [0, 0.3, 0.8, 1] } : { duration: 0 }}
      />
      {PEOPLE.map((p, i) => {
        const xs = [40 + i * 70, 180 - i * 30, 90 + i * 40, 40 + i * 70];
        const ys = [30 + i * 40, 120 - i * 20, 60 + i * 30, 30 + i * 40];
        return (
          <motion.div
            key={p.n}
            className="absolute left-0 top-0"
            initial={false}
            animate={live ? { x: xs, y: ys } : { x: xs[0], y: ys[0] }}
            transition={live ? { duration: 7 + i * 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M4 2l16 9-7 2-3 7z" fill={p.c} stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
            <span className="ml-3 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: p.c }}>
              {p.n}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/** Workflow nodes with data flowing along the connectors. */
const NODES = [
  { x: 30, y: 30, t: "New signup" },
  { x: 190, y: 30, t: "Enrich" },
  { x: 30, y: 120, t: "Score" },
  { x: 190, y: 120, t: "Notify sales" },
];
const LINKS = ["M130 48 H190", "M240 66 C 240 90, 80 90, 80 120", "M130 138 H190"];

function FlowDemo({ live }: { live: boolean }) {
  return (
    <FitBox w={320} h={180}>
      <div className="relative h-[180px] w-[320px]" aria-hidden="true">
        <svg className="absolute inset-0" width="320" height="180">
          {LINKS.map((d) => (
            <g key={d}>
              <path d={d} fill="none" strokeWidth="2" className="stroke-[#e8e8ed] dark:stroke-[#3a3a3c]" />
              <motion.path
                d={d}
                fill="none"
                className="stroke-[var(--lb-accent)]"
                strokeWidth="2"
                strokeDasharray="4 8"
                initial={false}
                animate={live ? { strokeDashoffset: [0, -24] } : { strokeDashoffset: 0 }}
                transition={live ? { duration: 0.8, repeat: Infinity, ease: "linear" } : { duration: 0 }}
              />
            </g>
          ))}
        </svg>
        {NODES.map((n, i) => (
          <div
            key={n.t}
            className={cn(
              "absolute flex h-9 w-[100px] items-center gap-2 rounded-xl bg-white px-2.5 text-[12px] font-semibold shadow-[0_0_0_1px_rgba(0,0,0,.08),0_8px_16px_-10px_rgba(0,0,0,.3)] dark:bg-[#2c2c2e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]",
              ink,
            )}
            style={{ left: n.x, top: n.y }}
          >
            {live && (
              <motion.span
                className="pointer-events-none absolute inset-0 rounded-xl shadow-[0_0_0_2px_var(--lb-accent)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
              />
            )}
            <span className={cn("h-2 w-2 shrink-0 rounded-full", i === 0 ? "bg-[#30d158]" : "bg-[var(--lb-accent)]")} />
            <span className="whitespace-nowrap">{n.t}</span>
          </div>
        ))}
      </div>
    </FitBox>
  );
}

/** Shield with a scanning beam and a checklist ticking off. */
const CHECKS = ["SSO and SCIM", "Audit log", "Encrypted at rest"];

function SecureDemo({ live }: { live: boolean }) {
  return (
    <FitBox w={280} h={110}>
      <div className="flex h-[110px] w-[280px] items-center gap-6">
        <div className="relative h-[110px] w-[96px] shrink-0 overflow-hidden" aria-hidden="true">
          <svg viewBox="0 0 24 28" className="h-full w-full">
            <path d="M12 1l10 4v8c0 7-4.5 12-10 14C6.5 25 2 20 2 13V5z" strokeWidth="1.2" style={{ fill: tint(8), stroke: "var(--lb-accent)" }} />
          </svg>
          {live && (
            <motion.div
              className="absolute inset-x-0 h-8"
              style={{ background: `linear-gradient(transparent, ${tint(33)}, transparent)` }}
              initial={{ y: -30 }}
              animate={{ y: [-30, 110] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {CHECKS.map((t, i) => (
            <motion.li
              key={t}
              className={cn("flex items-center gap-2 whitespace-nowrap text-[13px] font-medium", ink)}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.25 }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 stroke-[#248a3d] dark:stroke-[#30d158]"
                aria-hidden="true"
              >
                <motion.path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  initial={{ pathLength: 0 }}
                  whileInView={{ pathLength: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.25, duration: 0.4 }}
                />
              </svg>
              {t}
            </motion.li>
          ))}
        </ul>
      </div>
    </FitBox>
  );
}

/**
 * Feature bento. Five cards, each with its own small live demo instead of an illustration: typed
 * search, a chart with a moving readout, multiplayer cursors, a running workflow and a security
 * scan. A soft light follows the pointer over each card.
 */
export function LiveDemoBento({
  eyebrow = "Everything in one place",
  title = "Built for the way your team actually works.",
  accent,
  autoplay = true,
  className,
}: LiveDemoBentoProps) {
  const reduce = useReducedMotion() ?? false;
  const live = autoplay && !reduce;
  return (
    <section
      className={cn(
        "w-full bg-[#f5f5f7] px-5 py-16 sm:py-20 dark:bg-black",
        !accent && "[--lb-accent:#0071e3] dark:[--lb-accent:#2997ff]",
        className,
      )}
      style={accent ? ({ "--lb-accent": accent } as CSSProperties) : undefined}
    >
      <div className="mx-auto w-full max-w-[1120px]">
        <div className="mb-10 flex flex-col gap-3 sm:mb-12">
          <span className="text-[14px] font-semibold text-[var(--lb-accent)]">{eyebrow}</span>
          <h2 className={cn("m-0 max-w-[720px] text-balance text-[clamp(32px,5vw,56px)] font-semibold leading-[1.04] tracking-[-0.04em]", ink)}>
            {title}
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-6">
          <Card className="md:col-span-3" title="Find anything in a keystroke" body="Docs, people, numbers and threads, ranked by what you touch most.">
            <SearchDemo live={live} />
          </Card>
          <Card className="md:col-span-3" title="Numbers that update themselves" body="Every chart is live. Hover any point to see exactly where it came from.">
            <ChartDemo live={live} />
          </Card>
          <Card className="md:col-span-3 lg:col-span-2" title="Work on it together" body="See who's looking at what, and edit at the same time.">
            <CursorsDemo live={live} />
          </Card>
          <Card className="md:col-span-3 lg:col-span-2" title="Automate the busywork" body="Chain steps together and let them run in the background.">
            <FlowDemo live={live} />
          </Card>
          <Card className="md:col-span-6 lg:col-span-2" title="Secure from day one" body="Enterprise controls on every plan.">
            <SecureDemo live={live} />
          </Card>
        </div>
      </div>
    </section>
  );
}
