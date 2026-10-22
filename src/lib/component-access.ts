/**
 * component-access.ts — SERVER ONLY
 *
 * The one place that decides whether the current browser session may see a component's code.
 * Pages, the usage API and the registry API all ask here, so the browser never receives Pro
 * source, usage code or install files that the server didn't approve. The UI locks are only
 * the visible half of this.
 */

import { cache } from "react";
import { getCachedUser } from "@/lib/supabase/server";
import { canAccessComponent, getUserEntitlements, hasPremiumAccess } from "@/lib/entitlements";
import { summarisePlan, type PlanKind } from "@/lib/plan";
import { isSupabaseConfigured } from "@/lib/env";

/** The signed-in user for this request, or null (never throws: auth outages fail closed). */
export const getSessionUser = cache(async () => {
  if (!isSupabaseConfigured()) return null;
  try {
    return await getCachedUser();
  } catch {
    return null;
  }
});

/** Does the signed-in user have Pro (a live plan or All-Access)? Deduplicated per request. */
export const sessionHasPro = cache(async (): Promise<boolean> => {
  const user = await getSessionUser();
  if (!user) return false;
  try {
    return await hasPremiumAccess(user.id);
  } catch {
    return false;
  }
});

/**
 * Which plan unlocks Pro for this session: "yearly" (Pro), "lifetime" (All-Access) or "free". Only
 * shapes what pages offer (a Pro member isn't shown "Get Pro"); checkout checks again on the server.
 */
export const sessionPlanKind = cache(async (): Promise<PlanKind> => {
  const user = await getSessionUser();
  if (!user) return "free";
  try {
    const { subscription, orders } = await getUserEntitlements(user.id);
    const plan = summarisePlan(subscription, orders);
    return plan.hasAccess ? plan.kind : "free";
  } catch {
    return "free";
  }
});

/**
 * May the signed-in user see this component's code? Free components: always. Pro components:
 * only with a plan, All-Access or a purchase of that component. Any error denies access.
 */
export const sessionCanAccessComponent = cache(async (slug: string, premium: boolean): Promise<boolean> => {
  if (!premium) return true;
  const user = await getSessionUser();
  if (!user) return false;
  try {
    return await canAccessComponent(user.id, slug);
  } catch {
    return false;
  }
});
