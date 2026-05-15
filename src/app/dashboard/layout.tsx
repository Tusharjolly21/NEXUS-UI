import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border bg-muted/40 backdrop-blur-xl dark:bg-black/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-foreground">
            Nexus-UI
          </Link>
          <nav className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <Link className="transition-colors hover:text-foreground" href="/components">
              Library
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/templates">
              Templates
            </Link>
            <Link className="transition-colors hover:text-foreground" href="/dashboard">
              Overview
            </Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
