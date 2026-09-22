"use client";
import {useEffect,useRef,useState,useSyncExternalStore,useId} from "react";
import {worldSound} from "@/lib/world-sound";
import {WORLD_MUSIC} from "@/lib/spatial-sound";
import styles from "./WorldSoundControl.module.css";

export function WorldSoundControl(){
  const sound=useSyncExternalStore(worldSound.subscribe,worldSound.snapshot,worldSound.serverSnapshot);
  const track=WORLD_MUSIC[sound.musicPeriod];
  const root=useRef<HTMLDivElement>(null);
  const [expanded,setExpanded]=useState(false),panelId=useId();
  useEffect(()=>{
    if(!expanded)return;
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setExpanded(false);};
    document.addEventListener("pointerdown",close);return()=>document.removeEventListener("pointerdown",close);
  },[expanded]);
  useEffect(()=>{
    if(process.env.NODE_ENV!=="development")return;
    const timer=setInterval(()=>{if(root.current)root.current.dataset.audioDiagnostics=JSON.stringify(worldSound.diagnostics());},200);
    return()=>clearInterval(timer);
  },[]);
  return <div ref={root} className={styles.control} data-sound-control onPointerDown={event=>event.stopPropagation()} onClick={event=>event.stopPropagation()}>
    <button disabled={!sound.available} type="button" onClick={()=>worldSound.toggle()} aria-pressed={sound.unlocked&&!sound.muted} aria-label={sound.muted?"Enable world sound":sound.unlocked?"Mute all sound":"Enable sound"}>
      <span aria-hidden="true">{sound.muted?"♩":"♫"}</span><span className={styles.label}> {!sound.available?"Unavailable":!sound.unlocked?"Enable sound":sound.muted?"Sound off":"Sound on"}</span>
    </button>
    <button type="button" aria-label="Sound settings" aria-expanded={expanded} aria-controls={panelId} onClick={()=>setExpanded(value=>!value)}>⌄</button>
    <div id={panelId} className={styles.volume} data-open={expanded} inert={!expanded}>
      <label>All sound <output>{Math.round(sound.volume*100)}%</output><input aria-label="World sound volume" type="range" min="0" max="100" step="1" value={Math.round(sound.volume*100)} onChange={event=>worldSound.volume(Number(event.target.value)/100)}/></label>
      <label>Music <output>{Math.round(sound.musicVolume*100)}%</output><input aria-label="Background music volume" type="range" min="0" max="100" step="1" value={Math.round(sound.musicVolume*100)} onChange={event=>worldSound.musicVolume(Number(event.target.value)/100)}/></label>
      <small>{track.title} — {track.artist}<br/>{sound.musicPeriod==="day"?"Daytime":"Nighttime"} soundtrack</small>
    </div>
  </div>;
}
