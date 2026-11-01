"use client";

import * as React from "react";
import Link from "next/link";
import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { playIconSound } from "./icon-sounds";
import { NX_ICONS } from "./registry";

/**
 * "Made for real interfaces": small working mock-ups (an editor toolbar, a music player, a product card,
 * toasts, a chat box, a tab bar) that use the icons the way a real product would, so a visitor can see
 * where each one fits and click through the interactions.
 */

const ShoppingBag = NX_ICONS["shopping-bag"];
const WaveDots = NX_ICONS["wave-dots"];

const SoundContext = React.createContext(false);

function useBlip() {
  const on = React.useContext(SoundContext);
  return React.useCallback((slug: string) => { if (on) playIconSound(slug, { force: true }); }, [on]);
}

/** An icon button whose icon plays while the pointer or keyboard focus is on the whole button. */
function IconButton({
  slug, label, size = 20, className, onClick, play, pressed, children,
}: {
  slug: string; label: string; size?: number; className?: string; onClick?: () => void; play?: boolean; pressed?: boolean; children?: React.ReactNode;
}) {
  const [hover, setHover] = React.useState(false);
  const blip = useBlip();
  const Icon = NX_ICONS[slug];
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={() => { blip(slug); onClick?.(); }}
      className={cn("inline-flex items-center justify-center rounded-xl outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", className)}
    >
      <Icon size={size} play={play ?? hover} />
      {children}
    </button>
  );
}

