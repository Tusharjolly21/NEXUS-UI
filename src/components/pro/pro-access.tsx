"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_ICON_COUNT } from "@/lib/icons/count";

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
};

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
  children,
}: {
  isPro: boolean;
  plan?: ProAccess["plan"];
  proCount: number;
  children: React.ReactNode;
}) {
  const [target, setTarget] = React.useState<{ name?: string; feature?: string } | null>(null);
  const value = React.useMemo<ProAccess>(
    () => ({ isPro, plan, proCount, requestUpgrade: (name, feature) => setTarget({ name, feature }) }),
    [isPro, plan, proCount],
  );

  return (
    <ProAccessContext.Provider value={value}>
      {children}
      <UpgradeDialog open={!!target} name={target?.name} feature={target?.feature} proCount={proCount} onClose={() => setTarget(null)} />
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
      .then(() => setState("copied"))
      .catch(() => {
        if (denied) {
          setState("idle");
          requestUpgrade(name, "build prompt");
        } else setState("error");
      });
  }, [isPro, requestUpgrade, name, endpoint]);

  return [state, copy];
}

const PERKS = [
  "The full source, yours to edit",
  "One-line install with the shadcn CLI",
  "The live playground and copy-ready code",
  "Build prompts to recreate them with your AI agent",
];

function UpgradeDialog({
  open,
  name,
  feature,
  proCount,
  onClose,
}: {
  open: boolean;
  name?: string;
  feature?: string;
  proCount: number;
  onClose: () => void;
}) {
  const title = feature ? `The ${name ? `${name} ` : ""}${feature} comes with Pro` : name ? `${name} comes with Pro` : "This comes with Pro";
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[90] bg-black/50 sm:bg-black/30 sm:backdrop-blur-md transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:bg-black/60 sm:dark:bg-black/60" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-[91] w-[min(420px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-[28px] bg-card p-7 text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_40px_80px_-30px_rgba(0,0,0,0.45)] outline-none transition-[opacity,transform,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_40px_80px_-30px_rgba(0,0,0,0.8)]">
          <span
            aria-hidden
            className="mx-auto grid size-16 place-items-center rounded-[20px] bg-[conic-gradient(from_210deg,#0071e3,#bf5af2,#ff375f,#ff9f0a,#0071e3)] text-white shadow-[0_12px_28px_-10px_rgba(0,113,227,0.55)]"
          >
            <span className="grid size-[58px] place-items-center rounded-[17px] bg-[#1d1d1f]/15 backdrop-blur-sm">
              <Lock className="size-7" strokeWidth={2.2} />
            </span>
          </span>
          <DialogPrimitive.Title className="mt-5 text-[24px] font-semibold leading-tight tracking-[-0.025em] text-foreground">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mx-auto mt-2.5 max-w-[320px] text-[15px] leading-[1.5] text-muted-foreground">
            {feature?.startsWith("icon")
              ? `You can preview and play every icon, and the ${FREE_ICON_COUNT} free ones are yours to copy. Pro unlocks the code and sound of every Pro icon, every Pro component, every template and the premium blocks.`
              : feature === "full-screen preview"
                ? "You can still try it on the page."
                : "You can preview every component."}
            {feature?.startsWith("icon") ? null : ` Pro unlocks ${proCount ? `all ${proCount} Pro components` : "every Pro component"}, every template and the premium blocks.`}
          </DialogPrimitive.Description>

          <ul className="mx-auto mt-6 grid max-w-[300px] gap-2.5 text-left">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-[14px] text-foreground">
                <span className="mt-[1px] grid size-[18px] shrink-0 place-items-center rounded-full bg-action text-white">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="mt-7 grid gap-2">
            <Link
              href="/pricing"
              onClick={onClose}
              className="inline-flex h-12 items-center justify-center rounded-full bg-action text-[16px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Upgrade to Pro
            </Link>
            <DialogPrimitive.Close className="inline-flex h-11 items-center justify-center rounded-full text-[15px] font-medium text-link transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Not now
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
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
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-semibold tracking-[-0.01em]",
        onDark ? "bg-white/15 text-white backdrop-blur-md" : "bg-[#1d1d1f] text-white dark:bg-white dark:text-[#1d1d1f]",
        className,
      )}
    >
      <Lock className="size-3" strokeWidth={2.4} aria-hidden />
      Pro
    </span>
  );
}

/** Free, Pro or Unlocked, for list rows where the tag sits beside a title. */
export function AccessTag({ premium, className }: { premium: boolean; className?: string }) {
  const { isPro } = useProAccess();
  if (premium && isPro) return <UnlockedBadge className={cn("px-2.5 py-0.5 text-[12px]", className)} />;
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-0.5 text-[12px] font-semibold",
        premium ? "bg-[#1d1d1f] text-white dark:bg-[#f5f5f7] dark:text-[#1d1d1f]" : "bg-[#34c759]/12 text-[#248a3d] dark:text-[#30d158]",
        className,
      )}
    >
      {premium ? "Pro" : "Free"}
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
