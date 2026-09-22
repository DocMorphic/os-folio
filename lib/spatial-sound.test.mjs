import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync,statSync} from "node:fs";
import {airPass,listenerToWorld,WORLD_MUSIC,CAMERA_AIR,CAMERA_PASS,cameraAirSample,cameraAirWindow,cameraPassGain,cameraTravelElapsed,assetFlight} from "./spatial-sound.ts";

test("camera speed adapts to distance while every flight fits the natural wind pass",()=>{
  const nearby=assetFlight(2),across=assetFlight(18),far=assetFlight(1000);
  assert.ok(nearby.gain<across.gain);
  assert.equal(nearby.duration,CAMERA_PASS.duration);
  assert.equal(across.duration,nearby.duration);assert.equal(far.duration,nearby.duration);
  assert.ok(18/across.duration>2/nearby.duration,'longer path means faster camera, not longer wind');
  assert.equal(far.gain,1.2);
  for(const distance of [.1,2,18,50,1000]){
    const flight=assetFlight(distance),air=cameraAirWindow(flight.duration,CAMERA_AIR[0].duration);
    assert.equal(air.duration,flight.duration,'audio and movement finish on the same deadline');
  }
  assert.deepEqual(assetFlight(NaN),assetFlight(0));
  assert.equal(assetFlight(0).gain,0,'no fake air movement when already at the overview');
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/assetFlight\(path.getLength\(\)\)/);
  assert.match(source,/worldSound.play\("camera",\{duration:travel.duration,pan:travel.pan,gain:travel.airGain\}\)/);
});

test('camera uses elapsed wall time, preserving the audio deadline through dropped frames',()=>{
  const start=1000,duration=CAMERA_PASS.duration;
  assert.equal(cameraTravelElapsed(start,start,duration),0);
  assert.equal(cameraTravelElapsed(start,start-100,duration),0);
  assert.equal(cameraTravelElapsed(start,start+700,duration),.7,'a slow frame is not clamped to a 50ms physics step');
  assert.equal(cameraTravelElapsed(start,start+duration*1000,duration),duration);
  assert.equal(cameraTravelElapsed(start,start+5000,duration),duration);
  assert.equal(cameraTravelElapsed(start,start,0),0,'reduced motion still finishes immediately');
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/cameraTravelElapsed\(travel.startedAt,flightNow,travel.duration\)/);
  assert.doesNotMatch(source,/travel.elapsed\s*\+=\s*dt/);
  assert.match(source,/duration:reduced.matches\?0:CAMERA_PASS.duration/,'entrance shares the same natural wind duration');
});

test("camera uses one original recording, never the glitchy stretched variants",()=>{
  assert.equal(cameraAirSample(),'jesse-whoosh-original');
  assert.equal(CAMERA_AIR.length,1);
  for(const duration of [.25,.8,1.75,3.2]){
    const air=cameraAirWindow(duration,CAMERA_AIR[0].duration);
    assert.equal(air.offset,.18);
    assert.ok(Math.abs(air.duration-Math.min(duration,1.37))<1e-9);
  }
  for(const {name} of CAMERA_AIR)assert.ok(statSync(new URL(`../public/audio/world/${name}.mp3`,import.meta.url)).size>5000);
  assert.doesNotMatch(readFileSync(new URL('./world-sound.ts',import.meta.url),'utf8'),/field-air/);
  assert.doesNotMatch(readFileSync(new URL('./world-sound.ts',import.meta.url),'utf8'),/jesse-wind-(?:short|medium|long)/);
});

test("air passes from ahead to behind with mirrored directions and bounded distance",()=>{
  assert.ok(airPass(0,1).z<0);assert.ok(airPass(1,1).z>0);
  assert.ok(airPass(0,1).x>0&&airPass(1,1).x<0,'pass crosses between ears rather than staying on one side');
  for(let i=0;i<=100;i++){
    const right=airPass(i/100,1),left=airPass(i/100,-1);
    assert.equal(right.x,-left.x);assert.equal(right.z,left.z);
    assert.ok(Math.hypot(right.x,right.y,right.z)>1.5);
    assert.ok(Object.values(right).every(Number.isFinite));
  }
  assert.deepEqual(airPass(-1,1),airPass(0,1));assert.deepEqual(airPass(2,1),airPass(1,1));
});
test('original wind keeps its own envelope with only smooth edge fades',()=>{
  for(const duration of [.25,.8,1.35,1.37]){
    assert.equal(cameraPassGain(0,duration),0);assert.equal(cameraPassGain(1,duration),0);
    assert.ok(cameraPassGain(.025/duration,duration)>.2,'starts softly without a long second buildup');
    assert.ok(cameraPassGain(.025/duration,duration)<.23,'edge fade avoids a hard click');
    if(duration>.5)assert.equal(cameraPassGain(.1/duration,duration),1,'no extra envelope reshaping after the 80ms edge');
    for(let i=0;i<=100;i++)assert.ok(cameraPassGain(i/100,duration)>=0&&cameraPassGain(i/100,duration)<=1);
  }
});
test('all asset exits return to the original overview rather than the last orbit',()=>{
  const source=readFileSync(new URL('./portfolio-room.ts',import.meta.url),'utf8');
  assert.match(source,/const reveal=.*moveTo\("room",overviewPose\(\),roomTarget\)/);
  assert.doesNotMatch(source,/savedPosition.copy\(camera.position\)/);
  const component=readFileSync(new URL('../components/PortfolioRoom.tsx',import.meta.url),'utf8');
  assert.match(component,/if\(controls.current\)controls.current.reveal\(\)/);
});
test("the sound stage rotates with the camera instead of sticking to screen x",()=>{
  const origin={x:10,y:2,z:5},front={x:0,y:0,z:-1},up={x:0,y:1,z:0};
  assert.deepEqual(listenerToWorld({x:2,y:1,z:-3},origin,front,up),{x:12,y:3,z:2});
  assert.deepEqual(listenerToWorld({x:2,y:1,z:-3},origin,{x:1,y:0,z:0},up),{x:13,y:3,z:7});
});
test("day/night music remains streamed locally, and terminal UI doesn't play click/typing sounds",()=>{
  assert.equal(WORLD_MUSIC.day.title,"Minecraft");assert.equal(WORLD_MUSIC.night.title,"Haggstrom");
  for(const track of Object.values(WORLD_MUSIC)){
    const music=new URL(`../public${track.src}`,import.meta.url);
    assert.ok(statSync(music).size>1_000_000&&statSync(music).size<15_000_000);
    assert.equal(track.artist,"C418");
  }
  const sound=readFileSync(new URL("./world-sound.ts",import.meta.url),"utf8");
  assert.match(sound,/createMediaElementSource/);assert.doesNotMatch(sound,/renderFlight/);
  const terminal=readFileSync(new URL("../components/ComputerTerminal.tsx",import.meta.url),"utf8");
  assert.doesNotMatch(terminal,/worldSound\.play/);
  const credits=readFileSync(new URL("../public/audio/world/CREDITS.md",import.meta.url),"utf8");
  assert.match(credits,/Minecraft.*C418/);assert.match(credits,/Haggstrom.*C418/);
  assert.match(credits,/not CC0 or CC BY/);
});
