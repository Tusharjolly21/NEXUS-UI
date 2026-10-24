# Workflow Network

Add the "Workflow Network" component from Nexus UI to my project.

One trigger fans out to its targets along curved wires on a dark dotted canvas. Light runs out of the source along every wire at once, fills each one up to its target, holds, then drains and starts again, with an optional dot riding the front of each beam. Hover or focus a target to light only its route. Wires are measured from the real cards, so they stay attached at any width.

Please:

1. Create the files below at sensible paths for this project, keeping each file's name. They import each other with relative paths, so keep them together.
2. Install what it needs: `framer-motion`, `clsx`, `tailwind-merge` (use this project's package manager).
3. It is styled with Tailwind CSS classes, so the project needs Tailwind.
4. It imports `cn` from `@/lib/utils`. If the project has no such helper, create it from the file below.
5. Use it like this: `import { WorkflowNetwork } from "@/components/workflow-network";`. The props are typed and documented in the code.

Copy the code exactly as it is. Do not restyle, simplify or rename anything, and keep the comments: they explain why the numbers are what they are. The only thing to adapt is import paths, if this project uses a different alias than `@/`.

--- components/workflow-network/index.ts ---

```ts
export { WorkflowNetwork } from "./workflow-network";
export type { WorkflowNetworkProps, FlowNode } from "./workflow-network";
```

--- components/workflow-network/workflow-network.tsx ---

```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type FlowNode = {
  title: string;
  sub: string;
  /** Icon colour. */
  color: string;
  /** Icon: any React node (an inline SVG, or an <img> of a logo). */
  icon: ReactNode;
};

const I = (d: ReactNode) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
  </svg>
);

const SOURCE: FlowNode = { title: "Error Trigger", sub: "5xx Detected", color: "#ef4444", icon: I(<path d="M13 2 4.5 13.5H12L11 22l8.5-11.5H12Z" />) };
const TARGETS: FlowNode[] = [
  { title: "Mattermost", sub: "post: message", color: "#3b82f6", icon: I(<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />) },
  { title: "Twilio", sub: "send: sms", color: "#ef4444", icon: I(<><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></>) },
  { title: "Kafka", sub: "log: event", color: "#a1a1aa", icon: I(<path d="M22 12h-4l-3 9L9 3l-3 9H2" />) },
];

function Node({ node, refEl, active, dim, onEnter, onLeave }: { node: FlowNode; refEl: (el: HTMLDivElement | null) => void; active?: boolean; dim?: boolean; onEnter?: () => void; onLeave?: () => void }) {
  return (
    <motion.div
      ref={refEl}
      tabIndex={0}
      onHoverStart={onEnter}
      onHoverEnd={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      animate={{
        opacity: dim ? 0.5 : 1,
        borderColor: active ? "rgba(59,130,246,.9)" : "rgba(255,255,255,.08)",
        boxShadow: active ? "0 0 0 3px rgba(59,130,246,.18), 0 10px 30px -12px rgba(0,0,0,.8)" : "0 0 0 0 rgba(59,130,246,0), 0 10px 30px -14px rgba(0,0,0,.8)",
      }}
      transition={{ duration: 0.2 }}
      className="relative z-10 flex w-[150px] items-center gap-3 rounded-[10px] border bg-[#18181b] px-3.5 py-2.5 outline-none sm:w-[168px]"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center" style={{ color: node.color }}>
        {node.icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-semibold tracking-[-0.005em] text-[#fafafa]">{node.title}</span>
        <span className="block truncate text-[11.5px] text-[#a1a1aa]">{node.sub}</span>
      </span>
    </motion.div>
  );
}

/**
 * Workflow Network: one source fans out to its targets along curved wires on a dark, dotted canvas.
 * Light runs out of the source along every wire at once, fills each one up to its target, holds,
 * then drains away and starts again; a dot can ride the front of each beam. Hover or focus a target
 * to light only its route: its card gets a blue edge and the others dim, without breaking the
 * rhythm. Wires are measured from the real cards, so they stay attached at any width. Pauses off
 * screen. Off `autoplay`, the wires rest filled.
 */
export type WorkflowNetworkProps = {
  source?: FlowNode;
  targets?: FlowNode[];
  beamColor?: string;
  /** Seconds for one fill, hold and drain. */
  cycle?: number;
  /** Ride a dot on the front of each beam. */
  dots?: boolean;
  /** Loop forever, or fill once and stay lit. */
  mode?: "loop" | "once";
  /** Runs the beams. Off, the wires rest filled. */
  autoplay?: boolean;
  className?: string;
};

export function WorkflowNetwork({
  source = SOURCE,
  targets = TARGETS,
  beamColor = "#3b6cf6",
  cycle = 2.6,
  dots = true,
  mode = "loop",
  autoplay = false,
  className,
}: WorkflowNetworkProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const srcRef = useRef<HTMLDivElement | null>(null);
  const tgtRefs = useRef<(HTMLDivElement | null)[]>([]);
  const wireRefs = useRef<(SVGPathElement | null)[]>([]);
  const beamRefs = useRef<(SVGPathElement | null)[]>([]);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const [focus, setFocus] = useState<number | null>(null);
  const focusRef = useRef<number | null>(null);
  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    let raf = 0;
    let visible = true;
    const start = performance.now();
    const ease = (x: number) => 1 - Math.pow(1 - x, 3);
    const frame = (now: number) => {
      raf = visible ? requestAnimationFrame(frame) : 0;
      if (!visible) return;
      const box = boxRef.current, src = srcRef.current;
      if (!box || !src) return;
      const b = box.getBoundingClientRect();
      const s = src.getBoundingClientRect();
      // The canvas can sit inside a scaled parent (preview shells use a CSS
      // transform), so convert screen-space deltas back to layout space.
      const k = box.offsetWidth ? b.width / box.offsetWidth : 1;
      const ax = (s.right - b.left) / k, ay = (s.top + s.height / 2 - b.top) / k;
      const t = autoplay ? (now - start) / 1000 : cycle * 0.6;
      // fill 0-55%, hold to 75%, drain from the source end to 100%
      const p = mode === "once" ? Math.min(1, t / cycle) * 0.55 : (t / cycle) % 1;
      const head = ease(Math.min(1, p / 0.55));
      const tail = p > 0.75 ? ease((p - 0.75) / 0.25) : 0;
      targets.forEach((_, i) => {
        const el = tgtRefs.current[i];
        const wire = wireRefs.current[i], beam = beamRefs.current[i], dot = dotRefs.current[i];
        if (!el || !wire || !beam) return;
        const r = el.getBoundingClientRect();
        const bx = (r.left - b.left) / k, by = (r.top + r.height / 2 - b.top) / k;
        const dx = Math.max(30, (bx - ax) * 0.55);
        const d = `M${ax},${ay} C${ax + dx},${ay} ${bx - dx},${by} ${bx},${by}`;
        wire.setAttribute("d", d);
        beam.setAttribute("d", d);
        const f = focusRef.current;
        const on = f === null || f === i;
        // pathLength = 1, so the dash maths is in fractions of the wire
        beam.style.strokeDasharray = `${Math.max(0.0001, head - tail)} 2`;
        beam.style.strokeDashoffset = String(-tail);
        beam.style.opacity = on ? "1" : "0.12";
        wire.style.opacity = on ? "1" : "0.5";
        if (dot) {
          const L = wire.getTotalLength();
          const pt = wire.getPointAtLength(head * L);
          dot.setAttribute("cx", String(pt.x));
          dot.setAttribute("cy", String(pt.y));
          dot.style.opacity = dots && on && head < 0.999 && head > 0.01 ? "1" : "0";
        }
      });
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    if (boxRef.current) io.observe(boxRef.current);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [targets, cycle, autoplay, mode, dots]);

  return (
    <div
      ref={boxRef}
      className={cn("relative flex h-[400px] w-full items-center justify-center gap-[clamp(48px,12%,140px)] overflow-hidden rounded-[24px] bg-[#0b0b0c] px-6", className)}
      style={{
        backgroundImage: "radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, system-ui, sans-serif",
      }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {targets.map((tg, i) => (
          <g key={tg.title}>
            <path ref={(el) => { wireRefs.current[i] = el; }} fill="none" stroke="rgba(255,255,255,.13)" strokeWidth="1.25" />
            <path ref={(el) => { beamRefs.current[i] = el; }} fill="none" stroke={beamColor} strokeWidth="2" strokeLinecap="round" pathLength={1} style={{ filter: `drop-shadow(0 0 4px ${beamColor}aa)` }} />
            <circle ref={(el) => { dotRefs.current[i] = el; }} r="2.6" fill="#ffffff" style={{ filter: `drop-shadow(0 0 5px ${beamColor})`, opacity: 0 }} />
          </g>
        ))}
      </svg>
      <Node node={source} refEl={(el) => { srcRef.current = el; }} />
      <div className="flex flex-col gap-10">
        {targets.map((tg, i) => (
          <div key={tg.title} style={{ marginLeft: i === Math.floor(targets.length / 2) ? 56 : 0 }}>
            <Node
              node={tg}
              refEl={(el) => { tgtRefs.current[i] = el; }}
              active={focus === i}
              dim={focus !== null && focus !== i}
              onEnter={() => setFocus(i)}
              onLeave={() => setFocus(null)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

--- lib/utils.ts ---

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```
