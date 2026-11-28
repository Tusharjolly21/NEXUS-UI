// The cached copy of /docs/introduction for signed-out visitors: the regular page, built once and kept for an hour. See next.config.mjs.
export { default, metadata } from "@/app/(site)/docs/introduction/page";

export function generateStaticParams() {
  return [{ region: "global" }, { region: "in" }];
}

export const revalidate = 3600;
