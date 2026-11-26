"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { highlight } from "sugar-high";
import { GooeyInput } from "@/components/gooey-input";
import { LikeBurst } from "@/components/like-burst";
import { SlideToConfirm } from "@/components/slide-to-confirm";
import { cn } from "@/lib/utils";

/**
 * Each scene is a real snippet and the element it describes: what types out in the editor is exactly
 * what renders underneath, same props and all.
 */
const SCENES = [
  {
    file: "search.tsx",
    code: `import { GooeyInput } from "@/components/gooey-input";

export function Search() {
  return (
    <GooeyInput
      placeholder="Search…"
      expandedWidth={220}
    />
  );
}`,
    render: () => <GooeyInput placeholder="Search…" expandedWidth={220} />,
  },
  {
    file: "deploy.tsx",
    code: `import { SlideToConfirm } from "@/components/slide-to-confirm";

export function Deploy() {
  return (
    <SlideToConfirm
      label="Slide to deploy"
      successLabel="Deployed"
      autoplay
    />
  );
}`,
    render: () => <SlideToConfirm label="Slide to deploy" successLabel="Deployed" autoplay />,
  },
  {
    file: "like.tsx",
    code: `import { LikeBurst } from "@/components/like-burst";

export function Like() {
  return (
    <LikeBurst
      defaultCount={1299}
      color="#ff3b5c"
    />
  );
}`,
    render: () => <LikeBurst defaultCount={1299} color="#ff3b5c" />,
  },
] as const;

const TYPE_MS = 16;
const HOLD_MS = 5200;

/** Dark+ colours for sugar-high, as on the rest of the site. */
const SH_VARS = {
  "--sh-keyword": "#c792ea",
  "--sh-string": "#c3e88d",
  "--sh-comment": "#6b7280",
  "--sh-identifier": "#e6e6eb",
  "--sh-sign": "#9aa0aa",
  "--sh-class": "#82aaff",
  "--sh-property": "#ffcb6b",
  "--sh-entity": "#f78c6c",
  "--sh-jsxliterals": "#e6e6eb",
} as React.CSSProperties;

type Phase = "typing" | "beam" | "live" | "erasing";

/**
 * The hero's right side: an editor types a short snippet, a line of light carries it down, and the
 * real component appears underneath, running. Then the next one. The file tabs jump between them;
 * once someone picks one, it stops cycling. Reduced motion shows each finished, still.
 */
