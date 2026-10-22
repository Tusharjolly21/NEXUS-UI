import type { CSSProperties, ReactNode } from "react";
import { FONT, H, P, TEXT, W, bgBlobs, clamp, ease, lerp, rise, spring, type VideoMeta } from "./kit";

export interface AppWalkthroughProps {
  app: string;
  hook: string;
  formTitle: string;
  formDesc: string;
  label: string;
  responses: string;
  accent: string;
  tagline: string;
  url: string;
}

export const meta: VideoMeta<AppWalkthroughProps> = {
  id: "app-walkthrough",
  title: "App Walkthrough",
  platforms: ["Reels", "TikTok", "Shorts"],
  purpose: "Product demo",
  motion: "Cursor-driven UI with auto-zoom camera",
  app: "FormMe",
  duration: 12,
  bpm: 120,
  cuts: [1.5, 2.0, 2.5, 3.8, 4.5, 6.0, 6.5, 10],
  blurb: "A screen-recording look without recording anything. A cursor builds a form while the camera zooms to wherever it's working, publishes it, and the responses start pouring in.",
  defaults: {
    app: "FormMe",
    hook: "Forms people\nactually finish.",
    formTitle: "Launch party RSVP",
    formDesc: "Friday the 14th · rooftop",
    label: "Your email",
    responses: "248",
    accent: "#5e5ce6",
    tagline: "Build it, share it, watch it fill.",
    url: "Link in bio",
  },
  fields: [
    { key: "app", label: "App name", type: "text", max: 12 },
    { key: "hook", label: "Opening line (\\n for a break)", type: "text", max: 40 },
    { key: "formTitle", label: "Form title", type: "text", max: 22 },
    { key: "formDesc", label: "Form description", type: "text", max: 28 },
    { key: "label", label: "Typed question", type: "text", max: 16 },
    { key: "responses", label: "Response count", type: "text", max: 5 },
    { key: "accent", label: "Accent colour", type: "color" },
    { key: "tagline", label: "End card line", type: "text", max: 36 },
    { key: "url", label: "Address or CTA", type: "text", max: 22 },
  ],
  prompt: `Make a 12-second vertical (1080×1920, 30fps) product demo for my form builder FormMe that looks like a polished screen recording, but is built entirely in code. Apple-clean light UI on #f5f5f7, Inter Display, one violet accent (#5e5ce6). Music 120 BPM; every click lands on a beat and gets a soft tick.

0–1.4s: "Forms people / actually finish." in big bold type, then it lifts away as an app window (960×1280, rounded 40px, soft shadow) rises in. Window: top bar with the logo + name, three tabs (Build, Share, Responses) with a sliding white indicator, and a Publish button. Body: a white form card with title "Launch party RSVP", a grey description and an existing "Full name" field.

The camera: everything sits inside a camera group that zooms and pans like Screen Studio. It eases to 1.5× on the area the cursor is working in, follows the cursor loosely, pulls out to the Publish button, then back to full view. Use eased keyframes (zoom + focus point), never cuts.

1.7–5.3s, caption "Build." in a frosted pill at the top:
- Cursor clicks "+ Add field"; a menu springs open (Short text, Email, Choice, Rating, each with an icon); it clicks Email; the menu closes and an Email field drops in with a spring while "+ Add field" slides down.
- Cursor clicks the label and types "Your email" letter by letter with a blinking caret.
- Cursor flips the "Required" switch (knob slides, track turns green).
- Adds a Rating field the same way; cursor clicks the 4th star and the stars fill one after another with a little pop.
5.3–6.5s, caption "Share.": camera pulls out toward Publish; click; the button morphs into a green "Link copied" pill with a check.
6.5–9.7s, caption "Watch it fill.": the tab indicator slides to Responses and the body crossfades: a big counter rolls 0 → 248 responses, a five-row rating bar chart grows, and response cards (avatar initials, name, stars, "just now") drop in from the top every quarter second, pushing the list down.
9.8–12s: end card with the logo, "FormMe", a grey line "Build it, share it, watch it fill." and a pill "Link in bio".

React component, pure function of time t; app name, form title, typed label, response count and accent colour are props.`,
};

