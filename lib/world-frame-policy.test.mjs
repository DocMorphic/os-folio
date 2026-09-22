import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {worldFramePolicy} from './world-frame-policy.ts';
test('world retains fixed Retina detail while orbiting, zooming and resting',()=>{
  assert.deepEqual(worldFramePolicy(true,2),{pixelRatio:2,idleDelay:0});
  assert.deepEqual(worldFramePolicy(false,2),{pixelRatio:2,idleDelay:16});
  assert.equal(worldFramePolicy(true,1).pixelRatio,1);
  assert.equal(worldFramePolicy(true,1.5).pixelRatio,1.5);
  assert.equal(worldFramePolicy(true,3).pixelRatio,2);
  assert.equal(worldFramePolicy(true,NaN).pixelRatio,1);
  assert.equal(worldFramePolicy(true,0).pixelRatio,1);
});
test('slow frames never lower resolution and large viewports are not downscaled',()=>{
  const room=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.doesNotMatch(room,/createWorldQuality|quality\.sample|quality\.ratio|water\.setResolution|1440\/width|1000\/height/);
  assert.match(room,/renderer.setSize\(width,height,false\)/);
  assert.match(room,/host.dataset.quality="high"/);
  const water=readFileSync(new URL('./world-water.ts',import.meta.url),'utf8');
  assert.match(water,/textureWidth:1024,textureHeight:1024/);
});
