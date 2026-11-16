"use client";

/**
 * Motion Kit previews (batch 29): the variants Timed Toast Stack, Orb Composer, Desktop Context Menu, OTP Code, Prism Command Palette, Privacy Banner, and Date Wheels, Agent Thinking, Odometer Field, Activity Rings, Notification Center, Contribution Skyline, Liquid Funnel, Sleep Score, Shatter Mark, Annotate Text, Metal Card, Receipt Button, Decay Card, Ribbon Gallery, Photo Tunnel, Bell Toggle, Project Index, Fuse Button, Download Button, Focus Field, Liquid Tabs, Liquid Status, Glyph Flow, Depth Stack, Fold Gallery, Melt Type, Message Composer, Search Modal, File Drop, Profile Card, Orb Nav, Halo Hero, Brain Atlas.
 * Each card plays its own demo until the visitor touches it, so the preview only adds a light stage around it.
 */

import type { ReactNode } from "react";
import { DateWheels } from "@/components/date-wheels";
import { AgentThinking } from "@/components/agent-thinking";
import { OdometerField } from "@/components/odometer-field";
import { ActivityRings } from "@/components/activity-rings";
import { NotificationCenter } from "@/components/notification-center";
import { ContributionSkyline } from "@/components/contribution-skyline";
import { LiquidFunnel } from "@/components/liquid-funnel";
import { SleepScore } from "@/components/sleep-score";
import { ShatterMark } from "@/components/shatter-mark";
import { AnnotateText } from "@/components/annotate-text";
import { MetalCard } from "@/components/metal-card";
import { ReceiptButton } from "@/components/receipt-button";
import { DecayCard } from "@/components/decay-card";
import { RibbonGallery } from "@/components/ribbon-gallery";
import { PhotoTunnel } from "@/components/photo-tunnel";
import { BellToggle } from "@/components/bell-toggle";
import { ProjectIndex } from "@/components/project-index";
import { FuseButton } from "@/components/fuse-button";
import { DownloadButton } from "@/components/download-button";
import { FocusField } from "@/components/focus-field";
import { LiquidTabs } from "@/components/liquid-tabs";
import { LiquidStatus } from "@/components/liquid-status";
import { GlyphFlow } from "@/components/glyph-flow";
import { DepthStack } from "@/components/depth-stack";
import { FoldGallery } from "@/components/fold-gallery";
import { MeltType } from "@/components/melt-type";
import { MessageComposer } from "@/components/message-composer";
import { SearchModal } from "@/components/search-modal";
import { FileDrop } from "@/components/file-drop";
import { ProfileCard } from "@/components/profile-card";
import { OrbNav } from "@/components/orb-nav";
import { HaloHero } from "@/components/halo-hero";
import { BrainAtlas } from "@/components/brain-atlas";

import { TimedToastStack } from "@/components/toast-stack";
import { OrbComposer } from "@/components/ai-composer";
import { DesktopContextMenu } from "@/components/context-menu";
import { OtpCode } from "@/components/otp-input";
import { PrismCommandPalette } from "@/components/command-palette";
import { PrivacyBanner } from "@/components/consent-dock";

/** Sample photos for the galleries (Unsplash, credited on the component pages' demos). */
const PHOTOS = [
  { src: "/images/motion-kit/photos/reine-lofoten.jpg", title: "Reine, Lofoten" },
  { src: "/images/motion-kit/photos/torres-del-paine.jpg", title: "Torres del Paine" },
  { src: "/images/motion-kit/photos/antelope-canyon.jpg", title: "Antelope Canyon" },
  { src: "/images/motion-kit/photos/ice-cave.jpg", title: "Ice cave" },
  { src: "/images/motion-kit/photos/dunes-at-dusk.jpg", title: "Dunes at dusk" },
  { src: "/images/motion-kit/photos/fjord.jpg", title: "Fjord" },
  { src: "/images/motion-kit/photos/waterfall.jpg", title: "Waterfall" },
];

function Stage({ compact, width = 420, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewDateWheels({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <DateWheels autoplay />
    </Stage>
  );
}

export function PreviewAgentThinking({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <AgentThinking autoplay />
    </Stage>
  );
}

export function PreviewOdometerField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <OdometerField autoplay />
    </Stage>
  );
}

export function PreviewActivityRings({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <ActivityRings autoplay />
    </Stage>
  );
}

export function PreviewNotificationCenter({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <NotificationCenter autoplay />
    </Stage>
  );
}

export function PreviewContributionSkyline({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <ContributionSkyline autoplay />
    </Stage>
  );
}

export function PreviewLiquidFunnel({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={940}>
      <LiquidFunnel autoplay />
    </Stage>
  );
}

export function PreviewSleepScore({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <SleepScore autoplay />
    </Stage>
  );
}

export function PreviewShatterMark({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <ShatterMark autoplay />
    </Stage>
  );
}

export function PreviewAnnotateText({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={560}>
      <AnnotateText autoplay />
    </Stage>
  );
}

export function PreviewMetalCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <MetalCard autoplay />
    </Stage>
  );
}

export function PreviewReceiptButton({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <ReceiptButton autoplay />
    </Stage>
  );
}

export function PreviewDecayCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <DecayCard autoplay />
    </Stage>
  );
}

export function PreviewRibbonGallery({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <RibbonGallery autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewPhotoTunnel({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <PhotoTunnel autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewBellToggle({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <BellToggle autoplay />
    </Stage>
  );
}

export function PreviewProjectIndex({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <ProjectIndex autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewFuseButton({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <FuseButton autoplay />
    </Stage>
  );
}

export function PreviewDownloadButton({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <DownloadButton autoplay />
    </Stage>
  );
}

export function PreviewFocusField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <FocusField autoplay />
    </Stage>
  );
}

export function PreviewLiquidTabs({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <LiquidTabs autoplay />
    </Stage>
  );
}

export function PreviewLiquidStatus({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <LiquidStatus autoplay />
    </Stage>
  );
}

export function PreviewGlyphFlow({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={520}>
      <GlyphFlow autoplay />
    </Stage>
  );
}

export function PreviewDepthStack({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <DepthStack autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewFoldGallery({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <FoldGallery autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewMeltType({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <MeltType autoplay />
    </Stage>
  );
}

export function PreviewMessageComposer({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <MessageComposer autoplay photos={PHOTOS} />
    </Stage>
  );
}

export function PreviewSearchModal({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <SearchModal autoplay />
    </Stage>
  );
}

export function PreviewFileDrop({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={980}>
      <FileDrop autoplay />
    </Stage>
  );
}

export function PreviewProfileCard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <ProfileCard autoplay />
    </Stage>
  );
}

export function PreviewOrbNav({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <OrbNav autoplay />
    </Stage>
  );
}

export function PreviewHaloHero({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1100}>
      <HaloHero autoplay />
    </Stage>
  );
}

export function PreviewBrainAtlas({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={1000}>
      <BrainAtlas autoplay />
    </Stage>
  );
}

export function PreviewTimedToastStackVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <TimedToastStack autoplay />
    </Stage>
  );
}

export function PreviewOrbComposerVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <OrbComposer autoplay />
    </Stage>
  );
}

export function PreviewDesktopContextMenuVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <DesktopContextMenu autoplay />
    </Stage>
  );
}

export function PreviewOtpCodeVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <OtpCode autoplay />
    </Stage>
  );
}

export function PreviewPrismCommandPaletteVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <PrismCommandPalette autoplay />
    </Stage>
  );
}

export function PreviewPrivacyBannerVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={900}>
      <PrivacyBanner autoplay />
    </Stage>
  );
}
