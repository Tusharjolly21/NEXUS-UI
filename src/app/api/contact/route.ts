import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { legalConfig } from "@/lib/legal";
import { buildContactEmail } from "@/lib/contact-email";

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
  // Honeypot — must be empty; bots fill it, humans don't
  website?: string;
};

const URL_RE = /https?:\/\/|www\./i;
// Flag messages that are mostly non-ASCII random-looking characters
const GIBBERISH_RE = /^[a-z0-9]{20,}$/i;

function looksLikeSpam(name: string, message: string): boolean {
  if (URL_RE.test(name)) return true;
  if (GIBBERISH_RE.test(name.replace(/\s/g, ""))) return true;
  if (GIBBERISH_RE.test(message.replace(/\s/g, ""))) return true;
  // Reject messages that are >80% uppercase (common in spam blasts)
  const letters = message.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 20) {
    const upper = (message.match(/[A-Z]/g) ?? []).length;
    if (upper / letters.length > 0.8) return true;
  }
  return false;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ContactBody | null;

  // Honeypot check — real browsers leave this empty
  if (body?.website) {
    return NextResponse.json({ success: true });
  }

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const company = body?.company?.trim() ?? "";
  const message = body?.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  if (name.length > 120 || message.length > 4000 || company.length > 200) {
    return NextResponse.json({ error: "Input too long." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (looksLikeSpam(name, message)) {
    // Return success so bots don't know they were blocked
    return NextResponse.json({ success: true });
  }

  const supabase = getAdminClient();

  // Rate limit: max 3 submissions per email in the last hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("contact_submissions")
    .select("*", { count: "exact", head: true })
    .eq("email", email)
    .gte("created_at", oneHourAgo);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Too many messages from this address. Please wait before trying again." },
      { status: 429 },
    );
  }

  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name,
    email,
    company: company || null,
    message,
  });

  if (dbError) {
    console.error("Contact DB error:", dbError.message);
    return NextResponse.json({ error: "Failed to save your message. Please try again." }, { status: 500 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  // Messages arrive at the same support address the site shows. (CONTACT_NOTIFY_EMAIL is no longer read:
  // it held the old contact@ address and sent notifications to an inbox that does not exist.)
  const notifyEmail = legalConfig.contactEmail;
  // The sender must be on a domain verified in Resend. Override with CONTACT_FROM_EMAIL if needed.
  const from = process.env.CONTACT_FROM_EMAIL?.trim() || `Nexus UI <${legalConfig.contactEmail}>`;

  if (!resendKey) {
    // The message is saved above, so nothing is lost, but nobody gets an email until the key is set.
    console.warn("Contact email not sent: set RESEND_API_KEY.");
  } else {
    const resend = new Resend(resendKey);
    const { subject, html, text } = buildContactEmail({ name, email, topic: company, message });

    const { error: emailError } = await resend.emails.send({
      from,
      to: notifyEmail,
      replyTo: email,
      subject,
      html,
      text,
    });
    if (emailError) {
      console.error("Contact email send failed:", JSON.stringify(emailError));
    }
  }

  return NextResponse.json({ success: true });
}
