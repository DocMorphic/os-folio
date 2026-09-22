import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../components/desktop/Taskbar.tsx", import.meta.url), "utf8");
const tree = ts.createSourceFile("Taskbar.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("dock tooltip sits outside the overflow scrolling strip", () => {
  let tooltip;
  const visit = (node) => {
    if (ts.isJsxElement(node) && node.openingElement.attributes.properties.some(
      (attr) => ts.isJsxAttribute(attr) && attr.name.getText(tree) === "role" && attr.initializer?.getText(tree) === '"tooltip"'
    )) tooltip = node;
    ts.forEachChild(node, visit);
  };
  visit(tree);
  assert.ok(tooltip);
  for (let parent = tooltip.parent; parent; parent = parent.parent) {
    if (!ts.isJsxElement(parent)) continue;
    assert.doesNotMatch(parent.openingElement.getText(tree), /desktop-dock-items|dock-item\s/);
  }
  assert.match(css, /\.desktop-dock-items\s*\{[^}]*overflow-x:auto/);
  assert.doesNotMatch(css, /\.dock-tooltip\s*\{[^}]*opacity:\s*0/);
});

test("labels support hover and keyboard focus and dismiss when their anchor moves", () => {
  assert.match(source, /onMouseEnter=.*showTooltip/);
  assert.match(source, /onFocus=.*showTooltip/);
  assert.match(source, /onBlur=.*setTooltip\(null\)/);
  assert.match(source, /onScroll=.*setTooltip\(null\)/);
  assert.match(source, /addEventListener\("resize", dismiss\)/);
  assert.match(source, /Math.max\(600, .*win.zIndex \+ 1/);
});
