"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProBadge } from "@/components/pro/pro-access";
import { SoundBlob } from "@/components/sounds/sound-blob";
import { moltenHoldSound } from "@/components/molten-hold/molten-hold-sound";
import { mercurySwitchSound } from "@/components/mercury-switch/mercury-switch-sound";
import { mercuryUploadSound } from "@/components/mercury-upload/mercury-upload-sound";
import { statusMorphSounds } from "@/components/status-morph/status-morph-sound";
import { playDef, type SoundDef } from "@/lib/ui-sounds";

/**
 * A sound that belongs to one thing. `play` runs from the tap; `blob` picks the colour of its drop.
 * `from` names the component or icon it was scored for, and `href` opens it.
 */
type Tile = {
  key: string;
  label: string;
  from: string;
  href: string;
  pro: boolean;
  blob: string;
  /** One plain line on what you hear, used as the tile's description for screen readers. */
  heard: string;
  play: () => void;
};

/** Plays a sound recipe from a component's own sound file, whatever the visitor's sound switch says: they tapped it. */
const def = (key: string, d: SoundDef) => () => playDef(`scored:${key}`, d, 1, true);

const COMPONENT_TILES: Tile[] = [
  { key: "mh-ignite", label: "Ignite", from: "Molten Hold", href: "/components/molten-hold", pro: true, blob: "Molten Hold", heard: "A low thump and a short whoosh as the metal starts to run.", play: def("mh-ignite", moltenHoldSound("ignite")) },
  { key: "mh-sizzle", label: "Sizzle", from: "Molten Hold", href: "/components/molten-hold", pro: true, blob: "Molten Hold", heard: "One grain of hiss and crackle; the component plays many, closer together as the channel fills.", play: def("mh-sizzle", moltenHoldSound("grain", 0.6)) },
  { key: "mh-drain", label: "Drain", from: "Molten Hold", href: "/components/molten-hold", pro: true, blob: "Molten Hold", heard: "An airy slide down with a few bubbly notes, for letting go early.", play: def("mh-drain", moltenHoldSound("drain")) },
  { key: "mh-set", label: "Set", from: "Molten Hold", href: "/components/molten-hold", pro: true, blob: "Molten Hold", heard: "A heavy thunk, a hiss of steam and a ring of chrome as the metal sets.", play: def("mh-set", moltenHoldSound("set")) },
  { key: "mh-undo", label: "Undo", from: "Molten Hold", href: "/components/molten-hold", pro: true, blob: "Molten Hold", heard: "A soft reverse blip.", play: def("mh-undo", moltenHoldSound("undo")) },
  { key: "ms-on", label: "Flip on", from: "Mercury Switch", href: "/components/mercury-switch", pro: true, blob: "Mercury", heard: "A bloop that rises as the liquid metal crosses the groove, then a plop and a small chrome ring.", play: def("ms-on", mercurySwitchSound("on")) },
  { key: "ms-off", label: "Flip off", from: "Mercury Switch", href: "/components/mercury-switch", pro: true, blob: "Mercury", heard: "The same drop falling instead of rising.", play: def("ms-off", mercurySwitchSound("off")) },
  { key: "ms-grab", label: "Grab", from: "Mercury Switch", href: "/components/mercury-switch", pro: true, blob: "Mercury", heard: "A short, wet squeeze as you take hold of the bead.", play: def("ms-grab", mercurySwitchSound("grab")) },
  { key: "mu-catch", label: "Catch", from: "Mercury Upload", href: "/components/mercury-upload", pro: true, blob: "Mercury", heard: "A soft thock as the file arrives.", play: def("mu-catch", mercuryUploadSound("catch")) },
  { key: "mu-drip", label: "Drip", from: "Mercury Upload", href: "/components/mercury-upload", pro: true, blob: "Mercury", heard: "A tick as a bead lets go under the chip.", play: def("mu-drip", mercuryUploadSound("drip")) },
  { key: "mu-plop", label: "Plop", from: "Mercury Upload", href: "/components/mercury-upload", pro: true, blob: "Mercury", heard: "A bubble as the bead lands in the pool. Its pitch rises as the pool fills; this one is halfway.", play: def("mu-plop", mercuryUploadSound("plop", 0.5)) },
  { key: "mu-pull", label: "Pull together", from: "Mercury Upload", href: "/components/mercury-upload", pro: true, blob: "Mercury", heard: "A rising swell of air and a low note as the pool gathers into one bead.", play: def("mu-pull", mercuryUploadSound("pull")) },
  { key: "mu-done", label: "Done", from: "Mercury Upload", href: "/components/mercury-upload", pro: true, blob: "Mercury", heard: "A thunk as the bead settles and a ring of chrome as the check is pressed in.", play: def("mu-done", mercuryUploadSound("done")) },
];

const STATUS = statusMorphSounds(1);
const STATUS_HEARD: Record<keyof typeof STATUS, string> = {
  connect: "A tap, three notes falling as the battery drains, an airy swish and a plink for each dot that drops.",
  ripple: "Faint ticks that climb with the Wi-Fi arcs while it searches.",
  connected: "A bright chime as the arcs fill in.",
  disconnect: "Four pips as the bars stand back up, and a bubbly charging chime.",
  cancel: "A short, soft undo.",
};
const STATUS_TILES: Tile[] = (Object.keys(STATUS) as (keyof typeof STATUS)[]).map((k) => ({
  key: `sm-${k}`,
  label: STATUS[k].label,
  from: "Status Morph",
  href: "/components/status-morph",
  pro: false,
  blob: "Status Morph",
  heard: STATUS_HEARD[k],
  play: def(`sm-${k}`, STATUS[k]),
}));

