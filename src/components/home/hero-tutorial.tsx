"use client";

import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import { ChevronRight, Play, X } from "lucide-react";
import { pillClassName } from "@/components/site/pill-link";
import { cn } from "@/lib/utils";

const SRC = "/videos/tutorial/add-nexus-ui.mp4";
const POSTER = "/videos/tutorial/add-nexus-ui-poster.webp";

/**
 * "Watch the tutorial" next to the hero's main button. It opens the setup video in a lightbox on the
 * home page, so nobody has to leave to see how it works; the docs page has the same video with
 * chapters and every command. The video only loads once the lightbox opens, and closing it stops it.
 */
export function HeroTutorial({ className }: { className?: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger className={cn(pillClassName("white", "md", "pl-2.5"), className)}>
        <span className="grid size-6 place-items-center rounded-full bg-action text-white" aria-hidden>
          <Play className="size-3 fill-current" />
        </span>
        Watch the tutorial
        <span className="text-muted-foreground">5 min</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-[81] w-[min(1120px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[22px] bg-[#1d1d1f] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.7)] outline-none transition-[opacity,transform] duration-300 ease-[cubic-bezier(.2,.9,.25,1.1)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
            <Dialog.Title className="truncate text-[15px] font-semibold text-white">Add Nexus UI to your project</Dialog.Title>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href="/docs/video-tutorial"
                className="hidden items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-medium text-white/90 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:inline-flex"
              >
                Chapters and commands
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
              <Dialog.Close
                aria-label="Close"
                className="grid size-8 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <X className="size-4" />
              </Dialog.Close>
            </div>
          </div>
          <video
            src={SRC}
            poster={POSTER}
            controls
            autoPlay
            playsInline
            preload="auto"
            className="block aspect-video w-full bg-black"
            aria-label="Video tutorial: add Nexus UI to a project in VS Code"
          >
            <track kind="subtitles" src="/videos/tutorial/add-nexus-ui.en.vtt" srcLang="en" label="English" />
          </video>
          <Link
            href="/docs/video-tutorial"
            className="flex items-center justify-center gap-1 py-3 text-[13px] font-medium text-white/80 hover:text-white sm:hidden"
          >
            Chapters and commands
            <ChevronRight className="size-3.5" aria-hidden />
          </Link>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
