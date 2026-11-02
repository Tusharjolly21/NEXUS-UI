"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, FileCode2, Loader2, Lock, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A replay of what happens when you ask an AI coding tool for a Nexus UI item over MCP. It plays one
 * short run (ask, search, fetch source, files written) and then moves to the next of three cases:
 * a free item, a Pro item without a key, a Pro item with a key. Pick a case yourself and the autoplay
 * stops. Item names, access levels and file paths are the real catalog entries; the assistant's
 * wording is an example and will differ in your tool. With reduced motion the finished run is shown.
 */

type Result = { name: string; kind: string; pro: boolean };
type Scenario = {
  id: string;
  label: string;
  prompt: string;
  query: string;
  results: Result[];
  pick: number;
  slug: string;
  /** Files returned, or null when the server answers with the Pro message instead. */
  files: string[] | null;
  lockedName?: string;
  needs: string;
  reply: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "free",
    label: "Free item",
    prompt: "Add a pricing section to my landing page.",
    query: "pricing section",
    results: [
      { name: "Pricing Section", kind: "Block", pro: false },
      { name: "Origami Pricing", kind: "Component", pro: true },
      { name: "Ferry", kind: "Template", pro: true },
    ],
    pick: 0,
    slug: "pricing-section",
    files: [
      "components/blocks/pricing-section/index.ts",
      "components/blocks/pricing-section/radio-plan-pricing.tsx",
      "components/blocks/pricing-section/billing-pricing-variants.tsx",
    ],
    needs: "framer-motion, lucide-react",
    reply: "Added the Pricing Section block. Three files are in components/blocks/pricing-section, and it needs framer-motion and lucide-react.",
  },
  {
    id: "pro-locked",
    label: "Pro item, no key",
    prompt: "Add a hold to confirm button.",
    query: "hold to confirm",
    results: [
      { name: "Hold to Confirm", kind: "Component", pro: true },
      { name: "Slide to Confirm", kind: "Component", pro: true },
      { name: "Molten Hold", kind: "Component", pro: true },
    ],
    pick: 0,
    slug: "hold-to-confirm",
    files: null,
    lockedName: "Hold to Confirm",
    needs: "",
    reply: "Hold to Confirm is a Pro component and this server has no API key yet. Create a key in your dashboard, add it to the server settings and ask again.",
  },
  {
    id: "pro-key",
    label: "Pro item, with key",
    prompt: "Add a hold to confirm button.",
    query: "hold to confirm",
    results: [
      { name: "Hold to Confirm", kind: "Component", pro: true },
      { name: "Slide to Confirm", kind: "Component", pro: true },
      { name: "Molten Hold", kind: "Component", pro: true },
    ],
    pick: 0,
    slug: "hold-to-confirm",
    files: ["components/hold-to-confirm/index.ts", "components/hold-to-confirm/hold-to-confirm.tsx"],
    needs: "framer-motion",
    reply: "Added Hold to Confirm. Two files are in components/hold-to-confirm, and it needs framer-motion plus the nexus-font and ui-sounds items.",
  },
];

const TYPE_MS = 26;
const GREEN = "#34c759";
const AMBER = "#ff9f0a";

const noopSubscribe = () => () => {};

/**
 * Reduced-motion preference that is safe to render with: false on the server and during hydration,
 * the real value afterwards. Reading it directly would give the server and the browser different
 * first renders for people who have reduced motion on.
 */
function useReduceMotion() {
  const pref = useReducedMotion();
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return mounted && !!pref;
}

function Status({ state }: { state: "run" | "ok" | "locked" }) {
  if (state === "run") return <Loader2 className="size-4 animate-spin text-white/60 motion-reduce:animate-none" aria-hidden />;
  if (state === "locked") return <Lock className="size-4" style={{ color: AMBER }} aria-hidden />;
  return <Check className="size-4" style={{ color: GREEN }} strokeWidth={2.5} aria-hidden />;
}

function ToolLine({ name, args, state }: { name: string; args: string; state: "run" | "ok" | "locked" }) {
  return (
    <div className="flex items-center gap-2.5 rounded-full bg-white/[0.07] py-2 pr-4 pl-3.5 font-mono text-[12.5px] text-white/85">
      <Status state={state} />
      <span className="min-w-0 truncate">
        <span className="text-white">{name}</span>
        <span className="text-white/60"> {args}</span>
      </span>
    </div>
  );
}

function Reveal({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReduceMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
    >
      {children}
    </motion.div>
  );
}