/** The three liquid looks of the animated icons, each with a short layer for hover and a longer one for picking the look. */
const LOOKS = [
  { id: "mercury", name: "Mercury", blob: "Mercury", hover: "A bead of metal rolling, with a shine sweeping over it.", pick: "Mercury pouring, a blob landing and polishing up, then a chrome ring." },
  { id: "liquid", name: "Liquid", blob: "Liquid", hover: "A wet slosh with three bloops.", pick: "One big bloop, a slosh and a run of drips." },
  { id: "glass", name: "Glass", blob: "Glass", hover: "A clink and a short thin ring.", pick: "A clink and a long, thin ring." },
] as const;

/** The little the page needs to know about an icon, passed down by the server so the whole catalog stays out of this bundle. */
export type IconPick = { slug: string; title: string; heard: string; premium: boolean };

type IconSounds = typeof import("@/components/nx-icons/icon-sounds");
let iconModule: Promise<IconSounds> | null = null;
/** The 200 icon scores are their own chunk: loaded the first time the visitor reaches for one. */
const loadIcons = () => (iconModule ??= import("@/components/nx-icons/icon-sounds"));

const LOOK_TILES: Tile[] = [
  ...LOOKS.flatMap((l) => [
    { key: `look-${l.id}-hover`, label: `${l.name} hover`, from: "Icon looks", href: "/icons", pro: false, blob: l.blob, heard: l.hover, play: () => void loadIcons().then((m) => m.playMaterialSound(l.id, "hover", { force: true })) },
    { key: `look-${l.id}-switch`, label: `${l.name} picked`, from: "Icon looks", href: "/icons", pro: false, blob: l.blob, heard: l.pick, play: () => void loadIcons().then((m) => m.playMaterialSound(l.id, "switch", { force: true })) },
  ]),
];

const iconTile = (i: IconPick): Tile => ({
  key: `icon-${i.slug}`,
  label: i.title,
  from: "Animated icon",
  href: `/icons/${i.slug}`,
  pro: i.premium,
  blob: "Icons",
  heard: i.heard,
  play: () => void loadIcons().then((m) => m.playIconSound(i.slug, { force: true })),
});

function Group({ title, blurb, tiles, hits, onPlay, warm }: { title: string; blurb: string; tiles: Tile[]; hits: Record<string, number>; onPlay: (t: Tile) => void; warm?: () => void }) {
  return (
    <div>
      <h3 className="text-[19px] font-semibold tracking-[-0.3px] text-foreground">{title}</h3>
      <p className="mt-1 max-w-[620px] text-[15px] leading-relaxed text-muted-foreground">{blurb}</p>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" aria-label={title}>
        {tiles.map((t) => (
          <li
            key={t.key}
            className="relative flex flex-col items-center rounded-[22px] bg-card pb-3 text-center shadow-[0_0_0_1px_var(--border)] transition-shadow hover:shadow-[0_0_0_1px_var(--border),0_14px_30px_-18px_rgba(0,0,0,0.35)]"
          >
            <button
              type="button"
              onClick={() => onPlay(t)}
              onPointerEnter={warm}
              onFocus={warm}
              aria-label={`Play ${t.label}, from ${t.from}${t.pro ? ", Pro" : ""}. ${t.heard}`}
              className="flex w-full flex-col items-center gap-3 rounded-[22px] px-3 pb-1 pt-5 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <SoundBlob category={t.blob} hit={hits[t.key] ?? 0} className="block h-24 w-full" />
              <span className="block text-[15px] font-semibold tracking-[-0.2px] text-foreground">{t.label}</span>
            </button>
            <Link href={t.href} className="mt-0.5 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12.5px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-ring">
              {t.from}
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
            {t.pro ? <ProBadge className="pointer-events-none absolute right-3 top-3" /> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Sounds that belong to one component or icon, rather than to the shared library above: each is scored to its
 * picture and lives in that component's or icon's own file. Tap one to hear it. Everything is synthesised in the
 * browser, so there is nothing to download, and every one plays for everyone; the code comes with the component.
 */
export function ScoredSounds({ icons }: { icons: IconPick[] }) {
  const [hits, setHits] = React.useState<Record<string, number>>({});
  const play = (t: Tile) => {
    setHits((h) => ({ ...h, [t.key]: (h[t.key] ?? 0) + 1 }));
    t.play();
  };
  return (
    <div className="rounded-tile bg-[#f5f5f7] p-4 sm:p-6 dark:bg-card">
      <div className="flex flex-col gap-10">
        <Group
          title="Made for components"
          blurb="Four newer components carry sounds of their own, scored to what happens on screen. Each one is a single event here; in the component they follow the pour, the flip or the upload as it runs."
          tiles={[...COMPONENT_TILES, ...STATUS_TILES]}
          hits={hits}
          onPlay={play}
        />
        <Group
          title="Made for icons"
          blurb="Every animated icon has its own sound, timed to its animation, and the three liquid looks add a layer of their own. These are a few of the 200."
          tiles={[...LOOK_TILES, ...icons.map(iconTile)]}
          hits={hits}
          onPlay={play}
          warm={() => void loadIcons()}
        />
        <p className="text-[14.5px] text-muted-foreground">
          Want the rest? Every icon page plays its own sound next to the code, and the{" "}
          <Link href="/icons/sounds" className="inline-flex items-center gap-0.5 font-medium text-foreground underline underline-offset-4">
            icon sound guide<ArrowUpRight className="size-3.5" aria-hidden />
          </Link>{" "}
          shows how to add them to your own app.
        </p>
      </div>
    </div>
  );
}
