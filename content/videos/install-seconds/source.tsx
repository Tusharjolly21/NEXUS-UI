import type { CSSProperties, ReactNode } from "react";
import { FONT, GRAD, MONO, P, TEXT, blobsFor, clamp, ease, gradText, lerp, rise, spring, type Frame, type VideoMeta } from "./kit";

export interface InstallSecondsProps {
  title: string;
  pkg: string;
  file: string;
  name: string;
  label: string;
  done: string;
  url: string;
  sub: string;
}

export const meta: VideoMeta<InstallSecondsProps> = {
  id: "install-seconds",
  title: "Install in Seconds",
  platforms: ["X", "LinkedIn", "YouTube", "Shorts"],
  formats: ["1:1", "16:9", "9:16"],
  purpose: "Developer demo",
  motion: "Terminal, editor and live preview hand off to each other",
  app: "Nexus UI",
  duration: 12,
  bpm: 120,
  cuts: [1.0, 3.0, 4.4, 5.0, 7.4, 8.0, 9.6, 10.4],
  blurb: "The developer pitch in twelve seconds. The install command types itself, the CLI ticks through its checks, the new file flies into the editor, the import and one line of JSX type in, and the preview shows the component working under a real cursor.",
  defaults: {
    title: "Add motion in one line.",
    pkg: "@nexus-labs/slide-to-confirm",
    file: "components/ui/slide-to-confirm.tsx",
    name: "SlideToConfirm",
    label: "Slide to pay $49.99",
    done: "Payment confirmed",
    url: "nexus-ui.com",
    sub: "183 components. One command each.",
  },
  fields: [
    { key: "title", label: "Opening line", type: "text", max: 26 },
    { key: "pkg", label: "Registry item", type: "text", max: 40 },
    { key: "file", label: "File it creates", type: "text", max: 44 },
    { key: "name", label: "Component name", type: "text", max: 22 },
    { key: "label", label: "Slider label", type: "text", max: 22 },
    { key: "done", label: "Confirmed text", type: "text", max: 22 },
    { key: "url", label: "Address", type: "text", max: 22 },
    { key: "sub", label: "End card line", type: "text", max: 40 },
  ],
  prompt: `Make a 12-second developer demo video that renders in 1:1 (X, LinkedIn), 16:9 (YouTube) and 9:16 (Shorts) from one React component, re-laying out its panels for each shape. Apple-clean: light #f5f5f7 background, Inter Display for captions, SF Mono / ui-monospace for code. Music 120 BPM, soft keyboard ticks while typing, a tick per CLI check, a whoosh when the component slides.

Three panels — a dark terminal, a light code editor (Xcode light colours: pink keywords, red strings, blue JSX) and a light browser preview — animate between layout keyframes (position and size eased together, never cut). In 16:9 they sit side by side; in 1:1 and 9:16 they stack.

0–1s: "Add motion in one line." in big type, then it shrinks away as the terminal rises.
1–4.4s, caption "One command.": the terminal types "npx shadcn@latest add @nexus-labs/slide-to-confirm" at a human pace with a block caret, Enter, then three CLI lines each with a spinner that turns into a green check: Checking registry, Installing dependencies, Created 1 file, and the file path highlighted in blue.
4.4–5s: the file path lifts out of the terminal as a chip and flies to where the editor opens; the terminal shrinks aside.
5–7.4s, caption "Use it like any component.": the editor shows page.tsx; the import line types in, then the JSX line inside main types in, with a caret and line numbers.
7.4–8s: the editor moves aside and the preview opens.
8–10.4s, caption "It just moves.": a cursor grabs the slider's knob, drags it along the track (the track fills blue as it goes), lets go at the end; it turns green with a check and "Payment confirmed" fades up.
10.4–12s: panels shrink and blur away; end card "nexus-ui.com" in the brand gradient and "183 components. One command each."

Pure function of time t with frame width/height props; registry item, file path, component name and labels are props.`,
};

