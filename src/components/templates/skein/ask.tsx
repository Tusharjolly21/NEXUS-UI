"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useCanvas } from "./canvas";
import { Icon, type IconName } from "./icons";
import { Badge, Reveal, Section, StatusDot, type Tone } from "./ui";

type AskScenario = {
  chip: string;
  icon: IconName;
  q: string;
  scans: readonly string[];
  head: string;
  rows: readonly { svc: string; note: string; tone: Tone; tag: string }[];
  actions: readonly (readonly [IconName, string])[];
};

const ASK_SCENARIOS: readonly AskScenario[] = [
  {
    chip: "Explain",
    icon: "sparkles",
    q: "Why did checkout get slow at 14:02?",
    scans: ["Scanning traces in checkout-api", "Correlating 2.4M spans", "Comparing with last Tuesday"],
    head: "3 likely causes",
    rows: [
      {
        svc: "payments-api",
        note: "Slow query",
        tone: "crit",
        tag: "p99 +1.8s",
      },
      { svc: "inventory-svc", note: "Lock wait", tone: "warn", tag: "+420 ms" },
      { svc: "cdn-edge", note: "Cache misses", tone: "warn", tag: "miss 41%" },
    ],
    actions: [
      ["doc_text", "Open trace"],
      ["square_arrow_up", "Share to #incidents"],
    ],
  },
  {
    chip: "Compare",
    icon: "arrow_swap",
    q: "What changed after deploy 4f2c?",
    scans: ["Reading deploy 4f2c", "Diffing error rates by route", "Checking the canary"],
    head: "2 services changed",
    rows: [
      { svc: "auth-svc", note: "More 5xx", tone: "crit", tag: "4.1% vs 0.2%" },
      { svc: "search-api", note: "Fewer timeouts", tone: "live", tag: "−63%" },
    ],
    actions: [
      ["doc_text", "Open diff"],
      ["arrow_clockwise", "Roll back 4f2c"],
    ],
  },
  {
    chip: "Watch",
    icon: "eye",
    q: "Page me if payments p99 goes over 800 ms",
    scans: ["Learning the baseline for payments-api", "Ignoring the Monday peak"],
    head: "Watch created",
    rows: [
      {
        svc: "payments-api",
        note: "p99 over 800 ms for 5 min",
        tone: "info",
        tag: "@oncall",
      },
      {
        svc: "baseline",
        note: "Normal is 310 to 520 ms",
        tone: "mute",
        tag: "7 days",
      },
    ],
    actions: [
      ["bell_fill", "Send a test page"],
      ["doc_text", "Edit watch"],
    ],
  },
  {
    chip: "Report",
    icon: "doc_text",
    q: "Summarise last week's incidents",
    scans: ["Collecting incidents from Mon to Sun", "Grouping by cause"],
    head: "4 incidents, 1h 52m in total",
    rows: [
      {
        svc: "payments-api",
        note: "Slow queries, twice",
        tone: "crit",
        tag: "58 min",
      },
      { svc: "auth-svc", note: "Bad deploy", tone: "warn", tag: "31 min" },
      { svc: "cdn-edge", note: "Purge storm", tone: "warn", tag: "23 min" },
    ],
    actions: [
      ["doc_on_doc", "Copy summary"],
      ["square_arrow_up", "Post to #eng"],
    ],
  },
];

type AskPhase = "idle" | "typing" | "thinking" | "result";

