import test from 'node:test';
import assert from 'node:assert/strict';
import {statSync} from 'node:fs';
import {GRILL_POSITION,STEAM_COUNT,steamPose,grillGain,coffeeSteamPose,COFFEE_STEAM_ORIGINS} from './tram-kitchen.ts';

test('grill is quiet near the counter, fades with distance, and ducks for reading',()=>{
  assert.equal(GRILL_POSITION.y,2.25);
  assert.ok(grillGain(4,false)<=.12);
  assert.ok(grillGain(4,false)>grillGain(12,false));
  assert.equal(grillGain(25,false),0);
  assert.ok(grillGain(4,true)<=grillGain(4,false)*.11);
  assert.ok(statSync(new URL('../public/audio/world/grill-sizzle.mp3',import.meta.url)).size<180000);
});
test('steam rises from both patties with varied lifetimes and invisible reset seams',()=>{
  assert.ok(STEAM_COUNT<=40);
  assert.ok(new Set(Array.from({length:STEAM_COUNT},(_,i)=>steamPose(1,i).alpha.toFixed(3))).size>20);
  for(let i=0;i<STEAM_COUNT;i++)for(let t=0;t<15;t+=.03){
    const p=steamPose(t,i),next=steamPose(t+.016,i);
    for(const v of Object.values(p))assert.ok(Number.isFinite(v));
    assert.ok(p.y>=.22&&p.y<=1.15&&p.size<.48&&p.alpha>=0&&p.alpha<=1);
    if(next.y<p.y-.5)assert.ok(p.alpha<.005&&next.alpha<.005,'recycle only while invisible');
  }
});
test('coffee steam begins at the liquid surface, rises gently and fades before recycling',()=>{
  assert.equal(COFFEE_STEAM_ORIGINS.length,2);
  assert.ok(Math.abs(COFFEE_STEAM_ORIGINS[0].y-(2.23+.012+.178))<.01);
  for(let i=0;i<24;i++)for(let t=0;t<12;t+=.037){
    const p=coffeeSteamPose(t,i),next=coffeeSteamPose(t+.016,i);
    assert.ok(Object.values(p).every(Number.isFinite));
    assert.ok(p.y>=0&&p.y<=.42&&p.size<.13&&Math.abs(p.x)<.036&&Math.abs(p.z)<.026);
    if(next.y<p.y-.3)assert.ok(p.alpha<.005&&next.alpha<.005);
  }
});
