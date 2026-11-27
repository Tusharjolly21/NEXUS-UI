import { cn } from "@/lib/utils";

/**
 * The regular price with a line through it, and what the early price saves against it. Shown under the price on a
 * plan card. The struck price is announced as "Regular price" so a screen reader says what it is rather than
 * reading two prices.
 */
export function SaleBadge({ was, save, className }: { was: string; save: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span className="relative text-[17px] font-medium tabular-nums text-muted-foreground">
        <span className="sr-only">Regular price </span>
        <s className="decoration-[#ff3b30]/75 decoration-[2px]">{was}</s>
      </span>
      <span className="inline-flex w-fit items-center rounded-full bg-[#34c759]/14 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
        {save}% off early price
      </span>
    </div>
  );
}

/** The regular price struck through, small, for tight places that already show the price in a sentence or a button. */
export function WasPrice({ was, className }: { was: string; className?: string }) {
  return (
    <s className={cn("tabular-nums decoration-[#ff3b30]/70 decoration-[1.5px]", className)}>
      <span className="sr-only">Regular price </span>
      {was}
    </s>
  );
}
