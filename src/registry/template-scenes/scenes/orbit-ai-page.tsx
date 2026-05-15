"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function SceneOrbitAIPage() {
  return (
    <div className="flex h-full min-h-[420px] flex-col gap-4 rounded-3xl border border-white/10 bg-[#0A0A0A] p-6 relative overflow-hidden">
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Top Navigation Mock */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-white text-black flex items-center justify-center font-bold text-[10px]">
            O
          </div>
          <span className="text-sm font-medium text-white">Orbit AI</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-xs text-white/50">
          <span>Features</span>
          <span>Docs</span>
          <span>Pricing</span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
        >
          Initialize Agent
        </motion.button>
      </div>

      {/* Hero Section */}
      <div className="flex flex-1 flex-col items-center justify-center text-center z-10 space-y-6">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/70 backdrop-blur-md">
          <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 mr-2 animate-pulse"></span>
          Orbit v2.0 is now live
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Code at the speed of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">thought.</span>
          </h1>
          <p className="max-w-md mx-auto text-sm text-white/50 leading-relaxed">
            Deploy autonomous AI coding agents directly in your workflow. Build faster, break fewer things.
          </p>
        </div>

        {/* Terminal/Code Mock */}
        <div className="w-full max-w-lg mt-4 rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[10px] text-left shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="h-2 w-2 rounded-full bg-red-500/80"></div>
            <div className="h-2 w-2 rounded-full bg-yellow-500/80"></div>
            <div className="h-2 w-2 rounded-full bg-green-500/80"></div>
          </div>
          <div className="space-y-1 text-white/70">
            <p><span className="text-pink-400">import</span> {`{ Agent }`} <span className="text-pink-400">from</span> <span className="text-green-400">'@orbit/ai'</span>;</p>
            <p className="mt-2"><span className="text-indigo-400">const</span> <span className="text-yellow-200">nexus</span> = <span className="text-pink-400">new</span> <span className="text-yellow-400">Agent</span>({`{`}</p>
            <p className="pl-4">mode: <span className="text-green-400">'autonomous'</span>,</p>
            <p className="pl-4">project: <span className="text-green-400">'./src'</span></p>
            <p>{`});`}</p>
            <p className="mt-2"><span className="text-blue-400">await</span> nexus.<span className="text-yellow-200">build</span>(); <span className="text-white/30 animate-pulse">_</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
