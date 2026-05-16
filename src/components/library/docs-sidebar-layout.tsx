"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import {
  LibraryExplorerSidebarProvider,
  LibraryExplorerSidebarDesktopChrome,
  LibraryExplorerSidebarMobileSheetBody,
} from "@/components/library/library-explorer-sidebar";
import { buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function DocsSidebarLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  return (
    <LibraryExplorerSidebarProvider>
      <div className="flex min-h-[calc(100dvh-4rem)] w-full flex-col bg-background dark:bg-zinc-950 lg:flex-row">
        <aside className="relative z-10 hidden w-[min(100%,260px)] shrink-0 flex-col border-border bg-background dark:bg-zinc-950 lg:flex lg:border-r">
          <div className="sticky top-16 flex max-h-[calc(100dvh-4rem)] flex-col">
            <LibraryExplorerSidebarDesktopChrome />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-16 z-20 flex items-center gap-2 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-md lg:hidden">
            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "gap-2 border-border bg-muted dark:bg-zinc-900/80",
                )}
              >
                <PanelLeft className="size-4" />
                Menu
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[min(100%,300px)] border-border bg-background p-0 dark:bg-zinc-950"
              >
                <SheetHeader className="border-b border-border px-4 py-4 text-left">
                  <SheetTitle className="text-base text-foreground">Library</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100dvh-7rem)]">
                  <div className="px-3 py-4">
                    <LibraryExplorerSidebarMobileSheetBody onPick={() => setMobileNavOpen(false)} />
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
            <span className="text-xs font-medium text-muted-foreground">Setup & catalog</span>
          </div>
          {children}
        </div>
      </div>
    </LibraryExplorerSidebarProvider>
  );
}