function Card({ title, where, slugs, children, className }: { title: string; where: string; slugs: string[]; children: React.ReactNode; className?: string }) {
  return (
    <article className={cn("flex flex-col overflow-hidden rounded-[24px] bg-card shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]", className)}>
      <div className="flex flex-1 items-center justify-center bg-secondary/60 p-5 sm:p-6">{children}</div>
      <div className="p-5">
        <h3 className="text-[16px] font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted-foreground">{where}</p>
        <p className="mt-3 flex flex-wrap gap-1.5">
          {slugs.map((s) => (
            <Link key={s} href={`/icons/${s}`} className="rounded-full bg-secondary px-2.5 py-1 text-[12px] text-foreground/80 transition-colors hover:text-foreground">
              {s}
            </Link>
          ))}
        </p>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------------------------------ editor toolbar */
function EditorToolbar() {
  const [last, setLast] = React.useState("Pick a tool");
  const [code, setCode] = React.useState(false);
  const tools: { slug: string; label: string; msg: string }[] = [
    { slug: "undo", label: "Undo", msg: "Undid the last change" },
    { slug: "pencil", label: "Edit", msg: "Editing the title" },
    { slug: "link", label: "Link", msg: "Link added to the selection" },
    { slug: "paperclip", label: "Attach", msg: "File attached" },
    { slug: "image", label: "Image", msg: "Image inserted" },
    { slug: "scissors", label: "Cut", msg: "Cut to the clipboard" },
    { slug: "sliders", label: "Adjust", msg: "Opened the style panel" },
  ];
  return (
    <div className="w-full max-w-[380px] rounded-2xl bg-background p-2.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
      <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Editor toolbar">
        {tools.map((t) => (
          <IconButton key={t.slug} slug={t.slug} label={t.label} onClick={() => setLast(t.msg)} className="size-9 text-foreground hover:bg-secondary" />
        ))}
        <span aria-hidden className="mx-px h-5 w-px bg-border" />
        <IconButton
          slug="code"
          label="Code block"
          pressed={code}
          onClick={() => { setCode((v) => !v); setLast(code ? "Code block off" : "Code block on"); }}
          className={cn("size-9 hover:bg-secondary", code ? "bg-foreground text-background hover:bg-foreground" : "text-foreground")}
        />
      </div>
      <div className="mt-2 space-y-2 rounded-xl bg-secondary/60 p-3" aria-hidden>
        <div className="h-2.5 w-2/5 rounded-full bg-foreground/25" />
        <div className="h-2 w-full rounded-full bg-foreground/10" />
        <div className={cn("h-2 w-4/5 rounded-full", code ? "bg-[#30d158]/40" : "bg-foreground/10")} />
      </div>
      <p className="mt-2 px-1 text-[12.5px] text-muted-foreground" aria-live="polite">{last}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ music player */
function MusicPlayer() {
  const [playing, setPlaying] = React.useState(false);
  const [liked, setLiked] = React.useState(false);
  const [shuffle, setShuffle] = React.useState(false);
  const [repeat, setRepeat] = React.useState(false);
  const [muted, setMuted] = React.useState(false);
  const [pos, setPos] = React.useState(32);
  const [track, setTrack] = React.useState(0);
  const tracks = [["Night Drive", "Nexus Radio"], ["Paper Planes", "The Loop Club"], ["Soft Focus", "Pixel & Pine"]];

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setPos((p) => (p >= 100 ? 0 : p + 1)), 300);
    return () => clearInterval(id);
  }, [playing]);

  const next = (dir: 1 | -1) => { setTrack((n) => (n + dir + tracks.length) % tracks.length); setPos(0); };
  const secs = Math.round((pos / 100) * 184);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-[340px] rounded-[26px] bg-background p-4 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
      <div className="flex items-center gap-3.5">
        <div className="grid size-[68px] shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#ff375f] via-[#bf5af2] to-[#0a84ff] text-white">
          <NX_ICONS.music size={30} play={playing} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15.5px] font-semibold text-foreground">{tracks[track][0]}</p>
          <p className="truncate text-[13px] text-muted-foreground">{tracks[track][1]}</p>
        </div>
        <IconButton
          slug="heart"
          label={liked ? "Unlike" : "Like"}
          pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className={cn("size-10 hover:bg-secondary", liked ? "text-[#ff375f]" : "text-muted-foreground")}
        />
      </div>

      <div className="mt-4">
        <input
          type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} aria-label="Seek"
          className="h-1.5 w-full cursor-pointer accent-[var(--foreground)]"
        />
        <div className="mt-1 flex justify-between text-[11.5px] tabular-nums text-muted-foreground"><span>{fmt(secs)}</span><span>-{fmt(184 - secs)}</span></div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <IconButton slug="shuffle" label="Shuffle" pressed={shuffle} onClick={() => setShuffle((v) => !v)} className={cn("size-10 hover:bg-secondary", shuffle ? "text-[#ff9f0a]" : "text-muted-foreground")} />
        <span className="-scale-x-100"><IconButton slug="skip-forward" label="Previous track" size={24} onClick={() => next(-1)} className="size-11 text-foreground hover:bg-secondary" /></span>
        <IconButton
          slug="play-pause"
          label={playing ? "Pause" : "Play"}
          size={28}
          play={playing}
          onClick={() => setPlaying((v) => !v)}
          className="size-14 rounded-full bg-foreground text-background hover:opacity-90"
        />
        <IconButton slug="skip-forward" label="Next track" size={24} onClick={() => next(1)} className="size-11 text-foreground hover:bg-secondary" />
        <IconButton slug="repeat" label="Repeat" pressed={repeat} onClick={() => setRepeat((v) => !v)} className={cn("size-10 hover:bg-secondary", repeat ? "text-[#30d158]" : "text-muted-foreground")} />
      </div>

      <div className="mt-2 flex items-center gap-2 text-muted-foreground">
        <IconButton slug="volume" label={muted ? "Unmute" : "Mute"} pressed={muted} onClick={() => setMuted((v) => !v)} className={cn("size-9 hover:bg-secondary", muted && "opacity-50")} size={18} />
        <input type="range" min={0} max={100} defaultValue={70} aria-label="Volume" className="h-1 flex-1 cursor-pointer accent-[var(--foreground)]" />
        <IconButton slug="headphones" label="Output device" size={18} className="size-9 hover:bg-secondary" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ product card */