type R = [number, number, number, number]; // x, y, w, h as fractions of the frame
type Layout = { T: R; E: R; V: R };
const OFF: R = [0.5, 1.2, 0.2, 0.1];
const L = {
  land: [
    { T: [0.19, 0.28, 0.62, 0.46], E: [1.1, 0.17, 0.49, 0.7], V: [0.6, 1.2, 0.4, 0.7] },
    { T: [0.04, 0.22, 0.4, 0.5], E: [0.47, 0.17, 0.49, 0.7], V: [0.6, 1.2, 0.4, 0.7] },
    { T: [0.04, 0.22, 0.3, 0.3], E: [0.04, 0.17, 0.44, 0.7], V: [0.51, 0.17, 0.45, 0.7] },
  ] as Layout[],
  square: [
    { T: [0.06, 0.3, 0.88, 0.4], E: [0.06, 1.1, 0.88, 0.45], V: [0.06, 1.2, 0.88, 0.44] },
    { T: [0.06, 0.17, 0.88, 0.27], E: [0.06, 0.47, 0.88, 0.46], V: [0.06, 1.2, 0.88, 0.44] },
    { T: [0.06, 0.17, 0.88, 0.2], E: [0.06, 0.17, 0.88, 0.3], V: [0.06, 0.5, 0.88, 0.44] },
  ] as Layout[],
  tall: [
    { T: [0.06, 0.33, 0.88, 0.26], E: [0.06, 1.1, 0.88, 0.34], V: [0.06, 1.2, 0.88, 0.4] },
    { T: [0.06, 0.17, 0.88, 0.22], E: [0.06, 0.42, 0.88, 0.34], V: [0.06, 1.2, 0.88, 0.4] },
    { T: [0.06, 0.17, 0.88, 0.16], E: [0.06, 0.17, 0.88, 0.25], V: [0.06, 0.45, 0.88, 0.4] },
  ] as Layout[],
};
void OFF;

const lerpR = (a: R, b: R, q: number): R => [lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q), lerp(a[3], b[3], q)];
const abs: CSSProperties = { position: "absolute" };

/* tiny Xcode-light highlighter */
const KW = /\b(import|from|export|default|function|return|const)\b/;
function hl(code: string, fs: number): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /("[^"]*"?|<\/?[A-Za-z][\w.]*|\/?>|\b(?:import|from|export|default|function|return|const)\b|[{}()=;])/g;
  let last = 0, m: RegExpExecArray | null, k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(<span key={k++}>{code.slice(last, m.index)}</span>);
    const s = m[0];
    const color = s.startsWith('"') ? "#c41a16" : KW.test(s) ? "#9b2393" : s.startsWith("<") || s.endsWith(">") ? "#0b4f79" : "#6e6e73";
    out.push(<span key={k++} style={{ color, fontWeight: KW.test(s) ? 600 : 400 }}>{s}</span>);
    last = m.index + s.length;
  }
  if (last < code.length) out.push(<span key={k++}>{code.slice(last)}</span>);
  void fs;
  return out;
}

function Check({ s, c = "#30d158" }: { s: number; c?: string }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;
}
function Spinner({ s, t }: { s: number; t: number }) {
  return <svg width={s} height={s} viewBox="0 0 24 24" style={{ transform: `rotate(${t * 720}deg)` }}><circle cx="12" cy="12" r="9" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="3" /><path d="M12 3a9 9 0 019 9" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>;
}

