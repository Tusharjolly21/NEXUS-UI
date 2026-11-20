"use client";

import { useMemo, useState } from "react";

type Layer = { x: number; y: number; blur: number; spread: number; color: string; opacity: number; inset: boolean };

const PRESETS: { name: string; layers: Layer[] }[] = [
  { name: "Soft card", layers: [{ x: 0, y: 20, blur: 40, spread: -26, color: "#000000", opacity: 35, inset: false }, { x: 0, y: 0, blur: 0, spread: 1, color: "#000000", opacity: 5, inset: false }] },
  { name: "Lifted", layers: [{ x: 0, y: 10, blur: 15, spread: -3, color: "#000000", opacity: 10, inset: false }, { x: 0, y: 4, blur: 6, spread: -4, color: "#000000", opacity: 10, inset: false }] },
  { name: "Glow", layers: [{ x: 0, y: 0, blur: 30, spread: 2, color: "#0071e3", opacity: 45, inset: false }] },
  { name: "Pressed in", layers: [{ x: 0, y: 2, blur: 6, spread: 0, color: "#000000", opacity: 25, inset: true }] },
  { name: "Hard offset", layers: [{ x: 6, y: 6, blur: 0, spread: 0, color: "#1d1d1f", opacity: 100, inset: false }] },
];

function rgba(hex: string, opacity: number) {
  const n = parseInt(hex.replace("#", "").padEnd(6, "0").slice(0, 6), 16);
  return `rgb(${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255} / ${opacity}%)`;
}

function layerCss(l: Layer) {
  return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba(l.color, l.opacity)}`;
}

function Slider({ label, value, min, max, onChange, unit = "px" }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) {
  return (
    <label className="block text-[13.5px] text-muted-foreground">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="tabular-nums text-foreground">
          {value}
          {unit}
        </span>
      </span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full accent-[#0071e3]" />
    </label>
  );
}

export function BoxShadowGenerator() {
  const [layers, setLayers] = useState<Layer[]>(PRESETS[0].layers);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"css" | "tw" | null>(null);
  const [dark, setDark] = useState(false);

  const layer = layers[Math.min(active, layers.length - 1)];
  const css = useMemo(() => layers.map(layerCss).join(",\n    "), [layers]);
  const tailwind = useMemo(() => `shadow-[${layers.map((l) => layerCss(l).replace(/ /g, "_")).join(",")}]`, [layers]);

  const patch = (p: Partial<Layer>) => setLayers((ls) => ls.map((l, i) => (i === active ? { ...l, ...p } : l)));
  const copy = async (kind: "css" | "tw", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard blocked: the text is still selectable on the page */
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Presets">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setLayers(p.layers);
                setActive(0);
              }}
              className="rounded-full bg-card px-3.5 py-1.5 text-[13.5px] text-foreground shadow-[0_0_0_1px_rgba(0,0,0,.08)] outline-none transition-colors hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-[#0071e3] dark:shadow-[0_0_0_1px_rgba(255,255,255,.12)]"
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Shadow layers">
          {layers.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full px-3.5 py-1.5 text-[13.5px] outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] ${i === active ? "bg-foreground text-background" : "bg-card text-foreground"}`}
            >
              Layer {i + 1}
            </button>
          ))}
          {layers.length < 4 && (
            <button
              type="button"
              onClick={() => {
                setLayers((ls) => [...ls, { x: 0, y: 8, blur: 16, spread: 0, color: "#000000", opacity: 15, inset: false }]);
                setActive(layers.length);
              }}
              className="rounded-full px-3.5 py-1.5 text-[13.5px] text-link outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              Add layer
            </button>
          )}
          {layers.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setLayers((ls) => ls.filter((_, i) => i !== active));
                setActive(0);
              }}
              className="rounded-full px-3.5 py-1.5 text-[13.5px] text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
            >
              Remove layer
            </button>
          )}
        </div>

        <div className="space-y-3 rounded-[20px] bg-card p-5 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
          <Slider label="Horizontal offset" value={layer.x} min={-60} max={60} onChange={(x) => patch({ x })} />
          <Slider label="Vertical offset" value={layer.y} min={-60} max={60} onChange={(y) => patch({ y })} />
          <Slider label="Blur" value={layer.blur} min={0} max={120} onChange={(blur) => patch({ blur })} />
          <Slider label="Spread" value={layer.spread} min={-60} max={60} onChange={(spread) => patch({ spread })} />
          <Slider label="Opacity" value={layer.opacity} min={0} max={100} unit="%" onChange={(opacity) => patch({ opacity })} />
          <div className="flex items-center justify-between gap-4 pt-1 text-[13.5px] text-muted-foreground">
            <label className="flex items-center gap-2">
              Colour
              <input type="color" value={layer.color} onChange={(e) => patch({ color: e.target.value })} className="h-7 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={layer.inset} onChange={(e) => patch({ inset: e.target.checked })} className="size-4 accent-[#0071e3]" />
              Inset
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div
          className="grid min-h-[280px] place-items-center rounded-[24px] p-8 transition-colors"
          style={{ background: dark ? "#1c1c1e" : "#f5f5f7" }}
        >
          <div
            className="size-40 rounded-[28px]"
            style={{ background: dark ? "#2c2c2e" : "#ffffff", boxShadow: layers.map(layerCss).join(", ") }}
            aria-label="Shadow preview"
            role="img"
          />
        </div>
        <label className="flex items-center gap-2 text-[13.5px] text-muted-foreground">
          <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} className="size-4 accent-[#0071e3]" />
          Preview on a dark surface
        </label>

        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-foreground">CSS</h3>
            <button type="button" onClick={() => copy("css", `box-shadow: ${layers.map(layerCss).join(", ")};`)} className="text-[13.5px] text-link outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
              {copied === "css" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-1.5 overflow-x-auto rounded-[14px] bg-card p-4 text-[12.5px] leading-relaxed text-foreground">{`box-shadow:\n    ${css};`}</pre>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-foreground">Tailwind CSS</h3>
            <button type="button" onClick={() => copy("tw", tailwind)} className="text-[13.5px] text-link outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]">
              {copied === "tw" ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap break-all rounded-[14px] bg-card p-4 text-[12.5px] leading-relaxed text-foreground">{tailwind}</pre>
        </div>
      </div>
    </div>
  );
}
