import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PillLink } from "@/components/site";
import { libraryComponents } from "@/lib/catalog/library-components";

type Drop = { month: string; label: string; count: number; picks: { slug: string; name: string; premium: boolean }[] };

/** Groups the catalog by the month each component shipped, newest first. */
function recentDrops(limit = 3): Drop[] {
  const byMonth = new Map<string, typeof libraryComponents>();
  for (const c of libraryComponents) {
    const month = c.createdAt.slice(0, 7);
    byMonth.set(month, [...(byMonth.get(month) ?? []), c]);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .slice(0, limit)
    .map(([month, items]) => ({
      month,
      label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }),
      count: items.length,
      picks: [...items]
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 4)
        .map(({ slug, name, premium }) => ({ slug, name, premium })),
    }));
}

/** Release history plus the requests pitch: shows the library keeps growing. */
export function ShippingLog() {
  const drops = recentDrops();

  return (
    <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
      <div>
        <h2 className="pg-display text-[clamp(40px,6vw,56px)] leading-[1.02] text-foreground">Always shipping</h2>
        <p className="mt-4 max-w-[440px] text-[18px] text-muted-foreground">
          New components land every month, and both paid plans include everything we release next. Members also get
          a say in what gets built.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PillLink href="/contact">Request a component</PillLink>
          <PillLink href="/components" variant="white">
            Browse the library
          </PillLink>
        </div>
      </div>

      <ol className="border-t border-border">
        {drops.map((d) => (
          <li key={d.month} className="grid gap-3 border-b border-border py-6 sm:grid-cols-[150px_1fr] sm:gap-6">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.2px] text-foreground">{d.label}</p>
              <p className="mt-0.5 text-[14px] text-muted-foreground">
                {d.count} new {d.count === 1 ? "component" : "components"}
              </p>
            </div>
            <ul className="flex flex-wrap gap-2">
              {d.picks.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/components/${p.slug}`}
                    className="pg-glass inline-flex items-center gap-1.5 rounded-full bg-card px-3.5 py-1.5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {p.name}
                    {p.premium ? <span className="text-[11.5px] font-semibold text-muted-foreground">Pro</span> : null}
                    <ArrowUpRight className="size-3.5 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              ))}
              {d.count > d.picks.length ? (
                <li className="self-center px-1 text-[14px] text-muted-foreground">+{d.count - d.picks.length} more</li>
              ) : null}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