export default function InstallSeconds({ t, w = 1080, h = 1080, ...props }: { t: number } & Frame & Partial<InstallSecondsProps>) {
  const p = { ...meta.defaults, ...props };
  const land = w > h * 1.2, tall = h > w * 1.2;
  const lay = land ? L.land : tall ? L.tall : L.square;
  const u = Math.min(w, h) / 1080;
  const fs = (land ? 28 : 30) * u; // code size

  const q1 = ease.inOut(P(t, 4.4, 5.0)), q2 = ease.inOut(P(t, 7.4, 8.0));
  const cur = (k: keyof Layout): R => lerpR(lerpR(lay[0][k], lay[1][k], q1), lay[2][k], q2);
  const box = (r: R): CSSProperties => ({ ...abs, left: r[0] * w, top: r[1] * h, width: r[2] * w, height: r[3] * h });
  const out = ease.in(P(t, 10.4, 10.9));
  const rise1 = spring(t - 0.85, 0.75, 9);

  // terminal
  const cmd = `npx shadcn@latest add ${p.pkg}`;
  const typed = cmd.slice(0, Math.floor(P(t, 1.05, 2.75) * cmd.length + 0.001));
  const steps = [{ s: "Checking registry.", a: 2.95, b: 3.25 }, { s: "Installing dependencies.", a: 3.3, b: 3.8 }, { s: "Created 1 file:", a: 3.85, b: 3.95 }];
  const tOp = 1 - P(t, 7.35, 7.7);

  // editor
  const imp = `import { ${p.name} } from "@/${p.file.replace(/\.tsx?$/, "")}";`;
  const jsx = `      <${p.name} label="${p.label}" />`;
  const impN = Math.floor(P(t, 5.1, 6.0) * imp.length + 0.001);
  const jsxN = Math.floor(P(t, 6.2, 7.15) * jsx.length + 0.001);
  const lines = [imp.slice(0, impN), "", "export default function Checkout() {", "  return (", '    <main className="grid place-items-center">', jsx.slice(0, jsxN), "    </main>", "  );", "}"];
  const caretLine = t < 6.1 ? 0 : 5;

  // preview: drag the knob
  const drag = ease.inOut(P(t, 8.6, 9.55));
  const confirmed = t > 9.6;
  const okS = spring(t - 9.6, 0.5, 14);

  const caption = t < 1.0 ? null : t < 4.4 ? { s: "One command.", a: 1.0, b: 4.4 } : t < 7.4 ? { s: "Use it like any component.", a: 4.95, b: 7.4 } : t < 10.4 ? { s: "It just moves.", a: 7.95, b: 10.35 } : null;
  const capTop = (tall ? 0.075 : land ? 0.055 : 0.06) * h;

  const panel = (r: R, dark: boolean, title: string, children: ReactNode, extra?: CSSProperties) => (
    <div style={{ ...box(r), borderRadius: 26 * u, overflow: "hidden", background: dark ? "#1c1c1e" : "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.07),0 40px 80px -36px rgba(0,0,0,.45)", ...extra }}>
      <div style={{ height: 50 * u, display: "flex", alignItems: "center", gap: 8 * u, padding: `0 ${20 * u}px`, borderBottom: dark ? "1px solid rgba(255,255,255,.08)" : "1px solid rgba(0,0,0,.06)", background: dark ? "#2a2a2c" : "#fbfbfd" }}>
        {[0, 1, 2].map((i) => <span key={i} style={{ width: 12 * u, height: 12 * u, borderRadius: 6 * u, background: dark ? "#48484a" : "#d9d9de" }} />)}
        <span style={{ marginLeft: 12 * u, fontFamily: TEXT, fontSize: 18 * u, fontWeight: 600, color: dark ? "rgba(255,255,255,.55)" : "#86868b" }}>{title}</span>
      </div>
      <div style={{ position: "relative", padding: `${22 * u}px ${26 * u}px` }}>{children}</div>
    </div>
  );

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {blobsFor(t, w, h).map((s, i) => <div key={i} style={s} />)}

      {t < 1.3 && (
        <div style={{ ...abs, left: 0, right: 0, top: h / 2 - 80 * u, textAlign: "center", fontSize: (land ? 120 : 104) * u, fontWeight: 700, letterSpacing: "-0.05em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, 0, 0.6)), 60, 14), opacity: clamp(ease.expo(P(t, 0, 0.6)) * 1.6) * (1 - P(t, 0.85, 1.2)) }}>{p.title}</div>
      )}

      {caption && (
        <div style={{ ...abs, left: 0, right: 0, top: capTop, textAlign: "center", fontSize: (land ? 64 : 60) * u, fontWeight: 700, letterSpacing: "-0.045em", whiteSpace: "nowrap", ...rise(ease.expo(P(t, caption.a, caption.a + 0.45)), 30, 10), opacity: clamp(ease.expo(P(t, caption.a, caption.a + 0.45)) * 1.6) * (1 - P(t, caption.b - 0.15, caption.b)) }}>{caption.s}</div>
      )}

      <div style={{ ...abs, inset: 0, transformOrigin: `${w / 2}px ${h / 2}px`, transform: `scale(${1 - out * 0.1})`, opacity: 1 - out, filter: out ? `blur(${out * 14}px)` : undefined }}>
        {/* terminal */}
        {t > 0.8 && tOp > 0 && panel(cur("T"), true, "zsh — my-app", (
          <div style={{ fontFamily: MONO, fontSize: fs, lineHeight: 1.55, color: "#f5f5f7", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            <div><span style={{ color: "#30d158" }}>~/my-app</span> <span style={{ color: "#8e8e93" }}>$</span> {typed}{t < 2.95 && <span style={{ display: "inline-block", width: fs * 0.55, height: fs * 1.05, background: "#f5f5f7", verticalAlign: -fs * 0.18, opacity: t < 1.05 || t > 2.75 ? (Math.floor(t * 3) % 2 ? 0 : 1) : 1 }} />}</div>
            {steps.map((s, i) => t > s.a && (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 * u, opacity: clamp((t - s.a) * 8) }}>
                {t < s.b ? <Spinner s={fs * 0.9} t={t} /> : <Check s={fs} />}<span>{s.s}</span>
              </div>
            ))}
            {t > 3.95 && <div style={{ paddingLeft: 30 * u, color: "#64d2ff", opacity: clamp((t - 3.95) * 8) * (t > 4.35 && t < 4.95 ? 0.3 : 1) }}>- {p.file}</div>}
          </div>
        ), { opacity: tOp, transform: `translateY(${(1 - rise1) * 300 * u}px)` })}

        {/* file chip flying from terminal to editor */}
        {t > 4.3 && t < 5.15 && (() => {
          const T = cur("T"), E = lay[1].E;
          const k = ease.inOut(P(t, 4.35, 5.0));
          const sx = (T[0] + 0.05) * w, sy = (T[1] + T[3] * 0.75) * h, ex = (E[0] + 0.03) * w, ey = (E[1] + 0.02) * h;
          return (
            <div style={{ ...abs, left: lerp(sx, ex, k), top: lerp(sy, ey, k) - Math.sin(k * Math.PI) * 120 * u, padding: `${10 * u}px ${18 * u}px`, borderRadius: 999, background: "#0071e3", color: "#fff", fontFamily: MONO, fontSize: fs * 0.8, whiteSpace: "nowrap", boxShadow: "0 18px 36px -14px rgba(0,113,227,.6)", transform: `scale(${1 + Math.sin(k * Math.PI) * 0.12})`, opacity: 1 - P(t, 4.95, 5.12), zIndex: 5 }}>
              {p.file.split("/").pop()}
            </div>
          );
        })()}

        {/* editor */}
        {t > 4.5 && panel(cur("E"), false, "app/page.tsx", (
          <div style={{ fontFamily: MONO, fontSize: fs * 0.92, lineHeight: 1.6, color: "#1d1d1f", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
            {lines.map((ln, i) => (
              <div key={i} style={{ display: "flex", gap: 18 * u, background: (i === 0 && t > 5.05 && t < 6.1) || (i === 5 && t > 6.15 && t < 7.2) ? "rgba(0,113,227,.07)" : "transparent", borderRadius: 6 * u }}>
                <span style={{ width: 28 * u, flex: "none", textAlign: "right", color: "#c7c7cc" }}>{i + 1}</span>
                <span style={{ minWidth: 0 }}>{hl(ln, fs)}{i === caretLine && t > 5.05 && t < 7.35 && <span style={{ display: "inline-block", width: 2.5 * u, height: fs, background: "#0071e3", verticalAlign: -fs * 0.15, opacity: Math.floor(t * 4) % 2 === 0 || (t > 5.1 && t < 6.0) || (t > 6.2 && t < 7.15) ? 1 : 0 }} />}</span>
              </div>
            ))}
          </div>
        ), { opacity: clamp(P(t, 4.6, 4.95)) })}

        {/* preview */}
        {t > 7.4 && (() => {
          const V = cur("V");
          const pw = V[2] * w, ph = V[3] * h;
          const trackW = Math.min(pw * 0.84, 820 * u), trackH = trackW * 0.16;
          const kx = (trackW - trackH) * drag;
          const tx = V[0] * w + (pw - trackW) / 2, ty = V[1] * h + 50 * u + (ph - 50 * u - trackH) / 2;
          const grab = t > 8.5 && t < 9.65;
          const cxp = t < 8.5 ? lerp(tx + trackW + 140 * u, tx + trackH / 2, ease.inOut(P(t, 7.9, 8.5))) : tx + trackH / 2 + kx;
          const cyp = t < 8.5 ? lerp(ty + trackH + 160 * u, ty + trackH / 2, ease.inOut(P(t, 7.9, 8.5))) : ty + trackH / 2;
          return (
            <>
              {panel(V, false, "localhost:3000", null, { background: "#f5f5f7" })}
              <div style={{ ...abs, left: tx, top: ty, width: trackW, height: trackH, borderRadius: trackH / 2, background: "#e8e8ed", overflow: "hidden", transform: `scale(${confirmed ? 1 + Math.sin(clamp(P(t, 9.6, 9.9)) * Math.PI) * 0.04 : 1})` }}>
                <div style={{ ...abs, left: 0, top: 0, bottom: 0, width: trackH + kx, borderRadius: trackH / 2, background: confirmed ? "#30d158" : "#0071e3" }} />
                <div style={{ ...abs, inset: 0, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: trackH * 0.6, fontFamily: TEXT, fontSize: trackH * 0.27, fontWeight: 600, color: confirmed ? "#fff" : "#6e6e73", opacity: confirmed ? 1 : 1 - drag * 1.4 }}>{confirmed ? "" : p.label}</div>
                <div style={{ ...abs, top: trackH * 0.08, left: trackH * 0.08 + kx * (confirmed ? 1 : 1), width: trackH * 0.84, height: trackH * 0.84, borderRadius: "50%", background: "#fff", boxShadow: "0 6px 14px rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${grab ? 0.94 : confirmed ? lerp(0.6, 1, okS) : 1})` }}>
                  {confirmed ? <Check s={trackH * 0.42} /> : <svg width={trackH * 0.36} height={trackH * 0.36} viewBox="0 0 24 24" fill="none" stroke="#0071e3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>}
                </div>
              </div>
              <div style={{ ...abs, left: V[0] * w, width: pw, top: ty + trackH + 40 * u, textAlign: "center", fontSize: 38 * u, fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", ...rise(ease.expo(P(t, 9.7, 10.2)), 20, 8) }}>{p.done}</div>
              {t < 10.0 && (
                <svg width={46 * u} height={46 * u} viewBox="0 0 24 24" style={{ ...abs, left: cxp - 8 * u, top: cyp - 4 * u, transform: `scale(${grab ? 0.88 : 1})`, opacity: 1 - P(t, 9.75, 10.0), filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))", zIndex: 6 }}>
                  <path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill="#1d1d1f" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              )}
            </>
          );
        })()}
      </div>

      {t > 10.6 && (
        <div style={{ ...abs, inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 22 * u }}>
          <div style={{ fontSize: 120 * u, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 10.65, 11.2)), 50, 14) }}><span style={gradText(GRAD)}>{p.url}</span></div>
          <div style={{ fontFamily: TEXT, fontSize: 40 * u, fontWeight: 500, color: "#6e6e73", letterSpacing: "-0.015em", ...rise(ease.expo(P(t, 10.85, 11.4)), 24, 8) }}>{p.sub}</div>
        </div>
      )}
    </div>
  );
}
