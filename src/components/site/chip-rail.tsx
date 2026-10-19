import { cn } from "@/lib/utils";

/** A pill chip; `active` gives the ink fill used for the selected filter. */
export function Chip({
  active,
  icon,
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={props.onClick ? !!active : undefined}
      className={cn(
        "pg-glass inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors",
        active ? "bg-foreground text-background" : "bg-card text-foreground hover:bg-card/80",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/** A horizontally scrolling row of chips with the scrollbar hidden. */
export function ChipRail({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}>
      {children}
    </div>
  );
}
