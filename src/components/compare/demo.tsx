"use client";

import * as React from "react";
import { Compare } from "./compare";

// ── Syntax-highlighted code panels ────────────────────────────────────────────
// Colors match VS Code dark theme
const kw  = (s: string) => <span style={{ color: "#569cd6" }}>{s}</span>;
const fn_  = (s: string) => <span style={{ color: "#dcdcaa" }}>{s}</span>;
const str = (s: string) => <span style={{ color: "#ce9178" }}>{s}</span>;
const cm  = (s: string) => <span style={{ color: "#6a9955", fontStyle: "italic" }}>{s}</span>;
const va  = (s: string) => <span style={{ color: "#9cdcfe" }}>{s}</span>;
const dim = (s: string) => <span style={{ color: "#555" }}>{s}</span>;

function CodePane({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#1e1e1e] p-6">
      <pre
        className="h-full overflow-hidden font-mono text-[13px] leading-7"
        style={{ color: "#d4d4d4" }}
      >
        {children}
      </pre>
    </div>
  );
}

const BeforeCode = (
  <CodePane>
    {kw("const")} {va("handleEnd")} {"= "}{fn_("useCallback")}{"(() => {"}{"\n"}
    {"  "}{cm("// Implement this")}{"\n"}
    {"  "}{cm("// Stop dragging")}{"\n"}
    {"}, []);"}{"\n\n"}
    {kw("const")} {va("handleMove")} {"= "}{fn_("useCallback")}{"("}{"\n"}
    {"  "}{dim("/**")}{"\n"}
    {"   "}{dim("*")}{"\n"}
    {"   "}{dim("* Implement this")}{"\n"}
    {"   "}{dim("*")}{"\n"}
    {"   "}{dim("*/")}{"\n"}
    {"  ["}{va("slideMode")}{", "}{va("isDragging")}{"]"}{"\n"}
    {");"}{"\n\n"}
    {kw("const")} {va("handleMouseDown")} {"= "}{fn_("useCallback")}{"("}{"\n"}
    {"  "}{cm("// Implement this")}{"\n"}
    {"  (e) => "}{fn_("handleStart")}{"(e.clientX),"}{"\n"}
    {"  ["}{va("handleStart")}{"]"}{"\n"}
    {");"}
  </CodePane>
);

const AfterCode = (
  <CodePane>
    {kw("const")} {va("handleEnd")} {"= "}{fn_("useCallback")}{"(() => {"}{"\n"}
    {"  "}{fn_("setIsDragging")}{"("}{kw("false")}{");"}{"\n"}
    {"  "}{fn_("setSlideMode")}{"("}{str('"hover"')}{");"}{"\n"}
    {"}, []);"}{"\n\n"}
    {kw("const")} {va("handleMove")} {"= "}{fn_("useCallback")}{"("}{"\n"}
    {"  ("}{va("clientX")}{": "}{kw("number")}{") => {"}{"\n"}
    {"    "}{kw("if")}{"(!"}{va("containerRef")}{".current) "}{kw("return")}{"\n"}
    {"    "}{kw("const")} {va("rect")} {"= "}{va("containerRef")}{".current."}{fn_("getBoundingClientRect")}{"();"}{"\n"}
    {"    "}{kw("const")} {va("x")} {"= "}{va("clientX")} {"- "}{va("rect")}{".left;"}{"\n"}
    {"    "}{fn_("setPosition")}{"(Math."}{fn_("max")}{"(0, Math."}{fn_("min")}{"(100, ("}{va("x")}{" / "}{va("rect")}{".width) * 100)));"}{"\n"}
    {"  },"}{"\n"}
    {"  ["}{va("slideMode")}{", "}{va("isDragging")}{"]"}{"\n"}
    {");"}{"\n\n"}
    {kw("const")} {va("handleMouseDown")} {"= "}{fn_("useCallback")}{"("}{"\n"}
    {"  ("}{va("e")}{": MouseEvent) => "}{fn_("handleStart")}{"("}{va("e")}{".clientX),"}{"\n"}
    {"  ["}{va("handleStart")}{"]"}{"\n"}
    {");"}
  </CodePane>
);

// ── Shared code block for usage snippets ──────────────────────────────────────
function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-border/50 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Code</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            });
          }}
          className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed text-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ── Root ───────────────────────────────────────────────────────────────────────
export function CompareDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-14 px-4 py-12">

      {/* ── Example 1: Image compare ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Image Compare</h2>
          <p className="text-sm text-muted-foreground">
            Hover left and right to compare two images.
          </p>
        </div>
        <Compare
          beforeImage="https://picsum.photos/seed/cmp-a/1200/675?grayscale"
          afterImage="https://picsum.photos/seed/cmp-a/1200/675"
          beforeLabel="Before"
          afterLabel="After"
          className="aspect-video w-full"
        />
        <CodeBlock code={`import { Compare } from "@/components/compare";

export function ImageCompare() {
  return (
    <Compare
      beforeImage="/images/before.jpg"
      afterImage="/images/after.jpg"
      beforeLabel="Before"
      afterLabel="After"
      className="aspect-video w-full"
    />
  );
}`} />
      </section>

      <div className="h-px bg-border/50" />

      {/* ── Example 2: Code compare ── */}
      <section className="space-y-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">Code Compare</h2>
          <p className="text-sm text-muted-foreground">
            Hover left and right to reveal the implementation. Pass any{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">ReactNode</code> as{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">beforeContent</code> /{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-[11px]">afterContent</code>.
          </p>
        </div>
        <Compare
          beforeContent={BeforeCode}
          afterContent={AfterCode}
          beforeLabel="Before"
          afterLabel="After"
          className="h-80 w-full"
        />
        <CodeBlock code={`import { Compare } from "@/components/compare";

export function CodeCompare() {
  return (
    <Compare
      beforeContent={<MyCodePanel code={incompleteSrc} />}
      afterContent={<MyCodePanel code={completeSrc} />}
      beforeLabel="Before"
      afterLabel="After"
      className="h-80 w-full"
    />
  );
}`} />
      </section>

    </div>
  );
}
