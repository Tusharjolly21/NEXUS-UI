"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { feeFor, getCurrency, rateBetween } from "./data";
import type { IconName } from "./icons";
import { ButtonLink, Frame, Icon, Panel, PulseGrid, SectionHeading } from "./ui";

export const CODE_TABS = ["cURL", "Node", "Python"] as const;

type CodeTab = (typeof CODE_TABS)[number];

export const CODE_SAMPLES: Record<CodeTab, string> = {
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

/** One highlighted run of source text. */
type Token = {
  /** The text of the run. */
  t: string;
  /** The CSS colour the run is drawn in. */
  c: string;
};

export function tokenize(source: string, json = false): Token[] {
  const pattern =
      /("(?:[^"\\]|\\.)*")(\s*:)?|(-[A-Za-z]\b)|(\$[A-Z_]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\()|([A-Za-z_][\w]*)|(\\)/g,
    tokens: Token[] = [];
  let lastIndex = 0;
  for (let match: RegExpExecArray | null; (match = pattern.exec(source));) {
    if (match.index > lastIndex) {
      tokens.push({
        t: source.slice(lastIndex, match.index),
        c: SYNTAX_COLORS.plain,
      });
    }
    if (match[1]) {
      tokens.push({
        t: match[1],
        c: json && match[2] ? SYNTAX_COLORS.key : SYNTAX_COLORS.str,
      });
      if (match[2]) {
        tokens.push({
          t: match[2],
          c: SYNTAX_COLORS.plain,
        });
      }
    } else if (match[3]) {
      tokens.push({
        t: match[3],
        c: SYNTAX_COLORS.flag,
      });
    } else if (match[4]) {
      tokens.push({
        t: match[4],
        c: SYNTAX_COLORS.env,
      });
    } else if (match[5]) {
      tokens.push({
        t: match[5],
        c: SYNTAX_COLORS.num,
      });
    } else if (match[6]) {
      tokens.push({
        t: match[6],
        c: SYNTAX_COLORS.fn,
      });
    } else if (match[7]) {
      tokens.push({
        t: match[7],
        c: KEYWORDS.has(match[7]) ? SYNTAX_COLORS.kw : SYNTAX_COLORS.plain,
      });
    } else {
      tokens.push({
        t: match[0],
        c: SYNTAX_COLORS.dim,
      });
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < source.length) {
    tokens.push({
      t: source.slice(lastIndex),
      c: SYNTAX_COLORS.plain,
    });
  }
  return tokens;
}

type HighlightedProps = {
  src: string;
  /** Colour object keys differently from string values. */
  json?: boolean;
  /** Only draw this many leading characters (typewriter effect). */
  upto?: number;
};

export function Highlighted({ src, json, upto }: HighlightedProps) {
  const tokens = useMemo(() => tokenize(src, json), [src, json]);
  let remaining = upto ?? Infinity;
  return (
    <>
      {tokens.map((token, index) => {
        if (remaining <= 0) return null;
        const text = token.t.length > remaining ? token.t.slice(0, remaining) : token.t;
        remaining -= token.t.length;
        return (
          <span
            key={index}
            style={{
              color: token.c,
            }}
          >
            {text}
          </span>
        );
      })}
    </>
  );
}

type DevFeature = readonly [icon: IconName, title: string, body: string];

export const DEV_FEATURES: readonly DevFeature[] = [
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

type RunState = "idle" | "running" | "done";

export function Developers() {
  const reducedMotion = useReducedMotion(),
    [tab, setTab] = useState<CodeTab>("Node"),
    [copied, setCopied] = useState(false),
    [runState, setRunState] = useState<RunState>("idle"),
    [typedChars, setTypedChars] = useState(0),
    [showWebhook, setShowWebhook] = useState(false),
    timers = useRef<number[]>([]),
    responseJson = useMemo(() => {
      const gbp = getCurrency("GBP"),
        inr = getCurrency("INR"),
        fee = feeFor(12400),
        arrival = new Date(Date.now() + inr.minutes * 6e4);
      arrival.setSeconds(0, 0);
      return JSON.stringify(
        {
          id: "po_3NcV7qK2",
          status: "in_transit",
          amount: 12400,
          currency: "GBP",
          rate: +rateBetween(gbp, inr).toFixed(4),
          fee: +fee.toFixed(2),
          target_amount: +((12400 - fee) * rateBetween(gbp, inr)).toFixed(2),
          target_currency: "INR",
          rail: inr.rail,
          estimated_arrival: arrival.toISOString().replace(".000", ""),
        },
        null,
        2,
      );
    }, []),
    clearTimers = () => {
      timers.current.forEach((timerId) => window.clearTimeout(timerId));
      timers.current = [];
    };
  useEffect(() => clearTimers, []);
  const runRequest = () => {
      clearTimers();
      setRunState("running");
      setTypedChars(0);
      setShowWebhook(false);
      timers.current.push(
        window.setTimeout(() => {
          setRunState("done");
          if (reducedMotion) {
            setTypedChars(responseJson.length);
            setShowWebhook(true);
            return;
          }
          const startedAt = performance.now(),
            tick = () => {
              const chars = Math.min(
                responseJson.length,
                Math.round(((performance.now() - startedAt) / 900) * responseJson.length),
              );
              setTypedChars(chars);
              if (chars < responseJson.length) {
                timers.current.push(window.setTimeout(tick, 16));
              } else {
                timers.current.push(window.setTimeout(() => setShowWebhook(true), 900));
              }
            };
          tick();
        }, 420),
      );
    },
    copyCode = async () => {
      try {
        await navigator.clipboard.writeText(CODE_SAMPLES[tab]);
      } catch {}
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
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
          <Panel edge={true} className="flex flex-col p-4 sm:p-6">
            <ul className="m-0 grid list-none gap-2 p-0">
              {DEV_FEATURES.map(([icon, title, body]) => (
                <li
                  key={title}
                  className="flex gap-3 rounded-[16px] border border-solid border-[rgb(var(--ferry-line)/.08)] bg-[rgb(var(--ferry-surface))] p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-solid border-[rgb(var(--ferry-accent)/.25)] bg-[rgb(var(--ferry-accent)/.1)] text-[rgb(var(--ferry-accent-ink))]">
                    <Icon name={icon} size={15} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-medium text-[rgb(var(--ferry-ink))]">{title}</span>
                    <span className="mt-0.5 block text-[13px] leading-[1.5] text-[rgb(var(--ferry-mute))]">
                      {body}
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
          <Panel glow={true} className="p-2">
            <div className="relative overflow-hidden rounded-[16px] border border-solid border-white/10 bg-[#0b0b0f]">
              <div className="flex items-center justify-between gap-3 border-b border-solid border-white/[.08] px-3 py-2.5">
                <div role="tablist" aria-label="Language" className="flex gap-1">
                  {CODE_TABS.map((codeTab) => (
                    <button
                      key={codeTab}
                      type="button"
                      role="tab"
                      aria-selected={codeTab === tab}
                      onClick={() => setTab(codeTab)}
                      className={`relative h-8 rounded-[8px] px-3.5 text-[13px] font-medium transition-colors ${codeTab === tab ? "text-white" : "text-white/55 hover:text-white/85"}`}
                    >
                      {codeTab === tab && (
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
                      <span className="relative">{codeTab}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] text-white/70 transition-colors hover:bg-white/[.08] hover:text-white"
                  aria-live="polite"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={copied ? "y" : "n"}
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
                      <Icon name={copied ? "checkmark" : "doc_on_doc"} size={13} />
                    </motion.span>
                  </AnimatePresence>
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="relative">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.pre
                    key={tab}
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
                      <Highlighted src={CODE_SAMPLES[tab]} />
                    </code>
                  </motion.pre>
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-solid border-white/[.08] px-4 py-3">
                <div className="flex items-center gap-2 text-[13px]" aria-live="polite">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {runState === "idle" && (
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
                    {runState === "running" && (
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
                    {runState === "done" && (
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
                  onClick={runRequest}
                  disabled={runState === "running"}
                  className="flex h-9 items-center gap-2 rounded-[9px] bg-[rgb(var(--ferry-accent))] px-3.5 text-[13px] font-medium text-white transition-[filter,opacity] hover:brightness-110 disabled:opacity-60"
                >
                  <Icon name={runState === "done" ? "arrow_clockwise" : "play_fill"} size={11} />
                  {runState === "done" ? "Run again" : "Run request"}
                </button>
              </div>
              <AnimatePresence initial={false}>
                {runState === "done" && (
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
                        <Highlighted src={responseJson} json={true} upto={typedChars} />
                        {typedChars < responseJson.length && (
                          <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-white/70" />
                        )}
                      </code>
                    </pre>
                    <AnimatePresence>
                      {showWebhook && (
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
