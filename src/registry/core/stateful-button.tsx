"use client";

// Moved out of component-previews-core.tsx so a page that shows this preview loads only the code it uses.
import { StatefulButton } from "@/components/stateful-button";
import { CheckCircle2 } from "lucide-react";

export function PreviewStatefulButton() {
  async function fakeAction() {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 1300);
    });
  }
  return (
    <div className="flex min-h-[440px] items-center justify-center rounded-xl border border-border bg-muted/35 dark:bg-zinc-950/70">
      <StatefulButton
        onClick={fakeAction}
        loadingText="Send message"
        successText="Send message"
        className="flex min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-full bg-green-500 px-5 py-2.5 font-medium text-white ring-offset-2 transition duration-200 hover:ring-2 hover:ring-green-500 dark:ring-offset-black"
        successIcon={<CheckCircle2 className="size-4" />}
        resetDelay={1600}
      >
        Send message
      </StatefulButton>
    </div>
  );
}
