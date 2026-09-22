import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {aboutData} from '../content/about.ts';
const read=path=>readFileSync(new URL(path,import.meta.url),'utf8');

test('About restores all four social icons and keeps X on the correct account',()=>{
  assert.equal(aboutData.socials.x,'https://x.com/DocMorphic');
  const source=read('../components/AboutSocialLinks.tsx');
  for(const name of ['GitHub','LinkedIn','X'])assert.ok(source.includes(`label: "${name}"`));
  assert.match(source,/<span>Contact<\/span>/);
  assert.match(source,/target="_blank" rel="noopener noreferrer"/);
  assert.match(source,/aria-label=\{`\$\{label\} \(opens in a new tab\)`\}/);
  assert.match(source,/<button type="button" onClick=\{onContact\}/);
  assert.match(read('../components/apps/AboutApp.tsx'),/<AboutSocialLinks onContact=\{\(\) => openWindow\("contact"\)\}/);
  assert.match(read('../components/ComputerTerminal.tsx'),/<AboutSocialLinks onContact=\{\(\) => navigate\(\{section:"contact"\}\)\}/);
  const css=read('../components/AboutSocialLinks.module.css');
  assert.match(css,/flex-wrap: wrap/);assert.match(css,/min-height: 44px/);assert.match(css,/:focus-visible/);
});
