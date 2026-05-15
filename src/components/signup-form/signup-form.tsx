"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Github, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export type SignupFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type SignupFormProps = {
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  className?: string;
  showNameField?: boolean;
  showConfirmPasswordField?: boolean;
  minPasswordLength?: number;
  defaultValues?: Partial<SignupFormValues>;
  onSubmit?: (values: SignupFormValues) => Promise<void> | void;
  showSocialLogins?: boolean;
  onSocialLogin?: (provider: "github" | "apple" | "google") => void;
};

function GoogleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M21.8 12.2c0-.7-.1-1.2-.2-1.8H12v3.4h5.5c-.1.9-.8 2.2-2.2 3.1l-.1 1.1 3.2 2.5.2.1c1.9-1.7 3.2-4.4 3.2-8.4Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.8 0 5.2-.9 6.9-2.4l-3.3-2.6c-.9.6-2.1 1-3.6 1a6.2 6.2 0 0 1-5.8-4.2l-1.1.1-3.3 2.6v.1A10.3 10.3 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.2 13.8a6.4 6.4 0 0 1 0-3.7L6.1 9l-3.4-2.6-.1.1a10.2 10.2 0 0 0 0 9.2l3.6-2.9Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.9c1.9 0 3.1.8 3.8 1.5l2.8-2.8A9.8 9.8 0 0 0 12 2a10.3 10.3 0 0 0-9.2 5.6l3.5 2.8A6.2 6.2 0 0 1 12 5.9Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function AppleMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.37 1.43c.1 1.2-.34 2.4-1.08 3.25-.78.87-2.03 1.52-3.19 1.44-.14-1.15.35-2.34 1.1-3.15.8-.88 2.13-1.52 3.17-1.54Zm4.24 16.39c-.56 1.28-.84 1.84-1.56 2.98-1.01 1.58-2.43 3.56-4.19 3.57-1.57.02-1.98-1.03-4.1-1.02-2.12.01-2.57 1.04-4.14 1-1.76-.02-3.1-1.8-4.11-3.38-2.82-4.38-3.11-9.53-1.38-12.16 1.23-1.86 3.16-2.96 4.97-2.96 1.85 0 3.01 1.02 4.53 1.02 1.48 0 2.38-1.02 4.52-1.02 1.61 0 3.31.88 4.54 2.4-3.98 2.18-3.34 8.1.92 9.57Z" />
    </svg>
  );
}

function sanitize(values: SignupFormValues): SignupFormValues {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    password: values.password,
    confirmPassword: values.confirmPassword,
  };
}

