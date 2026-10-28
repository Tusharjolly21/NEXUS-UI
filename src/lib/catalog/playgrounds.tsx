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
import { VinylPlayer } from "@/components/vinyl-player";
import { FerrofluidRecord } from "@/components/ferrofluid-record";
import { SandTimer } from "@/components/sand-timer";
import { ZipperReveal } from "@/components/zipper-reveal";
import { SlingshotSend } from "@/components/slingshot-send";
import { DominoSelect } from "@/components/domino-select";
import { LenticularPass } from "@/components/lenticular-pass";
import { OrigamiPricing } from "@/components/origami-pricing";
import { ClothBanner } from "@/components/cloth-banner";
import { TrafficBars } from "@/components/traffic-bars";
import { StockLine } from "@/components/stock-line";
import { PulseMonitor } from "@/components/pulse-monitor";
import { SpendDonut } from "@/components/spend-donut";
import { TodoTower } from "@/components/todo-tower";
import { PeekLogin } from "@/components/peek-login";
import { HeatField } from "@/components/heat-field";
import { ParticleMark } from "@/components/particle-mark";
import { GenerateImage } from "@/components/generate-image";
import { FalloffAccordion } from "@/components/falloff-accordion";
import { MagnetSelect } from "@/components/magnet-select";
import { AspectCrop } from "@/components/aspect-crop";
import { SloshSlider } from "@/components/slosh-slider";
import { GooReorder } from "@/components/goo-reorder";
import { HopLabels } from "@/components/hop-labels";
import { StepPlayer } from "@/components/step-player";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { RunawayButton } from "@/components/runaway-button";
import { WakeSlider } from "@/components/wake-slider";
import { SeekSearch } from "@/components/seek-search";
import { FoldNote } from "@/components/fold-note";
import { AssignPicker } from "@/components/assign-picker";
import { BendText } from "@/components/bend-text";
import { PressureText } from "@/components/pressure-text";
import { MorphCursor } from "@/components/morph-cursor";
import { InkThemeSwitch } from "@/components/ink-theme-switch";
import { LiquidGauge } from "@/components/liquid-gauge";
import { ThermoDial } from "@/components/thermo-dial";
import { PullCord } from "@/components/pull-cord";
import { ScratchReveal } from "@/components/scratch-reveal";
import { PolaroidDevelop } from "@/components/polaroid-develop";
import { WalletStack } from "@/components/wallet-stack";
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
import { AnimatedSelectHeadline } from "@/components/animated-select-headline";
import { AskNexusInput } from "@/components/ask-nexus-input";
import { BackgroundGradient } from "@/components/background-gradient";
import { BeamField } from "@/components/beam-sweep-field";
import { CardCarousel3D } from "@/components/card-carousel-3d";
import { CardStackRotator } from "@/components/card-stack-rotator";
import { ChatMessages } from "@/components/chat-messages";
import { CinematicCardDeck } from "@/components/cinematic-card-deck";
import { CircularCarousel } from "@/components/circular-carousel";
import { CodeBlock } from "@/components/code-block";
import { Compare } from "@/components/compare";
import { CursorTextReveal } from "@/components/cursor-text-reveal";
import { DepthTestimonials } from "@/components/depth-testimonials";
import { DraggableCardStack } from "@/components/draggable-card-stack";
import { ExpandableCards } from "@/components/expandable-cards";
import { FloatingDock } from "@/components/floating-dock";
import {
  Calendar as DockCalendar,
  Camera as DockCamera,
  Compass as DockCompass,
  FolderOpen as DockFolderOpen,
  Mail as DockMail,
  MessageCircle as DockMessageCircle,
  Music as DockMusic,
  Settings as DockSettings,
} from "lucide-react";
import { AiCommandBar } from "@/components/forge-ai-command-bar";
import { GlassLogin } from "@/components/glass-login-stack";
import { GlowingCardsLayout } from "@/components/glowing-effect-cards";
import { HoverHighlightText } from "@/components/hover-highlight-text";
import { ImagesBadge } from "@/components/images-badge";
import { InfiniteMovingCards, type InfiniteMovingCardItem } from "@/components/infinite-moving-cards";
import { InteractiveGlobeExplorer } from "@/components/interactive-globe-explorer";
import { LinkPreview } from "@/components/link-preview";
import { MacKeyboard } from "@/components/keyboard";
import { MilestoneTimeline } from "@/components/milestone-timeline";
import { MotionLayerScroller } from "@/components/motion-layer-scroller";
import { NebulaGlassCard } from "@/components/nebula-glass-card";
import { OrbitalLoader } from "@/components/orbital-loader";
import { PhoneInput } from "@/components/phone-input";
import { ProfileOrbit } from "@/components/profile-orbit";
import { KpiStrip } from "@/components/pulse-dashboard-kpis";
import { RealTimeCursors } from "@/components/real-time-cursors";
import { ScrollProgressBar } from "@/components/scroll-progress-bar";
import { ScrollRevealText } from "@/components/scroll-reveal-text";
import { SignupForm } from "@/components/signup-form";
import { SpectraFrame } from "@/components/spectra-frame";
import { SquigglyText } from "@/components/squiggly-text";
import { StatefulButton } from "@/components/stateful-button";
import { SvgNoise } from "@/components/svg-noise-shader";
import { Terminal, type TerminalCommand } from "@/components/terminal";
import { TextRevealCard } from "@/components/text-reveal-card";
import { ThreeDFolder } from "@/components/three-d-folder";
import { TracingSpotlightPanel } from "@/components/tracing-spotlight-panel";
import { VectorTiltScene } from "@/components/vector-tilt-scene";
import { WarpSpeedCard, WarpTextTrigger } from "@/components/warp-speed-card";
import { WheelSelector } from "@/components/wheel-selector";
import { EmptyProjects } from "@/components/empty-projects";
import { NoResults } from "@/components/no-results";
import { EmptyChart } from "@/components/empty-chart";
import { EmptyTeam } from "@/components/empty-team";
import { StreamingAnswer } from "@/components/streaming-answer";
import { DiffReview } from "@/components/diff-review";
import { AgentRun } from "@/components/agent-run";
import { GhostAutocomplete } from "@/components/ghost-autocomplete";
import { SkeletonMorph } from "@/components/skeleton-morph";
import { MorphingDialog } from "@/components/morphing-dialog";
import { TravellingTooltip } from "@/components/travelling-tooltip";
import { SoundMark } from "@/components/sound-mark";
import { RippleNowPlaying } from "@/components/ripple-now-playing";
import { ChladniUpload } from "@/components/chladni-upload";
import { CubesGrid } from "@/components/cubes-grid";
import { MeshNet } from "@/components/mesh-net";
import { ParticleReveal } from "@/components/particle-reveal";
import { MorphingText } from "@/components/morphing-text";
import { CodeSnippet } from "@/components/code-snippet";
import { WorkflowNetwork } from "@/components/workflow-network";
import { VenomButton } from "@/components/venom-button";
import { WebSlingButton } from "@/components/web-sling-button";
import { FrostInput } from "@/components/frost-input";
import { BlackHoleDelete } from "@/components/black-hole-delete";
import { PortalCard } from "@/components/portal-card";
import { TestimonialWall } from "@/components/testimonial-wall";
import { ShredderDelete } from "@/components/shredder-delete";
import { GlobalDeploy } from "@/components/global-deploy";
import { CardReaderVerify } from "@/components/card-reader-verify";
import { IntelligenceGlow } from "@/components/intelligence-glow";
import { CloudSync } from "@/components/cloud-sync";
import { SmartLight } from "@/components/smart-light";
import { RangeCalendar } from "@/components/range-calendar";
import { StorageClean } from "@/components/storage-clean";
import { RingGalleryDemo, type RingDemoValues } from "@/lib/catalog/ring-demo";
import { DartRating } from "@/components/dart-rating";
import { DominoProgress } from "@/components/domino-progress";
import { PumpkinReveal } from "@/components/pumpkin-reveal";
import { CatchUndo } from "@/components/catch-undo";
import { TankRecorder } from "@/components/tank-recorder";
import { RippleToast } from "@/components/ripple-toast";

// matter-js stays out of the shared playground bundle: these load lazily.
const TagPit = React.lazy(() => import("@/components/tag-pit").then((m) => ({ default: m.TagPit })));
const UsageStack = React.lazy(() => import("@/components/usage-stack").then((m) => ({ default: m.UsageStack })));
const MarbleProgress = React.lazy(() => import("@/components/marble-progress").then((m) => ({ default: m.MarbleProgress })));

/**
 * Live props playgrounds for component detail pages (Bencho-style "tweak and copy").
 *
 * Each control's `defaultValue` must match the component's own default so the generated
 * snippet only lists props the visitor actually changed.
 */
