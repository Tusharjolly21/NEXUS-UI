"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability -- these rules assume code runs while rendering; here refs, timers and setState are used in handlers, effects and animation frames, and the animation state lives in refs on purpose */

import { Fragment, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView, useReducedMotion } from "framer-motion";
import { COLOR, CONTAINER, FONT_MONO, FONT_SANS, SPRING } from "./theme";
import { Icon, Mono, SectionTitle, TextLink } from "./ui";
/** Syntax colours for the code panel (a dark theme in the spirit of Tokyo Night). */
export const SYN_KEYWORD = "#C792EA";
export const SYN_STRING = "#9ECE6A";
export const SYN_FUNCTION = "#7AA2F7";
export const SYN_COMMENT = "#5C6370";
export const SYN_NUMBER = "#FF9E64";
export const SYN_PLAIN = "#D7DAE0";
/** [text, colour] */
type Token = [text: string, color: string];

export type CodeSample = {
  /** the endpoint shown in the panel header */
  ep: string;
  /** each line is a list of coloured tokens; an empty list is a blank line */
  lines: Token[][];
  /** what the console prints when the sample runs */
  log: string[];
  /** the JSON response, as [key, value, colour] */
  res: [key: string, value: string, color: string][];
};

export const CODE_SAMPLES: Record<string, CodeSample> = {
  Settle: {
    ep: "POST /V1/SETTLE",
    lines: [
      [
        ["import", SYN_KEYWORD],
        [" { Wharf } ", SYN_PLAIN],
        ["from", SYN_KEYWORD],
        [' "@wharf/sdk"', SYN_STRING],
      ],
      [],
      [
        ["const", SYN_KEYWORD],
        [" wharf = ", SYN_PLAIN],
        ["new", SYN_KEYWORD],
        [" Wharf", SYN_FUNCTION],
        ["({ apiKey: process.env.WHARF_KEY })", SYN_PLAIN],
      ],
      [],
      [["// Quote a cross-chain transfer, then settle it", SYN_COMMENT]],
      [
        ["const", SYN_KEYWORD],
        [" quote = ", SYN_PLAIN],
        ["await", SYN_KEYWORD],
        [" wharf.", SYN_PLAIN],
        ["quote", SYN_FUNCTION],
        ["({", SYN_PLAIN],
      ],
      [
        ["  from: { chain: ", SYN_PLAIN],
        ['"halo"', SYN_STRING],
        [", token: ", SYN_PLAIN],
        ['"USDT"', SYN_STRING],
        [" },", SYN_PLAIN],
      ],
      [
        ["  to: { chain: ", SYN_PLAIN],
        ['"meridian"', SYN_STRING],
        [", token: ", SYN_PLAIN],
        ['"USDC"', SYN_STRING],
        [" },", SYN_PLAIN],
      ],
      [
        ["  amount: ", SYN_PLAIN],
        ['"1000.00"', SYN_STRING],
        [",", SYN_PLAIN],
      ],
      [["})", SYN_PLAIN]],
      [],
      [
        ["const", SYN_KEYWORD],
        [" transfer = ", SYN_PLAIN],
        ["await", SYN_KEYWORD],
        [" wharf.", SYN_PLAIN],
        ["settle", SYN_FUNCTION],
        ["(quote.id)", SYN_PLAIN],
      ],
      [
        ["console.", SYN_PLAIN],
        ["log", SYN_FUNCTION],
        ["(transfer.status) ", SYN_PLAIN],
        ['// "settled"', SYN_COMMENT],
      ],
    ],
    log: ["quote · 3 routes · 182 ms", "route · halo → arclane → meridian", "settle · block 21,408,377"],
    res: [
      ["id", '"tr_8f2k41q"', SYN_STRING],
      ["status", '"settled"', SYN_STRING],
      ["amount", '"999.70"', SYN_STRING],
      ["route", '["halo", "arclane", "meridian"]', SYN_STRING],
      ["gas", '"sponsored"', SYN_STRING],
      ["settled_ms", "11020", SYN_NUMBER],
    ],
  },
  Sponsor: {
    ep: "POST /V1/SPONSOR",
    lines: [
      [
        ["import", SYN_KEYWORD],
        [" { Wharf } ", SYN_PLAIN],
        ["from", SYN_KEYWORD],
        [' "@wharf/sdk"', SYN_STRING],
      ],
      [],
      [
        ["const", SYN_KEYWORD],
        [" wharf = ", SYN_PLAIN],
        ["new", SYN_KEYWORD],
        [" Wharf", SYN_FUNCTION],
        ["({ apiKey: process.env.WHARF_KEY })", SYN_PLAIN],
      ],
      [],
      [["// Cover the gas so the payer never holds a native token", SYN_COMMENT]],
      [
        ["const", SYN_KEYWORD],
        [" tx = ", SYN_PLAIN],
        ["await", SYN_KEYWORD],
        [" wharf.", SYN_PLAIN],
        ["sponsor", SYN_FUNCTION],
        ["({", SYN_PLAIN],
      ],
      [
        ["  chain: ", SYN_PLAIN],
        ['"halo"', SYN_STRING],
        [",", SYN_PLAIN],
      ],
      [
        ["  app: ", SYN_PLAIN],
        ['"tessellate"', SYN_STRING],
        [",", SYN_PLAIN],
      ],
      [["  transfer: signedTransfer,", SYN_PLAIN]],
      [
        ["  maxGas: ", SYN_PLAIN],
        ['"0.50"', SYN_STRING],
        [",", SYN_PLAIN],
      ],
      [["})", SYN_PLAIN]],
      [],
      [
        ["console.", SYN_PLAIN],
        ["log", SYN_FUNCTION],
        ["(tx.status) ", SYN_PLAIN],
        ['// "sponsored"', SYN_COMMENT],
      ],
    ],
    log: ["estimate · 38,400 gas", "sponsor · halo · paid by wharf", "send · block 9,114,052"],
    res: [
      ["id", '"tx_5m1p9c"', SYN_STRING],
      ["status", '"sponsored"', SYN_STRING],
      ["chain", '"halo"', SYN_STRING],
      ["gas_paid_by", '"wharf"', SYN_STRING],
      ["billed_to", '"tessellate"', SYN_STRING],
      ["gas_used", "38400", SYN_NUMBER],
    ],
  },
};
export function Developers() {
  const [tab, setTab] = useState("Settle");
  const [typed, setTyped] = useState(0);
  const [run, setRun] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(codeRef, {
    once: true,
    amount: 0.35,
  });
  const reduce = useReducedMotion();
  const sample = CODE_SAMPLES[tab]!;
  // the code types itself in, four characters a frame; this is how many there are, newlines included
  const totalChars = sample.lines.reduce((count, line) => count + line.reduce((sum, [text]) => sum + text.length, 0) + 1, 0);
  useEffect(() => {
    setTyped(reduce ? totalChars : 0);
    setRun(0);
  }, [tab, reduce, totalChars]);
  useEffect(() => {
    if (!inView || reduce) {
      return;
    }
    const timer = window.setInterval(() => {
      setTyped((prev) => {
        if (prev >= totalChars) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 4;
      });
    }, 16);
    return () => window.clearInterval(timer);
  }, [inView, tab, reduce, totalChars]);
  const runSample = () => {
    setRun(1);
    window.setTimeout(() => setRun(2), 1300);
  };
  useEffect(() => {
    if (typed >= totalChars && run === 0 && inView) {
      // once it has finished typing, it runs itself
      const timer = window.setTimeout(() => runSample(), 500);
      return () => window.clearTimeout(timer);
    }
  }, [typed, totalChars, inView, run]);
  const copy = (what: string, text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch {
      // clipboard access can be blocked; the check mark still confirms the intent
    }
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1400);
  };
  let typedChars = typed;
  const plainCode = sample.lines.map((line) => line.map(([text]) => text).join("")).join("\n");
  return (
    <section id="developers" className="scroll-mt-20 py-24 sm:py-32">
      <div ref={codeRef} className={`${CONTAINER} grid gap-12 lg:grid-cols-[.8fr_1.2fr]`}>
        <div>
          <SectionTitle title="Ship it" rest="this afternoon." />
          <p
            className="m-0 mt-5 max-w-[380px] text-[16.5px] leading-[1.55]"
            style={{
              color: COLOR.text,
            }}
          >
            Typed SDKs, test tokens on every chain, and webhooks that fire exactly once.
          </p>
          <button
            type="button"
            onClick={() => copy("npm", "npm i @wharf/sdk")}
            className="wf-ring mt-7 flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 text-[14px] outline-none"
            style={{
              fontFamily: FONT_MONO,
              boxShadow: `0 0 0 1px ${COLOR.line2}`,
              color: COLOR.ink,
            }}
            aria-label="Copy install command"
          >
            <span
              style={{
                color: COLOR.faint,
              }}
            >
              $
            </span>
            npm i @wharf/sdk
            <span
              className="ml-2"
              style={{
                color: copied === "npm" ? COLOR.green : COLOR.soft,
              }}
            >
              <Icon name={copied === "npm" ? "ph:check" : "ph:copy"} size={15} />
            </span>
          </button>
          <ul
            className="m-0 mt-7 grid list-none gap-3 p-0 text-[15px]"
            style={{
              color: COLOR.text,
            }}
          >
            {["Sandbox on every chain", "Idempotent webhooks", "Typed errors you can switch on"].map((y) => (
              <li className="flex items-center gap-2.5" key={y}>
                <span
                  style={{
                    color: COLOR.soft,
                  }}
                >
                  <Icon name="ph:check" size={14} />
                </span>
                {y}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <TextLink>Read the quickstart</TextLink>
          </div>
        </div>
        <div
          className="overflow-hidden rounded-[24px] p-2"
          style={{
            background: COLOR.dark,
          }}
        >
          <div className="flex items-center justify-between px-2 py-2">
            <LayoutGroup id="code-tabs">
              <div role="tablist" className="flex gap-1">
                {["Settle", "Sponsor"].map((y) => (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === y}
                    onClick={() => setTab(y)}
                    className="wf-ring relative rounded-full px-3.5 py-1.5 text-[13px] outline-none"
                    style={{
                      color: tab === y ? COLOR.ink : "#C5C8CE",
                      boxShadow: tab === y ? undefined : "inset 0 0 0 1px rgba(255,255,255,.14)",
                    }}
                    key={y}
                  >
                    {tab === y && (
                      <motion.span
                        layoutId="code-pill"
                        className="absolute inset-0 rounded-full bg-white"
                        transition={SPRING}
                      />
                    )}
                    <span className="relative">{y}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>
            <Mono
              className="text-[11.5px] tracking-[0.04em]"
              style={{
                color: "#9DA1A8",
              }}
            >
              {sample.ep}
            </Mono>
          </div>
          <div
            className="rounded-[18px] p-5 text-[13px] leading-[1.75]"
            style={{
              background: COLOR.dark2,
              fontFamily: FONT_MONO,
            }}
          >
            <pre className="m-0 min-h-[310px] overflow-x-auto" aria-label="Code sample">
              {sample.lines.map((line, index) => {
                // spend the typed characters token by token, so the code appears as if typed
                const tokens = line.map(([text, color], index2) => {
                  const shown = text.slice(0, Math.max(0, typedChars));
                  typedChars -= text.length;
                  return shown ? (
                    <span style={{ color }} key={index2}>
                      {shown}
                    </span>
                  ) : null;
                });
                typedChars -= 1;
                const visible = typedChars >= -1 || tokens.some(Boolean);
                return (
                  <div
                    className="flex"
                    style={{
                      opacity: visible ? 1 : 0,
                    }}
                    key={index}
                  >
                    <span
                      className="w-8 shrink-0 select-none text-right pr-4"
                      style={{
                        color: "#4B4F57",
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="whitespace-pre">
                      {tokens}
                      {typed < totalChars &&
                        typedChars < 0 &&
                        typedChars > -line.reduce((sum, [text]) => sum + text.length, 0) - 2 && (
                          <span
                            className="wf-anim ml-px inline-block h-4 w-[7px] translate-y-0.5"
                            style={{
                              background: COLOR.mid,
                              animation: "wf-blink 1s steps(1) infinite",
                            }}
                          />
                        )}
                    </span>
                  </div>
                );
              })}
            </pre>
            <AnimatePresence>
              {run > 0 && (
                <motion.ul
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  className="m-0 mt-2 list-none overflow-hidden p-0 pl-8 text-[12px]"
                  style={{
                    color: "#C5C8CE",
                  }}
                >
                  {sample.log.map((y, index) => (
                    <motion.li
                      initial={{
                        opacity: 0,
                        x: -6,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.35,
                      }}
                      className="flex items-center gap-2"
                      key={y}
                    >
                      <i
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: run === 2 || index < 2 ? "#4ADE80" : "#9DA1A8",
                        }}
                      />
                      {y}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={runSample}
                className="wf-ring flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] outline-none"
                style={{
                  color: "#fff",
                  background: COLOR.blue,
                  fontFamily: FONT_SANS,
                }}
              >
                <Icon name="ph:play-fill" size={11} />
                Run
              </button>
              <button
                type="button"
                onClick={() => copy("code", plainCode)}
                className="wf-ring flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] outline-none"
                style={{
                  color: "#E4E6EA",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.16)",
                  fontFamily: FONT_SANS,
                }}
              >
                <Icon name={copied === "code" ? "ph:check" : "ph:copy"} size={13} />
                {copied === "code" ? "Copied" : "Copy"}
              </button>
              <a
                href="#"
                onClick={(y) => y.preventDefault()}
                className="wf-ring flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] no-underline outline-none"
                style={{
                  color: "#E4E6EA",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,.16)",
                  fontFamily: FONT_SANS,
                }}
              >
                GitHub
                <Icon name="ph:arrow-up-right" size={12} />
              </a>
            </div>
          </div>
          <div
            className="mt-2 rounded-[18px] p-5 text-[12.5px] leading-[1.7]"
            style={{
              background: COLOR.dark2,
              fontFamily: FONT_MONO,
            }}
            aria-live="polite"
          >
            <div
              className="flex items-center justify-between text-[11.5px] tracking-[0.06em]"
              style={{
                color: "#8B8F96",
              }}
            >
              RESPONSE
              <span
                className="flex items-center gap-1.5"
                style={{
                  color: run === 2 ? "#E4E6EA" : "#8B8F96",
                }}
              >
                <i
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    background: run === 2 ? "#4ADE80" : run === 1 ? "#FBBF24" : "#5C6068",
                  }}
                />
                {run === 2 ? "200 OK" : run === 1 ? "pending" : "idle"}
              </span>
            </div>
            <div
              className="mt-2 min-h-[150px]"
              style={{
                color: SYN_PLAIN,
              }}
            >
              {run === 2 ? (
                <Fragment>
                  {"{"}
                  {sample.res.map(([key, value, color], index) => (
                    <motion.div
                      initial={{
                        opacity: 0,
                        x: -4,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.06,
                      }}
                      className="pl-4"
                      key={key}
                    >
                      <span
                        style={{
                          color: "#E4E6EA",
                        }}
                      >
                        &quot;{key}&quot;
                      </span>
                      :{" "}
                      <span
                        style={{
                          color,
                        }}
                      >
                        {value}
                      </span>
                      {index < sample.res.length - 1 ? "," : ""}
                    </motion.div>
                  ))}
                  {"}"}
                </Fragment>
              ) : (
                <span
                  style={{
                    color: "#5C6068",
                  }}
                >
                  {run === 1 ? "…" : "Press Run to call the sandbox."}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
