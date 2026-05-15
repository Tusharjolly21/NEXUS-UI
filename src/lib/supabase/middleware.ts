import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const GET_USER_MS = 4500;

/** True if the request carries Supabase auth cookies (chunked `sb-*-auth-token.*`, etc.). */
export function mayHaveSupabaseAuthCookies(request: NextRequest): boolean {
  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith("sb-") && name.includes("auth")) return true;
  }
  return false;
}

export type SessionRefreshResult = {
  response: NextResponse;
  user: User | null;
};

/**
 * Refreshes the Supabase session when auth cookies are present.
 * Returns the outgoing `NextResponse` (may include refreshed `Set-Cookie`) and the resolved user.
 */
export async function updateSession(request: NextRequest): Promise<SessionRefreshResult> {
  const fallback: SessionRefreshResult = {
    response: NextResponse.next({ request }),
    user: null,
  };

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return fallback;
  }

  try {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient<Database>(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            try {
              request.cookies.set(name, value);
            } catch {
              /* Some Next.js runtimes disallow mutating request cookies; response Set-Cookie still applies. */
            }
          }
          supabaseResponse = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    let user: User | null = null;
    try {
      const result = await Promise.race([
        supabase.auth.getUser(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("supabase_get_user_timeout")), GET_USER_MS);
        }),
      ]);
      user = result.data.user;
    } catch (e) {
      if (e instanceof Error && e.message === "supabase_get_user_timeout") {
        console.warn(
          "[middleware] Supabase getUser timed out — serving without refreshed session. Check NEXT_PUBLIC_SUPABASE_URL and network.",
        );
      } else {
        throw e;
      }
    }

    return { response: supabaseResponse, user };
  } catch (err) {
    console.error("[middleware] Supabase session refresh failed:", err);
    return fallback;
  }
}
