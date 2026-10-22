import { Card, DashboardPage } from "@/components/dashboard/ui";

/** Shown while a dashboard page loads, so the layout doesn't jump. */
export default function DashboardLoading() {
  return (
    <DashboardPage>
      <div aria-busy="true" aria-live="polite" className="animate-pulse motion-reduce:animate-none">
        <span className="sr-only">Loading</span>
        <div className="h-12 w-64 rounded-2xl bg-muted" />
        <div className="mt-4 h-5 w-96 max-w-full rounded-full bg-muted" />
        <Card className="mt-10 h-36" />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Card className="h-32" />
          <Card className="h-32" />
          <Card className="h-32" />
        </div>
      </div>
    </DashboardPage>
  );
}
