import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