const DEMO_BADGE_TEAM = [
  { alt: "Ava Chen" },
  { alt: "Noah Park" },
  { alt: "Mira Shah" },
  { alt: "Leo Grant" },
  { alt: "Zoe Ito" },
  { alt: "Kai Moss" },
  { alt: "Sam Reyes" },
  { alt: "Iris Vale" },
];
const DEMO_MOVING_CARDS: InfiniteMovingCardItem[] = [
  { id: "a", title: "Launch week, sorted", description: "We rebuilt the landing page in two days and it still feels hand-made.", name: "Ariana Shaw", role: "Product lead, Orbitstack", rating: 5, tags: ["SaaS"] },
  { id: "b", title: "Smooth on every screen", description: "The loop never jumps, even on a 49-inch monitor in the office.", name: "Marcus Lee", role: "Frontend, Sprintops", rating: 5, tags: ["Motion"] },
  { id: "c", title: "People play with it", description: "Visitors grab the reviews and fling them. Time on page went up.", name: "Lena Okafor", role: "Design manager, Cloudframe", rating: 5, tags: ["Growth"] },
  { id: "d", title: "Readable by default", description: "It slows to a stop when you hover, so nobody chases a sentence.", name: "Noah Kimura", role: "Growth designer, Metricly", rating: 4, tags: ["UX"] },
  { id: "e", title: "One less dependency", description: "Replaced two carousel libraries and a custom marquee with this.", name: "Sofia Brandt", role: "Staff engineer, Kitehaus", rating: 5, tags: ["React"] },
];
const ShaderFlow = React.lazy(() => import("@/components/shader-flow").then((m) => ({ default: m.ShaderFlow })));
const DEMO_TERMINAL_SCRIPT: TerminalCommand[] = [
  { input: "npx shadcn@latest add @nexus-labs/terminal", runDelayMs: 800, output: ["fetching registry...", { text: "wrote components/terminal/terminal.tsx", tone: "success" }] },
  { input: "npm run dev", runDelayMs: 600, output: ["  ready in 412 ms", { text: "  Local: http://localhost:3000", tone: "info" }] },
  { input: 'git commit -m "ship the terminal"', runDelayMs: 400, output: [{ text: "[main 8f2c1d4] ship the terminal", tone: "success" }, "2 files changed, 318 insertions(+)"] },
];

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
  | { kind: "toggle"; prop: string; label: string; defaultValue: boolean; /** The value it starts at when it differs from the component default (autoplay starts on). */ startOn?: boolean }
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
  /** A fixed scene (own photo, shader or dark card) that ignores light/dark: the stage stays light and the Fill switch is hidden, so it never looks like the switch is broken. */
  lightOnly?: boolean;
  /** One line shown above the playground, for a component with something more to try than the controls (its own content, say). */
  blurb?: string;
  /** The component fills whatever box it is given (a full-bleed background): keep the stage at a fixed height instead of letting it grow to the component. */
  fillStage?: boolean;
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
      { kind: "range", prop: "size", label: "Size", min: 28, max: 64, step: 1, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "overlap", label: "Overlap", min: 0, max: 24, step: 1, unit: "px", defaultValue: 10 },
      { kind: "range", prop: "hoverScale", label: "Swell", min: 1, max: 1.6, step: 0.05, unit: "×", defaultValue: 1.3 },
      { kind: "range", prop: "max", label: "Max shown", min: 2, max: 6, step: 1, defaultValue: 6 },
      { kind: "select", prop: "hoverAnimation", label: "Hover", options: ["lift", "scale", "rotate", "up", "none"], defaultValue: "lift" },
      { kind: "select", prop: "entranceAnimation", label: "Entrance", options: ["scale", "fade", "flip", "slide", "bounce", "none"], defaultValue: "scale" },
      { kind: "toggle", prop: "showTooltips", label: "Names", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="pt-12">
        <AvatarGroup autoplay={v.autoplay as boolean}
          key={`${v.entranceAnimation}-${v.max}-${String(v.autoplay)}`}
          avatars={DEMO_AVATARS}
          size={v.size as number}
          overlap={v.overlap as number}
          hoverScale={v.hoverScale as number}
          max={v.max as number}
          hoverAnimation={v.hoverAnimation as "lift"}
          entranceAnimation={v.entranceAnimation as "scale"}
          showTooltips={v.showTooltips as boolean}
        />
      </div>
    ),
  },

  sparkles: {
    fillStage: true,
    componentName: "Sparkles",
    importPath: "@/components/sparkles",
    snippetBaseProps: ["background"],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "count", label: "Count", min: 8, max: 240, step: 4, defaultValue: 60 },
      { kind: "range", prop: "maxSize", label: "Max size", min: 1, max: 6, step: 0.1, unit: "px", defaultValue: 2.8 },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.05, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "opacity", label: "Opacity", min: 0.1, max: 1, step: 0.05, defaultValue: 0.9 },
      { kind: "color", prop: "color", label: "Color", options: ["#e5f4ff", "#64d2ff", "#ffd60a", "#ff9fd0", "#0a84ff"], defaultValue: "#e5f4ff" },
      { kind: "select", prop: "direction", label: "Direction", options: ["random", "up", "down"], defaultValue: "random" },
      { kind: "toggle", prop: "enableGlow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "interactive", label: "Trail and bursts", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative h-full w-full">
        <Sparkles key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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


  "word-magnet": {
    componentName: "WordMagnet",
    importPath: "@/components/word-magnet",
    snippetBaseProps: ['text="Push these words around and watch them wobble back"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 40, max: 260, step: 2, unit: "px", defaultValue: 130 },
      { kind: "range", prop: "force", label: "Force", min: 0.05, max: 1, step: 0.01, defaultValue: 0.45 },
      { kind: "range", prop: "damping", label: "Damping", min: 6, max: 60, step: 1, defaultValue: 28 },
      { kind: "range", prop: "returnDelay", label: "Hold", min: 0, max: 1200, step: 20, unit: "ms", defaultValue: 360 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <WordMagnet
        key={String(v.autoplay)}
        text="Push these words around and watch them wobble back into place"
        radius={v.radius as number}
        force={v.force as number}
        damping={v.damping as number}
        returnDelay={v.returnDelay as number}
        autoplay={v.autoplay as boolean}
        className="max-w-xl text-4xl sm:text-5xl"
      />
    ),
  },

  "glow-button": {
    componentName: "GlowButton",
    importPath: "@/components/glow-button",
    snippetBaseProps: ['href="/signup"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Radius", min: 0, max: 28, step: 1, unit: "px", defaultValue: 28 },
      { kind: "color", prop: "background", label: "Fill", options: ["#1d1d1f", "#0071e3", "#ffffff", "#2c2c2e"], defaultValue: "#1d1d1f" },
      { kind: "toggle", prop: "openInNewTab", label: "New tab", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GlowButton key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        href="#playground"
        radius={v.radius as number}
        background={v.background === "#1d1d1f" ? undefined : (v.background as string)}
        openInNewTab={v.openInNewTab as boolean}
      >
        Get started
      </GlowButton>
    ),
  },

  "background-boxes": {
    fillStage: true,
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
      { kind: "color", prop: "borderColor", label: "Lines", options: ["#3a3a3c", "#d2d2d7", "#1e3a8a", "#4c1d95"], defaultValue: "#3a3a3c" },
      { kind: "toggle", prop: "showCrosses", label: "Crosses", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // Drawn on one canvas, so the full grid stays smooth while sliders move.
    render: (v) => (
      <BackgroundBoxes key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "tiltStrength", label: "Tilt", min: 0, max: 20, step: 1, unit: "°", defaultValue: 8 },
      { kind: "range", prop: "magneticStrength", label: "Magnet force", min: 0, max: 1, step: 0.05, defaultValue: 0.4 },
      { kind: "range", prop: "magneticRadius", label: "Magnet radius", min: 40, max: 240, step: 5, unit: "px", defaultValue: 120 },
      { kind: "range", prop: "orbitSpeed", label: "Orbit period", min: 8, max: 90, step: 1, unit: "s", defaultValue: 36 },
      { kind: "toggle", prop: "enableTilt", label: "Tilt", defaultValue: true },
      { kind: "toggle", prop: "enableMagnetic", label: "Magnetic icons", defaultValue: true },
      { kind: "toggle", prop: "enableOrbit", label: "Orbit", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Autoplay", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <FeatureToolsCard
        title="Connects with your stack"
        description="Mail, chat, calendar, docs and storage, synced the moment they change."
        tiltStrength={v.tiltStrength as number}
        magneticStrength={v.magneticStrength as number}
        magneticRadius={v.magneticRadius as number}
        orbitSpeed={v.orbitSpeed as number}
        enableTilt={v.enableTilt as boolean}
        enableMagnetic={v.enableMagnetic as boolean}
        enableOrbit={v.enableOrbit as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },

  "image-trail": {
    fillStage: true,
    componentName: "ImageTrail",
    importPath: "@/components/image-trail",
    snippetBaseProps: ['className="h-96 w-full"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "spacing", label: "Spacing", min: 12, max: 120, step: 2, unit: "px", defaultValue: 48 },
      { kind: "range", prop: "imageSize", label: "Image size", min: 48, max: 200, step: 4, unit: "px", defaultValue: 112 },
      { kind: "range", prop: "duration", label: "Lifetime", min: 200, max: 3000, step: 50, unit: "ms", defaultValue: 1000 },
      { kind: "range", prop: "cornerRadius", label: "Corner", min: 0, max: 60, step: 1, unit: "px", defaultValue: 14 },
      { kind: "range", prop: "fadeOutBlur", label: "Fade blur", min: 0, max: 20, step: 1, unit: "px", defaultValue: 6 },
      { kind: "range", prop: "smoothness", label: "Smoothness", min: 0, max: 1, step: 0.05, defaultValue: 0.7 },
      { kind: "toggle", prop: "magneticEffect", label: "Magnetic", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ImageTrail
        key={String(v.autoplay)}
        spacing={v.spacing as number}
        imageSize={v.imageSize as number}
        duration={v.duration as number}
        cornerRadius={v.cornerRadius as number}
        fadeOutBlur={v.fadeOutBlur as number}
        smoothness={v.smoothness as number}
        magneticEffect={v.magneticEffect as boolean}
        autoplay={v.autoplay as boolean}
        className="absolute inset-0 h-full w-full rounded-none shadow-none"
      />
    ),
  },

  "encrypted-text": {
    componentName: "EncryptedText",
    importPath: "@/components/encrypted-text",
    snippetBaseProps: ['text="ACCESS GRANTED"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "speed", label: "Lock every", min: 10, max: 200, step: 5, unit: "ms", defaultValue: 50 },
      { kind: "range", prop: "shuffleSpeed", label: "Shuffle every", min: 16, max: 120, step: 4, unit: "ms", defaultValue: 36 },
      { kind: "range", prop: "iterations", label: "Warm-up", min: 1, max: 20, step: 1, defaultValue: 8 },
      { kind: "select", prop: "trigger", label: "Trigger", options: ["load", "hover", "click", "viewport"], defaultValue: "load" },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EncryptedText autoplay={v.autoplay as boolean}
        key={`${String(v.trigger)}-${String(v.loop)}-${String(v.autoplay)}`}
        text="ACCESS GRANTED"
        speed={v.speed as number}
        shuffleSpeed={v.shuffleSpeed as number}
        iterations={v.iterations as number}
        trigger={v.trigger as "load"}
        loop={v.loop as boolean}
        className="text-3xl font-semibold tracking-[0.06em] text-[#1d1d1f] sm:text-4xl dark:text-[#f5f5f7]"
      />
    ),
  },

  "typewriter-effect": {
    componentName: "TypewriterEffect",
    importPath: "@/components/typewriter-effect",
    snippetBaseProps: ['text={["Ship faster.", "Build better.", "Delight users."]}'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "typingSpeed", label: "Typing", min: 20, max: 200, step: 5, unit: "ms", defaultValue: 65 },
      { kind: "range", prop: "deletingSpeed", label: "Deleting", min: 0, max: 150, step: 2, unit: "ms", defaultValue: 42 },
      { kind: "range", prop: "pauseDuration", label: "Pause", min: 0, max: 4000, step: 100, unit: "ms", defaultValue: 1200 },
      { kind: "toggle", prop: "loop", label: "Loop", defaultValue: true },
      { kind: "toggle", prop: "showCursor", label: "Caret", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <h2 className="m-0 text-center text-4xl font-semibold tracking-[-0.035em] text-[#1d1d1f] sm:text-5xl dark:text-[#f5f5f7]">
        <TypewriterEffect autoplay={v.autoplay as boolean}
          key={`${String(v.loop)}-${String(v.deletingSpeed)}-${String(v.autoplay)}`}
          text={TYPEWRITER_LINES}
          typingSpeed={v.typingSpeed as number}
          deletingSpeed={v.deletingSpeed as number}
          pauseDuration={v.pauseDuration as number}
          loop={v.loop as boolean}
          showCursor={v.showCursor as boolean}
          className="text-[#0071e3] dark:text-[#0a84ff]"
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
      { kind: "select", prop: "mode", label: "Split by", options: ["word", "character", "line"], defaultValue: "word" },
      { kind: "range", prop: "duration", label: "Settle", min: 0.15, max: 1.5, step: 0.01, unit: "s", defaultValue: 0.48 },
      { kind: "range", prop: "stagger", label: "Stagger", min: 0.01, max: 0.3, step: 0.01, unit: "s", defaultValue: 0.06 },
      { kind: "toggle", prop: "blur", label: "Blur in", defaultValue: true },
      { kind: "toggle", prop: "lift", label: "Lift", defaultValue: true },
      { kind: "toggle", prop: "showCaret", label: "Caret", defaultValue: true },
    ],
    render: (v) => (
      <TextGenerateEffect
        key={`${String(v.mode)}-${String(v.duration)}-${String(v.stagger)}-${String(v.blur)}-${String(v.lift)}-${String(v.showCaret)}`}
        as="h2"
        autoplay
        text={"Build elegant interfaces that feel alive,\nreadable, and deeply polished."}
        mode={v.mode as "word"}
        duration={v.duration as number}
        stagger={v.stagger as number}
        blur={v.blur as boolean}
        lift={v.lift as boolean}
        showCaret={v.showCaret as boolean}
        className="max-w-2xl text-center text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
      />
    ),
  },

  "gooey-search-input": {
    componentName: "GooeyInput",
    importPath: "@/components/gooey-input",
    snippetBaseProps: ['placeholder="Search catalog"', "suggestions={pages}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "collapsedWidth", label: "Collapsed", min: 90, max: 200, step: 5, unit: "px", defaultValue: 115 },
      { kind: "range", prop: "expandedWidth", label: "Expanded", min: 160, max: 300, step: 5, unit: "px", defaultValue: 200 },
      { kind: "range", prop: "expandedOffset", label: "Offset", min: 48, max: 120, step: 2, unit: "px", defaultValue: 56 },
      { kind: "range", prop: "gooeyBlur", label: "Goo", min: 0, max: 12, step: 0.5, unit: "px", defaultValue: 5 },
    ],
    render: (v) => (
      <GooeyInput
        placeholder="Search catalog"
        suggestions={["Motion kit", "Motion values", "Spring motion", "Layout animation", "Scroll reveal", "Gooey filter"]}
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
    snippetBaseProps: ['label="Volume"', 'unit="%"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "ticks", label: "Ticks", min: 12, max: 48, step: 1, defaultValue: 36 },
      { kind: "range", prop: "step", label: "Step", min: 1, max: 25, step: 1, defaultValue: 1 },
      { kind: "range", prop: "magnify", label: "Wave", min: 0, max: 1.2, step: 0.05, unit: "×", defaultValue: 0.55 },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "showValue", label: "Number", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TickSlider key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        label="Volume"
        unit="%"
        defaultValue={62}
        ticks={v.ticks as number}
        step={v.step as number}
        magnify={v.magnify as number}
        size={v.size as "md"}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        showValue={v.showValue as boolean}
      />
    ),
  },
  "time-scrubber": {
    componentName: "TimeScrubber",
    importPath: "@/components/time-scrubber",
    snippetBaseProps: ['label="Pickup"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "interval", label: "Snap", min: 5, max: 30, step: 5, unit: "min", defaultValue: 15 },
      { kind: "select", prop: "format", label: "Format", options: ["12h", "24h"], defaultValue: "12h" },
      { kind: "range", prop: "density", label: "Spread", min: 0.8, max: 3, step: 0.1, unit: "px", defaultValue: 1.6 },
      { kind: "color", prop: "accent", label: "Needle", options: ["#0071e3", "#ff3b30", "#ff9f0a", "#30d158", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TimeScrubber key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        label="Pickup"
        interval={v.interval as number}
        format={v.format as "12h"}
        density={v.density as number}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
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
      { kind: "color", prop: "successColor", label: "Success", options: ["#248a3d", "#0071e3", "#1d1d1f", "#8944ab", "#b25000"], defaultValue: "#248a3d" },
      { kind: "select", prop: "label", label: "Label", options: ["Slide to confirm", "Slide to pay", "Slide to unlock"], defaultValue: "Slide to confirm" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SlideToConfirm key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ToastStack key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Drag a file here", "Drop your files", "Add attachments"], defaultValue: "Drag a file here" },
      { kind: "select", prop: "hint", label: "Hint", options: ["Up to 5 MB", "PNG, JPG or MP4", "Max 10 files"], defaultValue: "Up to 5 MB" },
      { kind: "toggle", prop: "disabled", label: "Disabled", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <UploadDropzone key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        multiple={v.multiple as boolean}
        accent={v.accent === "#0071e3" ? undefined : (v.accent as string)}
        title={v.title as string}
        hint={v.hint as string}
        disabled={v.disabled as boolean}
        initialFiles={[{ name: "Moodboard.png", size: 1240000, type: "image/png", progress: 1 }]}
      />
    ),
  },
  "hold-to-record": {
    componentName: "HoldToRecord",
    importPath: "@/components/hold-to-record",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff3b30", "#0071e3", "#30d158", "#bf5af2", "#1d1d1f"], defaultValue: "#ff3b30" },
      { kind: "range", prop: "cancelDistance", label: "Cancel distance", min: 40, max: 160, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "maxDuration", label: "Max length", min: 5000, max: 60000, step: 1000, unit: "ms", defaultValue: 60000 },
      { kind: "range", prop: "minDuration", label: "Min hold", min: 0, max: 1500, step: 50, unit: "ms", defaultValue: 400 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to record", "Hold to talk", "Record a note"], defaultValue: "Hold to record" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <HoldToRecord key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
      { kind: "toggle", prop: "poke", label: "Poke to hop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Autoplay", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CursorBuddy
        key={String(v.autoplay)}
        shape={v.shape as "squircle"}
        fill={v.fill as "light"}
        eyes={v.eyes as "dots"}
        follow={v.follow as number}
        size={v.size as number}
        sleepAfter={v.sleepAfter as number}
        poke={v.poke as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "dot-sphere": {
    componentName: "DotSphere",
    importPath: "@/components/dot-sphere",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "dots", label: "Dots", min: 80, max: 1200, step: 20, defaultValue: 420 },
      { kind: "range", prop: "radius", label: "Radius", min: 60, max: 170, step: 2, unit: "px", defaultValue: 130 },
      { kind: "color", prop: "accent", label: "Ripple", options: ["#0071e3", "#30d158", "#ff9f0a", "#bf5af2", "#ff3b30"], defaultValue: "#0071e3" },
      { kind: "range", prop: "repel", label: "Repel", min: 0, max: 100, step: 1, defaultValue: 55 },
      { kind: "range", prop: "speed", label: "Spin", min: 0, max: 100, step: 1, defaultValue: 30 },
      { kind: "range", prop: "dotSize", label: "Dot size", min: 1, max: 8, step: 0.2, unit: "px", defaultValue: 3.4 },
      { kind: "toggle", prop: "interactive", label: "Interactive", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Ripple by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DotSphere
        key={String(v.autoplay)}
        dots={v.dots as number}
        radius={v.radius as number}
        accent={v.accent as string}
        repel={v.repel as number}
        speed={v.speed as number}
        dotSize={v.dotSize as number}
        interactive={v.interactive as boolean}
        autoplay={v.autoplay as boolean}
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
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DynamicIsland
        key={`${v.defaultState as string}-${String(v.autoplay)}`}
        defaultState={v.defaultState as "timer"}
        timerSeconds={v.timerSeconds as number}
        accent={v.accent as string}
        cycle={v.cycle as number}
        autoplay={v.autoplay as boolean}
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <OtpInput autoplay={v.autoplay ? "48291357".slice(0, v.length as number) : undefined} key={`${v.length}-${v.autoplay}`} accent={v.accent as string} length={v.length as number} verify={(c) => c.startsWith("4829")} />
    ),
  },
  "radio-cards": {
    componentName: "RadioCards",
    importPath: "@/components/radio-cards",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <RadioCards key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  },
  "hold-to-confirm": {
    componentName: "HoldToConfirm",
    importPath: "@/components/hold-to-confirm",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Color", options: ["#ff3b30", "#1d1d1f", "#0071e3", "#ff375f", "#30b158"], defaultValue: "#ff3b30" },
      { kind: "range", prop: "holdMs", label: "Hold for", min: 600, max: 4000, step: 100, unit: "ms", defaultValue: 1500 },
      { kind: "select", prop: "label", label: "Label", options: ["Hold to Delete", "Hold to Archive", "Hold to Leave"], defaultValue: "Hold to Delete" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <HoldToConfirm key={String(v.autoplay)} autoplay={v.autoplay as boolean} color={v.color as string} holdMs={v.holdMs as number} label={v.label as string} />,
  },
  "before-after": {
    lightOnly: true,
    componentName: "BeforeAfter",
    importPath: "@/components/before-after",
    snippetBaseProps: ['before={<img src="/before.jpg" alt="" className="h-full w-full object-cover" />}', 'after={<img src="/after.jpg" alt="" className="h-full w-full object-cover" />}'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "beforeLabel", label: "Before label", options: ["Before", "Original", "Raw"], defaultValue: "Before" },
      { kind: "select", prop: "afterLabel", label: "After label", options: ["After", "Edited", "Graded"], defaultValue: "After" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <BeforeAfter key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PriceOdometer key={String(v.autoplay)} autoplay={v.autoplay as boolean}
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
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PasswordStrength key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  },
  "tilt-pass": {
    componentName: "TiltPass",
    importPath: "@/components/tilt-pass",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Founders Pass", "Backstage", "Season Ticket"], defaultValue: "Founders Pass" },
      { kind: "select", prop: "name", label: "Holder", options: ["Alex Rivera", "Sam Okafor", "Mina Park"], defaultValue: "Alex Rivera" },
      { kind: "toggle", prop: "autoplay", label: "Float on its own", defaultValue: false, startOn: true },
    ],
    render: (v) => <TiltPass title={v.title as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  },
  "animated-tabs": {
    componentName: "AnimatedTabs",
    importPath: "@/components/animated-tabs",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Switch", options: ["#34c759", "#0071e3", "#ff375f", "#ff9f0a", "#1d1d1f"], defaultValue: "#34c759" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <AnimatedTabs key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  },
  "shared-element-cards": {
    componentName: "SharedElementCards",
    importPath: "@/components/shared-element-cards",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true }],
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
    controls: [{ kind: "range", prop: "defaultIndex", label: "Start at", min: 0, max: 4, step: 1, defaultValue: 0 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StretchNav autoplay={v.autoplay as boolean} key={`${v.defaultIndex as number}-${String(v.autoplay)}`} defaultIndex={v.defaultIndex as number} />,
  },
  "feedback-pill": {
    componentName: "FeedbackPill",
    importPath: "@/components/feedback-pill",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Feedback", "Report a bug", "Suggest"], defaultValue: "Feedback" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <FeedbackPill key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} label={v.label as string} />,
  },
  "stagger-menu": {
    componentName: "StaggerMenu",
    importPath: "@/components/stagger-menu",
    defaultFill: "light",
    controls: [{ kind: "select", prop: "label", label: "Label", options: ["Share", "Export", "More"], defaultValue: "Share" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex justify-center pt-6">
        <StaggerMenu key={String(v.autoplay)} autoplay={v.autoplay as boolean} label={v.label as string} />
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RulerPicker autoplay={v.autoplay as boolean}
        key={`${v.max}-${v.defaultValue}-${String(v.autoplay)}`}
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ElasticStepper autoplay={v.autoplay as boolean} key={`${v.max as number}-${String(v.autoplay)}`} accent={v.accent as string} max={v.max as number} label={v.label as string} />,
  },
  "todo-list": {
    componentName: "TodoList",
    importPath: "@/components/todo-list",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <TodoList key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  },
  "progress-button": {
    componentName: "ProgressButton",
    importPath: "@/components/progress-button",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Download", "Export", "Install"], defaultValue: "Download" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ProgressButton key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} label={v.label as string} />,
  },
  "copy-button": {
    componentName: "CopyChip",
    importPath: "@/components/copy-button",
    snippetBaseProps: ['value="inv_3fK9xQ2Lq7"'],
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CopyChip key={String(v.autoplay)} autoplay={v.autoplay as boolean} value="inv_3fK9xQ2Lq7" display="inv_3fK9…2Lq7" accent={v.accent as string} />,
  },
  "animated-icons": {
    componentName: "AnimatedIcons",
    importPath: "@/components/animated-icons",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <AnimatedIcons key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "folder-peek": {
    componentName: "FolderPeek",
    importPath: "@/components/folder-peek",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Folder", options: ["#0071e3", "#34c759", "#ff9f0a", "#ff375f", "#8e8e93"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Brand assets", "Launch kit", "Invoices"], defaultValue: "Brand assets" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <FolderPeek key={String(v.autoplay)} autoplay={v.autoplay as boolean} color={v.color as string} title={v.title as string} />,
  },
  "magnify-dock": {
    componentName: "MagnifyDock",
    importPath: "@/components/magnify-dock",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false, startOn: true }],
    render: (v) => <MagnifyDock key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "upload-chips": {
    componentName: "UploadChips",
    importPath: "@/components/upload-chips",
    defaultFill: "light",
    controls: [{ kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#1d1d1f", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <UploadChips key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} />,
  },
  "notification-stack": {
    componentName: "NotificationStack",
    importPath: "@/components/notification-stack",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Push samples", defaultValue: false, startOn: true }],
    render: (v) => <NotificationStack key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "island-morph": {
    componentName: "IslandMorph",
    importPath: "@/components/island-morph",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false, startOn: true }],
    render: (v) => <IslandMorph key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "lanyard-badge": {
    componentName: "LanyardBadge",
    importPath: "@/components/lanyard-badge",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "strap", label: "Strap", options: ["#0071e3", "#ff375f", "#30d158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "select", prop: "tag", label: "Tag", options: ["Speaker", "Attendee", "Staff", "Press"], defaultValue: "Speaker" },
      { kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Draw by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Browse by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Cycle states", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SaggingField key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} maxChars={v.maxChars as number} />,
  },
  "tear-off-ticket": {
    componentName: "TearOffTicket",
    importPath: "@/components/tear-off-ticket",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Event", options: ["Light & Matter", "Night Market", "Modern Forms"], defaultValue: "Light & Matter" },
      { kind: "toggle", prop: "autoplay", label: "Tear by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <TearOffTicket key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "throw-wheel": {
    lightOnly: true,
    componentName: "ThrowWheel",
    importPath: "@/components/throw-wheel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Throw by itself", defaultValue: false, startOn: true }],
    render: (v) => <ThrowWheel key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "pixel-select": {
    componentName: "PixelSelect",
    importPath: "@/components/pixel-select",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true }],
    render: (v) => <PixelSelect key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "scrub-inputs": {
    componentName: "ScrubInputs",
    importPath: "@/components/scrub-inputs",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Scrub by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ScrubInputs key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "lit-keyboard": {
    componentName: "LitKeyboard",
    importPath: "@/components/lit-keyboard",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "glow", label: "Glow", options: ["#ff9f0a", "#0a84ff", "#30d158", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Drop rings by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Tour cities", defaultValue: false, startOn: true },
    ],
    render: (v) => <DotGlobe key={String(v.autoplay)} accent={v.accent as string} size={v.size as number} autoplay={v.autoplay as boolean} />,
  },
  "component-layers": {
    componentName: "ComponentLayers",
    importPath: "@/components/component-layers",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#bf5af2", "#30d158", "#ff375f", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Explode by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ComponentLayers key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "standing-calendar": {
    componentName: "StandingCalendar",
    importPath: "@/components/standing-calendar",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "weeks", label: "Weeks", min: 12, max: 36, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Stand up by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Send by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MoneyGoo key={String(v.autoplay)} accent={v.accent as string} amount={v.amount as number} autoplay={v.autoplay as boolean} />,
  },
  "weather-puck": {
    componentName: "WeatherPuck",
    importPath: "@/components/weather-puck",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Sweep by itself", defaultValue: false, startOn: true }],
    render: (v) => <WeatherPuck key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "metal-orbs": {
    componentName: "MetalOrbs",
    importPath: "@/components/metal-orbs",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "height", label: "Height", min: 200, max: 340, step: 10, unit: "px", defaultValue: 280 },
      { kind: "toggle", prop: "autoplay", label: "Cycle modes", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Tug by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BendingRail key={String(v.autoplay)} accent={v.accent as string} label={v.label as string} autoplay={v.autoplay as boolean} />,
  },
  "layout-switch": {
    lightOnly: true,
    componentName: "LayoutSwitch",
    importPath: "@/components/layout-switch",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle layouts", defaultValue: false, startOn: true }],
    render: (v) => <LayoutSwitch key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "fan-deck": {
    componentName: "FanDeck",
    importPath: "@/components/fan-deck",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Fan by itself", defaultValue: false, startOn: true }],
    render: (v) => <FanDeck key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "receipt-unfold": {
    componentName: "ReceiptUnfold",
    importPath: "@/components/receipt-unfold",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "total", label: "Total", options: ["$49.68", "$120.96", "$8.99"], defaultValue: "$49.68" },
      { kind: "toggle", prop: "autoplay", label: "Unfold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ReceiptUnfold key={String(v.autoplay)} total={v.total as string} autoplay={v.autoplay as boolean} />,
  },
  "page-curl": {
    componentName: "PageCurl",
    importPath: "@/components/page-curl",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "width", label: "Width", min: 320, max: 440, step: 10, unit: "px", defaultValue: 400 },
      { kind: "toggle", prop: "autoplay", label: "Peek by itself", defaultValue: false, startOn: true },
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
      { kind: "toggle", prop: "autoplay", label: "Sign by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SignAndSeal key={String(v.autoplay)} ink={v.ink as string} name={v.name as string} autoplay={v.autoplay as boolean} />,
  },
  "streak-counter": {
    componentName: "StreakCounter",
    importPath: "@/components/streak-counter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "start", label: "Start at", min: 0, max: 60, step: 1, defaultValue: 11 },
      { kind: "toggle", prop: "autoplay", label: "Log by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StreakCounter key={`${v.start}-${v.autoplay}`} start={v.start as number} autoplay={v.autoplay as boolean} />,
  },
  "capsule-toggles": {
    componentName: "CapsuleToggles",
    importPath: "@/components/capsule-toggles",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Controls", "Quick settings", "Privacy"], defaultValue: "Controls" },
      { kind: "toggle", prop: "autoplay", label: "Flip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CapsuleToggles key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "glass-bubbles": {
    componentName: "GlassBubbles",
    importPath: "@/components/glass-bubbles",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Nudge by itself", defaultValue: false, startOn: true }],
    render: (v) => <GlassBubbles key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "box-spill": {
    componentName: "BoxSpill",
    importPath: "@/components/box-spill",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "count", label: "Pieces", min: 10, max: 60, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BoxSpill key={String(v.autoplay)} count={v.count as number} autoplay={v.autoplay as boolean} />,
  },
  "curved-reel": {
    lightOnly: true,
    componentName: "CurvedReel",
    importPath: "@/components/curved-reel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Drift by itself", defaultValue: true }],
    render: (v) => <CurvedReel autoplay={v.autoplay as boolean} />,
  },
  "squeeze-progress": {
    lightOnly: true,
    componentName: "SqueezeProgress",
    importPath: "@/components/squeeze-progress",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Running", options: ["#0071e3", "#1d1d1f", "#5e5ce6", "#0b8f6a", "#ff375f"], defaultValue: "#0071e3" },
      { kind: "color", prop: "paused", label: "Paused", options: ["#c2410c", "#ff375f", "#ff9f0a", "#8e8e93", "#bf5af2"], defaultValue: "#c2410c" },
      { kind: "toggle", prop: "autoplay", label: "Pause by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SqueezeProgress key={String(v.autoplay)} accent={v.accent as string} paused={v.paused as string} autoplay={v.autoplay as boolean} />,
  },
  "bolting-sliders": {
    componentName: "BoltingSliders",
    importPath: "@/components/bolting-sliders",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30d158", "#ff375f", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Jump by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BoltingSliders key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "crumple-to-trash": {
    componentName: "CrumpleToTrash",
    importPath: "@/components/crumple-to-trash",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Page title", options: ["Draft · Q4 notes", "Launch checklist", "Old invoice"], defaultValue: "Draft · Q4 notes" },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <CrumpleToTrash key={String(v.autoplay)} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "tape-shelf": {
    componentName: "TapeShelf",
    importPath: "@/components/tape-shelf",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true }],
    render: (v) => <TapeShelf key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "packet-router": {
    componentName: "PacketRouter",
    importPath: "@/components/packet-router",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultStrategy", label: "Start on", options: ["Cost", "Balanced", "Quality"], defaultValue: "Balanced" },
      { kind: "toggle", prop: "autoplay", label: "Cycle strategies", defaultValue: false, startOn: true },
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
    controls: [{ kind: "toggle", prop: "autoplay", label: "Lift by itself", defaultValue: false, startOn: true }],
    render: (v) => <StampSwirl key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "bubble-cluster": {
    lightOnly: true,
    componentName: "BubbleCluster",
    importPath: "@/components/bubble-cluster",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle groups", defaultValue: false, startOn: true }],
    render: (v) => <BubbleCluster key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "sticker-toss": {
    componentName: "StickerToss",
    importPath: "@/components/sticker-toss",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Centre", options: ["#c8f560", "#ff375f", "#0a84ff", "#ff9f0a", "#bf5af2"], defaultValue: "#c8f560" },
      { kind: "select", prop: "text", label: "Ring text", options: ["NEXUS UI · MADE TO MOVE · ", "STUDIO · EST. 2026 · ", "THROW ME · CATCH ME · "], defaultValue: "NEXUS UI · MADE TO MOVE · " },
      { kind: "toggle", prop: "autoplay", label: "Toss by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StickerToss key={String(v.autoplay)} accent={v.accent as string} text={v.text as string} autoplay={v.autoplay as boolean} />,
  },
  "context-meter": {
    componentName: "ContextMeter",
    importPath: "@/components/context-meter",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "limit", label: "Window", min: 120, max: 400, step: 20, unit: "K", defaultValue: 200 },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ContextMeter key={`${v.limit}-${v.autoplay}`} limit={v.limit as number} autoplay={v.autoplay as boolean} />,
  },
  "mood-wheel": {
    componentName: "MoodWheel",
    importPath: "@/components/mood-wheel",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Spin by itself", defaultValue: false, startOn: true }],
    render: (v) => <MoodWheel key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "swipe-stack": {
    componentName: "SwipeStack",
    importPath: "@/components/swipe-stack",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Swipe by itself", defaultValue: false, startOn: true }],
    render: (v) => <SwipeStack key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "flight-tracker": {
    lightOnly: true,
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
  "todo-tower": {
    componentName: "TodoTower",
    importPath: "@/components/todo-tower",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "overhang", label: "Tip after", min: 12, max: 48, step: 2, unit: "px", defaultValue: 24 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <TodoTower key={String(v.autoplay)} overhang={v.overhang as number} autoplay={v.autoplay as boolean} />,
  },
  "peek-login": {
    componentName: "PeekLogin",
    importPath: "@/components/peek-login",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Face", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PeekLogin key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "heat-field": {
    componentName: "HeatField",
    importPath: "@/components/heat-field",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "radius", label: "Spread", min: 24, max: 80, step: 2, unit: "px", defaultValue: 46 },
      { kind: "toggle", prop: "autoplay", label: "Wander by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <HeatField key={String(v.autoplay)} radius={v.radius as number} autoplay={v.autoplay as boolean} />,
  },
  "particle-mark": {
    componentName: "ParticleMark",
    importPath: "@/components/particle-mark",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Word", options: ["motion", "hello", "nexus", "spring"], defaultValue: "motion" },
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ParticleMark key={String(v.autoplay)} text={v.text as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "generate-image": {
    componentName: "GenerateImage",
    importPath: "@/components/generate-image",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "prompt", label: "Prompt", options: ["Pink dusk over soft hills", "Morning valley, mint and sky", "Moonlit ridge, deep teal", "Desert at golden hour"], defaultValue: "Pink dusk over soft hills" },
      { kind: "toggle", prop: "autoplay", label: "Generate by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <GenerateImage key={`${v.prompt}-${v.autoplay}`} prompt={v.prompt as string} autoplay={v.autoplay as boolean} />,
  },
  "falloff-accordion": {
    lightOnly: true,
    componentName: "FalloffAccordion",
    importPath: "@/components/falloff-accordion",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Open by itself", defaultValue: false, startOn: true }],
    render: (v) => <FalloffAccordion key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "magnet-select": {
    componentName: "MagnetSelect",
    importPath: "@/components/magnet-select",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultValue", label: "Start on", options: ["here", "focus", "meet", "lunch", "travel", "sick", "away"], defaultValue: "here" },
      { kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MagnetSelect key={`${v.defaultValue}-${v.autoplay}`} defaultValue={v.defaultValue as string} autoplay={v.autoplay as boolean} />,
  },
  "aspect-crop": {
    lightOnly: true,
    componentName: "AspectCrop",
    importPath: "@/components/aspect-crop",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Cycle by itself", defaultValue: false, startOn: true }],
    render: (v) => <AspectCrop key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "slosh-slider": {
    componentName: "SloshSlider",
    importPath: "@/components/slosh-slider",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Liquid", options: ["#0071e3", "#30d158", "#ff9f0a", "#ff375f", "#bf5af2"], defaultValue: "#0071e3" },
      { kind: "select", prop: "label", label: "Label", options: ["Volume", "Brightness", "Bass"], defaultValue: "Volume" },
      { kind: "toggle", prop: "autoplay", label: "Slosh by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SloshSlider key={String(v.autoplay)} accent={v.accent as string} label={v.label as string} autoplay={v.autoplay as boolean} />,
  },
  "goo-reorder": {
    componentName: "GooReorder",
    importPath: "@/components/goo-reorder",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Shuffle by itself", defaultValue: false, startOn: true }],
    render: (v) => <GooReorder key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "hop-labels": {
    componentName: "HopLabels",
    importPath: "@/components/hop-labels",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <HopLabels key={String(v.autoplay)} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "step-player": {
    componentName: "StepPlayer",
    importPath: "@/components/step-player",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "stepDuration", label: "Step length", min: 1.5, max: 6, step: 0.1, unit: "s", defaultValue: 3.2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StepPlayer key={String(v.autoplay)} autoplay={v.autoplay as boolean} accent={v.accent as string} stepDuration={v.stepDuration as number} />,
  },
  "pull-to-refresh": {
    componentName: "PullToRefresh",
    importPath: "@/components/pull-to-refresh",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pull by itself", defaultValue: false, startOn: true }],
    render: (v) => <PullToRefresh key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "runaway-button": {
    componentName: "RunawayButton",
    importPath: "@/components/runaway-button",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Dodge by itself", defaultValue: false, startOn: true }],
    render: (v) => <RunawayButton key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "wake-slider": {
    componentName: "WakeSlider",
    importPath: "@/components/wake-slider",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#ff9f0a", "#0a84ff", "#30d158", "#ff375f", "#bf5af2"], defaultValue: "#ff9f0a" },
      { kind: "select", prop: "label", label: "Label", options: ["Brightness", "Volume", "Warmth"], defaultValue: "Brightness" },
      { kind: "range", prop: "defaultValue", label: "Start value", min: 0, max: 100, step: 1, defaultValue: 40 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <WakeSlider autoplay={v.autoplay as boolean} key={`${String(v.defaultValue)}-${String(v.autoplay)}`} accent={v.accent as string} label={v.label as string} defaultValue={v.defaultValue as number} />,
  },
  "seek-search": {
    componentName: "SeekSearch",
    importPath: "@/components/seek-search",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Search files", "Search docs", "Find a teammate"], defaultValue: "Search files" },
      { kind: "toggle", prop: "autoplay", label: "Demo by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SeekSearch key={String(v.autoplay)} placeholder={v.placeholder as string} autoplay={v.autoplay as boolean} />,
  },
  "fold-note": {
    lightOnly: true,
    componentName: "FoldNote",
    importPath: "@/components/fold-note",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "amount", label: "Amount", options: ["50", "25", "100"], defaultValue: "50" },
      { kind: "select", prop: "backLabel", label: "Back", options: ["Thanks", "Saved", "Enjoy"], defaultValue: "Thanks" },
      { kind: "toggle", prop: "autoplay", label: "Fold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <FoldNote key={String(v.autoplay)} amount={v.amount as string} backLabel={v.backLabel as string} autoplay={v.autoplay as boolean} />,
  },
  "assign-picker": {
    componentName: "AssignPicker",
    importPath: "@/components/assign-picker",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Pick by itself", defaultValue: false, startOn: true }],
    render: (v) => <AssignPicker key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "bend-text": {
    componentName: "BendText",
    importPath: "@/components/bend-text",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Text", options: ["PLUCK THE LINE · MAKE IT SING · ", "NEW SEASON · NEW SOUNDS · ", "HELLO THERE · "], defaultValue: "PLUCK THE LINE · MAKE IT SING · " },
      { kind: "color", prop: "accent", label: "Grab point", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "toggle", prop: "autoplay", label: "Pluck by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <BendText key={String(v.autoplay)} text={v.text as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "pressure-text": {
    componentName: "PressureText",
    importPath: "@/components/pressure-text",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "spread", label: "Spread", min: 0.08, max: 0.4, step: 0.02, defaultValue: 0.18 },
      { kind: "toggle", prop: "autoplay", label: "Breathe by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PressureText key={String(v.autoplay)} accent={v.accent as string} spread={v.spread as number} autoplay={v.autoplay as boolean} />,
  },
  "morph-cursor": {
    componentName: "MorphCursor",
    importPath: "@/components/morph-cursor",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Caret", options: ["#0071e3", "#5e5ce6", "#ff375f", "#30b158", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "buttonLabel", label: "Button", options: ["Start a project", "New board", "Invite team"], defaultValue: "Start a project" },
      { kind: "toggle", prop: "autoplay", label: "Tour by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <MorphCursor key={String(v.autoplay)} accent={v.accent as string} buttonLabel={v.buttonLabel as string} autoplay={v.autoplay as boolean} />,
  },
  "ink-theme-switch": {
    componentName: "InkThemeSwitch",
    importPath: "@/components/ink-theme-switch",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "defaultDark", label: "Start dark", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Flip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <InkThemeSwitch key={`${String(v.autoplay)}-${String(v.defaultDark)}`} defaultDark={v.defaultDark as boolean} autoplay={v.autoplay as boolean} />
    ),
  },
  "liquid-gauge": {
    componentName: "LiquidGauge",
    importPath: "@/components/liquid-gauge",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Liquid", options: ["#0a84ff", "#30d158", "#5e5ce6", "#ff375f", "#64d2ff"], defaultValue: "#0a84ff" },
      { kind: "range", prop: "defaultUsed", label: "Used", min: 0, max: 200, step: 2, unit: " GB", defaultValue: 136 },
      { kind: "toggle", prop: "autoplay", label: "Slosh by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <LiquidGauge
        key={`${String(v.autoplay)}-${String(v.defaultUsed)}`}
        accent={v.accent as string}
        defaultUsed={v.defaultUsed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "thermo-dial": {
    componentName: "ThermoDial",
    importPath: "@/components/thermo-dial",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "room", label: "Room", min: 10, max: 30, step: 0.5, unit: "°", defaultValue: 19.5 },
      { kind: "range", prop: "defaultValue", label: "Start at", min: 10, max: 30, step: 0.5, unit: "°", defaultValue: 21 },
      { kind: "toggle", prop: "autoplay", label: "Turn by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ThermoDial
        key={`${String(v.autoplay)}-${String(v.defaultValue)}`}
        room={v.room as number}
        defaultValue={v.defaultValue as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "pull-cord": {
    lightOnly: true,
    componentName: "PullCord",
    importPath: "@/components/pull-cord",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "defaultOn", label: "Start on", defaultValue: false },
      { kind: "select", prop: "hint", label: "Hint", options: ["Pull the cord.", "Give it a tug.", "Pull to toggle."], defaultValue: "Pull the cord." },
      { kind: "toggle", prop: "autoplay", label: "Tug by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <PullCord
        key={`${String(v.autoplay)}-${String(v.defaultOn)}`}
        defaultOn={v.defaultOn as boolean}
        hint={v.hint as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "scratch-reveal": {
    componentName: "ScratchReveal",
    importPath: "@/components/scratch-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "headline", label: "Prize", options: ["20% off Pro", "Free month", "Free shipping"], defaultValue: "20% off Pro" },
      { kind: "color", prop: "accent", label: "Eyebrow", options: ["#bf5af2", "#ff375f", "#0a84ff", "#30b158", "#ff9f0a"], defaultValue: "#bf5af2" },
      { kind: "toggle", prop: "autoplay", label: "Scratch by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ScratchReveal key={String(v.autoplay)} headline={v.headline as string} accent={v.accent as string} autoplay={v.autoplay as boolean} />,
  },
  "polaroid-develop": {
    componentName: "PolaroidDevelop",
    importPath: "@/components/polaroid-develop",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Shake by itself", defaultValue: false, startOn: true }],
    render: (v) => <PolaroidDevelop key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "wallet-stack": {
    lightOnly: true,
    componentName: "WalletStack",
    importPath: "@/components/wallet-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "label", label: "Label", options: ["Wallet", "Cards", "Pay"], defaultValue: "Wallet" },
      { kind: "select", prop: "hint", label: "Hint", options: ["Pick a card.", "Tap a card to see the back.", ""], defaultValue: "Pick a card." },
      { kind: "toggle", prop: "autoplay", label: "Browse by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <WalletStack key={String(v.autoplay)} label={v.label as string} hint={v.hint as string} autoplay={v.autoplay as boolean} />,
  },
  "traffic-bars": {
    componentName: "TrafficBars",
    importPath: "@/components/traffic-bars",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "palette", label: "Palette", options: ["Ocean", "Sunset", "Forest"], defaultValue: "Ocean" },
      { kind: "range", prop: "stagger", label: "Stagger", min: 0, max: 40, step: 2, unit: "ms", defaultValue: 12 },
      { kind: "range", prop: "radius", label: "Radius", min: 0, max: 6, step: 0.5, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TrafficBars key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        colors={
          ({
            Ocean: ["#0071e3", "#64d2ff", "#bf5af2"],
            Sunset: ["#ff375f", "#ff9f0a", "#ffd60a"],
            Forest: ["#248a3d", "#30d158", "#a2e635"],
          } as Record<string, string[]>)[v.palette as string]
        }
        stagger={v.stagger as number}
        radius={v.radius as number}
      />
    ),
  },
  "stock-line": {
    componentName: "StockLine",
    importPath: "@/components/stock-line",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "smooth", label: "Smooth curve", defaultValue: true },
      { kind: "toggle", prop: "fill", label: "Area fill", defaultValue: true },
      { kind: "color", prop: "up", label: "Up colour", options: ["#30d158", "#0a84ff", "#64d2ff", "#bf5af2"], defaultValue: "#30d158" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <StockLine key={String(v.autoplay)} autoplay={v.autoplay as boolean} smooth={v.smooth as boolean} fill={v.fill as boolean} up={v.up as string} />,
  },
  "pulse-monitor": {
    componentName: "PulseMonitor",
    importPath: "@/components/pulse-monitor",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "bpm", label: "Resting BPM", min: 48, max: 100, step: 1, unit: "bpm", defaultValue: 68 },
      { kind: "color", prop: "color", label: "Trace", options: ["#ff375f", "#0a84ff", "#30d158", "#bf5af2", "#64d2ff"], defaultValue: "#ff375f" },
      { kind: "color", prop: "workoutColor", label: "Workout", options: ["#ff9f0a", "#ffd60a", "#ff375f", "#30d158"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <PulseMonitor key={String(v.autoplay)} autoplay={v.autoplay as boolean} bpm={v.bpm as number} color={v.color as string} workoutColor={v.workoutColor as string} />,
  },
  "spend-donut": {
    componentName: "SpendDonut",
    importPath: "@/components/spend-donut",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "thickness", label: "Thickness", min: 10, max: 30, step: 1, unit: "px", defaultValue: 18 },
      { kind: "range", prop: "gap", label: "Gap", min: 0, max: 12, step: 1, unit: "px", defaultValue: 4 },
      { kind: "toggle", prop: "autoplay", label: "Cycle by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SpendDonut key={String(v.autoplay)} thickness={v.thickness as number} gap={v.gap as number} autoplay={v.autoplay as boolean} />,
  },
  "tag-pit": {
    componentName: "TagPit",
    importPath: "@/components/tag-pit",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "min", label: "Picks needed", min: 1, max: 6, step: 1, defaultValue: 3 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <TagPit key={String(v.autoplay)} accent={v.accent as string} min={v.min as number} autoplay={v.autoplay as boolean} />
      </React.Suspense>
    ),
  },
  "usage-stack": {
    componentName: "UsageStack",
    importPath: "@/components/usage-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultValue", label: "Start at", options: ["50000", "120000", "300000", "600000"], defaultValue: "120000" },
      { kind: "toggle", prop: "autoplay", label: "Step by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <UsageStack key={`${v.defaultValue}-${v.autoplay}`} defaultValue={Number(v.defaultValue)} autoplay={v.autoplay as boolean} />
      </React.Suspense>
    ),
  },
  "marble-progress": {
    componentName: "MarbleProgress",
    importPath: "@/components/marble-progress",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Tick by itself", defaultValue: false, startOn: true }],
    render: (v) => (
      <React.Suspense fallback={null}>
        <MarbleProgress key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </React.Suspense>
    ),
  },
  "cloth-banner": {
    componentName: "ClothBanner",
    importPath: "@/components/cloth-banner",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "from", label: "Cloth", options: ["#0071e3", "#ff375f", "#30b158", "#ff9f0a", "#1d1d1f"], defaultValue: "#0071e3" },
      { kind: "select", prop: "title", label: "Title", options: ["Launch Week", "Now in beta", "50% off"], defaultValue: "Launch Week" },
      { kind: "toggle", prop: "autoplay", label: "Gusts", defaultValue: false, startOn: true },
    ],
    render: (v) => <ClothBanner key={String(v.autoplay)} from={v.from as string} title={v.title as string} autoplay={v.autoplay as boolean} />,
  },
  "animated-select-headline": {
    componentName: "AnimatedSelectHeadline",
    importPath: "@/components/animated-select-headline",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "interval", label: "Hold", min: 800, max: 5000, step: 100, unit: "ms", defaultValue: 2500 },
      { kind: "toggle", prop: "showCursor", label: "Cursors", defaultValue: true },
      { kind: "toggle", prop: "showSize", label: "Size badge", defaultValue: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <AnimatedSelectHeadline
          words={["warp speed", "record time", "pure flow", "light speed"]}
          interval={v.interval as number}
          showCursor={v.showCursor as boolean}
          showSize={v.showSize as boolean}
          headingClassName="text-[36px] sm:text-[44px]"
        />
      </div>
    ),
  },
  "ask-nexus-input": {
    componentName: "AskNexusInput",
    importPath: "@/components/ask-nexus-input",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Title", options: ["Ask Nexus UI anything", "Ask the docs", "What's on your mind?"], defaultValue: "Ask Nexus UI anything" },
      { kind: "range", prop: "placeholderInterval", label: "Rotate every", min: 1200, max: 5000, step: 100, unit: "ms", defaultValue: 2800 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AskNexusInput
        key={String(v.autoplay)}
        title={v.title as string}
        placeholderInterval={v.placeholderInterval as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "background-gradient": {
    componentName: "BackgroundGradient",
    importPath: "@/components/background-gradient",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "animationSpeed", label: "Spin", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "range", prop: "ringWidth", label: "Ring", min: 1, max: 6, step: 0.5, unit: "px", defaultValue: 1.5 },
      { kind: "range", prop: "blur", label: "Glow blur", min: 0, max: 48, step: 2, unit: "px", defaultValue: 24 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[320px] text-[#1d1d1f] dark:text-[#f5f5f7]">
        <BackgroundGradient
          key={String(v.autoplay)}
          className="w-full"
          containerClassName="p-6"
          animationSpeed={v.animationSpeed as number}
          ringWidth={v.ringWidth as number}
          blur={v.blur as number}
          autoplay={v.autoplay as boolean}
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#6e6e73] dark:text-[#a1a1a6]">Pro</p>
            <span className="rounded-full bg-[#0071e3]/10 px-2 py-0.5 text-[11px] font-semibold text-[#0066cc] dark:bg-[#0a84ff]/20 dark:text-[#64b5ff]">Popular</span>
          </div>
          <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.045em] tabular-nums">
            $18<span className="text-[15px] font-medium tracking-normal text-[#6e6e73] dark:text-[#a1a1a6]"> / month</span>
          </p>
          <p className="mt-3 text-[14px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">Unlimited projects, team seats and priority builds.</p>
        </BackgroundGradient>
      </div>
    ),
  },
  "beam-sweep-field": {
    lightOnly: true,
    componentName: "BeamField",
    importPath: "@/components/beam-sweep-field",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Beam", options: ["#67e8f9", "#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#67e8f9" },
      { kind: "range", prop: "beams", label: "Beams", min: 1, max: 5, step: 1, defaultValue: 3 },
      { kind: "range", prop: "speed", label: "Sweep", min: 4, max: 20, step: 1, unit: "s", defaultValue: 11 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <BeamField
        key={String(v.autoplay)}
        color={v.color as string}
        beams={v.beams as number}
        speed={v.speed as number}
        autoplay={v.autoplay as boolean}
        className="min-h-[400px] max-w-[960px]"
      />
    ),
  },
  "card-carousel-3d": {
    componentName: "CardCarousel3D",
    importPath: "@/components/card-carousel-3d",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "itemWidth", label: "Card width", min: 140, max: 220, step: 4, unit: "px", defaultValue: 168 },
      { kind: "range", prop: "perspective", label: "Perspective", min: 600, max: 1800, step: 50, unit: "px", defaultValue: 1100 },
      { kind: "toggle", prop: "autoRotate", label: "Drift", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CardCarousel3D
        key={String(v.autoplay)}
        itemWidth={v.itemWidth as number}
        perspective={v.perspective as number}
        autoRotate={v.autoRotate as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "card-stack-rotator": {
    componentName: "CardStackRotator",
    importPath: "@/components/card-stack-rotator",
    snippetBaseProps: ["cards={cards}"],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "stackOffset", label: "Peek", min: 0, max: 30, step: 1, unit: "px", defaultValue: 14 },
      { kind: "range", prop: "maxVisible", label: "Visible", min: 1, max: 4, step: 1, defaultValue: 3 },
      { kind: "select", prop: "direction", label: "Throw", options: ["forward", "backward"], defaultValue: "forward" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CardStackRotator
        key={String(v.autoplay)}
        cards={[
          { id: "c1", content: "We shipped the new onboarding in **three days**. The stack alone got more replies than the launch email.", name: "Sana Whitfield", designation: "Head of Design", company: "Pebblework" },
          { id: "c2", content: "The motion is **tuned, not decorated**. It feels like the product, not a demo of a library.", name: "Diego Marchetti", designation: "Staff Engineer", company: "Northwake" },
          { id: "c3", content: "Swapped our carousel for this and **time on page doubled**. People flick through every single card.", name: "Hana Ito", designation: "Growth Lead", company: "Tidepool" },
          { id: "c4", content: "Keyboard, screen reader and reduced motion all **just worked** in review. That never happens.", name: "Owen Abara", designation: "Accessibility Lead", company: "Brightfold" },
        ]}
        cardWidth="400px"
        stackOffset={v.stackOffset as number}
        maxVisible={v.maxVisible as number}
        direction={v.direction as "forward"}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "chat-messages": {
    componentName: "ChatMessages",
    importPath: "@/components/chat-messages",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Name", options: ["Nexus AI", "Support", "Maya"], defaultValue: "Nexus AI" },
      { kind: "range", prop: "typingDuration", label: "Typing", min: 400, max: 3000, step: 100, unit: "ms", defaultValue: 1300 },
      { kind: "toggle", prop: "showReplay", label: "Replay button", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ChatMessages
        key={String(v.autoplay)}
        title={v.title as string}
        typingDuration={v.typingDuration as number}
        showReplay={v.showReplay as boolean}
        autoplay={v.autoplay as boolean}
        className="h-[350px]"
      />
    ),
  },
  "cinematic-card-deck": {
    lightOnly: true,
    componentName: "CinematicCardDeck",
    importPath: "@/components/cinematic-card-deck",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "intensity", label: "Intensity", options: ["subtle", "standard", "cinematic"], defaultValue: "standard" },
      { kind: "select", prop: "exitDirection", label: "Peel", options: ["up", "down"], defaultValue: "up" },
      { kind: "toggle", prop: "showAmbientGlow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CinematicCardDeck
        key={String(v.autoplay)}
        intensity={v.intensity as "standard"}
        exitDirection={v.exitDirection as "up"}
        showAmbientGlow={v.showAmbientGlow as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "circular-carousel": {
    componentName: "CircularCarousel",
    importPath: "@/components/circular-carousel",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "autoPlayInterval", label: "Step every", min: 1000, max: 5000, step: 100, unit: "ms", defaultValue: 2600 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <CircularCarousel key={String(v.autoplay)} autoPlayInterval={v.autoPlayInterval as number} autoplay={v.autoplay as boolean} />
    ),
  },
  "code-block": {
    lightOnly: true,
    componentName: "CodeBlock",
    importPath: "@/components/code-block",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light", "auto"], defaultValue: "dark" },
      { kind: "toggle", prop: "hoverHighlight", label: "Glide bar", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[540px]" style={{ height: 340 }}>
        <CodeBlock
          key={String(v.autoplay)}
          theme={v.theme as "dark"}
          hoverHighlight={v.hoverHighlight as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  compare: {
    lightOnly: true,
    componentName: "Compare",
    importPath: "@/components/compare",
    snippetBaseProps: ['beforeLabel="Original"', 'afterLabel="Graded"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "initialPosition", label: "Start at", min: 5, max: 95, step: 1, unit: "%", defaultValue: 50 },
      { kind: "select", prop: "mode", label: "Mode", options: ["drag", "hover"], defaultValue: "drag" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <Compare
        key={`${v.initialPosition}-${v.autoplay}`}
        beforeLabel="Original"
        afterLabel="Graded"
        initialPosition={v.initialPosition as number}
        mode={v.mode as "drag"}
        autoplay={v.autoplay as boolean}
        className="max-w-[400px]"
      />
    ),
  },
  "cursor-text-reveal": {
    componentName: "CursorTextReveal",
    importPath: "@/components/cursor-text-reveal",
    snippetBaseProps: ['baseText="The first rule of motion is clarity."', 'revealText="The second rule is feeling."'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "mode", label: "Lens", options: ["text", "image"], defaultValue: "text" },
      { kind: "range", prop: "maskSize", label: "Lens size", min: 60, max: 180, step: 2, unit: "px", defaultValue: 120 },
      { kind: "toggle", prop: "enableGlow", label: "Ring", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <CursorTextReveal
          key={String(v.autoplay)}
          baseText="The first rule of motion is clarity."
          revealText="The second rule is feeling."
          mode={v.mode as "text"}
          maskSize={v.maskSize as number}
          enableGlow={v.enableGlow as boolean}
          autoplay={v.autoplay as boolean}
          fontSize="40px"
          containerClassName="min-h-[260px] sm:min-h-[280px]"
        />
      </div>
    ),
  },
  "depth-testimonials": {
    componentName: "DepthTestimonials",
    importPath: "@/components/depth-testimonials",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "heading", label: "Heading", options: ["Loved by people who ship", "Wall of love", "What teams say"], defaultValue: "Loved by people who ship" },
      { kind: "select", prop: "eyebrow", label: "Eyebrow", options: ["Testimonials", "Reviews", "Customers"], defaultValue: "Testimonials" },
      { kind: "range", prop: "interval", label: "Auto-advance", min: 0, max: 6000, step: 500, unit: "ms", defaultValue: 0 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DepthTestimonials
        key={String(v.autoplay)}
        heading={v.heading as string}
        eyebrow={v.eyebrow as string}
        interval={v.interval as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "draggable-card-stack": {
    lightOnly: true,
    componentName: "DraggableCardStack",
    importPath: "@/components/draggable-card-stack",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "maxRotation", label: "Tilt", min: 0, max: 20, step: 1, unit: "°", defaultValue: 9 },
      { kind: "range", prop: "stackOffset", label: "Offset", min: 0, max: 24, step: 1, unit: "px", defaultValue: 0 },
      { kind: "toggle", prop: "showOverlay", label: "Captions", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DraggableCardStack
        key={String(v.autoplay)}
        maxRotation={v.maxRotation as number}
        stackOffset={v.stackOffset as number}
        showOverlay={v.showOverlay as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "expandable-cards": {
    componentName: "ExpandableCards",
    importPath: "@/components/expandable-cards",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "expandInto", label: "Open into", options: ["grid", "viewport"], defaultValue: "grid" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // Autoplay only runs in grid mode: in viewport mode each step would open a page-wide dialog and lock scrolling.
    render: (v) => (
      <ExpandableCards
        key={`${v.expandInto}-${v.autoplay}`}
        expandInto={v.expandInto as "grid"}
        autoplay={(v.autoplay as boolean) && v.expandInto === "grid"}
        className="max-w-[580px]"
      />
    ),
  },
  "floating-dock": {
    componentName: "FloatingDock",
    importPath: "@/components/floating-dock",
    snippetBaseProps: ["items={items}", 'position="inline"', "disableLinks"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "activeHref", label: "Running", options: ["none", "#finder", "#messages", "#music", "#photos"], defaultValue: "none" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative flex h-[300px] w-full max-w-[640px] items-end justify-center overflow-hidden rounded-[24px] bg-white pb-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.9)]">
        <div
          aria-hidden
          className="absolute inset-0 rounded-[24px] opacity-90 dark:opacity-60"
          style={{
            background:
              "radial-gradient(70% 60% at 20% 20%, rgba(90,200,250,.45), transparent 70%), radial-gradient(60% 60% at 85% 30%, rgba(191,90,242,.35), transparent 70%), radial-gradient(70% 60% at 50% 100%, rgba(255,159,10,.3), transparent 70%)",
          }}
        />
        <div className="relative">
          <FloatingDock
            key={String(v.autoplay)}
            items={[
              { title: "Finder", icon: <DockFolderOpen />, href: "#finder", tint: "linear-gradient(160deg,#64d2ff,#0071e3)" },
              { title: "Safari", icon: <DockCompass />, href: "#safari", tint: "linear-gradient(160deg,#5ac8fa,#0a84ff)" },
              { title: "Messages", icon: <DockMessageCircle />, href: "#messages", tint: "linear-gradient(160deg,#5ef08a,#30b94d)", badge: 3 },
              { title: "Mail", icon: <DockMail />, href: "#mail", tint: "linear-gradient(160deg,#6ac4ff,#1a73e8)" },
              { title: "Music", icon: <DockMusic />, href: "#music", tint: "linear-gradient(160deg,#ff7a8a,#ff2d55)" },
              { title: "Photos", icon: <DockCamera />, href: "#photos", tint: "linear-gradient(160deg,#ffd60a,#ff9f0a)" },
              { title: "Calendar", icon: <DockCalendar />, href: "#calendar" },
              { title: "Settings", icon: <DockSettings />, href: "#settings", tint: "linear-gradient(160deg,#aeaeb2,#636366)" },
            ]}
            position="inline"
            disableLinks
            activeHref={v.activeHref === "none" ? undefined : (v.activeHref as string)}
            autoplay={v.autoplay as boolean}
          />
        </div>
      </div>
    ),
  },
  "forge-ai-command-bar": {
    componentName: "AiCommandBar",
    importPath: "@/components/forge-ai-command-bar",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultMode", label: "Start in", options: ["ask", "edit", "build"], defaultValue: "build" },
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["Describe what you need...", "Ask the copilot...", "What should we build?"], defaultValue: "Describe what you need..." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    // hotkey="" keeps Cmd/Ctrl+K free for the site's own search on the docs page.
    render: (v) => (
      <div className="w-full max-w-[520px]">
        <AiCommandBar
          key={`${v.defaultMode}-${v.autoplay}`}
          defaultMode={v.defaultMode as "build"}
          placeholder={v.placeholder as string}
          autoplay={v.autoplay as boolean}
          hotkey=""
        />
      </div>
    ),
  },
  "glass-login-stack": {
    componentName: "GlassLogin",
    importPath: "@/components/glass-login-stack",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "brand", label: "Brand", options: ["Halo", "Orbit", "Nexus"], defaultValue: "Halo" },
      { kind: "select", prop: "title", label: "Title", options: ["Welcome back", "Sign in", "Good to see you"], defaultValue: "Welcome back" },
      { kind: "toggle", prop: "backdrop", label: "Aurora backdrop", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[720px] justify-center">
        <GlassLogin
          key={String(v.autoplay)}
          brand={v.brand as string}
          title={v.title as string}
          backdrop={v.backdrop as boolean}
          autoplay={v.autoplay as boolean}
          onSignUp={() => {}}
        />
      </div>
    ),
  },
  "glowing-effect-cards": {
    componentName: "GlowingCardsLayout",
    importPath: "@/components/glowing-effect-cards",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "hint", label: "Caption", options: ["Move across the cards.", "Hover a card.", ""], defaultValue: "Move across the cards." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GlowingCardsLayout key={String(v.autoplay)} hint={v.hint as string} autoplay={v.autoplay as boolean} className="max-w-[560px]" />
    ),
  },
  "hover-highlight-text": {
    componentName: "HoverHighlightText",
    importPath: "@/components/hover-highlight-text",
    snippetBaseProps: ['text="Build interfaces people remember long after they close the tab."'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "markerColor", label: "Marker", options: ["#ffd60a", "#0071e355", "#30b15855", "#ff375f55", "#bf5af255"], defaultValue: "#ffd60a" },
      { kind: "range", prop: "reach", label: "Reach", min: 8, max: 140, step: 2, unit: "px", defaultValue: 40 },
      { kind: "range", prop: "linger", label: "Linger", min: 0.1, max: 3, step: 0.1, unit: "s", defaultValue: 0.9 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[520px] justify-center">
        <HoverHighlightText
          key={String(v.autoplay)}
          text="Build interfaces people remember long after they close the tab."
          baseClassName="max-w-[15ch] text-[36px] sm:text-[44px]"
          markerColor={v.markerColor === "#ffd60a" ? undefined : (v.markerColor as string)}
          reach={v.reach as number}
          linger={v.linger as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "images-badge": {
    componentName: "ImagesBadge",
    importPath: "@/components/images-badge",
    snippetBaseProps: ["images={team}", 'label="Editing now"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "select", prop: "shape", label: "Shape", options: ["circle", "rounded", "square"], defaultValue: "circle" },
      { kind: "range", prop: "revealCount", label: "Fan out", min: 0, max: 5, step: 1, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ImagesBadge
        key={String(v.autoplay)}
        images={DEMO_BADGE_TEAM}
        label="Editing now"
        size={v.size as "md"}
        shape={v.shape as "circle"}
        revealCount={v.revealCount as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "infinite-moving-cards": {
    componentName: "InfiniteMovingCards",
    importPath: "@/components/infinite-moving-cards",
    snippetBaseProps: ["items={items}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "direction", label: "Direction", options: ["left", "right"], defaultValue: "left" },
      { kind: "select", prop: "speed", label: "Speed", options: ["slow", "normal", "fast"], defaultValue: "normal" },
      { kind: "range", prop: "gap", label: "Gap", min: 4, max: 40, step: 2, unit: "px", defaultValue: 16 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[720px]">
        <InfiniteMovingCards
          key={String(v.autoplay)}
          items={DEMO_MOVING_CARDS}
          cardClassName="w-[290px]"
          direction={v.direction as "left"}
          speed={v.speed as "normal"}
          gap={v.gap as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "interactive-globe-explorer": {
    componentName: "InteractiveGlobeExplorer",
    importPath: "@/components/interactive-globe-explorer",
    snippetBaseProps: ['className="h-[420px]"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Our offices", "Where we work", "Find us"], defaultValue: "Our offices" },
      // ids from the built-in list: 4 London, 6 Tokyo, 3 New York, 8 Sydney, 11 Mumbai
      { kind: "select", prop: "initialLocationId", label: "First city (id)", options: ["4", "6", "3", "8", "11"], defaultValue: "4" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <InteractiveGlobeExplorer
        key={`${v.initialLocationId}-${v.autoplay}`}
        className="h-[420px] max-w-[720px]"
        title={v.title as string}
        initialLocationId={v.initialLocationId as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "link-preview": {
    componentName: "LinkPreview",
    importPath: "@/components/link-preview",
    snippetBaseProps: ['href="https://motion.dev/docs/react-transitions"', 'title="Transitions"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "width", label: "Card width", min: 200, max: 380, step: 10, unit: "px", defaultValue: 300 },
      { kind: "range", prop: "height", label: "Picture height", min: 90, max: 220, step: 2, unit: "px", defaultValue: 168 },
      { kind: "range", prop: "delay", label: "Delay", min: 0, max: 0.8, step: 0.02, unit: "s", defaultValue: 0.08 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex h-full min-h-[360px] w-full items-end justify-center pb-16">
        <p className="max-w-[440px] text-center text-[21px] font-medium leading-[1.45] tracking-[-0.02em]">
          Read the{" "}
          <LinkPreview
            key={String(v.autoplay)}
            href="https://motion.dev/docs/react-transitions"
            title="Transitions"
            description="Springs, tweens and inertia, and when to use each."
            width={v.width as number}
            height={v.height as number}
            delay={v.delay as number}
            autoplay={v.autoplay as boolean}
          >
            spring guide
          </LinkPreview>{" "}
          before you tune the motion, then ship it.
        </p>
      </div>
    ),
  },
  "mac-keyboard": {
    componentName: "MacKeyboard",
    importPath: "@/components/keyboard",
    snippetBaseProps: ["listen"],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accent", label: "Backlight", options: ["#0a84ff", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0a84ff" },
      { kind: "select", prop: "theme", label: "Finish", options: ["auto", "light", "dark"], defaultValue: "auto" },
      { kind: "select", prop: "layout", label: "Layout", options: ["mac", "compact"], defaultValue: "mac" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[600px]">
        <MacKeyboard
          key={String(v.autoplay)}
          accent={v.accent as string}
          theme={v.theme as "auto"}
          layout={v.layout as "mac"}
          autoplay={v.autoplay as boolean}
          listen
        />
      </div>
    ),
  },
  // REPLACES the existing `meteors` entry: its "stars" control had defaultValue 60 while the
  // component default is 0 (snippet dropped stars={60}), and it had no autoplay control.
  meteors: {
    fillStage: true,
    componentName: "Meteors",
    importPath: "@/components/meteors",
    snippetBaseProps: ['className="absolute inset-0"'],
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "number", label: "Meteors", min: 4, max: 60, step: 1, defaultValue: 18 },
      { kind: "range", prop: "angle", label: "Angle", min: 180, max: 270, step: 1, unit: "°", defaultValue: 215 },
      { kind: "range", prop: "maxDuration", label: "Max duration", min: 2, max: 12, step: 0.1, unit: "s", defaultValue: 7.2 },
      { kind: "range", prop: "stars", label: "Stars", min: 0, max: 160, step: 10, defaultValue: 0 },
      { kind: "color", prop: "color", label: "Color", options: ["#cfe6ff", "#c4b5fd", "#fda4af", "#ffd60a", "#64d2ff"], defaultValue: "#cfe6ff" },
      { kind: "select", prop: "intensity", label: "Intensity", options: ["low", "medium", "high"], defaultValue: "medium" },
      { kind: "toggle", prop: "glow", label: "Glow", defaultValue: true },
      { kind: "toggle", prop: "interactive", label: "Gravity and strikes", defaultValue: true },
      { kind: "toggle", prop: "hoverOnly", label: "Only on hover", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <Meteors
        key={String(v.autoplay)}
        className="absolute inset-0"
        number={v.number as number}
        angle={v.angle as number}
        maxDuration={v.maxDuration as number}
        minDuration={Math.min(3.2, (v.maxDuration as number) - 0.5)}
        stars={v.stars as number}
        color={v.color as string}
        intensity={v.intensity as "medium"}
        glow={v.glow as boolean}
        interactive={v.interactive as boolean}
        hoverOnly={v.hoverOnly as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "milestone-timeline": {
    componentName: "MilestoneTimeline",
    importPath: "@/components/milestone-timeline",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "heading", label: "Heading", options: ["Roadmap", "Our journey", "What's next"], defaultValue: "Roadmap" },
      // Unset, the current milestone (index 2 in the built-in list) opens first.
      { kind: "range", prop: "defaultOpen", label: "Open first", min: 0, max: 3, step: 1, defaultValue: 2 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MilestoneTimeline
        key={`${v.defaultOpen}-${v.autoplay}`}
        className="max-w-[640px]"
        heading={v.heading as string}
        defaultOpen={v.defaultOpen as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "motion-layer-scroller": {
    componentName: "MotionLayerScroller",
    importPath: "@/components/motion-layer-scroller",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "direction", label: "Direction", options: ["vertical", "horizontal"], defaultValue: "vertical" },
      { kind: "range", prop: "scrollHeight", label: "Height", min: 260, max: 480, step: 10, unit: "px", defaultValue: 420 },
      { kind: "toggle", prop: "showGrid", label: "Grid", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[560px]">
        <MotionLayerScroller
          key={`${v.direction}-${v.autoplay}`}
          direction={v.direction as "vertical"}
          scrollHeight={v.scrollHeight as number}
          showGrid={v.showGrid as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "nebula-glass-card": {
    componentName: "NebulaGlassCard",
    importPath: "@/components/nebula-glass-card",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "tiltStrength", label: "Tilt", min: 0, max: 24, step: 1, unit: "°", defaultValue: 12 },
      { kind: "select", prop: "title", label: "Title", options: ["Render anywhere", "Ship at the edge", "Built for speed"], defaultValue: "Render anywhere" },
      { kind: "select", prop: "cta", label: "Button", options: ["Upgrade", "Start free", "Deploy now"], defaultValue: "Upgrade" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <NebulaGlassCard
        key={String(v.autoplay)}
        tiltStrength={v.tiltStrength as number}
        title={v.title as string}
        cta={v.cta as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "orbital-loader": {
    componentName: "OrbitalLoader",
    importPath: "@/components/orbital-loader",
    snippetBaseProps: ['messages={["Uploading your files", "Checking for duplicates", "Making thumbnails"]}', 'doneMessage="All 24 files uploaded"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Size", min: 64, max: 180, step: 4, unit: "px", defaultValue: 112 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <OrbitalLoader
        key={String(v.autoplay)}
        messages={["Uploading your files", "Checking for duplicates", "Making thumbnails"]}
        doneMessage="All 24 files uploaded"
        color={v.color === "#0071e3" ? undefined : (v.color as string)}
        size={v.size as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "phone-input": {
    componentName: "PhoneInput",
    importPath: "@/components/phone-input",
    snippetBaseProps: ['label="Mobile number"'],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "defaultCountry", label: "Country", options: ["US", "GB", "IN", "JP", "DE", "BR"], defaultValue: "US" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[340px]">
        <PhoneInput
          key={`${v.defaultCountry}-${v.autoplay}`}
          label="Mobile number"
          defaultCountry={v.defaultCountry as string}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "profile-orbit": {
    componentName: "ProfileOrbit",
    importPath: "@/components/profile-orbit",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "autoRotateInterval", label: "Step every", min: 1200, max: 6000, step: 100, unit: "ms", defaultValue: 2800 },
      { kind: "select", prop: "hint", label: "Hint", options: ["Drag the ring or tap a face.", "Meet the team.", ""], defaultValue: "Drag the ring or tap a face." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ProfileOrbit
        key={String(v.autoplay)}
        autoRotateInterval={v.autoRotateInterval as number}
        hint={v.hint as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "pulse-dashboard-kpis": {
    componentName: "KpiStrip",
    importPath: "@/components/pulse-dashboard-kpis",
    defaultFill: "light",
    controls: [
      // Unset, the first built-in period ("7d") is selected.
      { kind: "select", prop: "defaultPeriod", label: "Period", options: ["7d", "30d", "90d"], defaultValue: "7d" },
      { kind: "select", prop: "title", label: "Title", options: ["This week at a glance", "Growth pulse", "Key metrics"], defaultValue: "This week at a glance" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <KpiStrip
        key={`${v.defaultPeriod}-${v.autoplay}`}
        className="max-w-[900px]"
        defaultPeriod={v.defaultPeriod as string}
        title={v.title as string}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "real-time-cursors": {
    componentName: "RealTimeCursors",
    importPath: "@/components/real-time-cursors",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "youColor", label: "Your colour", options: ["#30d158", "#0071e3", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#30d158" },
      { kind: "select", prop: "title", label: "Board", options: ["Launch board", "Sprint 42", "Brand refresh"], defaultValue: "Launch board" },
      { kind: "toggle", prop: "showYou", label: "Show you", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <RealTimeCursors
        key={String(v.autoplay)}
        youColor={v.youColor as string}
        title={v.title as string}
        showYou={v.showYou as boolean}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "scroll-progress-bar": {
    componentName: "ScrollProgressBar",
    importPath: "@/components/scroll-progress-bar",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "fillColor", label: "Fill", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "orientation", label: "Orientation", options: ["vertical", "horizontal"], defaultValue: "vertical" },
      { kind: "range", prop: "markerCount", label: "Milestones", min: 2, max: 8, step: 1, defaultValue: 4 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className={v.orientation === "horizontal" ? "w-full max-w-[420px]" : undefined}>
        <ScrollProgressBar
          key={String(v.autoplay)}
          fillColor={v.fillColor === "#0071e3" ? undefined : (v.fillColor as string)}
          orientation={v.orientation as "vertical"}
          markerCount={v.markerCount as number}
          autoplay={v.autoplay as boolean}
          ariaLabel="Article progress"
        />
      </div>
    ),
  },
  "scroll-reveal-text": {
    componentName: "ScrollRevealText",
    importPath: "@/components/scroll-reveal-text",
    snippetBaseProps: ['text="We design tools that people actually want to open every single morning."', 'fontSize="30px"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "accentColor", label: "Accent", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "select", prop: "mode", label: "Reveal by", options: ["word", "character", "line"], defaultValue: "word" },
      { kind: "range", prop: "blurAmount", label: "Blur", min: 0, max: 16, step: 1, unit: "px", defaultValue: 6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[460px]">
        <ScrollRevealText
          key={`${v.autoplay}-${v.mode}`}
          text="We design tools that people actually want to open every single morning."
          fontSize="30px"
          accentColor={v.accentColor === "#0071e3" ? undefined : (v.accentColor as string)}
          mode={v.mode as "word"}
          blurAmount={v.blurAmount as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "shader-flow": {
    lightOnly: true,
    componentName: "ShaderFlow",
    importPath: "@/components/shader-flow",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "intensity", label: "Intensity", options: ["low", "medium", "high"], defaultValue: "medium" },
      { kind: "range", prop: "speed", label: "Speed", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "cursorReactive", label: "Stir with pointer", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <React.Suspense fallback={null}>
        <ShaderFlow
          key={String(v.autoplay)}
          className="min-h-[400px] w-full max-w-[960px]"
          intensity={v.intensity as "medium"}
          speed={v.speed as number}
          cursorReactive={v.cursorReactive as boolean}
          autoplay={v.autoplay as boolean}
        />
      </React.Suspense>
    ),
  },
  "signup-form": {
    componentName: "SignupForm",
    importPath: "@/components/signup-form",
    snippetBaseProps: ['subtitle="Start free. No card needed."'],
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "showNameField", label: "Name fields", defaultValue: true },
      { kind: "toggle", prop: "showConfirmPasswordField", label: "Confirm password", defaultValue: true },
      { kind: "toggle", prop: "showSocialLogins", label: "Social buttons", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[420px] justify-center">
        <SignupForm
          key={`${v.autoplay}-${v.showNameField}-${v.showConfirmPasswordField}`}
          subtitle="Start free. No card needed."
          showNameField={v.showNameField as boolean}
          showConfirmPasswordField={v.showConfirmPasswordField as boolean}
          showSocialLogins={v.showSocialLogins as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "spectra-frame": {
    lightOnly: true,
    componentName: "SpectraFrame",
    importPath: "@/components/spectra-frame",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "columns", label: "Columns", min: 2, max: 4, step: 1, defaultValue: 4 },
      { kind: "range", prop: "borderRadius", label: "Radius", min: 0, max: 28, step: 1, unit: "px", defaultValue: 16 },
      { kind: "range", prop: "grayscaleIntensity", label: "Greyscale", min: 0, max: 100, step: 5, unit: "%", defaultValue: 100 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full max-w-[540px]">
        <SpectraFrame
          key={String(v.autoplay)}
          columns={v.columns as number}
          borderRadius={v.borderRadius as number}
          grayscaleIntensity={v.grayscaleIntensity as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "squiggly-text": {
    componentName: "SquigglyText",
    importPath: "@/components/squiggly-text",
    snippetBaseProps: ['text="a little life"', "underline"],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "underlineColor", label: "Underline", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "stepDuration", label: "Frame time", min: 30, max: 240, step: 10, unit: "ms", defaultValue: 80 },
      { kind: "range", prop: "baseFrequency", label: "Wiggle", min: 0.005, max: 0.06, step: 0.001, defaultValue: 0.02 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SquigglyText
        key={String(v.autoplay)}
        text="a little life"
        underline
        underlineColor={v.underlineColor === "#0071e3" ? undefined : (v.underlineColor as string)}
        stepDuration={v.stepDuration as number}
        baseFrequency={v.baseFrequency as number}
        autoplay={v.autoplay as boolean}
        className="text-[48px] font-semibold leading-[1.06] tracking-[-0.035em] text-[#1d1d1f] sm:text-[60px] dark:text-[#f5f5f7]"
      />
    ),
  },
  "stateful-button": {
    componentName: "StatefulButton",
    importPath: "@/components/stateful-button",
    snippetBaseProps: ['loadingText="Publishing"', 'successText="Published"', "onClick={publish}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "variant", label: "Variant", options: ["default", "outline", "ghost", "destructive"], defaultValue: "default" },
      { kind: "select", prop: "size", label: "Size", options: ["sm", "md", "lg"], defaultValue: "md" },
      { kind: "toggle", prop: "showSuccess", label: "Success state", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <StatefulButton
        key={String(v.autoplay)}
        variant={v.variant as "default"}
        size={v.size as "md"}
        showSuccess={v.showSuccess as boolean}
        autoplay={v.autoplay as boolean}
        loadingText="Publishing"
        successText="Published"
        onClick={() => new Promise<void>((resolve) => setTimeout(resolve, 1400))}
      >
        Publish post
      </StatefulButton>
    ),
  },
  "svg-noise-shader": {
    lightOnly: true,
    componentName: "SvgNoise",
    importPath: "@/components/svg-noise-shader",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "grain", label: "Grain", min: 0, max: 1, step: 0.05, defaultValue: 0.35 },
      { kind: "range", prop: "distortion", label: "Melt", min: 0, max: 200, step: 5, unit: "px", defaultValue: 90 },
      { kind: "range", prop: "speed", label: "Flow speed", min: 0.2, max: 3, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SvgNoise
        key={String(v.autoplay)}
        grain={v.grain as number}
        distortion={v.distortion as number}
        speed={v.speed as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  terminal: {
    lightOnly: true,
    componentName: "Terminal",
    importPath: "@/components/terminal",
    snippetBaseProps: ["commands={commands}"],
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "theme", label: "Theme", options: ["carbon", "midnight", "paper"], defaultValue: "carbon" },
      { kind: "range", prop: "typingSpeed", label: "Typing", min: 10, max: 100, step: 2, unit: "ms", defaultValue: 34 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex h-[360px] w-full max-w-[560px] flex-col">
        <Terminal
          key={`${v.autoplay}-${v.typingSpeed}`}
          fillHeight
          className="min-h-0 flex-1"
          commands={DEMO_TERMINAL_SCRIPT}
          theme={v.theme as "carbon"}
          typingSpeed={v.typingSpeed as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "text-reveal-card": {
    componentName: "TextRevealCard",
    importPath: "@/components/text-reveal-card",
    snippetBaseProps: ['title="Launch review"'],
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "intensity", label: "Sparks", min: 0.5, max: 2.2, step: 0.1, unit: "×", defaultValue: 1 },
      { kind: "toggle", prop: "disabled", label: "Show revealed", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TextRevealCard
        key={`${v.autoplay}-${v.disabled}`}
        title="Launch review"
        intensity={v.intensity as number}
        disabled={v.disabled as boolean}
        autoplay={v.autoplay as boolean}
        className="max-w-[440px]"
      />
    ),
  },
  "three-d-folder": {
    componentName: "ThreeDFolder",
    importPath: "@/components/three-d-folder",
    snippetBaseProps: ['title="Launch Assets"'],
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "folderBackColor", label: "Back", options: ["#3d9cf0", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#3d9cf0" },
      { kind: "color", prop: "folderFrontColor", label: "Front", options: ["#6cb8f6", "#5fd47f", "#ff7a93", "#d48cf7", "#ffbf4d"], defaultValue: "#6cb8f6" },
      { kind: "select", prop: "size", label: "Size", options: ["md", "sm"], defaultValue: "md" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ThreeDFolder
        key={String(v.autoplay)}
        title="Launch Assets"
        folderBackColor={v.folderBackColor as string}
        folderFrontColor={v.folderFrontColor as string}
        size={v.size as "md"}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "tracing-spotlight-panel": {
    componentName: "TracingSpotlightPanel",
    importPath: "@/components/tracing-spotlight-panel",
    defaultFill: "light",
    controls: [
      { kind: "color", prop: "color", label: "Light", options: ["#0071e3", "#30b158", "#ff375f", "#bf5af2", "#ff9f0a"], defaultValue: "#0071e3" },
      { kind: "range", prop: "size", label: "Spotlight", min: 120, max: 420, step: 10, unit: "px", defaultValue: 260 },
      { kind: "range", prop: "lap", label: "Lap time", min: 2, max: 12, step: 0.5, unit: "s", defaultValue: 5 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TracingSpotlightPanel
        key={String(v.autoplay)}
        color={v.color === "#0071e3" ? undefined : (v.color as string)}
        size={v.size as number}
        lap={v.lap as number}
        autoplay={v.autoplay as boolean}
        className="max-w-[320px]"
      />
    ),
  },
  "vector-tilt-scene": {
    componentName: "VectorTiltScene",
    importPath: "@/components/vector-tilt-scene",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "maxTilt", label: "Max tilt", min: 0, max: 30, step: 1, unit: "°", defaultValue: 14 },
      { kind: "range", prop: "depth", label: "Depth", min: 0, max: 60, step: 1, unit: "px", defaultValue: 26 },
      { kind: "toggle", prop: "glare", label: "Glare", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <VectorTiltScene
        key={String(v.autoplay)}
        maxTilt={v.maxTilt as number}
        depth={v.depth as number}
        glare={v.glare as boolean}
        autoplay={v.autoplay as boolean}
        className="max-w-[360px]"
      />
    ),
  },
  "warp-speed-card": {
    componentName: "WarpTextTrigger",
    importPath: "@/components/warp-speed-card",
    snippetBaseProps: ['children="warp speed"'],
    defaultFill: "light",
    controls: [
      {
        kind: "select",
        prop: "beamColor",
        label: "Stars (r,g,b)",
        options: ["255,255,255", "0,113,227", "48,177,88", "255,55,95", "191,90,242", "255,159,10"],
        defaultValue: "255,255,255",
      },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="flex w-full max-w-[480px] flex-col items-center">
        <WarpSpeedCard className="w-full">
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <h2 className="m-0 text-[36px] font-semibold leading-[1.14] tracking-[-0.035em] sm:text-[40px]">
              Build amazing websites
              <br />
              at{" "}
              <WarpTextTrigger key={String(v.autoplay)} beamColor={v.beamColor as string} autoplay={v.autoplay as boolean}>
                warp speed
              </WarpTextTrigger>
            </h2>
          </div>
        </WarpSpeedCard>
      </div>
    ),
  },
  "wheel-selector": {
    componentName: "WheelSelector",
    importPath: "@/components/wheel-selector",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "contentMode", label: "Panel", options: ["detailed", "minimal", "hidden"], defaultValue: "detailed" },
      { kind: "select", prop: "animationSpeed", label: "Snap", options: ["slow", "medium", "fast"], defaultValue: "medium" },
      { kind: "range", prop: "ringRadius", label: "Ring radius", min: 80, max: 180, step: 4, unit: "px", defaultValue: 112 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <WheelSelector
        key={String(v.autoplay)}
        contentMode={v.contentMode as "detailed"}
        animationSpeed={v.animationSpeed as "medium"}
        ringRadius={v.ringRadius as number}
        autoplay={v.autoplay as boolean}
        className="max-w-[760px]"
      />
    ),
  },
  "vinyl-player": {
    componentName: "VinylPlayer",
    importPath: "@/components/vinyl-player",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <VinylPlayer key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "ferrofluid-record": {
    componentName: "FerrofluidRecord",
    importPath: "@/components/ferrofluid-record",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Move the magnet", defaultValue: false, startOn: true }],
    render: (v) => <FerrofluidRecord key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "sand-timer": {
    componentName: "SandTimer",
    importPath: "@/components/sand-timer",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "seconds", label: "Seconds", min: 10, max: 120, step: 5, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Turn over by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SandTimer key={`${v.seconds}-${v.autoplay}`} seconds={v.seconds as number} autoplay={v.autoplay as boolean} />,
  },
  "zipper-reveal": {
    componentName: "ZipperReveal",
    importPath: "@/components/zipper-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "code", label: "Code", options: ["NXS-8F2Q-PRO", "LAUNCH-7K4M", "WELCOME-2026"], defaultValue: "NXS-8F2Q-PRO" },
      { kind: "toggle", prop: "autoplay", label: "Zip by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <ZipperReveal key={String(v.autoplay)} code={v.code as string} autoplay={v.autoplay as boolean} />,
  },
  "slingshot-send": {
    componentName: "SlingshotSend",
    importPath: "@/components/slingshot-send",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "name", label: "Contact", options: ["Maya", "Jun", "Priya"], defaultValue: "Maya" },
      { kind: "toggle", prop: "autoReply", label: "Canned replies", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Fire by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SlingshotSend key={String(v.autoplay)} name={v.name as string} autoReply={v.autoReply as boolean} autoplay={v.autoplay as boolean} />,
  },
  "domino-select": {
    componentName: "DominoSelect",
    importPath: "@/components/domino-select",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Topple by itself", defaultValue: false, startOn: true }],
    render: (v) => <DominoSelect key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "lenticular-pass": {
    lightOnly: true,
    componentName: "LenticularPass",
    importPath: "@/components/lenticular-pass",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Rock by itself", defaultValue: false, startOn: true }],
    render: (v) => <LenticularPass key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "origami-pricing": {
    componentName: "OrigamiPricing",
    importPath: "@/components/origami-pricing",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "planName", label: "Plan", options: ["Nexus Pro", "Studio", "Team"], defaultValue: "Nexus Pro" },
      { kind: "select", prop: "price", label: "Price", options: ["$9", "$19", "$49"], defaultValue: "$9" },
      { kind: "toggle", prop: "autoplay", label: "Fold by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <OrigamiPricing key={String(v.autoplay)} planName={v.planName as string} price={v.price as string} autoplay={v.autoplay as boolean} />,
  },
  "empty-projects": {
    componentName: "EmptyProjects",
    importPath: "@/components/empty-projects",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Projects", "Workspaces", "Sites"], defaultValue: "Projects" },
      { kind: "select", prop: "emptyTitle", label: "Headline", options: ["No projects yet", "Nothing here yet", "Start your first project"], defaultValue: "No projects yet" },
      { kind: "select", prop: "emptyDescription", label: "Subline", options: ["Pick a starting point. You can change everything later.", "Choose a template to get going.", "It takes about a minute."], defaultValue: "Pick a starting point. You can change everything later." },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyProjects key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        emptyTitle={v.emptyTitle as string}
        emptyDescription={v.emptyDescription as string}
      />
    ),
  },
  "no-results": {
    componentName: "NoResults",
    importPath: "@/components/no-results",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "query", label: "Search", options: ["invoce march", "invioce q3", "invoice march"], defaultValue: "invoce march" },
      { kind: "range", prop: "maxRows", label: "Max rows", min: 1, max: 6, step: 1, defaultValue: 6 },
      { kind: "select", prop: "noun", label: "Noun", options: ["invoices", "bills", "payments"], defaultValue: "invoices" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <NoResults key={`${String(v.autoplay)}-${String(v.query)}`} autoplay={v.autoplay as boolean}
        query={v.query as string}
        noun={v.noun as string}
        maxRows={v.maxRows as number}
      />
    ),
  },
  "empty-chart": {
    componentName: "EmptyChart",
    importPath: "@/components/empty-chart",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Caption", options: ["Revenue, last 12 months", "Sales, last 12 months", "Sign-ups, last 12 months"], defaultValue: "Revenue, last 12 months" },
      { kind: "select", prop: "prefix", label: "Prefix", options: ["$", "€", "£"], defaultValue: "$" },
      { kind: "select", prop: "suffix", label: "Suffix", options: ["k", "m", ""], defaultValue: "k" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyChart key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        prefix={v.prefix as string}
        suffix={v.suffix as string}
      />
    ),
  },
  "empty-team": {
    componentName: "EmptyTeam",
    importPath: "@/components/empty-team",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "seats", label: "Seats", min: 3, max: 8, step: 1, defaultValue: 6 },
      { kind: "select", prop: "domain", label: "Domain", options: ["orbitly.com", "fernhill.io", "vela.app"], defaultValue: "orbitly.com" },
      { kind: "select", prop: "placeholder", label: "Placeholder", options: ["name@company.com", "teammate@company.com", "Invite by email"], defaultValue: "name@company.com" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <EmptyTeam key={`${String(v.autoplay)}-${String(v.domain)}-${String(v.placeholder)}-${String(v.seats)}`} autoplay={v.autoplay as boolean}
        seats={v.seats as number}
        domain={v.domain as string}
        placeholder={v.placeholder as string}
      />
    ),
  },
  "streaming-answer": {
    componentName: "StreamingAnswer",
    importPath: "@/components/streaming-answer",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "thoughtSeconds", label: "Thought for", min: 1, max: 30, step: 1, unit: "s", defaultValue: 4 },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <StreamingAnswer key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        thoughtSeconds={v.thoughtSeconds as number}
        width={v.width as number}
      />
    ),
  },
  "diff-review": {
    componentName: "DiffReview",
    importPath: "@/components/diff-review",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Label", options: ["Homepage · Hero copy", "Pricing · Plan blurb", "Docs · Intro"], defaultValue: "Homepage · Hero copy" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <DiffReview key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        title={v.title as string}
        width={v.width as number}
      />
    ),
  },
  "agent-run": {
    componentName: "AgentRun",
    importPath: "@/components/agent-run",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "task", label: "Task", options: ["Fix the failing checkout test", "Repair the flaky cart test", "Unbreak the discount tests"], defaultValue: "Fix the failing checkout test" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <AgentRun key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        task={v.task as string}
        width={v.width as number}
      />
    ),
  },
  "ghost-autocomplete": {
    componentName: "GhostAutocomplete",
    importPath: "@/components/ghost-autocomplete",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "to", label: "Recipient", options: ["leo@fieldnotes.example", "nina@fieldnotes.example", "team@fieldnotes.example"], defaultValue: "leo@fieldnotes.example" },
      { kind: "range", prop: "width", label: "Width", min: 320, max: 640, step: 10, unit: "px", defaultValue: 480 },
      { kind: "toggle", prop: "autoplay", label: "Type by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <GhostAutocomplete key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        to={v.to as string}
        width={v.width as number}
      />
    ),
  },
  "skeleton-morph": {
    componentName: "SkeletonMorph",
    importPath: "@/components/skeleton-morph",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "author", label: "Author", options: ["Maya Chen", "Leo Park", "Ines Duarte"], defaultValue: "Maya Chen" },
      { kind: "select", prop: "title", label: "Headline", options: ["Designing for the empty state", "Notes on calm interfaces", "Why loading screens lie"], defaultValue: "Designing for the empty state" },
      { kind: "color", prop: "avatarColor", label: "Avatar", options: ["#ff9f0a", "#0a84ff", "#30d158", "#bf5af2", "#ff453a"], defaultValue: "#ff9f0a" },
      { kind: "toggle", prop: "defaultReady", label: "Start loaded", defaultValue: false },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <SkeletonMorph key={`${String(v.autoplay)}${String(v.defaultReady)}`} autoplay={v.autoplay as boolean}
        author={v.author as string}
        initials={(v.author as string).split(" ").map((w) => w[0]).join("")}
        title={v.title as string}
        avatarColor={v.avatarColor as string}
        defaultReady={v.defaultReady as boolean}
      />
    ),
  },
  "morphing-dialog": {
    componentName: "MorphingDialog",
    importPath: "@/components/morphing-dialog",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "projectName", label: "Project", options: ["orbitly-site", "launch-notes", "docs-v2"], defaultValue: "orbitly-site" },
      { kind: "range", prop: "pageCount", label: "Pages", min: 1, max: 60, step: 1, defaultValue: 14 },
      { kind: "select", prop: "shareBase", label: "Share host", options: ["nexus.app/p", "share.example.com", "go.example.dev/s"], defaultValue: "nexus.app/p" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MorphingDialog key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        projectName={v.projectName as string}
        pageCount={v.pageCount as number}
        shareBase={v.shareBase as string}
      />
    ),
  },
  "travelling-tooltip": {
    componentName: "TravellingTooltip",
    importPath: "@/components/travelling-tooltip",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "openDelay", label: "First hover delay", min: 0, max: 1000, step: 50, unit: "ms", defaultValue: 450 },
      { kind: "range", prop: "warmMs", label: "Stays warm", min: 0, max: 2000, step: 100, unit: "ms", defaultValue: 600 },
      { kind: "select", prop: "label", label: "Toolbar name", options: ["Formatting", "Text tools", "Editor"], defaultValue: "Formatting" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <TravellingTooltip key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        openDelay={v.openDelay as number}
        warmMs={v.warmMs as number}
        label={v.label as string}
      />
    ),
  },
  "sound-mark": {
    lightOnly: true,
    componentName: "SoundMark",
    importPath: "@/components/sound-mark",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "word", label: "Word", options: ["sound", "studio", "listen", "nexus"], defaultValue: "sound" },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => <SoundMark key={String(v.autoplay)} autoplay={v.autoplay as boolean} word={v.word as string} />,
  },
  "ripple-now-playing": {
    componentName: "RippleNowPlaying",
    importPath: "@/components/ripple-now-playing",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <RippleNowPlaying key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "chladni-upload": {
    componentName: "ChladniUpload",
    importPath: "@/components/chladni-upload",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "fileName", label: "File name", options: ["mix-final.wav", "album-master.wav", "demo-take-3.aiff"], defaultValue: "mix-final.wav" },
      { kind: "range", prop: "fileSize", label: "File size", min: 2, max: 120, step: 0.5, unit: "MB", defaultValue: 24.6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <ChladniUpload key={String(v.autoplay)} autoplay={v.autoplay as boolean}
        fileName={v.fileName as string}
        fileSize={v.fileSize as number}
      />
    ),
  },
  "cubes-grid": {
    componentName: "CubesGrid",
    importPath: "@/components/cubes-grid",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "variant", label: "Variant", options: ["isometric", "perspective"], defaultValue: "isometric" },
      { kind: "range", prop: "amplitude", label: "Wave height", min: 0.2, max: 1.6, step: 0.05, defaultValue: 0.7 },
      { kind: "range", prop: "glow", label: "Glow", min: 0, max: 1.5, step: 0.05, defaultValue: 0.6 },
      { kind: "toggle", prop: "idleRipples", label: "Ripple by itself", defaultValue: true },
    ],
    render: (v) => (
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl" style={{ background: v.variant === "perspective" ? "#0b0b0d" : "#f5f5f4" }}>
        <CubesGrid
          key={String(v.variant)}
          variant={v.variant as "isometric" | "perspective"}
          amplitude={v.amplitude as number}
          glow={v.glow as number}
          idleRipples={v.idleRipples as boolean}
        />
      </div>
    ),
  },
  "venom-button": {
    lightOnly: true,
    componentName: "VenomButton",
    importPath: "@/components/venom-button",
    defaultFill: "light",
    controls: [
      { kind: "range", prop: "strands", label: "Strands", min: 2, max: 7, step: 1, defaultValue: 7 },
      { kind: "range", prop: "sense", label: "Sense distance", min: 120, max: 400, step: 10, unit: "px", defaultValue: 290 },
      { kind: "range", prop: "reach", label: "Grab distance", min: 60, max: 200, step: 5, unit: "px", defaultValue: 140 },
      { kind: "select", prop: "cursor", label: "Cursor", options: ["glove", "native"], defaultValue: "glove" },
      { kind: "toggle", prop: "autoplay", label: "Ghost glove", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <VenomButton
          key={`${v.strands}-${v.cursor}-${v.autoplay}`}
          strands={v.strands as number}
          sense={v.sense as number}
          reach={v.reach as number}
          release={Math.max((v.reach as number) + 40, (v.sense as number) - 60)}
          cursor={v.cursor as "glove" | "native"}
          autoplay={v.autoplay as boolean}
          height={380}
        />
      </div>
    ),
  },
  "web-sling-button": {
    lightOnly: true,
    componentName: "WebSlingButton",
    importPath: "@/components/web-sling-button",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "label", label: "Label", options: ["Get started", "Join the swarm", "Swing in", "Hang on"], defaultValue: "Get started" },
      { kind: "range", prop: "snapAt", label: "Snap point", min: 1.3, max: 4, step: 0.1, unit: "x", defaultValue: 2.3 },
      { kind: "range", prop: "height", label: "Stage height", min: 320, max: 560, step: 10, unit: "px", defaultValue: 460 },
      { kind: "toggle", prop: "autoplay", label: "Ghost shooter", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <WebSlingButton
          label={String(v.label || "Get started")}
          snapAt={v.snapAt as number}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "frost-input": {
    lightOnly: true,
    componentName: "FrostInput",
    importPath: "@/components/frost-input",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "headline", label: "Headline", options: ["Join the cold list.", "Get the first thaw.", "Keep this one cool."], defaultValue: "Join the cold list." },
      { kind: "select", prop: "done", label: "Confirmation", options: ["You’re on the list.", "Frozen in. See you soon.", "Cold storage confirmed."], defaultValue: "You’re on the list." },
      { kind: "range", prop: "height", label: "Height", unit: "px", min: 320, max: 560, step: 10, defaultValue: 420 },
      { kind: "toggle", prop: "autoplay", label: "Ghost demo", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full overflow-hidden rounded-2xl bg-[#081624] p-3">
        <FrostInput
          key={`${v.height}-${v.autoplay}`}
          headline={v.headline as string}
          done={v.done as string}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "black-hole-delete": {
    componentName: "BlackHoleDelete",
    importPath: "@/components/black-hole-delete",
    defaultFill: "dark",
    controls: [
      { kind: "select", prop: "count", label: "Messages", options: ["3", "4", "5", "6"], defaultValue: "6" },
      { kind: "range", prop: "height", label: "Height", min: 540, max: 700, step: 10, unit: "px", defaultValue: 540 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => {
      const inbox = [
        { title: "Ava Chen", body: "Design review moved to Thursday at 3?", time: "9:41", color: "#5e5ce6" },
        { title: "Build bot", body: "Deploy failed: step 4 of 7 timed out", time: "9:12", color: "#ff9f0a" },
        { title: "Marco", body: "Lunch? Ramen again or somewhere new", time: "8:55", color: "#30d158" },
        { title: "Motion Weekly", body: "Twelve interfaces that move like physics", time: "8:20", color: "#64d2ff" },
        { title: "Sam Rivera", body: "Sent the redlines, one open question on IP", time: "Tue", color: "#ff375f" },
        { title: "Flash sale", body: "48 hours left. Your cart is waiting", time: "Mon", color: "#bf5af2" },
      ];
      return (
        <div className="mx-auto w-full max-w-[720px]">
          <BlackHoleDelete
            messages={inbox.slice(0, Number(v.count) || 6)}
            height={v.height as number}
            autoplay={v.autoplay as boolean}
          />
        </div>
      );
    },
  },
  "shredder-delete": {
    lightOnly: true,
    componentName: "ShredderDelete",
    importPath: "@/components/shredder-delete",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "volume", label: "Volume", min: 0, max: 1, step: 0.05, unit: "", defaultValue: 0.7 },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <ShredderDelete key={String(v.autoplay)} autoplay={v.autoplay as boolean} volume={v.volume as number} />
      </div>
    ),
  },
  "dart-rating": {
    lightOnly: true,
    componentName: "DartRating",
    importPath: "@/components/dart-rating",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <DartRating key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "domino-progress": {
    lightOnly: true,
    componentName: "DominoProgress",
    importPath: "@/components/domino-progress",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[560px]">
        <DominoProgress key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "pumpkin-reveal": {
    componentName: "PumpkinReveal",
    importPath: "@/components/pumpkin-reveal",
    defaultFill: "dark",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <PumpkinReveal key={String(v.autoplay)} autoplay={v.autoplay as boolean} music="/audio/pumpkin-burst.mp3" />
      </div>
    ),
  },
  "catch-undo": {
    lightOnly: true,
    componentName: "CatchUndo",
    importPath: "@/components/catch-undo",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "range", prop: "height", label: "Height", min: 460, max: 640, step: 10, unit: "px", defaultValue: 560 },
      { kind: "toggle", prop: "slowHand", label: "Slow hand", defaultValue: false },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <CatchUndo key={String(v.autoplay)} autoplay={v.autoplay as boolean} height={v.height as number} slowHand={v.slowHand as boolean} />
      </div>
    ),
  },
  "global-deploy": {
    lightOnly: true,
    componentName: "GlobalDeploy",
    importPath: "@/components/global-deploy",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[760px]">
        <GlobalDeploy key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "card-reader-verify": {
    lightOnly: true,
    componentName: "CardReaderVerify",
    importPath: "@/components/card-reader-verify",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <CardReaderVerify key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "intelligence-glow": {
    lightOnly: true,
    componentName: "IntelligenceGlow",
    importPath: "@/components/intelligence-glow",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[300px]">
        <IntelligenceGlow key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "cloud-sync": {
    lightOnly: true,
    componentName: "CloudSync",
    importPath: "@/components/cloud-sync",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[480px]">
        <CloudSync key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "smart-light": {
    lightOnly: true,
    componentName: "SmartLight",
    importPath: "@/components/smart-light",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <SmartLight key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "range-calendar": {
    lightOnly: true,
    componentName: "RangeCalendar",
    importPath: "@/components/range-calendar",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <RangeCalendar key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "storage-clean": {
    lightOnly: true,
    componentName: "StorageClean",
    importPath: "@/components/storage-clean",
    defaultFill: "light",
    controls: [
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[440px]">
        <StorageClean key={String(v.autoplay)} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "ring-gallery": {
    lightOnly: true,
    blurb: "Move the controls and watch it change, or put your own photos in it. Copy code gives you a snippet with the settings you chose.",
    componentName: "RingGallery",
    importPath: "@/components/ring-gallery",
    defaultFill: "light",
    snippetBaseProps: ["items={photos}"],
    controls: [
      { kind: "range", prop: "count", label: "Cards in the ring", min: 12, max: 120, step: 1, defaultValue: 57 },
      { kind: "range", prop: "radius", label: "Ring size", min: 0.6, max: 1.1, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "cardSize", label: "Card size", min: 0.6, max: 1.6, step: 0.05, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "speed", label: "Turn speed", min: 0.4, max: 2.5, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "glide", label: "Glide", min: 0.5, max: 3, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "range", prop: "tilt", label: "Camera tilt", min: 0, max: 2, step: 0.1, unit: "x", defaultValue: 1 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
      { kind: "toggle", prop: "intro", label: "Spin in on load", defaultValue: true },
      { kind: "toggle", prop: "detail", label: "Open entry page", defaultValue: true },
      { kind: "toggle", prop: "enableSound", label: "Ring sounds", defaultValue: true },
    ],
    render: (v) => <RingGalleryDemo v={v as unknown as RingDemoValues} />,
  },
  "portal-card": {
    componentName: "PortalCard",
    importPath: "@/components/portal-card",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "height", label: "Height", min: 320, max: 560, step: 10, unit: "px", defaultValue: 460 },
      { kind: "toggle", prop: "autoplay", label: "Ghost hand", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="w-full">
        <PortalCard height={v.height as number} autoplay={v.autoplay as boolean} />
      </div>
    ),
  },
  "mesh-net": {
    lightOnly: true,
    componentName: "MeshNet",
    importPath: "@/components/mesh-net",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "gridSize", label: "Node spacing", min: 36, max: 110, step: 2, defaultValue: 64 },
      { kind: "range", prop: "revealRadius", label: "Reveal radius", min: 100, max: 400, step: 10, defaultValue: 230 },
      { kind: "range", prop: "push", label: "Push", min: 0, max: 70, step: 1, defaultValue: 30 },
      { kind: "toggle", prop: "autoplay", label: "Ghost pointer", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
        <MeshNet
          key={`${v.gridSize}-${v.autoplay}`}
          gridSize={v.gridSize as number}
          revealRadius={v.revealRadius as number}
          push={v.push as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "particle-reveal": {
    lightOnly: true,
    componentName: "ParticleReveal",
    importPath: "@/components/particle-reveal",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "text", label: "Word", options: ["Reveal", "Launch", "Motion", "Nexus"], defaultValue: "Reveal" },
      { kind: "range", prop: "density", label: "Density (lower is denser)", min: 2, max: 8, step: 0.2, defaultValue: 3.2 },
      { kind: "range", prop: "hoverRadius", label: "Push radius", min: 30, max: 160, step: 5, defaultValue: 70 },
      { kind: "toggle", prop: "autoplay", label: "Ghost cursor", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[560px]">
        <ParticleReveal
          key={`${v.text}-${v.density}-${v.autoplay}`}
          text={String(v.text || "Reveal")}
          density={v.density as number}
          hoverRadius={v.hoverRadius as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "morphing-text": {
    componentName: "MorphingText",
    importPath: "@/components/morphing-text",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "align", label: "Align", options: ["left", "center", "right"], defaultValue: "center" },
      { kind: "range", prop: "morphTime", label: "Morph seconds", min: 0.4, max: 2.4, step: 0.1, defaultValue: 1.1 },
      { kind: "range", prop: "holdTime", label: "Hold seconds", min: 0.5, max: 4, step: 0.1, defaultValue: 1.6 },
      { kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <MorphingText
        key={String(v.autoplay)}
        align={v.align as "left" | "center" | "right"}
        morphTime={v.morphTime as number}
        holdTime={v.holdTime as number}
        autoplay={v.autoplay as boolean}
      />
    ),
  },
  "code-snippet": {
    componentName: "CodeSnippet",
    importPath: "@/components/code-snippet",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "initial", label: "Language", options: ["js", "ts", "python", "bash", "json"], defaultValue: "js" },
      { kind: "select", prop: "theme", label: "Theme", options: ["dark", "light"], defaultValue: "dark" },
      { kind: "toggle", prop: "lineNumbers", label: "Line numbers", defaultValue: true },
      { kind: "toggle", prop: "controls", label: "Chip row", defaultValue: true },
    ],
    render: (v) => (
      <CodeSnippet
        key={`${v.initial}-${v.theme}-${v.lineNumbers}`}
        initial={v.initial as "js" | "ts" | "python" | "bash" | "json"}
        theme={v.theme as "dark" | "light"}
        lineNumbers={v.lineNumbers as boolean}
        controls={v.controls as boolean}
      />
    ),
  },
  "workflow-network": {
    componentName: "WorkflowNetwork",
    importPath: "@/components/workflow-network",
    defaultFill: "dark",
    controls: [
      { kind: "range", prop: "cycle", label: "Cycle seconds", min: 1.2, max: 6, step: 0.1, defaultValue: 2.6 },
      { kind: "select", prop: "mode", label: "Mode", options: ["loop", "once"], defaultValue: "loop" },
      { kind: "toggle", prop: "dots", label: "Dot on the beam", defaultValue: true },
      { kind: "toggle", prop: "autoplay", label: "Run the beams", defaultValue: false, startOn: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[720px]">
        <WorkflowNetwork
          key={`${v.mode}-${v.autoplay}`}
          cycle={v.cycle as number}
          mode={v.mode as "loop" | "once"}
          dots={v.dots as boolean}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
  "tank-recorder": {
    componentName: "TankRecorder",
    importPath: "@/components/tank-recorder",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <TankRecorder key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "ripple-toast": {
    componentName: "RippleToast",
    importPath: "@/components/ripple-toast",
    defaultFill: "light",
    controls: [{ kind: "toggle", prop: "autoplay", label: "Play by itself", defaultValue: false, startOn: true }],
    render: (v) => <RippleToast key={String(v.autoplay)} autoplay={v.autoplay as boolean} />,
  },
  "testimonial-wall": {
    lightOnly: true,
    componentName: "TestimonialWall",
    importPath: "@/components/testimonial-wall",
    defaultFill: "light",
    controls: [
      { kind: "select", prop: "title", label: "Heading", options: ["Loved by teams who ship", "Trusted by makers", "What people are saying"], defaultValue: "Loved by teams who ship" },
      { kind: "range", prop: "speed", label: "Drift speed", min: 8, max: 90, step: 1, unit: "px/s", defaultValue: 30 },
      { kind: "range", prop: "height", label: "Wall height", min: 360, max: 720, step: 10, unit: "px", defaultValue: 520 },
      { kind: "toggle", prop: "autoplay", label: "Drift", defaultValue: true },
    ],
    render: (v) => (
      <div className="mx-auto w-full max-w-[1040px]">
        <TestimonialWall
          key={String(v.autoplay)}
          title={String(v.title || "Loved by teams who ship")}
          speed={v.speed as number}
          height={v.height as number}
          autoplay={v.autoplay as boolean}
        />
      </div>
    ),
  },
};

export function getPlayground(slug: string): Playground | undefined {
  return playgrounds[slug];
}
