"use client";

import * as React from "react";
import { Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { pillClassName } from "@/components/site/pill-link";

const EMPTY = { name: "", email: "", topic: "", message: "", website: "" };
const FIELD = "h-[51px] rounded-full border-border bg-background px-5 text-[16px]";

export function ContactForm() {
  const [fields, setFields] = React.useState(EMPTY);
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState("");
  const busy = status === "loading";

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fields.name,
          email: fields.email,
          company: fields.topic,
          message: fields.message,
          website: fields.website,
        }),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(data.error ?? "The message didn't send. Try again, or email us directly.");
        setStatus("error");
      } else {
        setStatus("success");
        setFields(EMPTY);
      }
    } catch {
      setErrorMsg("Couldn't reach the server. Check your connection, or email us directly.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="pg-float flex flex-col items-start rounded-tile bg-card p-7 sm:p-8">
        <span className="grid size-11 place-items-center rounded-full bg-tint-mint text-[#126b3a] dark:text-[#7ee2a8]">
          <Check className="size-5" aria-hidden />
        </span>
        <h2 className="mt-5 text-[24px] font-bold tracking-[-0.03em] text-foreground">Message sent</h2>
        <p className="mt-2 max-w-[420px] text-[16px] leading-relaxed text-muted-foreground">
          We&apos;ll reply to the email you gave. If it&apos;s about a bug, a reproduction link speeds things up.
        </p>
        <button type="button" onClick={() => setStatus("idle")} className={pillClassName("white", "sm", "mt-6")}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="pg-float relative grid gap-5 rounded-tile bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="name" className="text-[14px] font-medium">Name</Label>
          <Input id="name" name="name" autoComplete="name" value={fields.name} onChange={handleChange} required disabled={busy} className={FIELD} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-[14px] font-medium">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" value={fields.email} onChange={handleChange} required disabled={busy} className={FIELD} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="topic" className="text-[14px] font-medium">
          Topic <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="topic"
          name="topic"
          value={fields.topic}
          onChange={handleChange}
          placeholder="Install help, a bug, billing, a component idea"
          disabled={busy}
          className={FIELD}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message" className="text-[14px] font-medium">Message</Label>
        <Textarea
          id="message"
          name="message"
          value={fields.message}
          onChange={handleChange}
          placeholder="What are you building, and where are you stuck?"
          required
          disabled={busy}
          className="min-h-44 resize-y rounded-[22px] border-border bg-background px-5 py-4 text-[16px]"
        />
      </div>

      {/* Honeypot: hidden from people, bots fill it and get silently dropped */}
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" value={fields.website} onChange={handleChange} />
      </div>

      {status === "error" ? (
        <p role="alert" className="rounded-2xl bg-tint-pink px-4 py-3 text-[14px] text-foreground">
          {errorMsg}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={pillClassName("ink", "md", "w-full disabled:opacity-60 sm:w-fit")}>
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
