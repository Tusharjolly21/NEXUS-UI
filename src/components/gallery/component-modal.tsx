"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Link2, X } from "lucide-react";
import { InstallCard } from "@/components/site/install-card";
import { PillLink } from "@/components/site/pill-link";
import { SHADCN_REGISTRY_SCOPE } from "@/lib/registry-scope";
import { cn } from "@/lib/utils";
import { ScaledPreview } from "./scaled-preview";
import { INTERACTION_FILTERS, TINT_CLASSES, type GalleryItem } from "./types";

const INTERACTION_LABELS = Object.fromEntries(INTERACTION_FILTERS.map((f) => [f.value, f.label]));

/**
 * Component detail as a modal over the gallery (deep-linked by the caller via `?c=slug`):
 * a large live stage on the left, and on the right what it is, how to install it, and the way to
 * the full page with the code and props.
 */
export function ComponentModal({ item, onClose }: { item: GalleryItem | null; onClose: () => void }) {
  const [copied, setCopied] = React.useState(false);

  async function copyLink() {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/components?c=${item.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked; the URL bar already holds the link
    }
  }

  return (
    <DialogPrimitive.Root open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-[60] bg-[#17171c]/30 backdrop-blur-md transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0 motion-reduce:transition-none" />
        <DialogPrimitive.Popup className="fixed inset-x-3 bottom-3 top-16 z-[61] mx-auto flex max-w-[1180px] flex-col gap-3 outline-none transition-[opacity,transform] duration-200 data-[ending-style]:translate-y-3 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-3 data-[starting-style]:opacity-0 motion-reduce:transition-none sm:inset-x-6 sm:top-20 sm:bottom-6 lg:flex-row">
          {item ? (
            <>
              <div className={cn("relative min-h-[300px] flex-1 overflow-hidden rounded-tile p-3", TINT_CLASSES[item.tint])}>
                <div className="h-full overflow-hidden rounded-[20px] bg-card">
                  <ScaledPreview key={item.slug} exportName={item.exportName} canvas={Math.max(item.canvas, 820)} eager />
                </div>
              </div>

              <aside className="pg-float flex w-full shrink-0 flex-col overflow-y-auto rounded-tile bg-card p-6 lg:w-[360px]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] text-muted-foreground">{item.categoryLabel}</p>
                    <DialogPrimitive.Title className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-foreground">{item.name}</DialogPrimitive.Title>
                  </div>
                  <DialogPrimitive.Close
                    aria-label="Close"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <X className="size-4" aria-hidden />
                  </DialogPrimitive.Close>
                </div>

                <DialogPrimitive.Description className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                  {item.description}
                </DialogPrimitive.Description>

                {item.interactions.length ? (
                  <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Interactions">
                    {item.interactions.map((i) => (
                      <li key={i} className="rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
                        {INTERACTION_LABELS[i]}
                      </li>
                    ))}
                    <li className="rounded-full bg-tint-mint px-2.5 py-1 text-[12px] font-semibold text-[#126b3a]">Free</li>
                  </ul>
                ) : null}

                <div className="mt-6">
                  <p className="mb-2 text-[13px] font-medium text-foreground">Install</p>
                  <InstallCard wrap command={`npx shadcn@latest add ${SHADCN_REGISTRY_SCOPE}/${item.install}`} />
                </div>

                <div className="mt-auto flex flex-col gap-2 pt-8">
                  <PillLink href={`/components/${item.slug}`}>See the code and props</PillLink>
                  <button
                    type="button"
                    onClick={copyLink}
                    className="pg-glass inline-flex h-[44px] items-center justify-center gap-2 rounded-full bg-card text-[14px] font-semibold text-foreground"
                  >
                    <Link2 className="size-4" aria-hidden />
                    <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
                  </button>
                </div>
              </aside>
            </>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
