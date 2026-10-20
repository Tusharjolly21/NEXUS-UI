"use client";

import { LoginForm, SignupForm } from "@/components/signup-form";

const stage = "relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]";

export function PreviewSignupFormRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className={stage}>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-3">
        <SignupForm
          title="Create your account"
          subtitle={compact ? "" : "Start free. No card needed."}
          showConfirmPasswordField={false}
          showSocialLogins={!compact}
          autoplay
        />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Type in a field, then press Create account.</span>
      </div>
    </div>
  );
}

export function PreviewSignupFormLoginRedesign() {
  return (
    <div className={stage}>
      <div className="flex w-full max-w-[420px] flex-col items-center gap-3">
        <LoginForm onForgotPassword={() => {}} autoplay />
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Press Sign in with an empty field to see it shake.</span>
      </div>
    </div>
  );
}
