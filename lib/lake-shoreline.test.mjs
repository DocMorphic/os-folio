import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {shorelineRadius,shorelineShader,createShoreline,DEFAULT_SHORELINE,keepCameraInsideLake} from './lake-shoreline.mjs';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {shorelineGeometry,SHORE_PHOTO_HEIGHT,SHORE_RELIEF_ROWS,shoreRelief}=await import('./world-landscape.ts');

test('shoreline wraps continuously, with asymmetric coves and no sharp joins',()=>{
  const step=2*Math.PI/1024;
  let maxStep=0;
  for(let i=0;i<=1024;i++){
    const a=i*step,r=shorelineRadius(a);
    assert.ok(Math.abs(r-shorelineRadius(a+2*Math.PI))<1e-9);
    maxStep=Math.max(maxStep,Math.abs(r-shorelineRadius(a+step)));
  }
  assert.ok(maxStep<3);
  assert.ok(Math.abs(shorelineRadius(.5)-shorelineRadius(.5+Math.PI))>10);
});
test('photo geometry and water use the same world-space shoreline profile',()=>{
  const geometry=shorelineGeometry(),p=geometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),z=p.getZ(i);
    const angle=Math.atan2(z,x),bank=shorelineRadius(angle),height=p.getY(i)+(SHORE_PHOTO_HEIGHT-16)/2;
    assert.ok(Math.abs(Math.hypot(x,z)-bank-shoreRelief(height,angle,bank))<.0001);
  }
  for(const feature of DEFAULT_SHORELINE.features){
    assert.ok(shorelineShader().includes(feature.angle.toFixed(12)));
  }
  const water=readFileSync(new URL('./world-water.ts',import.meta.url),'utf8');
  assert.match(water,/shoreRadius-24\.,shoreRadius-1\./);
  assert.doesNotMatch(water,/blood|setBlood/);
  assert.equal(geometry.index.count/3,512*SHORE_RELIEF_ROWS,"relief stays a single bounded draw");
  geometry.dispose();
});
test('different seeds visibly reshape the lake, while a visit is repeatable and bounded',()=>{
  assert.deepEqual(createShoreline(13),createShoreline(13));
  assert.notDeepEqual(createShoreline(13),createShoreline(742));
  for(let seed=0;seed<100;seed++){
    const profile=createShoreline(seed*104729),radii=Array.from({length:720},(_,i)=>shorelineRadius(i/720*Math.PI*2,profile));
    assert.ok(Math.min(...radii)>=51.9);
    assert.ok(Math.max(...radii)<=224.1);
    assert.ok(Math.max(...radii)-Math.min(...radii)>95);
    assert.equal('knots' in profile,false,'no fixed alternating radial stations');
  }
});
test('near and far shores retain physical tree scale rather than cancelling perspective',()=>{
  for(const seed of [13,417,742,104729]){
    const geometry=shorelineGeometry(createShoreline(seed)),p=geometry.attributes.position,uv=geometry.attributes.uv;
    const densities=[],angularDensities=[],base=SHORE_RELIEF_ROWS*257;
    for(let i=1;i<=256;i++){
      const length=Math.hypot(p.getX(base+i)-p.getX(base+i-1),p.getZ(base+i)-p.getZ(base+i-1));
      densities.push((uv.getX(i)-uv.getX(i-1))/length);
      angularDensities.push(uv.getX(i)-uv.getX(i-1));
      assert.ok(Math.abs(p.getY(i)-p.getY(0))<1e-5,'close terrain must not be shrunk vertically');
      assert.equal(uv.getX(i),uv.getX(i+base),'vertical texture columns stay aligned');
    }
    assert.ok(Math.max(...densities)/Math.min(...densities)<1.001,'constant metres per source pixel along every bank');
    assert.ok(Math.max(...angularDensities)/Math.min(...angularDensities)>2,'near features use more screen width than distant features');
    assert.equal(uv.getX(0),0);assert.equal(uv.getX(256),1);
    assert.equal(p.getY(0)-p.getY(base),SHORE_PHOTO_HEIGHT+16);
    geometry.dispose();
  }
});
test('bank contact stays fixed while hills recede for true parallax',()=>{
  for(const angle of [0,.4,1,2,3,4,5]){
    const bank=shorelineRadius(angle);
    assert.equal(shoreRelief(0,angle,bank),0);
    assert.equal(shoreRelief(-10,angle,bank),0);
    assert.ok(shoreRelief(40,angle,bank)>shoreRelief(8,angle,bank));
    assert.ok(bank+shoreRelief(64,angle,bank)<=226);
  }
});
test('randomness changes basin orientation and feature count, without opposing narrow necks',()=>{
  const counts=new Set(),orientations=new Set();
  for(let seed=0;seed<80;seed++){
    const profile=createShoreline(seed*104729);
    counts.add(profile.features.length);orientations.add(Math.floor(profile.rotation));
    for(let i=0;i<360;i++){
      const a=i/360*Math.PI*2;
      assert.ok(shorelineRadius(a,profile)+shorelineRadius(a+Math.PI,profile)>175,'do not pinch both sides into a figure-eight neck');
    }
  }
  assert.ok(counts.size>=4);assert.ok(orientations.size>=5);
});
test('zoom and wide entrance cameras cannot cross the close shoreline',()=>{
  for(let i=0;i<360;i++){
    const a=i/360*Math.PI*2,p=keepCameraInsideLake({x:Math.cos(a)*120,y:18,z:Math.sin(a)*120});
    assert.ok(Math.hypot(p.x,p.z)<=shorelineRadius(a)-9.99);
    assert.equal(p.y,18);
  }
  assert.deepEqual(keepCameraInsideLake({x:12,y:8,z:16}),{x:12,y:8,z:16});
});
