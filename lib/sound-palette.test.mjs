import test from "node:test";
import assert from "node:assert/strict";
import {SOUND_CUES,CUE_SAMPLES,renderCue,SoundBudget,soundMix,HOLOGRAM_PARTICLE_IMPACTS} from "./sound-palette.ts";
import {existsSync,statSync} from "node:fs";

test("all original cues have quiet bounded output, finite samples and click-free boundaries",()=>{
  for(const cue of ["arrival","camera","exit","hologram","arcadeSwitch"]){
    const samples=renderCue(cue);let peak=0,sum=0,power=0;
    for(const value of samples){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));sum+=value;power+=value*value;}
    assert.ok(peak>.01&&peak<.9,`${cue}: peak ${peak}`);
    assert.ok(Math.sqrt(power/samples.length)<.3,`${cue}: restrained RMS`);
    assert.ok(Math.abs(sum/samples.length)<.005,`${cue}: no DC offset`);
    assert.equal(Math.abs(samples[0]),0);assert.equal(Math.abs(samples.at(-1)),0);
    assert.ok(peak*SOUND_CUES[cue].level*soundMix(.45,false,false)<.3,`${cue}: bounded default mix`);
    assert.notDeepEqual(samples,renderCue(cue,24000,922));
  }
});
test("objects use distinct local samples, with varied splashes and a small download budget",()=>{
  assert.notDeepEqual(CUE_SAMPLES.machine,CUE_SAMPLES.arcade);
  assert.notDeepEqual(CUE_SAMPLES.mailbox,CUE_SAMPLES.window);
  assert.equal(new Set(CUE_SAMPLES.splash).size,3);
  assert.deepEqual(CUE_SAMPLES.arcadeSwitch,["jesse-arcade-original"],"screen changes use the reference recording with user-confirmed permission");
  assert.deepEqual(CUE_SAMPLES.hologram,["jesse-hologram"],"the hologram uses the recording rather than the synthesized fallback");
  assert.equal(SOUND_CUES.arcadeSwitch.seconds,.69);
  let size=0;
  for(const name of [...new Set(Object.values(CUE_SAMPLES).flat()),"water-bed","field-air"]){const path=new URL(`../public/audio/world/${name}.mp3`,import.meta.url);assert.ok(existsSync(path),name);size+=statSync(path).size;}
  assert.ok(size<450_000,`${size} bytes (music streams separately)`);
});
test("hologram impacts taper off before the quieter reassembly",()=>{
  assert.equal(HOLOGRAM_PARTICLE_IMPACTS,18,'same particle count, without extra impacts');
  const samples=renderCue("hologram"),rms=(from,to)=>{
    const slice=samples.slice(Math.floor(from*24000),Math.floor(to*24000));
    return Math.sqrt(slice.reduce((sum,v)=>sum+v*v,0)/slice.length);
  };
  assert.ok(rms(.3,.85)>rms(1.5,2.45)*3,'return stays at least 9 dB quieter than the fall');
  let crossings=0;
  for(let i=.35*24000;i<.95*24000;i++)if(samples[i]*samples[i-1]<0)crossings++;
  assert.ok(crossings/.6>3500,'dry particle texture retains detail instead of the old muffled noise');
  assert.equal(rms(0,.35),0,'no impact sound while dots are still in free fall');
  assert.ok(rms(1,1.25)<.001,'space after the particles settle');
  assert.ok(rms(2.55,2.8)<.001,'no lingering tail after reconstruction');
});
test("rapid input cannot stack an unlimited chorus of effects",()=>{
  const budget=new SoundBudget();assert.equal(budget.accept("key",0),true);
  assert.equal(budget.accept("key",.01),false);assert.equal(budget.accept("key",.06),true);
  budget.clear();let accepted=0;
  for(const cue of Object.keys(SOUND_CUES))if(budget.accept(cue,1))accepted++;
  assert.equal(accepted,8);assert.equal(budget.accept("arrival",4),true);
});
test("mute is absolute, volume is capped and TV playback ducks the scene",()=>{
  assert.equal(soundMix(.65,true,false),0);assert.equal(soundMix(10,false,false),1);
  assert.equal(soundMix(-1,false,false),0);assert.ok(soundMix(.35,false,true)<soundMix(.35,false,false)*.25);
});
