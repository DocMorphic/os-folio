import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildCoffeeCup} from './tram-coffee.ts';

test('coffee props use hollow porcelain geometry, inset liquid and fitted accessories',()=>{
  const parent=new THREE.Group(),materials=[];
  const cup=buildCoffeeCup(parent,materials,[1,2,3]);
  assert.equal(parent.children[0],cup);
  assert.deepEqual(cup.position.toArray(),[1,2,3]);
  const body=cup.children[0];
  assert.ok(body.geometry instanceof THREE.LatheGeometry);
  assert.ok(body.material instanceof THREE.MeshPhysicalMaterial);
  assert.equal(body.material.clearcoat,1);
  const liquid=cup.children[2];
  body.geometry.computeBoundingBox();
  assert.ok(liquid.position.y<body.geometry.boundingBox.max.y,'coffee below the rim');
  assert.ok(cup.children.some(m=>m.geometry instanceof THREE.TubeGeometry),'curved handle');
  let triangles=0;
  for(const mesh of cup.children){
    triangles+=(mesh.geometry.index?.count??mesh.geometry.attributes.position.count)/3;
    assert.ok(mesh.geometry.attributes.position.array.every(Number.isFinite));mesh.geometry.dispose();
  }
  assert.ok(triangles<4000,'small static prop budget');materials.forEach(m=>m.dispose());
});
