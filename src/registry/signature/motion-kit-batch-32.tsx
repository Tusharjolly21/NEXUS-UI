"use client";

/**
 * Motion Kit previews (batch 31): Home Scenes, Action Stack, Address Field, Withdrawal Sheet, Coin Focus, Notch Send, Row Editor,
 * Status Picker, Invite Reveal, Days Slider, Fold Balance, Card Wear, Time Chips, Income Stream, Race Bars, Persona Reminder,
 * Private Send, Dust Delete, Wave Confirm, Balance Matrix, Focus Mode, Target Bars, Spend Strip, Stack Reel, Folder Path,
 * Widget Morph, Folder Upload, Charge Menu, Focus Board, Cover Planner and Wave Trimmer, plus the variants Slide to Pay,
 * Password Reveal, Order Tracker, Spend Ring, Context Gauge, Mood Orb and Send Money.
 * Each card plays its own demo until the visitor touches it, so the preview only adds a light stage around it.
 */

import type { ReactNode } from "react";
import { HomeScenes } from "@/components/home-scenes";
import { ActionStack } from "@/components/action-stack";
import { AddressField } from "@/components/address-field";
import { WithdrawalSheet } from "@/components/withdrawal-sheet";
import { CoinFocus } from "@/components/coin-focus";
import { NotchSend } from "@/components/notch-send";
import { RowEditor } from "@/components/row-editor";
import { StatusPicker } from "@/components/status-picker";
import { InviteReveal } from "@/components/invite-reveal";
import { DaysSlider } from "@/components/days-slider";
import { FoldBalance } from "@/components/fold-balance";
import { CardWear } from "@/components/card-wear";
import { TimeChips } from "@/components/time-chips";
import { IncomeStream } from "@/components/income-stream";
import { RaceBars } from "@/components/race-bars";
import { PersonaReminder } from "@/components/persona-reminder";
import { PrivateSend } from "@/components/private-send";
import { DustDelete } from "@/components/dust-delete";
import { WaveConfirm } from "@/components/wave-confirm";
import { BalanceMatrix } from "@/components/balance-matrix";
import { FocusMode } from "@/components/focus-mode";
import { TargetBars } from "@/components/target-bars";
import { SpendStrip } from "@/components/spend-strip";
import { StackReel } from "@/components/stack-reel";
import { FolderPath } from "@/components/folder-path";
import { WidgetMorph } from "@/components/widget-morph";
import { FolderUpload } from "@/components/folder-upload";
import { ChargeMenu } from "@/components/charge-menu";
import { FocusBoard } from "@/components/focus-board";
import { CoverPlanner } from "@/components/cover-planner";
import { WaveTrimmer } from "@/components/wave-trimmer";
import { SlideToPay } from "@/components/slide-to-confirm";
import { PasswordReveal } from "@/components/password-strength";
import { OrderTracker } from "@/components/order-tracking";
import { SpendRing } from "@/components/spend-donut";
import { ContextGauge } from "@/components/context-meter";
import { MoodOrb } from "@/components/mood-wheel";
import { SendMoney } from "@/components/money-goo";

function Stage({ compact, width = 420, children }: { compact: boolean; width?: number; children: ReactNode }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-[#f5f5f7] p-4 dark:bg-black sm:p-6 ${compact ? "min-h-[300px]" : "min-h-[420px]"}`}>
      <div className="w-full [&>div]:mx-auto" style={{ maxWidth: width }}>
        {children}
      </div>
    </div>
  );
}

export function PreviewHomeScenes({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={800}>
      <HomeScenes autoplay />
    </Stage>
  );
}

export function PreviewActionStack({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <ActionStack autoplay />
    </Stage>
  );
}

export function PreviewAddressField({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <AddressField autoplay />
    </Stage>
  );
}

export function PreviewWithdrawalSheet({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <WithdrawalSheet autoplay />
    </Stage>
  );
}

export function PreviewCoinFocus({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <CoinFocus autoplay />
    </Stage>
  );
}

export function PreviewNotchSend({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={680}>
      <NotchSend autoplay />
    </Stage>
  );
}

export function PreviewRowEditor({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={560}>
      <RowEditor autoplay />
    </Stage>
  );
}

export function PreviewStatusPicker({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <StatusPicker autoplay />
    </Stage>
  );
}

export function PreviewInviteReveal({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <InviteReveal autoplay />
    </Stage>
  );
}

export function PreviewDaysSlider({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <DaysSlider autoplay />
    </Stage>
  );
}

export function PreviewFoldBalance({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <FoldBalance autoplay />
    </Stage>
  );
}

export function PreviewCardWear({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <CardWear autoplay />
    </Stage>
  );
}

export function PreviewTimeChips({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <TimeChips autoplay />
    </Stage>
  );
}

export function PreviewIncomeStream({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <IncomeStream autoplay />
    </Stage>
  );
}

export function PreviewRaceBars({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <RaceBars autoplay />
    </Stage>
  );
}

export function PreviewPersonaReminder({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <PersonaReminder autoplay />
    </Stage>
  );
}

export function PreviewPrivateSend({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <PrivateSend autoplay />
    </Stage>
  );
}

export function PreviewDustDelete({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={380}>
      <DustDelete autoplay />
    </Stage>
  );
}

export function PreviewWaveConfirm({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={360}>
      <WaveConfirm autoplay />
    </Stage>
  );
}

export function PreviewBalanceMatrix({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <BalanceMatrix autoplay />
    </Stage>
  );
}

export function PreviewFocusMode({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={380}>
      <FocusMode autoplay />
    </Stage>
  );
}

export function PreviewTargetBars({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={400}>
      <TargetBars autoplay />
    </Stage>
  );
}

export function PreviewSpendStrip({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <SpendStrip autoplay />
    </Stage>
  );
}

export function PreviewStackReel({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <StackReel autoplay />
    </Stage>
  );
}

export function PreviewFolderPath({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <FolderPath autoplay />
    </Stage>
  );
}

export function PreviewWidgetMorph({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={480}>
      <WidgetMorph autoplay />
    </Stage>
  );
}

export function PreviewFolderUpload({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={360}>
      <FolderUpload autoplay />
    </Stage>
  );
}

export function PreviewChargeMenu({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={320}>
      <ChargeMenu autoplay />
    </Stage>
  );
}

export function PreviewFocusBoard({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={600}>
      <FocusBoard autoplay />
    </Stage>
  );
}

export function PreviewCoverPlanner({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={500}>
      <CoverPlanner autoplay />
    </Stage>
  );
}

export function PreviewWaveTrimmer({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <WaveTrimmer autoplay />
    </Stage>
  );
}

export function PreviewSlideToPayVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <SlideToPay autoplay />
    </Stage>
  );
}

export function PreviewPasswordRevealVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <PasswordReveal autoplay />
    </Stage>
  );
}

export function PreviewOrderTrackerVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={440}>
      <OrderTracker autoplay />
    </Stage>
  );
}

export function PreviewSpendRingVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <SpendRing autoplay />
    </Stage>
  );
}

export function PreviewContextGaugeVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={460}>
      <ContextGauge autoplay />
    </Stage>
  );
}

export function PreviewMoodOrbVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={500}>
      <MoodOrb autoplay />
    </Stage>
  );
}

export function PreviewSendMoneyVariant({ compact = false }: { compact?: boolean } = {}) {
  return (
    <Stage compact={compact} width={420}>
      <SendMoney autoplay />
    </Stage>
  );
}
