import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const require=createRequire(import.meta.url);
const source=readFileSync(new URL('../components/ChocolateProduct.tsx',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const module={exports:{}};
new Function('require','module','exports',compiled)(require,module,module.exports);
const {ChocolateProduct}=module.exports;
const render=index=>renderToStaticMarkup(createElement(ChocolateProduct,{index,label:'07'}));

test('eight chocolates have different physical silhouettes, not palette swaps',()=>{
  const products=Array.from({length:8},(_,i)=>render(i));
  assert.equal(new Set(products.map(s=>s.match(/data-shape="([^"]+)"/)[1])).size,8);
  assert.equal(new Set(products.map(s=>s.match(/data-chocolate="([^"]+)"/)[1])).size,8);
  for(const product of products){
    assert.match(product,/viewBox="0 0 120 190"/);
    assert.match(product,/>07<\/text>/);
    assert.doesNotMatch(product,/NaN|undefined|<image/);
  }
});
test('assortment wraps after eight products, including later blog pages',()=>{
  for(let i=0;i<24;i++)assert.equal(render(i).match(/data-shape="([^"]+)"/)[1],render(i%8).match(/data-shape="([^"]+)"/)[1]);
  const ui=readFileSync(new URL('../components/JournalVending.tsx',import.meta.url),'utf8');
  assert.match(ui,/index=\{page\*8\+i\}/);
  assert.doesNotMatch(ui,/selected.id\)\)%6/);
});
test('multiple products use isolated SVG paint references',()=>{
  const markup=renderToStaticMarkup(createElement('div',null,...Array.from({length:8},(_,index)=>createElement(ChocolateProduct,{index,key:index}))));
  const ids=[...markup.matchAll(/ id="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,40);
  assert.equal(new Set(ids).size,ids.length);
  for(const [,reference] of markup.matchAll(/url\(#([^)]+)\)/g))assert.ok(ids.includes(reference));
});
