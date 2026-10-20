"use client";

import { PhoneInput } from "@/components/phone-input";

export function PreviewPhoneInputRedesign({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div className="relative flex h-full min-h-[360px] w-full items-center justify-center p-8 text-[#1d1d1f] dark:text-[#f5f5f7]">
      <div className={compact ? "w-full max-w-[300px]" : "w-full max-w-[340px]"}>
        <PhoneInput label="Mobile number" defaultCountry="US" autoplay />
      </div>
    </div>
  );
}