const abs: CSSProperties = { position: "absolute" };
const WX = 60, WY = 380; // window position on the stage

type Key = [number, number, number, number]; // t, zoom, focusX, focusY (stage coords)
const CAM: Key[] = [
  [0, 1, 540, 1060], [1.6, 1, 540, 1060], [2.0, 1.4, 530, 880], [3.3, 1.4, 530, 880], [3.7, 1.4, 530, 900],
  [4.1, 1.4, 530, 980], [5.1, 1.4, 530, 1020], [5.7, 1.25, 700, 640], [6.25, 1.25, 720, 620], [6.7, 1, 540, 1060], [9.4, 1.04, 540, 1060], [10, 0.92, 540, 1060],
];
function camAt(t: number) {
  let i = 0;
  while (i < CAM.length - 1 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
  const q = b[0] === a[0] ? 1 : ease.inOut(P(t, a[0], b[0]));
  return { z: lerp(a[1], b[1], q), fx: lerp(a[2], b[2], q), fy: lerp(a[3], b[3], q) };
}

// cursor keyframes in window-local coords
type CK = [number, number, number];
const CUR: CK[] = [
  [1.5, 700, 1150], [1.95, 230, 500], [2.05, 230, 500], [2.38, 220, 640], [2.5, 220, 640], [2.75, 240, 490], [3.45, 240, 490],
  [3.72, 790, 488], [3.85, 790, 488], [4.12, 230, 652], [4.22, 230, 652], [4.48, 220, 918], [4.6, 220, 918], [4.98, 362, 694], [5.15, 362, 694],
  [5.85, 862, 46], [6.2, 862, 46], [6.6, 900, 300],
];
const CLICKS = [2.0, 2.45, 2.8, 3.8, 4.2, 4.55, 5.05, 6.0];
function curAt(t: number) {
  let i = 0;
  while (i < CUR.length - 1 && t > CUR[i + 1][0]) i++;
  const a = CUR[i], b = CUR[Math.min(i + 1, CUR.length - 1)];
  const q = b[0] === a[0] ? 1 : ease.inOut(P(t, a[0], b[0]));
  return { x: lerp(a[1], b[1], q), y: lerp(a[2], b[2], q) };
}

const MENU = ["Short text", "Email", "Choice", "Rating"];
const PEOPLE = ["Aarav S.", "Mia K.", "Leo P.", "Zara M.", "Kenji T.", "Nora B.", "Ishaan R.", "Ava L.", "Omar H.", "Lina W."];

function Icon({ k, c }: { k: number; c: string }) {
  const paths = ["M4 7h16M4 12h10M4 17h7", "M3 6h18v12H3zM3 7l9 6 9-6", "M12 3a9 9 0 100 18 9 9 0 000-18zm-3 9l2 2 4-4", "M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.6 6.7 19.4l1.1-6L3.4 9.3l6-.8z"];
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={paths[k]} /></svg>;
}

function Field({ label, children, y, op = 1, dy = 0, extra }: { label: ReactNode; children: ReactNode; y: number; op?: number; dy?: number; extra?: ReactNode }) {
  return (
    <div style={{ ...abs, left: 104, top: y + dy, width: 752, opacity: op }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 36, fontSize: 26, fontWeight: 600, letterSpacing: "-0.015em" }}>{label}{extra}</div>
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

export default function AppWalkthrough({ t, ...props }: { t: number } & Partial<AppWalkthroughProps>) {
  const p = { ...meta.defaults, ...props };
  const A = p.accent;
  const cam = camAt(t);
  const cur = curAt(t);
  const pressed = CLICKS.some((c) => t > c - 0.02 && t < c + 0.1);

  // form state
  const emailIn = spring(t - 2.5, 0.62, 11);
  const ratingIn = spring(t - 4.6, 0.62, 11);
  const addY = 470 + 150 * spring(t - 2.48, 0.7, 11) + 150 * spring(t - 4.58, 0.7, 11);
  const menu1 = t > 2.02 && t < 2.5 ? spring(t - 2.02, 0.6, 14) * (1 - ease.in(P(t, 2.44, 2.5))) : 0;
  const menu2 = t > 4.22 && t < 4.62 ? spring(t - 4.22, 0.6, 14) * (1 - ease.in(P(t, 4.54, 4.62))) : 0;
  const typed = p.label.slice(0, Math.floor(P(t, 2.85, 3.45) * p.label.length + 0.0001));
  const req = ease.inOut(P(t, 3.8, 3.98));
  const stars = (k: number) => spring(t - 5.05 - k * 0.07, 0.45, 15);
  const published = t > 6.02;
  const tab = ease.inOut(P(t, 6.4, 6.7));
  const resp = ease.inOut(P(t, 6.5, 6.8));
  const total = +p.responses || 0;
  const count = Math.round(total * ease.out(P(t, 6.7, 9.2)));
  const winIn = spring(t - 0.95, 0.75, 8);
  const exit = ease.in(P(t, 9.6, 10.0));

  const caption = t < 1.6 ? null : t < 5.6 ? { s: "Build.", a: 1.65 } : t < 6.5 ? { s: "Share.", a: 5.6 } : t < 9.7 ? { s: "Watch it fill.", a: 6.5 } : null;
  const capEnd = caption ? (caption.s === "Build." ? 5.6 : caption.s === "Share." ? 6.5 : 9.7) : 0;

  const camStyle: CSSProperties = { ...abs, left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${540 - cam.fx * cam.z}px, ${1100 - cam.fy * cam.z}px) scale(${cam.z})` };

  return (
    <div style={{ position: "relative", width: W, height: H, overflow: "hidden", background: "#f5f5f7", fontFamily: FONT, color: "#1d1d1f" }}>
      {bgBlobs(t, `${A}26`, "rgba(48,209,88,.10)").map((s, i) => <div key={i} style={s} />)}

      {/* hook */}
      {t < 1.6 && (
        <div style={{ ...abs, left: 0, right: 0, top: 760, textAlign: "center", whiteSpace: "pre-line", fontSize: 128, fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 0.05, 0.7)), 70, 16), opacity: clamp(ease.expo(P(t, 0.05, 0.7)) * 1.6) * (1 - P(t, 1.0, 1.35)), transform: `translateY(${(1 - ease.expo(P(t, 0.05, 0.7))) * 70 - ease.in(P(t, 0.95, 1.4)) * 420}px) scale(${1 - ease.in(P(t, 0.95, 1.4)) * 0.2})` }}>{p.hook}</div>
      )}

      {t > 0.9 && t < 10.05 && (
        <div style={{ ...camStyle, opacity: 1 - exit, filter: exit ? `blur(${exit * 12}px)` : undefined }}>
          <div style={{ ...abs, left: WX, top: WY, width: 960, height: 1280, borderRadius: 40, background: "#fff", overflow: "hidden", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 60px 120px -40px rgba(0,0,0,.35)", transform: `translateY(${(1 - winIn) * 700}px)`, fontFamily: TEXT }}>
            {/* top bar */}
            <div style={{ ...abs, left: 0, right: 0, top: 0, height: 92, borderBottom: "1px solid rgba(0,0,0,.06)", display: "flex", alignItems: "center", padding: "0 30px" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(140deg, ${A}, #30d158)` }} />
              <span style={{ marginLeft: 14, fontFamily: FONT, fontSize: 30, fontWeight: 700, letterSpacing: "-0.03em" }}>{p.app}</span>
              <div style={{ ...abs, left: 330, top: 22, width: 330, height: 48, borderRadius: 24, background: "#f2f2f5" }}>
                <div style={{ ...abs, top: 4, left: 4 + tab * 220, width: 102, height: 40, borderRadius: 20, background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,.12)" }} />
                {["Build", "Share", "Responses"].map((s, i) => <span key={s} style={{ ...abs, top: 0, height: 48, lineHeight: "48px", left: [4, 110, 224][i], width: [102, 110, 102][i], textAlign: "center", fontSize: 19, fontWeight: 600, color: (i === 0 && tab < 0.5) || (i === 2 && tab >= 0.5) ? "#1d1d1f" : "#86868b" }}>{s}</span>)}
              </div>
              <div style={{ ...abs, right: 26, top: 22, height: 48, width: published ? 196 : 130, borderRadius: 24, background: published ? "#30d158" : A, color: "#fff", fontSize: 20, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${1 - Math.sin(P(t, 5.98, 6.12) * Math.PI) * 0.08})` }}>
                {published ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-10" /></svg>Link copied</> : "Publish"}
              </div>
            </div>

            {/* build view */}
            <div style={{ ...abs, left: 0, top: 92, right: 0, bottom: 0, background: "#f7f7f9", opacity: 1 - resp }}>
              <div style={{ ...abs, left: 60, top: 38, width: 840, height: 1100, borderRadius: 30, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05)" }} />
              <div style={{ ...abs, left: 0, top: -92, right: 0, bottom: 0 }}>
                <div style={{ ...abs, left: 104, top: 180, fontFamily: FONT, fontSize: 48, fontWeight: 700, letterSpacing: "-0.035em" }}>{p.formTitle}</div>
                <div style={{ ...abs, left: 104, top: 246, fontSize: 26, color: "#86868b" }}>{p.formDesc}</div>
                <Field y={320} label="Full name"><div style={{ height: 70, borderRadius: 16, background: "#f5f5f7", padding: "0 22px", display: "flex", alignItems: "center", fontSize: 24, color: "#a1a1a6" }}>Jane Appleseed</div></Field>
                {t > 2.48 && (
                  <Field y={470} op={clamp(emailIn * 3)} dy={(1 - emailIn) * -40}
                    label={<span>{typed || (t < 2.85 ? <span style={{ color: "#a1a1a6" }}>Untitled question</span> : "")}{t > 2.8 && t < 3.7 && Math.floor(t * 3) % 2 === 0 && <span style={{ display: "inline-block", width: 3, height: 28, background: A, marginLeft: 2, verticalAlign: -4 }} />}</span>}
                    extra={<span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 20, fontWeight: 600, color: req > 0.5 ? "#1d1d1f" : "#86868b" }}>Required
                      <span style={{ position: "relative", width: 56, height: 32, borderRadius: 16, background: req > 0 ? `rgb(${lerp(229, 48, req)},${lerp(229, 209, req)},${lerp(234, 88, req)})` : "#e5e5ea" }}><span style={{ ...abs, top: 3, left: 3 + req * 24, width: 26, height: 26, borderRadius: 13, background: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,.25)" }} /></span></span>}>
                    <div style={{ height: 70, borderRadius: 16, background: "#f5f5f7", padding: "0 22px", display: "flex", alignItems: "center", fontSize: 24, color: "#a1a1a6" }}>name@email.com</div>
                  </Field>
                )}
                {t > 4.58 && (
                  <Field y={620} op={clamp(ratingIn * 3)} dy={(1 - ratingIn) * -40} label="How excited are you?">
                    <div style={{ display: "flex", gap: 16, height: 70, alignItems: "center" }}>
                      {[0, 1, 2, 3, 4].map((k) => { const on = k < 4 ? stars(k) : 0; return (
                        <svg key={k} width="60" height="60" viewBox="0 0 24 24" style={{ transform: `scale(${1 + Math.sin(clamp(on) * Math.PI) * 0.25})` }}><path d="M12 3l2.6 5.5 6 .8-4.4 4.1 1.1 6L12 16.6 6.7 19.4l1.1-6L3.4 9.3l6-.8z" fill={on > 0.5 ? "#ff9f0a" : "#e5e5ea"} /></svg>
                      ); })}
                    </div>
                  </Field>
                )}
                <div style={{ ...abs, left: 104, top: addY, height: 64, padding: "0 26px", borderRadius: 32, border: `2px dashed ${A}66`, color: A, display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 600 }}>+ Add field</div>
                {[menu1, menu2].map((m, mi) => m > 0.01 && (
                  <div key={mi} style={{ ...abs, left: 104, top: (mi === 0 ? 470 : 620) + 76, width: 340, borderRadius: 22, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.07),0 24px 48px -16px rgba(0,0,0,.3)", padding: 8, transformOrigin: "40px 0", transform: `scale(${lerp(0.85, 1, m)})`, opacity: clamp(m * 2) }}>
                    {MENU.map((s, k) => { const hot = (mi === 0 && k === 1 && t > 2.32) || (mi === 1 && k === 3 && t > 4.42); return (
                      <div key={s} style={{ height: 64, borderRadius: 14, display: "flex", alignItems: "center", gap: 14, padding: "0 16px", fontSize: 22, fontWeight: 500, background: hot ? `${A}18` : "transparent", color: hot ? A : "#1d1d1f" }}><Icon k={k} c={hot ? A : "#86868b"} />{s}</div>
                    ); })}
                  </div>
                ))}
              </div>
            </div>

            {/* responses view */}
            {resp > 0 && (
              <div style={{ ...abs, left: 0, top: 92, right: 0, bottom: 0, background: "#f7f7f9", opacity: resp }}>
                <div style={{ ...abs, left: 60, top: 40, fontFamily: FONT, fontSize: 132, fontWeight: 700, letterSpacing: "-0.05em", fontVariantNumeric: "tabular-nums" }}>{count}</div>
                <div style={{ ...abs, left: 66, top: 190, fontSize: 30, fontWeight: 600, color: "#86868b" }}>responses · {p.formTitle}</div>
                <div style={{ ...abs, left: 60, top: 260, width: 840, height: 250, borderRadius: 28, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05)", padding: "26px 30px" }}>
                  {[0.62, 0.24, 0.09, 0.03, 0.02].map((v, k) => (
                    <div key={k} style={{ display: "flex", alignItems: "center", gap: 16, height: 40 }}>
                      <span style={{ width: 52, fontSize: 20, fontWeight: 600, color: "#86868b" }}>{5 - k}★</span>
                      <span style={{ height: 18, borderRadius: 9, background: k === 0 ? A : `${A}55`, width: 660 * v * ease.out(P(t, 6.8 + k * 0.08, 7.8 + k * 0.08)) + 6 }} />
                    </div>
                  ))}
                </div>
                <div style={{ ...abs, left: 60, top: 540, width: 840, height: 640, overflow: "hidden" }}>
                  {PEOPLE.map((name, k) => {
                    const at = 6.85 + k * 0.26;
                    if (t < at) return null;
                    const slot = PEOPLE.reduce((acc, _, j) => acc + (j > k ? clamp(spring(t - (6.85 + j * 0.26), 0.7, 12)) : 0), 0);
                    const drop = spring(t - at, 0.6, 12);
                    const stars = 5 - (k % 4 === 3 ? 1 : 0);
                    return (
                      <div key={name} style={{ ...abs, left: 0, top: slot * 108 + (1 - drop) * -60, width: 840, height: 94, borderRadius: 22, background: "#fff", boxShadow: "0 0 0 1px rgba(0,0,0,.05),0 10px 24px -16px rgba(0,0,0,.25)", display: "flex", alignItems: "center", gap: 18, padding: "0 24px", opacity: clamp(drop * 3) }}>
                        <span style={{ width: 54, height: 54, borderRadius: 27, background: ["#ff9f0a", "#0a84ff", "#30d158", "#bf5af2", "#ff375f"][k % 5], color: "#fff", fontSize: 21, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{name.split(" ").map((s) => s[0]).join("")}</span>
                        <span style={{ fontSize: 26, fontWeight: 600 }}>{name}</span>
                        <span style={{ color: "#ff9f0a", fontSize: 24, letterSpacing: 2 }}>{"★".repeat(stars)}<span style={{ color: "#e5e5ea" }}>{"★".repeat(5 - stars)}</span></span>
                        <span style={{ marginLeft: "auto", fontSize: 20, color: "#86868b" }}>just now</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* cursor (inside the camera so it zooms with the UI) */}
          {t > 1.45 && t < 6.9 && (
            <svg width="44" height="44" viewBox="0 0 24 24" style={{ ...abs, left: WX + cur.x - 6, top: WY + cur.y - 4, transform: `scale(${pressed ? 0.86 : 1})`, transformOrigin: "6px 4px", opacity: clamp(P(t, 1.45, 1.65)) * (1 - P(t, 6.6, 6.9)), filter: "drop-shadow(0 4px 8px rgba(0,0,0,.3))" }}>
              <path d="M4 2l15 9.5-6.6 1.4 3.6 7-2.6 1.3-3.6-7L4 18.5z" fill="#1d1d1f" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          )}
          {CLICKS.map((c) => t > c && t < c + 0.45 && (
            <span key={c} style={{ ...abs, left: WX + curAt(c).x - 6 - 30 * ease.out(P(t, c, c + 0.45)), top: WY + curAt(c).y - 4 - 30 * ease.out(P(t, c, c + 0.45)), width: 60 * ease.out(P(t, c, c + 0.45)), height: 60 * ease.out(P(t, c, c + 0.45)), borderRadius: "50%", background: `${A}33`, border: `2px solid ${A}`, opacity: 1 - P(t, c, c + 0.45) }} />
          ))}
        </div>
      )}

      {/* step caption */}
      {caption && (
        <div style={{ ...abs, left: 0, right: 0, top: 170, textAlign: "center", ...rise(ease.expo(P(t, caption.a, caption.a + 0.45)), 30, 10), opacity: clamp(ease.expo(P(t, caption.a, caption.a + 0.45)) * 1.6) * (1 - P(t, capEnd - 0.12, capEnd)) }}>
          <span style={{ display: "inline-block", padding: "22px 44px", borderRadius: 999, background: "rgba(255,255,255,.78)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 0 0 1px rgba(0,0,0,.06),0 24px 48px -24px rgba(0,0,0,.35)", fontSize: 76, fontWeight: 700, letterSpacing: "-0.045em" }}>{caption.s}</span>
        </div>
      )}

      {/* end card */}
      {t > 9.8 && (
        <div style={{ ...abs, inset: 0 }}>
          <div style={{ ...abs, left: 470, top: 640, width: 140, height: 140, borderRadius: 40, background: `linear-gradient(140deg, ${A}, #30d158)`, boxShadow: "0 30px 60px -24px rgba(0,0,0,.4)", transform: `scale(${lerp(0.3, 1, spring(t - 9.85, 0.5, 13))}) rotate(${(1 - spring(t - 9.85, 0.5, 13)) * 30}deg)`, opacity: clamp(P(t, 9.85, 10.0)) }} />
          <div style={{ ...abs, left: 0, right: 0, top: 830, textAlign: "center", fontSize: 128, fontWeight: 700, letterSpacing: "-0.05em", ...rise(ease.expo(P(t, 10.0, 10.6)), 60, 16) }}>{p.app}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 990, textAlign: "center", fontSize: 46, fontWeight: 500, color: "#86868b", letterSpacing: "-0.02em", ...rise(ease.expo(P(t, 10.2, 10.75)), 40, 12) }}>{p.tagline}</div>
          <div style={{ ...abs, left: 0, right: 0, top: 1100, textAlign: "center", ...rise(ease.expo(P(t, 10.4, 10.95)), 30, 10) }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "16px 30px", borderRadius: 999, background: "#1d1d1f", color: "#fff", fontFamily: TEXT, fontSize: 32, fontWeight: 600 }}>{p.url}</span>
          </div>
        </div>
      )}
    </div>
  );
}
