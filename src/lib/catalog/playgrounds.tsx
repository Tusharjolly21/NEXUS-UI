"use client";

import * as React from "react";
import { AvatarGroup } from "@/components/avatar-group";
import { Meteors } from "@/components/meteors";
import { Sparkles } from "@/components/sparkles";
import { WordMagnet } from "@/components/word-magnet";
import { GlowButton } from "@/components/glow-button";
import { BackgroundBoxes } from "@/components/background-boxes";
import { FeatureToolsCard } from "@/components/feature-tools-card";
import { ImageTrail } from "@/components/image-trail";
import { EncryptedText } from "@/components/encrypted-text";
import { TypewriterEffect } from "@/components/typewriter-effect";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import { GooeyInput } from "@/components/gooey-input";

/**
 * Live props playgrounds for component detail pages (Bencho-style "tweak and copy").
 *
 * Each control's `defaultValue` must match the component's own default so the generated
 * snippet only lists props the visitor actually changed.
 */
export type PlaygroundControl =
  | {
      kind: "range";
      prop: string;
      label: string;
      min: number;
      max: number;
      step: number;
      unit?: string;
      defaultValue: number;
    }
  | { kind: "toggle"; prop: string; label: string; defaultValue: boolean }
  | { kind: "select"; prop: string; label: string; options: readonly string[]; defaultValue: string }
  | { kind: "color"; prop: string; label: string; options: readonly string[]; defaultValue: string };

export type PlaygroundValues = Record<string, number | boolean | string>;

export type Playground = {
  /** Component name used in the generated JSX snippet. */
  componentName: string;
  importPath: string;
  controls: PlaygroundControl[];
  /** Props that are always present in the snippet, written verbatim (e.g. `avatars={avatars}`). */
  snippetBaseProps?: string[];
  /** Which surface the stage starts on. */
  defaultFill?: "light" | "dark";
  render: (values: PlaygroundValues, fill: "light" | "dark") => React.ReactNode;
};

const DEMO_AVATARS = [
  { fallback: "PS", tooltip: "Priya Sharma", bgColor: "#06b6d4" },
  { fallback: "JK", tooltip: "James Kowalski", bgColor: "#8b5cf6" },
  { fallback: "SC", tooltip: "Sofia Chen", bgColor: "#10b981" },
  { fallback: "MR", tooltip: "Marcus Reid", bgColor: "#f59e0b" },
  { fallback: "AN", tooltip: "Aisha Nkosi", bgColor: "#d946ef" },
  { fallback: "TR", tooltip: "Tomás Reyes", bgColor: "#0ea5e9" },
];

