import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {TRAM_POSTCARDS,createIndigoPostcard} from "./tram-postcards.ts";
import {drawMarioArcade,arcadePose,arcadeEvents,ARCADE_JUMPS,ARCADE_SPRITES,createMarioArcade,drawArcadeCredits} from "./tram-arcade.ts";

test("arcade defaults to Mario and toggles credited inspiration without Mario audio",()=>{
  const text=[];
  const ctx=new Proxy({fillText:value=>text.push(value)},{get:(target,key)=>key in target?target[key]:()=>{}});
  const arcade=createMarioArcade(ctx);
  assert.equal(arcade.getMode(),"mario");assert.equal(arcade.toggle(),"credits");
  assert.deepEqual(arcade.draw(12),[]);
  drawArcadeCredits(ctx,0);
  for(const credit of ["DHARMAY DAVE","WORLD INSPIRATION","JESSE ZHOU","THREE.JS","NINTENDO"])assert.ok(text.includes(credit));
  assert.equal(arcade.toggle(),"mario");arcade.dispose();
});
test("credits render at 1024 by 960 while Mario keeps its native efficient pixel canvas",()=>{
  const canvas={width:256,height:240};
  const ctx=new Proxy({canvas},{get:(target,key)=>key in target?target[key]:()=>{}});
  const arcade=createMarioArcade(ctx);arcade.toggle();
  assert.deepEqual(canvas,{width:1024,height:960});
  arcade.toggle();assert.deepEqual(canvas,{width:256,height:240});arcade.dispose();
});

test("Mario sounds follow visible takeoff and coin collection, never catch up after hidden time",()=>{
  for(const jump of ARCADE_JUMPS){const takeoff=(jump.start-40)/44,coin=takeoff+jump.width/88;
    assert.deepEqual(arcadeEvents(takeoff-.02,takeoff+.02),["marioJump"]);
    assert.deepEqual(arcadeEvents(coin-.02,coin+.02),["marioCoin"]);
    assert.deepEqual(arcadeEvents(coin,coin+.02),[]);
  }
  assert.deepEqual(arcadeEvents(1,20),[]);assert.deepEqual(arcadeEvents(25.98,26.02),[]);
});

test("arcade animation is independent of camera distance while audio follows focus",()=>{
  const room=readFileSync(new URL("./portfolio-room.ts",import.meta.url),"utf8");
  assert.match(room,/if\(!reduced.matches\)\{\s*const cues=animateArcade\(now\/1000\)/);
  assert.match(room,/if\(arcadeAudible\(\)\)for\(const cue of cues\)/);
  assert.match(room,/arcadeMode\(\)==="mario"&&\(view==="arcade"\|\|view==="object"&&objectSection==="work"\)/);
  assert.match(room,/worldSound.arcadeFocus\(arcadeAudible\(\)\)/);
  assert.doesNotMatch(room,/const arcadeVisible=/);
});

test("postcard prints point to actual original photographs and dispose cleanly",async()=>{
  const previous=globalThis.document;
  globalThis.document={};
  try{
    assert.equal(TRAM_POSTCARDS.length,6);
    for(const {folder,index} of TRAM_POSTCARDS){
      assert.ok(existsSync(new URL(`../public/photos/${folder}/${folder}-${index+1}.jpg`,import.meta.url)));
      const textures=[],materials=[];
      const print=createIndigoPostcard(folder,index,textures,materials);
      await print.ready;
      assert.match(print.material.fragmentShader,/texture2D\(photograph/);
      assert.match(print.material.fragmentShader,/imageAspect/);
      assert.equal(print.material.uniforms.cardAspect.value,1.42);
      print.dispose();materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
    }
  }finally{globalThis.document=previous;}
});

test("arcade loop has coherent finite drawing at jump and wrap boundaries",()=>{
  let sprites=0;
  const context=new Proxy({
    drawImage:(_image,...values)=>{values.forEach(v=>assert.ok(Number.isFinite(v)));sprites++;},
  },{get:(target,key)=>key in target?target[key]:()=>{}});
  const assets=Object.fromEntries(Object.keys(ARCADE_SPRITES).map(key=>[key,{}]));
  for(const seconds of [0,.1,2.28,3,3.95,5.79,5.8,22.99,23,60,3600])drawMarioArcade(context,seconds,assets);
  assert.ok(sprites>100);
});
test("arcade uses local original NES assets and complete native animation frames",()=>{
  for(const file of Object.values(ARCADE_SPRITES))assert.ok(existsSync(new URL(`../public/assets/arcade/${file}`,import.meta.url)));
  const frames=new Set();for(let t=0;t<26;t+=.02){const p=arcadePose(t);frames.add(p.frame);assert.ok(p.height>=0&&p.height<=104);
    for(const [x,h] of [[448,32],[608,48],[800,64],[992,64]])if(p.x+16>x&&p.x<x+32)assert.ok(p.height>=h,"Mario clears each pipe instead of passing through it");
  }
  assert.deepEqual([...frames].sort(),[0,1,2]);
});
