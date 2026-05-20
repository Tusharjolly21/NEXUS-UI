import crypto from "crypto";

const LS_API = "https://api.lemonsqueezy.com/v1";

function apiHeaders() {
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
  };
}

export type CheckoutOptions = {
  variantId: string;
  userId: string;
  email?: string;
  successUrl: string;
  cancelUrl: string;
};

export async function createCheckout(opts: CheckoutOptions): Promise<string> {
  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_options: {
          success_url: opts.successUrl,
          cancel_url: opts.cancelUrl,
          button_color: "#18181b",
        },
        checkout_data: {
          email: opts.email ?? undefined,
          custom: { user_id: opts.userId },
        },
        product_options: {
          redirect_url: opts.successUrl,
        },
      },
      relationships: {
        store: {
          data: { type: "stores", id: process.env.LEMONSQUEEZY_STORE_ID },
        },
        variant: {
          data: { type: "variants", id: opts.variantId },
        },
      },
    },
  };

  const res = await fetch(`${LS_API}/checkouts`, {
    method: "POST",
    headers: apiHeaders(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LS checkout failed ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.data.attributes.url as string;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;
  const digest = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}
