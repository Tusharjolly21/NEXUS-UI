"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Check, Copy, Lock, Volume1, Volume2, VolumeX } from "lucide-react";
import { CodeBlock } from "@/components/code-block/code-block";
import { ProBadge, useProAccess } from "@/components/pro/pro-access";
import { SOUNDS, playSound, setSoundVolume, type SoundCategory, type SoundName } from "@/lib/ui-sounds";
import { PRO_SOUND_META } from "@/lib/ui-sounds-pro-meta";
import type { ProSoundCategory, ProSoundName } from "@/lib/ui-sounds-pro";
import { cn } from "@/lib/utils";

type Category = SoundCategory | ProSoundCategory;
type Access = "all" | "free" | "pro";
type Used = { slug: string; name: string }[];

const FREE_CATEGORIES: SoundCategory[] = ["Actions", "Feedback", "Navigation", "Notifications", "Selection", "Movement", "Progress", "System"];
const PRO_CATEGORIES: ProSoundCategory[] = ["Glass", "Paper and wood", "Arcade", "Studio"];

/** One entry on the board, free or Pro. The Pro recipes load only when one is played. */
type Item = { key: string; name: string; label: string; category: Category; pro: boolean };
const ITEMS: Item[] = [
  ...(Object.keys(SOUNDS) as SoundName[]).map((n) => ({ key: n, name: n, label: SOUNDS[n].label, category: SOUNDS[n].category as Category, pro: false })),
  ...PRO_SOUND_META.map((m) => ({ key: `pro:${m.name}`, name: m.name, label: m.label, category: m.category as Category, pro: true })),
];

/** Each category gets its own orb colour, so the board reads by kind at a glance. */
const ORB: Record<Category, string> = {
  Actions: "radial-gradient(circle at 32% 28%, #e9d5ff 0%, #c084fc 28%, #7c3aed 70%, #4c1d95 100%)",
  Feedback: "radial-gradient(circle at 32% 28%, #d1fae5 0%, #34d399 30%, #14b8a6 68%, #0f766e 100%)",
  Navigation: "radial-gradient(circle at 32% 28%, #dbeafe 0%, #60a5fa 30%, #1d4ed8 72%, #1e3a8a 100%)",
  Notifications: "radial-gradient(circle at 32% 28%, #fef9c3 0%, #fde047 30%, #f59e0b 70%, #b45309 100%)",
  Selection: "radial-gradient(circle at 32% 28%, #fce7f3 0%, #f472b6 30%, #a855f7 70%, #6b21a8 100%)",
  Movement: "radial-gradient(circle at 32% 28%, #ccfbf1 0%, #5eead4 30%, #22c55e 70%, #15803d 100%)",
  Progress: "radial-gradient(circle at 32% 28%, #ffedd5 0%, #fb923c 30%, #ef4444 70%, #b91c1c 100%)",
  System: "radial-gradient(circle at 32% 28%, #f3f4f6 0%, #9ca3af 30%, #4b5563 70%, #1f2937 100%)",
  Glass: "radial-gradient(circle at 32% 28%, #ecfeff 0%, #a5f3fc 30%, #38bdf8 70%, #0369a1 100%)",
  "Paper and wood": "radial-gradient(circle at 32% 28%, #fef3c7 0%, #fcd34d 28%, #b45309 70%, #78350f 100%)",
  Arcade: "radial-gradient(circle at 32% 28%, #fae8ff 0%, #e879f9 28%, #16a34a 72%, #14532d 100%)",
  Studio: "radial-gradient(circle at 32% 28%, #fef9c3 0%, #facc15 26%, #92400e 70%, #1c1917 100%)",
};

/**
 * The sounds library as a board of orbs: tap one to hear it, filter by free or Pro and by kind, set
 * the volume, and copy the one line that plays it. Every sound plays for everyone. A Pro sound's
 * code, install command and file open with Pro. Everything is synthesised in the browser.
 */
