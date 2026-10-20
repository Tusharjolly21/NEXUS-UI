/**
 * license-stamp.ts — SERVER ONLY
 *
 * Every Pro file that leaves the site (a shadcn registry item, a template zip, a build prompt)
 * carries a licence line naming the account it was issued to, as a short one-way id. Nothing about
 * the person can be read from it, but if a paid file turns up somewhere public we can tell whose
 * download it was. It changes nothing about how the code runs.
 */

import { createHmac } from "node:crypto";

/** A stable 12-character id for an account. One-way: it can't be turned back into the user id. */
export function licenseId(userId: string): string {
  const secret = process.env.LICENSE_STAMP_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "nexus-ui-license";
  return createHmac("sha256", secret).update(userId).digest("hex").slice(0, 12);
}

export function licenseLine(userId: string, item: string): string {
  return `Nexus UI Pro · ${item} · licensed to account ${licenseId(userId)}. Use it in your own and client projects; don't resell or republish the source.`;
}

/** The comment block that goes on top of each source file. Comments may precede "use client". */
export function licenseComment(userId: string, item: string): string {
  return `/*\n * ${licenseLine(userId, item)}\n */\n`;
}

const STAMPABLE = /\.(tsx?|jsx?|mjs|css)$/;

/** Stamps every source file of a shadcn registry item (the JSON string the registry serves). */
export function stampRegistryItem(json: string, userId: string, item: string): string {
  try {
    const data = JSON.parse(json) as { files?: Array<{ path?: string; target?: string; content?: string }> };
    for (const f of data.files ?? []) {
      const name = f.target ?? f.path ?? "";
      if (typeof f.content === "string" && STAMPABLE.test(name)) f.content = licenseComment(userId, item) + f.content;
    }
    return JSON.stringify(data, null, 2);
  } catch {
    return json;
  }
}

export function isStampable(file: string): boolean {
  return STAMPABLE.test(file);
}

/** A build prompt with the licence line at the end (left as is when there's no account). */
export function withLicense(text: string, userId: string | undefined | null, item: string): string {
  return userId ? `${text.trimEnd()}\n\n---\n\n${licenseLine(userId, item)}\n` : text;
}
