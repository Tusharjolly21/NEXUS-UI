"use client";

import * as React from "react";
import { Check, Copy, Loader2, RotateCcw } from "lucide-react";
import { PLAYGROUND_LOADERS, type SectionPlayground } from "@/components/blocks/playgrounds";
import {
  PropControl,
  cleanDefaultValue,
  getEditableProps,
  propValueToCode,
  type PropDoc,
} from "@/components/library/prop-controls";
import { cn } from "@/lib/utils";

type LoadState = { status: "loading" } | { status: "ready"; playground: SectionPlayground | null } | { status: "error" };

/**
 * The Customize tab of a block section: the section's main props as controls, the section itself
 * re-rendered live with those values, and the matching JSX to copy. The block's playground module
 * is downloaded the first time a Customize tab on its page opens.
 */
export function SectionCustomizer({ block, sectionId, title }: { block: string; sectionId: string; title: string }) {
  const [state, setState] = React.useState<LoadState>({ status: "loading" });

  React.useEffect(() => {
    const load = PLAYGROUND_LOADERS[block];
    let alive = true;
    if (!load) {
      queueMicrotask(() => alive && setState({ status: "ready", playground: null }));
      return () => {
        alive = false;
      };
    }
    load()
      .then((mod) => alive && setState({ status: "ready", playground: mod.default[sectionId] ?? null }))
      .catch(() => alive && setState({ status: "error" }));
    return () => {
      alive = false;
    };
  }, [block, sectionId]);

  if (state.status === "loading") {
    return (
      <Panel>
        <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden />
        <p className="text-[14px] text-muted-foreground" role="status">
          Loading the controls…
        </p>
      </Panel>
    );
  }
  if (state.status === "error") {
    return (
      <Panel>
        <p className="text-[15px] font-medium text-foreground">The controls didn&apos;t load.</p>
        <p className="text-[14px] text-muted-foreground">Check your connection and open the tab again.</p>
      </Panel>
    );
  }
  if (!state.playground) {
    return (
      <Panel>
        <p className="text-[15px] font-medium text-foreground">Nothing to tweak here yet.</p>
        <p className="max-w-[360px] text-[14px] text-muted-foreground">The Code tab has the full source of {title}.</p>
      </Panel>
    );
  }
  return <Playground key={sectionId} playground={state.playground} title={title} />;
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-[28px] bg-card px-6 text-center shadow-[0_0_0_0.5px_var(--border)]">
      {children}
    </div>
  );
}

function Playground({ playground, title }: { playground: SectionPlayground; title: string }) {
  const { Component, baseProps, props, jsxName, importLine, snippetProps = [], frameClassName } = playground;
  const editable = React.useMemo(() => getEditableProps(props), [props]);
  const defaults = React.useMemo(
    () => Object.fromEntries(editable.map((p) => [p.name, cleanDefaultValue(p)])) as Record<string, unknown>,
    [editable],
  );
  const [values, setValues] = React.useState<Record<string, unknown>>(defaults);
  // Remount the live section when a value changes the way it starts (and after Reset).
  const [run, setRun] = React.useState(0);

  const changed = editable.filter((p) => !Object.is(values[p.name], defaults[p.name]));
  const snippet = React.useMemo(() => {
    const attrs = [...snippetProps, ...changed.map((p) => `${p.name}=${propValueToCode(values[p.name], p)}`)];
    const tag = attrs.length ? `<${jsxName}\n${attrs.map((a) => `  ${a}`).join("\n")}\n/>` : `<${jsxName} />`;
    return `${importLine}\n\n${tag}`;
  }, [changed, importLine, jsxName, snippetProps, values]);

  return (
    <div className="grid gap-4">
      <div
        className={cn(
          "relative isolate overflow-hidden rounded-[28px] bg-card p-2 shadow-[0_0_0_0.5px_var(--border),0_24px_60px_-36px_rgba(0,0,0,0.35)]",
        )}
      >
        <div className={cn("relative overflow-hidden rounded-[22px] bg-background [contain:paint] [&>*]:min-h-[420px] [&>*]:w-full", frameClassName)}>
          <PreviewBoundary key={run} onReset={() => { setValues(defaults); setRun((r) => r + 1); }}>
            <Component {...baseProps} {...values} />
          </PreviewBoundary>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[15px] font-semibold text-foreground">
              {editable.length ? "Props" : "No simple props to tweak"}
            </p>
            {editable.length ? (
              <button
                type="button"
                onClick={() => {
                  setValues(defaults);
                  setRun((r) => r + 1);
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground/[0.07] px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-foreground/[0.11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                Reset
              </button>
            ) : null}
          </div>
          {editable.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {editable.map((prop) => (
                <PropControl
                  key={prop.name}
                  prop={prop}
                  value={values[prop.name] ?? cleanDefaultValue(prop)}
                  onChange={(value) => setValues((current) => ({ ...current, [prop.name]: value }))}
                />
              ))}
            </div>
          ) : (
            <p className="text-[14px] text-muted-foreground">
              {title} takes its content as data. The Code tab shows the shape it expects.
            </p>
          )}
        </div>

        <SnippetCard code={snippet} />
      </div>

      <PropsList props={props} />
    </div>
  );
}

function SnippetCard({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-[22px] bg-[#1d1d1f] text-[#e6e6ea] lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
        <p className="text-[13px] font-medium text-white">Your JSX</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(code).then(() => setCopied(true), () => setCopied(false));
          }}
          className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {copied ? <Check className="size-3.5" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
          <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="max-h-[380px] overflow-auto p-5 font-mono text-[12.5px] leading-6">{code}</pre>
    </div>
  );
}

function PropsList({ props }: { props: PropDoc[] }) {
  if (!props.length) return null;
  return (
    <details className="group rounded-[22px] bg-card shadow-[0_0_0_0.5px_var(--border)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 text-[15px] font-semibold text-foreground [&::-webkit-details-marker]:hidden">
        All props ({props.length})
        <span className="text-[13px] font-medium text-link group-open:hidden">Show</span>
        <span className="hidden text-[13px] font-medium text-link group-open:inline">Hide</span>
      </summary>
      <div className="overflow-x-auto border-t border-border">
        <table className="w-full min-w-[600px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-border text-[13px] text-muted-foreground">
              <th className="px-5 py-3 font-medium">Prop</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Default</th>
              <th className="px-5 py-3 font-medium">What it does</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name} className="border-b border-border last:border-0 align-top">
                <td className="px-5 py-3 font-mono text-[13px] font-semibold text-foreground">{p.name}</td>
                <td className="max-w-[220px] break-words px-5 py-3 font-mono text-[12.5px] text-link">{p.type}</td>
                <td className="px-5 py-3 font-mono text-[12.5px] text-muted-foreground">{p.defaultValue ?? "—"}</td>
                <td className="px-5 py-3 text-body">{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

/** Some value combinations can throw inside a section; show a way back instead of a blank frame. */
class PreviewBoundary extends React.Component<
  { children: React.ReactNode; onReset: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-[15px] font-medium text-foreground">Those values broke the preview.</p>
        <button
          type="button"
          onClick={this.props.onReset}
          className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-[13px] font-medium text-background"
        >
          Reset the props
        </button>
      </div>
    );
  }
}
