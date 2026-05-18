"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Home, LayoutDashboard, Settings, User,
  FilePlus, FolderPlus, UserPlus, Moon, Sparkles, Copy,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Command as CmdkRoot } from "cmdk";
import {
  CommandEmpty,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

export type CommandPaletteProps = { className?: string };

type CommandEntry = {
  label: string;
  description: string;
  icon: React.ElementType;
  action: string;
  value: string;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const COMMANDS: CommandEntry[] = [
  { label: "Home",           description: "Go to homepage",          icon: Home,            action: "Open",   value: "home" },
  { label: "Dashboard",      description: "View your dashboard",     icon: LayoutDashboard, action: "Open",   value: "dashboard" },
  { label: "Features",       description: "Scroll to features",      icon: Sparkles,        action: "Open",   value: "features" },
  { label: "Settings",       description: "Manage preferences",      icon: Settings,        action: "Open",   value: "settings" },
  { label: "Profile",        description: "View your profile",       icon: User,            action: "Open",   value: "profile" },
  { label: "New Document",   description: "Create a new file",       icon: FilePlus,        action: "Create", value: "new-doc" },
  { label: "New Project",    description: "Start from scratch",      icon: FolderPlus,      action: "Create", value: "new-project" },
  { label: "Invite Member",  description: "Add to your team",        icon: UserPlus,        action: "Invite", value: "invite" },
  { label: "Copy Email",     description: "support@nexus-ui.com",    icon: Copy,            action: "Copy",   value: "copy-email" },
  { label: "Toggle Dark Mode", description: "Switch appearance",     icon: Moon,            action: "Toggle", value: "dark-mode" },
];

// ── Ease curve ────────────────────────────────────────────────────────────────

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ── Component ─────────────────────────────────────────────────────────────────

export function CommandPalette({ className }: CommandPaletteProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // ⌘K / Ctrl+K
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input on open
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  return (
    <div className={cn("relative h-full w-full bg-[#111111]", className)}>

      {/* ── Trigger pill ── */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2.5 rounded-full bg-[#1e1e1e] px-4 py-2.5 shadow-lg ring-1 ring-white/10 transition-colors hover:bg-[#272727]"
        style={{ width: 220 }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Search size={15} className="shrink-0 text-gray-500" />
        <span className="flex-1 text-left text-sm font-medium text-gray-300">Quick Actions</span>
        <kbd className="shrink-0 rounded border border-white/10 bg-white/8 px-1.5 py-0.5 font-mono text-[11px] text-gray-400">
          ⌘ K
        </kbd>
      </motion.button>

      {/* ── Modal ── */}
      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>

              {/* Backdrop */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-black/55"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setOpen(false)}
                />
              </DialogPrimitive.Overlay>

              {/* Palette */}
              <DialogPrimitive.Content
                forceMount
                aria-describedby={undefined}
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-135 -translate-x-1/2 -translate-y-1/2 px-4 outline-none sm:px-0"
              >
                <DialogPrimitive.Title className="sr-only">Command Palette</DialogPrimitive.Title>

                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -8 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  className="overflow-hidden rounded-xl bg-[#1c1c1c] shadow-[0_24px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/[0.07]"
                >
                  <CmdkRoot
                    className="flex flex-col"
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setOpen(false);
                    }}
                  >
                    {/* ── Search row ── */}
                    <div className="flex items-center gap-3 border-b border-white/[0.07] px-4 py-3.5">
                      <Search size={16} className="shrink-0 text-gray-500" />
                      <CmdkRoot.Input
                        ref={inputRef}
                        placeholder="Search commands..."
                        className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="shrink-0 rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-gray-500 transition hover:bg-white/10"
                      >
                        ESC
                      </button>
                    </div>

                    {/* ── List ── */}
                    <CommandList className="max-h-[400px] overflow-y-auto py-1">
                      <CommandEmpty className="py-10 text-center text-sm text-gray-600">
                        No results found.
                      </CommandEmpty>

                      {COMMANDS.map((cmd, i) => {
                        const Icon = cmd.icon;
                        return (
                          <CommandItem
                            key={cmd.value}
                            value={cmd.value}
                            onSelect={() => setOpen(false)}
                            className={cn(
                              "group mx-2 flex cursor-default items-center gap-3.5 rounded-lg px-3 py-2.5",
                              "border border-transparent",
                              "data-[selected=true]:border-white/[0.08] data-[selected=true]:bg-white/[0.06]",
                              i !== COMMANDS.length - 1 &&
                                "mb-px after:absolute after:bottom-0 after:left-0",
                            )}
                          >
                            {/* Icon box */}
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.08] group-data-[selected=true]:bg-white/[0.1]">
                              <Icon size={16} className="text-gray-400 group-data-[selected=true]:text-white" />
                            </div>

                            {/* Label + description */}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-gray-200 group-data-[selected=true]:text-white">
                                {cmd.label}
                              </p>
                              <p className="truncate text-xs text-gray-600 group-data-[selected=true]:text-gray-400">
                                {cmd.description}
                              </p>
                            </div>

                            {/* Action hint */}
                            <span className="shrink-0 text-xs text-gray-700 transition group-data-[selected=true]:text-gray-400">
                              {cmd.action}
                              <span className="ml-1 hidden group-data-[selected=true]:inline">↵</span>
                            </span>
                          </CommandItem>
                        );
                      })}
                    </CommandList>

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5">
                      <div className="flex items-center gap-4 text-[11px] text-gray-600">
                        <span>
                          <kbd className="font-mono">↑↓</kbd> Navigate
                        </span>
                        <span>
                          <kbd className="font-mono">↵</kbd> Select
                        </span>
                        <span>
                          <kbd className="font-mono">Esc</kbd> Close
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-700">Command Center</span>
                    </div>
                  </CmdkRoot>
                </motion.div>
              </DialogPrimitive.Content>

            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </div>
  );
}

export default CommandPalette;