export function SignupForm({
  title = "Create your account",
  subtitle = "Start building premium interfaces with motion-first components.",
  submitLabel = "Create account",
  loadingLabel = "Creating account...",
  successLabel = "Account created",
  className,
  showNameField = true,
  showConfirmPasswordField = true,
  minPasswordLength = 8,
  defaultValues,
  onSubmit,
  showSocialLogins = true,
  onSocialLogin,
}: SignupFormProps) {
  const reduceMotion = useReducedMotion() === true;
  const [values, setValues] = React.useState<SignupFormValues>({
    firstName: defaultValues?.firstName ?? "",
    lastName: defaultValues?.lastName ?? "",
    email: defaultValues?.email ?? "",
    password: defaultValues?.password ?? "",
    confirmPassword: defaultValues?.confirmPassword ?? "",
  });
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "loading" | "success">("idle");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const isLoading = state === "loading";

  function updateField<K extends keyof SignupFormValues>(key: K, next: SignupFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  function validate(next: SignupFormValues): string | null {
    if (showNameField && next.firstName.length < 2) return "Please enter your first name.";
    if (showNameField && next.lastName.length < 2) return "Please enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) return "Please enter a valid email address.";
    if (next.password.length < Math.max(6, minPasswordLength)) {
      return `Password should be at least ${Math.max(6, minPasswordLength)} characters.`;
    }
    if (showConfirmPasswordField && next.confirmPassword !== next.password) {
      return "Password and confirm password should match.";
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    const next = sanitize(values);
    const validationError = validate(next);
    if (validationError) {
      setState("idle");
      setError(validationError);
      return;
    }

    try {
      setState("loading");
      await onSubmit?.(next);
      setState("success");
    } catch {
      setState("idle");
      setError("Unable to create account. Please try again.");
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "w-full max-w-md space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-black",
        className,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{subtitle}</p>
      </div>

      <div className="space-y-3">
        {showNameField ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="signup-first-name" className="text-black dark:text-white">
                First name
              </Label>
              <div className="group/input rounded-md border border-zinc-300 bg-white transition duration-200 hover:border-sky-500 focus-within:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-sky-400 dark:focus-within:border-sky-400">
                <Input
                  id="signup-first-name"
                  value={values.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  placeholder="Tyler"
                  autoComplete="given-name"
                  disabled={isLoading}
                  className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-last-name" className="text-black dark:text-white">
                Last name
              </Label>
              <div className="group/input rounded-md border border-zinc-300 bg-white transition duration-200 hover:border-sky-500 focus-within:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-sky-400 dark:focus-within:border-sky-400">
                <Input
                  id="signup-last-name"
                  value={values.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  placeholder="Durden"
                  autoComplete="family-name"
                  disabled={isLoading}
                  className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="signup-email" className="text-black dark:text-white">
            Email address
          </Label>
          <div className="group/input rounded-md border border-zinc-300 bg-white transition duration-200 hover:border-sky-500 focus-within:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-sky-400 dark:focus-within:border-sky-400">
            <Input
              id="signup-email"
              type="email"
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@company.com"
              autoComplete="email"
              disabled={isLoading}
              className="h-10 border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password" className="text-black dark:text-white">
            Password
          </Label>
          <div className="group/input relative rounded-md border border-zinc-300 bg-white transition duration-200 hover:border-sky-500 focus-within:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-sky-400 dark:focus-within:border-sky-400">
            <Input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={(e) => updateField("password", e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={isLoading}
              className="h-10 border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {showConfirmPasswordField ? (
          <div className="space-y-1.5">
            <Label htmlFor="signup-confirm-password" className="text-black dark:text-white">
              Re-enter password
            </Label>
            <div className="group/input relative rounded-md border border-zinc-300 bg-white transition duration-200 hover:border-sky-500 focus-within:border-sky-500 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-sky-400 dark:focus-within:border-sky-400">
              <Input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={values.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                disabled={isLoading}
                className="h-10 border-0 bg-transparent pr-10 shadow-none focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute inset-y-0 right-0 inline-flex items-center px-3 text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <Button type="submit" className="h-10 w-full rounded-md" disabled={isLoading || state === "success"}>
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={state}
            className="inline-flex items-center gap-2"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 4 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0.9 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduceMotion ? 0.08 : 0.18 }}
          >
            {state === "loading" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            {state === "success" ? <CheckCircle2 className="size-4" aria-hidden /> : null}
            <span>
              {state === "loading" ? loadingLabel : state === "success" ? successLabel : submitLabel}
            </span>
          </motion.span>
        </AnimatePresence>
      </Button>

      {showSocialLogins ? (
        <>
          <div className="h-px w-full bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-start gap-2.5 rounded-md"
              disabled={isLoading}
              onClick={() => onSocialLogin?.("github")}
            >
              <Github className="size-4" aria-hidden />
              GitHub
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-start gap-2.5 rounded-md"
              disabled={isLoading}
              onClick={() => onSocialLogin?.("apple")}
            >
              <AppleMark className="size-4" />
              Apple
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-start gap-2.5 rounded-md"
              disabled={isLoading}
              onClick={() => onSocialLogin?.("google")}
            >
              <GoogleMark className="size-4" />
              Google
            </Button>
          </div>
        </>
      ) : null}

      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="signup-error"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0.9 } : { opacity: 0, y: -4 }}
            className="text-sm text-destructive"
            role="alert"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.form>
  );
}
