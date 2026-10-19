import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in — Nexus UI",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="min-h-[100dvh]" aria-busy="true" />}
    >
      <LoginForm />
    </Suspense>
  );
}
