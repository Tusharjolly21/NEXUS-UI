import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { cancelSubscription, planForProductId, subscriptionIdsForPayment, verifyWebhook } from "@/lib/dodo";

export const dynamic = "force-dynamic";

/**
 * Dodo Payments webhook. This is the only place that grants access:
 *  - payment.succeeded for the lifetime product -> an `orders` row (product_type "lifetime")
 *  - subscription.* for the yearly product      -> a `subscriptions` row kept in step with Dodo
 *  - refund.succeeded (full refund)             -> the order is marked refunded, or the yearly
 *                                                 subscription it paid for is cancelled right away
 *  - a cancelled subscription keeps access until the end of the period already paid for
 *
 * Column mapping (provider-neutral schema): provider_order_id = payment_id, provider_subscription_id =
 * subscription_id, provider_product_id = product_id, customer_id = Dodo customer, provider = "dodo".
 * Rows are looked up first and then inserted or updated, so this doesn't rely on a unique index.
 */

type Metadata = Record<string, string> | null | undefined;

type DodoPayment = {
  payment_id: string;
  total_amount: number;
  currency: string;
  customer?: { customer_id?: string | null } | null;
  metadata?: Metadata;
  product_cart?: { product_id: string }[] | null;
};

type DodoSubscription = {
  subscription_id: string;
  product_id: string;
  status: "pending" | "active" | "on_hold" | "paused" | "cancelled" | "failed" | "expired" | "past_due";
  next_billing_date?: string | null;
  expires_at?: string | null;
  cancel_at_next_billing_date?: boolean | null;
  customer?: { customer_id?: string | null } | null;
  metadata?: Metadata;
};

type DodoRefund = {
  refund_id: string;
  payment_id: string;
  is_partial: boolean;
};

type DodoEvent = { type: string; data: unknown };

const SUBSCRIPTION_EVENTS = new Set([
  "subscription.active",
  "subscription.renewed",
  "subscription.updated",
  "subscription.plan_changed",
  "subscription.update_payment_method",
  "subscription.past_due",
  "subscription.on_hold",
  "subscription.paused",
  "subscription.unpaused",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
]);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hdrs = await headers();
  const webhookId = hdrs.get("webhook-id");

  const valid = verifyWebhook(rawBody, {
    id: webhookId,
    timestamp: hdrs.get("webhook-timestamp"),
    signature: hdrs.get("webhook-signature"),
  });
  if (!valid || !webhookId) {
    console.error("[dodo-webhook] invalid signature: check DODO_PAYMENTS_WEBHOOK_KEY matches the endpoint in the Dodo dashboard");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: DodoEvent;
  try {
    event = JSON.parse(rawBody) as DodoEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getAdminClient();

  // Idempotency: Dodo retries failed deliveries, so skip anything already processed.
  const { data: existing } = await supabase.from("webhook_events").select("id").eq("id", webhookId).maybeSingle();
  if (existing) return NextResponse.json({ received: true, skipped: true });

  try {
    if (event.type === "payment.succeeded") {
      const payment = event.data as DodoPayment;
      const userId = payment.metadata?.user_id;
      const lifetimeItem = payment.product_cart?.find((item) => planForProductId(item.product_id) === "lifetime");

      // Yearly payments are handled by the subscription events. Only the one-time product makes an order.
      if (userId && lifetimeItem) {
        const { data: found } = await supabase
          .from("orders")
          .select("id")
          .eq("provider_order_id", payment.payment_id)
          .maybeSingle();
        const { error } = found
          ? { error: null }
          : await supabase.from("orders").insert({
              user_id: userId,
              provider: "dodo",
              provider_order_id: payment.payment_id,
              provider_product_id: lifetimeItem.product_id,
              provider_variant_id: null,
              customer_id: payment.customer?.customer_id ?? null,
              product_type: "lifetime",
              product_slug: null,
              status: "paid",
              amount_cents: payment.total_amount,
              currency: payment.currency ?? "USD",
            });
        if (error) throw error;
        console.log(`[dodo-webhook] lifetime order user=${userId} payment=${payment.payment_id}`);
      }
    } else if (event.type === "refund.succeeded") {
      const refund = event.data as DodoRefund;
      // A partial refund keeps access. A full refund ends it, as the terms say.
      if (!refund.is_partial) {
        const { data: order } = await supabase
          .from("orders")
          .select("id")
          .eq("provider_order_id", refund.payment_id)
          .maybeSingle();
        if (order) {
          const { error } = await supabase.from("orders").update({ status: "refunded" }).eq("id", order.id);
          if (error) throw error;
        } else {
          // Not a lifetime order, so this may be the yearly payment: end that subscription now.
          for (const subId of await subscriptionIdsForPayment(refund.payment_id)) {
            const { data: row } = await supabase
              .from("subscriptions")
              .select("id")
              .eq("provider_subscription_id", subId)
              .maybeSingle();
            if (!row) continue;
            const { error } = await supabase
              .from("subscriptions")
              .update({ status: "cancelled", ends_at: new Date().toISOString(), renews_at: null, updated_at: new Date().toISOString() })
              .eq("id", row.id);
            if (error) throw error;
            // Best effort: access is already ended above, this stops any further billing.
            await cancelSubscription(subId).catch((err) => console.error("[dodo-webhook] could not cancel in Dodo:", err));
            console.log(`[dodo-webhook] refund ended subscription ${subId}`);
          }
        }
      }
    } else if (SUBSCRIPTION_EVENTS.has(event.type)) {
      const sub = event.data as DodoSubscription;
      if (planForProductId(sub.product_id) === "annual") {
        const userId = sub.metadata?.user_id;
        const live = sub.status === "active" || sub.status === "past_due";
        const fields = {
          provider: "dodo",
          provider_product_id: sub.product_id,
          provider_variant_id: null,
          customer_id: sub.customer?.customer_id ?? null,
          cancel_at_period_end: sub.cancel_at_next_billing_date === true,
          status: sub.status,
          renews_at: live ? sub.next_billing_date ?? null : null,
          ends_at: null as string | null,
          updated_at: new Date().toISOString(),
        };

        const { data: found } = await supabase
          .from("subscriptions")
          .select("id, renews_at, ends_at")
          .eq("provider_subscription_id", sub.subscription_id)
          .maybeSingle();

        // A cancelled subscription keeps access until the end of the period already paid for. Dodo's
        // expires_at is the plan's far-off expiry, not that date, so use the stored renewal date.
        if (sub.status === "cancelled") {
          fields.ends_at = found?.ends_at ?? found?.renews_at ?? sub.next_billing_date ?? new Date().toISOString();
        } else if (sub.status === "expired") {
          fields.ends_at = new Date().toISOString();
        }

        if (found) {
          const { error } = await supabase.from("subscriptions").update(fields).eq("id", found.id);
          if (error) throw error;
        } else if (userId) {
          const { error } = await supabase
            .from("subscriptions")
            .insert({ user_id: userId, provider_subscription_id: sub.subscription_id, ...fields });
          if (error) throw error;
        }
        console.log(`[dodo-webhook] ${event.type} sub=${sub.subscription_id} status=${sub.status}`);
      }
    }
  } catch (err) {
    // A 500 makes Dodo retry the delivery later.
    console.error(`[dodo-webhook] failed handling ${event.type}:`, err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  await supabase.from("webhook_events").insert({ id: webhookId, event_name: event.type });
  return NextResponse.json({ received: true });
}
