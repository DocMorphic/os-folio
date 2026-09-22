import test from "node:test";
import assert from "node:assert/strict";
import { worldOverlayGate,worldFrameAllowed } from "./world-overlay.ts";
import {readFileSync} from "node:fs";

test("entrance replaces the CRT prewarm frame while covered, without restarting the hidden render loop",()=>{
  assert.equal(worldFrameAllowed(true,false,true),false,"ordinary covered frames stay paused");
  assert.equal(worldFrameAllowed(true,false,true,true),true,"one entrance-pose frame must render before loader fade");
  assert.equal(worldFrameAllowed(false,true,true),true,"preparation still renders");
  assert.equal(worldFrameAllowed(false,false,true,true),false,"inactive scenes cannot render");
  assert.equal(worldFrameAllowed(true,false,false),true,"live entrance resumes after dismissal");
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  const enter=source.slice(source.indexOf('const enter=()=>'),source.indexOf('const visit='));
  assert.match(enter,/camera.position.copy\(path.getPoint\(0\)\)/);
  assert.match(enter,/render\(performance.now\(\),true\)/);
  assert.match(source,/if\(entranceSnapshot\)return;\s*if\(cameraActive\|\|travel/);
  assert.match(source,/if\(!travel.entrance\|\|!entranceHeld\)\{\s*const flightNow=performance.now\(\);travel.startedAt\?\?=flightNow;\s*travel.elapsed=cameraTravelElapsed\(travel.startedAt,flightNow,travel.duration\);/,'the audio-aligned clock starts only after the loader reveals the entrance');
});

test("preloaded screen stays visually hidden and cannot trap input without CSS",()=>{
  for(const active of [false,true]){
    const gate=worldOverlayGate(active,"warming");
    assert.equal(gate.style.opacity,0);assert.equal(gate.style.pointerEvents,"none");assert.equal(gate.inert,true);assert.equal(gate["aria-hidden"],true);
    assert.equal(gate.style.position,"fixed","keep full-size layout for GPU prewarm");
  }
});
test("inactive world is hidden even if an interrupted animation retained its phase",()=>{
  for(const phase of ["entering","live","leaving"]){const gate=worldOverlayGate(false,phase);assert.equal(gate.style.opacity,0);assert.equal(gate.inert,true);}
});
test("only an activated presentation can receive focus and pointer input",()=>{
  for(const phase of ["entering","live","leaving"]){const gate=worldOverlayGate(true,phase);assert.equal(gate.style.opacity,1);assert.equal(gate.style.pointerEvents,"auto");assert.equal(gate.inert,false);}
});
