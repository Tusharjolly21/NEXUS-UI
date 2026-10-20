"use client";

import { LoginForm } from "./login-form";
import { SignupForm, type SignupFormValues } from "./signup-form";

export function SignupFormDemo() {
  async function handleSubmit(values: SignupFormValues) {
    await new Promise<void>((resolve) => setTimeout(resolve, 1200));
    if (values.email.endsWith("@example.com")) {
      throw new Error("That address is already registered.");
    }
  }

  return (
    <section className="bg-[#f5f5f7] text-[#1d1d1f] dark:bg-black dark:text-[#f5f5f7]">
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-14">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0071e3] dark:text-[#0a84ff]">Forms</p>
          <h2 className="mt-3 text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.04em]">Signup Form</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6e6e73] dark:text-[#a1a1a6]">
            Floating labels, rules that tick as you type, and a submit button that squeezes into a spinner and swells back out in green. Try an address ending in @example.com to see the error state.
          </p>
        </div>
        <div className="grid items-start justify-items-center gap-6 lg:grid-cols-2">
          <SignupForm onSubmit={handleSubmit} showConfirmPasswordField={false} onSignIn={() => {}} />
          <LoginForm onSubmit={() => new Promise<void>((r) => setTimeout(r, 1000))} onForgotPassword={() => {}} onSignUp={() => {}} />
        </div>
      </div>
    </section>
  );
}
