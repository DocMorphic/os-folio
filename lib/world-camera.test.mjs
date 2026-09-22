import test from "node:test";
import assert from "node:assert/strict";
import {safeWorldCamera,worldFlightWaypoints,worldFlightCurve,worldEntranceCurve} from "./world-camera.ts";
import * as THREE from "three";
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){if(specifier.startsWith('./')&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes('/lib/'))return next(specifier+'.ts',context);return next(specifier,context);}});
const {terrainGeometry,mountainGeometry,createWorldLandscape,TERRAIN_RADII,LANDSCAPE_IMAGES}=await import('./world-landscape.ts');
test("alpine backdrop has tall peaks, snow colours and a bounded single mesh",()=>{
  const geometry=mountainGeometry(),p=geometry.attributes.position,c=geometry.attributes.color;
  let highest=-Infinity,lowest=Infinity,snow=0;
  for(let i=0;i<p.count;i++){
    assert.ok(Number.isFinite(p.getY(i)));highest=Math.max(highest,p.getY(i));lowest=Math.min(lowest,p.getY(i));
    assert.ok(Math.hypot(p.getX(i),p.getZ(i))>166);
    if(c.getX(i)>.6&&c.getY(i)>.6)snow++;
  }
  assert.ok(highest>35);assert.ok(lowest<0);assert.ok(snow>10);
  assert.ok(geometry.index.count/3<=32768);
  for(let row=0;row<=32;row++)assert.ok(new THREE.Vector3().fromBufferAttribute(p,row*513).distanceTo(new THREE.Vector3().fromBufferAttribute(p,row*513+512))<.0001);
  geometry.dispose();
});
test("photographic forest and peaks have a bounded distant range behind their valleys",async()=>{
  assert.ok(TERRAIN_RADII[0]>70);
  const scene=new THREE.Scene(),landscape=createWorldLandscape(scene);await landscape.ready;
  assert.equal(scene.children.length,3);
  assert.equal(landscape.mountains.geometry.index.count/3,12288);
  const p=landscape.mountains.geometry.attributes.position;
  const radii=Array.from({length:p.count},(_,i)=>Math.hypot(p.getX(i),p.getZ(i)));
  assert.ok(Math.min(...radii)>47,"headlands remain outside the central exploration space");
  assert.ok(Math.max(...radii)<226.01,"photographic backdrop remains bounded");
  assert.ok(Math.max(...radii)-Math.min(...radii)>85,"opposite shores have strongly different distances");
  assert.equal(new Set(LANDSCAPE_IMAGES).size,3,"three unique photographic vistas, not tiled mountains");
  const uniforms=landscape.mountains.material.uniforms;
  for(const name of ["panorama","valley","escarpment"])assert.equal(uniforms[name].value.wrapS,THREE.ClampToEdgeWrapping);
  assert.match(landscape.mountains.material.fragmentShader,/shoreMist/);
  assert.doesNotMatch(landscape.mountains.material.fragmentShader,/heightScale/,'camera distance must not resize the terrain to cancel perspective');
  assert.match(landscape.mountains.material.fragmentShader,/aboveForest=max\(0\.,height-10\.\)/,'valley joins preserve the scale of the shoreline trees');
  assert.match(landscape.mountains.material.fragmentShader,/vec2 vistaUV/,"joins descend into valleys rather than cross-fading tall silhouettes");
  landscape.mountains.geometry.computeBoundingBox();
  assert.ok(landscape.mountains.geometry.boundingBox.min.y+landscape.mountains.position.y<-10,"terrain continues below the lake so reflection clipping cannot expose sky");
  const far=landscape.distantMountains,fp=far.geometry.attributes.position;
  assert.equal(far.geometry.index.count/3,512,"one lightweight extra draw, without new texture downloads");
  for(let i=0;i<fp.count;i++)assert.ok(Math.hypot(fp.getX(i),fp.getZ(i))>Math.max(...radii),"distant terrain stays behind every foreground shore");
  assert.ok(far.renderOrder<landscape.mountains.renderOrder,"transparent foreground correctly occludes the distant range");
  assert.ok(Math.abs(far.rotation.y-.47-Math.PI/3)<1e-9,"peaks fill the foreground sector joins");
  assert.equal(far.material.uniforms.panorama.value,uniforms.panorama.value,"texture memory is shared");
  let disposed=0;
  far.geometry.addEventListener("dispose",()=>disposed++);far.material.addEventListener("dispose",()=>disposed++);
  landscape.setNight(1);assert.equal(landscape.mountains.material.uniforms.night.value,1);assert.equal(far.material.uniforms.night.value,1);landscape.dispose();assert.equal(disposed,2);
});
test("entrance sweeps from the rear to the front without crossing the tram or reversing its approach",()=>{
  const to=new THREE.Vector3(-14.375,10.0875,17.25),target=new THREE.Vector3(0,1.65,0),path=worldEntranceCurve(to,target);
  assert.ok(path.getPoint(0).distanceTo(target)>to.distanceTo(target)*1.8);
  assert.ok(path.getPoint(0).z<0,"start behind the tram");
  assert.ok(path.getPoint(1).z>0,"finish at the front");
  const start=path.getPoint(0).sub(target),end=to.clone().sub(target);
  assert.ok((start.x*end.x+start.z*end.z)/(Math.hypot(start.x,start.z)*Math.hypot(end.x,end.z))<-.999,"a full half-orbit reveals the opposite face");
  assert.ok(path.getPoint(1).distanceTo(to)<1e-9);
  let previous=Infinity;
  for(let i=0;i<=300;i++){
    const p=path.getPoint(i/300),distance=p.distanceTo(target);
    assert.ok(distance<=previous+.0001);assert.ok(p.y>6);previous=distance;
    assert.ok(Math.hypot(p.x-target.x,p.z-target.z)>=Math.hypot(end.x,end.z)-.0001,"arc never cuts through the tram");
  }
});
test("terrain wraps around without a seam and has bounded geometry",()=>{
  for(let layer=0;layer<3;layer++){
    const g=terrainGeometry(layer),p=g.attributes.position;
    for(const n of p.array)assert.ok(Number.isFinite(n));
    assert.ok(g.index.count/3<7000);
    for(let row=0;row<=12;row++)assert.ok(new THREE.Vector3().fromBufferAttribute(p,row*257).distanceTo(new THREE.Vector3().fromBufferAttribute(p,row*257+256))<.0001);
    g.dispose();
  }
});
test("orbit cameras stay above ground and outside the tram, but can look over its roof",()=>{
  for(const input of [{x:0,y:2,z:0},{x:4.4,y:2,z:-1},{x:-4.4,y:2,z:-1},{x:0,y:2,z:-2.2}]){
    const p=safeWorldCamera(input);assert.ok(p.x<=-4.6||p.x>=4.6||p.z<=-2.3||p.z>=.65);
  }
  const above={x:0,y:6,z:0};assert.deepEqual(safeWorldCamera(above),above);
  assert.equal(safeWorldCamera({x:7,y:-1,z:3}).y,.3);
  const front={x:0,y:2,z:3};assert.deepEqual(safeWorldCamera(front),front);
});
test("rear-to-front camera flights clear the roof and awning without teleportation",()=>{
  for(const from of [{x:0,y:3,z:-8},{x:-6,y:1,z:0},{x:6,y:2,z:-3},{x:0,y:3,z:-2.31},{x:4.61,y:3,z:0},{x:0,y:3,z:.66}])for(const to of [{x:0,y:3,z:2.5},{x:5.4,y:3.15,z:6.8}]){
    const path=worldFlightWaypoints(from,to);assert.deepEqual(path[0],from);assert.deepEqual(path.at(-1),to);
    assert.ok(path.every(p=>p.y<=6.1),"never launch the camera high into the sky");
    const curve=worldFlightCurve(from,to);
    for(let i=0;i<=300;i++){
      const p=curve.getPoint(i/300);
      assert.ok(p.y<=6.101,"rounded path has bounded altitude");
      assert.ok(!(p.x>-4.6&&p.x<4.6&&p.z>-2.3&&p.z<.65&&p.y<4.65),"rounded corners must preserve clearance");
    }
    for(let segment=1;segment<path.length;segment++)for(let i=0;i<=100;i++){
      const a=path[segment-1],b=path[segment],t=i/100,p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t};
      assert.ok(!(p.x>-4.6&&p.x<4.6&&p.z>-2.3&&p.z<.65&&p.y<4.65));
    }
  }
  assert.equal(worldFlightWaypoints({x:0,y:3,z:8},{x:0,y:3,z:3}).length,2,"clear approaches remain direct");
});
