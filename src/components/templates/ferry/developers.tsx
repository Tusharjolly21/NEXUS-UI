// @ts-nocheck -- temporary during decompile cleanup
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { feeFor, getCurrency, rateBetween } from "./data";
import { ButtonLink, Frame, Icon, Panel, PulseGrid, SectionHeading } from "./ui";

export const CODE_TABS = ["cURL", "Node", "Python"];

export const CODE_SAMPLES = {
  cURL: `curl https://api.ferry.example/v1/payouts \\
  -H "Authorization: Bearer $FERRY_KEY" \\
  -H "Idempotency-Key: 7f9c2e1a" \\
  -d amount=12400 \\
  -d currency=GBP \\
  -d target_currency=INR \\
  -d recipient=rcp_8Hq2Lm`,
  Node: `import Ferry from "@ferry/node";

const ferry = new Ferry(process.env.FERRY_KEY);

const payout = await ferry.payouts.create({
  amount: 12400,
  currency: "GBP",
  targetCurrency: "INR",
  recipient: "rcp_8Hq2Lm",
});`,
  Python: `import os, ferry

client = ferry.Client(os.environ["FERRY_KEY"])

payout = client.payouts.create(
    amount=12400,
    currency="GBP",
    target_currency="INR",
    recipient="rcp_8Hq2Lm",
)`,
};

export const SYNTAX_COLORS = {
  kw: "#fc5fa3",
  str: "#fc6a5d",
  num: "#d0bf69",
  key: "#67b7a4",
  flag: "#a167e6",
  env: "#5dd8ff",
  fn: "#67b7a4",
  plain: "#e5e5ea",
  dim: "#8e8e93",
};

export const KEYWORDS = new Set(["import", "from", "const", "await", "new", "curl", "true", "false", "null"]);

export function tokenize(e, t = !1) {
  const n =
      /("(?:[^"\\]|\\.)*")(\s*:)?|(-[A-Za-z]\b)|(\$[A-Z_]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\()|([A-Za-z_][\w]*)|(\\)/g,
    r = [];
  let i = 0;
  for (let s; (s = n.exec(e));)
    (s.index > i &&
      r.push({
        t: e.slice(i, s.index),
        c: SYNTAX_COLORS.plain,
      }),
      s[1]
        ? (r.push({
            t: s[1],
            c: t && s[2] ? SYNTAX_COLORS.key : SYNTAX_COLORS.str,
          }),
          s[2] &&
            r.push({
              t: s[2],
              c: SYNTAX_COLORS.plain,
            }))
        : s[3]
          ? r.push({
              t: s[3],
              c: SYNTAX_COLORS.flag,
            })
          : s[4]
            ? r.push({
                t: s[4],
                c: SYNTAX_COLORS.env,
              })
            : s[5]
              ? r.push({
                  t: s[5],
                  c: SYNTAX_COLORS.num,
                })
              : s[6]
                ? r.push({
                    t: s[6],
                    c: SYNTAX_COLORS.fn,
                  })
                : s[7]
                  ? r.push({
                      t: s[7],
                      c: KEYWORDS.has(s[7]) ? SYNTAX_COLORS.kw : SYNTAX_COLORS.plain,
                    })
                  : r.push({
                      t: s[0],
                      c: SYNTAX_COLORS.dim,
                    }),
      (i = n.lastIndex));
  return (
    i < e.length &&
      r.push({
        t: e.slice(i),
        c: SYNTAX_COLORS.plain,
      }),
    r
  );
}

export function Highlighted({ src: e, json: t, upto: n }) {
  const r = useMemo(() => tokenize(e, t), [e, t]);
  let i = n ?? 1 / 0;
  return (
    <>
      {r.map((s, o) => {
        if (i <= 0) return null;
        const l = s.t.length > i ? s.t.slice(0, i) : s.t;
        return (
          (i -= s.t.length),
          (
            <span
              key={o}
              style={{
                color: s.c,
              }}
            >
              {l}
            </span>
          )
        );
      })}
    </>
  );
}

