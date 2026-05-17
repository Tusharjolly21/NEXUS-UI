"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const notifications = [
  { id: "1", text: "Deployment completed successfully", time: "just now", type: "success" },
  { id: "2", text: "New user sign up from San Francisco", time: "2m ago", type: "info" },
  { id: "3", text: "API rate limit threshold reached", time: "5m ago", type: "warning" },
  { id: "4", text: "Database backup saved to storage", time: "8m ago", type: "success" },
  { id: "5", text: "Payment processed for plan upgrade", time: "12m ago", type: "success" },
  { id: "6", text: "New comment on your dashboard", time: "15m ago", type: "info" },
  { id: "7", text: "Build pipeline triggered", time: "18m ago", type: "info" },
];

export function AnimatedListDemo({ className }: { className?: string }) {
  const [visible, setVisible] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => {
      setVisible((v) => (v + 1) % notifications.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const items = notifications.slice(visible, visible + 3);

  return (
    <div className={cn("flex flex-col gap-2 p-3", className)}>
      <AnimatePresence mode="popLayout">
        {items.map((n, i) => (
          <motion.div
            key={`${n.id}-${visible}`}
            initial={{ opacity: 0, x: -20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ delay: i * 0.08, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm"
          >
            <CheckCircle2
              className={cn(
                "size-4 shrink-0",
                n.type === "success" ? "text-emerald-400/70" : "text-cyan-400/70",
              )}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white/70">{n.text}</p>
              <p className="text-[10px] text-white/25">{n.time}</p>
            </div>
            <div
              className={cn(
                "size-1.5 rounded-full shrink-0",
                n.type === "success" ? "bg-emerald-400/60" : "bg-cyan-400/60",
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}