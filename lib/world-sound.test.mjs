import test from "node:test";
import assert from "node:assert/strict";
import {registerHooks} from "node:module";
registerHooks({resolve(specifier,context,next){if(specifier.startsWith("./")&&!/\.[a-z]+$/i.test(specifier)&&context.parentURL?.includes("/lib/"))return next(specifier+".ts",context);return next(specifier,context);}});
const {createWorldSound}=await import("./world-sound.ts");

test("real lifecycle contract: master/TV volume, absolute mute, no stale voices, overlapping mounts, arrival unlock",async t=>{
  t.mock.timers.enable({apis:["setTimeout"]});
  const keys=["window","document","localStorage","AudioContext","Audio","fetch","performance"];
  const saved=Object.fromEntries(keys.map(k=>[k,globalThis[k]]));
  const parameter=()=>({value:0,cancelScheduledValues(){},setValueAtTime(v){this.value=v;},setTargetAtTime(v){this.value=v;},setValueCurveAtTime(v){this.curve=v;}});
  const sources=[],contexts=[],panners=[],musicElements=[];
  let releaseDecode,clockMs=1000;
  const decodeGate=new Promise(resolve=>{releaseDecode=resolve;});
  const node=()=>({connect(next){return next;},disconnect(){this.disconnected=true;},gain:parameter(),pan:parameter(),threshold:parameter(),knee:parameter(),ratio:parameter(),attack:parameter(),release:parameter()});
  class FakeContext{
    state="suspended";currentTime=0;destination=node();
    listener=Object.fromEntries(["positionX","positionY","positionZ","forwardX","forwardY","forwardZ","upX","upY","upZ"].map(k=>[k,parameter()]));
    constructor(){contexts.push(this);}
    resume(){this.state="running";return Promise.resolve();}
    suspend(){this.state="suspended";return Promise.resolve();}
    close(){this.state="closed";return Promise.resolve();}
    createGain=node;createDynamicsCompressor=node;createStereoPanner=node;
    createMediaElementSource=node;
    createBiquadFilter(){return {...node(),frequency:parameter(),Q:parameter()};}
    createPanner(){const p={...node(),positionX:parameter(),positionY:parameter(),positionZ:parameter()};panners.push(p);return p;}
    createBuffer(channels,length,rate){return {duration:length/rate,copyToChannel(){}};}
    decodeAudioData(){return decodeGate.then(()=>({duration:.8}));}
    createBufferSource(){const context=this;const s={...node(),playbackRate:parameter(),start(time,offset){this.started=true;this.startAt=time;this.offset=offset;},stop(time){this.stopAt=time;if(time===undefined||time<=context.currentTime){this.stopped=true;this.onended?.();}}};sources.push(s);return s;}
  }
  const store=new Map();
  globalThis.window={};globalThis.document=new EventTarget();document.hidden=false;
  globalThis.localStorage={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)};
  globalThis.AudioContext=FakeContext;
  globalThis.performance={now:()=>clockMs};
  globalThis.Audio=class {paused=true;currentTime=0;constructor(src){this.src=src;musicElements.push(this);}play(){this.paused=false;return Promise.resolve();}pause(){this.paused=true;}removeAttribute(){this.src="";}load(){}};
  let requests=0;globalThis.fetch=async()=>{requests++;return {ok:true,arrayBuffer:async()=>new ArrayBuffer(10)};};
  const sound=createWorldSound();
  const settle=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};
  let tvGain=-1;
  try{
    assert.equal(sound.snapshot().volume,1,"All sound defaults to 100%");
    assert.equal(sound.snapshot().musicVolume,.1,"Music defaults to 10%");
    const detach=sound.attach(),detachOther=sound.attach();
    sound.bindMedia(value=>{tvGain=value;});
    assert.equal(contexts.length,0,"mount preloads but never bypasses autoplay");
    assert.equal(musicElements.length,0,"no desktop music download before audio unlock");
    sound.play("arrival");assert.equal(sources.length,0);
    let unlocked=false;const unlocking=sound.unlock().then(()=>{unlocked=true;});await settle();
    assert.equal(unlocked,false,"unlock must await decoded camera buffers before the loader releases the camera");
    releaseDecode();await unlocking;await sound.prepare();await settle();
    assert.equal(contexts.length,1);assert.equal(sound.diagnostics().beds,1);
    assert.equal(sound.diagnostics().grill,true,"one spatial griddle loop starts after unlock");
    sound.listener({x:2.75,y:3,z:4.9},{x:0,y:0,z:-1},{x:0,y:1,z:0});
    sound.update(4,0,0,false);const closeGrill=sound.diagnostics().grillGain;
    assert.ok(closeGrill>0&&closeGrill<=.12);
    sound.update(4,0,0,true);assert.ok(sound.diagnostics().grillGain<closeGrill*.11,"reading ducks cooking");
    sound.listener({x:30,y:3,z:30},{x:0,y:0,z:-1},{x:0,y:1,z:0});
    sound.update(40,0,0,false);assert.equal(sound.diagnostics().grillGain,0,"no distant kitchen hiss across the lake");
    assert.ok(sources.some(s=>s.offset>=0),"queued entrance survives audio unlock");
    assert.ok(sound.diagnostics().lastFlight.lagMs<1,"prepared entrance starts on its camera frame");
    contexts[0].currentTime+=2;clockMs+=2000;
    sound.play("camera",{duration:1.8,gain:.9,pan:1});
    assert.equal(sound.diagnostics().lastFlight.cue,"camera","asset wind still plays after the entrance completes");
    assert.equal(sound.diagnostics().lastFlight.lagMs,0);
    assert.equal(sound.diagnostics().lastFlight.duration,1.8);
    const previousFlight=sound.diagnostics().lastFlight;
    contexts[0].state="suspended";sound.play("arrival");clockMs+=500;
    await sound.unlock();await settle();
    assert.deepEqual(sound.diagnostics().lastFlight,previousFlight,"late unlock never inserts a swoosh halfway through the flight");
    assert.equal(tvGain,1);
    assert.equal(sound.diagnostics().gain,1,"master volume applies the default to all world audio");
    assert.equal(sound.diagnostics().music,true);assert.equal(musicElements.length,1);
    assert.match(musicElements[0].src,/minecraft\.mp3$/);
    sound.update(10,0,1,false);await settle();
    assert.equal(musicElements.length,2);assert.match(musicElements[1].src,/haggstrom\.mp3$/);
    assert.equal(sound.snapshot().musicPeriod,"night");assert.equal(sound.diagnostics().musicPeriod,"night");
    assert.equal(musicElements[0].paused,false,"outgoing day stream keeps playing during its fade");
    assert.equal(sound.diagnostics().musicTracks.day.gain,0);
    assert.equal(sound.diagnostics().musicTracks.night.gain,.1);
    t.mock.timers.tick(3201);assert.equal(musicElements[0].paused,true,"pause the inaudible outgoing stream after crossfade");
    sound.update(10,0,0,false);await settle();
    sound.update(10,0,1,false);await settle();
    t.mock.timers.tick(3201);assert.equal(musicElements[1].paused,false,"reversing a fade cancels the selected stream's old pause timer");
    sound.update(10,0,0,false);await settle();t.mock.timers.tick(3201);
    assert.equal(sound.diagnostics().musicPeriod,"day");assert.equal(musicElements[1].paused,true);
    sound.musicVolume(.3);assert.equal(sound.diagnostics().musicGain,.3);
    sound.musicVolume(0);assert.equal(sound.diagnostics().music,false);assert.equal(sound.diagnostics().musicGain,0);
    sound.musicVolume(.6);assert.equal(sound.diagnostics().music,true);
    sound.hold(true);assert.equal(sound.diagnostics().gain,0);assert.equal(sound.diagnostics().beds,0);
    assert.equal(sound.diagnostics().grill,false,"loader hold stops the cooking loop too");
    sound.play("arrival");assert.equal(sound.diagnostics().voices,0,"covered world never sounds before loader dismissal");
    sound.hold(false);await settle();sound.play("arrival");assert.equal(sound.diagnostics().lastCue,"arrival");
    sound.listener({x:4,y:2,z:3},{x:0,y:0,z:-1},{x:0,y:1,z:0});
    assert.equal(contexts[0].listener.positionX.value,4);
    assert.equal(panners.at(-1).panningModel,"HRTF");assert.equal(sound.diagnostics().spatial,true);
    const beforeZ=panners.at(-1).positionZ.value;contexts[0].currentTime+=.8;
    sound.listener({x:4,y:2,z:3},{x:0,y:0,z:-1},{x:0,y:1,z:0});assert.ok(panners.at(-1).positionZ.value>beforeZ);
    const normal=sound.diagnostics().gain;sound.media(true);assert.ok(sound.diagnostics().gain<normal*.25);
    sound.media(false);assert.equal(sound.diagnostics().gain,normal);
    sound.media(true);assert.equal(sound.diagnostics().musicGain,0);sound.media(false);
    sound.volume(.2);await settle();assert.equal(tvGain,.2);assert.equal(sound.diagnostics().gain,.2);
    sound.volume(0);assert.equal(tvGain,0);assert.equal(sound.diagnostics().gain,0);assert.equal(sound.diagnostics().voices,0);assert.equal(sound.diagnostics().beds,0);
    t.mock.timers.tick(101);assert.equal(contexts[0].state,"suspended");
    sound.volume(.4);await settle();assert.equal(sound.diagnostics().beds,1);
    sound.play("camera",{duration:2.1,pan:-1,speed:12});
    const flight=sources.at(-1);assert.equal(flight.loop,false,"whoosh is a single complete sweep, not looping park ambience");
    assert.equal(flight.playbackRate.value,1,"asset air stays at natural speed instead of pitch-shifting to fit the trip");
    assert.equal(flight.offset,.18,"skip only the original near-silent lead-in");
    assert.ok(Math.abs(flight.stopAt-flight.startAt-.62)<1e-6,"short test buffer ends naturally, never padded or stretched to fill a long trip");
    const from=panners.at(-1);assert.equal(from.panningModel,"HRTF");
    contexts[0].currentTime+=.2;sound.play("camera",{duration:1.35,pan:1});
    assert.ok(flight.stopAt<=contexts[0].currentTime+.12,"interrupted flights fade instead of stacking");
    sound.volume(0);sound.volume(.4);await settle();
    sound.play("machine");assert.equal(sound.diagnostics().lastCue,"wood","vending delivery clunk follows the coin layer");assert.equal(sound.diagnostics().voices,2);
    sound.toggle();assert.equal(sound.snapshot().muted,true);assert.equal(tvGain,0);assert.equal(sound.diagnostics().gain,0);assert.ok(sources.every(s=>s.stopped));
    assert.equal(sound.diagnostics().music,false);assert.equal(sound.diagnostics().musicGain,0);
    assert.equal(sound.diagnostics().grill,false,"mute stops the griddle source, not just its gain");
    sound.update(10,0,1,false);assert.ok(musicElements.every(player=>player.paused),"changing time of day cannot bypass mute");
    sound.volume(.9);await settle();assert.equal(tvGain,0,"slider must never undo mute");
    sound.play("bell");assert.equal(sound.diagnostics().voices,0);
    t.mock.timers.tick(101);assert.equal(contexts[0].state,"suspended");
    sound.enable();await settle();assert.equal(tvGain,.9);assert.equal(contexts.length,1);
    assert.equal(sound.diagnostics().musicPeriod,"night","unmute resumes the soundtrack matching the current sky");
    const before=sources.length;sound.play("key");sound.play("key");assert.equal(sources.length,before+1);
    const unfocused=sources.length;sound.play("marioJump");await settle();assert.equal(sources.length,unfocused,"overview arcade is silent");
    sound.arcadeFocus(true);sound.play("marioJump");await settle();
    assert.equal(sources.length,unfocused+1,"focused arcade plays its synchronized cue");
    const marioVoice=sources.at(-1);sound.arcadeFocus(false);assert.equal(marioVoice.stopped,true,"leaving the arcade cuts its current sound too");
    const afterLeaving=sources.length;sound.play("marioCoin");await settle();assert.equal(sources.length,afterLeaving,"no coin cue can leak after focus is lost");
    detach();assert.equal(sound.diagnostics().beds,1,"one unmount cannot silence a still-mounted world");
    document.hidden=true;document.dispatchEvent(new Event("visibilitychange"));assert.equal(tvGain,0);assert.equal(sound.diagnostics().beds,0);
    assert.equal(sound.diagnostics().grill,false,"hidden tabs stop cooking audio");
    t.mock.timers.tick(101);assert.equal(contexts[0].state,"suspended");
    document.hidden=false;document.dispatchEvent(new Event("visibilitychange"));await settle();assert.equal(tvGain,.9);
    detachOther();t.mock.timers.tick(101);assert.equal(contexts[0].state,"suspended");assert.equal(tvGain,0);
    assert.equal(JSON.parse(store.get("dd-world-audio-v1")).volume,.9);
    assert.equal(JSON.parse(store.get("dd-world-audio-v1")).musicVolume,.6);
    assert.equal(musicElements.length,2,"reuse day/night streaming players across mute, visibility, and attach");
    assert.equal(requests,21,"one original wind replaces three stretched copies; all effects are cached once");
    for(const voice of sources.filter(source=>source.loop===false))assert.equal(voice.playbackRate.value,1,"entrance and return passes both stay at exactly 1x");
  }finally{sound.dispose();for(const [key,value] of Object.entries(saved)){if(value===undefined)delete globalThis[key];else globalThis[key]=value;}}
});
