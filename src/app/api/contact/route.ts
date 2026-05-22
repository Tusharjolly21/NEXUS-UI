import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
};

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as ContactBody | null;

  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim() ?? "";
  const company = body?.company?.trim() ?? "";
  const message = body?.message?.trim() ?? "";

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const supabase = getAdminClient();
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
  const notifyEmail = process.env.CONTACT_NOTIFY_EMAIL;

  if (resendKey && notifyEmail) {
    const resend = new Resend(resendKey);
    const { error: emailError } = await resend.emails.send({
      from: "Nexus-UI <contact@nexus-ui.com>",
      to: notifyEmail,
      replyTo: email,
      subject: `New contact from ${name}${company ? ` @ ${company}` : ""}`,
      html: `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${company ? `<p><strong>Topic:</strong> ${company}</p>` : ""}
        <hr />
        <p>${message.replace(/\n/g, "<br />")}</p>
      `,
    });
    if (emailError) {
      console.error("Contact email send failed:", JSON.stringify(emailError));
    }
  }

  return NextResponse.json({ success: true });
}
