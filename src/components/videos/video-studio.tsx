"use client";

import * as React from "react";
import Link from "next/link";
import { Check, Copy, Lock, RotateCcw } from "lucide-react";
import { useProAccess } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";
import type { VideoEntry, VideoPart } from "@/lib/catalog/videos";
import { VideoPlayer } from "./video-player";
import { useVideoFile } from "./use-video-file";

type Tab = "overview" | "customize" | "prompt" | "source";
const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "customize", label: "Customize" },
  { id: "prompt", label: "Prompt" },
  { id: "source", label: "Source" },
];

const PERKS = [
  "The full prompt that builds this video",
  "The React source: one file plus a small shared kit",
  "Live editing of every word and colour, right here",
  "Its original soundtrack, cut to the picture",
  "A render script that exports your edit as MP4",
];

/**
 * A video's page: the live player on the left, and on the right what comes with it: an overview,
 * live editing of its copy, the build prompt and the source. The two free videos are open; for the
 * rest the editing, the prompt and the source ask for Pro (the server checks again for the files).
 */
export function VideoStudio({ video, defaults }: { video: VideoEntry; defaults: Record<string, string> }) {
  const { isPro, requestUpgrade } = useProAccess();
  const unlocked = !video.premium || isPro;
  const [tab, setTab] = React.useState<Tab>("overview");
  const [values, setValues] = React.useState<Record<string, string>>(defaults);
  const edited = video.fields.some((f) => values[f.key] !== defaults[f.key]);

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(300px,380px)_1fr] lg:gap-14">
      <div className="mx-auto w-full max-w-[380px] lg:sticky lg:top-24">
        <div className="rounded-[40px] bg-foreground/[0.06] p-2.5 shadow-[0_0_0_0.5px_var(--border),0_40px_80px_-40px_rgba(0,0,0,0.45)]">
          <VideoPlayer slug={video.slug} duration={video.duration} posterAt={video.posterAt} values={values} autoPlay className="rounded-[32px]" />
        </div>
        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          {video.duration} seconds · {video.bpm} BPM · press the speaker for sound
        </p>
      </div>

      <div className="min-w-0">
        <div role="tablist" aria-label="Video details" className="inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-foreground/[0.06] p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`vtab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`vpanel-${t.id}`}
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-[14px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                tab === t.id ? "bg-card text-foreground shadow-sm" : "text-foreground/65 hover:text-foreground",
              )}
            >
              {t.label}
              {!unlocked && t.id !== "overview" ? <Lock className="size-3 text-muted-foreground" aria-hidden /> : null}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`vpanel-${tab}`} aria-labelledby={`vtab-${tab}`} className="mt-6">
          {tab === "overview" ? <Overview video={video} unlocked={unlocked} onTab={setTab} /> : null}
          {tab === "customize" ? (
            <Customize
              video={video}
              values={values}
              unlocked={unlocked}
              edited={edited}
              onChange={(k, v) => setValues((s) => ({ ...s, [k]: v }))}
              onReset={() => setValues(defaults)}
              onLocked={() => requestUpgrade(video.title, "live editing")}
            />
          ) : null}
          {tab === "prompt" ? <FileView video={video} unlocked={unlocked} files={[{ part: "prompt", label: "Build prompt" }]} intro="Paste this into Claude, Cursor or any coding agent to build the video from scratch." /> : null}
          {tab === "source" ? (
            <FileView
              video={video}
              unlocked={unlocked}
              files={[
                { part: "source", label: `${video.slug}.tsx` },
                { part: "kit", label: "kit.ts" },
                { part: "frame", label: "frame.tsx" },
                { part: "render", label: "render.mjs" },
              ]}
              intro="One file per video plus a small shared kit. The frame page and render script turn your edit into an MP4."
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Overview({ video, unlocked, onTab }: { video: VideoEntry; unlocked: boolean; onTab: (t: Tab) => void }) {
  return (
    <div className="grid gap-5">
      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          ["For", video.purpose],
          ["Motion", video.motion],
          ["Made for", video.app],
          ["Length", `${video.duration}s, 9:16`],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-foreground/[0.05] px-3.5 py-3">
            <dt className="text-[11.5px] font-semibold text-muted-foreground">{k}</dt>
            <dd className="mt-0.5 text-[13.5px] font-medium leading-snug text-foreground">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="rounded-[20px] bg-foreground/[0.05] p-5">
        <p className="text-[14px] font-semibold text-foreground">{unlocked ? "Yours to use" : "With Pro you get"}</p>
        <ul className="mt-3 grid gap-2 text-[14px] text-foreground/80">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2.5">
              <Check className={cn("mt-0.5 size-4 shrink-0", unlocked ? "text-[#248a3d] dark:text-[#30d158]" : "text-action")} strokeWidth={2.6} aria-hidden />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {unlocked ? (
          <>
            <button type="button" onClick={() => onTab("customize")} className="h-11 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Make it yours
            </button>
            <button type="button" onClick={() => onTab("prompt")} className="h-11 rounded-full bg-foreground/[0.07] px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-foreground/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Copy the prompt
            </button>
          </>
        ) : (
          <>
            <Link href="/pricing" className="inline-flex h-11 items-center rounded-full bg-action px-5 text-[14px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Get the prompt and source
            </Link>
            <button type="button" onClick={() => onTab("customize")} className="h-11 rounded-full bg-foreground/[0.07] px-5 text-[14px] font-semibold text-foreground transition-colors hover:bg-foreground/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              See what you can edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Customize({
  video,
  values,
  unlocked,
  edited,
  onChange,
  onReset,
  onLocked,
}: {
  video: VideoEntry;
  values: Record<string, string>;
  unlocked: boolean;
  edited: boolean;
  onChange: (key: string, value: string) => void;
  onReset: () => void;
  onLocked: () => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-muted-foreground">
          {unlocked ? "Change any word or colour. The video on the left redraws as you type." : "Every word and colour is editable with Pro. Here is what you would change."}
        </p>
        {unlocked && edited ? (
          <button type="button" onClick={onReset} className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-foreground/[0.07] px-3.5 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <RotateCcw className="size-3.5" aria-hidden />
            Reset
          </button>
        ) : null}
      </div>
      <div className="relative">
        <div className={cn("grid gap-3.5 sm:grid-cols-2", !unlocked && "pointer-events-none select-none opacity-55")} aria-hidden={!unlocked}>
          {video.fields.map((f) => {
            const id = `vf-${video.slug}-${f.key}`;
            const wide = f.type === "text" && (f.max === undefined || f.max > 28);
            return (
              <div key={f.key} className={cn("grid gap-1.5", wide && "sm:col-span-2")}>
                <label htmlFor={id} className="text-[12.5px] font-medium text-foreground/80">
                  {f.label}
                </label>
                {f.type === "color" ? (
                  <div className="flex items-center gap-2.5">
                    <input id={id} type="color" disabled={!unlocked} value={values[f.key] ?? "#000000"} onChange={(e) => onChange(f.key, e.target.value)} className="size-10 cursor-pointer rounded-xl border border-border bg-transparent p-1" />
                    <span className="text-[13px] tabular-nums text-muted-foreground">{values[f.key]}</span>
                  </div>
                ) : (
                  <input
                    id={id}
                    type="text"
                    disabled={!unlocked}
                    tabIndex={unlocked ? 0 : -1}
                    maxLength={f.type === "text" ? f.max : undefined}
                    value={values[f.key] ?? ""}
                    onChange={(e) => onChange(f.key, e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-card px-3 text-[14px] text-foreground outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring"
                  />
                )}
              </div>
            );
          })}
        </div>
        {!unlocked ? (
          <div className="absolute inset-0 grid place-items-center">
            <button type="button" onClick={onLocked} className="inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-[14px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,113,227,0.6)] transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Lock className="size-4" aria-hidden />
              Edit with Pro
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const SKELETON = ["w-2/3", "w-5/6", "w-1/2", "w-3/4", "w-2/5", "w-4/5", "w-3/5", "w-5/6", "w-1/3", "w-2/3", "w-3/4", "w-1/2"];

function FileView({ video, unlocked, files, intro }: { video: VideoEntry; unlocked: boolean; files: { part: VideoPart; label: string }[]; intro: string }) {
  const { requestUpgrade } = useProAccess();
  const [active, setActive] = React.useState(0);
  const file = files[active];
  const state = useVideoFile(video.slug, file.part, unlocked, video.title);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  if (!unlocked) {
    return (
      <div className="relative overflow-hidden rounded-[20px] bg-foreground/[0.05] p-5">
        <div aria-hidden className="grid gap-2.5 opacity-60">
          {SKELETON.map((w, i) => (
            <div key={i} className={cn("h-3 rounded-full bg-foreground/[0.12]", w)} />
          ))}
        </div>
        <div className="absolute inset-0 grid place-items-center bg-gradient-to-t from-background/80 via-background/40 to-transparent p-6 text-center">
          <div>
            <p className="text-[16px] font-semibold text-foreground">The {file.part === "prompt" ? "prompt" : "source"} comes with Pro</p>
            <p className="mx-auto mt-1.5 max-w-[320px] text-[14px] text-muted-foreground">
              {file.part === "prompt" ? "The exact brief behind this video, written so a coding agent can rebuild it shot for shot." : "The React file, the shared kit and the script that renders your edit to MP4."}
            </p>
            <button type="button" onClick={() => requestUpgrade(video.title, file.part === "prompt" ? "build prompt" : "source")} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-action px-5 text-[14px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              <Lock className="size-4" aria-hidden />
              Unlock with Pro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-[460px] text-[14px] text-muted-foreground">{intro}</p>
        <button
          type="button"
          disabled={state.status !== "ready"}
          onClick={() => navigator.clipboard.writeText(state.text).then(() => setCopied(true)).catch(() => {})}
          className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[13.5px] font-semibold text-background transition-opacity hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? "Copied" : `Copy ${files.length > 1 ? "file" : "prompt"}`}
        </button>
      </div>
      {files.length > 1 ? (
        <div role="tablist" aria-label="Files" className="flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <button
              key={f.part}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={cn("h-8 rounded-full px-3 font-mono text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", i === active ? "bg-foreground text-background" : "bg-foreground/[0.07] text-foreground/75 hover:text-foreground")}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <pre
        className={cn(
          "m-0 max-h-[520px] overflow-auto rounded-[20px] bg-foreground/[0.05] p-5 text-[13px] leading-[1.6] text-foreground",
          file.part === "prompt" ? "whitespace-pre-wrap font-sans text-[13.5px]" : "font-mono",
        )}
        tabIndex={0}
      >
        {state.status === "ready" ? state.text : state.status === "error" ? "Couldn't load this file. Try again in a moment." : "Loading…"}
      </pre>
      {file.part === "source" ? (
        <p className="text-[13px] text-muted-foreground">
          The images it uses (the screenshots and tiles) are public files in <span className="font-mono">/videos/assets</span>; copy them next to the video file.
        </p>
      ) : null}
    </div>
  );
}
