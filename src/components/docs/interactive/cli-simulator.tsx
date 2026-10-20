"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import {
  Check,
  ChevronRight,
  Copy,
  File,
  FileCode2,
  FileJson,
  Folder,
  FolderOpen,
  Loader2,
  Play,
  RotateCcw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data — file targets and dependencies copied from                    */
/* .generated/registry/<name>.json (files[].target, dependencies).     */
/* Nothing is fetched or read at runtime.                              */
/* ------------------------------------------------------------------ */

export type CliItemId = "wheel-selector" | "pricing-section" | "otp-input" | "ui-sounds" | "text-animations";

type CliItem = {
  id: CliItemId;
  kind: "Component" | "Block" | "Lib";
  pro: boolean;
  dependencies: readonly string[];
  files: readonly string[];
  /** Pulls the nexus-font registry dependency, which ships cssVars for globals.css. */
  cssVars: boolean;
  importPath: string;
};

const ITEMS: readonly CliItem[] = [
  {
    id: "wheel-selector",
    kind: "Component",
    pro: false,
    dependencies: ["framer-motion", "lucide-react", "react"],
    files: ["components/wheel-selector/index.ts", "components/wheel-selector/wheel-selector.tsx"],
    cssVars: true,
    importPath: "@/components/wheel-selector",
  },
  {
    id: "pricing-section",
    kind: "Block",
    pro: false,
    dependencies: ["react", "framer-motion", "lucide-react"],
    files: [
      "components/blocks/pricing-section/billing-pricing-variants.tsx",
      "components/blocks/pricing-section/index.ts",
      "components/blocks/pricing-section/radio-plan-pricing.tsx",
    ],
    cssVars: true,
    importPath: "@/components/blocks/pricing-section",
  },
  {
    id: "otp-input",
    kind: "Component",
    pro: false,
    dependencies: ["framer-motion", "react"],
    files: ["components/otp-input/index.ts", "components/otp-input/otp-input.tsx"],
    cssVars: true,
    importPath: "@/components/otp-input",
  },
  {
    id: "ui-sounds",
    kind: "Lib",
    pro: false,
    dependencies: [],
    files: ["lib/ui-sounds.ts"],
    cssVars: false,
    importPath: "@/lib/ui-sounds",
  },
  {
    id: "text-animations",
    kind: "Block",
    pro: true,
    dependencies: ["react", "framer-motion", "lucide-react"],
    files: [
      "components/blocks/text-animations/index.tsx",
      "components/blocks/text-animations/text-animation-blur-fade-in.tsx",
      "components/blocks/text-animations/text-animation-flipping-words.tsx",
      "components/blocks/text-animations/text-animation-typewriter-effect.tsx",
      "components/blocks/text-animations/text-generate-typewriter.tsx",
      "components/blocks/text-animations/typewriter-heading.tsx",
    ],
    cssVars: true,
    importPath: "@/components/blocks/text-animations",
  },
];

const ITEM_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item])) as Record<CliItemId, CliItem>;

const UNAUTHORIZED_MESSAGE =
  "Unauthorized — Add your API token to components.json. Get it at nexus-ui.com/dashboard/api-key";

/** A fresh Next.js app after `shadcn init`. */
const BASE_FILES: readonly string[] = [
  "app/favicon.ico",
  "app/globals.css",
  "app/layout.tsx",
  "app/page.tsx",
  "components/ui/button.tsx",
  "lib/utils.ts",
  "public/next.svg",
  ".env",
  "components.json",
  "next.config.ts",
  "package.json",
  "tsconfig.json",
];

const INITIAL_OPEN: readonly string[] = ["components"];
const MAX_LINES = 80;

function cliCommand(id: CliItemId) {
  return `npx shadcn@latest add @nexus-labs/${id}`;
}

/* ------------------------------------------------------------------ */
/* Simulation model: a pure reducer over scripted events               */
/* ------------------------------------------------------------------ */

