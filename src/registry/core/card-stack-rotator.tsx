"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { CardStackRotator } from "@/components/card-stack-rotator/card-stack-rotator";

export function PreviewCardStackRotator({
  compact = true,
}: { compact?: boolean } = {}) {
  const cards = [
    {
      id: "csr-1",
      content:
        "This product is **absolutely incredible** for our team. Shipped our landing page in **three days**.",
      name: "Sarah Chen",
      designation: "Head of Design",
      company: "Vercel",
      initials: "SC",
    },
    {
      id: "csr-2",
      content:
        "The **developer experience** is unmatched. Animations saved us **two weeks** of work easily.",
      name: "Marcus Rodriguez",
      designation: "Senior Engineer",
      company: "Linear",
      initials: "MR",
    },
    {
      id: "csr-3",
      content:
        "Component quality is **genuinely impressive**. Everything feels intentional and polished.",
      name: "Aisha Patel",
      designation: "Design Systems Lead",
      company: "Stripe",
      initials: "AP",
    },
    {
      id: "csr-4",
      content:
        "**Attention to detail** in every component. Motion is buttery smooth, accessibility built-in.",
      name: "James Kim",
      designation: "Engineering Manager",
      company: "Notion",
      initials: "JK",
    },
    {
      id: "csr-5",
      content:
        "This library **exceeded all expectations**. Code quality and docs are **best-in-class**.",
      name: "Elena Vasquez",
      designation: "CTO",
      company: "Raycast",
      initials: "EV",
    },
  ];
  return (
    <div className="flex items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-[#09090b] p-6 sm:p-10 lg:p-16">
      <CardStackRotator
        cards={cards}
        rotationInterval={compact ? 3500 : 3000}
        maxVisible={compact ? 3 : 4}
        stackOffset={14}
        scaleStep={0.04}
        cardWidth="100%"
        cardHeight={compact ? "360px" : "380px"}
        cardBackground="#111113"
        cardBorderColor="rgba(255,255,255,0.07)"
        textColor="#fafafa"
        mutedColor="rgba(250,250,250,0.45)"
        highlightBackground="rgba(129,140,248,0.15)"
        highlightTextColor="#a5b4fc"
        contentFontSize="16px"
        nameFontSize="16px"
        designationFontSize="13px"
        borderRadius="20px"
        shadowIntensity={0.55}
        pauseOnHover
        direction="forward"
      />
    </div>
  );
}
