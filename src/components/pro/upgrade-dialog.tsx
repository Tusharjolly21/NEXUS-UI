"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { ArrowRight, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_ICON_COUNT } from "@/lib/icons/count";
import type { DisplayPricing } from "@/lib/pricing";
import { NexusMark } from "@/components/brand/nexus-mark";
import { CheckoutButton } from "@/components/pricing/checkout-button";
import { IndiaFlag } from "@/components/pricing/india-discount-badge";

/**
 * Real Pro components, three rows of them, drifting behind the Nexus mark at the top of the dialog
 * so the offer is something you can see. Screenshots come from /og-shots/components.
 */
const COLLAGE: string[][] = [
  ["dynamic-island", "flight-tracker", "vinyl-player", "spend-donut", "airmail-globe"],
  ["stock-line", "interactive-globe-explorer", "magic-calendar", "weather-puck", "agent-run"],
  ["ripple-now-playing", "wallet-stack", "ai-composer", "receipt-unfold", "flight-tracker"],
];

type PlanKey = "lifetime" | "annual";

function CollageRow({ slugs, reverse, time }: { slugs: string[]; reverse?: boolean; time: string }) {
  const tiles = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 gap-2 pr-2">
      {slugs.map((s, i) => (
        <li
          key={`${s}-${i}`}
          className="relative h-[66px] w-[88px] shrink-0 overflow-hidden rounded-[10px] bg-card shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_6px_14px_-8px_rgba(0,0,0,0.35)] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.08),0_6px_14px_-8px_rgba(0,0,0,0.8)]"
        >
          <Image src={`/og-shots/components/${s}.jpg`} alt="" fill sizes="88px" loading="eager" className="object-cover" draggable={false} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="flex w-max">
      <div
        className="pg-marquee-track flex"
        data-reverse={reverse || undefined}
        style={{ "--pg-marquee-time": time } as React.CSSProperties}
      >
        {tiles(false)}
        {tiles(true)}
      </div>
    </div>
  );
}

/** The moving wall of Pro screenshots with the Nexus UI Pro mark floating in the middle. */
function Collage() {
  return (
    <div
      aria-hidden
      className="relative h-[200px] overflow-hidden rounded-[22px] bg-[#f2f2f4] dark:bg-[#0c0c0e]"
    >
      <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 -rotate-[4deg] scale-[1.08] flex-col gap-2 [mask-image:linear-gradient(90deg,transparent,#000_14%,#000_86%,transparent)]">
        <CollageRow slugs={COLLAGE[0]} time="38s" />
        <CollageRow slugs={COLLAGE[1]} time="46s" reverse />
        <CollageRow slugs={COLLAGE[2]} time="42s" />
      </div>
      {/* a soft vignette so the mark reads on any screenshot */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_50%_50%,rgba(242,242,244,0.85),rgba(242,242,244,0)_70%)] dark:bg-[radial-gradient(60%_70%_at_50%_50%,rgba(12,12,14,0.85),rgba(12,12,14,0)_70%)]" />
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1.5 rounded-[18px] bg-card/80 px-5 py-3.5 shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_18px_40px_-16px_rgba(0,0,0,0.45)] backdrop-blur-xl dark:bg-[#1c1c1e]/80 dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_18px_40px_-16px_rgba(0,0,0,0.9)]">
        <span className="flex items-center gap-2 whitespace-nowrap">
          <NexusMark size={26} className="text-foreground" />
          <span className="text-[19px] font-semibold tracking-[-0.03em] text-foreground">Nexus UI</span>
          <span
            style={{
              background:
                "linear-gradient(#1d1d1f, #1d1d1f) padding-box, linear-gradient(120deg, #ffb340, #ff6482 38%, #bf5af2 68%, #0a84ff) border-box",
              border: "1px solid transparent",
            }}
            className="rounded-full px-2 py-[2px] text-[11px] font-semibold text-white"
          >
            Pro
          </span>
        </span>
        <span className="whitespace-nowrap text-[11px] tracking-[0.01em] text-muted-foreground">Interfaces that feel alive</span>
      </div>
    </div>
  );
}

/** Lifetime or yearly, a two-option switch whose thumb slides between them. */
function PlanSwitch({ value, onChange }: { value: PlanKey; onChange: (v: PlanKey) => void }) {
  const opts: { key: PlanKey; label: string }[] = [
    { key: "lifetime", label: "Lifetime" },
    { key: "annual", label: "Yearly" },
  ];
  return (
    <div role="radiogroup" aria-label="Plan" className="relative grid h-8 grid-cols-2 rounded-full bg-foreground/[0.06] p-[3px] text-[12.5px] font-medium">
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.12),0_0_0_0.5px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none dark:bg-white/15",
          value === "annual" && "translate-x-full",
        )}
      />
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          role="radio"
          aria-checked={value === o.key}
          onClick={() => onChange(o.key)}
          className={cn(
            "relative z-[1] rounded-full px-3.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            value === o.key ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function benefits(proCount: number) {
  return [
    `Source, CLI install and build prompts for ${proCount ? `all ${proCount}` : "every"} Pro component${proCount === 1 ? "" : "s"}`,
    "Every template, section block, video and animated icon",
    "MCP server for Claude Code, Cursor and Codex",
    "Every future release, plus requests and priority support",
  ];
}

export function UpgradeDialog({
  open,
  name,
  feature,
  proCount,
  pricing,
  source = "upgrade_dialog",
  onClose,
}: {
  open: boolean;
  name?: string;
  feature?: string;
  proCount: number;
  pricing?: DisplayPricing;
  /** Where the dialog came from, for the checkout and plans counts: a locked click or the timed offer. */
  source?: string;
  onClose: () => void;
}) {
  const pathname = usePathname() || "/";
  const [plan, setPlan] = React.useState<PlanKey>("lifetime");

  const what = feature ? `the ${feature}${name ? ` for ${name}` : ""}` : name;
  const title = what ? (
    <>
      Unlock {what}
      <br />
      and every Pro piece
    </>
  ) : (
    "Unlock every Pro piece"
  );
  const list = feature?.startsWith("icon")
    ? [`The code and sound of every Pro icon (the ${FREE_ICON_COUNT} free ones stay free)`, ...benefits(proCount).slice(0, 3)]
    : benefits(proCount);

  const lifetime = plan === "lifetime";
  const price = pricing ? (lifetime ? pricing.allAccess : pricing.pro) : null;
  const original = pricing ? (lifetime ? pricing.allAccessOriginal : pricing.proOriginal) : null;
  const term = lifetime ? "lifetime" : "a year";
  const fine = lifetime ? "One payment, never renews." : "Renews yearly, cancel anytime.";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[90] bg-black/45 backdrop-blur-[6px] transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none dark:bg-black/65" />
        <DialogPrimitive.Popup className="fixed left-1/2 top-1/2 z-[91] max-h-[calc(100dvh-24px)] w-[min(440px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[30px] bg-card p-2.5 text-left shadow-[0_0_0_0.5px_rgba(0,0,0,0.08),0_50px_100px_-30px_rgba(0,0,0,0.55)] outline-none transition-[opacity,transform,scale] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[starting-style]:translate-y-[calc(-50%+12px)] data-[starting-style]:scale-[0.96] data-[starting-style]:opacity-0 motion-reduce:transition-none dark:bg-[#161618] dark:shadow-[0_0_0_0.5px_rgba(255,255,255,0.1),0_50px_100px_-30px_rgba(0,0,0,0.9)]">
          <div className="relative">
            <Collage />
            <DialogPrimitive.Close
              aria-label="Close"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-card/80 text-foreground shadow-[0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-md transition-[transform,background-color] hover:bg-card active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-black/50 dark:hover:bg-black/70"
            >
              <X className="size-4" strokeWidth={2.2} />
            </DialogPrimitive.Close>
          </div>

          <div className="px-4 pb-4 pt-5 sm:px-5">
            <DialogPrimitive.Title className="text-[21px] font-semibold leading-[1.18] tracking-[-0.025em] text-foreground sm:text-[22px]">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Nexus UI Pro unlocks the source, install and build prompts for everything in the library.
            </DialogPrimitive.Description>

            <ul className="mt-4 grid gap-2.5">
              {list.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-[14px] leading-[1.45] text-foreground/85">
                  <Check className="mt-[3px] size-[15px] shrink-0 text-foreground" strokeWidth={2.4} aria-hidden />
                  {b}
                </li>
              ))}
            </ul>

            {pricing && price ? (
              <>
                <div className="mt-6 flex items-center justify-between gap-3">
                  <span className="text-[12.5px] font-medium text-muted-foreground">Choose a plan</span>
                  <PlanSwitch value={plan} onChange={setPlan} />
                </div>
                <div className="mt-3 flex flex-col gap-3 rounded-[20px] bg-foreground/[0.035] p-3 pl-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between dark:bg-white/[0.05]">
                  {/* Price on its own line, the usual price and the term under it, so a long regional price
                      (₹3,499 with $79.99 struck through) never runs under the button. */}
                  <p key={plan} className="flex min-w-0 flex-col animate-in fade-in slide-in-from-bottom-1 duration-300 motion-reduce:animate-none">
                    <span className="text-[28px] font-semibold leading-none tracking-[-0.035em] text-foreground tabular-nums">{price}</span>
                    <span className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 text-[13px] leading-tight text-muted-foreground">
                      {original ? (
                        <span className="line-through tabular-nums">
                          <span className="sr-only">Usual price </span>
                          {original}
                        </span>
                      ) : null}
                      <span>{term}</span>
                    </span>
                  </p>
                  <CheckoutButton
                    plan={plan}
                    source={source}
                    returnPath={pathname}
                    variant="ink"
                    className="group/cta !h-11 w-full shrink-0 !px-5 !text-[14.5px] min-[400px]:w-auto"
                  >
                    {lifetime ? "Get All-Access" : "Get Pro"}
                    <ArrowRight className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" strokeWidth={2.2} aria-hidden />
                  </CheckoutButton>
                </div>
                <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12.5px] text-muted-foreground">
                  {pricing.region === "india" ? (
                    <>
                      <IndiaFlag />
                      <span>Regional price for India, paid with UPI.</span>
                    </>
                  ) : null}
                  <span>{fine}</span>
                </p>
              </>
            ) : (
              <Link
                href="/pricing"
                data-plans-source={source}
                onClick={onClose}
                className="group/cta mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-action text-[15px] font-semibold text-white transition-colors hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                See Pro plans
                <ArrowRight className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" strokeWidth={2.2} aria-hidden />
              </Link>
            )}

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/70 pt-3.5 text-[13px]">
              <p className="text-muted-foreground">
                Already have Pro?{" "}
                <Link
                  href={`/login?next=${encodeURIComponent(pathname)}`}
                  onClick={onClose}
                  className="font-medium text-foreground underline decoration-foreground/30 underline-offset-[3px] transition-colors hover:decoration-foreground"
                >
                  Sign in
                </Link>
              </p>
              {pricing ? (
                <Link
                  href="/pricing"
                  data-plans-source={source}
                  onClick={onClose}
                  className="font-medium text-link transition-opacity hover:opacity-80"
                >
                  Compare plans
                </Link>
              ) : null}
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
