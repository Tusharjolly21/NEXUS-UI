// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion, useInView } from "framer-motion";
import { feeFor, formatAmount, formatRate, getCurrency, rateBetween } from "./data";
import { Badge, CurrencyDot, Frame, Icon, Panel, PulseGrid, SectionHeading } from "./ui";

export const PAYOUT_SAMPLES = [
  {
    from: "GBP",
    to: "INR",
    amount: 12400,
    who: "Rao Design Studio",
    country: "India",
    acct: "4417",
    id: "po_3NcV7qK2",
  },
  {
    from: "EUR",
    to: "BRL",
    amount: 8600,
    who: "Casa Verde Têxteis",
    country: "Brazil",
    acct: "0291",
    id: "po_8Lm2Qx41",
  },
  {
    from: "USD",
    to: "NGN",
    amount: 5200,
    who: "Ade Okafor",
    country: "Nigeria",
    acct: "7702",
    id: "po_5Tz9Wd03",
  },
  {
    from: "SGD",
    to: "AUD",
    amount: 21e3,
    who: "Harbour Freight",
    country: "Australia",
    acct: "3358",
    id: "po_2Hs6Rb77",
  },
  {
    from: "CAD",
    to: "MXN",
    amount: 9800,
    who: "Taller Norte",
    country: "Mexico",
    acct: "6120",
    id: "po_9Ka4Ve15",
  },
];

export const durationText = (e) =>
  e <= 1 ? "under a minute" : e < 60 ? `${e} minutes` : `${Math.round(e / 60)} hours`;

export function InlineChip({ children: e }) {
  return (
    <span className="mx-0.5 rounded-[6px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] px-1.5 py-0.5 text-[0.92em] text-[rgb(var(--ferry-mute))]">
      {e}
    </span>
  );
}

