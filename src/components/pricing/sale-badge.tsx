import { cn } from "@/lib/utils";

/**
 * The earlier price with a line through it, and what the new price saves. Shown under the price on a plan card.
 * The struck price is announced as "Was" so a screen reader says what changed rather than reading two prices.
 */
export function SaleBadge({ was, save, className }: { was: string; save: number; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      <span className="relative text-[17px] font-medium tabular-nums text-muted-foreground">
        <span className="sr-only">Was </span>
        <s className="decoration-[#ff3b30]/75 decoration-[2px]">{was}</s>
      </span>
      <span className="inline-flex w-fit items-center rounded-full bg-[#34c759]/14 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
        Save {save}%
      </span>
    </div>
  );
}
