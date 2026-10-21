"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Code2, Lock, Maximize2, Minimize2, Monitor, RotateCcw, SlidersHorizontal, Sparkles } from "lucide-react";
import { CodeBlock } from "@/components/code-block/code-block";
import { UsageSnippet } from "@/components/library/usage-snippet";
import { ProBadge, useCopyBuildPrompt, useProAccess } from "@/components/pro/pro-access";
import { InstallCard } from "@/components/site/install-card";
import { SectionCustomizer } from "./_customize";
import { cn } from "@/lib/utils";

type View = "preview" | "customize" | "code";

/**
 * One section of a block page: a title row with a sliding Preview / Customize / Code switch, the
 * Pro build prompt, replay and full screen; then the live section at its natural height (nothing
 * cropped), its props playground, or the install steps and source.
 */
export function BlockSection({
  id,
  index,
  total,
  title,
  description,
  code,
  usageCode,
  locked = false,
  pro = false,
  block,
  sectionId,
  installCommand,
  children,
}: {
  id: string;
  index: number;
  total: number;
  title: string;
  /** One or two sentences on what the section is, shown under the title (also read by search engines). */
  description?: string;
  code: string;
  usageCode: string;
  locked?: boolean;
  /** Show the Pro badge (a Pro section, whether or not this visitor has Pro). */
  pro?: boolean;
  /** Block page slug, for loading the Customize playground. */
  block?: string;
  /** Section id: the playground entry and the build prompt. */
  sectionId?: string;
  /** shadcn command that installs this section (sent only when unlocked). */
  installCommand?: string;
  children: React.ReactNode;
}) {
  const uid = React.useId();
  const reduce = useReducedMotion();
  const [view, setView] = React.useState<View>("preview");
  const [run, setRun] = React.useState(0);
  const [full, setFull] = React.useState(false);

  React.useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [full]);

  const tabs: { value: View; label: string; icon: React.ReactNode }[] = [
    { value: "preview", label: "Preview", icon: <Monitor className="size-3.5" aria-hidden /> },
    ...(block && sectionId
      ? [
          {
            value: "customize" as const,
            label: "Customize",
            icon: locked ? <Lock className="size-3.5" aria-hidden /> : <SlidersHorizontal className="size-3.5" aria-hidden />,
          },
        ]
      : []),
    {
      value: "code",
      label: "Code",
      icon: locked ? <Lock className="size-3.5" aria-hidden /> : <Code2 className="size-3.5" aria-hidden />,
    },
  ];

  return (
    <section id={id} aria-labelledby={`${uid}-title`} className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-[13px] font-medium tabular-nums text-muted-foreground">
            {index} of {total}
            {pro ? <ProBadge className="px-2 py-0.5 text-[11px]" /> : null}
          </p>
          <h2 id={`${uid}-title`} className="mt-1 text-[28px] font-semibold leading-[1.1] tracking-[-0.025em] text-foreground">
            <a href={`#${id}`} className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              {title}
            </a>
          </h2>
          {description ? <p className="mt-2 max-w-[640px] text-[15px] leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="tablist"
            aria-label={`${title} view`}
            className={cn("relative grid rounded-[10px] bg-foreground/[0.07] p-[3px]", tabs.length === 3 ? "grid-cols-3" : "grid-cols-2")}
          >
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                role="tab"
                aria-selected={view === t.value}
                onClick={() => setView(t.value)}
                className={cn(
                  "relative z-10 flex h-9 items-center justify-center gap-1.5 rounded-[8px] px-3 text-[13px] font-medium sm:px-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  view === t.value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {view === t.value ? (
                  <motion.span
                    layoutId={`${uid}-tab`}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-[8px] bg-card shadow-[0_2px_6px_rgba(0,0,0,0.1),0_0_0_0.5px_rgba(0,0,0,0.04)]"
                  />
                ) : null}
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
          {sectionId ? <PromptButton sectionId={sectionId} title={title} /> : null}
          <IconButton label={`Replay ${title}`} onClick={() => setRun((r) => r + 1)}>
            <RotateCcw className="size-4" aria-hidden />
          </IconButton>
          <IconButton label={`Show ${title} full screen`} onClick={() => setFull(true)}>
            <Maximize2 className="size-4" aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait" initial={false}>
          {view === "preview" ? (
            <motion.div
              key="preview"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {full ? (
                <button
                  type="button"
                  aria-label="Close full screen"
                  onClick={() => setFull(false)}
                  className="fixed inset-0 z-[70] cursor-default bg-black/40 backdrop-blur-sm"
                />
              ) : null}
              <div
                className={cn(
                  "overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_0_0_0.5px_var(--border),0_24px_60px_-36px_rgba(0,0,0,0.35)]",
                  full && "fixed inset-3 z-[71] flex flex-col sm:inset-6",
                )}
              >
                {full ? (
                  <div className="flex items-center justify-between px-3 pb-2 pt-1">
                    <p className="text-[14px] font-semibold text-foreground">{title}</p>
                    <IconButton label="Close full screen" onClick={() => setFull(false)}>
                      <Minimize2 className="size-4" aria-hidden />
                    </IconButton>
                  </div>
                ) : null}
                <div
                  key={run}
                  className={cn(
                    "relative isolate overflow-hidden rounded-[22px] bg-background [contain:paint]",
                    "[&>*]:min-h-[560px] [&>*]:w-full",
                    full && "min-h-0 flex-1 overflow-auto",
                  )}
                >
                  {children}
                </div>
              </div>
            </motion.div>
          ) : view === "customize" ? (
            <motion.div
              key="customize"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {locked ? (
                <LockedCode title={title} what="customizing" />
              ) : block && sectionId ? (
                <SectionCustomizer block={block} sectionId={sectionId} title={title} />
              ) : null}
            </motion.div>
          ) : (
            <motion.div
              key="code"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
              transition={{ duration: 0.22 }}
            >
              {locked ? (
                <LockedCode title={title} what="source" />
              ) : (
                <div className="grid max-w-full gap-4 overflow-hidden xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
                  <div className="grid min-w-0 content-start gap-4">
                    {installCommand ? (
                      <div className="rounded-[20px] bg-card p-5 shadow-[0_0_0_0.5px_var(--border)]">
                        <p className="text-[15px] font-semibold text-foreground">1. Install it</p>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
                          Run this in your project. First time? Add the Nexus registry to components.json, as the{" "}
                          <a href="#install" className="font-medium text-link hover:underline">
                            setup guide
                          </a>{" "}
                          shows.
                        </p>
                        <InstallCard wrap command={installCommand} className="mt-3 shadow-none ring-1 ring-border" />
                      </div>
                    ) : null}
                    <UsageSnippet
                      title={installCommand ? "2. Use it" : "Usage"}
                      code={usageCode}
                      description="Copy this into your page. The full source is alongside if you'd rather paste it in by hand."
                    />
                  </div>
                  <div className="min-w-0 max-w-full overflow-hidden rounded-[20px]">
                    <div className="max-h-[720px] max-w-full overflow-auto">
                      <CodeBlock
                        code={code}
                        language="tsx"
                        theme="dark"
                        header={{
                          enabled: true,
                          showDots: true,
                          title: `${title}.tsx`,
                          copy: { enabled: true, label: "Copy code", copiedLabel: "Copied", copiedDurationMs: 1400 },
                        }}
                        codeArea={{ showLineNumbers: true, wrap: false, padding: 18 }}
                        border={{ radius: "20px" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Copies the section's build prompt (Pro for everyone; others get the upgrade dialog). */
function PromptButton({ sectionId, title }: { sectionId: string; title: string }) {
  const { isPro } = useProAccess();
  const [state, copy] = useCopyBuildPrompt(sectionId, title, `/api/prompt/blocks/${encodeURIComponent(sectionId)}`);
  const label =
    state === "loading" ? "Copying…" : state === "copied" ? "Copied" : state === "error" ? "Try again" : "Prompt";
  return (
    <motion.button
      type="button"
      onClick={copy}
      disabled={state === "loading"}
      whileTap={{ scale: 0.95 }}
      title={isPro ? `Copy the build prompt for ${title}` : "Build prompts come with Pro"}
      aria-label={`Copy build prompt for ${title}${isPro ? "" : " (Pro)"}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.11] disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {state === "copied" ? (
        <Check className="size-3.5" aria-hidden />
      ) : isPro ? (
        <Sparkles className="size-3.5" aria-hidden />
      ) : (
        <Lock className="size-3.5" aria-hidden />
      )}
      <span aria-live="polite">{label}</span>
    </motion.button>
  );
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className="grid size-9 place-items-center rounded-full bg-foreground/[0.07] text-foreground/70 transition-colors hover:bg-foreground/[0.11] hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {children}
    </motion.button>
  );
}

/** Decorative stand-in shown blurred behind the lock. Never the real source: locked pages are sent no code. */
const LOCKED_PLACEHOLDER = `"use client";

import { motion } from "framer-motion";

export function Section(props: SectionProps) {
  const [active, setActive] = useState(0);
  return (
    <section className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <motion.div layout className="grid gap-6 md:grid-cols-2">
        {items.map((item, i) => (
          <Card key={item.id} active={i === active} onSelect={() => setActive(i)} />
        ))}
      </motion.div>
    </section>
  );
}`;

function LockedCode({ title, what }: { title: string; what: "source" | "customizing" }) {
  const { requestUpgrade } = useProAccess();
  return (
    <div className="relative overflow-hidden rounded-[28px] bg-card shadow-[0_0_0_0.5px_var(--border)]">
      <div className="pointer-events-none h-56 w-full select-none blur-[10px]" aria-hidden>
        <CodeBlock
          code={LOCKED_PLACEHOLDER}
          language="tsx"
          theme="dark"
          header={{ enabled: false }}
          codeArea={{ showLineNumbers: false, wrap: false, padding: 18 }}
          border={{ radius: "0px" }}
        />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 px-6 text-center backdrop-blur-sm">
        <span className="grid size-12 place-items-center rounded-2xl bg-card shadow-[0_0_0_0.5px_var(--border),0_10px_24px_-12px_rgba(0,0,0,0.3)]">
          <Lock className="size-5 text-foreground" aria-hidden />
        </span>
        <p className="text-[17px] font-semibold text-foreground">
          {what === "source" ? "The source comes with Pro" : "Customizing comes with Pro"}
        </p>
        <p className="max-w-[340px] text-[14px] text-muted-foreground">
          Every block section, with its full source and the shadcn install, for your projects and client work.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => requestUpgrade(title, what === "source" ? "source" : "playground")}
            className="inline-flex h-10 items-center rounded-full bg-action px-5 text-[14px] font-medium text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Upgrade to Pro
          </button>
          <Link
            href="/pricing"
            className="inline-flex h-10 items-center rounded-full px-3 text-[14px] font-medium text-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            See plans
          </Link>
        </div>
      </div>
    </div>
  );
}
