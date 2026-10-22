"use client";

import * as React from "react";
import { AutoplaySound } from "@/lib/ui-sounds";
import { TYPING_NOTE } from "@/lib/catalog/component-sounds";
import { TypingSoundSwitch } from "@/components/site/sound-switch";

/**
 * For a page whose previews type: lets them be heard (the site keeps self-playing previews quiet
 * elsewhere) and puts the typing sound switch above them.
 */
export function TypingSoundPanel({ children }: { children: React.ReactNode }) {
  return (
    <AutoplaySound allow>
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
        <TypingSoundSwitch />
        <p className="max-w-[560px] text-[13.5px] leading-snug text-muted-foreground">{TYPING_NOTE}</p>
      </div>
      {children}
    </AutoplaySound>
  );
}
