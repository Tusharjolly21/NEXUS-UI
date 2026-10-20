"use client";

import * as React from "react";
import { ImageTrail } from "./image-trail";


export function ImageTrailDemo() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-4 py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
          Motion Effects
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Image Trail
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A cursor trail that cycles through images as you move. Configure spacing,
          duration, size, magnetic pull, and blur transitions.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Default trail */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Default — move your cursor inside</p>
          <ImageTrail
                        trailSettings={{ spacing: 36, duration: 900, smoothness: 0.7 }}
            appearance={{ imageSize: 120, cornerRadius: 10, objectFit: "cover" }}
            animation={{ fadeOutBlur: 6 }}
            className="h-80 rounded-2xl border border-border bg-muted/30"
          >
            <div className="pointer-events-none flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground/60 select-none">Move cursor here</p>
            </div>
          </ImageTrail>
        </div>

        {/* Magnetic + tighter spacing */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Magnetic effect enabled</p>
          <ImageTrail
                        trailSettings={{ spacing: 28, duration: 1100, smoothness: 0.65 }}
            appearance={{ imageSize: 100, cornerRadius: 50, objectFit: "cover" }}
            animation={{ fadeOutBlur: 8 }}
            magneticEffect
            magneticSettings={{ magneticStrength: 0.35, magneticRadius: 120 }}
            className="h-80 rounded-2xl border border-border bg-muted/30"
          >
            <div className="pointer-events-none flex h-full items-center justify-center">
              <p className="text-sm text-muted-foreground/60 select-none">Move cursor here</p>
            </div>
          </ImageTrail>
        </div>
      </div>
    </section>
  );
}
