/** Sample mix metadata plus the original hologram/fallback synthesis. */
import {hologramImpactEvents} from "./hologram-timing.mjs";
export const SOUND_CUES={
  arrival:{seconds:1.75,level:.48,cooldown:1.4},camera:{seconds:.85,level:.40,cooldown:.06},
  key:{seconds:.12,level:.2,cooldown:.055},wood:{seconds:.3,level:.25,cooldown:.18},
  paper:{seconds:.5,level:.3,cooldown:.22},window:{seconds:.7,level:.25,cooldown:.4},
  windowClose:{seconds:.3,level:.22,cooldown:.4},
  bell:{seconds:1.4,level:.2,cooldown:1.1},hologram:{seconds:2.8,level:.28,cooldown:2.8},
  splash:{seconds:.8,level:.48,cooldown:.12},machine:{seconds:.5,level:.3,cooldown:.45},
  arcade:{seconds:.5,level:.22,cooldown:.4},mailbox:{seconds:.3,level:.25,cooldown:.3},
  arcadeSwitch:{seconds:.69,level:.22,cooldown:.45},
  marioJump:{seconds:.6,level:.22,cooldown:.12},marioCoin:{seconds:.7,level:.2,cooldown:.12},
  switch:{seconds:.12,level:.32,cooldown:.2},exit:{seconds:.9,level:.12,cooldown:.7},
} as const;
export type SoundCue=keyof typeof SOUND_CUES;
export const CUE_SAMPLES:Partial<Record<SoundCue,readonly string[]>>={
  key:["key-1","key-2"],wood:["wood"],paper:["paper-1","paper-2"],
  window:["window"],windowClose:["latch"],bell:["bell"],splash:["splash-1","splash-2","splash-3"],
  machine:["coin"],arcade:["arcade"],mailbox:["latch"],switch:["switch"],
  marioJump:["mario-jump"],marioCoin:["mario-coin"],
  arcadeSwitch:["jesse-arcade-original"],hologram:["jesse-hologram"],
};
export function seededNoise(seed:number){let s=seed|0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return (s>>>0)/2147483648-1;};}
export const HOLOGRAM_PARTICLE_IMPACTS=hologramImpactEvents.length;
export function renderCue(cue:SoundCue,sampleRate=24000,seed=739){
  const spec=SOUND_CUES[cue],data=new Float32Array(Math.ceil(spec.seconds*sampleRate)),random=seededNoise(seed);
  const pitch=1+random()*.045;let low=0,body=0,phase=0;
  for(let i=0;i<data.length;i++){
    const t=i/sampleRate,u=i/(data.length-1),white=random();
    const airy=cue==="arrival"||cue==="camera"||cue==="exit";
    const cutoff=airy?480+2400*Math.sin(Math.PI*u)**2:cue==="hologram"?3100:cue==="paper"?1800:cue==="splash"?1250:850;
    low+=(white-low)*(1-Math.exp(-2*Math.PI*cutoff/sampleRate));
    body+=(white-body)*(1-Math.exp(-2*Math.PI*190/sampleRate));
    const attack=Math.min(1,t/(airy?.16:.006)),release=Math.min(1,(spec.seconds-t)/.025);
    let value=0;
    if(airy){const envelope=cue==="arrival"?Math.sin(Math.PI*Math.pow(u,.48))**1.4:Math.sin(Math.PI*u)**1.6;value=(low*.85+body*.4)*envelope;}
    else if(cue==="arcadeSwitch"){
      // Cabinet relay / CRT handover: one soft electrical tick and a settling
      // low pulse, not a two-note notification or a musical confirmation.
      const contact=low*.55*Math.exp(-t*95);
      phase+=2*Math.PI*(110+210*Math.exp(-t*45))*pitch/sampleRate;
      const settle=Math.sin(phase)*.19*Math.exp(-t*32);
      const age=t-.035,relay=age>0?(low-body)*.18*Math.exp(-age*110):0;
      value=contact+settle+relay;
    }
    else if(cue==="bell")value=(Math.sin(t*2*Math.PI*528*pitch)*Math.exp(-t*3.8)+.23*Math.sin(t*2*Math.PI*845*pitch)*Math.exp(-t*7))*.48;
    else if(cue==="hologram"){
      // Dry, tiny inharmonic contacts: a textured scatter rather than muffled
      // noise or a musical arpeggio. Keep the original 18 physical landings.
      for(const grain of hologramImpactEvents){
        const age=t-grain.at;
        if(age<0||age>.10)continue;
        const envelope=Math.min(1,age/.0025)*Math.exp(-age*72)*Math.min(1,(.10-age)/.015);
        const frequency=(1350+(grain.index*37)%1450)*pitch;
        const contact=Math.sin(age*2*Math.PI*frequency)+.32*Math.sin(age*2*Math.PI*frequency*1.713);
        value+=((low-body)*.52+contact*.20)*grain.gain*envelope;
      }
      const gather=Math.max(0,Math.min(1,(t-1.20)/1.35));
      value+=(low-body)*.025*Math.sin(Math.PI*gather)**2;
    }
    else if(cue==="splash"){
      // Broad water impact followed by a quiet falling bubble, not a bright beep.
      phase+=2*Math.PI*(310*Math.exp(-t*7)+95)/sampleRate;
      value=low*Math.exp(-t*8)*.9+Math.sin(phase)*Math.exp(-t*13)*.15;
    }else if(cue==="paper")value=(low-body)*(.55+.45*Math.sin(t*71)**2)*Math.sin(Math.PI*u)**1.4;
    else if(cue==="window"){
      const latch=Math.max(0,t-.39);
      value=body*Math.sin(Math.PI*u)*.65+(t>.39?low*Math.exp(-latch*55)*.7:0);
    }else if(cue==="machine")value=body*Math.sin(Math.PI*u)*.5+Math.sin(t*2*Math.PI*115)*Math.sin(Math.PI*u)*.06;
    else value=(low*.7+Math.sin(t*2*Math.PI*(cue==="wood"?180:330)*pitch)*.23)*Math.exp(-t*(cue==="wood"?34:75));
    data[i]=value*attack*release;
  }
  // Smooth start/end and remove any low-frequency DC offset from short taps.
  let dc=0;
  for(let i=0;i<data.length;i++){dc+=(data[i]-dc)*.003;data[i]=(data[i]-dc)*Math.min(1,i/24,(data.length-1-i)/24);}
  return data;
}
export type Ambience="breeze"|"lake"|"grill";
export function renderAmbience(kind:Ambience,sampleRate=16000,seconds=17){
  const data=new Float32Array(sampleRate*seconds),random=seededNoise(kind==="breeze"?1237:kind==="lake"?8311:9539);
  let low=0,deep=0;
  for(let i=0;i<data.length;i++){
    const u=i/(data.length-1),t=i/sampleRate,n=random();
    low+=(n-low)*(kind==="breeze"?.045:kind==="lake"?.19:.36);
    deep+=(n-deep)*.006;
    const swell=.55+.27*Math.sin(u*Math.PI*4)+.18*Math.sin(u*Math.PI*10+.6);
    const loopEdge=Math.min(1,i/(sampleRate*.6),(data.length-1-i)/(sampleRate*.6));
    data[i]=(kind==="grill"?(low-deep)*(.65+.35*Math.sin(t*32)**2):(low-deep)*swell)*loopEdge;
  }
  return data;
}
export function soundMix(volume:number,muted:boolean,media:boolean){return muted?0:Math.max(0,Math.min(1,volume))*(media?.22:1);}

export class SoundBudget{
  private last=new Map<SoundCue,number>();
  private voices:{until:number}[]=[];
  accept(cue:SoundCue,now:number,duration:number=SOUND_CUES[cue].seconds){
    this.voices=this.voices.filter(v=>v.until>now);
    if(this.voices.length>=8||now-(this.last.get(cue)??-Infinity)<SOUND_CUES[cue].cooldown)return false;
    this.last.set(cue,now);this.voices.push({until:now+duration});return true;
  }
  clear(){this.last.clear();this.voices=[];}
}