export function SoundBoard({
  source,
  usedBy,
  installFree,
  installPro,
}: {
  /** The free ui-sounds.ts file, shown in full. */
  source: string;
  /** Which components play each free sound, found by scanning their source at build time. */
  usedBy: Record<string, Used>;
  installFree: string;
  installPro: string;
}) {
  const reduce = useReducedMotion();
  const { isPro, requestUpgrade } = useProAccess();
  const [access, setAccess] = React.useState<Access>("all");
  const [filter, setFilter] = React.useState<Category | "All">("All");
  const [selected, setSelected] = React.useState<string>("pop");
  const [hits, setHits] = React.useState<Record<string, number>>({});
  const [volume, setVolume] = React.useState(0.8);
  const [showFile, setShowFile] = React.useState(false);
  const [proFile, setProFile] = React.useState<{ state: "idle" | "loading" | "ready" | "error"; text: string }>({ state: "idle", text: "" });

  // The Pro recipes ship as their own chunk and load the first time one is played or approached.
  const proModule = React.useRef<Promise<typeof import("@/lib/ui-sounds-pro")> | null>(null);
  const loadPro = () => (proModule.current ??= import("@/lib/ui-sounds-pro"));

  const categories = access === "pro" ? PRO_CATEGORIES : access === "free" ? FREE_CATEGORIES : [...FREE_CATEGORIES, ...PRO_CATEGORIES];
  const inAccess = ITEMS.filter((i) => access === "all" || (access === "pro") === i.pro);
  const visible = filter === "All" ? inAccess : inAccess.filter((i) => i.category === filter);
  const freeCount = ITEMS.filter((i) => !i.pro).length;
  const proCount = ITEMS.length - freeCount;
  const current = ITEMS.find((i) => i.key === selected) ?? ITEMS[0];

  const play = (item: Item) => {
    setSelected(item.key);
    setHits((h) => ({ ...h, [item.key]: (h[item.key] ?? 0) + 1 }));
    if (!item.pro) {
      playSound(item.name as SoundName, 1, true);
      return;
    }
    // Start the audio context inside the tap (Safari needs that), then play once the chunk is in.
    setSoundVolume(volume);
    void loadPro().then((m) => m.playProSound(item.name as ProSoundName, 1, true));
  };

  const changeVolume = (v: number) => {
    setVolume(v);
    setSoundVolume(v);
  };

  const pickAccess = (a: Access) => {
    setAccess(a);
    setFilter("All");
  };

  const showProFile = () => {
    if (proFile.state === "idle" || proFile.state === "error") {
      setProFile({ state: "loading", text: "" });
      fetch("/api/registry/ui-sounds-pro", { credentials: "same-origin", cache: "no-store" })
        .then(async (r) => {
          if (!r.ok) throw new Error("denied");
          const json = (await r.json()) as { files?: { content?: string }[] };
          const text = json.files?.[0]?.content;
          if (!text) throw new Error("empty");
          setProFile({ state: "ready", text });
        })
        .catch(() => setProFile({ state: "error", text: "" }));
    }
    setShowFile((v) => !v);
  };

  const snippet = current.pro ? `playProSound("${current.name}")` : `playSound("${current.name}")`;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const used = !current.pro ? (usedBy[current.name] ?? []) : [];
  const ACCESS: { id: Access; label: string; n: number }[] = [
    { id: "all", label: "All", n: ITEMS.length },
    { id: "free", label: "Free", n: freeCount },
    { id: "pro", label: "Pro", n: proCount },
  ];

  return (
    <div className="rounded-tile bg-[#f5f5f7] p-4 sm:p-6 dark:bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Free or Pro sounds" className="inline-flex h-10 items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_0_0_1px_var(--border)] dark:bg-white/[0.06] dark:shadow-none">
          {ACCESS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={access === a.id}
              onClick={() => pickAccess(a.id)}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                access === a.id ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/[0.06]",
              )}
            >
              {a.id === "pro" && !isPro ? <Lock className="size-3" strokeWidth={2.4} aria-hidden /> : null}
              {a.label}
              <span className={cn("tabular-nums text-[12px]", access === a.id ? "text-background/60" : "text-muted-foreground")}>{a.n}</span>
            </button>
          ))}
        </div>
        <label className="flex h-10 items-center gap-2 rounded-full bg-card px-3 text-muted-foreground shadow-[0_0_0_1px_var(--border)] dark:bg-white/[0.06] dark:shadow-none">
          <VolumeIcon className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => changeVolume(Number(e.target.value))}
            className="w-24 accent-[#1d1d1f] dark:accent-white"
          />
        </label>
      </div>

      <div role="radiogroup" aria-label="Sound kind" className="-mx-1 mt-3 flex max-w-full flex-wrap gap-1">
        {(["All", ...categories] as const).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={filter === c}
            onClick={() => setFilter(c)}
            className={cn(
              "h-10 rounded-full px-3.5 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              filter === c ? "bg-foreground text-background" : "text-foreground hover:bg-foreground/[0.06]",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <motion.ul layout={!reduce} className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" aria-label="Sounds">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => {
            const active = selected === item.key;
            return (
              <motion.li
                key={item.key}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="relative"
              >
                <button
                  type="button"
                  onClick={() => play(item)}
                  onPointerEnter={item.pro ? () => void loadPro() : undefined}
                  aria-label={`Play ${item.label}, ${item.category}${item.pro ? ", Pro" : ""}`}
                  aria-pressed={active}
                  className={cn(
                    "group flex w-full flex-col items-center gap-3 rounded-[22px] bg-card px-3 pb-4 pt-5 text-center transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "shadow-[0_0_0_1.5px_var(--foreground)]"
                      : "shadow-[0_0_0_1px_var(--border)] hover:shadow-[0_0_0_1px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.35)]",
                  )}
                >
                  <span className="relative grid size-14 place-items-center">
                    {/* one ring per press, keyed so a quick double tap shows two */}
                    <AnimatePresence>
                      {hits[item.key] && !reduce ? (
                        <motion.span
                          key={hits[item.key]}
                          aria-hidden
                          className="absolute inset-0 rounded-full"
                          style={{ background: ORB[item.category] }}
                          initial={{ scale: 1, opacity: 0.45 }}
                          animate={{ scale: 1.9, opacity: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ) : null}
                    </AnimatePresence>
                    <motion.span
                      key={`orb-${hits[item.key] ?? 0}`}
                      aria-hidden
                      className="relative size-14 rounded-full shadow-[inset_0_-6px_12px_rgba(0,0,0,0.18),0_10px_22px_-12px_rgba(0,0,0,0.45)]"
                      style={{ background: ORB[item.category] }}
                      initial={hits[item.key] && !reduce ? { scale: 0.82 } : false}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 520, damping: 14 }}
                    />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold tracking-[-0.2px] text-foreground">{item.label}</span>
                    <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{item.category}</span>
                  </span>
                </button>
                {item.pro ? <ProBadge className="pointer-events-none absolute right-3 top-3" /> : null}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>

      <div className="mt-5 rounded-[20px] bg-card p-4 shadow-[0_0_0_1px_var(--border)] sm:p-5 dark:bg-white/[0.04] dark:shadow-none">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="text-[17px] font-semibold tracking-[-0.3px] text-foreground">{current.label}</p>
          <span className="text-[13px] text-muted-foreground">{current.category}</span>
          {current.pro ? <ProBadge /> : <span className="rounded-full bg-[#34c759]/12 px-2.5 py-0.5 text-[12px] font-semibold text-[#248a3d] dark:text-[#30d158]">Free</span>}
        </div>

        {!current.pro && used.length ? (
          <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
            Used by{" "}
            {used.slice(0, 8).map((u, i) => (
              <React.Fragment key={u.slug}>
                {i ? ", " : ""}
                <Link href={`/components/${u.slug}`} className="font-medium text-foreground underline-offset-4 hover:underline">
                  {u.name}
                </Link>
              </React.Fragment>
            ))}
            {used.length > 8 ? ` and ${used.length - 8} more` : ""}.
          </p>
        ) : !current.pro ? (
          <p className="mt-2 text-[13.5px] text-muted-foreground">No component plays this one yet. It is there for your own app.</p>
        ) : null}

        {current.pro && !isPro ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="max-w-[560px] text-[13.5px] leading-relaxed text-muted-foreground">
              Every Pro sound plays here. The code, the install command and the file come with Pro, together with every Pro component, block and template.
            </p>
            <button
              type="button"
              onClick={() => requestUpgrade("The Pro sound pack")}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-action px-4 text-[14px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Lock className="size-4" aria-hidden />
              Unlock the Pro pack
            </button>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <CopyPill text={snippet} />
            <button
              type="button"
              aria-expanded={showFile}
              onClick={current.pro ? showProFile : () => setShowFile((v) => !v)}
              className="h-10 rounded-full bg-card px-4 text-[13.5px] font-medium text-link shadow-[0_0_0_1px_var(--border)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.06] dark:shadow-none"
            >
              {showFile ? "Hide " : ""}
              {current.pro ? "ui-sounds-pro.ts" : "ui-sounds.ts"}
            </button>
          </div>
        )}
        <p className="mt-3 text-[13px] text-muted-foreground">
          {current.pro ? (
            isPro ? (
              <>
                Install with <code className="font-mono text-foreground">{installPro}</code>. It brings <code className="font-mono text-foreground">ui-sounds</code> with it.
              </>
            ) : (
              "Part of the Pro sound pack: 24 more sounds in four sets."
            )
          ) : (
            <>
              Install with <code className="font-mono text-foreground">{installFree}</code>.
            </>
          )}
        </p>
      </div>

      <p className="mt-3 text-[13px] text-muted-foreground">
        {freeCount} free and {proCount} Pro sounds, synthesised in the browser. No audio files.
      </p>

      <AnimatePresence initial={false}>
        {showFile && (!current.pro || isPro) ? (
          <motion.div
            key={current.pro ? "pro-file" : "file"}
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            {current.pro && proFile.state !== "ready" ? (
              <p className="mt-4 rounded-[20px] bg-card px-5 py-4 text-[14px] text-muted-foreground shadow-[0_0_0_1px_var(--border)]">
                {proFile.state === "error" ? "Could not load the file. Sign in again and retry, or install it with the command above." : "Loading the file…"}
              </p>
            ) : (
              <div className="mt-4 max-h-[560px] overflow-auto rounded-[20px]">
                <CodeBlock
                  code={current.pro ? proFile.text : source}
                  language="ts"
                  theme="dark"
                  header={{
                    enabled: true,
                    showDots: true,
                    title: current.pro ? "lib/ui-sounds-pro.ts" : "lib/ui-sounds.ts",
                    copy: { enabled: true, label: "Copy file", copiedLabel: "Copied", copiedDurationMs: 1400 },
                  }}
                  codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                  border={{ radius: "20px" }}
                />
              </div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CopyPill({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1d1d1f] pl-4 pr-1.5 dark:bg-white/[0.08]">
      <code className="font-mono text-[14px] text-white">{text}</code>
      <button
        type="button"
        onClick={() => navigator.clipboard?.writeText(text).then(() => setCopied(true), () => {})}
        className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/15 px-3 text-[13px] font-medium text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
        <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
      </button>
    </span>
  );
}