export function CodeToUi() {
  const reduce = !!useReducedMotion();
  const [scene, setScene] = React.useState(0);
  const [typed, setTyped] = React.useState(reduce ? SCENES[0].code.length : 0);
  const [phase, setPhase] = React.useState<Phase>(reduce ? "live" : "typing");
  const [held, setHeld] = React.useState(false);
  const code = SCENES[scene].code;

  React.useEffect(() => {
    if (reduce) return;
    let t: ReturnType<typeof setTimeout>;
    if (phase === "typing") {
      if (typed < code.length) {
        // whole indentation runs and line ends land together, so it reads like fast typing
        const next = code.indexOf("\n", typed) === typed ? typed + 1 : typed + 2;
        t = setTimeout(() => setTyped(Math.min(code.length, next)), TYPE_MS);
      } else t = setTimeout(() => setPhase("beam"), 250);
    } else if (phase === "beam") {
      t = setTimeout(() => setPhase("live"), 650);
    } else if (phase === "live") {
      if (!held) t = setTimeout(() => setPhase("erasing"), HOLD_MS);
    } else {
      if (typed > 0) t = setTimeout(() => setTyped((n) => Math.max(0, n - 12)), 12);
      else
        t = setTimeout(() => {
          setScene((s) => (s + 1) % SCENES.length);
          setPhase("typing");
        }, 120);
    }
    return () => clearTimeout(t);
  }, [phase, typed, code, reduce, held]);

  const pick = (i: number) => {
    setHeld(true);
    setScene(i);
    setTyped(SCENES[i].code.length);
    setPhase("live");
  };

  const shown = code.slice(0, typed);
  const lines = shown.split("\n");
  const html = highlight(shown);
  const showLive = phase === "live" || (reduce && phase !== "erasing");

  return (
    <div className="relative mx-auto w-full max-w-[560px] pb-6">
      {/* editor */}
      <div className="cx-edge relative z-10">
        <div className="overflow-hidden rounded-[21px] bg-[#0b0b0f] shadow-[0_40px_90px_-40px_rgba(0,0,0,0.6)]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
            <div className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-[#ff605c]" />
              <span className="size-2.5 rounded-full bg-[#ffbd44]" />
              <span className="size-2.5 rounded-full bg-[#00ca4e]" />
            </div>
            <div role="tablist" aria-label="Examples" className="flex min-w-0 gap-1 overflow-x-auto">
              {SCENES.map((s, i) => (
                <button
                  key={s.file}
                  role="tab"
                  type="button"
                  aria-selected={i === scene}
                  onClick={() => pick(i)}
                  className={cn(
                    "shrink-0 rounded-md px-2.5 py-1 font-mono text-[12px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white/60",
                    i === scene ? "bg-white/10 text-white" : "text-white/45 hover:text-white/75",
                  )}
                >
                  {s.file}
                </button>
              ))}
            </div>
          </div>
          <div className="flex h-[268px] gap-4 overflow-hidden px-4 py-4 font-mono text-[12.5px] leading-[1.75]" style={SH_VARS}>
            <div aria-hidden className="select-none text-right text-white/25">
              {Array.from({ length: Math.max(lines.length, 1) }).map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="min-w-0 flex-1 overflow-hidden whitespace-pre text-[#e6e6eb]">
              <code dangerouslySetInnerHTML={{ __html: html }} />
              {phase === "typing" && !reduce ? (
                <span aria-hidden className="pg-caret ml-px inline-block h-[1.15em] w-[7px] translate-y-[3px] bg-[#82aaff]" />
              ) : null}
            </pre>
          </div>
        </div>
      </div>

      {/* the light that carries the code down into the page */}
      <div aria-hidden className="relative z-0 mx-auto h-12 w-px bg-[var(--cx-hairline)]">
        <AnimatePresence>
          {phase === "beam" ? (
            <motion.span
              key={`beam-${scene}`}
              className="absolute left-1/2 top-0 block h-6 w-[3px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,transparent,var(--cx-violet),var(--cx-blue))] shadow-[0_0_14px_3px_var(--cx-ink-glow)]"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 40, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          ) : null}
        </AnimatePresence>
        {showLive ? <span className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-[var(--cx-violet)] shadow-[0_0_10px_2px_var(--cx-ink-glow)]" /> : null}
      </div>

      {/* the page it renders on */}
      <div className="relative z-10 ml-auto w-[88%] overflow-hidden rounded-[22px] bg-card shadow-[0_0_0_0.5px_var(--cx-hairline),0_30px_70px_-30px_rgba(0,0,0,0.45)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_30px_80px_-30px_rgba(110,91,255,0.45)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-2 text-[12px] text-muted-foreground">
          <span className="font-mono">localhost:3000</span>
          <span className="inline-flex items-center gap-1.5">
            <span className={cn("size-1.5 rounded-full", showLive ? "bg-[#30d158]" : "bg-muted-foreground/40")} />
            {showLive ? "Running" : "Waiting for code"}
          </span>
        </div>
        <div className="relative grid h-[150px] place-items-center">
          <div aria-hidden className="pg-dotgrid absolute inset-0 opacity-70" />
          <AnimatePresence mode="wait">
            {showLive ? (
              <motion.div
                key={scene}
                className="relative"
                initial={reduce ? false : { opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
              >
                {SCENES[scene].render()}
              </motion.div>
            ) : (
              <motion.p
                key="waiting"
                className="relative font-mono text-[12.5px] text-muted-foreground/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                compiling…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
