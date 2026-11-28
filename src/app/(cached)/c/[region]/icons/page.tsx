// The cached copy of /icons for signed-out visitors: the regular page, built once and kept for an hour. See next.config.mjs.
export { default, metadata } from "@/app/(site)/icons/page";

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export const revalidate = 3600;
