import type { CSSProperties, ReactNode } from "react";
import { FONT, P, TEXT, clamp, ease, lerp, spring, type Frame, type VideoMeta } from "./kit";
import { Odometer } from "./parts";

export interface AppStorePreviewProps {
  app: string;
  line: string;
  group: string;
  amount: string;
  what: string;
  friend: string;
  accent: string;
  cap1: string; cap2: string; cap3: string; cap4: string;
}

export const meta: VideoMeta<AppStorePreviewProps> = {
  id: "app-store-preview",
  title: "App Store Preview",
  platforms: ["App Store", "Play Store", "TikTok"],
  formats: ["app", "9:16"],
  purpose: "App store listing",
  motion: "Native iOS pushes, sheets and keypad entry",
  app: "ClearSplit",
  duration: 16,
  bpm: 110,
  cuts: [2.0, 3.9, 7.7, 10.6, 13.4],
  blurb: "A 16-second app preview that moves like the real thing: a push into the group, a sheet that pushes the screen back, amounts typed on the keypad, avatars toggled into the split, balances rolling, and a settle-up that ends all square.",
  defaults: {
    app: "ClearSplit",
    line: "Split bills with friends.",
    group: "Goa trip",
    amount: "3600",
    what: "Dinner at Thalassa",
    friend: "Riya",
    accent: "#12b886",
    cap1: "Every trip, every flat, every dinner.",
    cap2: "Add an expense in seconds.",
    cap3: "Always know who owes what.",
    cap4: "Settle up in one tap.",
  },
  fields: [
    { key: "app", label: "App name", type: "text", max: 14 },
    { key: "line", label: "End line", type: "text", max: 30 },
    { key: "group", label: "Group name", type: "text", max: 14 },
    { key: "amount", label: "Amount typed (rupees)", type: "text", max: 5 },
    { key: "what", label: "Expense description", type: "text", max: 22 },
    { key: "friend", label: "Friend who settles", type: "text", max: 10 },
    { key: "accent", label: "Accent", type: "color" },
    { key: "cap1", label: "Caption 1", type: "text", max: 40 },
    { key: "cap2", label: "Caption 2", type: "text", max: 40 },
    { key: "cap3", label: "Caption 3", type: "text", max: 40 },
    { key: "cap4", label: "Caption 4", type: "text", max: 40 },
  ],
  prompt: `Make a 16-second App Store preview (886×1920, also 1080×1920) for my expense-splitting app ClearSplit. Full-screen iOS UI with no device frame: status bar (9:41, signal, Wi-Fi, battery), SF-style type, white and #f2f2f7 grouped backgrounds, one green accent (#12b886). Indian rupees with en-IN formatting. Music 110 BPM, light; soft taps on every touch.

Use native iOS motion everywhere: pushes (new screen slides in from the right while the old one slides 30% left and dims), sheets (spring up from the bottom while the screen behind shrinks to 93%, rounds its corners and darkens), and a subtle grey touch dot wherever a finger taps. A frosted caption pill near the bottom changes with each scene.

0–2s "Every trip, every flat, every dinner.": Groups screen with a large title, a summary card where "You're owed ₹2,340" rolls in like an odometer, and three group rows with avatar stacks. Tap "Goa trip".
2–3.9s: push into the group: member avatars, a list of expenses, an "Add expense" button. Tap it.
3.9–7.7s "Add an expense in seconds.": the add sheet springs up. The amount is typed on a custom keypad (each key flashes as it's pressed) and grows as ₹3,600; the description types in; four avatars toggle into the split one by one with springs and "₹900 each" rolls in. Tap Save; the sheet drops.
7.7–10.6s "Always know who owes what.": the new expense slides into the top of the list with a highlight, and a balances section animates bar lengths and amounts per friend.
10.6–13.4s "Settle up in one tap.": tap Settle up; a sheet shows "Riya pays you ₹900"; tap "Mark as paid", the row turns into a green check and "You're all square with Riya" appears.
13.4–16s: the app icon springs in with "ClearSplit" and "Split bills with friends."

Pure function of time t with frame width/height props; group, amount, description, friend, accent and captions are props.`,
};

const abs: CSSProperties = { position: "absolute" };
const inr = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");
const PEOPLE = [{ n: "You", c: "#1d1d1f" }, { n: "Arjun", c: "#0a84ff" }, { n: "Riya", c: "#ff375f" }, { n: "Kabir", c: "#ff9f0a" }];

