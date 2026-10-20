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
import { TickSlider } from "@/components/tick-slider";
import { TimeScrubber } from "@/components/time-scrubber";
import { SlideToConfirm } from "@/components/slide-to-confirm";
import { EmojiReactions } from "@/components/emoji-reactions";
import { LikeBurst } from "@/components/like-burst";
import { ToastStack } from "@/components/toast-stack";
import { UploadDropzone } from "@/components/upload-dropzone";
import { HoldToRecord } from "@/components/hold-to-record";
import { CursorBuddy } from "@/components/cursor-buddy";
import { DotSphere } from "@/components/dot-sphere";
import { DynamicIsland } from "@/components/dynamic-island";
import { OtpInput } from "@/components/otp-input";
import { RadioCards } from "@/components/radio-cards";
import { HoldToConfirm } from "@/components/hold-to-confirm";
import { BeforeAfter } from "@/components/before-after";
import { PriceOdometer } from "@/components/price-odometer";
import { PasswordStrength } from "@/components/password-strength";
import { TiltPass } from "@/components/tilt-pass";
import { AnimatedTabs } from "@/components/animated-tabs";
import { SharedElementCards } from "@/components/shared-element-cards";
import { RotatingHeadline } from "@/components/rotating-headline";
import { StretchNav } from "@/components/stretch-nav";
import { FeedbackPill } from "@/components/feedback-pill";
import { StaggerMenu } from "@/components/stagger-menu";
import { RulerPicker } from "@/components/ruler-picker";
import { ElasticStepper } from "@/components/elastic-stepper";
import { TodoList } from "@/components/todo-list";
import { ProgressButton } from "@/components/progress-button";
import { CopyChip } from "@/components/copy-button";
import { AnimatedIcons } from "@/components/animated-icons";
import { FolderPeek } from "@/components/folder-peek";
import { MagnifyDock } from "@/components/magnify-dock";
import { UploadChips } from "@/components/upload-chips";
import { NotificationStack } from "@/components/notification-stack";
import { IslandMorph } from "@/components/island-morph";
import { GlassBubbles } from "@/components/glass-bubbles";
import { BoxSpill } from "@/components/box-spill";
import { CurvedReel } from "@/components/curved-reel";
import { SqueezeProgress } from "@/components/squeeze-progress";
import { BoltingSliders } from "@/components/bolting-sliders";
import { CrumpleToTrash } from "@/components/crumple-to-trash";
import { TapeShelf } from "@/components/tape-shelf";
import { PacketRouter, type RouterStrategy } from "@/components/packet-router";
import { StampSwirl } from "@/components/stamp-swirl";
import { BubbleCluster } from "@/components/bubble-cluster";
import { StickerToss } from "@/components/sticker-toss";
import { ContextMeter } from "@/components/context-meter";
import { MoodWheel } from "@/components/mood-wheel";
import { SwipeStack } from "@/components/swipe-stack";
import { FlightTracker } from "@/components/flight-tracker";
import { MatrixLoaders } from "@/components/matrix-loaders";
import { LanyardBadge } from "@/components/lanyard-badge";
import { GlassLens } from "@/components/glass-lens";
import { AsciiWake } from "@/components/ascii-wake";
import { LiquidDial } from "@/components/liquid-dial";
import { VoiceOrb } from "@/components/voice-orb";
import { SaggingField } from "@/components/sagging-field";
import { TearOffTicket } from "@/components/tear-off-ticket";
import { ThrowWheel } from "@/components/throw-wheel";
import { PixelSelect } from "@/components/pixel-select";
import { ScrubInputs } from "@/components/scrub-inputs";
import { LitKeyboard } from "@/components/lit-keyboard";
import { RippleField } from "@/components/ripple-field";
import { DotGlobe } from "@/components/dot-globe";
import { ComponentLayers } from "@/components/component-layers";
import { StandingCalendar } from "@/components/standing-calendar";
import { MoneyGoo } from "@/components/money-goo";
import { WeatherPuck } from "@/components/weather-puck";
import { MetalOrbs } from "@/components/metal-orbs";
import { BendingRail } from "@/components/bending-rail";
import { LayoutSwitch } from "@/components/layout-switch";
import { FanDeck } from "@/components/fan-deck";
import { ReceiptUnfold } from "@/components/receipt-unfold";
import { PageCurl } from "@/components/page-curl";
import { SignAndSeal } from "@/components/sign-and-seal";
import { StreakCounter } from "@/components/streak-counter";
import { CapsuleToggles } from "@/components/capsule-toggles";

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
  /** Designed for light surfaces only: the stage stays light in dark mode and the Fill switch is hidden. */
  lightOnly?: boolean;
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

