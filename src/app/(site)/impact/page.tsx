import type { Metadata } from "next";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { RainbowWord } from "@/components/site";
import { PillLink, pillClassName } from "@/components/site/pill-link";
import { TwentyFirstLogo } from "@/components/home/twenty-first-logo";
import { CountUp } from "@/components/impact/count-up";
import { LifetimeCount } from "@/components/impact/lifetime-count";
import { createMetadata } from "@/lib/seo";
import {
  ANALYTICS_CHECKED_LABEL,
  CHECKED_LABEL,
  EARLIER_LABEL,
  fmt,
  DAILY,
  LAST_30_DAYS,
  PROFILE_URL,
  RANK,
  SNAPSHOT,
  thousands,
} from "@/lib/twenty-first-stats";

export const metadata: Metadata = createMetadata({
  title: "Nexus UI on 21st.dev: almost 1M views",
  description:
    `Almost a million views on 21st.dev. Our last 30 days there: ${Math.round(LAST_30_DAYS.views / 1000)}K views and ${fmt.format(LAST_30_DAYS.copies)} copies, and #${RANK.position} of ${fmt.format(RANK.of)} authors this week.`,
  alternates: { canonical: "/impact" },
});

const BLUE = "oklch(0.485 0.291 264.121)";
const GRID =
  "linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)";

const MONTH_CELLS = [
  { label: "Views", value: LAST_30_DAYS.views },
  { label: "Copies", value: LAST_30_DAYS.copies },
  { label: "Installs", value: LAST_30_DAYS.installs, note: `from the CLI and MCP, as of ${EARLIER_LABEL}` },
  { label: "Bookmarks", value: LAST_30_DAYS.bookmarks },
  { label: "Profile views", value: LAST_30_DAYS.profileViews, note: `as of ${EARLIER_LABEL}` },
] as const;

