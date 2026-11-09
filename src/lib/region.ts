/**
 * region.ts — SERVER ONLY
 *
 * Works out which prices a visitor gets from the country attached to each
 * request. The checkout route calls this too, so the product charged never
 * depends on anything the browser sends.
 */

import { headers } from "next/headers";
import { GLOBAL_PRICING, INDIA_PRICING, type DisplayPricing, type PriceRegion } from "@/lib/pricing";

function countryOf(requestHeaders: Pick<Headers, "get">): string | null {
  // Vercel's header doesn't exist locally. DEV_COUNTRY=IN stands in for it.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_COUNTRY) {
    return process.env.DEV_COUNTRY.toUpperCase();
  }
  // The site is behind Cloudflare, so Vercel's header describes Cloudflare's server, not the visitor.
  const country = requestHeaders.get("cf-ipcountry") ?? requestHeaders.get("x-vercel-ip-country");
  return country?.toUpperCase() ?? null;
}

/** Without both India products, showing rupees would promise a price checkout can't charge. */
function indiaProductsConfigured(): boolean {
  return Boolean(process.env.DODO_PRODUCT_ANNUAL_IN && process.env.DODO_PRODUCT_LIFETIME_IN);
}

export function regionFor(requestHeaders: Pick<Headers, "get">): PriceRegion {
  return countryOf(requestHeaders) === "IN" && indiaProductsConfigured() ? "india" : "global";
}

/** The prices to show on the current request. Makes the calling route dynamic. */
export async function getPricing(): Promise<DisplayPricing> {
  return regionFor(await headers()) === "india" ? INDIA_PRICING : GLOBAL_PRICING;
}
