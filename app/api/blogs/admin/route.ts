import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, SESSION_SECONDS, adminConfigured, createAdminSession, sameOrigin, validAdminSession, validPassword } from "@/lib/blog-admin";

export const dynamic = "force-dynamic";
const attempts = new Map<string, { count: number; reset: number }>();
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/api/blogs", maxAge: SESSION_SECONDS };
const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export function GET(request: NextRequest) {
  return json({ configured: adminConfigured(), authenticated: adminConfigured() && validAdminSession(request.cookies.get(ADMIN_COOKIE)?.value) });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
  if (!adminConfigured()) return json({ error: "Owner access needs BLOG_ADMIN_PASSWORD and SUPABASE_SERVICE_ROLE_KEY configured on the server." }, 503);
  const now = Date.now();
  for (const [key, value] of attempts) if (value.reset <= now) attempts.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const attempt = attempts.get(ip) ?? { count: 0, reset: now + 15 * 60_000 };
  if (attempt.count >= 5 || attempts.size > 10_000) return json({ error: "Too many attempts. Try again in 15 minutes." }, 429);
  attempt.count++;
  attempts.set(ip, attempt);
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request." }, 400); }
  if (!validPassword(body?.password)) return json({ error: "Incorrect password." }, 401);
  attempts.delete(ip);
  const response = json({ authenticated: true });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), cookieOptions);
  return response;
}

export function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return json({ error: "Invalid origin." }, 403);
  const response = json({ authenticated: false });
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