export function McpDemo() {
  const reduce = useReduceMotion();
  const uid = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const touched = useRef(false);
  const autoCount = useRef(0);

  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [run, setRun] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState(0);

  const s = SCENARIOS.find((x) => x.id === scenarioId)!;
  const final = !!reduce;

  // Start a run over from the top. Called from handlers and timers, never from an effect body.
  const restart = (id: string) => {
    setScenarioId(id);
    setTyped(0);
    setPhase(0);
    setRun((r) => r + 1);
  };

  useEffect(() => {
    if (!inView || reduce) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    for (let i = 1; i <= s.prompt.length; i++) at(450 + i * TYPE_MS, () => setTyped(i));
    let t = 450 + s.prompt.length * TYPE_MS + 400;
    at(t, () => setPhase(1));
    t += 850;
    at(t, () => setPhase(2));
    t += 1700;
    at(t, () => setPhase(3));
    t += 850;
    at(t, () => setPhase(4));
    t += 1800;
    at(t, () => setPhase(5));
    t += 4200;
    at(t, () => {
      if (touched.current || autoCount.current >= SCENARIOS.length - 1) return;
      autoCount.current += 1;
      const i = SCENARIOS.findIndex((x) => x.id === scenarioId);
      restart(SCENARIOS[(i + 1) % SCENARIOS.length].id);
    });
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [inView, reduce, scenarioId, run, s.prompt]);

  const pick = (id: string) => {
    touched.current = true;
    restart(id);
  };
  const replay = () => {
    touched.current = true;
    restart(scenarioId);
  };

  const showFinal = final || phase >= 5;
  const locked = s.files === null;

  return (
    <div ref={ref} data-doc-widget className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" aria-label="Example run" className="flex flex-wrap gap-1 rounded-[22px] bg-muted p-1 sm:rounded-full">
          {SCENARIOS.map((x) => {
            const on = x.id === scenarioId;
            return (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => pick(x.id)}
                className={cn(
                  "relative h-9 rounded-full px-3.5 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  on ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {on ? (
                  <motion.span
                    layoutId={`${uid}-tab`}
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-card shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 34 }}
                  />
                ) : null}
                <span className="relative">{x.label}</span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-muted px-3.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Replay
        </button>
      </div>

      <div
        role="group"
        aria-label="Example of an AI coding tool using the Nexus UI MCP server"
        className="min-h-[430px] overflow-hidden rounded-[24px] bg-[#1d1d1f] p-5 ring-1 ring-white/10 text-[14.5px] leading-relaxed text-white/85 sm:p-6"
      >
        <p className="sr-only">
          {`You ask: ${s.prompt} The tool calls search_nexus for "${s.query}", then get_component_source for ${s.slug}. ${s.reply}`}
        </p>

        <div aria-hidden className="space-y-3.5">
          <div className="flex justify-end">
            <div className="max-w-[88%] rounded-[20px] rounded-br-md bg-[#0071e3] px-4 py-2.5 text-white">
              {final ? s.prompt : s.prompt.slice(0, typed)}
              {!reduce && typed < s.prompt.length ? (
                <span className="ml-px inline-block h-[1.05em] w-[2px] translate-y-[3px] animate-pulse bg-white/80" />
              ) : null}
            </div>
          </div>

          {phase >= 1 || final ? (
            <Reveal className="space-y-2.5">
              <ToolLine name="search_nexus" args={`{ "query": "${s.query}" }`} state={phase >= 2 || final ? "ok" : "run"} />
              {phase >= 2 || final ? (
                <ul className="grid gap-1.5 pl-1 sm:grid-cols-3">
                  {s.results.map((r, i) => (
                    <motion.li
                      key={r.name}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: reduce ? 0 : i * 0.09, type: "spring", stiffness: 400, damping: 30 }}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-[14px] px-3 py-2 text-[13px]",
                        i === s.pick ? "bg-white/[0.14] ring-1 ring-white/25" : "bg-white/[0.05] text-white/70",
                      )}
                    >
                      <span className="min-w-0">
                        <span className={cn("block truncate font-medium", i === s.pick ? "text-white" : "text-white/80")}>{r.name}</span>
                        <span className="block text-[12px] text-white/60">{r.kind}</span>
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-[11.5px] font-medium"
                        style={r.pro ? { background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)" } : { background: "rgba(52,199,89,0.18)", color: "#7ee59a" }}
                      >
                        {r.pro ? "Pro" : "Free"}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              ) : null}
            </Reveal>
          ) : null}

          {phase >= 3 || final ? (
            <Reveal className="space-y-2.5">
              <ToolLine
                name="get_component_source"
                args={`{ "slug": "${s.slug}" }`}
                state={phase >= 4 || final ? (locked ? "locked" : "ok") : "run"}
              />
              {phase >= 4 || final ? (
                locked ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="ml-1 rounded-[16px] px-4 py-3 text-[13.5px]"
                    style={{ background: "rgba(255,159,10,0.12)", boxShadow: "inset 0 0 0 1px rgba(255,159,10,0.35)" }}
                  >
                    <span className="font-medium text-white">{s.lockedName} is part of Nexus UI Pro.</span>{" "}
                    <span className="text-white/75">Create an API key at nexus-ui.com/dashboard/api-key and add it to this server&apos;s configuration.</span>
                  </motion.div>
                ) : (
                  <ul className="ml-1 space-y-1.5">
                    {s.files!.map((f, i) => (
                      <motion.li
                        key={f}
                        initial={reduce ? false : { opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: reduce ? 0 : i * 0.16, type: "spring", stiffness: 400, damping: 30 }}
                        className="flex items-start gap-2.5 rounded-[12px] bg-white/[0.05] px-3 py-2 font-mono text-[12.5px] text-white/85"
                      >
                        <FileCode2 className="mt-px size-4 shrink-0 text-white/60" aria-hidden />
                        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">
                          {f.split("/").map((part, k, all) => (
                            <span key={k}>
                              {part}
                              {k < all.length - 1 ? "/" : ""}
                              <wbr />
                            </span>
                          ))}
                        </span>
                        <motion.span
                          initial={reduce ? false : { scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: reduce ? 0 : i * 0.16 + 0.25, type: "spring", stiffness: 600, damping: 16 }}
                          style={{ color: GREEN }}
                        >
                          <Check className="mt-px size-4" strokeWidth={2.5} aria-hidden />
                        </motion.span>
                      </motion.li>
                    ))}
                    <li className="flex items-center gap-2 pl-1 pt-0.5 text-[12.5px] text-white/60">
                      <Search className="size-3.5" aria-hidden />
                      npm packages: {s.needs}
                    </li>
                  </ul>
                )
              ) : null}
            </Reveal>
          ) : null}

          {showFinal ? (
            <Reveal className="pt-1 text-white/90">{s.reply}</Reveal>
          ) : null}
        </div>
      </div>

      <p className="text-[13px] leading-snug text-muted-foreground">
        Example run. The items, their Free or Pro level and the file paths are from the catalog; your tool will word its replies differently.
      </p>
    </div>
  );
}
