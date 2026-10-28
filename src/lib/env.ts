export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
  if (!raw) return "http://localhost:3000";
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    console.warn(
      "[env] NEXT_PUBLIC_SITE_URL is not a valid URL; using http://localhost:3000 for metadata.",
    );
    return "http://localhost:3000";
  }
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * True only for a signed-in user whose confirmed email is listed in ADMIN_EMAILS.
 * Deliberately ignores user_metadata: users can edit their own metadata, so a role stored
 * there is not a trustworthy basis for access to /admin.
 */
export function isAdminUser(user: { email?: string | null; email_confirmed_at?: string | null }): boolean {
  if (!user.email || !user.email_confirmed_at) return false;
  return getAdminEmails().includes(user.email.trim().toLowerCase());
}
