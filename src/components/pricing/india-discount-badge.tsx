import { cn } from "@/lib/utils";

/** Drawn rather than an emoji: flag emoji render as the letters "IN" on Windows. */
export function IndiaFlag() {
  return (
    <svg viewBox="0 0 18 12" aria-hidden className="h-3 w-[18px] shrink-0 overflow-hidden rounded-[2px]">
      <rect width="18" height="4" fill="#FF9933" />
      <rect y="4" width="18" height="4" fill="#FFFFFF" />
      <rect y="8" width="18" height="4" fill="#138808" />
      <circle cx="9" cy="6" r="1.5" fill="none" stroke="#000080" strokeWidth="0.5" />
    </svg>
  );
}

export function IndiaDiscountBadge({
  percent,
  original,
  upTo = false,
  className,
}: {
  percent: number;
  /** The usual price, struck through beside the badge. */
  original?: string | null;
  /** For places that cover both plans, whose discounts differ. */
  upTo?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {original ? (
        <span className="text-[15px] text-muted-foreground">
          <span className="sr-only">Usual price </span>
          <s>{original}</s>
        </span>
      ) : null}
      <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#34c759]/14 px-2.5 py-1 text-[12px] font-semibold text-[#126b3a] dark:text-[#7ee2a8]">
        {upTo ? "Up to " : ""}
        {percent}% discount for India
        <IndiaFlag />
      </p>
    </div>
  );
}
