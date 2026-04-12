import { NextResponse } from "next/server";
import { sendContactEmail, type ContactPayload } from "@/lib/email";

export const dynamic = "force-dynamic";

// Max 1 request per 5s per IP — very light rate limiting
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 5000;

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const last = rateLimitMap.get(ip);
  if (last && now - last < RATE_LIMIT_WINDOW_MS) {
    return false;
  }
  rateLimitMap.set(ip, now);
  // Clean up old entries occasionally
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (now - v > RATE_LIMIT_WINDOW_MS * 10) rateLimitMap.delete(k);
    }
  }
  return true;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "please wait before sending another message" }, { status: 429 });
  }

  let body: Partial<ContactPayload> & { website?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Honeypot field — if filled, silently drop (bot)
  if (body.website) {
    return NextResponse.json({ ok: true });
  }

  const payload: ContactPayload = {
    name: (body.name || "").toString().trim(),
    email: (body.email || "").toString().trim(),
    subject: (body.subject || "").toString().trim(),
    message: (body.message || "").toString().trim(),
  };

  const result = await sendContactEmail(payload);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
