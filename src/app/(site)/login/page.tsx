import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-lg px-4 py-20 text-sm text-zinc-400">Loading…</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