function ProductCard() {
  const [qty, setQty] = React.useState(0);
  const [saved, setSaved] = React.useState(false);
  const [paid, setPaid] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const blip = useBlip();
  const Headphones = NX_ICONS.headphones;
  return (
    <div className="w-full max-w-[320px] rounded-[26px] bg-background p-3.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative grid h-[150px] place-items-center rounded-2xl bg-gradient-to-br from-[#bf5af2]/25 to-[#0a84ff]/20 text-foreground">
        <Headphones size={72} strokeWidth={1.6} play={hover} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#e0214b] px-2.5 py-1 text-[12px] font-semibold text-white">
          <NX_ICONS.tag size={14} play={hover} /> 20% off
        </span>
        <IconButton slug="heart" label={saved ? "Remove from wishlist" : "Save to wishlist"} pressed={saved} onClick={() => setSaved((v) => !v)} className={cn("absolute right-2 top-2 size-9 bg-background/70 backdrop-blur", saved ? "text-[#ff375f]" : "text-foreground")} size={18} />
      </div>
      <div className="mt-3 flex items-end justify-between px-1">
        <div>
          <p className="text-[15.5px] font-semibold text-foreground">Nova Headphones</p>
          <p className="text-[13px] text-muted-foreground">Wireless, 40h battery</p>
        </div>
        <p className="text-right"><span className="text-[20px] font-semibold text-foreground">$79</span> <span className="text-[13px] text-muted-foreground line-through">$99</span></p>
      </div>
      <p className="mt-2.5 flex items-center gap-2 px-1 text-[12.5px] text-muted-foreground">
        <NX_ICONS.package size={16} play={hover} /> Free delivery, arrives Friday
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => { setQty((q) => q + 1); blip("shopping-bag"); }}
          className="group inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-[14.5px] font-medium text-background outline-none transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <ShoppingBag size={18} play={hover} /> Add to bag{qty > 0 && <span className="rounded-full bg-background/20 px-2 text-[12px]">{qty}</span>}
        </button>
        <button
          type="button"
          aria-label={paid ? "Paid" : "Pay with wallet"}
          title="Pay with wallet"
          onClick={() => { setPaid(true); blip("wallet"); setTimeout(() => setPaid(false), 1600); }}
          className={cn("grid size-11 place-items-center rounded-full outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", paid ? "bg-[#30d158] text-white" : "bg-secondary text-foreground hover:bg-secondary/70")}
        >
          <NX_ICONS.wallet size={20} play={paid || hover} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ toasts */
type Toast = { id: string; slug: string; accent: string; title: string; body: string };
const TOASTS: Toast[] = [
  { id: "ok", slug: "check-circle", accent: "#30d158", title: "Order placed", body: "Your headphones are on the way." },
  { id: "warn", slug: "alert-triangle", accent: "#ff9f0a", title: "Low battery", body: "Charge your device soon." },
  { id: "info", slug: "info", accent: "#0a84ff", title: "Did you know?", body: "Swipe left to archive a message." },
];

function Toasts() {
  const [open, setOpen] = React.useState<string[]>(TOASTS.map((t) => t.id));
  const [epoch, setEpoch] = React.useState(0);
  return (
    <div className="w-full max-w-[360px] space-y-2.5">
      {TOASTS.filter((t) => open.includes(t.id)).map((t) => {
        const Icon = NX_ICONS[t.slug];
        return (
          <div key={`${t.id}-${epoch}`} className="flex items-start gap-3 rounded-2xl bg-background p-3.5 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
            <span className="mt-0.5 shrink-0" style={{ color: t.accent }}><Icon size={22} play /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[14.5px] font-semibold text-foreground">{t.title}</p>
              <p className="text-[13px] text-muted-foreground">{t.body}</p>
            </div>
            <IconButton slug="close" label={`Dismiss ${t.title}`} size={16} onClick={() => setOpen((o) => o.filter((x) => x !== t.id))} className="size-8 text-muted-foreground hover:bg-secondary" />
          </div>
        );
      })}
      {open.length === 0 && (
        <button type="button" onClick={() => { setOpen(TOASTS.map((t) => t.id)); setEpoch((e) => e + 1); }} className="mx-auto flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-[14px] font-medium text-background">
          <NX_ICONS.refresh size={16} /> Bring them back
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ chat composer */
function ChatComposer() {
  const [text, setText] = React.useState("");
  const [msgs, setMsgs] = React.useState<{ from: "me" | "bot"; text: string }[]>([{ from: "bot", text: "Hey! Want to see the new icons?" }]);
  const [typing, setTyping] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const blip = useBlip();
  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    blip("send");
    setMsgs((m) => [...m, { from: "me", text: v }]);
    setText("");
    setTyping(true);
    timer.current = setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { from: "bot", text: "Love it. Sending the file over." }]); }, 1500);
  };

  return (
    <div className="w-full max-w-[340px] rounded-[26px] bg-background p-3 shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
      <div className="flex h-[150px] flex-col justify-end gap-1.5 overflow-hidden px-1 pb-2" aria-live="polite">
        {msgs.slice(-3).map((m, i) => (
          <p key={`${i}-${m.text}`} className={cn("max-w-[80%] rounded-2xl px-3 py-1.5 text-[13.5px]", m.from === "me" ? "ml-auto bg-[#0a84ff] text-white" : "bg-secondary text-foreground")}>{m.text}</p>
        ))}
        {typing && <span className="inline-flex w-fit items-center rounded-2xl bg-secondary px-3 py-2 text-muted-foreground"><WaveDots size={22} /></span>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-1 rounded-full bg-secondary/70 p-1.5">
        <IconButton slug="paperclip" label="Attach a file" size={19} className="size-9 text-muted-foreground hover:text-foreground" />
        <IconButton slug="image" label="Add a photo" size={19} className="size-9 text-muted-foreground hover:text-foreground" />
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" aria-label="Message" className="min-w-0 flex-1 bg-transparent px-1 text-[14.5px] text-foreground outline-none placeholder:text-muted-foreground" />
        <button type="submit" aria-label="Send" className="grid size-9 place-items-center rounded-full bg-[#0a84ff] text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <NX_ICONS.send size={17} play={text.length > 0} />
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ tab bar */
function TabBar() {
  const tabs = [
    { slug: "home", label: "Home" },
    { slug: "search", label: "Search" },
    { slug: "plus", label: "New" },
    { slug: "bell", label: "Alerts" },
    { slug: "user", label: "Profile" },
  ];
  const [active, setActive] = React.useState("home");
  const [epoch, setEpoch] = React.useState(0);
  const blip = useBlip();
  return (
    <div className="w-full max-w-[340px] overflow-hidden rounded-[30px] bg-background shadow-[0_8px_30px_-12px_rgba(0,0,0,.25)]">
      <div className="grid h-[132px] place-items-center bg-gradient-to-b from-secondary/50 to-transparent">
        <p className="text-[13px] text-muted-foreground" aria-live="polite">{tabs.find((t) => t.slug === active)?.label} screen</p>
      </div>
      <nav aria-label="Tab bar" className="flex items-center justify-around border-t border-border px-2 pb-3 pt-2">
        {tabs.map((t) => {
          const Icon = NX_ICONS[t.slug];
          const on = active === t.slug;
          const fab = t.slug === "plus";
          return (
            <button
              key={t.slug}
              type="button"
              aria-label={t.label}
              aria-current={on ? "page" : undefined}
              onClick={() => { setActive(t.slug); setEpoch((e) => e + 1); blip(t.slug); }}
              className={cn(
                "relative flex flex-col items-center gap-0.5 rounded-xl px-3 py-1 outline-none focus-visible:outline-2 focus-visible:outline-ring",
                fab ? "mx-1 size-12 justify-center rounded-full bg-foreground text-background" : on ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icon key={on ? epoch : "idle"} size={fab ? 22 : 22} play={on} />
              {!fab && <span className="text-[10.5px] font-medium">{t.label}</span>}
              {t.slug === "bell" && <span aria-hidden className="absolute right-2 top-0.5 size-2 rounded-full bg-[#ff375f]" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------ the section */
export function RealInterfaces() {
  const [sound, setSound] = React.useState(false);
  return (
    <SoundContext.Provider value={sound}>
      <div className="flex justify-end">
        <button
          type="button"
          aria-pressed={sound}
          onClick={() => setSound((v) => !v)}
          className={cn("inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-medium outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring", sound ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/70")}
        >
          {sound ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />} Sound
        </button>
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Editor toolbar" where="Undo, edit, link, attach and crop buttons for a rich-text editor, a notes app or a CMS. Each one plays on hover, so the toolbar feels alive without a single extra line of CSS." slugs={["undo", "pencil", "link", "paperclip", "image", "scissors", "sliders", "code"]}>
          <EditorToolbar />
        </Card>
        <Card title="Music and video players" where="A real play and pause that morphs on a spring, with shuffle, skip, repeat, volume and a like button. Drop it into a podcast app, a video page or a radio widget." slugs={["play-pause", "skip-forward", "shuffle", "repeat", "volume", "heart", "headphones", "music"]}>
          <MusicPlayer />
        </Card>
        <Card title="Carts and product cards" where="An add-to-bag button, a price tag, a wishlist heart, delivery info and a wallet pay button. Fit them into a store, a marketplace or a checkout." slugs={["shopping-bag", "tag", "heart", "package", "wallet", "shopping-cart", "credit-card", "truck"]}>
          <ProductCard />
        </Card>
        <Card title="Toasts and alerts" where="Success, warning and info messages with a dismiss button. Each icon plays as the message appears, so a warning gets noticed without a word." slugs={["check-circle", "alert-triangle", "info", "close", "refresh"]}>
          <Toasts />
        </Card>
        <Card title="Chat and composers" where="Attach, photo and send buttons for a messenger, a support widget or a comment box, with a typing indicator while the other side replies." slugs={["paperclip", "image", "send", "wave-dots", "message", "mic"]}>
          <ChatComposer />
        </Card>
        <Card title="Mobile tab bars" where="Home, search, create, alerts and profile. The active tab plays its icon each time you switch to it, which makes a bottom bar feel native." slugs={["home", "search", "plus", "bell", "user"]}>
          <TabBar />
        </Card>
      </div>
    </SoundContext.Provider>
  );
}