/** A field of dotted points drawn as a rolling wave, fading towards the horizon. */
function WaveField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCanvas(canvasRef, (frame) => {
    const { ctx, w, h, t } = frame;
    const columns = 150;
    const rows = 46;
    const scale = w * 0.55;
    const centerX = w / 2;
    const horizonY = h * 0.36;
    const ink = frame.ink;
    for (let row = 0; row < rows; row++) {
      const depth = row / (rows - 1);
      const perspective = 1.05 + depth * 3.4;
      const falloff = Math.pow(1 - depth, 1.3);
      for (let column = 0; column < columns; column++) {
        const across = (column / (columns - 1)) * 2 - 1;
        const worldX = across * 3.2;
        const wave =
          0.16 * Math.sin(across * 3.1 + t * 0.45 + depth * 3.6) +
          0.09 * Math.sin(depth * 7.3 - t * 0.6 + across * 1.7) +
          0.04 * Math.sin(across * 11 + depth * 9 + t * 0.9);
        const worldY = -0.62 + wave;
        const x = centerX + (worldX / perspective) * scale;
        const y = horizonY - (worldY / perspective) * scale;
        if (x < -4 || x > w + 4 || y > h + 4) continue;
        const edgeFade = Math.min(1, (1 - Math.abs(across)) * 3);
        const alpha = (0.16 + Math.max(0, wave) * 3 * 0.85) * falloff * edgeFade * (frame.dark ? 1 : 1.3);
        if (alpha < 0.015) continue;
        ctx.fillStyle = `rgba(${ink},${alpha})`;
        const size = 0.7 + (1 - depth) * 1.1;
        ctx.fillRect(x, y, size, size);
      }
    }
  });
  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none block h-full w-full ${className}`} />;
}

/**
 * The "Your team loses hours..." section: a question box that types a sample question, "thinks" through a few
 * scan lines and shows a staged answer, cycling through four scenarios. Clicking the box (or a chip) hands
 * control to the visitor.
 */
export function AskSection() {
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { margin: "-20% 0px" });
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [phase, setPhase] = useState<AskPhase>("idle");
  const [typed, setTyped] = useState("");
  const [scanIndex, setScanIndex] = useState(0);
  const [customQuestion, setCustomQuestion] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  // Bumped to restart the sequence (and to re-key the result) when the scenario or question changes.
  const [cycle, setCycle] = useState(0);
  // True while the visitor owns the box: the demo stops playing and the input is shown.
  const [composing, setComposing] = useState(false);
  const timers = useRef<number[]>([]);

  const scenario = ASK_SCENARIOS[scenarioIndex];
  const question = customQuestion ?? scenario.q;

  const clearTimers = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  };
  const schedule = (delay: number, callback: () => void) => timers.current.push(window.setTimeout(callback, delay));

  // The sequence has to reset the visible state as soon as it restarts, hence the synchronous setState calls.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!inView || composing) return;
    clearTimers();
    const text = question;
    if (reduced) {
      setTyped(text);
      setPhase("result");
      return;
    }
    setPhase("idle");
    setTyped("");
    setScanIndex(0);
    let at = customQuestion ? 0 : 900;
    if (customQuestion) setTyped(text);
    else {
      schedule(at, () => setPhase("typing"));
      for (let count = 1; count <= text.length; count++) schedule(at + count * 32, () => setTyped(text.slice(0, count)));
      at += text.length * 32 + 450;
    }
    schedule(at, () => setPhase("thinking"));
    scenario.scans.forEach((_, index) => schedule(at + index * 1050, () => setScanIndex(index)));
    at += scenario.scans.length * 1050 + 200;
    schedule(at, () => setPhase("result"));
    // After the answer has been read for a while, move on to the next scenario.
    schedule(at + 6200, () => {
      setCustomQuestion(null);
      setScenarioIndex((index) => (index + 1) % ASK_SCENARIOS.length);
      setCycle((count) => count + 1);
    });
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, scenarioIndex, cycle, reduced, composing]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const pickScenario = (index: number) => {
    setComposing(false);
    setCustomQuestion(null);
    setScenarioIndex(index);
    setCycle((count) => count + 1);
  };
  const submitQuestion = (event: FormEvent) => {
    event.preventDefault();
    if (draft.trim()) {
      setComposing(false);
      setCustomQuestion(draft.trim());
      setDraft("");
      setScenarioIndex(0);
      setCycle((count) => count + 1);
    }
  };
  const showInput = composing || (phase === "idle" && !typed);
  const startComposing = () => {
    clearTimers();
    setComposing(true);
    setPhase("idle");
    setTyped("");
  };

  return (
    <Section id="ask">
      <Reveal
        as="h2"
        className="m-0 max-w-[24ch] pt-20 skein-display text-[clamp(26px,3.1vw,38px)] font-semibold leading-[1.12] tracking-[-0.02em] sm:pt-24"
      >
        <span className="text-[rgb(var(--skein-faint))]">
          Your team loses hours hopping between dashboards to find one slow request.
        </span>{" "}
        Skein turns that into one question.
      </Reveal>
      <div ref={stageRef} className="relative -mx-5 mt-2 h-[620px] overflow-hidden sm:-mx-8">
        <div className="absolute inset-x-0 bottom-0 top-[4%]">
          <WaveField />
        </div>
        <div className="relative mx-auto mt-[150px] w-full max-w-[440px] px-5">
          <AnimatePresence mode="popLayout" initial={false}>
            {showInput ? (
              <motion.form
                key="input"
                onSubmit={submitQuestion}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-panel)/.9)] p-3 backdrop-blur-md transition-[border-color,box-shadow] duration-200 focus-within:border-[rgb(var(--skein-line)/.32)] focus-within:shadow-[0_0_0_4px_rgb(var(--skein-ink)/.1)]"
              >
                <label htmlFor="ask-input" className="sr-only">
                  Ask about any request
                </label>
                <input
                  id="ask-input"
                  autoFocus={composing}
                  onFocus={() => {
                    if (!composing) {
                      clearTimers();
                      setComposing(true);
                    }
                  }}
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Ask about any request…"
                  autoComplete="off"
                  className="w-full rounded-[8px] border-0 bg-transparent px-1 text-[15px] text-[rgb(var(--skein-ink))] outline-hidden placeholder:text-[rgb(var(--skein-faint))] focus-visible:outline-hidden"
                />
                <div className="mt-6 flex items-center justify-between">
                  <span
                    className="grid h-7 w-7 place-items-center rounded-full text-[rgb(var(--skein-faint))]"
                    aria-hidden="true"
                  >
                    <Icon name="plus" size={12} />
                  </span>
                  <button
                    type="submit"
                    aria-label="Ask"
                    className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${draft ? "bg-[rgb(var(--skein-btn))] text-[rgb(var(--skein-btn-ink))]" : "text-[rgb(var(--skein-faint))]"}`}
                  >
                    <Icon name={draft ? "chevron_right" : "mic"} size={draft ? 10 : 13} />
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                key="q"
                type="button"
                onClick={startComposing}
                aria-label={`${typed}. Ask your own question instead.`}
                layout={true}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 34,
                }}
                className="flex w-full cursor-text items-start justify-between gap-3 rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.12)] bg-[rgb(var(--skein-panel)/.9)] p-3.5 text-left backdrop-blur-md transition-colors hover:border-[rgb(var(--skein-line)/.2)]"
              >
                <span className="min-h-[22px] text-[15px] text-[rgb(var(--skein-ink))]">
                  {typed}
                  {phase === "typing" && (
                    <span className="ml-px inline-block h-[17px] w-px translate-y-[3px] animate-pulse bg-[rgb(var(--skein-ink))]" />
                  )}
                </span>
                {phase !== "typing" && (
                  <span className="shrink-0 rounded-[6px] border border-solid border-[rgb(var(--skein-line)/.12)] px-1.5 py-[3px] text-[11px] text-[rgb(var(--skein-mute))]">
                    {phase === "result"
                      ? scenario.rows.length === 1
                        ? "1 result"
                        : `${scenario.rows.length} results`
                      : "Thinking"}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            {phase === "thinking" && (
              <motion.div
                key="think"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.8)] px-3.5 py-3 backdrop-blur-md"
              >
                <AnimatePresence mode="wait">
                  <motion.p
                    key={scanIndex}
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{ duration: 0.2 }}
                    className="skein-shimmer m-0 font-mono text-[12px]"
                  >
                    {scenario.scans[scanIndex]}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}
            {phase === "result" && (
              <motion.div
                key={`r-${scenarioIndex}-${cycle}`}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="mt-2 rounded-[14px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.9)] p-1.5 backdrop-blur-md"
                  role="status"
                >
                  <p className="m-0 px-2 pb-1 pt-1.5 font-mono text-[11px] text-[rgb(var(--skein-faint))]">{scenario.head}</p>
                  <ul className="m-0 list-none p-0">
                    {scenario.rows.map((row, index) => (
                      <motion.li
                        key={row.svc + index}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + index * 0.09 }}
                        className="flex items-center gap-2.5 border-t border-solid border-[rgb(var(--skein-line)/.07)] px-2 py-2.5 first:border-0"
                      >
                        <span className="grid h-6 w-6 shrink-0 place-items-center rounded-[6px] bg-[rgb(var(--skein-raised))] text-[rgb(var(--skein-mute))]">
                          <Icon name="cube" size={11} />
                        </span>
                        <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-[rgb(var(--skein-ink))]">
                          {row.svc}
                        </span>
                        <span className="hidden sm:inline">
                          <StatusDot tone={row.tone}>{row.note}</StatusDot>
                        </span>
                        <Badge tone={row.tone}>{row.tag}</Badge>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                {customQuestion && (
                  <p className="m-0 mt-2 text-center text-[11px] text-[rgb(var(--skein-faint))]">
                    A sample answer. Connect your services for real ones.
                  </p>
                )}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                  className="mt-2.5 flex justify-center gap-2"
                >
                  {scenario.actions.map(([iconName, label]) => (
                    <button
                      key={label}
                      type="button"
                      className="flex h-7 items-center gap-1.5 rounded-[7px] border border-solid border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.8)] px-2.5 text-[12px] text-[rgb(var(--skein-mute))] backdrop-blur-md transition-colors hover:text-[rgb(var(--skein-ink))]"
                    >
                      <Icon name={iconName} size={11} />
                      {label}
                    </button>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {(showInput || (phase !== "result" && phase !== "thinking")) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="group"
                aria-label="Example questions"
                className="mt-2.5 flex flex-wrap justify-center gap-1.5"
              >
                {ASK_SCENARIOS.map((item, index) => (
                  <button
                    key={item.chip}
                    type="button"
                    onClick={() => pickScenario(index)}
                    aria-pressed={index === scenarioIndex && !customQuestion}
                    className={`flex h-7 items-center gap-1.5 rounded-[7px] border border-solid px-2.5 text-[12px] backdrop-blur-md transition-colors ${index === scenarioIndex && !customQuestion ? "border-[rgb(var(--skein-line)/.2)] bg-[rgb(var(--skein-raised))] text-[rgb(var(--skein-ink))]" : "border-[rgb(var(--skein-line)/.1)] bg-[rgb(var(--skein-panel)/.7)] text-[rgb(var(--skein-mute))] hover:text-[rgb(var(--skein-ink))]"}`}
                  >
                    <Icon name={item.icon} size={11} />
                    {item.chip}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Section>
  );
}
