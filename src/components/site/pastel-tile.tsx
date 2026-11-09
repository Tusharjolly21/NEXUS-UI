import Link from "next/link";
import { ProMark } from "@/components/pro/pro-access";
import { cn } from "@/lib/utils";

export type Tint = "violet" | "sky" | "peach" | "mint" | "butter" | "pink" | "dark";

const TINTS: Record<Tint, string> = {
  violet: "bg-tint-violet",
  sky: "bg-tint-sky",
  peach: "bg-tint-peach",
  mint: "bg-tint-mint",
  butter: "bg-tint-butter",
  pink: "bg-tint-pink",
  dark: "bg-[#1d1d1f] text-white",
};

/** Free / Pro tag shown on library tiles. */
export function PlanTag({ pro }: { pro?: boolean }) {
  return pro ? (
    <ProMark />
  ) : (
    <span className="pg-glass rounded-full bg-card px-2.5 py-0.5 text-[11.5px] font-semibold text-foreground">Free</span>
  );
}

/**
 * The 28px-radius pastel tile used in bento grids: a preview area, then a title and one line.
 * Renders as a link when `href` is given.
 */
export function PastelTile({
  tint = "violet",
  preview,
  title,
  description,
  tag,
  href,
  className,
}: {
  tint?: Tint;
  preview?: React.ReactNode;
  title: string;
  description?: string;
  /** Pass `<PlanTag pro />` or any small badge. */
  tag?: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const dark = tint === "dark";
  const body = (
    <>
      {preview ? <div className="relative grid min-h-[170px] flex-1 place-items-center">{preview}</div> : null}
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className={cn("text-[17px] font-semibold tracking-[-0.3px]", dark ? "text-white" : "text-foreground")}>{title}</h3>
        {tag}
      </div>
      {description ? (
        <p className={cn("mt-1 text-[14px]", dark ? "text-white/60" : "text-muted-foreground")}>{description}</p>
      ) : null}
    </>
  );
  const classes = cn(
    "relative flex min-h-[280px] flex-col overflow-hidden rounded-tile p-6",
    TINTS[tint],
    href && "transition-transform duration-150 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
    className,
  );
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
