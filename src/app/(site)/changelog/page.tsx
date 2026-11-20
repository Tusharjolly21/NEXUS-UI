import type { Metadata } from "next";
import Link from "next/link";
import { RainbowWord } from "@/components/site";
import { libraryComponents } from "@/lib/catalog/library-components";
import { templates } from "@/lib/catalog/templates";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Changelog: new React components and templates",
  description: "Every component and template added to Nexus UI, newest first, with the date it shipped and whether it is free or Pro.",
  alternates: { canonical: "/changelog" },
});

type Entry = { kind: "component" | "template"; name: string; href: string; premium: boolean };

const DAY = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** The catalog already records the day each item shipped, so this page builds itself and never goes stale. */
function groupByDay() {
  const days = new Map<string, Entry[]>();
  // A few older items store a full timestamp; the day is the first ten characters.
  const add = (raw: string, entry: Entry) => {
    const date = raw.slice(0, 10);
    days.set(date, [...(days.get(date) ?? []), entry]);
  };
  for (const c of libraryComponents) {
    add(c.createdAt, { kind: "component", name: c.name, href: `/components/${c.slug}`, premium: c.premium });
  }
  for (const t of templates) {
    add(t.createdAt, { kind: "template", name: t.title.split(" — ")[0], href: `/templates/${t.slug}`, premium: !!t.premium });
  }
  return [...days.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1)).slice(0, 30);
}

function Group({ label, items }: { label: string; items: Entry[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4">
      <h3 className="text-[13.5px] font-medium text-muted-foreground">
        {label} ({items.length})
      </h3>
      <ul className="mt-2 flex flex-wrap gap-x-2 gap-y-1.5">
        {items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-[14px] text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.06)] transition-colors hover:bg-card/70 dark:shadow-[0_0_0_1px_rgba(255,255,255,.1)]"
            >
              {item.name}
              <span className="text-[11.5px] text-muted-foreground">{item.premium ? "Pro" : "Free"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function ChangelogPage() {
  const days = groupByDay();
  const total = days.reduce((n, [, items]) => n + items.length, 0);

  return (
    <>
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-12 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <h1 className="pg-display max-w-[900px] text-[clamp(44px,7vw,76px)] leading-[1.04] text-foreground">
            What <RainbowWord>shipped</RainbowWord>
          </h1>
          <p className="mt-5 max-w-[640px] text-[19px] leading-[1.55] text-muted-foreground">
            Every component and template added to Nexus UI, newest first. The last {days.length} release days added{" "}
            {total} items. Pro plans include everything here, and everything that ships later.
          </p>
        </div>
      </section>
      <section className="px-4 pb-24">
        <ol className="mx-auto max-w-[1152px] space-y-10">
          {days.map(([date, items]) => (
            <li key={date} className="grid gap-4 md:grid-cols-[200px_minmax(0,1fr)]">
              <h2 className="text-[17px] font-semibold text-foreground md:pt-1">
                <time dateTime={date}>{DAY.format(new Date(`${date}T00:00:00Z`))}</time>
              </h2>
              <div>
                <Group label="Components" items={items.filter((i) => i.kind === "component")} />
                <Group label="Templates" items={items.filter((i) => i.kind === "template")} />
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
