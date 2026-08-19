import { NextResponse } from "next/server";
import { addBlog, listBlogs } from "@/lib/blogs-store";
import { sendNewBlogEmail } from "@/lib/email";

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
  return NextResponse.json({ blogs });
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

  // Best-effort notification — a failed email should never fail the submission.
  sendNewBlogEmail({ title: entry.title, url: entry.url }).catch(() => {});

  return NextResponse.json({ blog: entry });
}
