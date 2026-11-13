"use client";

import * as React from "react";
import { Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/track";
import type { DisplayPricing } from "@/lib/pricing";
import { UpgradeDialog } from "@/components/pro/upgrade-dialog";
import { AutoProPrompt, PRO_SEEN_KEY } from "@/components/pro/auto-pro-prompt";

type ProAccess = {
  /** The visitor has Pro (an active plan or All-Access). */
  isPro: boolean;
  /** Which plan: "yearly" is Pro, "lifetime" is All-Access, "free" is neither. */
  plan: "free" | "yearly" | "lifetime";
  /** How many components are Pro (for "N more" copy). */
  proCount: number;
  /**
   * Opens the upgrade dialog, naming the component the visitor tried to use and, when the thing
   * that's Pro is a feature of an otherwise free component, that feature ("build prompt").
   */
  requestUpgrade: (name?: string, feature?: string) => void;
  /** The visitor's regional prices, where the page knows them (left out on statically rendered pages). */
  pricing?: DisplayPricing;
};

/** Event a free copy action sends, so a nearby "this one stays free" line can show. */
export const COPIED_EVENT = "nx:copied";

/** Tell the page a visitor just copied something free (code, a prompt, an install command). */
export function announceCopy() {
  try {
    window.dispatchEvent(new Event(COPIED_EVENT));
  } catch {
    // old browsers without the Event constructor: the line just doesn't show
  }
}

const ProAccessContext = React.createContext<ProAccess>({
  isPro: false,
  plan: "free",
  proCount: 0,
  requestUpgrade: () => {
    window.location.assign("/pricing");
  },
});

export function useProAccess() {
  return React.useContext(ProAccessContext);
}

/** True when this item is Pro and the visitor doesn't have Pro. */
export function useLocked(premium: boolean | undefined) {
  const { isPro } = useProAccess();
  return !!premium && !isPro;
}

/**
 * Knows whether the visitor has Pro and owns the one upgrade dialog every locked action opens.
 * Mounted once by the site shell.
 */
export function ProAccessProvider({
  isPro,
  plan = isPro ? "yearly" : "free",
  proCount,
  pricing,
  children,
}: {
  isPro: boolean;
  plan?: ProAccess["plan"];
  proCount: number;
  pricing?: DisplayPricing;
  children: React.ReactNode;
}) {
  const [target, setTarget] = React.useState<{ name?: string; feature?: string; source?: string } | null>(null);
  // The timed offer (see AutoProPrompt) opens the same dialog, with its own source for the checkout count.
  const openAuto = React.useCallback(() => setTarget({ source: "auto_prompt" }), []);
  const value = React.useMemo<ProAccess>(
    () => ({ isPro, plan, proCount, pricing, requestUpgrade: (name, feature) => {
        // Which locked thing, and which part of it ("build prompt", "icon code"...), made someone want Pro.
        trackEvent("pro_wall_hit", { item: name ?? "", feature: feature ?? "" });
        // Someone who has seen the offer by clicking something locked doesn't need it to show itself as well.
        try {
          window.sessionStorage.setItem(PRO_SEEN_KEY, "1");
        } catch {
          // storage blocked: the timed offer may still show once
        }
        setTarget({ name, feature });
      },
    }),
    [isPro, plan, proCount, pricing],
  );

  return (
    <ProAccessContext.Provider value={value}>
      {children}
      {isPro ? null : <AutoProPrompt proCount={proCount} onOpen={openAuto} />}
      <UpgradeDialog
        open={!!target}
        name={target?.name}
        feature={target?.feature}
        proCount={proCount}
        pricing={pricing}
        source={target?.source}
        onClose={() => setTarget(null)}
      />
    </ProAccessContext.Provider>
  );
}

type CopyState = "idle" | "loading" | "copied" | "error";

/**
 * Copies a component's build prompt (free on free components, Pro on Pro ones). Visitors without Pro get the upgrade dialog;
 * the server checks again and answers 403 if the session has no access, which also opens the
 * dialog. The clipboard write starts inside the click (a ClipboardItem holding the pending
 * fetch), so Safari keeps the user activation it needs.
 *
 * `free` marks a free component: its prompt is a plain public file (`/free-prompts/<slug>`), so
 * there is no server check, no sign-in and no licence line. Pro prompts still come from the gated
 * `/api/prompt/<slug>`.
 *
 * Options, for things other than components: `endpoint` is the gated API to fetch (default
 * `/api/prompt/<slug>`), and `hasAccess` replaces the site-wide Pro check (a template bought on its
 * own unlocks its prompt without a plan). Without access, nothing is fetched.
 */
export function useCopyBuildPrompt(
  slug: string,
  name: string,
  /**
   * Where the prompt comes from (block sections use /api/prompt/blocks/<id>), or options:
   * `endpoint` plus `hasAccess`, which replaces the site-wide Pro check (templates use it).
   */
  options: string | { endpoint?: string; hasAccess?: boolean; free?: boolean } = {},
): [CopyState, () => void] {
  const opts = typeof options === "string" ? { endpoint: options } : options;
  const { isPro: sitePro, requestUpgrade } = useProAccess();
  const isPro = opts.hasAccess ?? sitePro;
  const endpoint = opts.endpoint ?? (opts.free ? `/free-prompts/${encodeURIComponent(slug)}` : `/api/prompt/${encodeURIComponent(slug)}`);
  const [state, setState] = React.useState<CopyState>("idle");

  React.useEffect(() => {
    if (state !== "copied" && state !== "error") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  const copy = React.useCallback(() => {
    if (!isPro) return requestUpgrade(name, "build prompt");
    setState("loading");
    let denied = false;
    const plain = endpoint.startsWith("/free-prompts/");
    const text = fetch(endpoint, plain ? undefined : { credentials: "same-origin", cache: "no-store" }).then(async (r) => {
      if (r.status === 401 || r.status === 403) {
        denied = true;
        throw new Error("denied");
      }
      if (!r.ok) throw new Error("failed");
      if (plain) {
        const body = await r.text();
        if (!body.trim()) throw new Error("empty");
        return body;
      }
      const json = (await r.json()) as { prompt?: string };
      if (!json.prompt) throw new Error("empty");
      return json.prompt;
    });
    const write =
      typeof ClipboardItem !== "undefined" && navigator.clipboard?.write
        ? navigator.clipboard.write([new ClipboardItem({ "text/plain": text.then((t) => new Blob([t], { type: "text/plain" })) })])
        : text.then((t) => navigator.clipboard.writeText(t));
    write
      .then(() => {
        setState("copied");
        announceCopy();
      })
      .catch(() => {
        if (denied) {
          setState("idle");
          requestUpgrade(name, "build prompt");
        } else setState("error");
      });
  }, [isPro, requestUpgrade, name, endpoint]);

  return [state, copy];
}

/** Shows `pro` to members and `otherwise` to everyone else, for copy that should change with the plan. */
export function IfPro({ pro, otherwise = null }: { pro: React.ReactNode; otherwise?: React.ReactNode }) {
  const { isPro } = useProAccess();
  return <>{isPro ? pro : otherwise}</>;
}

/** A green note for members only, such as "you have Pro, here's your next step". */
export function ProNote({ className, children }: { className?: string; children: React.ReactNode }) {
  const { isPro } = useProAccess();
  if (!isPro) return null;
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-2xl bg-[#34c759]/12 p-3.5 text-[14px] leading-relaxed text-foreground",
        className,
      )}
    >
      <LockOpen className="mt-0.5 size-4 shrink-0 text-[#248a3d] dark:text-[#30d158]" aria-hidden />
      <div>{children}</div>
    </div>
  );
}

/** The small green tag that replaces the Pro lock once the visitor has Pro. */
export function UnlockedBadge({
  className,
  onDark = false,
  label = "Unlocked",
}: {
  className?: string;
  onDark?: boolean;
  label?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
        onDark ? "bg-[#30d158]/25 text-[#7ee2a8] backdrop-blur-md" : "bg-[#248a3d] text-white dark:bg-[#30d158] dark:text-[#04230f]",
        className,
      )}
    >
      <LockOpen className="size-3" strokeWidth={2.4} aria-hidden />
      {label}
    </span>
  );
}

