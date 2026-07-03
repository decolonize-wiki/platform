import { NextResponse } from "next/server";

// Contacts are account-wide in Resend's current API (audienceId was removed with the
// Audiences→Contacts redesign); opt-in behavior is configured in the Resend dashboard.
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (
    typeof email !== "string" ||
    email.length > 254 ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
  ) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Signup is not configured yet." }, { status: 503 });
  }
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const r = await resend.contacts.create({
      email,
      unsubscribed: false,
    });
    if (r.error) {
      return NextResponse.json({ error: "Could not subscribe — try again." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Could not subscribe — try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
