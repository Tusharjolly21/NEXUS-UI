import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Placeholder customer marks for the logo clouds. Every brand here is invented, so a page built
 * from these blocks never implies a real company is a customer. Swap in your own marks by passing
 * `logos` to the variants that accept them, or by editing this list.
 */

type MarkProps = { className?: string; style?: React.CSSProperties };

export type Logo = {
  name: string;
  /** The glyph. Draws in `currentColor`. */
  Icon: React.ComponentType<MarkProps>;
  /** Accent for the glyph when a variant shows colour. */
  color: string;
  /** Type treatment for the wordmark, so each brand reads as its own lockup. */
  wordmark?: string;
};

function Svg({ className, style, children }: MarkProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={style}>
      {children}
    </svg>
  );
}

const Arcwell = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M4 18a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M8.5 18a3.5 3.5 0 0 1 7 0" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </Svg>
);

const Basalt = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M12 2.5 20.2 7v10L12 21.5 3.8 17V7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 12v9.5M12 12l8.2-5M12 12 3.8 7" stroke="currentColor" strokeWidth="1.6" />
  </Svg>
);

const Corvid = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M3 17 12 5l9 12h-5.2L12 11.6 8.2 17Z" fill="currentColor" />
  </Svg>
);

const Driftline = (p: MarkProps) => (
  <Svg {...p}>
    {[7, 12, 17].map((y) => (
      <path
        key={y}
        d={`M3 ${y}c2.2-2 4.3-2 6.5 0s4.3 2 6.5 0 3.7-1.6 5 0`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ))}
  </Svg>
);

const Emberly = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M12 2.5c4 4.2 6.5 7.6 6.5 11.2A6.5 6.5 0 0 1 5.5 13.7c0-2.3 1.1-4.3 3-6.2.3 2 1.3 3.2 2.6 3.6C11 8 11 5.4 12 2.5Z" fill="currentColor" />
  </Svg>
);

const Fieldnote = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M4.5 3.5h10l5 5v12h-15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M14.5 3.5v5h5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M8 13h8M8 16.5h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </Svg>
);

const Glasshouse = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M3.5 11 12 3.5l8.5 7.5v9.5h-17Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 9v11.5M3.5 15h17" stroke="currentColor" strokeWidth="1.6" />
  </Svg>
);

const Kestrel = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M2.5 15.5 14 4.5l-3 7h10.5L10 19.5l3-4Z" fill="currentColor" />
  </Svg>
);

const Lumora = (p: MarkProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" />
  </Svg>
);

const Oakhaven = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M12 21.5V11M12 11c-5.5 0-8-3.5-8-8.5 5.3 0 8 2.6 8 8.5Zm0 0c5.5 0 8-3.5 8-8.5-5.3 0-8 2.6-8 8.5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </Svg>
);

const Quill = (p: MarkProps) => (
  <Svg {...p}>
    <path d="M20.5 3.5C11 4.5 6 10 5 20.5 9 13.8 13 10.5 20.5 3.5Z" fill="currentColor" />
    <path d="M3.5 20.5h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const Tidewater = (p: MarkProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M3.5 13.5c2.8-2.4 5.7-2.4 8.5 0s5.7 2.4 8.5 0V15a9 9 0 0 1-17 0Z" fill="currentColor" />
  </Svg>
);

export const LOGOS: Logo[] = [
  { name: "Arcwell", Icon: Arcwell, color: "#3b5bdb", wordmark: "font-semibold tracking-[-0.03em]" },
  { name: "Basalt", Icon: Basalt, color: "#343a40", wordmark: "text-[0.78em] font-semibold uppercase tracking-[0.22em]" },
  { name: "Corvid", Icon: Corvid, color: "#5f3dc4", wordmark: "font-serif text-[1.08em] italic tracking-[-0.01em]" },
  { name: "driftline", Icon: Driftline, color: "#0c8599", wordmark: "font-medium tracking-[-0.02em]" },
  { name: "Emberly", Icon: Emberly, color: "#e8590c", wordmark: "font-bold tracking-[-0.04em]" },
  { name: "fieldnote", Icon: Fieldnote, color: "#2b8a3e", wordmark: "font-mono text-[0.9em] font-medium tracking-[-0.04em]" },
  { name: "Glasshouse", Icon: Glasshouse, color: "#1971c2", wordmark: "font-light tracking-[0.02em]" },
  { name: "KESTREL", Icon: Kestrel, color: "#c92a2a", wordmark: "text-[0.86em] font-black tracking-[0.08em]" },
  { name: "Lumora", Icon: Lumora, color: "#f08c00", wordmark: "font-serif text-[1.08em] tracking-[-0.01em]" },
  { name: "Oakhaven", Icon: Oakhaven, color: "#5c940d", wordmark: "font-semibold tracking-[-0.02em]" },
  { name: "Quill & Co", Icon: Quill, color: "#862e9c", wordmark: "font-serif text-[1.06em] italic" },
  { name: "Tidewater", Icon: Tidewater, color: "#1864ab", wordmark: "font-medium tracking-[-0.01em]" },
];

/**
 * A brand lockup: glyph and wordmark side by side, in the current text colour. `tinted` paints the
 * glyph in the brand accent; the wordmark stays ink so a row of them reads as one quiet band.
 */
export function LogoLockup({
  logo,
  tinted = false,
  className,
}: {
  logo: Logo;
  tinted?: boolean;
  className?: string;
}) {
  const { Icon } = logo;
  return (
    <span className={cn("inline-flex items-center gap-2 whitespace-nowrap text-[17px] leading-none", className)}>
      <Icon className="size-[1.35em] shrink-0" style={tinted ? { color: logo.color } : undefined} />
      <span className={logo.wordmark}>{logo.name}</span>
    </span>
  );
}