// Unsplash is allowed by the site's img-src CSP
const TRAIL_IMAGES = [
  { src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=80", alt: "Mountains" },
  { src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80", alt: "Forest" },
  { src: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=80", alt: "Valley" },
  { src: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=300&q=80", alt: "Autumn" },
  { src: "https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=300&q=80", alt: "Lake" },
];

const TYPEWRITER_LINES = ["Ship faster.", "Build better.", "Delight users."];

export const playgrounds: Record<string, Playground> = {
  "avatar-group": {
    componentName: "AvatarGroup",
    importPath: "@/components/avatar-group",
    snippetBaseProps: ["avatars={avatars}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Size", min: 24, max: 72, step: 1, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "overlap", label: "Overlap", min: 0, max: 32, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "borderWidth", label: "Border", min: 0, max: 6, step: 1, unit: "px", defaultValue: 2 },
      { kind: "range", prop: "hoverScale", label: "Hover scale", min: 1, max: 1.5, step: 0.05, unit: "×", defaultValue: 1.1 },
      { kind: "select", prop: "hoverAnimation", label: "Hover", options: ["lift", "scale", "rotate", "up", "none"], defaultValue: "lift" },
      { kind: "select", prop: "entranceAnimation", label: "Entrance", options: ["scale", "fade", "flip", "slide", "bounce", "none"], defaultValue: "scale" },
      { kind: "toggle", prop: "showTooltips", label: "Tooltips", defaultValue: true },
    ],
    render: (v) => (
      <AvatarGroup
        avatars={DEMO_AVATARS}
        size={v.size as number}
        overlap={v.overlap as number}
        borderWidth={v.borderWidth as number}
        hoverScale={v.hoverScale as number}
        hoverAnimation={v.hoverAnimation as "lift"}
        entranceAnimation={v.entranceAnimation as "scale"}
        showTooltips={v.showTooltips as boolean}
      />
    ),
  },

  sparkles: {
    componentName: "Sparkles",
    importPath: "@/components/sparkles",
    snippetBaseProps: ["background"],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "count", label: "Count", min: 8, max: 240, step: 4, defaultValue: 36 },
      { kind: "range", prop: "maxSize", label: "Max size", min: 1, max: 6, step: 0.1, unit: "px", defaultValue: 2.8 },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.05, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "opacity", label: "Opacity", min: 0.1, max: 1, step: 0.05, defaultValue: 0.9 },
      { kind: "color", prop: "color", label: "Color", options: ["#e5f4ff", "#a8d7ff", "#fde68a", "#f9a8d4", "#0f172a"], defaultValue: "#e5f4ff" },
      { kind: "select", prop: "direction", label: "Direction", options: ["random", "up", "down"], defaultValue: "random" },
      { kind: "toggle", prop: "enableGlow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "interactive", label: "Follow cursor", defaultValue: false },
    ],
    render: (v) => (
      <div className="relative h-full w-full">
        <Sparkles
          background
          count={v.count as number}
          maxSize={v.maxSize as number}
          speed={v.speed as number}
          opacity={v.opacity as number}
          color={v.color as string}
          direction={v.direction as "random"}
          enableGlow={v.enableGlow as boolean}
          interactive={v.interactive as boolean}
        />
      </div>
    ),
  },

  meteors: {
    componentName: "Meteors",
    importPath: "@/components/meteors",
    snippetBaseProps: ['className="absolute inset-0"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "number", label: "Meteors", min: 4, max: 60, step: 1, defaultValue: 18 },
      { kind: "range", prop: "angle", label: "Angle", min: 180, max: 260, step: 1, unit: "°", defaultValue: 215 },
      { kind: "range", prop: "maxDuration", label: "Max duration", min: 2, max: 12, step: 0.1, unit: "s", defaultValue: 7.2 },
      { kind: "color", prop: "color", label: "Color", options: ["#93c5fd", "#c4b5fd", "#fda4af", "#fcd34d", "#0f172a"], defaultValue: "#93c5fd" },
      { kind: "select", prop: "intensity", label: "Intensity", options: ["low", "medium", "high"], defaultValue: "medium" },
      { kind: "toggle", prop: "glow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "hoverOnly", label: "Only on hover", defaultValue: false },
    ],
    render: (v) => (
      <Meteors
        className="absolute inset-0"
        number={v.number as number}
        angle={v.angle as number}
        maxDuration={v.maxDuration as number}
        minDuration={Math.min(3.2, (v.maxDuration as number) - 0.5)}
        color={v.color as string}
        intensity={v.intensity as "medium"}
        glow={v.glow as boolean}
        hoverOnly={v.hoverOnly as boolean}
      />
    ),
  },

  "word-magnet": {
    componentName: "WordMagnet",
    importPath: "@/components/word-magnet",
    snippetBaseProps: ['text="Magnetic words react to your cursor"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 40, max: 260, step: 2, unit: "px", defaultValue: 130 },
      { kind: "range", prop: "force", label: "Force", min: 0.05, max: 1, step: 0.01, defaultValue: 0.45 },
      { kind: "range", prop: "damping", label: "Damping", min: 6, max: 60, step: 1, defaultValue: 28 },
      { kind: "range", prop: "returnDelay", label: "Return delay", min: 0, max: 1200, step: 20, unit: "ms", defaultValue: 360 },
    ],
    render: (v) => (
      <WordMagnet
        text="Move your cursor through this magnetic headline and watch every word drift aside"
        radius={v.radius as number}
        force={v.force as number}
        damping={v.damping as number}
        returnDelay={v.returnDelay as number}
        disableOnMobile={false}
        className="max-w-xl text-center text-3xl font-medium leading-tight tracking-tight"
      />
    ),
  },

  "glow-button": {
    componentName: "GlowButton",
    importPath: "@/components/glow-button",
    snippetBaseProps: ['href="/signup"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 0, max: 32, step: 1, unit: "px", defaultValue: 8 },
      { kind: "color", prop: "background", label: "Background", options: ["rgb(0, 0, 0)", "#4f46e5", "#e11d48", "#059669", "#f8fafc"], defaultValue: "rgb(0, 0, 0)" },
      { kind: "color", prop: "textColor", label: "Text", options: ["rgb(255, 255, 255)", "#0a0a0a", "#fde68a"], defaultValue: "rgb(255, 255, 255)" },
      { kind: "color", prop: "arrowColor", label: "Arrow", options: ["rgb(255, 255, 255)", "#0a0a0a", "#fde68a"], defaultValue: "rgb(255, 255, 255)" },
    ],
    render: (v) => (
      <GlowButton
        href="#playground"
        radius={v.radius as number}
        background={v.background as string}
        textColor={v.textColor as string}
        arrowColor={v.arrowColor as string}
      >
        Get Started Now
      </GlowButton>
    ),
  },

  "background-boxes": {
    componentName: "BackgroundBoxes",
    importPath: "@/components/background-boxes",
    snippetBaseProps: ['className="h-[600px] w-full"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "boxWidth", label: "Box width", min: 24, max: 120, step: 2, unit: "px", defaultValue: 64 },
      { kind: "range", prop: "boxHeight", label: "Box height", min: 16, max: 80, step: 2, unit: "px", defaultValue: 32 },
      { kind: "range", prop: "skewX", label: "Skew X", min: -60, max: 60, step: 1, unit: "°", defaultValue: -48 },
      { kind: "range", prop: "skewY", label: "Skew Y", min: -30, max: 30, step: 1, unit: "°", defaultValue: 14 },
      { kind: "range", prop: "scale", label: "Scale", min: 0.3, max: 1.2, step: 0.025, unit: "×", defaultValue: 0.675 },
      { kind: "range", prop: "rotation", label: "Rotation", min: -45, max: 45, step: 1, unit: "°", defaultValue: 0 },
      { kind: "color", prop: "borderColor", label: "Lines", options: ["#374151", "#1e3a8a", "#4c1d95", "#d4d4d8"], defaultValue: "#374151" },
      { kind: "toggle", prop: "showCrosses", label: "Crosses", defaultValue: true },
    ],
    // A smaller grid than the component default keeps slider drags smooth (one motion node per cell)
    render: (v) => (
      <BackgroundBoxes
        rows={40}
        cols={32}
        boxWidth={v.boxWidth as number}
        boxHeight={v.boxHeight as number}
        skewX={v.skewX as number}
        skewY={v.skewY as number}
        scale={v.scale as number}
        rotation={v.rotation as number}
        borderColor={v.borderColor as string}
        crossColor={v.borderColor as string}
        showCrosses={v.showCrosses as boolean}
        className="absolute inset-0 h-full w-full"
      />
    ),
  },

  "feature-tools-card": {
    componentName: "FeatureToolsCard",
    importPath: "@/components/feature-tools-card",
    snippetBaseProps: ['title="Connects with your stack"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "tiltStrength", label: "Tilt", min: 0, max: 20, step: 1, unit: "°", defaultValue: 8 },
      { kind: "range", prop: "magneticStrength", label: "Magnet force", min: 0, max: 1, step: 0.05, defaultValue: 0.4 },
      { kind: "range", prop: "magneticRadius", label: "Magnet radius", min: 40, max: 240, step: 5, unit: "px", defaultValue: 120 },
      { kind: "range", prop: "orbitSpeed", label: "Orbit period", min: 4, max: 40, step: 1, unit: "s", defaultValue: 18 },
      { kind: "toggle", prop: "enableTilt", label: "Tilt", defaultValue: true },
      { kind: "toggle", prop: "enableMagnetic", label: "Magnetic icons", defaultValue: true },
      { kind: "toggle", prop: "enableOrbit", label: "Orbit", defaultValue: true },
    ],
    render: (v) => (
      <FeatureToolsCard
        title="Connects with your stack"
        description="Drop-in integrations for the tools your team already uses."
        tiltStrength={v.tiltStrength as number}
        magneticStrength={v.magneticStrength as number}
        magneticRadius={v.magneticRadius as number}
        orbitSpeed={v.orbitSpeed as number}
        enableTilt={v.enableTilt as boolean}
        enableMagnetic={v.enableMagnetic as boolean}
        enableOrbit={v.enableOrbit as boolean}
      />
    ),
  },

  "image-trail": {
    componentName: "ImageTrail",
    importPath: "@/components/image-trail",
    snippetBaseProps: ["images={images}", 'className="h-96 w-full"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "spacing", label: "Spacing", min: 8, max: 120, step: 2, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "imageSize", label: "Image size", min: 40, max: 220, step: 5, unit: "px", defaultValue: 100 },
      { kind: "range", prop: "duration", label: "Lifetime", min: 200, max: 3000, step: 50, unit: "ms", defaultValue: 1000 },
      { kind: "range", prop: "cornerRadius", label: "Corner", min: 0, max: 40, step: 1, unit: "px", defaultValue: 4 },
      { kind: "range", prop: "fadeOutBlur", label: "Fade blur", min: 0, max: 20, step: 1, unit: "px", defaultValue: 5 },
      { kind: "range", prop: "smoothness", label: "Smoothness", min: 0, max: 1, step: 0.05, defaultValue: 0.7 },
      { kind: "toggle", prop: "magneticEffect", label: "Magnetic", defaultValue: false },
    ],
    render: (v) => (
      <ImageTrail
        images={TRAIL_IMAGES}
        spacing={v.spacing as number}
        imageSize={v.imageSize as number}
        duration={v.duration as number}
        cornerRadius={v.cornerRadius as number}
        fadeOutBlur={v.fadeOutBlur as number}
        smoothness={v.smoothness as number}
        magneticEffect={v.magneticEffect as boolean}
        className="absolute inset-0 h-full w-full"
      >
        <div className="pointer-events-none flex h-full items-center justify-center">
          <p className="select-none text-sm opacity-40">Move your cursor here</p>
        </div>
      </ImageTrail>
    ),
  },

  "encrypted-text": {
    componentName: "EncryptedText",
    importPath: "@/components/encrypted-text",
    snippetBaseProps: ['text="ACCESS GRANTED"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "speed", label: "Reveal speed", min: 10, max: 200, step: 5, unit: "ms", defaultValue: 50 },
      { kind: "range", prop: "shuffleSpeed", label: "Shuffle speed", min: 10, max: 120, step: 5, unit: "ms", defaultValue: 35 },
      { kind: "range", prop: "iterations", label: "Iterations", min: 1, max: 20, step: 1, defaultValue: 8 },
      { kind: "select", prop: "trigger", label: "Trigger", options: ["load", "hover", "click", "viewport"], defaultValue: "load" },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: false },
    ],
    render: (v) => (
      <EncryptedText
        text="ACCESS GRANTED"
        speed={v.speed as number}
        shuffleSpeed={v.shuffleSpeed as number}
        iterations={v.iterations as number}
        trigger={v.trigger as "load"}
        loop={v.loop as boolean}
        className="cursor-default font-mono text-3xl font-bold tracking-[0.18em] sm:text-4xl"
      />
    ),
  },

  "typewriter-effect": {
    componentName: "TypewriterEffect",
    importPath: "@/components/typewriter-effect",
    snippetBaseProps: ['text={["Ship faster.", "Build better.", "Delight users."]}'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "typingSpeed", label: "Typing", min: 10, max: 200, step: 5, unit: "ms", defaultValue: 65 },
      { kind: "range", prop: "deletingSpeed", label: "Deleting", min: 10, max: 200, step: 2, unit: "ms", defaultValue: 42 },
      { kind: "range", prop: "pauseDuration", label: "Pause", min: 0, max: 4000, step: 100, unit: "ms", defaultValue: 1200 },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: false },
      { kind: "toggle", prop: "showCursor", label: "Cursor", defaultValue: true },
    ],
    render: (v) => (
      <h2 className="text-center text-4xl font-semibold tracking-tight sm:text-5xl">
        <TypewriterEffect
          text={TYPEWRITER_LINES}
          typingSpeed={v.typingSpeed as number}
          deletingSpeed={v.deletingSpeed as number}
          pauseDuration={v.pauseDuration as number}
          loop={v.loop as boolean}
          showCursor={v.showCursor as boolean}
        />
      </h2>
    ),
  },

  "text-generate-effect": {
    componentName: "TextGenerateEffect",
    importPath: "@/components/text-generate-effect",
    snippetBaseProps: ['text="Build interfaces that feel alive."'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "mode", label: "Split by", options: ["word", "character"], defaultValue: "word" },
      { kind: "range", prop: "duration", label: "Duration", min: 0.1, max: 2, step: 0.02, unit: "s", defaultValue: 0.48 },
      { kind: "range", prop: "stagger", label: "Stagger", min: 0, max: 0.3, step: 0.01, unit: "s", defaultValue: 0.06 },
      { kind: "toggle", prop: "blur", label: "Blur in", defaultValue: true },
      { kind: "toggle", prop: "lift", label: "Lift", defaultValue: true },
    ],
    render: (v) => (
      <TextGenerateEffect
        as="h2"
        text="Build elegant interfaces that feel alive, readable, and deeply polished."
        mode={v.mode as "word"}
        duration={v.duration as number}
        stagger={v.stagger as number}
        blur={v.blur as boolean}
        lift={v.lift as boolean}
        className="max-w-2xl text-center text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
      />
    ),
  },

  "gooey-search-input": {
    componentName: "GooeyInput",
    importPath: "@/components/gooey-input",
    snippetBaseProps: ['placeholder="Search catalog…"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "collapsedWidth", label: "Collapsed", min: 60, max: 240, step: 5, unit: "px", defaultValue: 115 },
      { kind: "range", prop: "expandedWidth", label: "Expanded", min: 120, max: 420, step: 5, unit: "px", defaultValue: 200 },
      { kind: "range", prop: "expandedOffset", label: "Offset", min: 0, max: 160, step: 2, unit: "px", defaultValue: 56 },
      { kind: "range", prop: "gooeyBlur", label: "Goo", min: 0, max: 16, step: 0.5, unit: "px", defaultValue: 5 },
    ],
    render: (v) => (
      <GooeyInput
        placeholder="Search catalog…"
        collapsedWidth={v.collapsedWidth as number}
        expandedWidth={v.expandedWidth as number}
        expandedOffset={v.expandedOffset as number}
        gooeyBlur={v.gooeyBlur as number}
      />
    ),
  },
};

export function getPlayground(slug: string): Playground | undefined {
  return playgrounds[slug];
}
