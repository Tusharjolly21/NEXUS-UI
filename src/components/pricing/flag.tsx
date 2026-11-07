import { cn } from "@/lib/utils";

/** A country's flag as a small picture. Files live in /public/flags (see members.ts). The country is its alt text. */
export function Flag({ code, country, className }: { code: string; country: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static SVG, no optimisation needed
    <img
      src={`/flags/${code.toLowerCase()}.svg`}
      alt={country}
      title={country}
      width={18}
      height={12}
      loading="lazy"
      className={cn("inline-block h-3 w-[18px] shrink-0 rounded-[2px] object-cover shadow-[0_0_0_1px_rgba(0,0,0,.14)]", className)}
    />
  );
}
