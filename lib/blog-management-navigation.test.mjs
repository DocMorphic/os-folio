import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => readFileSync(new URL(path, import.meta.url), "utf8");

test("blog management stays inside its existing surface instead of opening a tab", () => {
  for (const path of ["../components/apps/BlogApp.tsx", "../components/JournalVending.tsx"]) {
    const source = read(path);
    assert.doesNotMatch(source, /href="\/admin\/blogs"/);
    assert.match(source, /<BlogManager onBack=/);
    assert.match(source, /setManaging\(true\)/);
  }
  assert.match(read("../app/admin/blogs/page.tsx"), /<Desktop initialBlogManagement/);
  assert.match(read("../components/apps/BlogApp.tsx"), /setManaging\(false\); cachedBlogs = null; void refresh\(\)/);
});

test("returning from the world uses the clean root and old about hashes are stripped", () => {
  assert.match(read("../components/WorldPage.tsx"), /navigateImmersive\("\/",/);
  assert.doesNotMatch(read("../app/layout.tsx"), /href="#about"/);
  const desktop = read("../components/desktop/Desktop.tsx");
  assert.match(desktop, /window.location.hash === "#about"/);
  assert.match(desktop, /replaceState\(window.history.state, "", window.location.pathname \+ window.location.search\)/);
});
