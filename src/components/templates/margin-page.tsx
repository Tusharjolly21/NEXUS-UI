"use client";

import { MotionConfig } from "framer-motion";
import { Banner } from "./margin/banner";
import { BookCall } from "./margin/book-call";
import { Connect } from "./margin/connect";
import { ContributionGraph } from "./margin/contributions";
import { PROFILE } from "./margin/data";
import { ExperienceList } from "./margin/experience";
import { Header } from "./margin/header";
import { Intro } from "./margin/intro";
import { NowGrid } from "./margin/now";
import { ProjectGrid } from "./margin/projects";
import { ShippedList } from "./margin/shipped";
import { StackMarquee } from "./margin/stack";
import { BASE_CSS } from "./margin/styles";
import { useTheme } from "./margin/theme";
import { Section } from "./margin/ui";
import { WritingList } from "./margin/writing";

/** The two hatched columns on either side of the content, shown from tablet width up. */
function Rail() {
  return <div className="margin-rail hidden w-12 shrink-0 border-x md:block" style={{ borderColor: "var(--line)" }} />;
}

/** A soft blur that fades in at the bottom edge of the window, so content slides out under it. */
function BottomBlur() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-20">
      {[1, 3, 6].map((blur, layer) => {
        const mask = `linear-gradient(to bottom, transparent ${layer * 30}%, #000 ${40 + layer * 30}%)`;
        return (
          <div
            key={blur}
            className="absolute inset-0"
            style={{ backdropFilter: `blur(${blur}px)`, WebkitBackdropFilter: `blur(${blur}px)`, maskImage: mask, WebkitMaskImage: mask }}
          />
        );
      })}
    </div>
  );
}

export function MarginPage() {
  const { dark, toggle } = useTheme();

  return (
    <MotionConfig reducedMotion="user">
      <style>{BASE_CSS}</style>
      <div id="margin-root">
        <div className="relative mx-auto flex max-w-[896px] justify-center">
          <Rail />
          <main className="min-w-0 max-w-[760px] flex-1 pb-24" style={{ background: "var(--col)" }}>
            <Banner dark={dark} quote={PROFILE.quote} />
            <Header dark={dark} onToggleTheme={toggle} />
            <Intro />
            <Section title="Professional experience">
              <ExperienceList />
            </Section>
            <Section title="Proof of work">
              <ProjectGrid />
            </Section>
            <Section title="Writing">
              <WritingList />
            </Section>
            <Section title="Now">
              <NowGrid />
            </Section>
            <Section
              title={
                <>
                  Contributions <span style={{ color: "var(--faint)" }}>• @{PROFILE.handle}</span>
                </>
              }
            >
              <ContributionGraph />
            </Section>
            <Section title="Stack I use">
              <p className="-mt-3 mb-4 text-[16px]" style={{ color: "var(--fg2)" }}>
                What I reach for when something needs to ship this week.
              </p>
              <StackMarquee />
            </Section>
            <Section
              title={
                <>
                  Recently shipped <span style={{ color: "var(--faint)" }}>• {PROFILE.shippedDate}</span>
                </>
              }
            >
              <ShippedList />
            </Section>
            <BookCall />
            <Section title="Let's connect">
              <Connect />
            </Section>
          </main>
          <Rail />
        </div>
        <BottomBlur />
      </div>
    </MotionConfig>
  );
}
