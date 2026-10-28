import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, isAdminUser } from "@/lib/env";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense-in-depth: server-side auth check in addition to middleware
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const isAdmin = isAdminUser(user);

  if (!isAdmin) {
    redirect("/");
  }

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-muted/40 backdrop-blur-xl dark:bg-black/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Admin</p>
            <Link href="/admin" className="text-sm font-semibold text-foreground">
              Nexus-UI control
            </Link>
          </div>
          <Link href="/" className="text-xs text-primary transition-colors hover:text-foreground">
            Exit
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
