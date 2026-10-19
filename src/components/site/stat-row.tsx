import { cn } from "@/lib/utils";

/** Big numerals with small labels. Server-rendered real values; no count-up from zero. */
export function StatRow({
  items,
  className,
}: {
  items: { value: string | number; label: string }[];
  className?: string;
}) {
  return (
    <dl className={cn("grid grid-cols-2 gap-8 border-y border-border py-12 md:grid-cols-4", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse">
          <dt className="mt-1 text-[14px] text-muted-foreground">{item.label}</dt>
          <dd className="pg-display text-[56px] text-foreground">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
