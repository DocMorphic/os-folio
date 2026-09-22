import {renderCue,SOUND_CUES,CUE_SAMPLES,SoundBudget,soundMix,type SoundCue} from "./sound-palette";
import {airPass,listenerToWorld,WORLD_MUSIC,CAMERA_AIR,CAMERA_PASS,cameraAirSample,cameraAirWindow,cameraPassGain,type SoundPoint} from "./spatial-sound";
import {GRILL_POSITION,grillGain} from "./tram-kitchen";

type MusicPeriod=keyof typeof WORLD_MUSIC;
type Snapshot={muted:boolean;volume:number;musicVolume:number;unlocked:boolean;available:boolean;musicPeriod:MusicPeriod};
type PlayOptions={pan?:number;gain?:number;delay?:number;duration?:number;speed?:number;rate?:number;position?:SoundPoint};
const INITIAL:Snapshot={muted:false,volume:1,musicVolume:.1,unlocked:false,available:true,musicPeriod:"day"};
const STORAGE="dd-world-audio-v1";

/** One audio graph, including across route chunks and Fast Refresh. */
export function createWorldSound(){
  let state=INITIAL,context:AudioContext|undefined,master:GainNode|undefined;
  let attached=0,hidden=false,media=false,loaded=false,disposed=false;
  let shutdown:ReturnType<typeof setTimeout>|undefined;
  let pendingArrival:{at:number;duration:number}|undefined;
  let bed:{source:AudioBufferSourceNode;gain:GainNode}|undefined;
  let grill:{source:AudioBufferSourceNode;gain:GainNode;panner:PannerNode}|undefined;
  let inspecting=false;
  let bedLevel=.018;
  type MusicPlayer={element:HTMLAudioElement;source:MediaElementAudioSourceNode;gain:GainNode;pending?:boolean;pauseTimer?:ReturnType<typeof setTimeout>};
  const music:Partial<Record<MusicPeriod,MusicPlayer>>={};
  let activeMusic:MusicPeriod="day";
  let lastCue:SoundCue|null=null;
  let lastFlight:{cue:string;lagMs:number;audioTime:number;duration:number}|null=null;
  let held=false,flightSerial=0;
  let motion:{source:AudioBufferSourceNode;gain:GainNode;panner?:PannerNode;at?:number;duration?:number;side?:number;entrance?:boolean}|undefined;
  let listenerPose={position:{x:0,y:0,z:0},forward:{x:0,y:0,z:-1},up:{x:0,y:1,z:0}};
  const subscribers=new Set<()=>void>(),outputs=new Set<(volume:number)=>void>();
  const buffers=new Map<string,AudioBuffer>(),loads=new Map<string,Promise<AudioBuffer|null>>();
  const bytes=new Map<string,Promise<ArrayBuffer|null>>(),voices=new Set<AudioBufferSourceNode>();
  let arcadeFocused=false;
  const arcadeVoices=new Set<AudioBufferSourceNode>();
  const budget=new SoundBudget(),airBudget=new SoundBudget(),variants=new Map<SoundCue,number>();
  const clock=()=>performance.now()/1000;
  const publish=(next:Partial<Snapshot>)=>{if(Object.entries(next).every(([key,value])=>state[key as keyof Snapshot]===value))return;state={...state,...next};subscribers.forEach(fn=>fn());};
  const restore=()=>{
    if(loaded||typeof window==="undefined")return;loaded=true;
    try{const saved=JSON.parse(localStorage.getItem(STORAGE)??"null");if(saved&&typeof saved.muted==="boolean"&&Number.isFinite(saved.volume))publish({muted:saved.muted,volume:Math.max(0,Math.min(1,saved.volume)),musicVolume:saved.musicDefaultVersion===2&&Number.isFinite(saved.musicVolume)?Math.max(0,Math.min(1,saved.musicVolume)):INITIAL.musicVolume});}catch{}
  };
  const persist=()=>{try{localStorage.setItem(STORAGE,JSON.stringify({muted:state.muted,volume:state.volume,musicVolume:state.musicVolume,musicDefaultVersion:2}));}catch{}};
  const audible=()=>attached>0&&!hidden&&!state.muted&&!disposed&&!held;
  const ramp=(param:AudioParam,value:number,seconds=.04)=>{
    if(!context)return;
    // Zero is exact, not an exponential tail that never reaches zero.
    param.cancelScheduledValues(context.currentTime);
    if(value===0){param.value=0;param.setValueAtTime(0,context.currentTime);}
    else param.setTargetAtTime(value,context.currentTime,seconds);
  };
  const mix=()=>{
    if(master)ramp(master.gain,audible()?soundMix(state.volume,false,media):0);
    mixMusic();
    outputs.forEach(fn=>fn(audible()?state.volume:0));
  };
  const stopVoices=()=>{for(const source of voices){try{source.stop();}catch{}}voices.clear();budget.clear();airBudget.clear();};
  const stopBed=()=>{
    if(bed){try{bed.source.stop();}catch{}bed.source.disconnect();bed.gain.disconnect();bed=undefined;}
    if(grill){try{grill.source.stop();}catch{}grill.source.disconnect();grill.gain.disconnect();grill.panner.disconnect();grill=undefined;}
  };
  const pauseMusic=()=>{for(const player of Object.values(music)){clearTimeout(player.pauseTimer);player.pauseTimer=undefined;player.element.pause();}};
  const silence=()=>{pendingArrival=undefined;mix();stopVoices();stopBed();pauseMusic();};
  const suspendLater=(delay=100)=>{
    clearTimeout(shutdown);shutdown=setTimeout(()=>{
      if(audible()&&state.volume>0)return;
      stopVoices();stopBed();if(context?.state==="running")void context.suspend().catch(()=>{});
    },delay);
  };
  function fetchSample(name:string){
    if(!bytes.has(name))bytes.set(name,fetch(`/audio/world/${name}.mp3`).then(r=>r.ok?r.arrayBuffer():null).catch(()=>null));
    return bytes.get(name)!;
  }
  async function loadSample(name:string):Promise<AudioBuffer|null>{
    if(buffers.has(name))return buffers.get(name)!;
    if(!context)return null;
    if(!loads.has(name)){
      const decoder=context;
      loads.set(name,fetchSample(name).then(data=>data?decoder.decodeAudioData(data.slice(0)):null).then(buffer=>{
        if(buffer&&!disposed)buffers.set(name,buffer);return buffer;
      }).catch(()=>null));
    }
    return loads.get(name)!;
  }
  function prepare(){
    // Fetch during the keyboard / world load, not on each interaction.
    const names=[...new Set(Object.values(CUE_SAMPLES).flat()),"water-bed","grill-sizzle",...CAMERA_AIR.map(sample=>sample.name)];
    return Promise.all(names.map(name=>context?loadSample(name):fetchSample(name))).then(()=>{});
  }
  async function startBed(){
    if(!context||!master||bed||!audible()||state.volume===0)return;
    const buffer=await loadSample("water-bed");
    if(!buffer||!context||!master||bed||!audible()||state.volume===0||context.state!=="running")return;
    const source=context.createBufferSource(),gain=context.createGain();
    source.buffer=buffer;source.loop=true;gain.gain.value=0;
    source.connect(gain).connect(master);source.start();bed={source,gain};ramp(gain.gain,bedLevel,.8);
  }
  function mixGrill(){
    if(!grill)return;
    const p=listenerPose.position,d=Math.hypot(p.x-GRILL_POSITION.x,p.y-GRILL_POSITION.y,p.z-GRILL_POSITION.z);
    ramp(grill.gain.gain,grillGain(d,inspecting),.65);
  }
  async function startGrill(){
    if(!context||!master||grill||!audible()||state.volume===0)return;
    const buffer=await loadSample("grill-sizzle");
    if(!buffer||!context||!master||grill||!audible()||state.volume===0||context.state!=="running")return;
    const source=context.createBufferSource(),gain=context.createGain(),panner=spatialPanner(GRILL_POSITION);
    source.buffer=buffer;source.loop=true;gain.gain.value=0;
    panner.refDistance=4;panner.rolloffFactor=.65;
    source.connect(gain).connect(panner).connect(master);source.start();grill={source,gain,panner};mixGrill();
  }
  function mixMusic(){
    if(!context)return;
    for(const [period,player] of Object.entries(music)){
      const selected=period===activeMusic;
      if(audible()&&state.volume>0&&state.musicVolume>0){
        player.gain.gain.cancelScheduledValues(context.currentTime);
        player.gain.gain.setTargetAtTime(selected&&!media?state.musicVolume:0,context.currentTime,.65);
      }else ramp(player.gain.gain,0);
      if(selected){clearTimeout(player.pauseTimer);player.pauseTimer=undefined;}
      else if(!player.pauseTimer&&!player.element.paused){
        player.pauseTimer=setTimeout(()=>{player.pauseTimer=undefined;if(period!==activeMusic){ramp(player.gain.gain,0);player.element.pause();}},3200);
      }
    }
  }
  function startMusic(){
    if(!context||!master||!attached||disposed)return;
    if(hidden||state.muted||state.volume===0||state.musicVolume===0){pauseMusic();return;}
    const period=state.musicPeriod;
    let player=music[period];
    if(!player){
      // Stream the full stereo recording; don't decode minutes of PCM into RAM
      // or add the music download to the desktop/loader's critical path.
      const element=new Audio(WORLD_MUSIC[period].src);element.loop=true;element.preload="none";
      const source=context.createMediaElementSource(element),gain=context.createGain();gain.gain.value=0;
      source.connect(gain).connect(master);player=music[period]={element,source,gain};
    }
    if(player.pending)return;
    if(!player.element.paused){activeMusic=period;mixMusic();return;}
    player.pending=true;
    const next=player;
    // Keep the old track audible until the incoming stream can actually play.
    void next.element.play().then(()=>{
      next.pending=false;
      if(disposed||!attached||hidden||state.muted||state.volume===0||state.musicVolume===0){next.element.pause();return;}
      if(state.musicPeriod!==period){next.element.pause();return;}
      activeMusic=period;mixMusic();
    }).catch(()=>{next.pending=false;});
  }
  function positionPanner(panner:PannerNode,point:SoundPoint){
    ramp(panner.positionX,point.x,.025);ramp(panner.positionY,point.y,.025);ramp(panner.positionZ,point.z,.025);
  }
  function spatialPanner(point:SoundPoint){
    const panner=context!.createPanner();panner.panningModel="HRTF";panner.distanceModel="inverse";
    panner.refDistance=3;panner.maxDistance=80;panner.rolloffFactor=.7;
    panner.positionX.value=point.x;panner.positionY.value=point.y;panner.positionZ.value=point.z;
    return panner;
  }
  function startAir(cue:"arrival"|"camera"|"exit",buffer:AudioBuffer,options:PlayOptions,elapsed=0){
    if(!context||!master||context.state!=="running"||!audible()||!state.volume)return;
    const duration=Math.max(.25,Math.min(4,options.duration??SOUND_CUES[cue].seconds));
    const air=cameraAirWindow(duration,buffer.duration);
    // Camera air owns one replaceable voice; busy arcade/splash cues must not
    // consume its budget and silently drop an asset's camera movement.
    if(elapsed>=air.duration||!airBudget.accept(cue,context.currentTime,air.duration-elapsed))return;
    if(motion){const value=motion.gain.gain.value;motion.gain.gain.cancelScheduledValues(0);motion.gain.gain.setValueAtTime(value,context.currentTime);motion.gain.gain.setTargetAtTime(0,context.currentTime,.025);try{motion.source.stop(context.currentTime+.12);}catch{}}
    const index=flightSerial++,side=options.pan?Math.sign(options.pan):(index%2?1:-1);
    const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter();
    const entrance=cue==="arrival",local=airPass(elapsed/duration,side,entrance),panner=spatialPanner(listenerToWorld(local,listenerPose.position,listenerPose.forward,listenerPose.up));
    // Camera-local wind should move around the listener, not fade away as if
    // it were a distant prop. HRTF still supplies the spatial direction.
    panner.rolloffFactor=0;
    // Play the original at 1x for every trip, including the entrance. The old
    // 4x time stretch introduced granular flutter into a smooth recording.
    source.buffer=buffer;source.loop=false;source.playbackRate.value=1;
    filter.type="lowpass";filter.frequency.value=3800;filter.Q.value=.2;
    const now=context.currentTime,level=SOUND_CUES[cue].level*(options.gain??1)*.28;
    const envelope=new Float32Array(256);for(let i=0;i<envelope.length;i++){const t=elapsed/air.duration+(1-elapsed/air.duration)*i/(envelope.length-1);envelope[i]=level*cameraPassGain(t,air.duration);}
    gain.gain.setValueCurveAtTime(envelope,now,air.duration-elapsed);
    source.connect(filter).connect(gain).connect(panner).connect(master);voices.add(source);
    motion={source,gain,panner,at:now-elapsed,duration,side,entrance};lastCue=cue;
    lastFlight={cue,lagMs:elapsed*1000,audioTime:now,duration};
    source.onended=()=>{voices.delete(source);if(motion?.source===source)motion=undefined;source.disconnect();filter.disconnect();gain.disconnect();panner.disconnect();};
    source.start(now,air.offset+elapsed);source.stop(now+air.duration-elapsed);
  }
  function startCue(cue:SoundCue,buffer:AudioBuffer,options:PlayOptions,offset=0){
    if(cue.startsWith("mario")&&!arcadeFocused)return;
    if(!context||context.state!=="running"||!master||!audible()||state.volume===0)return;
    const duration=options.duration??buffer.duration;
    if(!budget.accept(cue,context.currentTime,duration))return;
    const source=context.createBufferSource(),gain=context.createGain(),filter=context.createBiquadFilter(),pan=options.position?spatialPanner(options.position):context.createStereoPanner();
    if(cue==="hologram"&&"refDistance" in pan)pan.refDistance=12;
    source.buffer=buffer;source.playbackRate.value=buffer.duration/duration*(options.rate??1);
    const level=SOUND_CUES[cue].level*Math.max(0,Math.min(1,options.gain??1));
    const at=context.currentTime+Math.max(0,Math.min(.4,options.delay??0));
    const audibleDuration=(buffer.duration/source.playbackRate.value)-offset;
    const envelope=new Float32Array(64);
    for(let i=0;i<envelope.length;i++){const t=i/(envelope.length-1)*audibleDuration;envelope[i]=level*Math.min(1,t/.004,(audibleDuration-t)/.025);}
    gain.gain.setValueCurveAtTime(envelope,at,Math.max(.01,audibleDuration));
    filter.type="lowpass";filter.frequency.value=cue.startsWith("mario")?12000:cue==="arcadeSwitch"?7500:cue==="paper"?5200:cue==="hologram"?3800:4200;filter.Q.value=.35;
    if("pan" in pan)pan.pan.value=Math.max(-.7,Math.min(.7,options.pan??0));
    source.connect(filter).connect(gain).connect(pan).connect(master);voices.add(source);
    if(cue.startsWith("mario"))arcadeVoices.add(source);
    if(cue==="camera"||cue==="arrival"){
      if(motion){motion.gain.gain.setTargetAtTime(0,context.currentTime,.015);try{motion.source.stop(context.currentTime+.07);}catch{}}
      motion={source,gain};
    }
    lastCue=cue;
    source.onended=()=>{voices.delete(source);arcadeVoices.delete(source);if(motion?.source===source)motion=undefined;source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();};
    source.start(at,offset*source.playbackRate.value);
  }
  function synthesized(cue:SoundCue){
    if(!context)return null;
    const key=`synth/${cue}`;
    if(!buffers.has(key)){const data=renderCue(cue);const buffer=context.createBuffer(1,data.length,24000);buffer.copyToChannel(data,0);buffers.set(key,buffer);}
    return buffers.get(key)!;
  }
  function flushArrival(){
    if(!pendingArrival||context?.state!=="running"||!audible())return;
    const sample=cameraAirSample(),buffer=buffers.get(sample);if(!buffer){void loadSample(sample).then(value=>{if(value)flushArrival();});return;}
    const pending=pendingArrival,elapsed=clock()-pending.at;pendingArrival=undefined;
    // Buffers are warmed before the reveal. Never enter halfway through a flight.
    if(elapsed>.08)return;
    startAir("arrival",buffer,{duration:pending.duration,pan:-.12},Math.max(0,elapsed));
  }
  async function unlock(){
    restore();if(disposed||!state.available||state.muted)return;
    try{
      if(!context){
        context=new AudioContext({latencyHint:"interactive"});master=context.createGain();master.gain.value=0;
        const limiter=context.createDynamicsCompressor();
        limiter.threshold.value=-8;limiter.knee.value=8;limiter.ratio.value=8;limiter.attack.value=.003;limiter.release.value=.12;
        master.connect(limiter).connect(context.destination);
      }
      clearTimeout(shutdown);
      startMusic(); // Invoke media playback within the gesture whenever possible.
      if(context.state!=="running")await context.resume();
      await Promise.all(CAMERA_AIR.map(sample=>loadSample(sample.name)));
      if(disposed)return;
      await Promise.all(["hologram","arcadeSwitch"].flatMap(cue=>CUE_SAMPLES[cue as SoundCue]??[]).map(loadSample));
      if(disposed)return; // Warm reference effects before the first interaction.
      publish({unlocked:context.state==="running"});mix();flushArrival();void startBed();void startGrill();void prepare();startMusic();
      if(!attached)suspendLater(10000);
    }catch{publish({available:false,unlocked:false});}
  }
  function play(cue:SoundCue,options:PlayOptions={}){
    if(cue==="arrival"){
      if(!audible()||state.volume===0)return;
      pendingArrival={at:clock(),duration:options.duration??CAMERA_PASS.duration};flushArrival();return;
    }
    if(!audible()||state.volume===0)return;
    if(cue==="camera"||cue==="exit"){
      const sample=cameraAirSample(),buffer=buffers.get(sample),at=clock();
      if(buffer)startAir(cue,buffer,options);
      else void loadSample(sample).then(value=>{if(value&&clock()-at<.08)startAir(cue,value,options,clock()-at);});return;
    }
    const list=CUE_SAMPLES[cue],at=clock();
    if(list){
      const index=(variants.get(cue)??-1)+1;variants.set(cue,index);
      const name=list[index%list.length],cached=buffers.get(name);
      const natural={...options,rate:options.rate??(cue.startsWith("mario")||cue==="arcadeSwitch"||cue==="hologram"?1:[1,.975,1.025,.99][index%4])};
      if(cached)startCue(cue,cached,natural);
      else void loadSample(name).then(buffer=>{if(buffer&&clock()-at<.18)startCue(cue,buffer,natural);});
      // A vending machine has a coin rattle followed by the softer delivery clunk.
      if(cue==="machine"){const clunk=buffers.get("wood");if(clunk)startCue("wood",clunk,{gain:.28,delay:.22,pan:options.pan,position:options.position});}
    }else{const buffer=synthesized(cue);if(buffer)startCue(cue,buffer,options);}
  }
  const setMuted=(muted:boolean)=>{restore();publish({muted});persist();if(muted){silence();suspendLater();}else{mix();void unlock();}};
  const visibility=()=>{hidden=document.hidden;if(hidden){silence();suspendLater();}else if(state.unlocked&&!state.muted)void unlock();mix();};
  const gesture=(event:Event)=>{
    if(event.target instanceof Element&&event.target.closest("[data-sound-control]"))return;
    if(event.isTrusted&&!state.muted&&(context?.state!=="running"||(!music[state.musicPeriod]||music[state.musicPeriod]?.element.paused)&&state.musicVolume>0))void unlock();
  };
  return {
    subscribe:(fn:()=>void)=>{subscribers.add(fn);return()=>{subscribers.delete(fn);};},
    snapshot:()=>state,serverSnapshot:()=>INITIAL,unlock,play,prepare,
    arcadeFocus(focused:boolean){arcadeFocused=focused;if(!focused){for(const source of arcadeVoices){try{source.stop();}catch{}}arcadeVoices.clear();}},
    hold(value:boolean){held=value;if(value)silence();else{mix();if(state.unlocked&&!state.muted)void unlock();}},
    bindMedia(fn:(volume:number)=>void){outputs.add(fn);fn(audible()?state.volume:0);return()=>{outputs.delete(fn);};},
    attach(){
      restore();attached++;if(attached===1)publish({musicPeriod:"day"});hidden=document.hidden;clearTimeout(shutdown);void prepare();
      if(attached===1){document.addEventListener("pointerdown",gesture,true);document.addEventListener("keydown",gesture,true);document.addEventListener("visibilitychange",visibility);}
      if(state.unlocked&&!state.muted)void unlock();mix();
      let detached=false;
      return()=>{if(detached)return;detached=true;attached=Math.max(0,attached-1);if(attached)return;
        silence();media=false;suspendLater();document.removeEventListener("pointerdown",gesture,true);document.removeEventListener("keydown",gesture,true);document.removeEventListener("visibilitychange",visibility);
      };
    },
    toggle(){setMuted(state.unlocked?!state.muted:false);},enable(){setMuted(false);},mute(){setMuted(true);},
    volume(value:number){if(!Number.isFinite(value))return;restore();publish({volume:Math.max(0,Math.min(1,value))});persist();mix();if(value<=0){silence();suspendLater();}else if(!state.muted)void unlock();},
    musicVolume(value:number){if(!Number.isFinite(value))return;restore();publish({musicVolume:Math.max(0,Math.min(1,value))});persist();mix();startMusic();},
    media(audible:boolean){media=audible;mix();},
    listener(position:SoundPoint,forward:SoundPoint,up:SoundPoint){
      listenerPose={position:{...position},forward:{...forward},up:{...up}};
      if(!context||context.state!=="running")return;
      const listener=context.listener;
      for(const [param,value] of [[listener.positionX,position.x],[listener.positionY,position.y],[listener.positionZ,position.z],[listener.forwardX,forward.x],[listener.forwardY,forward.y],[listener.forwardZ,forward.z],[listener.upX,up.x],[listener.upY,up.y],[listener.upZ,up.z]] as const)ramp(param,value,.025);
      if(motion?.panner&&motion.at!==undefined&&motion.duration){positionPanner(motion.panner,listenerToWorld(airPass((context.currentTime-motion.at)/motion.duration,motion.side??1,motion.entrance),position,forward,up));}
    },
    update(_distance:number,_speed:number,night:number,isInspecting:boolean){
      inspecting=isInspecting;mixGrill();
      bedLevel=inspecting?.005:.018;if(bed)ramp(bed.gain.gain,bedLevel,.5);
      const period:MusicPeriod=night>=.5?"night":"day";
      if(state.musicPeriod!==period){publish({musicPeriod:period});startMusic();}
    },
    diagnostics:()=>({context:context?.state??"locked",gain:master?.gain.value??0,voices:voices.size,beds:bed?1:0,grill:!!grill,grillGain:grill?.gain.gain.value??0,music:Object.values(music).some(player=>!player.element.paused),musicGain:music[activeMusic]?.gain.gain.value??0,musicPeriod:activeMusic,musicTracks:Object.fromEntries(Object.entries(music).map(([period,player])=>[period,{playing:!player.element.paused,gain:player.gain.gain.value}])),spatial:!!motion?.panner,loaded:buffers.size,lastCue,lastFlight}),
    dispose(){disposed=true;attached=0;silence();for(const player of Object.values(music)){player.source.disconnect();player.gain.disconnect();player.element.removeAttribute("src");player.element.load();}clearTimeout(shutdown);void context?.close().catch(()=>{});document.removeEventListener("pointerdown",gesture,true);document.removeEventListener("keydown",gesture,true);document.removeEventListener("visibilitychange",visibility);subscribers.clear();outputs.clear();},
  };
}
const scope=globalThis as typeof globalThis & {__ddWorldSoundV6?:{dispose():void};__ddWorldSoundV7?:{dispose():void};__ddWorldSoundV8?:{dispose():void};__ddWorldSoundV9?:{dispose():void};__ddWorldSoundV10?:{dispose():void};__ddWorldSoundV11?:{dispose():void};__ddWorldSoundV12?:{dispose():void};__ddWorldSoundV13?:{dispose():void};__ddWorldSoundV14?:{dispose():void};__ddWorldSoundV15?:{dispose():void};__ddWorldSoundV16?:ReturnType<typeof createWorldSound>};
if(typeof window!=="undefined")for(const key of ["__ddWorldSoundV6","__ddWorldSoundV7","__ddWorldSoundV8","__ddWorldSoundV9","__ddWorldSoundV10","__ddWorldSoundV11","__ddWorldSoundV12","__ddWorldSoundV13","__ddWorldSoundV14","__ddWorldSoundV15"] as const){scope[key]?.dispose();delete scope[key];}
export const worldSound=typeof window==="undefined"?createWorldSound():(scope.__ddWorldSoundV16??=createWorldSound());