/**
 * The small Pro tag shown on Pro tiles and pages. Visitors without Pro see the locked tag; once
 * they have Pro the same spot turns into a green "Unlocked", so every Pro item reads as theirs.
 */
export function ProBadge({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const { isPro } = useProAccess();
  if (isPro) return <UnlockedBadge className={className} onDark={onDark} />;
  return <ProMark className={className} onDark={onDark} />;
}

/**
 * The Pro tag itself, the one look used on every page: a dark pill with a thin amber-to-violet-to-blue ring
 * and a gold lock. It reads as the premium tier without adding a size, a motion or a colour fill that fights
 * the preview behind it. It does not look at the visitor's plan: use ProBadge where a member should see
 * "Unlocked" instead, and pass `lock={false}` where the tag names a plan the visitor is on (nothing is locked).
 */
export function ProMark({ className, onDark = false, lock = true }: { className?: string; onDark?: boolean; lock?: boolean }) {
  const fill = onDark ? "rgba(29,29,31,0.55)" : "#1d1d1f";
  return (
    <span
      style={{
        background: `linear-gradient(${fill}, ${fill}) padding-box, linear-gradient(120deg, #ffb340, #ff6482 38%, #bf5af2 68%, #0a84ff) border-box`,
        border: "1px solid transparent",
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-[9px] py-[3px] text-[11.5px] font-semibold tracking-[0.01em] text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)]",
        onDark && "backdrop-blur-md",
        className,
      )}
    >
      {lock ? <Lock className="size-3 text-[#ffc65c]" strokeWidth={2.5} aria-hidden /> : null}
      Pro
    </span>
  );
}