const DEMO_TOASTS = [
  { id: "t1", type: "success" as const, title: "Invoice sent", description: "acme@studio.co will get it shortly." },
  { id: "t2", type: "info" as const, title: "Draft saved", description: "Last edit 2 seconds ago.", action: { label: "Undo" } },
  { id: "t3", type: "error" as const, title: "Payment declined", description: "Try another card.", action: { label: "Retry" } },
];

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

  "tick-slider": {
    componentName: "TickSlider",
    importPath: "@/components/tick-slider",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "ticks", label: "Ticks", min: 12, max: 60, step: 1, defaultValue: 36 },
      { kind: "range", prop: "step", label: "Step", min: 1, max: 25, step: 1, defaultValue: 1 },
      { kind: "range", prop: "magnify", label: "Wave", min: 0, max: 1.2, step: 0.05, unit: "×", defaultValue: 0.55 },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "color", prop: "accent", label: "Accent", options: ["#17181a", "#0071e3", "#0ea5e9", "#16a34a", "#f97316"], defaultValue: "#17181a" },
      { kind: "toggle", prop: "showValue", label: "Number", defaultValue: true },
    ],
    render: (v, fill) => (
      <TickSlider
        ticks={v.ticks as number}
        step={v.step as number}
        magnify={v.magnify as number}
        size={v.size as "md"}
        accent={fill === "dark" && v.accent === "#17181a" ? "#ffffff" : (v.accent as string)}
        showValue={v.showValue as boolean}
      />
    ),
  },
  "time-scrubber": {
    componentName: "TimeScrubber",
    importPath: "@/components/time-scrubber",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "interval", label: "Snap", min: 5, max: 30, step: 5, unit: "min", defaultValue: 15 },
      { kind: "select", prop: "format", label: "Format", options: ["12h", "24h"], defaultValue: "12h" },
      { kind: "range", prop: "density", label: "Spread", min: 0.8, max: 3, step: 0.1, unit: "px", defaultValue: 1.6 },
      { kind: "color", prop: "accent", label: "Needle", options: ["#ef4444", "#17181a", "#0071e3", "#0ea5e9", "#f97316"], defaultValue: "#ef4444" },
    ],
    render: (v) => (
      <TimeScrubber
        interval={v.interval as number}
        format={v.format as "12h"}
        density={v.density as number}
        accent={v.accent as string}
      />
    ),
  },
  "slide-to-confirm": {
    componentName: "SlideToConfirm",
    importPath: "@/components/slide-to-confirm",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "range", prop: "threshold", label: "Threshold", min: 0.5, max: 1, step: 0.05, defaultValue: 0.9 },
      { kind: "range", prop: "resetAfter", label: "Reset after", min: 0, max: 5000, step: 100, unit: "ms", defaultValue: 2200 },
      { kind: "color", prop: "successColor", label: "Success", options: ["#16a34a", "#17181a", "#0071e3", "#0ea5e9", "#f97316"], defaultValue: "#16a34a" },
      { kind: "select", prop: "label", label: "Label", options: ["Slide to confirm", "Slide to pay", "Slide to unlock"], defaultValue: "Slide to confirm" },
    ],
    render: (v) => (
      <SlideToConfirm
        size={v.size as "md"}
        threshold={v.threshold as number}
        resetAfter={v.resetAfter as number}
        successColor={v.successColor as string}
        label={v.label as string}
        onConfirm={() => new Promise<void>((resolve) => setTimeout(resolve, 900))}
      />
    ),
  },
  "emoji-reactions": {
    componentName: "EmojiReactions",
    importPath: "@/components/emoji-reactions",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#5b8def", "#0071e3", "#ff3b5c", "#10b981", "#f59e0b"], defaultValue: "#5b8def" },
      { kind: "select", prop: "message", label: "Message", options: ["Shipped the new onboarding flow", "Lunch at 1?", "v2 is live"], defaultValue: "Shipped the new onboarding flow" },
    ],
    render: (v) => <EmojiReactions accent={v.accent as string} message={v.message as string} />,
  },
  "like-burst": {
    componentName: "LikeBurst",
    importPath: "@/components/like-burst",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Color", options: ["#ff3b5c", "#ff7a1a", "#0071e3", "#10b981", "#17181a"], defaultValue: "#ff3b5c" },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "range", prop: "burst", label: "Burst", min: 0, max: 20, step: 1, defaultValue: 10 },
      { kind: "range", prop: "defaultCount", label: "Count", min: 0, max: 99999, step: 1, defaultValue: 1299 },
      { kind: "toggle", prop: "defaultLiked", label: "Start liked", defaultValue: false },
    ],
    render: (v) => (
      <LikeBurst
        key={`${v.defaultCount}-${v.defaultLiked}`}
        color={v.color as string}
        size={v.size as "md"}
        burst={v.burst as number}
        defaultCount={v.defaultCount as number}
        defaultLiked={v.defaultLiked as boolean}
      />
    ),
  },
  "toast-stack": {
    componentName: "ToastStack",
    importPath: "@/components/toast-stack",
    snippetBaseProps: ["toasts={toasts}", "onDismiss={dismiss}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "expand", label: "Expand", options: ["hover", "always"], defaultValue: "hover" },
      { kind: "select", prop: "position", label: "Grow from", options: ["bottom", "top"], defaultValue: "bottom" },
      { kind: "range", prop: "max", label: "Visible", min: 1, max: 3, step: 1, defaultValue: 3 },
      { kind: "range", prop: "width", label: "Width", min: 280, max: 420, step: 4, unit: "px", defaultValue: 340 },
    ],
    render: (v) => (
      <ToastStack
        toasts={DEMO_TOASTS}
        onDismiss={() => {}}
        expand={v.expand as "hover"}
        position={v.position as "bottom"}
        max={v.max as number}
        width={v.width as number}
      />
    ),
  },
  "upload-dropzone": {
    componentName: "UploadDropzone",
    importPath: "@/components/upload-dropzone",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "multiple", label: "Multiple", defaultValue: true },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#2563eb", "#16a34a", "#ea580c", "#db2777"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Drag a file here", "Drop your files", "Add attachments"], defaultValue: "Drag a file here" },
      { kind: "select", prop: "hint", label: "Hint", options: ["Up to 5 MB", "PNG, JPG or MP4", "Max 10 files"], defaultValue: "Up to 5 MB" },
      { kind: "toggle", prop: "disabled", label: "Disabled", defaultValue: false },
    ],
    render: (v) => (
      <UploadDropzone
        multiple={v.multiple as boolean}
        accent={v.accent as string}
        title={v.title as string}
        hint={v.hint as string}
        disabled={v.disabled as boolean}
        initialFiles={[{ name: "mood.png", size: 1240000, type: "image/png", progress: 1 }]}
      />
    ),
  },
  "hold-to-record": {
    componentName: "HoldToRecord",
    importPath: "@/components/hold-to-record",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#ef4444", "#0071e3", "#2563eb", "#16a34a", "#17181a"], defaultValue: "#ef4444" },
      { kind: "range", prop: "cancelDistance", label: "Cancel distance", min: 40, max: 160, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "maxDuration", label: "Max length", min: 5000, max: 60000, step: 1000, unit: "ms", defaultValue: 60000 },
      { kind: "range", prop: "minDuration", label: "Min hold", min: 0, max: 1500, step: 50, unit: "ms", defaultValue: 400 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to record", "Hold to talk", "Record a note"], defaultValue: "Hold to record" },
    ],
    render: (v) => (
      <HoldToRecord
        accent={v.accent as string}
        cancelDistance={v.cancelDistance as number}
        maxDuration={v.maxDuration as number}
        minDuration={v.minDuration as number}
        label={v.label as string}
      />
    ),
  },
  "cursor-buddy": {
    componentName: "CursorBuddy",
    importPath: "@/components/cursor-buddy",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "shape", label: "Shape", options: ["squircle", "pill", "circle"], defaultValue: "squircle" },
      { kind: "select", prop: "fill", label: "Fill", options: ["light", "dark"], defaultValue: "light" },
      { kind: "select", prop: "eyes", label: "Eyes", options: ["dots", "slits", "squares"], defaultValue: "dots" },
      { kind: "range", prop: "follow", label: "Follow", min: 0, max: 100, step: 1, defaultValue: 60 },
      { kind: "range", prop: "size", label: "Size", min: 60, max: 200, step: 2, unit: "px", defaultValue: 120 },
      { kind: "range", prop: "sleepAfter", label: "Sleep after", min: 0, max: 20000, step: 500, unit: "ms", defaultValue: 9000 },
    ],
    render: (v) => (
      <CursorBuddy
        shape={v.shape as "squircle"}
        fill={v.fill as "light"}
        eyes={v.eyes as "dots"}
        follow={v.follow as number}
        size={v.size as number}
        sleepAfter={v.sleepAfter as number}
      />
    ),
  },
  "dot-sphere": {
    componentName: "DotSphere",
    importPath: "@/components/dot-sphere",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "dots", label: "Dots", min: 80, max: 1200, step: 20, defaultValue: 420 },
      { kind: "range", prop: "radius", label: "Radius", min: 60, max: 200, step: 2, unit: "px", defaultValue: 130 },
      { kind: "range", prop: "repel", label: "Repel", min: 0, max: 100, step: 1, defaultValue: 55 },
      { kind: "range", prop: "speed", label: "Spin", min: 0, max: 100, step: 1, defaultValue: 30 },
      { kind: "range", prop: "dotSize", label: "Dot size", min: 1, max: 8, step: 0.2, unit: "px", defaultValue: 3.4 },
      { kind: "toggle", prop: "interactive", label: "Interactive", defaultValue: true },
    ],
    render: (v) => (
      <DotSphere
        dots={v.dots as number}
        radius={v.radius as number}
        repel={v.repel as number}
        speed={v.speed as number}
        dotSize={v.dotSize as number}
        interactive={v.interactive as boolean}
      />
    ),
  },
  "dynamic-island": {
    componentName: "DynamicIsland",
    importPath: "@/components/dynamic-island",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultState", label: "Activity", options: ["idle", "timer", "music", "call"], defaultValue: "timer" },
      { kind: "range", prop: "timerSeconds", label: "Timer", min: 10, max: 1800, step: 10, unit: "s", defaultValue: 300 },
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff9f0a", "#30d158", "#0a84ff", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "range", prop: "cycle", label: "Auto cycle", min: 0, max: 8000, step: 500, unit: "ms", defaultValue: 0 },
    ],
    render: (v) => (
      <DynamicIsland
        key={v.defaultState as string}
        defaultState={v.defaultState as "timer"}
        timerSeconds={v.timerSeconds as number}
        accent={v.accent as string}
        cycle={v.cycle as number}
      />
    ),
  },
  "otp-input": {
    componentName: "OtpInput",
    importPath: "@/components/otp-input",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "length", label: "Digits", min: 4, max: 8, step: 2, defaultValue: 6 },
    ],
    render: (v) => (
      <OtpInput key={v.length as number} accent={v.accent as string} length={v.length as number} verify={(c) => c.startsWith("4829")} />
    ),
  },
  "radio-cards": {
    componentName: "RadioCards",
    importPath: "@/components/radio-cards",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" }],
    render: (v) => <RadioCards accent={v.accent as string} />,
  },
  "hold-to-confirm": {
    componentName: "HoldToConfirm",
    importPath: "@/components/hold-to-confirm",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Color", options: ["#ff3b30", "#1d1d1f", "#0071e3", "#ff375f", "#30b158"], defaultValue: "#ff3b30" },
      { kind: "range", prop: "holdMs", label: "Hold for", min: 600, max: 4000, step: 100, unit: "ms", defaultValue: 1500 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to Delete", "Hold to Archive", "Hold to Leave"], defaultValue: "Hold to Delete" },
    ],
    render: (v) => <HoldToConfirm color={v.color as string} holdMs={v.holdMs as number} label={v.label as string} />,
  },
  "before-after": {
    componentName: "BeforeAfter",
    importPath: "@/components/before-after",
    snippetBaseProps: ['before={<img src="/before.jpg" alt="" className="h-full w-full object-cover" />}', 'after={<img src="/after.jpg" alt="" className="h-full w-full object-cover" />}'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "beforeLabel", label: "Before label", options: ["Before", "Original", "Raw"], defaultValue: "Before" },
      { kind: "select", prop: "afterLabel", label: "After label", options: ["After", "Edited", "Graded"], defaultValue: "After" },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <BeforeAfter
          beforeLabel={v.beforeLabel as string}
          afterLabel={v.afterLabel as string}
          before={<div className="h-full w-full bg-[linear-gradient(180deg,#9a9a9a,#d6d6d6_60%,#5c5c5c)]" />}
          after={<div className="h-full w-full bg-[linear-gradient(180deg,#7fb3e8,#f6d9b8_60%,#3e5f7e)]" />}
        />
      </div>
    ),
  },
  "price-odometer": {
    componentName: "PriceOdometer",
    importPath: "@/components/price-odometer",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "monthlyRate", label: "Monthly / seat", min: 5, max: 60, step: 1, defaultValue: 15 },
      { kind: "range", prop: "yearlyRate", label: "Yearly / seat", min: 4, max: 50, step: 1, defaultValue: 12 },
      { kind: "range", prop: "maxSeats", label: "Max seats", min: 10, max: 500, step: 10, defaultValue: 100 },
    ],
    render: (v) => (
      <PriceOdometer
        accent={v.accent as string}
        monthlyRate={v.monthlyRate as number}
        yearlyRate={v.yearlyRate as number}
        maxSeats={v.maxSeats as number}
      />
    ),
  },
  "password-strength": {
    componentName: "PasswordStrength",
    importPath: "@/components/password-strength",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" }],
    render: (v) => <PasswordStrength accent={v.accent as string} />,
  },
  "tilt-pass": {
    componentName: "TiltPass",
    importPath: "@/components/tilt-pass",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Founders Pass", "Backstage", "Season Ticket"], defaultValue: "Founders Pass" },
      { kind: "select", prop: "name", label: "Holder", options: ["Alex Rivera", "Sam Okafor", "Mina Park"], defaultValue: "Alex Rivera" },
      { kind: "toggle", prop: "autoplay", label: "Float on its own", defaultValue: false },
    ],
    render: (v) => <TiltPass title={v.title as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  },
  "animated-tabs": {
    componentName: "AnimatedTabs",
    importPath: "@/components/animated-tabs",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Switch", options: ["#34c759", "#0071e3", "#ff375f", "#ff9f0a", "#1d1d1f"], defaultValue: "#34c759" }],
    render: (v) => <AnimatedTabs accent={v.accent as string} />,
  },
  "shared-element-cards": {
    componentName: "SharedElementCards",
    importPath: "@/components/shared-element-cards",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false }],
    render: (v) => <SharedElementCards key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "rotating-headline": {
    componentName: "RotatingHeadline",
    importPath: "@/components/rotating-headline",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "lead", label: "Lead", options: ["Built to", "Made to", "Designed to"], defaultValue: "Built to" },
      { kind: "range", prop: "interval", label: "Swap every", min: 800, max: 4000, step: 100, unit: "ms", defaultValue: 2000 },
    ],
    render: (v) => <RotatingHeadline accent={v.accent as string} lead={v.lead as string} interval={v.interval as number} />,
  },
  "stretch-nav": {
    componentName: "StretchNav",
    importPath: "@/components/stretch-nav",
    defaultFill: "light",
    controls: [{ kind: "range", prop: "defaultIndex", label: "Start at", min: 0, max: 4, step: 1, defaultValue: 0 }],
    render: (v) => <StretchNav key={v.defaultIndex as number} defaultIndex={v.defaultIndex as number} />,
  },
  "feedback-pill": {
    componentName: "FeedbackPill",
    importPath: "@/components/feedback-pill",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Feedback", "Report a bug", "Suggest"], defaultValue: "Feedback" },
    ],
    render: (v) => <FeedbackPill accent={v.accent as string} label={v.label as string} />,
  },
  "stagger-menu": {
    componentName: "StaggerMenu",
    importPath: "@/components/stagger-menu",
    defaultFill: "light",
    controls: [{ kind: "select", prop: "label", label: "Label", options: ["Share", "Export", "More"], defaultValue: "Share" }],
    render: (v) => (
      <div className="flex justify-center pt-6">
        <StaggerMenu label={v.label as string} />
      </div>
    ),
  },
  "ruler-picker": {
    componentName: "RulerPicker",
    importPath: "@/components/ruler-picker",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Needle", options: ["#ff9f0a", "#0071e3", "#ff375f", "#30b158", "#1d1d1f"], defaultValue: "#ff9f0a" },
      { kind: "range", prop: "max", label: "Max", min: 30, max: 180, step: 15, defaultValue: 90 },
      { kind: "range", prop: "defaultValue", label: "Start at", min: 0, max: 60, step: 5, defaultValue: 25 },
    ],
    render: (v) => (
      <RulerPicker
        key={`${v.max}-${v.defaultValue}`}
        accent={v.accent as string}
        max={v.max as number}
        defaultValue={v.defaultValue as number}
      />
    ),
  },
  "elastic-stepper": {
    componentName: "ElasticStepper",
    importPath: "@/components/elastic-stepper",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "max", label: "Max", min: 3, max: 12, step: 1, defaultValue: 8 },
      { kind: "select", prop: "label", label: "Label", options: ["Guests", "Seats", "Tickets"], defaultValue: "Guests" },
    ],
    render: (v) => <ElasticStepper key={v.max as number} accent={v.accent as string} max={v.max as number} label={v.label as string} />,
  },
  "todo-list": {
    componentName: "TodoList",
    importPath: "@/components/todo-list",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" }],
    render: (v) => <TodoList accent={v.accent as string} />,
  },
  "progress-button": {
    componentName: "ProgressButton",
    importPath: "@/components/progress-button",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Download", "Export", "Install"], defaultValue: "Download" },
    ],
    render: (v) => <ProgressButton accent={v.accent as string} label={v.label as string} />,
  },
  "copy-button": {
    componentName: "CopyChip",
    importPath: "@/components/copy-button",
    snippetBaseProps: ['value="inv_3fK9xQ2Lq7"'],
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" }],
    render: (v) => <CopyChip value="inv_3fK9xQ2Lq7" display="inv_3fK9…2Lq7" accent={v.accent as string} />,
  },
  "animated-icons": {
    componentName: "AnimatedIcons",
    importPath: "@/components/animated-icons",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false }],
    render: (v) => <AnimatedIcons key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "folder-peek": {
    componentName: "FolderPeek",
    importPath: "@/components/folder-peek",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Folder", options: ["#0071e3", "#34c759", "#ff9f0a", "#ff375f", "#8e8e93"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Brand assets", "Launch kit", "Invoices"], defaultValue: "Brand assets" },
    ],
    render: (v) => <FolderPeek color={v.color as string} title={v.title as string} />,
  },
  "magnify-dock": {
    componentName: "MagnifyDock",
    importPath: "@/components/magnify-dock",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false }],
    render: (v) => <MagnifyDock key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "upload-chips": {
    componentName: "UploadChips",
    importPath: "@/components/upload-chips",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" }],
    render: (v) => <UploadChips accent={v.accent as string} />,
  },
  "notification-stack": {
    componentName: "NotificationStack",
    importPath: "@/components/notification-stack",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Push samples", defaultValue: false }],
    render: (v) => <NotificationStack key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "island-morph": {
    componentName: "IslandMorph",
    importPath: "@/components/island-morph",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false }],
    render: (v) => <IslandMorph key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "lanyard-badge": {
    componentName: "LanyardBadge",
    importPath: "@/components/lanyard-badge",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "strap", label: "Strap", options: ["#0071e3", "#ff375f", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "select", prop: "tag", label: "Tag", options: ["Speaker", "Attendee", "Staff", "Press"], defaultValue: "Speaker" },
      { kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false },
    ],
    render: (v) => <LanyardBadge key={String(v.autoplay)} strap={v.strap as string} tag={v.tag as string} autoplay={v.autoplay as boolean} />,
  },
  "glass-lens": {
    componentName: "GlassLens",
    importPath: "@/components/glass-lens",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "zoom", label: "Zoom", min: 1.1, max: 2.2, step: 0.05, unit: "×", defaultValue: 1.45 },
      { kind: "range", prop: "size", label: "Lens", min: 100, max: 200, step: 2, unit: "px", defaultValue: 150 },
      { kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: false },
    ],
    render: (v) => <GlassLens key={String(v.autoplay)} zoom={v.zoom as number} size={v.size as number} autoplay={v.autoplay as boolean} />,
  },
  "ascii-wake": {
    componentName: "AsciiWake",
    importPath: "@/components/ascii-wake",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff375f", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "height", label: "Height", min: 200, max: 400, step: 10, unit: "px", defaultValue: 300 },
      { kind: "toggle", prop: "autoplay", label: "Draw by itself", defaultValue: false },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <AsciiWake accent={v.accent as string} height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "liquid-dial": {
    componentName: "LiquidDial",
    importPath: "@/components/liquid-dial",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "color", prop: "color", label: "Blob", options: ["#1d1d1f", "#3a3a3c", "#5e5ce6", "#0071e3"], defaultValue: "#1d1d1f" },
      { kind: "toggle", prop: "autoplay", label: "Browse by itself", defaultValue: false },
    ],
    // Defaults are passed as undefined so the component's own light/dark colours apply.
    render: (v) => (
      <LiquidDial
        key={String(v.autoplay)}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        color={v.color === "#1d1d1f" ? undefined : (v.color as string)}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "voice-orb": {
    componentName: "VoiceOrb",
    importPath: "@/components/voice-orb",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#bf5af2", "#ff375f", "#30d158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false },
    ],
    render: (v) => <VoiceOrb key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "sagging-field": {
    componentName: "SaggingField",
    importPath: "@/components/sagging-field",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "maxChars", label: "Full sag at", min: 12, max: 60, step: 1, unit: " chars", defaultValue: 34 },
    ],
    render: (v) => <SaggingField accent={v.accent as string} maxChars={v.maxChars as number} />,
  },
  "tear-off-ticket": {
    componentName: "TearOffTicket",
    importPath: "@/components/tear-off-ticket",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Event", options: ["Light & Matter", "Night Market", "Modern Forms"], defaultValue: "Light & Matter" },
      { kind: "toggle", prop: "autoplay", label: "Tear by itself", defaultValue: false },
    ],
    render: (v) => <TearOffTicket key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "throw-wheel": {
    componentName: "ThrowWheel",
    importPath: "@/components/throw-wheel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Throw by itself", defaultValue: false }],
    render: (v) => <ThrowWheel key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "pixel-select": {
    componentName: "PixelSelect",
    importPath: "@/components/pixel-select",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false }],
    render: (v) => <PixelSelect key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "scrub-inputs": {
    componentName: "ScrubInputs",
    importPath: "@/components/scrub-inputs",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Scrub by itself", defaultValue: false },
    ],
    render: (v) => <ScrubInputs key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "lit-keyboard": {
    componentName: "LitKeyboard",
    importPath: "@/components/lit-keyboard",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "glow", label: "Glow", options: ["#ff9f0a", "#0a84ff", "#30d158", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false },
    ],
    render: (v) => <LitKeyboard key={String(v.autoplay)} glow={v.glow as string} autoplay={v.autoplay as boolean} />,
  },
  "ripple-field": {
    componentName: "RippleField",
    importPath: "@/components/ripple-field",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "gap", label: "Dot gap", min: 12, max: 28, step: 2, unit: "px", defaultValue: 18 },
      { kind: "range", prop: "height", label: "Height", min: 200, max: 400, step: 10, unit: "px", defaultValue: 300 },
      { kind: "toggle", prop: "autoplay", label: "Drop rings by itself", defaultValue: false },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <RippleField gap={v.gap as number} height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "dot-globe": {
    componentName: "DotGlobe",
    importPath: "@/components/dot-globe",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#ff375f", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Size", min: 260, max: 420, step: 10, unit: "px", defaultValue: 340 },
      { kind: "toggle", prop: "autoplay", label: "Tour cities", defaultValue: false },
    ],
    render: (v) => <DotGlobe key={String(v.autoplay)} accent={v.accent as string} size={v.size as number} autoplay={v.autoplay as boolean} />,
  },
  "component-layers": {
    componentName: "ComponentLayers",
    importPath: "@/components/component-layers",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#bf5af2", "#30d158", "#ff375f", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Explode by itself", defaultValue: false },
    ],
    render: (v) => <ComponentLayers key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "standing-calendar": {
    componentName: "StandingCalendar",
    importPath: "@/components/standing-calendar",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "weeks", label: "Weeks", min: 12, max: 36, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Stand up by itself", defaultValue: false },
    ],
    render: (v) => <StandingCalendar key={String(v.autoplay)} weeks={v.weeks as number} autoplay={v.autoplay as boolean} />,
  },
  "money-goo": {
    componentName: "MoneyGoo",
    importPath: "@/components/money-goo",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Goo", options: ["#0071e3", "#34c759", "#ff375f", "#af52de", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "amount", label: "Amount", min: 5, max: 100, step: 5, defaultValue: 40 },
      { kind: "toggle", prop: "autoplay", label: "Send by itself", defaultValue: false },
    ],
    render: (v) => <MoneyGoo key={String(v.autoplay)} accent={v.accent as string} amount={v.amount as number} autoplay={v.autoplay as boolean} />,
  },
  "weather-puck": {
    componentName: "WeatherPuck",
    importPath: "@/components/weather-puck",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false }],
    render: (v) => <WeatherPuck key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "metal-orbs": {
    componentName: "MetalOrbs",
    importPath: "@/components/metal-orbs",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "height", label: "Height", min: 200, max: 340, step: 10, unit: "px", defaultValue: 280 },
      { kind: "toggle", prop: "autoplay", label: "Cycle modes", defaultValue: false },
    ],
    render: (v) => <MetalOrbs key={String(v.autoplay)} height={v.height as number} autoplay={v.autoplay as boolean} />,
  },
  "bending-rail": {
    componentName: "BendingRail",
    importPath: "@/components/bending-rail",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#34c759", "#ff9f0a", "#ff375f", "#af52de"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Volume", "Brightness", "Opacity"], defaultValue: "Volume" },
      { kind: "toggle", prop: "autoplay", label: "Tug by itself", defaultValue: false },
    ],
    render: (v) => <BendingRail key={String(v.autoplay)} accent={v.accent as string} label={v.label as string} autoplay={v.autoplay as boolean} />,
  },
  "layout-switch": {
    componentName: "LayoutSwitch",
    importPath: "@/components/layout-switch",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle layouts", defaultValue: false }],
    render: (v) => <LayoutSwitch key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "fan-deck": {
    componentName: "FanDeck",
    importPath: "@/components/fan-deck",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Fan by itself", defaultValue: false }],
    render: (v) => <FanDeck key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "receipt-unfold": {
    componentName: "ReceiptUnfold",
    importPath: "@/components/receipt-unfold",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "total", label: "Total", options: ["$49.68", "$120.96", "$8.99"], defaultValue: "$49.68" },
      { kind: "toggle", prop: "autoplay", label: "Unfold by itself", defaultValue: false },
    ],
    render: (v) => <ReceiptUnfold key={String(v.autoplay)} total={v.total as string} autoplay={v.autoplay as boolean} />,
  },
  "page-curl": {
    componentName: "PageCurl",
    importPath: "@/components/page-curl",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "width", label: "Width", min: 320, max: 440, step: 10, unit: "px", defaultValue: 400 },
      { kind: "toggle", prop: "autoplay", label: "Peek by itself", defaultValue: false },
    ],
    render: (v) => <PageCurl key={`${v.width}-${v.autoplay}`} width={v.width as number} autoplay={v.autoplay as boolean} />,
  },
  "sign-and-seal": {
    componentName: "SignAndSeal",
    importPath: "@/components/sign-and-seal",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "ink", label: "Ink", options: ["#1d1d1f", "#0071e3", "#5e5ce6", "#ff375f", "#30b158"], defaultValue: "#1d1d1f" },
      { kind: "select", prop: "name", label: "Name", options: ["Alex Rivera", "Jordan Lee", "Sam Okafor"], defaultValue: "Alex Rivera" },
      { kind: "toggle", prop: "autoplay", label: "Sign by itself", defaultValue: false },
    ],
    render: (v) => <SignAndSeal key={String(v.autoplay)} ink={v.ink as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  },
  "streak-counter": {
    componentName: "StreakCounter",
    importPath: "@/components/streak-counter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "start", label: "Start at", min: 0, max: 60, step: 1, defaultValue: 11 },
      { kind: "toggle", prop: "autoplay", label: "Log by itself", defaultValue: false },
    ],
    render: (v) => <StreakCounter key={`${v.start}-${v.autoplay}`} start={v.start as number} autoplay={v.autoplay as boolean} />,
  },
  "capsule-toggles": {
    componentName: "CapsuleToggles",
    importPath: "@/components/capsule-toggles",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Controls", "Quick settings", "Privacy"], defaultValue: "Controls" },
      { kind: "toggle", prop: "autoplay", label: "Flip by itself", defaultValue: false },
    ],
    render: (v) => <CapsuleToggles key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "glass-bubbles": {
    componentName: "GlassBubbles",
    importPath: "@/components/glass-bubbles",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false }],
    render: (v) => <GlassBubbles key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "box-spill": {
    componentName: "BoxSpill",
    importPath: "@/components/box-spill",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Pieces", min: 10, max: 60, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false },
    ],
    render: (v) => <BoxSpill key={String(v.autoplay)} count={v.count as number} autoplay={v.autoplay as boolean} />,
  },
  "curved-reel": {
    componentName: "CurvedReel",
    importPath: "@/components/curved-reel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: true }],
    render: (v) => <CurvedReel autoplay={v.autoplay as boolean} />,
  },
  "squeeze-progress": {
    componentName: "SqueezeProgress",
    importPath: "@/components/squeeze-progress",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Running", options: ["#0071e3", "#1d1d1f", "#5e5ce6", "#0b8f6a", "#ff375f"], defaultValue: "#0071e3" },
      { kind: "color", prop: "paused", label: "Paused", options: ["#c2410c", "#ff375f", "#ff9f0a", "#8e8e93", "#bf5af2"], defaultValue: "#c2410c" },
      { kind: "toggle", prop: "autoplay", label: "Pause by itself", defaultValue: false },
    ],
    render: (v) => <SqueezeProgress key={String(v.autoplay)} accent={v.accent as string} paused={v.paused as string} autoplay={v.autoplay as boolean} />,
  },
  "bolting-sliders": {
    componentName: "BoltingSliders",
    importPath: "@/components/bolting-sliders",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff375f", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Jump by itself", defaultValue: false },
    ],
    render: (v) => <BoltingSliders key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "crumple-to-trash": {
    componentName: "CrumpleToTrash",
    importPath: "@/components/crumple-to-trash",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Page title", options: ["Draft · Q4 notes", "Launch checklist", "Old invoice"], defaultValue: "Draft · Q4 notes" },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false },
    ],
    render: (v) => <CrumpleToTrash key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "tape-shelf": {
    componentName: "TapeShelf",
    importPath: "@/components/tape-shelf",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false }],
    render: (v) => <TapeShelf key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "packet-router": {
    componentName: "PacketRouter",
    importPath: "@/components/packet-router",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultStrategy", label: "Start on", options: ["Cost", "Balanced", "Quality"], defaultValue: "Balanced" },
      { kind: "toggle", prop: "autoplay", label: "Cycle strategies", defaultValue: false },
    ],
    render: (v) => (
      <PacketRouter
        key={`${v.defaultStrategy}-${v.autoplay}`}
        defaultStrategy={v.defaultStrategy as RouterStrategy}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "stamp-swirl": {
    componentName: "StampSwirl",
    importPath: "@/components/stamp-swirl",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Lift by itself", defaultValue: false }],
    render: (v) => <StampSwirl key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "bubble-cluster": {
    componentName: "BubbleCluster",
    importPath: "@/components/bubble-cluster",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle groups", defaultValue: false }],
    render: (v) => <BubbleCluster key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "sticker-toss": {
    componentName: "StickerToss",
    importPath: "@/components/sticker-toss",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Centre", options: ["#c8f560", "#ff375f", "#0a84ff", "#ff9f0a", "#bf5af2"], defaultValue: "#c8f560" },
      { kind: "select", prop: "text", label: "Ring text", options: ["NEXUS UI · MADE TO MOVE · ", "STUDIO · EST. 2026 · ", "THROW ME · CATCH ME · "], defaultValue: "NEXUS UI · MADE TO MOVE · " },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false },
    ],
    render: (v) => <StickerToss key={String(v.autoplay)} accent={v.accent as string} text={v.text as string} autoplay={v.autoplay as boolean} />,
  },
  "context-meter": {
    componentName: "ContextMeter",
    importPath: "@/components/context-meter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "limit", label: "Window", min: 120, max: 400, step: 20, unit: "K", defaultValue: 200 },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false },
    ],
    render: (v) => <ContextMeter key={`${v.limit}-${v.autoplay}`} limit={v.limit as number} autoplay={v.autoplay as boolean} />,
  },
  "mood-wheel": {
    componentName: "MoodWheel",
    importPath: "@/components/mood-wheel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Spin by itself", defaultValue: false }],
    render: (v) => <MoodWheel key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "swipe-stack": {
    componentName: "SwipeStack",
    importPath: "@/components/swipe-stack",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Swipe by itself", defaultValue: false }],
    render: (v) => <SwipeStack key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "flight-tracker": {
    componentName: "FlightTracker",
    importPath: "@/components/flight-tracker",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "from", label: "From", options: ["NYC", "SFO", "DEL"], defaultValue: "NYC" },
      { kind: "select", prop: "to", label: "To", options: ["LON", "NRT", "DXB"], defaultValue: "LON" },
      { kind: "toggle", prop: "autoplay", label: "Fly", defaultValue: true },
    ],
    render: (v) => <FlightTracker from={v.from as string} to={v.to as string} autoplay={v.autoplay as boolean} />,
  },
  "matrix-loaders": {
    componentName: "MatrixLoaders",
    importPath: "@/components/matrix-loaders",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "size", label: "Size", min: 40, max: 80, step: 4, unit: "px", defaultValue: 64 },
      { kind: "toggle", prop: "showLabels", label: "Labels", defaultValue: true },
    ],
    render: (v) => <MatrixLoaders size={v.size as number} showLabels={v.showLabels as boolean} />,
  },
};

export function getPlayground(slug: string): Playground | undefined {
  return playgrounds[slug];
}
