"use client";

// Split out of block-variants.tsx so a page that shows this one loads only the code it uses.
import { WavyLines } from "@/components/wavy-lines";

function AuroraWavyLinesDemo() {
  return (
    <div className="relative h-full min-h-[640px] overflow-hidden bg-[#050b18]">
      <WavyLines
        lineColor="#2997ff"
        backgroundColorStart="#050b18"
        backgroundColorEnd="#0b1f3a"
        speed={1.2}
        radius={12}
        className="h-full min-h-[640px] w-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent_0%,rgba(0,0,0,.2)_46%,rgba(0,0,0,.7)_100%)]" />
      <div className="pointer-events-none absolute bottom-10 left-10 max-w-md">
        <p className="text-[14px] font-medium text-[#a1a1a6]">Tidal, ocean sensor network</p>
        <p className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-[#f5f5f7]">
          Readings from 4,000 buoys, live.
        </p>
        <p className="mt-3 text-pretty text-[16px] leading-[1.5] text-[#a1a1a6]">
          Swell, temperature and salinity, streamed every ninety seconds.
        </p>
      </div>
    </div>
  );
}

export function PreviewBlockVariantBackgroundsAuroraLines() {
  return <AuroraWavyLinesDemo />;
}
