// The cached copy of /blog/:slug for signed-out visitors: the regular page, built once and kept for an hour. See next.config.mjs.
export { default, generateMetadata } from "@/app/(site)/blog/[slug]/page";
import { generateStaticParams as slugs } from "@/app/(site)/blog/[slug]/page";

export const dynamicParams = true;

export async function generateStaticParams() {
  const list = await slugs();
  return ["global", "in"].flatMap((region) => list.map((p) => ({ region, ...p })));
}

export const revalidate = 3600;
