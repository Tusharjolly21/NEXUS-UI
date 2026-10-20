/**
 * template-access.ts — SERVER ONLY
 *
 * The template counterpart of component-access.ts: decides whether the current browser session
 * may take a template's source or build prompt. Pro (a live plan), lifetime, or a purchase of that
 * template. Any error denies access (fails closed).
 */

import { cache } from "react";
import { getSessionUser } from "@/lib/component-access";
import { canAccessTemplate } from "@/lib/entitlements";

export { getSessionUser };

/** May this user take the template's source or prompt? Errors deny. */
export async function userCanAccessTemplate(userId: string, slug: string): Promise<boolean> {
  try {
    return await canAccessTemplate(userId, slug);
  } catch {
    return false;
  }
}

/** May the signed-in session take this template's source or prompt? Deduplicated per request. */
export const sessionCanAccessTemplate = cache(async (slug: string): Promise<boolean> => {
  const user = await getSessionUser();
  if (!user) return false;
  return userCanAccessTemplate(user.id, slug);
});
