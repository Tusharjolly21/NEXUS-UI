"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import * as React from "react";
import { motion } from "framer-motion";

type SRTEffect = "blur" | "scale" | "slideX" | "slideY" | "rotate" | "skew";

interface SRTSection {
  label: string;
  lines: string[]; // each string = one line
  effect: SRTEffect;
  font: string;
  size: string;
  weight: number;
  italic?: boolean;
  tracking?: string;
  lineHeight?: number;
}

const SRT_SECTIONS: SRTSection[] = [
  {
    label: "WORD · BLUR",
    lines: ["Crafted for the", "next generation", "of ambitious", "builders."],
    effect: "blur",
    font: '"Helvetica Neue","Arial",system-ui,sans-serif',
    size: "3.2rem",
    weight: 200,
    tracking: "0em",
    lineHeight: 1.18,
  },
  {
    label: "CHAR · SCALE",
    lines: ["MAKE IT", "BIG, BOLD", "AND LOUD."],
    effect: "scale",
    font: "system-ui,-apple-system,sans-serif",
    size: "3.8rem",
    weight: 900,
    tracking: "-0.04em",
    lineHeight: 1.05,
  },
  {
    label: "WORD · SLIDE X",
    lines: [
      "Every great product",
      "starts with a single",
      "thoughtful decision",
      "made boldly.",
    ],
    effect: "slideX",
    font: '"Segoe UI","Helvetica Neue",system-ui,sans-serif',
    size: "2.4rem",
    weight: 400,
    tracking: "0.01em",
    lineHeight: 1.3,
  },
  {
    label: "WORD · SLIDE Y",
    lines: ["Move faster", "than anyone", "thought was", "possible."],
    effect: "slideY",
    font: "system-ui,sans-serif",
    size: "3.4rem",
    weight: 700,
    italic: true,
    tracking: "-0.03em",
    lineHeight: 1.1,
  },
  {
    label: "WORD · ROTATE",
    lines: [
      "The future of",
      "interfaces starts",
      "with words that",
      "come alive.",
    ],
    effect: "rotate",
    font: '"Trebuchet MS","Gill Sans",system-ui,sans-serif',
    size: "2.8rem",
    weight: 600,
    tracking: "-0.02em",
    lineHeight: 1.15,
  },
  {
    label: "WORD · SKEW",
    lines: ["Ship products", "your users will", "genuinely love", "forever."],
    effect: "skew",
    font: 'system-ui,"Helvetica Neue",sans-serif',
    size: "3.2rem",
    weight: 800,
    tracking: "-0.035em",
    lineHeight: 1.08,
  },
];

const SRT_INIT: Record<SRTEffect, Record<string, unknown>> = {
  blur: { opacity: 0.08, filter: "blur(12px)", y: 10 },
  scale: { opacity: 0.08, scale: 0.5 },
  slideX: { opacity: 0, x: -32 },
  slideY: { opacity: 0, y: 28 },
  rotate: { opacity: 0.08, rotate: -10 },
  skew: { opacity: 0.08, skewX: 14, x: -8 },
};

const SRT_END: Record<SRTEffect, Record<string, unknown>> = {
  blur: { opacity: 1, filter: "blur(0px)", y: 0 },
  scale: { opacity: 1, scale: 1 },
  slideX: { opacity: 1, x: 0 },
  slideY: { opacity: 1, y: 0 },
  rotate: { opacity: 1, rotate: 0 },
  skew: { opacity: 1, skewX: 0, x: 0 },
};

function SRTSection({
  section,
  root,
}: {
  section: SRTSection;
  root: React.RefObject<HTMLElement | null>;
}) {
  let wi = 0;

  return (
    <div
      style={{
        padding: "36px 28px 44px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        fontFamily: section.font,
        fontSize: section.size,
        fontWeight: section.weight,
        fontStyle: section.italic ? "italic" : "normal",
        letterSpacing: section.tracking ?? "-0.02em",
        lineHeight: section.lineHeight ?? 1.15,
        color: "#ffffff",
      }}
    >
      <p
        style={{
          fontFamily: "system-ui, sans-serif",
          fontSize: "8px",
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "14px",
          fontStyle: "normal",
        }}
      >
        {section.label}
      </p>
      {section.lines.map((line, li) => {
        const words = line.split(" ").filter(Boolean);
        return (
          <div key={li} style={{ display: "block", overflow: "visible" }}>
            {words.map((word) => {
              const idx = wi++;
              return (
                <React.Fragment key={idx}>
                  <motion.span
                    initial={{
                      ...SRT_INIT[section.effect],
                      color: "rgba(255,255,255,0.08)",
                    }}
                    whileInView={{
                      ...SRT_END[section.effect],
                      color: "#ffffff",
                    }}
                    viewport={{ once: false, root, amount: 0.1 }}
                    transition={{
                      delay: idx * 0.07,
                      duration: 0.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    style={{
                      display: "inline-block",
                      willChange: "opacity, transform, filter",
                    }}
                  >
                    {word}
                  </motion.span>{" "}
                </React.Fragment>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function PreviewScrollRevealText() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf: number;
    let paused = false;

    const tick = () => {
      if (!paused && el) {
        el.scrollTop += 1.2;
        const maxScroll = el.scrollHeight - el.clientHeight;
        if (el.scrollTop >= maxScroll - 4) {
          paused = true;
          setTimeout(() => {
            el.scrollTop = 0;
            setTimeout(() => {
              paused = false;
            }, 500);
          }, 1400);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    // height: 640px — matches detail page's min-h-[640px] so preview fills it fully.
    // On the /components listing card (max 320px overflow:hidden), it gets clipped to fill that too.
    <div
      ref={scrollRef}
      style={
        {
          width: "100%",
          height: "640px",
          overflowY: "scroll",
          scrollbarWidth: "none",
          background: "#09090b",
        } as React.CSSProperties
      }
    >
      {SRT_SECTIONS.map((section, i) => (
        <SRTSection key={i} section={section} root={scrollRef} />
      ))}
    </div>
  );
}