function Avatar({ n, c, s, ring }: { n: string; c: string; s: number; ring?: string }) {
  return <span style={{ width: s, height: s, borderRadius: "50%", background: c, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: TEXT, fontWeight: 700, fontSize: s * 0.38, boxShadow: ring ? `0 0 0 ${s * 0.07}px ${ring}` : undefined, flex: "none" }}>{n === "You" ? "Y" : n[0]}</span>;
}

function StatusBar({ w, dark }: { w: number; dark?: boolean }) {
  const c = dark ? "#fff" : "#000";
  return (
    <div style={{ ...abs, left: 0, top: 0, width: w, height: 110, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "26px 64px 0", fontFamily: TEXT, fontWeight: 600, fontSize: 34, color: c, zIndex: 50 }}>
      <span>9:41</span>
      <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <svg width="36" height="24" viewBox="0 0 18 12" fill={c}><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="34" height="24" viewBox="0 0 17 12" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M1.5 4.5a10 10 0 0114 0M4 7.2a6.3 6.3 0 019 0" /><circle cx="8.5" cy="10" r="1.2" fill={c} stroke="none" /></svg>
        <svg width="54" height="26" viewBox="0 0 27 13"><rect x="0.8" y="0.8" width="22.5" height="11.4" rx="3.5" fill="none" stroke={c} strokeOpacity=".4" strokeWidth="1.4" /><rect x="2.5" y="2.5" width="19" height="8" rx="2" fill={c} /><rect x="24.5" y="4.3" width="1.8" height="4.4" rx=".9" fill={c} fillOpacity=".4" /></svg>
      </span>
    </div>
  );
}

function Touch({ t, at, x, y }: { t: number; at: number; x: number; y: number }) {
  if (t < at - 0.12 || t > at + 0.35) return null;
  const q = P(t, at - 0.12, at + 0.35);
  return <span style={{ ...abs, left: x - 46, top: y - 46, width: 92, height: 92, borderRadius: 46, background: "rgba(120,120,128,.35)", border: "3px solid rgba(255,255,255,.7)", transform: `scale(${q < 0.3 ? lerp(0.6, 1, q / 0.3) : lerp(1, 1.4, (q - 0.3) / 0.7)})`, opacity: q < 0.3 ? 1 : 1 - (q - 0.3) / 0.7, zIndex: 60 }} />;
}

function Row({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "0 32px", height: 128, borderBottom: "1px solid rgba(60,60,67,.12)", fontFamily: TEXT, ...style }}>{children}</div>;
}