type LineKind = "cmd" | "step" | "item" | "note" | "error" | "done" | "gap";
type LineStatus = "pending" | "ok" | "fail";
type Line = { id: number; kind: LineKind; text: string; status?: LineStatus; tag?: string };

type Sim = {
  seq: number;
  lines: Line[];
  added: string[];
  flash: Record<string, number>;
  open: string[];
};

type SimEvent =
  | { type: "line"; kind: LineKind; text: string; status?: LineStatus; tag?: string }
  | { type: "settle"; tag: string; status: LineStatus; text?: string }
  | { type: "add"; path: string }
  | { type: "flash"; path: string }
  | { type: "clearFlash" }
  | { type: "abort" }
  | { type: "toggle"; folder: string };

type Step = { wait: number; event: SimEvent };

const INITIAL_SIM: Sim = { seq: 0, lines: [], added: [], flash: {}, open: [...INITIAL_OPEN] };

function ancestors(path: string) {
  const parts = path.split("/");
  const out: string[] = [];
  for (let i = 1; i < parts.length; i++) out.push(parts.slice(0, i).join("/"));
  return out;
}

function openAncestors(open: string[], path: string) {
  const next = open.slice();
  for (const folder of ancestors(path)) if (!next.includes(folder)) next.push(folder);
  return next;
}

