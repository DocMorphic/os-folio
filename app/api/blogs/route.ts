import { after, NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { addBlog, deleteBlog, listBlogs } from "@/lib/blogs-store";
import { sendNewBlogEmail } from "@/lib/email";
import { ADMIN_COOKIE, adminConfigured, sameOrigin, validAdminSession, validBlogId } from "@/lib/blog-admin";

const MAX_URL_LEN = 1000;
const MAX_TITLE_LEN = 200;

function validateUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

export async function GET() {
  const blogs = await listBlogs();
  return NextResponse.json(
    { blogs },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

export async function DELETE(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!adminConfigured() || !validAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Sign in as the owner to delete blogs." }, { status: 401 });
  }
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (!validBlogId(body?.id)) return NextResponse.json({ error: "Invalid blog ID." }, { status: 400 });
  const result = await deleteBlog(body.id);
  if (result === "failed") return NextResponse.json({ error: "Couldn't delete this blog. Please try again." }, { status: 502 });
  if (result === "missing") return NextResponse.json({ error: "This blog was not found. Refresh the list." }, { status: 404 });
  revalidateTag("blogs", { expire: 0 });
  return NextResponse.json({ deleted: body.id }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const rawUrl = (body as { url?: string })?.url;
  if (typeof rawUrl !== "string" || rawUrl.length === 0 || rawUrl.length > MAX_URL_LEN) {
    return NextResponse.json({ error: "url required" }, { status: 400 });
  }

  const parsed = validateUrl(rawUrl);
  if (!parsed) {
    return NextResponse.json({ error: "invalid url (must be http or https)" }, { status: 400 });
  }

  let title = (body as { title?: string })?.title;
  if (typeof title === "string") {
    title = title.trim().slice(0, MAX_TITLE_LEN);
  } else {
    title = undefined;
  }

  // If no title provided, scrape it from the page via /api/fetch-title
  if (!title) {
    try {
      const origin = new URL(req.url).origin;
      const res = await fetch(`${origin}/api/fetch-title`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: parsed.toString() }),
      });
      const data = (await res.json()) as { title?: string };
      if (data.title) title = data.title;
    } catch {
      // Ignore — fall through to hostname fallback
    }
  }

  // Final fallback: hostname
  if (!title) {
    title = parsed.hostname;
  }

  const entry = await addBlog(parsed.toString(), title);
  if (!entry) {
    return NextResponse.json(
      { error: "couldn't save blog — supabase not configured or write failed" },
      { status: 500 }
    );
  }

  revalidateTag("blogs", "max");

  // Keep the serverless invocation alive until delivery finishes. An unawaited
  // promise can be frozen as soon as Vercel sends the response.
  after(async () => {
    const result = await sendNewBlogEmail({ title: entry.title, url: entry.url });
    if (!result.ok) console.error("[blog-notify] Notification failed:", result.error);
  });

  return NextResponse.json({ blog: entry });
}