export default function AppStorePreview({ t, w = 886, h = 1920, ...props }: { t: number } & Frame & Partial<AppStorePreviewProps>) {
  const p = { ...meta.defaults, ...props };
  const A = p.accent;
  const amt = +p.amount.replace(/\D/g, "") || 0;
  const each = Math.floor(amt / 4);
  const friend = p.friend;

  // navigation state
  const push = ease.inOut(P(t, 2.0, 2.5));
  const sheet = t < 7.7 ? spring(t - 3.9, 0.82, 9) : 1 - ease.in(P(t, 7.7, 8.05));
  const settle = t < 13.0 ? spring(t - 10.6, 0.82, 9) : 1 - ease.in(P(t, 13.0, 13.35));
  const behind = Math.max(clamp(sheet), clamp(settle));
  const end = ease.inOut(P(t, 13.4, 13.9));

  // add expense
  const keys = [...String(amt)];
  const keyAt = (i: number) => 4.55 + i * 0.28;
  const typedN = keys.filter((_, i) => t > keyAt(i)).length;
  const typedVal = typedN ? +keys.slice(0, typedN).join("") : 0;
  const desc = p.what.slice(0, Math.floor(P(t, 5.75, 6.4) * p.what.length + 0.001));
  const chipOn = (i: number) => spring(t - (6.55 + i * 0.16), 0.5, 13);
  const newRow = spring(t - 8.1, 0.7, 11);
  const paid = t > 12.1;

  const capOf = t < 2 ? p.cap1 : t < 3.9 ? p.cap1 : t < 7.7 ? p.cap2 : t < 10.6 ? p.cap3 : t < 13.4 ? p.cap4 : "";
  const capStart = t < 3.9 ? 0.2 : t < 7.7 ? 3.95 : t < 10.6 ? 7.75 : 10.65;
  const capEnd = t < 3.9 ? 3.75 : t < 7.7 ? 7.55 : t < 10.6 ? 10.45 : 13.25;

  const groups = [{ n: p.group, sub: "4 people", bal: "+₹2,340", pos: true }, { n: "Flat 4B", sub: "3 people", bal: "−₹560", pos: false }, { n: "Friday dinner", sub: "5 people", bal: "settled", pos: null }];
  const expenses = [{ n: "Scooter rental", by: "Arjun paid", v: 1200 }, { n: "Beach shack lunch", by: "You paid", v: 2480 }, { n: "Fuel", by: "Kabir paid", v: 900 }];
  const bal = [{ ...PEOPLE[1], v: paid ? 1140 : 1140 }, { ...PEOPLE[2], v: paid ? 0 : each }, { ...PEOPLE[3], v: 300 }];

  const screen: CSSProperties = { ...abs, left: 0, top: 0, width: w, height: h, overflow: "hidden" };
  const behindStyle: CSSProperties = { transformOrigin: `${w / 2}px ${h * 0.08}px`, transform: `scale(${lerp(1, 0.93, behind)})`, borderRadius: lerp(0, 48, behind), filter: `brightness(${1 - behind * 0.25})` };

  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: "#000", fontFamily: FONT, color: "#000" }}>
      <div style={{ ...screen, ...behindStyle, background: "#f2f2f7" }}>
        {/* HOME */}
        <div style={{ ...screen, background: "#f2f2f7", transform: `translateX(${-push * w * 0.3}px)`, filter: `brightness(${1 - push * 0.1})` }}>
          <div style={{ ...abs, left: 40, top: 150, fontSize: 82, fontWeight: 700, letterSpacing: "-0.03em" }}>Groups</div>
          <div style={{ ...abs, left: 32, right: 32, top: 290, height: 230, borderRadius: 34, background: "#fff", padding: 36, fontFamily: TEXT }}>
            <div style={{ fontSize: 30, color: "#8e8e93", fontWeight: 500 }}>You're owed</div>
            <div style={{ marginTop: 10, fontFamily: FONT, fontSize: 92, fontWeight: 700, letterSpacing: "-0.04em", color: A }}>₹<Odometer text="2,340" q={P(t, 0.4, 1.4)} size={92} /></div>
            <div style={{ ...abs, right: 36, top: 40, textAlign: "right", fontSize: 26, color: "#8e8e93" }}>You owe<div style={{ fontFamily: FONT, marginTop: 8, fontSize: 44, fontWeight: 700, color: "#ff3b30" }}>₹560</div></div>
          </div>
          <div style={{ ...abs, left: 32, right: 32, top: 560, borderRadius: 34, background: "#fff", overflow: "hidden" }}>
            {groups.map((g, i) => (
              <Row key={g.n} style={{ background: i === 0 && t > 1.75 && t < 2.2 ? "#e5e5ea" : "#fff", opacity: clamp((t - 0.3 - i * 0.12) * 5), transform: `translateY(${(1 - spring(t - 0.3 - i * 0.12, 0.7, 11)) * 40}px)` }}>
                <span style={{ display: "flex" }}>{PEOPLE.slice(0, 3).map((pp, k) => <span key={k} style={{ marginLeft: k ? -22 : 0 }}><Avatar {...pp} s={58} ring="#fff" /></span>)}</span>
                <span style={{ flex: 1 }}><div style={{ fontSize: 36, fontWeight: 600 }}>{g.n}</div><div style={{ fontSize: 26, color: "#8e8e93", marginTop: 2 }}>{g.sub}</div></span>
                <span style={{ fontSize: 32, fontWeight: 600, color: g.pos === null ? "#8e8e93" : g.pos ? A : "#ff3b30" }}>{g.bal}</span>
                <svg width="18" height="30" viewBox="0 0 9 15" fill="none" stroke="#c7c7cc" strokeWidth="2.4" strokeLinecap="round"><path d="M1.5 1.5l6 6-6 6" /></svg>
              </Row>
            ))}
          </div>
          {/* tab bar */}
          <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: 170, background: "rgba(249,249,249,.94)", borderTop: "1px solid rgba(0,0,0,.1)", display: "flex", justifyContent: "space-around", paddingTop: 18, fontFamily: TEXT, fontSize: 22, fontWeight: 600 }}>
            {["Groups", "Activity", "Friends", "Account"].map((s, i) => <span key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: i ? "#8e8e93" : A }}><span style={{ width: 44, height: 44, borderRadius: 12, background: i ? "#d1d1d6" : A, opacity: i ? 1 : 0.95 }} />{s}</span>)}
          </div>
        </div>

        {/* GROUP */}
        {t > 1.95 && (
          <div style={{ ...screen, background: "#f2f2f7", transform: `translateX(${(1 - push) * w}px)`, boxShadow: "-20px 0 40px rgba(0,0,0,.12)" }}>
            <div style={{ ...abs, left: 26, top: 130, display: "flex", alignItems: "center", gap: 6, color: A, fontFamily: TEXT, fontSize: 34 }}><svg width="22" height="36" viewBox="0 0 11 18" fill="none" stroke={A} strokeWidth="2.8" strokeLinecap="round"><path d="M9 2L2 9l7 7" /></svg>Groups</div>
            <div style={{ ...abs, left: 40, top: 200, fontSize: 76, fontWeight: 700, letterSpacing: "-0.03em" }}>{p.group}</div>
            <div style={{ ...abs, left: 40, top: 305, display: "flex", gap: 14 }}>{PEOPLE.map((pp) => <Avatar key={pp.n} {...pp} s={66} />)}</div>
            <div style={{ ...abs, left: 32, right: 32, top: 410, borderRadius: 34, background: "#fff", overflow: "hidden" }}>
              {t > 8.0 && (
                <div style={{ height: 128 * newRow, overflow: "hidden", background: `rgba(18,184,134,${0.12 * (1 - P(t, 8.8, 9.8))})` }}>
                  <Row><Avatar {...PEOPLE[0]} s={58} /><span style={{ flex: 1 }}><div style={{ fontSize: 34, fontWeight: 600 }}>{p.what}</div><div style={{ fontSize: 26, color: "#8e8e93" }}>You paid · just now</div></span><span style={{ fontSize: 34, fontWeight: 600 }}>{inr(amt)}</span></Row>
                </div>
              )}
              {expenses.map((e) => (
                <Row key={e.n}><Avatar {...PEOPLE[e.by.startsWith("You") ? 0 : e.by.startsWith("Arjun") ? 1 : 3]} s={58} /><span style={{ flex: 1 }}><div style={{ fontSize: 34, fontWeight: 600 }}>{e.n}</div><div style={{ fontSize: 26, color: "#8e8e93" }}>{e.by}</div></span><span style={{ fontSize: 34, fontWeight: 600 }}>{inr(e.v)}</span></Row>
              ))}
            </div>
            {/* balances */}
            <div style={{ ...abs, left: 32, right: 32, top: 410 + 128 * 3 + 128 * clamp(newRow) + 40, borderRadius: 34, background: "#fff", padding: "30px 32px", fontFamily: TEXT, opacity: clamp(P(t, 8.4, 8.8)) }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#8e8e93", letterSpacing: "0.02em", textTransform: "uppercase" }}>Balances</div>
              {bal.map((b, i) => {
                const g = ease.out(P(t, 8.6 + i * 0.12, 9.5 + i * 0.12));
                const v = b.n === friend && paid ? lerp(each, 0, ease.inOut(P(t, 12.1, 12.6))) : b.v;
                return (
                  <div key={b.n} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 24 }}>
                    <Avatar {...b} s={52} />
                    <span style={{ width: 150, fontSize: 30, fontWeight: 600 }}>{b.n}</span>
                    <span style={{ flex: 1, height: 18, borderRadius: 9, background: "#f2f2f7", overflow: "hidden" }}><span style={{ display: "block", height: "100%", width: `${(v / 1200) * 100 * g}%`, borderRadius: 9, background: A }} /></span>
                    <span style={{ width: 150, textAlign: "right", fontSize: 30, fontWeight: 700, color: v ? A : "#8e8e93", fontVariantNumeric: "tabular-nums" }}>{v ? inr(v * g) : "settled"}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ ...abs, left: 32, right: 32, bottom: 70, display: "flex", gap: 20 }}>
              <div style={{ flex: 1, height: 110, borderRadius: 30, background: t > 10.2 ? "#fff" : A, color: t > 10.2 ? A : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TEXT, fontSize: 34, fontWeight: 700, transform: `scale(${t > 3.55 && t < 3.75 ? 0.96 : 1})` }}>+ Add expense</div>
              {t > 8.6 && <div style={{ flex: 1, height: 110, borderRadius: 30, background: t > 10.2 ? A : "#fff", color: t > 10.2 ? "#fff" : A, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: TEXT, fontSize: 34, fontWeight: 700, opacity: clamp(P(t, 8.6, 9.0)), transform: `scale(${t > 10.35 && t < 10.55 ? 0.96 : 1})` }}>Settle up</div>}
            </div>
          </div>
        )}
      </div>

      {/* ADD EXPENSE SHEET */}
      {sheet > 0.001 && t < 8.1 && (
        <div style={{ ...abs, left: 0, top: lerp(h, 150, sheet), width: w, height: h - 150, borderRadius: "44px 44px 0 0", background: "#f2f2f7", overflow: "hidden", fontFamily: TEXT }}>
          <div style={{ ...abs, left: "50%", top: 14, width: 80, height: 10, borderRadius: 5, background: "#c7c7cc", transform: "translateX(-50%)" }} />
          <div style={{ ...abs, left: 40, right: 40, top: 50, display: "flex", justifyContent: "space-between", fontSize: 34, color: A }}><span>Cancel</span><b style={{ color: "#000" }}>New expense</b><span style={{ fontWeight: 700, opacity: t > 6.9 ? 1 : 0.35, transform: `scale(${t > 7.45 && t < 7.62 ? 0.92 : 1})` }}>Save</span></div>
          <div style={{ ...abs, left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT, fontSize: 150, fontWeight: 700, letterSpacing: "-0.05em", color: typedN ? "#000" : "#c7c7cc" }}>
            {typedN ? inr(typedVal) : "₹0"}
          </div>
          <div style={{ ...abs, left: 32, right: 32, top: 360, height: 110, borderRadius: 28, background: "#fff", display: "flex", alignItems: "center", padding: "0 30px", fontSize: 34, color: desc ? "#000" : "#c7c7cc" }}>{desc || "What was it for?"}{t > 5.7 && t < 6.5 && <span style={{ display: "inline-block", width: 3, height: 40, background: A, marginLeft: 2 }} />}</div>
          <div style={{ ...abs, left: 32, right: 32, top: 500, borderRadius: 28, background: "#fff", padding: "26px 30px" }}>
            <div style={{ fontSize: 28, color: "#8e8e93", fontWeight: 600 }}>Split equally between</div>
            <div style={{ display: "flex", gap: 18, marginTop: 20 }}>
              {PEOPLE.map((pp, i) => {
                const on = chipOn(i);
                return (
                  <span key={pp.n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                    <span style={{ transform: `scale(${lerp(0.82, 1, clamp(on))})`, opacity: lerp(0.4, 1, clamp(on)), position: "relative" }}>
                      <Avatar {...pp} s={92} ring={on > 0.5 ? A : undefined} />
                      {on > 0.5 && <span style={{ ...abs, right: -6, bottom: -6, width: 36, height: 36, borderRadius: 18, background: A, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${on})` }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>}
                    </span>
                    <span style={{ fontSize: 26, fontWeight: 600 }}>{pp.n}</span>
                  </span>
                );
              })}
            </div>
            <div style={{ marginTop: 22, fontSize: 34, fontWeight: 700, color: A, opacity: clamp(P(t, 7.15, 7.3)) }}>{t > 7.15 ? <><span>₹</span><Odometer text={each.toLocaleString("en-IN")} q={P(t, 7.15, 7.6)} size={34} /> each</> : ""}</div>
          </div>
          {/* keypad */}
          <div style={{ ...abs, left: 0, right: 0, bottom: 0, height: 640, background: "#d1d4db", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, padding: "20px 16px 70px" }}>
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"].map((k) => {
              const hit = keys.some((kk, i) => kk === k && t > keyAt(i) - 0.04 && t < keyAt(i) + 0.14);
              return <span key={k} style={{ borderRadius: 14, background: hit ? "#aeb3be" : "#fff", boxShadow: "0 2px 0 rgba(0,0,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, fontWeight: 400, color: "#000" }}>{k}</span>;
            })}
          </div>
        </div>
      )}

      {/* SETTLE SHEET */}
      {settle > 0.001 && t < 13.4 && (
        <div style={{ ...abs, left: 0, top: lerp(h, h * 0.45, settle), width: w, height: h * 0.55, borderRadius: "44px 44px 0 0", background: "#fff", fontFamily: TEXT, padding: "60px 40px" }}>
          <div style={{ ...abs, left: "50%", top: 14, width: 80, height: 10, borderRadius: 5, background: "#c7c7cc", transform: "translateX(-50%)" }} />
          <div style={{ fontFamily: FONT, fontSize: 60, fontWeight: 700, letterSpacing: "-0.03em" }}>Settle up</div>
          <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 24, padding: 30, borderRadius: 30, background: paid ? "rgba(18,184,134,.1)" : "#f2f2f7" }}>
            <Avatar {...PEOPLE[2]} s={84} />
            <span style={{ flex: 1, fontSize: 36, fontWeight: 600 }}>{friend} pays you<div style={{ fontFamily: FONT, fontSize: 56, fontWeight: 700, color: A, marginTop: 4 }}>{inr(each)}</div></span>
            {paid ? (
              <span style={{ width: 84, height: 84, borderRadius: 42, background: A, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spring(t - 12.1, 0.45, 14)})` }}><svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
            ) : null}
          </div>
          <div style={{ marginTop: 34, height: 112, borderRadius: 30, background: paid ? "#e5e5ea" : A, color: paid ? "#8e8e93" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 700, transform: `scale(${t > 11.9 && t < 12.1 ? 0.96 : 1})` }}>{paid ? "Paid" : "Mark as paid"}</div>
          <div style={{ marginTop: 34, textAlign: "center", fontSize: 36, fontWeight: 600, color: "#000", opacity: clamp(P(t, 12.4, 12.7)), transform: `translateY(${(1 - ease.expo(P(t, 12.4, 12.9))) * 20}px)` }}>You're all square with {friend}.</div>
        </div>
      )}

      <StatusBar w={w} dark={behind > 0.5 && t < 13.4 && false} />

      {/* touches */}
      <Touch t={t} at={1.9} x={w / 2} y={560 + 64} />
      <Touch t={t} at={3.65} x={w * 0.3} y={h - 125} />
      {keys.map((k, i) => { const idx = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0"].indexOf(k); const col = idx % 3, row = Math.floor(idx / 3); return <Touch key={i} t={t} at={keyAt(i)} x={(col + 0.5) * (w / 3)} y={h - 640 + 20 + row * 140 + 65} />; })}
      {PEOPLE.map((_, i) => <Touch key={i} t={t} at={6.55 + i * 0.16} x={32 + 30 + (i + 0.5) * ((w - 124) / 4)} y={150 + 500 + 26 + 40 + 46} />)}
      <Touch t={t} at={7.52} x={w - 80} y={150 + 70} />
      <Touch t={t} at={10.45} x={w * 0.73} y={h - 125} />
      <Touch t={t} at={12.0} x={w / 2} y={h * 0.45 + 60 + 70 + 40 + 144 + 34 + 56} />

      {/* caption */}
      {capOf && t < 13.4 && (
        <div style={{ ...abs, left: 0, right: 0, bottom: t > 3.9 && t < 7.75 ? 690 : 300, textAlign: "center", zIndex: 70, opacity: clamp(P(t, capStart, capStart + 0.3)) * (1 - P(t, capEnd, capEnd + 0.15)), transform: `translateY(${(1 - ease.expo(P(t, capStart, capStart + 0.5))) * 30}px)` }}>
          <span style={{ display: "inline-block", maxWidth: w - 80, padding: "24px 40px", borderRadius: 999, background: "rgba(29,29,31,.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", color: "#fff", fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em" }}>{capOf}</span>
        </div>
      )}

      {/* end card */}
      {end > 0 && (
        <div style={{ ...abs, inset: 0, background: `rgba(242,242,247,${end})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, zIndex: 80 }}>
          <div style={{ width: 230, height: 230, borderRadius: 54, background: `linear-gradient(150deg, ${A}, #087f5b)`, boxShadow: "0 40px 80px -30px rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${lerp(0.3, 1, spring(t - 13.6, 0.5, 13))}) rotate(${(1 - spring(t - 13.6, 0.5, 13)) * -25}deg)`, opacity: clamp(P(t, 13.6, 13.75)) }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round"><path d="M6 12h12" /><circle cx="12" cy="6.5" r="1.6" fill="#fff" stroke="none" /><circle cx="12" cy="17.5" r="1.6" fill="#fff" stroke="none" /></svg>
          </div>
          <div style={{ fontSize: 110, fontWeight: 700, letterSpacing: "-0.05em", opacity: clamp(ease.expo(P(t, 13.8, 14.3)) * 1.5), transform: `translateY(${(1 - ease.expo(P(t, 13.8, 14.3))) * 40}px)` }}>{p.app}</div>
          <div style={{ fontFamily: TEXT, fontSize: 44, fontWeight: 500, color: "#6e6e73", opacity: clamp(ease.expo(P(t, 14.0, 14.5)) * 1.5), transform: `translateY(${(1 - ease.expo(P(t, 14.0, 14.5))) * 30}px)` }}>{p.line}</div>
        </div>
      )}
    </div>
  );
}
