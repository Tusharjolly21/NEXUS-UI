import { cn } from "@/lib/utils";

export type BandTint = "mint" | "butter" | "violet" | "sky" | "peach" | "pink";

const BANDS: Record<BandTint, string> = {
  mint: "bg-tint-mint/60",
  butter: "bg-tint-butter/70",
  violet: "bg-tint-violet/70",
  sky: "bg-tint-sky/60",
  peach: "bg-tint-peach/60",
  pink: "bg-tint-pink/60",
};

/** A full-width pastel section, like mockframe's chat and gallery bands. */
export function Band({
  tint,
  id,
  className,
  children,
}: {
  tint: BandTint;
  id?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("w-full px-4 py-24 sm:py-28", BANDS[tint], className)}>
      <div className="mx-auto max-w-[1152px]">{children}</div>
    </section>
  );
}
