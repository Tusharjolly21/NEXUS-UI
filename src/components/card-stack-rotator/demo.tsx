"use client";

import * as React from "react";
import { CardStackRotator, type CardData } from "./card-stack-rotator";

const SAMPLE_CARDS: CardData[] = [
  {
    id: "card-1",
    content:
      "This product is **absolutely incredible** for our design team. We shipped our entire landing page in just **three days** and the quality was outstanding.",
    name: "Sarah Chen",
    designation: "Head of Product Design",
    company: "Vercel",
    initials: "SC",
  },
  {
    id: "card-2",
    content:
      "We migrated our entire UI to this library and the **developer experience** is unmatched. The animation primitives alone saved us **two weeks** of work.",
    name: "Marcus Rodriguez",
    designation: "Senior Frontend Engineer",
    company: "Linear",
    initials: "MR",
  },
  {
    id: "card-3",
    content:
      "The **component quality** here is genuinely impressive. Everything feels intentional and polished. Our team has shipped **40% faster** since adopting it.",
    name: "Aisha Patel",
    designation: "Design Systems Lead",
    company: "Stripe",
    initials: "AP",
  },
  {
    id: "card-4",
    content:
      "Outstanding **attention to detail** in every component. The motion is buttery smooth and the accessibility built-in is something we desperately needed.",
    name: "James Kim",
    designation: "Engineering Manager",
    company: "Notion",
    initials: "JK",
  },
  {
    id: "card-5",
    content:
      "This library **exceeded all expectations**. The code quality, the design polish, and the documentation are all **best-in-class**.",
    name: "Elena Vasquez",
    designation: "CTO",
    company: "Raycast",
    initials: "EV",
  },
  {
    id: "card-6",
    content:
      "We're seeing **3× higher conversion** on pages built with these components. The animations add a layer of **perceived quality** that users notice.",
    name: "David Okonkwo",
    designation: "Growth Lead",
    company: "Figma",
    initials: "DO",
  },
];

export function CardStackRotatorDemo() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14">
      {/* Hero section */}
      <div className="mb-12 text-center">
        <h2 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Loved by engineering teams
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          Seamless stacked card rotation with premium motion.
        </p>
      </div>

      {/* Main rotator */}
      <div className="flex justify-center">
        <CardStackRotator
          cards={SAMPLE_CARDS}
          rotationInterval={2800}
          maxVisible={4}
          stackOffset={14}
          scaleStep={0.04}
          cardWidth="440px"
          cardHeight="300px"
          cardBackground="#111113"
          cardBorderColor="rgba(255,255,255,0.07)"
          textColor="#fafafa"
          mutedColor="rgba(250,250,250,0.45)"
          highlightBackground="rgba(129,140,248,0.15)"
          highlightTextColor="#a5b4fc"
          contentFontSize="15px"
          nameFontSize="15px"
          designationFontSize="12px"
          borderRadius="16px"
          shadowIntensity={0.55}
          pauseOnHover
          direction="forward"
        />
      </div>

      {/* Variant: compact */}
      <section className="mt-16 rounded-3xl border border-border bg-muted/15 p-8">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Compact variant</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Smaller cards with tighter spacing
          </p>
        </div>
        <div className="flex justify-center">
          <CardStackRotator
            cards={SAMPLE_CARDS.slice(0, 4)}
            rotationInterval={3000}
            maxVisible={3}
            stackOffset={12}
            scaleStep={0.04}
            cardWidth="360px"
            cardHeight="280px"
            cardBackground="#09090b"
            cardBorderColor="rgba(255,255,255,0.06)"
            textColor="#fafafa"
            mutedColor="rgba(250,250,250,0.4)"
            highlightBackground="rgba(129,140,248,0.12)"
            highlightTextColor="#818cf8"
            contentFontSize="14px"
            nameFontSize="13px"
            designationFontSize="11px"
            borderRadius="14px"
            shadowIntensity={0.4}
            pauseOnHover
            direction="forward"
          />
        </div>
      </section>

      {/* Variant: backward */}
      <section className="mt-8 rounded-3xl border border-border bg-muted/15 p-8">
        <div className="mb-4">
          <p className="text-sm font-semibold text-foreground">Backward rotation</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Cards rotate in reverse direction
          </p>
        </div>
        <div className="flex justify-center">
          <CardStackRotator
            cards={SAMPLE_CARDS.slice(0, 3)}
            rotationInterval={5000}
            maxVisible={3}
            stackOffset={14}
            scaleStep={0.04}
            cardWidth="400px"
            cardHeight="260px"
            cardBackground="#0d0d12"
            cardBorderColor="rgba(255,255,255,0.07)"
            textColor="#fafafa"
            mutedColor="rgba(250,250,250,0.45)"
            highlightBackground="rgba(167,139,250,0.15)"
            highlightTextColor="#c4b5fd"
            contentFontSize="15px"
            nameFontSize="14px"
            designationFontSize="11px"
            borderRadius="16px"
            shadowIntensity={0.5}
            pauseOnHover
            direction="backward"
          />
        </div>
      </section>
    </div>
  );
}