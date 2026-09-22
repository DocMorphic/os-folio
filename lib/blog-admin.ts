import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "blog-admin";
export const SESSION_SECONDS = 3600;

function password(): string | undefined {
  const value = process.env.BLOG_ADMIN_PASSWORD;
  return value && value.length <= 512 ? value : undefined;
}

export function adminConfigured(): boolean {
  return !!(password() && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function validPassword(input: unknown): boolean {
  const secret = password();
  if (!secret || typeof input !== "string" || input.length > 512) return false;
  return timingSafeEqual(createHash("sha256").update(input).digest(), createHash("sha256").update(secret).digest());
}

function signature(payload: string): string {
  return createHmac("sha256", password()!).update(`blog-admin-session:${payload}`).digest("hex");
}

export function createAdminSession(now = Date.now()): string {
  if (!password()) throw new Error("Admin password not configured");
  const payload = `${Math.floor(now / 1000) + SESSION_SECONDS}.${randomBytes(24).toString("hex")}`;
  return `${payload}.${signature(payload)}`;
}

export function validAdminSession(token: string | undefined, now = Date.now()): boolean {
  if (!password() || !token || !/^\d{10}\.[a-f0-9]{48}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, nonce, mac] = token.split(".");
  const current = Math.floor(now / 1000);
  if (Number(expires) <= current || Number(expires) > current + SESSION_SECONDS) return false;
  return timingSafeEqual(Buffer.from(mac, "hex"), Buffer.from(signature(`${expires}.${nonce}`), "hex"));
}

export function sameOrigin(request: Request): boolean {
  return request.headers.get("origin") === new URL(request.url).origin;
}

export function validBlogId(id: unknown): id is string {
  return typeof id === "string" && /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(id);
}
