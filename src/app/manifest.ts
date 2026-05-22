import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E10",
    theme_color: "#0E0E10",
    icons: [
      { src: "/icon2",       type: "image/png",     sizes: "192x192" },
      { src: "/icon-192.png", type: "image/png",    sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png",    sizes: "512x512" },
    ],
  };
}
