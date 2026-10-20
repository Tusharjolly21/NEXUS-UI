"use client";

import * as React from "react";
import { InfiniteMovingCards, type InfiniteMovingCardItem } from "./InfiniteMovingCards";

const testimonials: InfiniteMovingCardItem[] = [
  {
    id: "t-1",
    title: "Launch velocity increased",
    description: "The motion components helped us ship our redesign in half the usual time.",
    name: "Ariana Shaw",
    role: "Product Lead, OrbitStack",
    rating: 5,
    tags: ["SaaS", "Design system"],
  },
  {
    id: "t-2",
    title: "Production-ready defaults",
    description: "Everything felt intentional out of the box, including responsive behavior and accessibility.",
    name: "Marcus Lee",
    role: "Frontend Engineer, SprintOps",
    rating: 5,
    tags: ["React", "Framer Motion"],
  },
  {
    id: "t-3",
    title: "Readable and premium",
    description: "We replaced three custom carousels with this and immediately improved visual consistency.",
    name: "Lena Patel",
    role: "Design Manager, CloudFrame",
    rating: 4,
    tags: ["UI Kit", "Performance"],
  },
  {
    id: "t-4",
    title: "No more jumpy loops",
    description: "The seamless marquee behavior feels polished and keeps users engaged longer.",
    name: "Noah Kim",
    role: "Growth Designer, Metricly",
    rating: 5,
    tags: ["UX", "Landing pages"],
  },
];

const logoCards: InfiniteMovingCardItem[] = [
  { id: "l-1", title: "Nexus", tags: ["UI"] },
  { id: "l-2", title: "Orbit", tags: ["Analytics"] },
  { id: "l-3", title: "Flux", tags: ["Ops"] },
  { id: "l-4", title: "Delta", tags: ["Cloud"] },
  { id: "l-5", title: "Pulse", tags: ["Growth"] },
  { id: "l-6", title: "Helio", tags: ["Infra"] },
];

export function InfiniteMovingCardsDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Motion</p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Infinite Moving Cards
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Seamless marquee-style card loops for testimonials, logos, product highlights, and showcase rails.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Testimonials example</p>
          <InfiniteMovingCards items={testimonials} direction="left" speed="normal" pauseOnHover />
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">Logo/cards example</p>
          <InfiniteMovingCards
            items={logoCards}
            direction="right"
            speed="fast"
            pauseOnHover
            gap={14}
            cardClassName="min-w-[180px] max-w-[180px]"
            renderItem={(item) => (
              <div className="flex h-[110px] w-[180px] flex-col items-center justify-center gap-2 rounded-2xl border border-border/70 bg-card/95 text-center shadow-[0_14px_28px_-24px_rgba(15,23,42,0.45)]">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                  {(item.title ?? "N").slice(0, 1)}
                </div>
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.tags?.[0]}</p>
              </div>
            )}
          />
        </div>
      </div>
    </section>
  );
}
