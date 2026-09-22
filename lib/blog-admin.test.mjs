import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { adminConfigured, validPassword, createAdminSession, validAdminSession, sameOrigin, validBlogId } from "./blog-admin.ts";

const original = process.env.BLOG_ADMIN_PASSWORD;
test.after(() => { if (original === undefined) delete process.env.BLOG_ADMIN_PASSWORD; else process.env.BLOG_ADMIN_PASSWORD = original; });

test("admin authentication requires a configured password but allows the owner's chosen length", () => {
  delete process.env.BLOG_ADMIN_PASSWORD;
  assert.equal(adminConfigured(), false);
  assert.equal(validPassword("anything"), false);
  assert.equal(validAdminSession("anything"), false);
  process.env.BLOG_ADMIN_PASSWORD = "short";
  assert.equal(validPassword("short"), true);
  const token = createAdminSession();
  assert.equal(validAdminSession(token), true);
  process.env.BLOG_ADMIN_PASSWORD = "";
  assert.equal(validPassword(""), false);
  assert.equal(validAdminSession(token), false);
});

test("owner sessions reject wrong passwords, tampering, expiration and password rotation", () => {
  process.env.BLOG_ADMIN_PASSWORD = "test-only-long-owner-password-123";
  assert.equal(validPassword("test-only-long-owner-password-123"), true);
  assert.equal(validPassword("wrong"), false);
  assert.equal(validPassword(null), false);
  const now = 1_790_000_000_000;
  const token = createAdminSession(now);
  assert.equal(validAdminSession(token, now), true);
  assert.equal(validAdminSession(token, now + 3_600_000), false);
  assert.equal(validAdminSession(token, now - 3_600_000), false);
  assert.equal(validAdminSession(token.slice(0, -1) + (token.endsWith("a") ? "b" : "a"), now), false);
  assert.equal(validAdminSession("garbage", now), false);
  process.env.BLOG_ADMIN_PASSWORD = "a-different-long-owner-password-456";
  assert.equal(validAdminSession(token, now), false);
});

test("mutations require same origin and one valid UUID", () => {
  assert.equal(sameOrigin(new Request("https://example.com/api/blogs", { headers: { Origin: "https://example.com" } })), true);
  assert.equal(sameOrigin(new Request("https://example.com/api/blogs", { headers: { Origin: "https://evil.example" } })), false);
  assert.equal(sameOrigin(new Request("https://example.com/api/blogs")), false);
  assert.equal(validBlogId("5dc7af2b-7381-4ba3-a18b-90090bdb8af9"), true);
  for (const id of [null, {}, "", "*", "anything&or=(id.neq.null)"]) assert.equal(validBlogId(id), false);
});

test("delete is authenticated before touching storage; sessions stay HttpOnly", () => {
  const route = readFileSync(new URL("../app/api/blogs/route.ts", import.meta.url), "utf8");
  const handler = route.slice(route.indexOf("export async function DELETE"), route.indexOf("export async function POST"));
  assert.ok(handler.indexOf("validAdminSession") < handler.indexOf("await deleteBlog"));
  assert.match(handler, /validBlogId\(body\?\.id\)/);
  const admin = readFileSync(new URL("../app/api/blogs/admin/route.ts", import.meta.url), "utf8");
  assert.match(admin, /httpOnly: true/);
  assert.match(admin, /sameSite: "strict"/);
  assert.match(admin, /secure: process.env.NODE_ENV === "production"/);
  assert.match(admin, /maxAge: 0/);
});

test("deletion scopes the request to one ID and never reports success for an empty result", async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const previousFetch = globalThis.fetch;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "fake-service-key";
  try {
    const { deleteBlog } = await import("./blogs-store.ts");
    const id = "5dc7af2b-7381-4ba3-a18b-90090bdb8af9";
    let requests = 0;
    globalThis.fetch = async (url, options) => {
      requests++;
      assert.equal(new URL(url).searchParams.get("id"), `eq.${id}`);
      assert.equal(options.method, "DELETE");
      assert.equal(options.headers.apikey, "fake-service-key");
      return Response.json([]);
    };
    assert.equal(await deleteBlog(id), "missing");
    assert.equal(await deleteBlog("*"), "failed");
    assert.equal(requests, 1);
    globalThis.fetch = async () => Response.json([{ id }]);
    assert.equal(await deleteBlog(id), "deleted");
    globalThis.fetch = async () => new Response(null, { status: 403 });
    assert.equal(await deleteBlog(id), "failed");
  } finally {
    globalThis.fetch = previousFetch;
    for (const [name, value] of [["NEXT_PUBLIC_SUPABASE_URL", previousUrl], ["SUPABASE_SERVICE_ROLE_KEY", previousKey]]) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
  }
});
