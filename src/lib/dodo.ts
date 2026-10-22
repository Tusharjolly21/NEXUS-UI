import crypto from "crypto";

/**
 * Dodo Payments client. Two plans are for sale and each maps to one Dodo product:
 *   annual   -> DODO_PRODUCT_ANNUAL   (subscription, $49.99 / year)
 *   lifetime -> DODO_PRODUCT_LIFETIME (one-time, $79.99)
 * Test and live mode use different API keys, webhook secrets and product IDs, so every value
 * comes from the environment.
 */

export type Plan = "annual" | "lifetime";

export function dodoBaseUrl() {
  return process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode"
    ? "https://live.dodopayments.com"
    : "https://test.dodopayments.com";
}

export function productIdForPlan(plan: Plan): string | undefined {
  return plan === "annual" ? process.env.DODO_PRODUCT_ANNUAL : process.env.DODO_PRODUCT_LIFETIME;
}

/** Which plan a Dodo product ID belongs to, or null when it is neither of ours. */
export function planForProductId(productId: string | null | undefined): Plan | null {
  if (!productId) return null;
  if (productId === process.env.DODO_PRODUCT_ANNUAL) return "annual";
  if (productId === process.env.DODO_PRODUCT_LIFETIME) return "lifetime";
  return null;
}

export type CheckoutOptions = {
  plan: Plan;
  userId: string;
  email?: string;
  name?: string;
  returnUrl: string;
  cancelUrl: string;
};

/** Creates a hosted checkout session and returns its URL. */
export async function createCheckoutSession(opts: CheckoutOptions): Promise<string> {
  const productId = productIdForPlan(opts.plan);
  if (!productId) throw new Error("Payment not configured.");

  const res = await fetch(`${dodoBaseUrl()}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: opts.email ? { email: opts.email, ...(opts.name ? { name: opts.name } : {}) } : undefined,
      return_url: opts.returnUrl,
      cancel_url: opts.cancelUrl,
      metadata: { user_id: opts.userId, plan: opts.plan },
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(`[dodo] checkout failed ${res.status}: ${text.slice(0, 300)}`);
    throw new Error("Couldn't start checkout. Try again in a moment.");
  }

  const data = (await res.json()) as { checkout_url?: string | null };
  if (!data.checkout_url) throw new Error("Couldn't start checkout. Try again in a moment.");
  return data.checkout_url;
}

const TOLERANCE_SECONDS = 5 * 60;

/**
 * Verifies a Dodo webhook (Standard Webhooks): HMAC-SHA256 over `${id}.${timestamp}.${body}`
 * using the base64 secret that follows `whsec_`. Rejects timestamps more than 5 minutes off.
 */
export function verifyWebhook(
  rawBody: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
): boolean {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  const { id, timestamp, signature } = headers;
  if (!secret || !id || !timestamp || !signature) return false;

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.startsWith("whsec_") ? secret.slice(6) : secret, "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${timestamp}.${rawBody}`).digest();

  // The header holds one or more space-separated "v1,<base64>" entries.
  for (const part of signature.split(" ")) {
    const [version, value] = part.split(",");
    if (version !== "v1" || !value) continue;
    const given = Buffer.from(value, "base64");
    if (given.length === expected.length && crypto.timingSafeEqual(given, expected)) return true;
  }
  return false;
}

async function dodoFetch(path: string, init?: RequestInit) {
  const res = await fetch(`${dodoBaseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.DODO_PAYMENTS_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Dodo ${init?.method ?? "GET"} ${path} failed ${res.status}: ${text.slice(0, 200)}`);
  }
  return res;
}

/** The subscription IDs a payment belongs to (empty for a one-time payment). */
export async function subscriptionIdsForPayment(paymentId: string): Promise<string[]> {
  const res = await dodoFetch(`/payments/${encodeURIComponent(paymentId)}`);
  const data = (await res.json()) as { subscription_id?: string | null; subscription_ids?: string[] | null };
  const ids = new Set<string>(data.subscription_ids ?? []);
  if (data.subscription_id) ids.add(data.subscription_id);
  return [...ids];
}

/** Cancels a subscription in Dodo immediately so it can't bill again. */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await dodoFetch(`/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "cancelled", cancel_reason: "cancelled_by_merchant" }),
  });
}

/** A one-off link to Dodo's customer portal: update the card, cancel, download invoices. */
export async function createPortalLink(customerId: string, returnUrl: string): Promise<string> {
  const res = await dodoFetch(`/customers/${encodeURIComponent(customerId)}/customer-portal/session`, {
    method: "POST",
    body: JSON.stringify({ return_url: returnUrl }),
  });
  const data = (await res.json()) as { link?: string };
  if (!data.link) throw new Error("Dodo returned no portal link");
  return data.link;
}