export function Payouts() {
  const e = useReducedMotion(),
    [t, n] = useState(0),
    [r, i] = useState(0),
    [s, o] = useState(0),
    l = useRef(null),
    c = useInView(l, {
      once: !0,
      margin: "-20% 0px",
    }),
    u = PAYOUT_SAMPLES[t],
    d = getCurrency(u.from),
    f = getCurrency(u.to),
    h = rateBetween(d, f),
    x = (u.amount - feeFor(u.amount)) * h,
    w = (g) => g.symbol.trim(),
    y = [
      {
        node: <>Payment approved by Maya Chen and Daniel Ortiz.</>,
      },
      {
        node: (
          <>
            {"Converting "}
            <InlineChip>{`${w(d)}${formatAmount(u.amount, d)}`}</InlineChip>
            {" to "}
            {f.code}
            {" at "}
            <InlineChip>{formatRate(h)}</InlineChip>
            {", fee "}
            <InlineChip>{`${w(d)}${formatAmount(feeFor(u.amount), d)}`}</InlineChip>.
          </>
        ),
      },
      {
        node: (
          <>
            {"Routing over "}
            <InlineChip>{f.rail}</InlineChip>
            {", the local instant network in "}
            {u.country}.
          </>
        ),
      },
      {
        mono: !0,
        node: (
          <>
            {"ferry payouts track "}
            {u.id}
            {" --rail "}
            {f.rail.toLowerCase().replace(/\s+/g, "-")}
          </>
        ),
      },
      {
        mono: !0,
        dim: !0,
        node: (
          <>
            {"status in_transit, eta "}
            {f.minutes <= 1 ? "<1m" : f.minutes < 60 ? `${f.minutes}m` : `${Math.round(f.minutes / 60)}h`}
          </>
        ),
      },
    ],
    v = y.length + 1,
    p = s >= v;
  useEffect(() => {
    if (!c) return;
    if (e) {
      o(v);
      return;
    }
    o(0);
    const g = Array.from(
      {
        length: v,
      },
      (A, E) => window.setTimeout(() => o(E + 1), 420 + E * 640 + (E === v - 1 ? 500 : 0)),
    );
    return () => g.forEach(window.clearTimeout);
  }, [c, t, r, e, v]);
  const m = (g) => {
    var S;
    const A =
      g.key === "ArrowDown" || g.key === "ArrowRight"
        ? 1
        : g.key === "ArrowUp" || g.key === "ArrowLeft"
          ? -1
          : 0;
    if (!A) return;
    g.preventDefault();
    const E = (t + A + PAYOUT_SAMPLES.length) % PAYOUT_SAMPLES.length;
    (n(E), (S = g.currentTarget.querySelectorAll("[role=radio]")[E]) == null || S.focus());
  };
  return (
    <section id="payouts" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <SectionHeading
        label="Payouts"
        title="Send every payout over the right local rail."
        sub="Pick a corridor and watch Ferry route it. Each payout is converted at the real rate, sent on the country's own instant network and confirmed when it lands."
      />
      <div ref={l}>
        <Frame className="mx-auto mt-12 max-w-[1160px]">
          <Panel className="p-0">
            <div className="flex items-center justify-between gap-3 border-b border-solid border-[rgb(var(--ferry-line)/.08)] px-4 py-3.5 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
                  <Icon name="paperplane_fill" size={14} />
                </span>
                <span className="truncate text-[15px] font-medium text-[rgb(var(--ferry-ink))]">
                  {"Payout to "}
                  {u.who}
                </span>
                <AnimatePresence mode="popLayout" initial={!1}>
                  <motion.span
                    key={p ? "done" : "run"}
                    initial={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                    }}
                    transition={{
                      duration: 0.18,
                    }}
                    className="hidden sm:inline-flex"
                  >
                    {p ? (
                      <Badge tone="gain" dot={!0}>
                        Arrived
                      </Badge>
                    ) : (
                      <Badge tone="amber">
                        <PulseGrid />
                        Routing
                      </Badge>
                    )}
                  </motion.span>
                </AnimatePresence>
              </div>
              <button
                type="button"
                onClick={() => i((g) => g + 1)}
                aria-label="Replay this payout"
                className="grid h-8 w-8 place-items-center rounded-[8px] text-[rgb(var(--ferry-mute))] transition-colors hover:bg-[rgb(var(--ferry-raised))] hover:text-[rgb(var(--ferry-ink))]"
              >
                <Icon name="arrow_clockwise" size={14} />
              </button>
            </div>
            <div className="relative grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_440px]">
              <span aria-hidden="true" className="ferry-glow !right-[-60px] !top-[-120px] hidden lg:block" />
              <div className="min-h-[400px] px-4 py-6 sm:px-6" aria-live="polite">
                <ul className="m-0 grid list-none gap-4 p-0">
                  <AnimatePresence initial={!1}>
                    {y.slice(0, Math.min(s, y.length)).map((g, A) => (
                      <motion.li
                        key={`${t}-${r}-${A}`}
                        initial={
                          e
                            ? !1
                            : {
                                opacity: 0,
                                y: 6,
                                filter: "blur(4px)",
                              }
                        }
                        animate={{
                          opacity: 1,
                          y: 0,
                          filter: "blur(0px)",
                        }}
                        transition={{
                          duration: 0.35,
                        }}
                        className={
                          g.mono
                            ? `font-mono text-[13px] ${g.dim ? "text-[rgb(var(--ferry-faint))]" : "text-[rgb(var(--ferry-mute))]"}`
                            : "text-[15px] leading-[1.6] text-[rgb(var(--ferry-ink)/.9)]"
                        }
                      >
                        {g.mono && <span className="text-[rgb(var(--ferry-accent-ink))]">{"$ "}</span>}
                        {g.node}
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <AnimatePresence mode="wait">
                  {p ? (
                    <motion.div
                      key={`n-${t}-${r}`}
                      initial={
                        e
                          ? !1
                          : {
                              opacity: 0,
                              y: -10,
                              scale: 0.97,
                            }
                      }
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 26,
                      }}
                      className="mt-6 max-w-[420px]"
                      role="status"
                    >
                      <div className="flex gap-3 rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-raised))] p-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-[rgb(var(--ferry-ink))] text-[rgb(var(--ferry-paper))]">
                          <Icon name="building_2_fill" size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span className="text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                              Payment received
                            </span>
                            <span className="text-[11px] text-[rgb(var(--ferry-faint))]">now</span>
                          </span>
                          <span className="mt-0.5 block text-[13px] leading-[1.45] text-[rgb(var(--ferry-mute))]">
                            {w(f)}
                            {formatAmount(x, f)}
                            {" from Northwind Ltd landed in the account ending "}
                            {u.acct}.
                          </span>
                        </span>
                      </div>
                      <p className="m-0 mt-3 flex items-center gap-2 text-[13px] text-[rgb(var(--ferry-gain))]">
                        <Icon name="checkmark_seal_fill" size={15} />
                        {"Arrived in "}
                        {durationText(f.minutes)}
                        {", seen by "}
                        {u.who}
                        {" in "}
                        {f.city}.
                      </p>
                    </motion.div>
                  ) : (
                    s > 0 && (
                      <motion.p
                        key={"wait"}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="m-0 mt-5 flex items-center gap-2 text-[14px] text-[rgb(var(--ferry-mute))]"
                      >
                        <PulseGrid className="text-[rgb(var(--ferry-faint))]" />
                        Routing
                      </motion.p>
                    )
                  )}
                </AnimatePresence>
              </div>
              <div className="relative border-t border-solid border-[rgb(var(--ferry-line)/.08)] p-4 sm:p-6 lg:border-l lg:border-t-0">
                <div className="relative rounded-[20px] border border-solid border-[rgb(var(--ferry-line)/.1)] bg-[rgb(var(--ferry-surface))] p-3 ferry-shadow-lift">
                  <p className="m-0 px-1 pt-1 text-[10px] font-medium uppercase tracking-[0.2em] text-[rgb(var(--ferry-faint))]">
                    Route payout via
                  </p>
                  <p className="m-0 mt-1 px-1 text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                    Choose a corridor
                  </p>
                  <div role="radiogroup" aria-label="Corridor" className="mt-3 grid gap-1" onKeyDown={m}>
                    {PAYOUT_SAMPLES.map((g, A) => {
                      const E = getCurrency(g.from),
                        S = getCurrency(g.to),
                        M = A === t;
                      return (
                        <button
                          key={g.id}
                          type="button"
                          role="radio"
                          aria-checked={M}
                          tabIndex={M ? 0 : -1}
                          onClick={() => n(A)}
                          className="relative flex items-center gap-3 rounded-[12px] px-2.5 py-2 text-left transition-colors hover:bg-[rgb(var(--ferry-raised))]"
                        >
                          {M && (
                            <motion.span
                              layoutId="route-sel"
                              className="absolute inset-0 rounded-[12px] border border-solid border-[rgb(var(--ferry-accent)/.6)] bg-[rgb(var(--ferry-accent)/.06)] shadow-[0_0_0_3px_rgb(var(--ferry-accent)/.1),0_0_24px_-6px_rgb(var(--ferry-accent)/.5)]"
                              transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 38,
                              }}
                            />
                          )}
                          <span className="relative">
                            <CurrencyDot c={S} size={30} />
                          </span>
                          <span className="relative min-w-0">
                            <span className="block truncate text-[14px] font-medium text-[rgb(var(--ferry-ink))]">
                              {E.city}
                              {" to "}
                              {S.city}
                            </span>
                            <span className="block text-[11px] text-[rgb(var(--ferry-faint))]">
                              {S.rail}
                              {", about "}
                              {durationText(S.minutes)}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </Frame>
      </div>
    </section>
  );
}
