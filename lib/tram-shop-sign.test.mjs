import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import sharp from 'sharp';
import {createTramShopSign,BILLBOARD,roadsidePlank} from './tram-shop-sign.ts';

test('roadside artwork keeps its full resolution and 3:1 proportions',async()=>{
  const metadata=await sharp(new URL('../public'+BILLBOARD.texture,import.meta.url).pathname).metadata();
  assert.ok(metadata.width>=2048);
  assert.equal(metadata.width/metadata.height,3);
  assert.equal(BILLBOARD.width/BILLBOARD.height,3);
});

test('billboard has timber depth, connected roof supports, lamps, and night readability',async()=>{
  const load=THREE.TextureLoader.prototype.loadAsync,texture=new THREE.Texture();
  THREE.TextureLoader.prototype.loadAsync=async()=>texture;
  const scene=new THREE.Scene(),materials=[];let sign;
  try{sign=createTramShopSign(scene,materials);await sign.ready;}finally{THREE.TextureLoader.prototype.loadAsync=load;}
  const named=name=>sign.root.children.filter(o=>o.name===name);
  const boards=named('Billboard / painted timber plank');
  assert.equal(boards.length,7,'six courses, with one split bottom board');
  assert.equal(boards.filter(b=>b.userData.brokenEnd).length,1);
  assert.equal(scene.getObjectByName('Billboard / painted welcome face'),undefined,'no uninterrupted poster plane');
  assert.equal(named('Billboard / bolted mounting foot').length,2);
  assert.equal(named('Billboard / roof bolt').length,4);
  assert.equal(named('Billboard / attached lamp arm').length,2);
  const paint=boards[0].material[0];
  assert.equal(paint.map.colorSpace,THREE.SRGBColorSpace);
  assert.equal(paint.map.anisotropy,8);
  assert.notEqual(paint,boards[0].material[1],'end grain remains bare wood');
  sign.update(0);assert.equal(paint.emissive.getHex(),0);
  sign.update(1);assert.equal(paint.emissive.getHex(),0,'paint never glows');
  assert.equal(paint.emissiveMap,null);
  const pools=named('Billboard / warm downlight');assert.equal(pools.length,2);
  assert.ok(pools.every(l=>l.intensity>0&&l.intensity<1.5&&!l.castShadow&&l.distance<3.2));
  assert.equal(scene.getObjectByName('Billboard / concealed amber backwash'),undefined);
  for(const post of named('Billboard / timber upright')){
    post.geometry.computeBoundingBox();
    const bounds=new THREE.Box3().setFromObject(post);
    assert.ok(bounds.min.y<=4.31&&bounds.max.y>5.7);
  }
  let triangles=0;sign.root.traverse(o=>{if(o.isMesh){assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));triangles+=(o.geometry.index?.count??o.geometry.attributes.position.count)/3;}});
  assert.ok(triangles<10000);assert.ok(sign.root.children.length<35);
  let disposed=false;texture.addEventListener('dispose',()=>disposed=true);sign.dispose();assert.ok(disposed);
  sign.root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());
});

test('late artwork loads are disposed after world teardown',async()=>{
  const load=THREE.TextureLoader.prototype.loadAsync;
  let resolve;THREE.TextureLoader.prototype.loadAsync=()=>new Promise(r=>{resolve=r;});
  let sign;const materials=[];
  try{sign=createTramShopSign(new THREE.Scene(),materials);}finally{THREE.TextureLoader.prototype.loadAsync=load;}
  sign.dispose();const texture=new THREE.Texture();let disposed=false;texture.addEventListener('dispose',()=>disposed=true);
  resolve(texture);await sign.ready;assert.ok(disposed);
  const board=sign.root.getObjectByName('Billboard / painted timber plank');
  assert.equal(board.material[0],board.material[1],'unloaded board remains bare wood');
  sign.root.traverse(o=>{if(o.isMesh)o.geometry.dispose();});materials.forEach(m=>m.dispose());
});

test('chipped board geometry has real thickness and continuous artwork coordinates',()=>{
  for(let row=0;row<6;row++){
    const g=roadsidePlank(row,-BILLBOARD.width/2,BILLBOARD.width/2);g.computeBoundingBox();
    assert.ok(g.boundingBox.max.z-g.boundingBox.min.z>.15);
    assert.ok(g.groups.some(group=>group.materialIndex===0));
    assert.ok(g.groups.some(group=>group.materialIndex===1));
    const p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal;
    for(let i=0;i<p.count;i++)if(n.getZ(i)>.99){
      assert.ok(Math.abs(uv.getX(i)-(p.getX(i)/BILLBOARD.width+.5))<1e-6);
      assert.ok(Math.abs(uv.getY(i)-(p.getY(i)/BILLBOARD.height+(row+.5)/6))<1e-6);
    }
    g.dispose();
  }
});