function applyEvent(s: Sim, e: SimEvent): Sim {
  switch (e.type) {
    case "line": {
      const lines = s.lines.slice();
      let seq = s.seq;
      if (e.kind === "cmd" && lines.length > 0) lines.push({ id: ++seq, kind: "gap", text: "" });
      lines.push({ id: ++seq, kind: e.kind, text: e.text, status: e.status, tag: e.tag });
      return { ...s, seq, lines: lines.length > MAX_LINES ? lines.slice(-MAX_LINES) : lines };
    }
    case "settle": {
      let index = -1;
      for (let i = s.lines.length - 1; i >= 0; i--) {
        if (s.lines[i].tag === e.tag) {
          index = i;
          break;
        }
      }
      if (index < 0) return s;
      const lines = s.lines.slice();
      lines[index] = { ...lines[index], status: e.status, text: e.text ?? lines[index].text };
      return { ...s, lines };
    }
    case "add": {
      if (s.added.includes(e.path)) return s;
      const seq = s.seq + 1;
      return {
        ...s,
        seq,
        added: [...s.added, e.path],
        flash: { ...s.flash, [e.path]: seq },
        open: openAncestors(s.open, e.path),
      };
    }
    case "flash": {
      const seq = s.seq + 1;
      return { ...s, seq, flash: { ...s.flash, [e.path]: seq }, open: openAncestors(s.open, e.path) };
    }
    case "clearFlash":
      return Object.keys(s.flash).length ? { ...s, flash: {} } : s;
    case "abort":
      return {
        ...s,
        lines: s.lines.map((line) => (line.status === "pending" ? { ...line, status: "fail" } : line)),
      };
    case "toggle":
      return {
        ...s,
        open: s.open.includes(e.folder) ? s.open.filter((f) => f !== e.folder) : [...s.open, e.folder],
      };
  }
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

/** The output the shadcn CLI prints for `add @nexus-labs/<id>`, as timed events. */
function buildScript(item: CliItem, hasPro: boolean, existing: readonly string[], run: number) {
  const steps: Step[] = [];
  const push = (wait: number, event: SimEvent) => steps.push({ wait, event });
  const tag = (name: string) => `${run}:${name}`;

  if (item.pro) {
    push(160, { type: "line", kind: "note", text: 'components.json sends "Authorization": "Bearer ${NEXUS_API_KEY}"' });
    push(220, { type: "line", kind: "step", status: "pending", tag: tag("env"), text: "Reading NEXUS_API_KEY from .env." });
    if (hasPro) {
      push(520, { type: "settle", tag: tag("env"), status: "ok", text: "Read NEXUS_API_KEY from .env." });
      push(0, { type: "flash", path: ".env" });
    } else {
      push(520, {
        type: "settle",
        tag: tag("env"),
        status: "fail",
        text: "No NEXUS_API_KEY in .env. Sending the request without a token.",
      });
    }
  }

  push(item.pro ? 200 : 160, { type: "line", kind: "step", status: "pending", tag: tag("check"), text: "Checking registry." });

  if (item.pro && !hasPro) {
    push(760, { type: "settle", tag: tag("check"), status: "fail" });
    push(200, { type: "line", kind: "error", text: `GET nexus-ui.com/api/registry/${item.id} returned 401.` });
    push(160, { type: "line", kind: "error", text: UNAUTHORIZED_MESSAGE });
    push(240, { type: "line", kind: "note", text: "No files were written." });
    return { steps, summary: `${item.id} was not installed. ${UNAUTHORIZED_MESSAGE}` };
  }

  push(720, {
    type: "settle",
    tag: tag("check"),
    status: "ok",
    text: item.pro ? "Checking registry. Pro access verified." : undefined,
  });

  if (item.cssVars) {
    push(150, {
      type: "line",
      kind: "step",
      status: "pending",
      tag: tag("css"),
      text: "Updating CSS variables in app/globals.css",
    });
    push(420, { type: "settle", tag: tag("css"), status: "ok" });
    push(0, { type: "flash", path: "app/globals.css" });
  }

  if (item.dependencies.length) {
    push(150, { type: "line", kind: "step", status: "pending", tag: tag("deps"), text: "Installing dependencies." });
    for (const dep of item.dependencies) push(120, { type: "line", kind: "item", text: `+ ${dep}` });
    push(640, { type: "settle", tag: tag("deps"), status: "ok" });
    push(0, { type: "flash", path: "package.json" });
  }

  const toWrite = item.files.filter((f) => !existing.includes(f));
  const skipped = item.files.filter((f) => existing.includes(f));

  if (toWrite.length) {
    push(170, { type: "line", kind: "step", status: "pending", tag: tag("write"), text: "Writing files." });
    for (const file of toWrite) {
      push(240, { type: "line", kind: "item", text: `- ${file}` });
      push(0, { type: "add", path: file });
    }
    push(140, { type: "settle", tag: tag("write"), status: "ok", text: `Created ${plural(toWrite.length, "file")}:` });
  }

  if (skipped.length) {
    push(170, {
      type: "line",
      kind: "note",
      text: `Skipped ${plural(skipped.length, "file")}: (files might be identical, use --overwrite to overwrite)`,
    });
    for (const file of skipped) push(90, { type: "line", kind: "item", text: `- ${file}` });
  }

  push(240, { type: "line", kind: "done", text: `Done. Import it from "${item.importPath}".` });

  const summary = toWrite.length
    ? `${item.id} installed. Created ${plural(toWrite.length, "file")}: ${toWrite.join(", ")}.`
    : `${item.id} is already installed. Skipped ${plural(skipped.length, "file")}.`;
  return { steps, summary };
}

function runInstantly(sim: Sim, item: CliItem, hasPro: boolean, run: number) {
  const { steps, summary } = buildScript(item, hasPro, sim.added, run);
  let next = applyEvent(sim, { type: "line", kind: "cmd", text: cliCommand(item.id) });
  for (const step of steps) next = applyEvent(next, step.event);
  return { sim: applyEvent(next, { type: "clearFlash" }), summary };
}

/* ------------------------------------------------------------------ */
/* File tree                                                          */
/* ------------------------------------------------------------------ */

type TreeNode = { name: string; path: string; folder: boolean; children: Map<string, TreeNode> };
type Row = { key: string; name: string; depth: number; folder: boolean; added: boolean };

function byFolderThenName(a: TreeNode, b: TreeNode) {
  if (a.folder !== b.folder) return a.folder ? -1 : 1;
  return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
}

function buildRows(added: readonly string[], open: readonly string[]): Row[] {
  const root: TreeNode = { name: "", path: "", folder: true, children: new Map() };
  for (const file of [...BASE_FILES, ...added]) {
    const parts = file.split("/");
    let node = root;
    parts.forEach((part, i) => {
      const path = parts.slice(0, i + 1).join("/");
      let child = node.children.get(part);
      if (!child) {
        child = { name: part, path, folder: i < parts.length - 1, children: new Map() };
        node.children.set(part, child);
      }
      node = child;
    });
  }
  const rows: Row[] = [];
  const walk = (node: TreeNode, depth: number) => {
    for (const child of [...node.children.values()].sort(byFolderThenName)) {
      rows.push({
        key: child.path,
        name: child.name,
        depth,
        folder: child.folder,
        added: !child.folder && added.includes(child.path),
      });
      if (child.folder && open.includes(child.path)) walk(child, depth + 1);
    }
  };
  walk(root, 0);
  return rows;
}

function FileIcon({ name }: { name: string }) {
  const cls = "size-3.5 shrink-0";
  if (/\.(tsx?|jsx?)$/.test(name)) return <FileCode2 className={cn(cls, "text-[#0071e3] dark:text-[#64d2ff]")} aria-hidden />;
  if (name.endsWith(".json")) return <FileJson className={cn(cls, "text-[#b25000] dark:text-[#ffb340]")} aria-hidden />;
  return <File className={cn(cls, "text-muted-foreground")} aria-hidden />;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export type CliSimulatorProps = {
  /** Demo itself (wheel-selector, then pricing-section) until the first interaction. */
  autoplay?: boolean;
  /** Item selected on first render. */
  defaultItem?: CliItemId;
  /** Initial state of the "I have Pro" switch. */
  defaultPro?: boolean;
  className?: string;
};

type Phase = "idle" | "typing" | "running";
type RunOptions = { auto?: boolean; onDone?: () => void };

const ROW_SPRING: Transition = { type: "spring", stiffness: 520, damping: 22, mass: 0.8 };
const SOFT_SPRING: Transition = { type: "spring", stiffness: 420, damping: 32 };
const INSTANT: Transition = { duration: 0 };

const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 focus-visible:ring-offset-card dark:focus-visible:ring-[#0a84ff]";

function charDelay(text: string, i: number) {
  const prev = text[i - 1];
  if (prev === " ") return 70;
  if (prev === "@" || prev === "/") return 48;
  return 24 + ((i * 7) % 3) * 6; // deterministic, slightly uneven rhythm
}

function schedule(bag: Set<number>, ms: number, fn: () => void) {
  const id = window.setTimeout(() => {
    bag.delete(id);
    fn();
  }, ms);
  bag.add(id);
}

function clearBag(bag: Set<number>) {
  bag.forEach((id) => window.clearTimeout(id));
  bag.clear();
}

export function CliSimulator({
  autoplay = true,
  defaultItem = "wheel-selector",
  defaultPro = true,
  className,
}: CliSimulatorProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reduced = useReducedMotion();

  const [selected, setSelected] = useState<CliItemId>(defaultItem);
  const [pro, setPro] = useState(defaultPro);
  const [sim, setSim] = useState<Sim>(INITIAL_SIM);
  const [phase, setPhase] = useState<Phase>("idle");
  const [engaged, setEngaged] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announce, setAnnounce] = useState("");

  const liveText = useMotionValue("");
  const runTimers = useRef<Set<number>>(new Set());
  const autoTimers = useRef<Set<number>>(new Set());
  const copyTimer = useRef<number | null>(null);
  const touchedRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const proRef = useRef(defaultPro);
  const reducedRef = useRef(false);
  const addedRef = useRef<string[]>([]);
  const runNo = useRef(0);
  const logRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    reducedRef.current = reduced === true;
  }, [reduced]);

  useEffect(() => {
    addedRef.current = sim.added;
  }, [sim.added]);

  const setPhaseBoth = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  /** Ctrl-C whatever is in flight so a new run or reset starts clean. */
  const interrupt = useCallback(() => {
    clearBag(runTimers.current);
    const was = phaseRef.current;
    if (was === "idle") return;
    const partial = liveText.get();
    liveText.set("");
    setSim((s) => {
      let next = applyEvent(s, { type: "abort" });
      next =
        was === "typing"
          ? applyEvent(next, { type: "line", kind: "cmd", text: `${partial}^C` })
          : applyEvent(next, { type: "line", kind: "note", text: "^C" });
      return applyEvent(next, { type: "clearFlash" });
    });
    setPhaseBoth("idle");
  }, [liveText, setPhaseBoth]);

  const startRun = useCallback(
    (id: CliItemId, opts: RunOptions = {}) => {
      interrupt();
      const item = ITEM_BY_ID[id];
      const run = ++runNo.current;
      const hasPro = proRef.current;
      if (!opts.auto) setAnnounce("");

      if (reducedRef.current) {
        setSim((s) => runInstantly(s, item, hasPro, run).sim);
        const { summary } = buildScript(item, hasPro, addedRef.current, run);
        if (!opts.auto) setAnnounce(summary);
        opts.onDone?.();
        return;
      }

      const bag = runTimers.current;
      const cmd = cliCommand(id);
      const { steps, summary } = buildScript(item, hasPro, addedRef.current, run);
      setPhaseBoth("typing");
      liveText.set("");

      let t = 120;
      for (let i = 1; i <= cmd.length; i++) {
        t += charDelay(cmd, i);
        const text = cmd.slice(0, i);
        schedule(bag, t, () => liveText.set(text));
      }
      t += 380;
      schedule(bag, t, () => {
        liveText.set("");
        phaseRef.current = "running";
        setPhase("running");
        setSim((s) => applyEvent(s, { type: "line", kind: "cmd", text: cmd }));
      });
      for (const step of steps) {
        t += step.wait;
        schedule(bag, t, () => setSim((s) => applyEvent(s, step.event)));
      }
      t += 180;
      schedule(bag, t, () => {
        phaseRef.current = "idle";
        setPhase("idle");
        if (!opts.auto) setAnnounce(summary);
        opts.onDone?.();
      });
      schedule(bag, t + 2200, () => setSim((s) => applyEvent(s, { type: "clearFlash" })));
    },
    [interrupt, liveText, setPhaseBoth],
  );

  const resetAll = useCallback(() => {
    clearBag(runTimers.current);
    liveText.set("");
    phaseRef.current = "idle";
    setPhase("idle");
    setSim(INITIAL_SIM);
    setAnnounce("");
  }, [liveText]);

  // Clean up every timer on unmount.
  useEffect(() => {
    const runs = runTimers.current;
    const autos = autoTimers.current;
    return () => {
      clearBag(runs);
      clearBag(autos);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    };
  }, []);

  // Autoplay: wheel-selector, pause, pricing-section, pause, reset, repeat — until touched.
  useEffect(() => {
    if (!autoplay || reduced !== false) return;
    const bag = autoTimers.current;
    const cycle = () => {
      schedule(bag, 900, () => {
        if (touchedRef.current) return;
        setSelected("wheel-selector");
        startRun("wheel-selector", {
          auto: true,
          onDone: () =>
            schedule(bag, 2000, () => {
              if (touchedRef.current) return;
              setSelected("pricing-section");
              startRun("pricing-section", {
                auto: true,
                onDone: () =>
                  schedule(bag, 3600, () => {
                    if (touchedRef.current) return;
                    resetAll();
                    cycle();
                  }),
              });
            }),
        });
      });
    };
    if (!touchedRef.current) cycle();
    return () => clearBag(bag);
  }, [autoplay, reduced, startRun, resetAll]);

  // Keep the newest output in view (scrolls the terminal only, never the page).
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [sim.lines, phase]);

  // Reduced motion: no autoplay, show the finished demo instead.
  const demoSim = useMemo(() => runInstantly(INITIAL_SIM, ITEM_BY_ID[defaultItem], defaultPro, 0).sim, [defaultItem, defaultPro]);
  const showDemo = reduced === true && autoplay && !engaged;
  const view = showDemo ? demoSim : sim;
  const rows = useMemo(() => buildRows(view.added, view.open), [view.added, view.open]);

  const engage = () => {
    if (touchedRef.current) return;
    touchedRef.current = true;
    clearBag(autoTimers.current);
    setEngaged(true);
    if (reducedRef.current && autoplay) setSim(demoSim);
  };

  const selectedItem = ITEM_BY_ID[selected];

  const onRun = () => startRun(selected);

  const onCopy = () => {
    const text = cliCommand(selected);
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopied(true);
        if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {});
  };

  const onChipKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = ITEMS.findIndex((item) => item.id === selected);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % ITEMS.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + ITEMS.length) % ITEMS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ITEMS.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setSelected(ITEMS[next].id);
    chipRefs.current[next]?.focus();
  };

  const onTerminalKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && e.target === e.currentTarget) {
      e.preventDefault();
      onRun();
    }
  };

  const toggleFolder = (folder: string) => setSim((s) => applyEvent(s, { type: "toggle", folder }));

  const lineTransition = reduced ? INSTANT : SOFT_SPRING;
  const busy = phase !== "idle";

  return (
    <section
      aria-labelledby={`${uid}-title`}
      onPointerDownCapture={engage}
      onKeyDownCapture={engage}
      onFocusCapture={engage}
      className={cn(
        "@container w-full min-w-0 rounded-[28px] bg-card p-4 text-foreground sm:p-5",
        "shadow-[0_0_0_0.5px_var(--border),0_20px_40px_-26px_rgba(0,0,0,.35)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 id={`${uid}-title`} className="text-[17px] font-semibold tracking-[-0.01em]">
          What <span className="font-mono text-[15px]">shadcn add</span> does
        </h3>
        <p className="text-[12.5px] text-muted-foreground">Simulated — nothing runs on your machine</p>
      </div>

      {/* Item picker */}
      <LayoutGroup id={`${uid}-chips`}>
        <div
          role="radiogroup"
          aria-label="Item to add"
          onKeyDown={onChipKeyDown}
          className="mt-3 flex flex-wrap gap-1.5"
        >
          {ITEMS.map((item, i) => {
            const active = item.id === selected;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  chipRefs.current[i] = el;
                }}
                type="button"
                role="radio"
                aria-checked={active}
                tabIndex={active ? 0 : -1}
                onClick={() => setSelected(item.id)}
                className={cn(
                  "relative isolate flex min-h-9 items-center gap-1.5 rounded-full px-3 py-1.5 text-left text-[13px] transition-colors",
                  active ? "text-[#0062c4] dark:text-[#64b5ff]" : "text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                  focusRing,
                )}
              >
                {active && (
                  <motion.span
                    layoutId="chip"
                    aria-hidden
                    transition={reduced ? INSTANT : ROW_SPRING}
                    className="absolute inset-0 -z-10 rounded-full bg-[#0071e3]/10 ring-1 ring-[#0071e3]/35 dark:bg-[#0a84ff]/18 dark:ring-[#0a84ff]/45"
                  />
                )}
                <span className="font-mono text-[12.5px]">{item.id}</span>
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[10.5px] font-medium",
                    item.pro
                      ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]"
                      : "bg-black/[0.05] text-muted-foreground dark:bg-white/[0.08]",
                  )}
                >
                  {item.pro ? `Pro ${item.kind.toLowerCase()}` : item.kind}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onRun}
          aria-describedby={`${uid}-cmd`}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full bg-[#0071e3] px-4 text-[13.5px] font-medium text-white transition-[background-color,transform] hover:bg-[#0077ed] active:scale-[0.97]",
            focusRing,
          )}
        >
          <Play className="size-3.5 fill-current" aria-hidden />
          {busy ? "Run again" : "Run"}
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={pro}
          onClick={() => {
            proRef.current = !pro;
            setPro(!pro);
          }}
          className={cn("inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px]", focusRing)}
        >
          <span
            aria-hidden
            className={cn(
              "relative inline-flex h-[22px] w-[38px] items-center rounded-full p-[2px] transition-colors",
              pro ? "justify-end bg-[#34c759]" : "justify-start bg-black/15 dark:bg-white/20",
            )}
          >
            <motion.span
              layout
              transition={reduced ? INSTANT : ROW_SPRING}
              className="size-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.25)]"
            />
          </span>
          I have Pro
        </button>

        <button
          type="button"
          onClick={resetAll}
          className={cn(
            "ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] text-muted-foreground transition-colors hover:bg-black/[0.04] hover:text-foreground dark:hover:bg-white/[0.06]",
            focusRing,
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="mt-3 grid min-w-0 gap-3 @min-[600px]:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
        {/* Terminal */}
        <div className="flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-[#1d1d1f] text-[#e6e6ea]">
          <div className="flex items-center gap-2 border-b border-white/[0.08] px-3.5 py-2.5">
            <span aria-hidden className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-[#ff5f57]" />
              <span className="size-2.5 rounded-full bg-[#febc2e]" />
              <span className="size-2.5 rounded-full bg-[#28c840]" />
            </span>
            <span className="truncate text-[12px] text-[#a1a1a6]">my-app</span>
            <span className="rounded-full bg-white/[0.1] px-1.5 py-px text-[10.5px] font-medium text-[#d1d1d6]">
              Simulated
            </span>
            <button
              type="button"
              onClick={onCopy}
              aria-label={copied ? "Copied" : `Copy command: ${cliCommand(selected)}`}
              className={cn(
                "ml-auto inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-[12px] transition-colors",
                copied ? "text-[#30d158]" : "text-[#d1d1d6] hover:bg-white/10 hover:text-white",
                "outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]",
              )}
            >
              {copied ? <Check className="size-3.5" strokeWidth={2.5} aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div
            ref={logRef}
            tabIndex={0}
            role="group"
            aria-label={`Simulated terminal. Press Enter to run ${cliCommand(selected)}.`}
            onKeyDown={onTerminalKeyDown}
            className="h-[280px] overflow-y-auto overscroll-contain px-3.5 py-3 font-mono text-[12.5px] leading-[1.6] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0a84ff] @min-[600px]:h-[340px]"
          >
            <span id={`${uid}-cmd`} className="sr-only">
              {cliCommand(selected)}
            </span>
            {view.lines.map((line) => (
              <motion.div
                key={line.id}
                initial={reduced ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={lineTransition}
                className={cn(
                  "whitespace-pre-wrap [overflow-wrap:anywhere]",
                  line.kind === "gap" && "h-3",
                  line.kind === "item" && "pl-5 text-[#c7c7cc]",
                  line.kind === "note" && "text-[#a1a1a6]",
                  line.kind === "error" && "text-[#ff6961]",
                  line.kind === "done" && "text-[#30d158]",
                  line.kind === "step" && "flex gap-2",
                )}
              >
                {line.kind === "cmd" ? (
                  <>
                    <span className="text-[#64d2ff]">~/my-app</span> <span className="text-[#30d158]">$</span>{" "}
                    <span className="text-white">{line.text}</span>
                  </>
                ) : line.kind === "step" ? (
                  <>
                    <span className="mt-[3px] inline-flex size-3.5 shrink-0 items-center justify-center" aria-hidden>
                      {line.status === "pending" ? (
                        <Loader2 className="size-3.5 animate-spin text-[#a1a1a6] motion-reduce:animate-none" />
                      ) : line.status === "fail" ? (
                        <X className="size-3.5 text-[#ff6961]" strokeWidth={2.75} />
                      ) : (
                        <Check className="size-3.5 text-[#30d158]" strokeWidth={2.75} />
                      )}
                    </span>
                    <span className={cn("min-w-0", line.status === "fail" && "text-[#ff6961]")}>{line.text}</span>
                  </>
                ) : (
                  line.text
                )}
              </motion.div>
            ))}

            {phase !== "running" && (
              <div className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                {view.lines.length > 0 && <div className="h-3" aria-hidden />}
                <span className="text-[#64d2ff]">~/my-app</span> <span className="text-[#30d158]">$</span>{" "}
                <motion.span className="text-white">{liveText}</motion.span>
                <span
                  aria-hidden
                  className="ml-px inline-block h-[1.05em] w-[0.55em] translate-y-[0.18em] animate-pulse bg-[#e6e6ea] motion-reduce:animate-none"
                />
                {phase === "idle" && (
                  <span className="ml-2 text-[#a1a1a6]">
                    {view.lines.length ? "" : "Press Run or Enter"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* File tree */}
        <div className="flex min-w-0 flex-col rounded-[20px] bg-[#f5f5f7] dark:bg-black">
          <div className="flex items-center justify-between gap-2 px-3.5 pb-1.5 pt-3">
            <span className="text-[12px] font-medium text-muted-foreground">Project files</span>
            <span className="text-[11.5px] tabular-nums text-muted-foreground">
              {view.added.length ? `+${view.added.length} added` : "Next.js app"}
            </span>
          </div>
          <ul
            aria-label="Project files"
            className="relative max-h-[320px] overflow-y-auto overscroll-contain px-2 pb-2.5 font-mono text-[12.5px] @min-[600px]:h-[310px] @min-[600px]:max-h-none"
          >
            <li className="flex h-7 items-center gap-1.5 px-1.5 text-foreground">
              <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              my-app
            </li>
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map((row) => {
                const isOpen = row.folder && view.open.includes(row.key);
                const flashToken = view.flash[row.key];
                return (
                  <motion.li
                    key={row.key}
                    layout={reduced ? false : "position"}
                    initial={reduced ? false : { opacity: 0, x: -18, scale: 0.94 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={reduced ? { opacity: 0, transition: INSTANT } : { opacity: 0, x: -8, transition: { duration: 0.12 } }}
                    transition={reduced ? INSTANT : ROW_SPRING}
                    className="relative origin-left"
                    style={{ paddingLeft: (row.depth + 1) * 14 }}
                  >
                    {flashToken !== undefined && !reduced && (
                      <motion.span
                        key={flashToken}
                        aria-hidden
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 1.6, delay: 0.6, ease: "easeOut" }}
                        className="absolute inset-y-0 left-1 right-0 rounded-lg bg-[#0071e3]/14 dark:bg-[#0a84ff]/25"
                      />
                    )}
                    {row.folder ? (
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => toggleFolder(row.key)}
                        className={cn(
                          "relative flex h-7 w-full items-center gap-1.5 rounded-lg px-1.5 text-left text-foreground hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
                          "outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:focus-visible:ring-[#0a84ff]",
                        )}
                      >
                        <motion.span
                          aria-hidden
                          animate={{ rotate: isOpen ? 90 : 0 }}
                          transition={reduced ? INSTANT : ROW_SPRING}
                          className="-ml-3.5 inline-flex"
                        >
                          <ChevronRight className="size-3 text-muted-foreground" />
                        </motion.span>
                        {isOpen ? (
                          <FolderOpen className="size-3.5 shrink-0 text-[#0071e3] dark:text-[#64d2ff]" aria-hidden />
                        ) : (
                          <Folder className="size-3.5 shrink-0 text-[#0071e3] dark:text-[#64d2ff]" aria-hidden />
                        )}
                        <span className="min-w-0 truncate">{row.name}</span>
                      </button>
                    ) : (
                      <div className="relative flex h-7 items-center gap-1.5 px-1.5 text-foreground">
                        <FileIcon name={row.name} />
                        <span className={cn("min-w-0 truncate", row.added && "font-medium")}>{row.name}</span>
                        {row.added && (
                          <span className="ml-auto shrink-0 pl-1 font-sans text-[10.5px] font-semibold text-[#1a7f37] dark:text-[#30d158]">
                            new
                          </span>
                        )}
                      </div>
                    )}
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
      <p className="mt-2.5 text-[12.5px] text-muted-foreground">
        Pick an item and press Run. File lists and dependencies match the real{" "}
        <span className="font-mono">{selectedItem.id}</span> registry entry.
      </p>
    </section>
  );
}
