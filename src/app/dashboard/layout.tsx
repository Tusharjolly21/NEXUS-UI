import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { Sidebar } from "@/components/dashboard/sidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "User";

  const email = user.email ?? "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={{ email, name: displayName, avatarLetter }} />
      <main className="flex-1 overflow-y-auto pt-14 lg:pl-60 lg:pt-0">{children}</main>
    </div>
  );
}
