import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("blog notification is retained by the serverless request lifecycle", () => {
  const route = readFileSync(new URL("../app/api/blogs/route.ts", import.meta.url), "utf8");
  assert.match(route, /import \{ after, NextRequest, NextResponse \} from "next\/server"/);
  assert.match(route, /after\(async \(\) => \{\s*const result = await sendNewBlogEmail/);
  assert.match(route, /if \(!result.ok\) console.error/);
  assert.ok(route.indexOf("if (!entry)") < route.indexOf("after(async"));
});
