import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { VideoFrame } from "@/components/videos/video-frame";
import { getVideo, videos } from "@/lib/catalog/videos";
import { videoDefaults } from "@/lib/catalog/video-defaults";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ p?: string }> };

export const metadata: Metadata = { title: "Video frame", robots: { index: false, follow: false } };

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

/**
 * One video drawn full-window, with its clock set by `window.__setT`. Used to render the grid
 * previews and as the reference page for `render.mjs`. `?p=` takes JSON with edited copy.
 */
export default async function VideoFramePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { p } = await searchParams;
  const video = getVideo(slug);
  if (!video) notFound();

  const values: Record<string, string> = videoDefaults(slug);
  if (p) {
    try {
      const edits = JSON.parse(p) as Record<string, unknown>;
      for (const f of video.fields) if (typeof edits[f.key] === "string") values[f.key] = (edits[f.key] as string).slice(0, 200);
    } catch {
      // ignore bad input, keep the defaults
    }
  }
  return <VideoFrame slug={slug} values={values} />;
}
