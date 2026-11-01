/**
 * access.ts — SERVER ONLY
 *
 * Who may see an icon's code and sound. The 75 free icons: everyone. A Pro icon: only a signed-in session with
 * Pro (a plan or All-Access). Anyone can still preview and play every icon; this guards the source. Pages and the
 * download route both ask here, so a Pro icon's code never reaches a browser the server has not approved.
 * Any error denies access.
 */

import { sessionHasPro } from "@/lib/component-access";
import { getIcon } from "@/lib/icons/catalog";

export async function sessionCanAccessIcon(slug: string): Promise<boolean> {
  const icon = getIcon(slug);
  if (!icon) return false;
  if (!icon.premium) return true;
  return sessionHasPro();
}
