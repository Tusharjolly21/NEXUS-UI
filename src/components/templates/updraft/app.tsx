"use client";

import { useMemo, useState } from "react";
import { DownloadDialog } from "./download-dialog";
import { DownloadCta, Footer } from "./footer";
import { Hero } from "./hero";
import { Journal } from "./journal";
import { Nav } from "./nav";
import { Newsletter } from "./newsletter";
import { Plans } from "./plans";
import { ProductTour } from "./product-tour";
import { Surfaces } from "./surfaces";
import { Teams } from "./teams";
import { BASE_CSS, COLORS, FONT_CSS, FONT_SANS } from "./theme";
import { Statement, ToolStrip } from "./tool-strip";
import { DownloadContext } from "./ui";

export function UpdraftApp() {
  const [downloadOpen, setDownloadOpen] = useState(false);
  const openDownload = useMemo(() => () => setDownloadOpen(true), []);
  const closeDownload = useMemo(() => () => setDownloadOpen(false), []);
  return (
    <DownloadContext.Provider value={openDownload}>
      <div
        className="ud min-h-screen overflow-x-clip bg-white antialiased"
        style={{
          fontFamily: FONT_SANS,
          color: COLORS.ink,
        }}
      >
        <style>{FONT_CSS + BASE_CSS}</style>
        <Nav />
        <main>
          <Hero />
          <ProductTour />
          <ToolStrip />
          <Statement />
          <Surfaces />
          <Teams />
          <Plans />
          <Journal />
          <Newsletter />
          <DownloadCta />
        </main>
        <Footer />
        <DownloadDialog open={downloadOpen} onClose={closeDownload} />
      </div>
    </DownloadContext.Provider>
  );
}
