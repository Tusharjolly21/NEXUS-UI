import { cn } from "@/lib/utils";
import { Flag } from "@/components/pricing/flag";
import { MEMBERS, discBackground, initials } from "@/components/pricing/members";

/**
 * A few overlapping initials and one quiet line under a buy button: who has already taken All-Access.
 * It names real buyers only (no photos, no made-up count) and shows nothing until there is one.
 */
export function MemberStack({ className }: { className?: string }) {
  if (MEMBERS.length === 0) return null;
  const shown = MEMBERS.slice(0, 4);
  const rest = MEMBERS.length - 2;
  // each name carries its flag; with more than two we name the newest two and count the rest
  const tag = (m: (typeof MEMBERS)[number]) => (
    <span className="whitespace-nowrap">
      {m.name} <Flag code={m.code} country={m.country} className="ml-0.5 align-[-1px]" />
    </span>
  );
  const names =
    MEMBERS.length === 1 ? (
      tag(MEMBERS[0])
    ) : MEMBERS.length === 2 ? (
      <>
        {tag(MEMBERS[0])} and {tag(MEMBERS[1])}
      </>
    ) : (
      <>
        {tag(MEMBERS[0])}, {tag(MEMBERS[1])} and {rest} more
      </>
    );

  return (
    <div className={cn("flex items-center justify-center gap-2.5", className)}>
      <span aria-hidden className="flex shrink-0 -space-x-1">
        {shown.map((m, i) => (
          <span
            key={m.name}
            className="flex size-7 items-center justify-center rounded-full text-[10.5px] font-semibold uppercase text-white ring-2 ring-card"
            style={{ background: discBackground(i), zIndex: shown.length - i }}
          >
            {initials(m.name)}
          </span>
        ))}
      </span>
      <p className="min-w-0 text-[13px] leading-snug text-muted-foreground">
        Joined by <span className="font-medium text-foreground">{names}</span>
      </p>
    </div>
  );
}
