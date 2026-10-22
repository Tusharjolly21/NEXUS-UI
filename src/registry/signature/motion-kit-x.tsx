"use client";

/**
 * Motion Kit previews (set X): OTP autofill, underline OTP, crack-time password meter, suggested password. Every component ships an `autoplay` mode that
 * demonstrates itself until someone takes over, so the previews only add the stage around them.
 */

import type { ReactNode } from "react";
import { OtpAutofill, OtpLine } from "@/components/otp-input";
import { CrackTimePassword, SuggestPassword } from "@/components/password-strength";

function Stage({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7] ${className}`}>
      {children}
    </div>
  );
}

export function PreviewOtpAutofill({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <OtpAutofill autoplay />
    </Stage>
  );
}

export function PreviewOtpLine({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <OtpLine autoplay />
    </Stage>
  );
}

export function PreviewCrackTimePassword({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <CrackTimePassword autoplay />
    </Stage>
  );
}

export function PreviewSuggestPassword({ compact = false }: { compact?: boolean } = {}) {
  void compact;
  return (
    <Stage>
      <SuggestPassword autoplay />
    </Stage>
  );
}