export const DEV_FEATURES = [
  [
    "bolt_fill",
    "Webhooks for every status change",
    "Know the moment a payout arrives, fails or is returned.",
  ],
  [
    "lock_shield_fill",
    "Safe to retry",
    "Send the same idempotency key twice and the payment only happens once.",
  ],
  ["cube_box_fill", "A sandbox with test money", "Every account, rate and rail, with nothing real at stake."],
];

export function Developers() {
  const e = useReducedMotion(),
    [t, n] = useState("Node"),
    [r, i] = useState(!1),
    [s, o] = useState("idle"),
    [l, c] = useState(0),
    [u, d] = useState(!1),
    f = useRef([]),
    h = useMemo(() => {
      const v = getCurrency("GBP"),
        p = getCurrency("INR"),
        m = feeFor(12400),
        g = new Date(Date.now() + p.minutes * 6e4);
      return (
        g.setSeconds(0, 0),
        JSON.stringify(
          {
            id: "po_3NcV7qK2",
            status: "in_transit",
            amount: 12400,
            currency: "GBP",
            rate: +rateBetween(v, p).toFixed(4),
            fee: +m.toFixed(2),
            target_amount: +((12400 - m) * rateBetween(v, p)).toFixed(2),
            target_currency: "INR",
            rail: p.rail,
            estimated_arrival: g.toISOString().replace(".000", ""),
          },
          null,
          2,
        )
      );
    }, []),
    x = () => {
      (f.current.forEach((v) => window.clearTimeout(v)), (f.current = []));
    };
  useEffect(() => x, []);
  const w = () => {
      (x(),
        o("running"),
        c(0),
        d(!1),
        f.current.push(
          window.setTimeout(() => {
            if ((o("done"), e)) {
              (c(h.length), d(!0));
              return;
            }
            const v = performance.now(),
              p = () => {
                const m = Math.min(h.length, Math.round(((performance.now() - v) / 900) * h.length));
                (c(m),
                  m < h.length
                    ? f.current.push(window.setTimeout(p, 16))
                    : f.current.push(window.setTimeout(() => d(!0), 900)));
              };
            p();
          }, 420),
        ));
    },
    y = async () => {
      try {
        await navigator.clipboard.writeText(CODE_SAMPLES[t]);
      } catch {}
      (i(!0), window.setTimeout(() => i(!1), 1600));
    };
  return (
    <section id="developers" className="scroll-mt-24 px-3 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-end gap-6 px-2 lg:grid-cols-2">
        <SectionHeading
          align="left"
          label="Developers"
          title={
            <>
              {"Build Ferry into "}
              <span className="text-[rgb(var(--ferry-faint))]">your product.</span>
            </>
          }
        />
        <p className="m-0 max-w-[440px] text-[16px] leading-[1.6] text-[rgb(var(--ferry-mute))] lg:justify-self-end">
          The same accounts, rates and payouts are a REST API. Try it with sandbox money, then go live by
          changing one key.
        </p>
      </div>
      <Frame className="mx-auto mt-12 max-w-[1160px]">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <Panel edge={!0} className="flex flex-col p-4 sm:p-6">
            <ul className="m-0 grid list-none gap-2 p-0">
              {DEV_FEATURES.map(([v, p, m]) => (
                <li
                  key={p}
                  className="flex gap-3 rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-solid border-[rgb(var(--ferry-accent)/.25)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]">
                    <Icon name={v} size={15} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-[rgb(var(--ferry-ink))]">{p}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.5] text-[rgb(var(--ferry-mute))]">
                      {m}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
              <ButtonLink href="#developers">Read the API docs</ButtonLink>
              <span className="ferry-tnum text-[12px] text-[rgb(var(--ferry-faint))]">
                Median response 184 ms
              </span>
            </div>
          </Panel>
          <Panel glow={!0} className="p-2">
            <div className="relative overflow-hidden rounded-[16px] border border-solid border-white/10 bg-[#0b0b0f]">
              <div className="flex items-center justify-between gap-3 border-b border-solid border-white/[.08] px-3 py-2.5">
                <div role="tablist" aria-label="Language" className="flex gap-1">
                  {CODE_TABS.map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="tab"
                      aria-selected={v === t}
                      onClick={() => n(v)}
                      className={`relative h-8 rounded-[8px] px-3.5 text-[13px] font-medium transition-colors ${v === t ? "text-white" : "text-white/55 hover:text-white/85"}`}
                    >
                      {v === t && (
                        <motion.span
                          layoutId="lang-pill"
                          className="absolute inset-0 rounded-[8px] border border-solid border-white/10 bg-white/[.08]"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 38,
                          }}
                        />
                      )}
                      <span className="relative">{v}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={y}
                  className="flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] text-white/70 transition-colors hover:bg-white/[.08] hover:text-white"
                  aria-live="polite"
                >
                  <AnimatePresence mode="popLayout" initial={!1}>
                    <motion.span
                      key={r ? "y" : "n"}
                      initial={{
                        opacity: 0,
                        scale: 0.6,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.6,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 600,
                        damping: 30,
                      }}
                      className="flex"
                    >
                      <Icon name={r ? "checkmark" : "doc_on_doc"} size={13} />
                    </motion.span>
                  </AnimatePresence>
                  {r ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <AnimatePresence mode="popLayout" initial={!1}>
                  <motion.pre
                    key={t}
                    initial={{
                      opacity: 0,
                      filter: "blur(4px)",
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(4px)",
                    }}
                    transition={{
                      duration: 0.22,
                    }}
                    className="m-0 overflow-x-auto px-5 py-5 font-mono text-[13px] leading-[1.7]"
                  >
                    <code>
                      <Highlighted src={CODE_SAMPLES[t]} />
                    </code>
                  </motion.pre>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-solid border-white/[.08] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px]" aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={!1}>
                    {s === "idle" && (
                      <motion.span
                        key={"i"}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="text-white/50"
                      >
                        Sandbox, no real money
                      </motion.span>
                    )}
                    {s === "running" && (
                      <motion.span
                        key={"r"}
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="flex items-center gap-2 text-white/70"
                      >
                        <PulseGrid />
                        Sending request
                      </motion.span>
                    )}
                    {s === "done" && (
                      <motion.span
                        key={"d"}
                        initial={{
                          opacity: 0,
                          y: 6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                        }}
                        className="flex items-center gap-2"
                      >
                        <span className="rounded-full border border-solid border-[#4ade80]/25 bg-[#4ade80]/10 px-2 py-0.5 text-[12px] font-medium text-[#4ade80]">
                          201 Created
                        </span>
                        <span className="ferry-tnum text-white/50">in 184 ms</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={w}
                  disabled={s === "running"}
                  className="flex h-9 items-center gap-2 rounded-[9px] bg-[rgb(var(--ferry-accent))] px-3.5 text-[13px] font-medium text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-60"
                >
                  <Icon name={s === "done" ? "arrow_clockwise" : "play_fill"} size={11} />
                  {s === "done" ? "Run again" : "Run request"}
                </button>
              </div>
              <AnimatePresence initial={!1}>
                {s === "done" && (
                  <motion.div
                    initial={{
                      height: 0,
                    }}
                    animate={{
                      height: "auto",
                    }}
                    exit={{
                      height: 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 260,
                      damping: 32,
                    }}
                    className="overflow-hidden border-t border-solid border-white/[.06] bg-white/[.02]"
                  >
                    <pre className="m-0 overflow-x-auto px-5 py-4 font-mono text-[13px] leading-[1.7]">
                      <code>
                        <Highlighted src={h} json={!0} upto={l} />
                        {l < h.length && (
                          <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-white/70" />
                        )}
                      </code>
                    </pre>
                    <AnimatePresence>
                      {u && (
                        <motion.div
                          initial={{
                            opacity: 0,
                            y: 8,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 420,
                            damping: 30,
                          }}
                          className="mx-4 mb-4 flex items-center gap-3 rounded-[12px] border border-solid border-white/[.08] bg-white/[.04] px-3.5 py-2.5 text-[13px]"
                        >
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-[#4ade80] text-[#052e14]">
                            <Icon name="checkmark" size={11} />
                          </span>
                          <span className="flex-1 text-white/85">
                            {"Webhook "}
                            <span className="font-mono text-[#67b7a4]">payout.in_transit</span>
                            {" delivered to your server"}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Panel>
        </div>
      </Frame>
    </section>
  );
}
