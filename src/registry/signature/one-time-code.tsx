"use client";

import * as React from "react";
import { OneTimeCode } from "@/components/one-time-code";
import { DemoCursor } from "@/registry/signature/demo-cursor";

const CORRECT = "428913";
const ATTEMPTS = ["428193", CORRECT];

const verify = (code: string) =>
  new Promise<boolean>((resolve) => window.setTimeout(() => resolve(code === CORRECT), 850));

export function PreviewOneTimeCode({ compact = false }: { compact?: boolean } = {}) {
  const [value, setValue] = React.useState("");
  const [demo, setDemo] = React.useState(true);
  const [highlight, setHighlight] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  // Types a wrong code, then the right one, on a loop — until someone uses it for real.
  React.useEffect(() => {
    if (!demo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const node = rootRef.current;
    let timers: number[] = [];
    let running = false;
    let attempt = 0;
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));

    const typeCode = (code: string, at: number) => {
      for (let i = 1; i <= code.length; i++) later(() => setValue(code.slice(0, i)), at + i * 150);
      return at + code.length * 150;
    };

    const cycle = () => {
      const code = ATTEMPTS[attempt % ATTEMPTS.length];
      attempt += 1;
      setHighlight(true);
      const done = typeCode(code, 700);
      // wrong code: component shakes and clears itself; right code: hold the success, then reset
      const next = code === CORRECT ? done + 2900 : done + 2100;
      if (code === CORRECT) later(() => setValue(""), done + 2600);
      later(cycle, next);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        later(cycle, 1500);
      } else if (!entry.isIntersecting && running) {
        running = false;
        timers.forEach(clearTimeout);
        timers = [];
        setValue("");
      }
    });
    if (node) io.observe(node);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [demo]);

  const takeOver = (e: React.PointerEvent | React.KeyboardEvent) => {
    if ("pointerId" in e && e.pointerId === 71) return;
    if (demo) {
      setDemo(false);
      setHighlight(false);
      setValue("");
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative flex h-full min-h-[320px] w-full items-center justify-center p-6"
      onPointerDownCapture={takeOver}
      onKeyDownCapture={takeOver}
    >
      <div className="flex flex-col items-center gap-5">
        {!compact ? (
          <div className="text-center">
            <p className="text-[15px] font-semibold text-[#17181A] dark:text-neutral-50">Check your inbox</p>
            <p className="mt-1 text-[13px] text-[#73726d] dark:text-neutral-400">We sent a 6-digit code to ana@studio.co</p>
          </div>
        ) : null}
        <OneTimeCode value={value} onChange={setValue} onComplete={verify} highlightActive={highlight} />
        {!compact ? (
          <p className="text-[12px] text-[#73726d] dark:text-neutral-400">
            Try <span className="font-medium tabular-nums text-[#17181A] dark:text-neutral-200">428 913</span>
          </p>
        ) : null}
      </div>
      {demo ? (
        <DemoCursor
          script={[
            { x: 0.62, y: 0.78, ms: 0 },
            { x: 0.33, y: 0.52, ms: 700, action: "click", wait: 6000 },
          ]}
          loopDelay={2600}
        />
      ) : null}
    </div>
  );
}
