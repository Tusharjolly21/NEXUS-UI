/**
 * admin.ts — SERVER ONLY, never import on the client
 *
 * Creates a Supabase client with the service role key.
 * This bypasses Row Level Security (RLS) and should only be used
 * for server-side operations that need to query by arbitrary user_id
 * without an active auth session (e.g. API-token-based registry access,
 * webhook handlers called by Dodo Payments with no user session).
 *
 * Never expose this key to the browser (no NEXT_PUBLIC_ prefix).
 */

import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";

export function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (never NEXT_PUBLIC_).",
    );
  }

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll: () => [],
      setAll: () => {},
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  });
}
