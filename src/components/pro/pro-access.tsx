"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Check, Lock, LockOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_ICON_COUNT } from "@/lib/icons/count";
import { trackEvent } from "@/lib/track";
import type { DisplayPricing } from "@/lib/pricing";
import { CheckoutButton } from "@/components/pricing/checkout-button";

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
  const [target, setTarget] = React.useState<{ name?: string; feature?: string } | null>(null);
  const value = React.useMemo<ProAccess>(
    () => ({ isPro, plan, proCount, pricing, requestUpgrade: (name, feature) => {
        // Which locked thing, and which part of it ("build prompt", "icon code"...), made someone want Pro.
        trackEvent("pro_wall_hit", { item: name ?? "", feature: feature ?? "" });
        setTarget({ name, feature });
      },
    }),
    [isPro, plan, proCount, pricing],
  );

  return (
    <ProAccessContext.Provider value={value}>
      {children}
      <UpgradeDialog
        open={!!target}
        name={target?.name}
        feature={target?.feature}
        proCount={proCount}
        pricing={pricing}
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

const PERKS = [
  "The full source, yours to edit",
  "One-line install with the shadcn CLI",
  "The live playground and copy-ready code",
  "Build prompts to recreate them with your AI agent",
];

/** One plan in the upgrade dialog: its price, what the price covers, and a button straight to checkout. */
function PlanChoice({
  plan,
  name,
  price,
  original,
  discount,
  term,
  cta,
  primary = false,
}: {
  plan: "annual" | "lifetime";
  name: string;
  price: string;
  original: string | null;
  discount: number | null;
  term: string;
  cta: string;
  primary?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-[20px] p-4 text-left",
        primary ? "bg-foreground/[0.04] ring-2 ring-action dark:bg-white/[0.06]" : "bg-foreground/[0.04] ring-1 ring-border dark:bg-white/[0.06]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[14px] font-semibold text-foreground">{name}</span>
        {discount ? (
          <span className="rounded-full bg-[#34c759]/15 px-2 py-0.5 text-[11px] font-semibold text-[#248a3d] dark:text-[#30d158]">{discount}% off</span>
        ) : null}
      </div>
      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-[26px] font-semibold tracking-[-0.03em] text-foreground tabular-nums">{price}</span>
        {original ? <span className="text-[13px] text-muted-foreground line-through tabular-nums">{original}</span> : null}
      </p>
      <p className="text-[12.5px] text-muted-foreground">{term}</p>
      <CheckoutButton plan={plan} source="upgrade_dialog" variant={primary ? "ink" : "white"} className="mt-3 !h-10 !text-[14px]">
        {cta}
      </CheckoutButton>
    </div>
  );
}

function UpgradeDialog({
  open,
  name,
  feature,
  proCount,
  pricing,
  onClose,
}: {
  open: boolean;
  name?: string;
  feature?: string;
  proCount: number;
  pricing?: DisplayPricing;
  onClose: () => void;
}) {
  const title = feature ? `The ${name ? `${name} ` : ""}${feature} comes with Pro` : name ? `${name} comes with Pro` : "This comes with Pro";
  const lead = feature?.startsWith("icon")
    ? `You can preview and play every icon, and the ${FREE_ICON_COUNT} free ones are yours to copy. Pro unlocks the code and sound of every Pro icon, every Pro component, every template and the premium blocks.`
    : `${feature === "full-screen preview" ? "You can still try it on the page." : "You can preview every component."} Pro unlocks ${proCount ? `all ${proCount} Pro components` : "every Pro component"}, every template and the premium blocks.`;
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[90] bg-black/50 sm:bg-black/30 sm:backdrop-blur-md transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:bg-black/60 sm:dark:bg-black/60" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[91] max-h-[calc(100dvh-24px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[28px] bg-card text-center shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_40px_80px_-30px_rgba(0,0,0,0.45)] outline-none transition-[opacity,transform,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:scale-90 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_40px_80px_-30px_rgba(0,0,0,0.8)]",
            pricing ? "w-[min(480px,calc(100vw-24px))] p-5 sm:p-7" : "w-[min(420px,calc(100vw-32px))] p-7",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mx-auto grid place-items-center rounded-[20px] bg-[conic-gradient(from_210deg,#0071e3,#bf5af2,#ff375f,#ff9f0a,#0071e3)] text-white shadow-[0_12px_28px_-10px_rgba(0,113,227,0.55)]",
              pricing ? "size-14" : "size-16",
            )}
          >
            <span className={cn("grid place-items-center rounded-[17px] bg-[#1d1d1f]/15 backdrop-blur-sm", pricing ? "size-[50px]" : "size-[58px]")}>
              <Lock className={pricing ? "size-6" : "size-7"} strokeWidth={2.2} />
            </span>
          </span>
          <DialogPrimitive.Title className="mt-4 text-[22px] font-semibold leading-tight tracking-[-0.025em] text-foreground sm:text-[24px]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mx-auto mt-2 max-w-[360px] text-[14.5px] leading-[1.5] text-muted-foreground">
            {lead}
          </DialogPrimitive.Description>

          {pricing ? (
            <>
              {/* The price, right where someone decided they want it, and a way straight to checkout */}
              <div className="mt-5 grid grid-cols-1 gap-2.5 min-[400px]:grid-cols-2">
                <PlanChoice
                  plan="annual"
                  name="Pro"
                  price={pricing.pro}
                  original={pricing.proOriginal}
                  discount={pricing.proDiscount}
                  term="per year, cancel any time"
                  cta="Get Pro"
                />
                <PlanChoice
                  plan="lifetime"
                  name="All-Access"
                  price={pricing.allAccess}
                  original={pricing.allAccessOriginal}
                  discount={pricing.allAccessDiscount}
                  term="one payment, yours for good"
                  cta="Get All-Access"
                  primary
                />
              </div>
              <p className="mx-auto mt-4 max-w-[380px] text-[13px] leading-relaxed text-muted-foreground">
                Both unlock the same things: the source, one-line install, playground and build prompts for everything.
              </p>
              <div className="mt-3 flex items-center justify-center gap-1">
                <Link
                  href="/pricing"
                  data-plans-source="upgrade_dialog"
                  onClick={onClose}
                  className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium text-link transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Compare plans
                </Link>
                <DialogPrimitive.Close className="inline-flex h-10 items-center rounded-full px-4 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  Not now
                </DialogPrimitive.Close>
              </div>
            </>
          ) : (
            <>
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
                  data-plans-source="upgrade_dialog"
                  onClick={onClose}
                  className="inline-flex h-12 items-center justify-center rounded-full bg-action text-[16px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Upgrade to Pro
                </Link>
                <DialogPrimitive.Close className="inline-flex h-11 items-center justify-center rounded-full text-[15px] font-medium text-link transition-colors hover:bg-foreground/[0.05] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  Not now
                </DialogPrimitive.Close>
              </div>
            </>
          )}
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
