"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { TypewriterHeading } from "@/components/blocks/text-animations";

export function FlippingWordsDemo() {
  const notes = [
    ["Oct 14", "Branch previews", "Every pull request gets its own URL, torn down on merge."],
    ["Oct 07", "Faster cold starts", "Median boot fell from 410 ms to 160 ms on the new runtime."],
    ["Sep 30", "Audit log export", "Stream every workspace event to your own bucket as JSONL."],
    ["Sep 22", "Keyboard-first search", "Press / anywhere to jump to a project, page, or teammate."],
  ];
  return (
    <section className="grid h-full min-h-full w-full overflow-hidden bg-[#f5f5f7] px-5 py-10 text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7] sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:p-14">
      <div className="flex flex-col justify-center">
        <p className="text-[13px] font-medium text-[#6e6e73] dark:text-[#a1a1a6]">Changelog</p>
        <TypewriterHeading
          text="Release notes people read."
          description="Ship a headline that types itself out, then let the summary settle in underneath. The layout is reserved up front, so nothing below it jumps."
          typingSpeed={78}
          startDelay={300}
          cursorColor="#0071e3"
          className="mt-3"
        />
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <span className="inline-flex h-11 items-center rounded-full bg-[#0071e3] px-5 text-[15px] font-medium text-white">
            Read the latest
          </span>
          <span className="inline-flex h-11 items-center rounded-full bg-[#e8e8ed] px-5 text-[15px] font-medium text-[#1d1d1f] dark:bg-[#2c2c2e] dark:text-[#f5f5f7]">
            Subscribe by email
          </span>
        </div>
      </div>
      <ol className="mt-10 hidden flex-col justify-center gap-2 lg:mt-0 lg:flex">
        {notes.map(([date, title, copy]) => (
          <li key={title} className="grid grid-cols-[64px_1fr] gap-4 rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(0,0,0,.05)] dark:bg-[#1c1c1e] dark:shadow-[0_0_0_1px_rgba(255,255,255,.08)]">
            <span className="pt-0.5 text-[12.5px] tabular-nums text-[#86868b] dark:text-[#98989d]">{date}</span>
            <span>
              <span className="block text-[15px] font-semibold tracking-[-0.01em]">{title}</span>
              <span className="mt-1 block text-[13.5px] leading-5 text-[#6e6e73] dark:text-[#a1a1a6]">{copy}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
