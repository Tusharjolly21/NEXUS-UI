"use client";

import * as React from "react";
import { highlight } from "sugar-high";
import { GooeyInput } from "@/components/gooey-input";
import { LikeBurst } from "@/components/like-burst";
import { SlideToConfirm } from "@/components/slide-to-confirm";
import { cn } from "@/lib/utils";

/**
 * Each scene is a real snippet and the component it describes: the code in the editor is exactly what renders
 * underneath, same props and all.
 */
const SCENES = [
  {
    file: "search.tsx",
    slug: "gooey-input",
    code: `import { GooeyInput } from "@/components/gooey-input";

export function Search() {
  return (
    <GooeyInput
      placeholder="Search…"
      expandedWidth={220}
    />
  );
}`,
    render: () => <GooeyInput placeholder="Search…" expandedWidth={220} />,
  },
  {
    file: "deploy.tsx",
    slug: "slide-to-confirm",
    code: `import { SlideToConfirm } from "@/components/slide-to-confirm";

export function Deploy() {
  return (
    <SlideToConfirm
      label="Slide to deploy"
      successLabel="Deployed"
    />
  );
}`,
    render: () => <SlideToConfirm label="Slide to deploy" successLabel="Deployed" />,
  },
  {
    file: "like.tsx",
    slug: "like-burst",
    code: `import { LikeBurst } from "@/components/like-burst";

export function Like() {
  return (
    <LikeBurst
      defaultCount={1299}
      color="#ff3b5c"
    />
  );
}`,
    render: () => <LikeBurst defaultCount={1299} color="#ff3b5c" />,
  },
] as const;

/** The component's own lines (0-based, inclusive) are lit in the editor; every snippet has it in the same place. */
const ACTIVE_FIRST = 4;
const ACTIVE_LAST = 6;
const LINE_COUNT = 10;

/**
 * The hero's right side: a code editor and, under it, the real component that code renders, running. It follows the
 * site theme (a light editor on the light theme, a dark one on the dark theme). Nothing on it moves by itself; the
 * file tabs swap the example, and the component is live, so it can be used where it sits.
 */
export function CodeToUi() {
  const [scene, setScene] = React.useState(0);
  // The hero shows this only from 1024px up. Below that the component isn't mounted at all, so phones don't pay for it.
  const [wide, setWide] = React.useState(false);
  const current = SCENES[scene];

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const html = React.useMemo(() => highlight(current.code), [current.code]);

  return (
    <div className="cx-ide relative mx-auto w-full max-w-[520px]">
      <div className="cx-ide-card overflow-hidden rounded-[20px]">
        <div className="cx-ide-bar flex items-center gap-3 px-4 py-2.5">
          <div className="flex gap-1.5" aria-hidden>
            <span className="cx-ide-light" />
            <span className="cx-ide-light" />
            <span className="cx-ide-light" />
          </div>
          <div role="tablist" aria-label="Examples" className="flex min-w-0 gap-1 overflow-x-auto">
            {SCENES.map((s, i) => (
              <button
                key={s.file}
                role="tab"
                type="button"
                aria-selected={i === scene}
                onClick={() => setScene(i)}
                className={cn("cx-ide-tab", i === scene && "cx-ide-tab-on")}
              >
                {s.file}
                {i === scene ? <span aria-hidden className="cx-ide-modified" /> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="cx-ide-code relative flex gap-3.5 pb-2.5 pt-3.5 font-mono text-[12.5px] leading-[22px]">
          <span
            aria-hidden
            className="cx-ide-active absolute inset-x-0"
            style={{ top: 14 + ACTIVE_FIRST * 22, height: (ACTIVE_LAST - ACTIVE_FIRST + 1) * 22 }}
          />
          <div aria-hidden className="cx-ide-gutter relative w-10 shrink-0 select-none pl-1.5 text-right">
            {Array.from({ length: LINE_COUNT }).map((_, i) => (
              <div key={i} data-on={i >= ACTIVE_FIRST && i <= ACTIVE_LAST ? "" : undefined}>
                {i + 1}
              </div>
            ))}
          </div>
          <pre className="cx-ide-text relative min-w-0 flex-1 overflow-hidden whitespace-pre">
            <code dangerouslySetInnerHTML={{ __html: html }} />
          </pre>
        </div>

        <div className="cx-ide-status flex items-center justify-between px-4 py-1.5 font-mono text-[10.5px]">
          <span className="flex items-center gap-2">
            <span aria-hidden className="cx-ide-ok">●</span>
            Ready · 0 errors
          </span>
          <span>TSX&nbsp;&nbsp; UTF-8&nbsp;&nbsp; Ln 5, Col 9</span>
        </div>
      </div>

      {/* what the code renders: one soft pool of light, the component itself, and its name */}
      <div className="relative mt-5 flex h-[190px] flex-col items-center justify-center">
        <div aria-hidden className="cx-ide-glow pointer-events-none absolute inset-x-8 inset-y-2" />
        <div className="relative grid h-[84px] w-full place-items-center">{wide ? <div className="scale-[1.2]">{current.render()}</div> : null}</div>
        <p className="relative mt-6 font-mono text-[11.5px] text-muted-foreground">{current.slug} · live</p>
      </div>
    </div>
  );
}