export default function ImpactPage() {
  return (
    <>
      {/* Our look: the headline and the lifetime counts */}
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-16 pt-[136px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <TwentyFirstLogo className="h-6 w-auto text-foreground" />
          <h1 className="pg-display mt-6 max-w-[860px] text-[clamp(44px,7.4vw,80px)] text-foreground">
            Almost a <RainbowWord>million</RainbowWord> views on 21st.dev
          </h1>
          <p className="mt-5 max-w-[600px] text-[19px] leading-[1.55] text-muted-foreground">
            21st.dev is a community library where developers browse and copy React components. We publish our
            components there, and this is how they are doing, with the numbers copied from our own account.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a href={PROFILE_URL} target="_blank" rel="noopener noreferrer" className={pillClassName("ink", "md")}>
              See our profile on 21st.dev
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
            <PillLink href="/components" variant="white">
              Browse the components
            </PillLink>
          </div>

          <dl className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="pg-float rounded-tile bg-card p-7">
              <dt className="text-[15px] text-muted-foreground">Views, all time</dt>
              <dd className="mt-2">
                <span className="pg-display text-[clamp(44px,6vw,64px)] tabular-nums text-foreground">
                  <LifetimeCount kind="views" />
                </span>
                <span className="mt-1 block text-[14px] text-muted-foreground">
                  +{thousands(DAILY.views)}K a day lately
                </span>
              </dd>
            </div>
            <div className="pg-float rounded-tile bg-card p-7">
              <dt className="text-[15px] text-muted-foreground">Bookmarks, all time</dt>
              <dd className="mt-2">
                <span className="pg-display text-[clamp(44px,6vw,64px)] tabular-nums text-foreground">
                  <LifetimeCount kind="bookmarks" />
                </span>
                <span className="mt-1 block text-[14px] text-muted-foreground">+{DAILY.bookmarks} a day lately</span>
              </dd>
            </div>
            <div className="pg-float rounded-tile bg-card p-7">
              <dt className="text-[15px] text-muted-foreground">Components published</dt>
              <dd className="mt-2">
                <span className="pg-display text-[clamp(44px,6vw,64px)] tabular-nums text-foreground">
                  {SNAPSHOT.components}
                </span>
                <span className="mt-1 block text-[14px] text-muted-foreground">published on 21st.dev</span>
              </dd>
            </div>
          </dl>
          <p className="mt-5 max-w-[760px] text-[13.5px] leading-relaxed text-muted-foreground">
            The all-time views and bookmarks are estimates between checks: the last count we read, {thousands(SNAPSHOT.views)}K
            views and {thousands(SNAPSHOT.bookmarks)}K bookmarks on {CHECKED_LABEL}, plus our average of the last 30 days. We
            update them each time we re-check.
          </p>
        </div>
      </section>

      {/* 21st's look: the last 30 days, exactly as their analytics gives them */}
      <section aria-labelledby="month-title" className="px-4 pb-20">
        <div className="relative mx-auto max-w-[1152px] overflow-hidden rounded-tile bg-[#09090b] px-6 py-12 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.09),0_40px_90px_-40px_rgba(30,50,255,0.55)] sm:px-12 sm:py-14">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: GRID,
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 70% 80% at 12% 0%, #000, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 12% 0%, #000, transparent 75%)",
            }}
          />
          <div aria-hidden className="pointer-events-none absolute -left-40 -top-56 size-[560px] rounded-full opacity-30 blur-[110px]" style={{ background: BLUE }} />
          <div aria-hidden className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          <div className="relative">
            <TwentyFirstLogo className="h-6 w-auto text-white" />
            <h2 id="month-title" className="pg-display mt-6 text-[clamp(30px,4.4vw,48px)] leading-[1.05]">
              The last 30 days
            </h2>
            <p className="mt-3 max-w-[560px] text-[16px] leading-[1.55] text-white/62">
              Copied from our Creator Studio analytics on {ANALYTICS_CHECKED_LABEL}. These are exact, not estimated.
            </p>

            <dl className="mt-10 grid grid-cols-2 overflow-hidden rounded-[20px] shadow-[0_0_0_1px_rgba(255,255,255,0.1)] lg:grid-cols-3">
              {MONTH_CELLS.map((c, i) => (
                <div
                  key={c.label}
                  className={`group relative bg-white/[0.025] px-5 py-6 transition-colors duration-200 hover:bg-white/[0.05] sm:px-7 sm:py-8 ${
                    i % 2 === 1 ? "border-l border-white/10" : ""
                  } ${i >= 2 ? "border-t border-white/10" : ""} lg:border-l lg:border-t-0 ${i >= 3 ? "lg:border-t" : ""} ${i % 3 === 0 ? "lg:border-l-0" : ""}`}
                >
                  <dt className="text-[14px] text-white/60">{c.label}</dt>
                  <dd className="mt-1.5">
                    <span className="pg-display text-[clamp(32px,4.2vw,52px)] tabular-nums text-white">
                      <CountUp to={c.value} />
                    </span>
                    {"note" in c ? <span className="block text-[13px] text-white/50">{c.note}</span> : null}
                  </dd>
                </div>
              ))}
              <div className="relative col-span-2 border-t border-white/10 bg-[rgba(70,100,255,0.08)] px-5 py-6 sm:px-7 sm:py-8 lg:col-span-1 lg:border-l lg:border-t">
                <dt className="text-[14px] text-white/60">Weekly rank</dt>
                <dd className="mt-1.5">
                  <span className="pg-display text-[clamp(32px,4.2vw,52px)] tabular-nums text-white">
                    <CountUp to={RANK.position} prefix="#" />
                  </span>
                  <span className="ml-2 inline-flex items-center gap-0.5 text-[15px] font-medium text-[#34c759]">
                    <ArrowUp className="size-4" aria-hidden />
                    {RANK.up}
                  </span>
                  <span className="block text-[13px] text-white/50">
                    of {RANK.of} authors, up {RANK.up} places since {RANK.since}
                  </span>
                </dd>
              </div>
            </dl>

            <p className="mt-6 text-[17px] font-medium text-white/80">And counting, every day.</p>

            <a
              href={PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-[48px] items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium tracking-[-0.01em] text-[#09090b] transition-[transform,filter] duration-150 hover:brightness-95 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Open our profile on 21st.dev
              <ArrowUpRight className="size-4" aria-hidden />
            </a>
          </div>
        </div>
      </section>

      {/* Our look again: where to go next */}
      <section aria-labelledby="use-title" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="flex flex-col gap-5 rounded-tile bg-tint-sky/60 p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div>
              <h2 id="use-title" className="pg-display text-[clamp(26px,3.4vw,38px)] text-foreground">Use them in your project</h2>
              <p className="mt-2 max-w-[520px] text-[16px] leading-[1.55] text-muted-foreground">
                Every free component has a live demo and its full source on Nexus UI. Copy one, or let your agent add it by name.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <PillLink href="/components">Browse components</PillLink>
              <PillLink href="/mcp" variant="white">
                Add with your agent
              </PillLink>
            </div>
          </div>

          <p className="mt-8 max-w-[760px] text-[13.5px] leading-relaxed text-muted-foreground">
            21st.dev is a separate site and we are an author on it. These figures come from our own profile and Creator
            Studio analytics and change every day: the last 30 days and the rank were last checked on {ANALYTICS_CHECKED_LABEL},
            and the all-time totals on {CHECKED_LABEL}.
          </p>
        </div>
      </section>
    </>
  );
}
