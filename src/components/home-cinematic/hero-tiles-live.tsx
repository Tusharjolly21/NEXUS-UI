"use client";

import { AvatarGroup } from "@/components/avatar-group";
import { CouponApply } from "@/components/coupon-apply";
import { DictationCard } from "@/components/dictation-card";
import { GlyphFlow } from "@/components/glyph-flow";
import { HomeScenes } from "@/components/home-scenes";
import { DOT_GLOBE_CITIES, DOT_GLOBE_ROUTES, DotGlobe } from "@/components/dot-globe";
import { PieceStack } from "./hero-tiles-frame";

/** The same illustrated faces as the comment line under the buttons, on soft tints from the Nexus palette. */
const PEOPLE = [
  { src: "/avatars/face-0.svg", fallback: "A", tooltip: "Aiko", bgColor: "#d6ecff" },
  { src: "/avatars/face-1.svg", fallback: "M", tooltip: "Mateo", bgColor: "#e4e0ff" },
  { src: "/avatars/face-2.svg", fallback: "S", tooltip: "Sana", bgColor: "#f3e3ff" },
  { src: "/avatars/face-3.svg", fallback: "J", tooltip: "Jo", bgColor: "#ffe0e7" },
  { src: "/avatars/face-4.svg", fallback: "L", tooltip: "Lena", bgColor: "#dff5e8" },
];

/** Three cities, so the globe's chips fit on one row. */
const GLOBE_CITIES = DOT_GLOBE_CITIES.filter((c) => ["sf", "ldn", "tyo"].includes(c.id));
const GLOBE_ROUTES = DOT_GLOBE_ROUTES.filter(([a, b]) => ["sf", "ldn", "tyo"].includes(a) && ["sf", "ldn", "tyo"].includes(b));

/**
 * The newest Pro components, running. Loaded on its own (see hero-tiles.tsx), so none of this is in the page's first
 * scripts. Nothing here plays by itself: they all wait to be used.
 */
export default function HeroTilesLive() {
  return (
    <PieceStack
      render={{
        glyph: <GlyphFlow idleFps={20} />,
        dictate: <DictationCard />,
        avatars: (
          <div className="cx-tile grid place-items-center rounded-[20px] py-4">
            <AvatarGroup avatars={PEOPLE} size={48} overlap={10} borderWidth={3} entranceAnimation="none" showTooltips={false} />
          </div>
        ),
        scenes: <HomeScenes />,
        apply: <CouponApply />,
        globe: <DotGlobe size={250} accent="#6e5bff" cities={GLOBE_CITIES} routes={GLOBE_ROUTES} still />,
      }}
    />
  );
}
