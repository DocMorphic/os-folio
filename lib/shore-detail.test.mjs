import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createShoreDetail,shoreDetailGeometry} from './shore-detail.ts';
import {createShoreline,shorelineRadius} from './lake-shoreline.mjs';

test('close-bank forest is varied, curved, finite and bounded to one draw',()=>{
  for(const seed of [13,417,742,104729]){
    const profile=createShoreline(seed),g=shoreDetailGeometry(profile),p=g.attributes.position;
    assert.ok(g.index.count/3<5000);
    for(let i=0;i<p.count;i++){
      const x=p.getX(i),z=p.getZ(i),radius=Math.hypot(x,z),bank=shorelineRadius(Math.atan2(z,x),profile);
      assert.ok(Number.isFinite(p.getY(i)));
      assert.ok(radius>=bank+.9&&radius<bank+6,'forest sits on dry land behind the water boundary');
    }
    const repeat=shoreDetailGeometry(profile);
    assert.deepEqual(g.attributes.position.array,repeat.attributes.position.array,'stable within a visit');
    g.dispose();repeat.dispose();
  }
});
test('forest shares night state, waits for its texture and cleans up all GPU resources',async()=>{
  const scene=new THREE.Scene(),night={value:0},detail=createShoreDetail(scene,night);
  await detail.ready;
  assert.equal(scene.children.length,1);assert.equal(detail.mesh.material.uniforms.night,night);
  assert.equal(detail.mesh.visible,false,'no blank rectangle before the cutout loads');
  const texture=detail.mesh.material.uniforms.forest.value;
  assert.equal(texture.minFilter,THREE.LinearMipmapLinearFilter);
  let disposed=0;
  for(const resource of [detail.mesh.geometry,detail.mesh.material,texture])resource.addEventListener('dispose',()=>disposed++);
  detail.dispose();assert.equal(disposed,3);
});
