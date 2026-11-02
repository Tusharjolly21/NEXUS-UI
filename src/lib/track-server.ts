import { track } from "@vercel/analytics/server";

/**
 * Server-side events for Vercel Web Analytics: things that happen where no browser is looking, such as the
 * payment webhook. Same rules as trackEvent: fixed labels only, never an email, name or id.
 *
 * It only sends from the production deployment (previews and local runs must not add to the live numbers),
 * and it can never throw, so a failure here cannot make a webhook fail and be retried.
 * Vercel's server track needs the request's headers; for a webhook those are the payment provider's,
 * so these events are counted but not tied to a visitor.
 */
export type ServerEvent = "purchase_completed";

export async function trackServer(name: ServerEvent, props: Record<string, string | number | boolean>, headers: Headers) {
  if (process.env.VERCEL_ENV !== "production") return;
  try {
    await track(name, props, { headers });
  } catch {
    // Analytics must never get in the way of a payment.
  }
}
