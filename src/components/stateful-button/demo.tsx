"use client";

import { StatefulButton } from "./stateful-button";

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function failAfter(ms: number) {
  await sleep(ms);
  throw new Error("Network error");
}

export function StatefulButtonDemo() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-14">
      <header className="space-y-2 text-center">
        <h2 className="text-balance text-3xl font-semibold tracking-[-0.03em] text-[#1d1d1f] sm:text-4xl dark:text-[#f5f5f7]">Stateful button</h2>
        <p className="text-[15px] text-[#6e6e73] dark:text-[#a1a1a6]">Idle, loading, success and error, with the width springing between labels.</p>
      </header>
      <section className="flex min-h-[220px] flex-wrap items-center justify-center gap-4 rounded-[24px] bg-white p-8 shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
        <StatefulButton onClick={() => sleep(1400)} loadingText="Sending" successText="Sent">
          Send message
        </StatefulButton>
        <StatefulButton variant="outline" onClick={() => failAfter(1200)} loadingText="Saving" errorText="Couldn't save">
          Save draft
        </StatefulButton>
      </section>
    </div>
  );
}
