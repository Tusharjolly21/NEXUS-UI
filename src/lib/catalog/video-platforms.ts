/**
 * The places a video is made for, as the videos page groups them: the page's results and its names column both
 * read this, so there is one way of grouping videos on the site. A video can be made for several places.
 */
export const VIDEO_PLATFORMS: { id: string; label: string; match: string[] }[] = [
  { id: "reels", label: "Reels & TikTok", match: ["Reels", "TikTok", "Shorts", "Instagram carousel", "Instagram feed"] },
  { id: "youtube", label: "YouTube", match: ["YouTube"] },
  { id: "x", label: "X", match: ["X"] },
  { id: "linkedin", label: "LinkedIn", match: ["LinkedIn"] },
  { id: "ph", label: "Product Hunt", match: ["Product Hunt"] },
  { id: "store", label: "App Store", match: ["App Store", "Play Store"] },
  { id: "site", label: "Website", match: ["Website"] },
];

export function madeFor(platforms: readonly string[], id: string) {
  const p = VIDEO_PLATFORMS.find((x) => x.id === id);
  return !!p && platforms.some((x) => p.match.includes(x));
}
