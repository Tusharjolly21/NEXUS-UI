"use client";

import * as React from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, FileCode2, Search, Sparkles } from "lucide-react";
import { BrandMark } from "./brand-marks";

/**
 * A replay of a real session: someone asks their coding agent for a loader, the agent calls the Nexus UI
 * MCP server twice and writes the files. The names, slug, files and packages are the real ones from the
 * library. It plays once it scrolls into view and loops; with reduced motion it shows the finished session.
 */

const PROMPT = "Add a Nexus UI loader to the dashboard while the data loads";

const STEPS = 6; // 0 typing, 1 search call, 2 results, 3 get call, 4 files, 5 done
const DELAYS = [0, 500, 900, 900, 900, 1100];

const RESULTS = [
  { name: "Orbital Loader", tier: "Free" },
  { name: "Matrix Loaders", tier: "Pro" },
  { name: "Skeleton Morph", tier: "Pro" },
];

const FILES = [
  { path: "components/orbital-loader/orbital-loader.tsx", tag: "added" },
  { path: "components/orbital-loader/step-loader.tsx", tag: "added" },
  { path: "app/dashboard/loading.tsx", tag: "edited" },
];

const rise = {
  initial: { opacity: 0, y: 8, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { type: "spring" as const, stiffness: 380, damping: 30 },
};

function ToolCall({ tool, args }: { tool: string; args: string }) {
  return (
    <motion.div {...rise} className="flex items-center gap-2.5 rounded-xl bg-white/[0.06] px-3 py-2 ring-1 ring-white/10">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white text-[#1d1d1f]">
        <BrandMark name="mcp" className="size-3.5" />
      </span>
      <span className="min-w-0 truncate font-mono text-[12.5px]">
        <span className="text-white/50">nexus-ui · </span>
        <span className="text-[#ffd479]">{tool}</span>
        <span className="text-white/60">({args})</span>
      </span>
    </motion.div>
  );
}

export function AgentDemo() {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-80px" });
  const [step, setStep] = React.useState(reduced ? STEPS - 1 : 0);
  const [typed, setTyped] = React.useState(reduced ? PROMPT.length : 0);
  const [run, setRun] = React.useState(0);

  // Type the prompt, then walk through the steps, then start over.
  React.useEffect(() => {
    if (reduced || !inView) return;
    let i = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const typer = setInterval(() => {
      i += 1;
      if (i === 1) setStep(0);
      setTyped(i);
      if (i >= PROMPT.length) {
        clearInterval(typer);
        let at = 0;
        for (let s = 1; s < STEPS; s++) {
          at += DELAYS[s];
          timers.push(setTimeout(() => setStep(s), at));
        }
        timers.push(
          setTimeout(() => {
            setStep(0);
            setTyped(0);
            setRun((r) => r + 1);
          }, at + 7000),
        );
      }
    }, 28);
    return () => {
      clearInterval(typer);
      timers.forEach(clearTimeout);
    };
  }, [reduced, inView, run]);

  return (
    <div
      ref={ref}
      className="relative min-w-0 overflow-hidden rounded-[28px] bg-[#16161a] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_40px_80px_-40px_rgba(30,20,80,0.55)]"
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#7c5cff]/30 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 size-72 rounded-full bg-[#ff7a59]/20 blur-3xl" />

      {/* window bar */}
      <div className="relative flex items-center gap-2 border-b border-white/[0.07] px-4 py-3">
        <span className="size-3 rounded-full bg-[#ff5f57]" />
        <span className="size-3 rounded-full bg-[#febc2e]" />
        <span className="size-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 flex min-w-0 items-center gap-1.5 truncate whitespace-nowrap text-[12.5px] text-white/55">
          <BrandMark name="claude" className="size-3.5" />
          Claude Code · my-app
        </span>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-[#28c840]/15 px-2 py-0.5 text-[11px] font-medium text-[#5ee08a]">
          <span className="size-1.5 rounded-full bg-[#5ee08a]" />
          <span className="hidden sm:inline">nexus-ui </span>connected
        </span>
      </div>

      <div
        className="relative flex min-h-[420px] flex-col gap-3 p-4 sm:p-5"
        aria-label={`Example session: "${PROMPT}". The agent searches Nexus UI for a loader, picks Orbital Loader, gets its files and adds it to app/dashboard/loading.tsx.`}
        role="img"
      >
        {/* the request */}
        <div className="self-end rounded-2xl rounded-br-md bg-[#2f6bff] px-3.5 py-2.5 text-[14px] leading-snug sm:max-w-[85%]">
          {PROMPT.slice(0, typed)}
          {typed < PROMPT.length ? <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-pulse bg-white" /> : null}
        </div>

        <AnimatePresence initial={false}>
          {step >= 1 ? <ToolCall key="s" tool="search_components" args={`"loader"`} /> : null}
          {step >= 2 ? (
            <motion.div key="r" {...rise} className="ml-8 flex flex-wrap gap-1.5">
              {RESULTS.map((r, i) => (
                <span
                  key={r.name}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] ${
                    i === 0 ? "bg-white text-[#1d1d1f]" : "bg-white/[0.07] text-white/70"
                  }`}
                >
                  <Search className="size-3" aria-hidden />
                  {r.name}
                  <span className={r.tier === "Pro" ? "text-[#c9a6ff]" : i === 0 ? "text-[#1f9d55]" : "text-[#5ee08a]"}>{r.tier}</span>
                </span>
              ))}
            </motion.div>
          ) : null}
          {step >= 3 ? <ToolCall key="g" tool="get_component" args={`"orbital-loader"`} /> : null}
          {step >= 4 ? (
            <motion.ul key="f" {...rise} className="ml-8 space-y-1.5">
              {FILES.map((f, i) => (
                <motion.li
                  key={f.path}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: reduced ? 0 : i * 0.18 }}
                  className="flex items-center gap-2 font-mono text-[12px] text-white/80"
                >
                  <span className="grid size-4 shrink-0 place-items-center rounded-full bg-[#28c840]">
                    <Check className="size-2.5 text-[#0d3d1c]" strokeWidth={3.5} aria-hidden />
                  </span>
                  <FileCode2 className="size-3.5 shrink-0 text-white/40" aria-hidden />
                  <span className="min-w-0 truncate">{f.path}</span>
                  <span className={`ml-auto shrink-0 rounded px-1.5 text-[10.5px] ${f.tag === "added" ? "bg-[#28c840]/15 text-[#5ee08a]" : "bg-[#ffd479]/15 text-[#ffd479]"}`}>
                    {f.tag}
                  </span>
                </motion.li>
              ))}
              <li className="pl-6 font-mono text-[12px] text-white/45">npm install framer-motion</li>
            </motion.ul>
          ) : null}
          {step >= 5 ? (
            <motion.div key="d" {...rise} className="mt-1 flex gap-2.5 text-[14px] leading-relaxed text-white/90">
              <Sparkles className="mt-1 size-4 shrink-0 text-[#d97757]" aria-hidden />
              <p>
                Done. Orbital Loader now shows on the dashboard while the data loads. It&apos;s a free component, so no key was needed.
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
