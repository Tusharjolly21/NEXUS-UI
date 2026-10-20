"use client";

import { EncryptedText } from "@/components/encrypted-text";

function Lock() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <rect x="3" y="7" width="10" height="7" rx="2" fill="currentColor" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function PreviewEncryptedTextRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className="flex w-full max-w-[420px] flex-col items-center gap-3">
        <div className="flex w-full flex-col gap-4 rounded-[24px] bg-white p-6 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08),0_20px_40px_-26px_rgba(0,0,0,.8)]">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#6e6e73] dark:text-[#a1a1a6]">
            <span className="grid size-6 place-items-center rounded-full bg-[#30d158]/15 text-[#248a3d] dark:text-[#30d158]">
              <Lock />
            </span>
            Vault
            <span className="ml-auto rounded-full bg-[#f0f0f3] px-2 py-0.5 text-[11px] font-medium text-[#6e6e73] dark:bg-[#2c2c2e] dark:text-[#a1a1a6]">AES-256</span>
          </div>
          <EncryptedText
            as="h2"
            text="ACCESS GRANTED"
            trigger="hover"
            autoplay
            loopDelay={2600}
            speed={55}
            shuffleSpeed={32}
            iterations={9}
            className={`m-0 font-semibold tracking-[0.04em] ${compact ? "text-[28px]" : "text-[34px]"}`}
          />
          <div className="flex items-center justify-between gap-3 rounded-[14px] bg-[#f5f5f7] px-3.5 py-2.5 dark:bg-[#2c2c2e]">
            <span className="text-[12px] text-[#6e6e73] dark:text-[#a1a1a6]">Recovery key</span>
            <EncryptedText
              text="7F3A-91C2-D04E"
              trigger="hover"
              autoplay
              loopDelay={2600}
              revealDelay={350}
              speed={45}
              iterations={7}
              className="text-[13px] font-medium tabular-nums"
              scrambleClassName="text-[#86868b] dark:text-[#98989d]"
            />
          </div>
        </div>
        <span className="text-[13px] text-[#86868b] dark:text-[#a1a1a6]">Hover either line to decode it again.</span>
      </div>
    </div>
  );
}
