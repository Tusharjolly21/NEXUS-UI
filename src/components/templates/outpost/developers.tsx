"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONTAINER, DARK, EASE, FONT_MONO, clamp, formatNumber } from "./theme";
import { Button, Icon, Reveal, SectionTitle, useLiveInView } from "./ui";

const PY_KEYWORDS = new Set([
  "import",
  "from",
  "const",
  "await",
  "for",
  "in",
  "print",
  "async",
  "def",
  "return",
  "with",
  "as",
  "True",
  "False",
  "None",
  "new",
  "export",
  "let",
]);

/** Colour a line of Python or TypeScript into [text, color] tokens. */
function highlight(code: string) {
  const tokens: ReactNode[] = [];
  const pattern = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|#.*$|\/\/.*$|\b\d[\d_.]*\b|\b[A-Za-z_][\w]*\b|\s+|.)/g;
  let match: RegExpExecArray | null;
  let last = 0;
  while ((match = pattern.exec(code))) {
    const text = match[0];
    let color = "#D4D4D8";
    if (/^["']/.test(text)) {
      color = "#9FE6CF";
    } else {
      if (/^(#|\/\/)/.test(text)) {
        color = "#5C5C66";
      } else {
        if (/^\d/.test(text)) {
          color = DARK.amber;
        } else {
          if (PY_KEYWORDS.has(text)) {
            color = "#C4A8FF";
          } else {
            if (/^[A-Za-z_]/.test(text) && code[pattern.lastIndex] === "(") {
              color = "#8DB8FF";
            } else {
              if (/^[A-Z]/.test(text)) {
                color = "#F2C48D";
              }
            }
          }
        }
      }
    }
    tokens.push(
      <span
        key={last++}
        style={{
          color,
        }}
      >
        {text}
      </span>,
    );
  }
  return tokens;
}

const SNIPPETS = [
  {
    t: "Chat completions",
    d: "OpenAI-compatible, streaming on by default.",
    file: "main.py",
    lang: "Python 3.12",
    mark: [5, 10],
    stats: [
      ["First token", "36 ms"],
      ["Throughput", "2,380 tok/s"],
      ["Cost", "$0.0003"],
    ],
    code: `import os
from openai import OpenAI

client = OpenAI(
    base_url="https://api.outpost.run/v1",
    api_key=os.environ["OUTPOST_API_KEY"],
)

stream = client.chat.completions.create(
    model="mistral-small-24b",
    messages=[{"role": "user", "content": "Can I rotate a key without downtime?"}],
    stream=True,
)

for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")`,
  },
  {
    t: "Function calling",
    d: "Typed tools and strict JSON output.",
    file: "ticket.ts",
    lang: "TypeScript",
    mark: [2, 7],
    stats: [
      ["Latency", "104 ms"],
      ["Tool", "open_ticket"],
      ["Retries", "0"],
    ],
    code: `const res = await client.chat.completions.create({
  model: "qwen-2.5-32b-instruct",
  messages: [{ role: "user", content: "My invoice 2231 is wrong" }],
  tools: [{
    type: "function",
    function: {
      name: "open_ticket",
      parameters: {
        type: "object",
        properties: { invoice_id: { type: "string" } },
      },
    },
  }],
});`,
  },
  {
    t: "Batch",
    tag: "50% off",
    d: "Half price for jobs that can wait a day.",
    file: "batch.py",
    lang: "Python 3.12",
    mark: [6],
    stats: [
      ["Requests", "12,000"],
      ["Finished in", "3 h 12 min"],
      ["Saved", "$84.20"],
    ],
    code: `job = client.batches.create(
    input_file_id=upload.id,
    endpoint="/v1/chat/completions",
    completion_window="24h",
)
# label 12,000 support tickets overnight
print(job.id, job.status)`,
  },
  {
    t: "Fine-tuning",
    d: "Train LoRA adapters on your own data.",
    file: "train.sh",
    lang: "Shell",
    mark: [3, 4],
    stats: [
      ["Epochs", "3"],
      ["Final loss", "0.41"],
      ["Adapter", "38 MB"],
    ],
    code: `curl https://api.outpost.run/v1/fine_tuning/jobs \\
  -H "Authorization: Bearer $OUTPOST_API_KEY" \\
  -d '{"model": "mistral-small-24b",
       "training_file": "file-support-2024"}'`,
  },
  {
    t: "Tracing",
    tag: "New",
    d: "See latency and cost for every request.",
    file: "trace.ts",
    lang: "TypeScript",
    mark: [3],
    stats: [
      ["Spans", "5"],
      ["Total", "412 ms"],
      ["Cost", "$0.0011"],
    ],
    code: `const res = await client.chat.completions.create(
  { model: "mistral-small-24b", messages },
  { headers: { "x-outpost-trace": "checkout-help" } },
);
// open the trace in the console`,
  },
];

const SAMPLE_ANSWER =
  "Yes. Create the new key first, deploy it alongside the old one, then revoke the old key once traffic has moved. Both keys work at the same time, so nothing drops.";

function SnippetOutput({ i: index, run, live }: { i: number; run: number; live: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // restart the output whenever the snippet, the run count or visibility changes
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTick(0);
    if (!live) {
      setTick(999);
      return;
    }
    let t = 0;
    const timer = window.setInterval(() => {
      t += 1;
      setTick(t);
      if (t > 200) {
        window.clearInterval(timer);
      }
    }, 34);
    return () => window.clearInterval(timer);
  }, [index, run, live]);
  if (index === 0) {
    const words = SAMPLE_ANSWER.split(" ");
    const shown = Math.min(words.length, tick);
    return (
      <div className="p-4">
        <p
          className="ml-auto w-fit max-w-[85%] rounded-xl px-3 py-2 text-[13px]"
          style={{
            background: DARK.raise,
            color: DARK.ink,
          }}
        >
          Can I rotate a key without downtime?
        </p>
        <p
          className="mt-4 text-[14px] leading-[1.7]"
          style={{
            color: DARK.ink,
          }}
        >
          {words.slice(0, shown).join(" ")}
          {shown < words.length && (
            <span
              className="op-caret ml-0.5 inline-block h-[1em] w-[7px] translate-y-[2px]"
              style={{
                background: DARK.teal,
              }}
            />
          )}
        </p>
      </div>
    );
  }
  if (index === 1) {
    const lines = ["{", '  "name": "open_ticket",', '  "arguments": {', '    "invoice_id": "2231"', "  }", "}"];
    const checks = ["Matched the open_ticket tool", "Arguments fit the JSON schema", "Ready for your handler"];
    return (
      <div className="p-4">
        <pre
          className="rounded-xl p-3 text-[12px] leading-[1.7]"
          style={{
            background: "rgba(0,0,0,.35)",
            boxShadow: `inset 0 0 0 1px ${DARK.line}`,
            fontFamily: FONT_MONO,
          }}
        >
          {lines.slice(0, Math.min(lines.length, Math.floor(tick / 3))).map((line, i) => (
            <div key={i}>{highlight(line)}</div>
          ))}
        </pre>
        <ul className="mt-3 space-y-2">
          {checks.map(
            (check, i) =>
              tick > 20 + i * 6 && (
                <motion.li
                  key={check}
                  initial={{
                    opacity: 0,
                    x: -6,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className="flex items-center gap-2 text-[13px]"
                  style={{
                    color: DARK.ink,
                  }}
                >
                  <span
                    style={{
                      color: DARK.teal,
                    }}
                  >
                    <Icon name="ph:check-circle-fill" size={15} />
                  </span>
                  {check}
                </motion.li>
              ),
          )}
        </ul>
      </div>
    );
  }
  if (index === 2) {
    const progress = clamp(tick / 70);
    return (
      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <p
            className="text-[13px]"
            style={{
              color: DARK.text,
            }}
          >
            batch_7Kq2 · support-labels
          </p>
          <span
            className="text-[12px]"
            style={{
              color: progress >= 1 ? DARK.teal : DARK.amber,
            }}
          >
            {progress >= 1 ? "Completed" : "In progress"}
          </span>
        </div>
        <p
          className="mt-3 text-[30px] font-[500] tracking-[-0.03em]"
          style={{
            color: DARK.ink,
          }}
        >
          {formatNumber(Math.round(progress * 12e3))}
          <span
            className="text-[14px]"
            style={{
              color: DARK.soft,
            }}
          >
            {" / 12,000"}
          </span>
        </p>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full"
          style={{
            background: DARK.raise,
          }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: `linear-gradient(90deg, ${DARK.teal}, ${DARK.sky})`,
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-12 gap-[3px]">
          {Array.from(
            {
              length: 48,
            },
            (row, j) => (
              <span
                key={j}
                className="h-3 rounded-[2px] transition-colors duration-300"
                style={{
                  background: j / 48 < progress ? "rgba(63,224,197,.65)" : DARK.raise,
                }}
              />
            ),
          )}
        </div>
      </div>
    );
  }
  if (index === 3) {
    const points = Array.from(
      {
        length: 40,
      },
      (_, i) => [i * 7, 12 + 80 * Math.exp(-i / 9) + Math.sin(i * 1.7) * 3],
    );
    const shown = Math.min(points.length, Math.floor(tick / 1.5) + 1);
    return (
      <div className="p-4">
        <p
          className="text-[13px]"
          style={{
            color: DARK.text,
          }}
        >
          Training loss · ft-support-v4
        </p>
        <svg viewBox="0 0 280 110" className="mt-3 w-full">
          <path d="M0 100 H280" stroke={DARK.line2} />
          {shown > 1 && (
            <polyline
              points={points
                .slice(0, shown)
                .map(([x, y]) => `${x},${y}`)
                .join(" ")}
              fill="none"
              stroke={DARK.violet}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}
          {shown > 1 && <circle cx={points[shown - 1][0]} cy={points[shown - 1][1]} r="3.5" fill={DARK.violet} />}
        </svg>
        <div
          className="mt-2 flex justify-between text-[11.5px]"
          style={{
            color: DARK.soft,
            fontFamily: FONT_MONO,
          }}
        >
          <span>epoch 1</span>
          <span>epoch 2</span>
          <span>epoch 3</span>
        </div>
      </div>
    );
  }
  const rows: [name: string, start: number, width: number, color: string][] = [
    ["route", 0, 6, DARK.sky],
    ["queue", 6, 10, DARK.soft],
    ["prefill", 16, 70, DARK.violet],
    ["decode", 86, 300, DARK.teal],
    ["stream", 120, 292, DARK.amber],
  ];
  return (
    <div className="p-4">
      <p
        className="text-[13px]"
        style={{
          color: DARK.text,
        }}
      >
        trace checkout-help · 412 ms
      </p>
      <ul className="mt-4 space-y-2.5">
        {rows.map(([name, start, width, color], i) => (
          <li
            key={name}
            className="flex items-center gap-3 text-[12px]"
            style={{
              fontFamily: FONT_MONO,
            }}
          >
            <span
              className="w-14"
              style={{
                color: DARK.text,
              }}
            >
              {name}
            </span>
            <span className="relative h-2.5 flex-1">
              <motion.span
                className="absolute inset-y-0 rounded-sm"
                initial={{
                  width: 0,
                }}
                animate={{
                  width: tick > i * 5 ? `${(width / 412) * 100}%` : 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: EASE,
                }}
                style={{
                  left: `${(start / 412) * 100}%`,
                  background: color,
                }}
              />
            </span>
            <span
              className="w-12 text-right"
              style={{
                color: DARK.soft,
              }}
            >
              {width}
              {" ms"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Developers() {
  const [ref, live] = useLiveInView("-20% 0px");
  const [active, setActive] = useState(0);
  const [runs, setRuns] = useState(0);
  const [copied, setCopied] = useState(false);
  const snippet = SNIPPETS[active];
  const copy = () => {
    navigator.clipboard?.writeText(snippet.code).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  return (
    <section id="code" className="pb-28">
      <div className={CONTAINER}>
        <Reveal>
          <SectionTitle className="max-w-[640px]">
            Change one URL.
            <br />
            Keep the code you have.
          </SectionTitle>
        </Reveal>
        <Reveal delay={0.06}>
          <p
            className="mt-4 max-w-[480px] text-[15.5px] leading-[1.55]"
            style={{
              color: DARK.text,
            }}
          >
            Outpost speaks the OpenAI API, so the SDKs and tools you already use work without changes.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Button icon="ph:arrow-right" href="#cta">
              Read the docs
            </Button>
            <Button kind="ghost" href="#cta">
              Get an API key
            </Button>
          </div>
        </Reveal>
        <div className="op-noscroll -mx-5 mt-14 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          <div className="grid min-w-[760px] grid-cols-5" role="tablist" aria-label="API features">
            {SNIPPETS.map((tab, i) => (
              <button
                key={tab.t}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className="relative pb-5 pr-4 pt-4 text-left"
              >
                <span
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: DARK.line2,
                  }}
                />
                {i === active && (
                  <motion.span
                    layoutId="op-codeline"
                    className="absolute left-0 top-0 h-[2px] w-full"
                    style={{
                      background: DARK.teal,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 36,
                    }}
                  />
                )}
                <span
                  className="flex items-center gap-2 text-[14px] font-[500]"
                  style={{
                    color: i === active ? DARK.ink : DARK.text,
                  }}
                >
                  {tab.t}
                  {tab.tag && (
                    <span
                      className="rounded px-1.5 py-px text-[10.5px]"
                      style={{
                        background: "rgba(63,224,197,.12)",
                        color: DARK.teal,
                      }}
                    >
                      {tab.tag}
                    </span>
                  )}
                </span>
                <span
                  className="mt-1 block text-[13px] leading-[1.45]"
                  style={{
                    color: DARK.soft,
                  }}
                >
                  {tab.d}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div
        className="mt-2 border-y py-10"
        style={{
          borderColor: DARK.line,
          background: "linear-gradient(180deg, rgba(255,255,255,.015), transparent)",
        }}
      >
        <div ref={ref} className={`${CONTAINER} grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]`}>
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: "#0E0E11",
              boxShadow: `0 0 0 1px ${DARK.line2}, 0 30px 60px -30px rgba(0,0,0,.9)`,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-3 py-2"
              style={{
                borderColor: DARK.line,
              }}
            >
              <div
                className="flex items-center gap-1 text-[12px]"
                style={{
                  fontFamily: FONT_MONO,
                }}
              >
                <span
                  className="rounded-md px-2 py-1"
                  style={{
                    background: DARK.raise,
                    color: DARK.ink,
                  }}
                >
                  {snippet.file}
                </span>
                <span
                  className="px-2 py-1"
                  style={{
                    color: DARK.soft,
                  }}
                >
                  .env
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy code"
                  className="grid size-7 place-items-center rounded-md transition-colors hover:bg-white/[.06]"
                  style={{
                    color: copied ? DARK.teal : DARK.text,
                  }}
                >
                  <Icon name={copied ? "ph:check" : "ph:copy"} size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setRuns((prev) => prev + 1)}
                  className="inline-flex h-7 items-center gap-1 rounded-md px-2.5 text-[12px] font-[500] transition-[filter] hover:brightness-110"
                  style={{
                    background: DARK.ink,
                    color: DARK.bg,
                  }}
                >
                  <Icon name="ph:play-fill" size={11} />
                  Run
                </button>
              </div>
            </div>
            <AnimatePresence mode="wait">
              <motion.pre
                key={active}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="op-noscroll min-h-[330px] overflow-x-auto py-3 text-[12.5px] leading-[1.75]"
                style={{
                  fontFamily: FONT_MONO,
                }}
              >
                {snippet.code
                  .split(
                    `
`,
                  )
                  .map((line, i) => (
                    <div
                      key={i}
                      className="flex pr-4"
                      style={
                        snippet.mark.includes(i + 1)
                          ? {
                              background: "rgba(63,224,197,.06)",
                              boxShadow: `inset 2px 0 0 ${DARK.teal}`,
                            }
                          : undefined
                      }
                    >
                      <span
                        className="w-10 shrink-0 select-none pr-3 text-right"
                        style={{
                          color: "#4A4A52",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="whitespace-pre">{highlight(line)}</span>
                    </div>
                  ))}
              </motion.pre>
            </AnimatePresence>
            <div
              className="flex items-center justify-between border-t px-3 py-1.5 text-[11px]"
              style={{
                borderColor: DARK.line,
                color: DARK.soft,
                fontFamily: FONT_MONO,
              }}
            >
              <span>
                {snippet.lang}
                {" · UTF-8"}
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: DARK.teal,
                  }}
                />
                api.outpost.run
              </span>
            </div>
          </div>
          <div
            className="flex flex-col overflow-hidden rounded-2xl"
            style={{
              background: DARK.card,
              boxShadow: `0 0 0 1px ${DARK.line2}`,
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-2.5 text-[13px]"
              style={{
                borderColor: DARK.line,
              }}
            >
              <span
                className="font-[500]"
                style={{
                  color: DARK.ink,
                }}
              >
                {["Response", "Tool call", "Batch job", "Fine-tune", "Trace"][active]}
              </span>
              <span
                className="flex items-center gap-1.5 text-[12px]"
                style={{
                  color: DARK.text,
                }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: DARK.teal,
                  }}
                />
                {["Streaming", "Valid", "Queued", "Running", "Recorded"][active]}
              </span>
            </div>
            <div className="min-h-[270px] flex-1">
              <SnippetOutput i={active} run={runs} live={live} />
            </div>
            <div
              className="grid grid-cols-3 border-t"
              style={{
                borderColor: DARK.line,
              }}
            >
              {snippet.stats.map(([label, value]) => (
                <div key={label} className="px-4 py-3">
                  <p
                    className="text-[11.5px]"
                    style={{
                      color: DARK.soft,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-0.5 text-[15px] font-[500]"
                    style={{
                      color: DARK.ink,
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
