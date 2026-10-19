import Link from "next/link";
import { cn } from "@/lib/utils";

export type PillVariant = "ink" | "white" | "cta";
export type PillSize = "md" | "sm";

const VARIANTS: Record<PillVariant, string> = {
  ink: "bg-foreground text-background hover:bg-foreground/90",
  white: "bg-card text-foreground hover:bg-card/90",
  cta: "pg-cta text-white hover:brightness-105",
};

const SIZES: Record<PillSize, string> = {
  md: "h-[51px] px-7 text-[15px]",
  sm: "h-[38px] px-4 text-[13.5px]",
};

/** Classes for the Playground pill buttons; also usable on a <button>. */
export function pillClassName(variant: PillVariant = "ink", size: PillSize = "md", className?: string) {
  return cn(
    "pg-glass inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,filter,transform] duration-150 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function PillLink({
  href,
  variant = "ink",
  size = "md",
  className,
  children,
}: {
  href: string;
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={pillClassName(variant, size, className)}>
      {children}
    </Link>
  );
}
