import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { AccessTag } from "@/components/pro/pro-access";
import { VideoCard } from "@/components/videos/video-card";
import { VideoStudio } from "@/components/videos/video-studio";
import { getVideo, videoPosterSrc, videoPreviewSrc, videos } from "@/lib/catalog/videos";
import { videoDefaults } from "@/lib/catalog/video-defaults";
import { createMetadata, siteConfig } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return videos.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const v = getVideo(slug);
  if (!v) return {};
  return createMetadata({
    title: `${v.title}: ${v.purpose} Video Template in React`,
    description: `${v.blurb} A ${v.duration}-second vertical video with its own soundtrack: edit the words live, then take the prompt and the code.`,
    alternates: { canonical: `/videos/${v.slug}` },
  });
}

export default async function VideoPage({ params }: Props) {
  const { slug } = await params;
  const video = getVideo(slug);
  if (!video) notFound();

  const base = siteConfig.url.replace(/\/$/, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: `${video.title}: ${video.purpose} video`,
    description: video.blurb,
    thumbnailUrl: `${base}${videoPosterSrc(video.slug)}`,
    contentUrl: `${base}${videoPreviewSrc(video.slug)}`,
    uploadDate: video.createdAt,
    duration: `PT${video.duration}S`,
    isAccessibleForFree: !video.premium,
  };
  const more = videos.filter((v) => v.slug !== video.slug).slice(0, 4);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="pg-dotgrid relative -mt-[64px] overflow-hidden px-4 pb-10 pt-[120px]">
        <div aria-hidden className="pg-bloom pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-[1152px]">
          <nav aria-label="Breadcrumb" className="text-[13.5px] text-muted-foreground">
            <Link href="/videos" className="hover:text-foreground hover:underline hover:underline-offset-4">
              Videos
            </Link>
            <span aria-hidden> › </span>
            <span className="text-foreground/80">{video.title}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <h1 className="pg-display text-[clamp(40px,6.5vw,64px)] text-foreground">{video.title}</h1>
            <AccessTag premium={video.premium} className="mt-2" />
          </div>
          <p className="mt-4 max-w-[640px] text-[18px] leading-[1.55] text-muted-foreground">{video.blurb}</p>
        </div>
      </section>

      <section className="px-4 pb-24 pt-6">
        <div className="mx-auto max-w-[1152px]">
          <VideoStudio video={video} defaults={videoDefaults(video.slug)} />
        </div>
      </section>

      <section aria-label="More videos" className="px-4 pb-24">
        <div className="mx-auto max-w-[1152px]">
          <div className="flex items-end justify-between gap-4">
            <h2 className="pg-display text-[clamp(30px,4vw,40px)] leading-[1.05] text-foreground">More videos</h2>
            <Link href="/videos" className="shrink-0 text-[15px] text-link hover:underline hover:underline-offset-4">
              See all {videos.length} ›
            </Link>
          </div>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {more.map((v) => (
              <li key={v.slug}>
                <VideoCard video={v} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
