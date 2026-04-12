import { NextResponse } from "next/server";
import { trackVisit } from "@/lib/stats-store";

export const dynamic = "force-dynamic";

interface TrackBody {
  sessionId?: string;
  path?: string;
}

export async function POST(request: Request) {
  let body: TrackBody = {};
  try {
    body = await request.json();
  } catch {
    // ignore malformed body
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
  const path = typeof body.path === "string" ? body.path : "/";

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "missing sessionId" }, { status: 400 });
  }

  const ok = await trackVisit(sessionId, path);
  return NextResponse.json({ ok });
}
