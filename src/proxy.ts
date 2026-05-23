import type { User } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getAdminEmails } from "@/lib/env";
import { mayHaveSupabaseAuthCookies, updateSession } from "@/lib/supabase/middleware";

function isLinkPrefetch(request: NextRequest): boolean {
  const p = request.headers.get("Next-Router-Prefetch") ?? request.headers.get("next-router-prefetch");
  if (p === "1") return true;
  return request.headers.get("Purpose") === "prefetch";
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/icon", request.url));
  }

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const fetchDest = request.headers.get("sec-fetch-dest");
  const isDocumentRequest = !fetchDest || fetchDest === "document";

  /* Next.js prefetches client navigations — skip Supabase on public prefetches (saves one round-trip per hover). */
  if (isLinkPrefetch(request) && !isProtected) {
    return NextResponse.next({ request });
  }

  /* Asset/script/fetch requests should never pay auth refresh cost on public routes. */
  if (!isDocumentRequest && !isProtected) {
    return NextResponse.next({ request });
  }

  /*
   * Public pages stay stateless in proxy for speed.
   * Session refresh/user checks run only on protected routes.
   */
  if (!isProtected) {
    return NextResponse.next({ request });
  }

  const hasAuthCookies = mayHaveSupabaseAuthCookies(request);

  /* Protected routes without auth cookies: redirect without calling Supabase. */
  if (!hasAuthCookies && isProtected) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  let supabaseResponse: NextResponse;
  let user: User | null = null;
  try {
    const refreshed = await updateSession(request);
    supabaseResponse = refreshed.response;
    user = refreshed.user;
  } catch (err) {
    console.error("[middleware] updateSession threw:", err);
    supabaseResponse = NextResponse.next({ request });
    user = null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (pathname.startsWith("/admin")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    return supabaseResponse;
  }

  try {
    if (!user) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }

    if (pathname.startsWith("/admin")) {
      const admins = getAdminEmails();
      const email = user.email?.toLowerCase() ?? "";
      const isAdmin =
        admins.includes(email) ||
        (user.user_metadata as { role?: string } | undefined)?.role === "admin";
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (err) {
    console.error("[middleware] Protected route auth check failed:", err);
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/favicon.ico",
    "/dashboard/:path*",
    "/admin/:path*",
  ],
};