/** Free, Pro or Unlocked, for list rows where the tag sits beside a title. */
export function AccessTag({ premium, className }: { premium: boolean; className?: string }) {
  const { isPro } = useProAccess();
  if (premium && isPro) return <UnlockedBadge className={cn("px-2.5 py-0.5 text-[12px]", className)} />;
  if (premium) return <ProMark className={cn("py-0.5 text-[12px]", className)} />;
  return (
    <span className={cn("rounded-full bg-[#34c759]/12 px-2.5 py-0.5 text-[12px] font-semibold text-[#248a3d] dark:text-[#30d158]", className)}>
      Free
    </span>
  );
}

/**
 * Keeps something visible but unusable for visitors without Pro: the content is dimmed and inert
 * (no clicks, focus or selection), and one overlay button on top opens the upgrade dialog.
 * Renders the children untouched when the visitor has access.
 */
export function ProLock({
  locked,
  name,
  label = "Unlock with Pro",
  className,
  followScroll = false,
  children,
}: {
  locked: boolean;
  name: string;
  label?: string;
  className?: string;
  /** For tall sections: the button stays in the middle of the screen while you scroll through, instead of sitting at the middle of the section where it can be off-screen. */
  followScroll?: boolean;
  children: React.ReactNode;
}) {
  const { requestUpgrade } = useProAccess();
  if (!locked) return <>{children}</>;
  return (
    <div className={cn("relative", className)}>
      <div inert aria-hidden className="pointer-events-none select-none opacity-45 blur-[1.5px] saturate-50">
        {children}
      </div>
      <button
        type="button"
        onClick={() => requestUpgrade(name)}
        className={cn(
          "group/lock absolute inset-0 rounded-[inherit] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          followScroll ? "flex items-start justify-center pt-6" : "grid place-items-center",
        )}
      >
        <span className={cn("inline-flex h-10 items-center gap-2 rounded-full bg-card px-4 text-[14px] font-semibold text-foreground shadow-[0_0_0_0.5px_var(--border),0_10px_28px_-12px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover/lock:scale-[1.04] group-active/lock:scale-[0.97]", followScroll && "sticky top-[calc(50vh-20px)]")}>
          <Lock className="size-4" strokeWidth={2.4} aria-hidden />
          {label}
        </span>
      </button>
    </div>
  );
}
