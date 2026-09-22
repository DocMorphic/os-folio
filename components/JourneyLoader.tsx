"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from "react";
import {journeyStore,finishJourney,journeyGameReady} from "@/lib/route-transition";
import {worldSound} from "@/lib/world-sound";
import {createLoadingRun,loadingScore} from "@/lib/journey-progress";
import styles from "./JourneyLoader.module.css";

export function JourneyLoader(){
  const journey=useSyncExternalStore(journeyStore.subscribe,journeyStore.snapshot,journeyStore.serverSnapshot);
  useEffect(()=>{
    // Warm only the tiny runner assets, never the 3D scene, during desktop idle.
    const timer=setTimeout(()=>{
      for(const asset of ["index.html","offline.js","adapter.js?v=3",devicePixelRatio>1?"200-offline-sprite.png":"100-offline-sprite.png"])
        void fetch(`/vendor/chromium-dino/${asset}`,{cache:"force-cache",priority:"low"}).catch(()=>{});
    },1500);
    return()=>clearTimeout(timer);
  },[]);
  return journey?<Loader key={journey.started}/>:null;
}
function Loader(){
  const journey=useSyncExternalStore(journeyStore.subscribe,journeyStore.snapshot,journeyStore.serverSnapshot)!;
  const root=useRef<HTMLDivElement>(null),game=useRef<HTMLIFrameElement>(null),button=useRef<HTMLButtonElement>(null);
  const [fading,setFading]=useState(false),[minimumPassed,setMinimumPassed]=useState(false);
  const [run]=useState(createLoadingRun),[gameStarted,setGameStarted]=useState<number|null>(null),[progress,setProgress]=useState(0);
  const completedAt=useRef<number|null>(null);
  const gameHasStarted=useRef(false);
  const leaving=useRef(false),leaveTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const audioTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const canBegin=journey.ready&&minimumPassed;
  const actionLabel=journey.destination==="desktop"?"Exit":"Begin";
  useEffect(()=>{
    const ready=(event:MessageEvent)=>{
      if(gameHasStarted.current||event.source!==game.current?.contentWindow||event.data?.type!=="runner-ready")return;
      gameHasStarted.current=true;completedAt.current=null;setGameStarted(performance.now());journeyGameReady();
    };
    window.addEventListener("message",ready);
    return()=>window.removeEventListener("message",ready);
  },[]);
  const gameLoaded=()=>game.current?.contentWindow?.postMessage({type:"runner-ready-request"},"*");
  useEffect(()=>{
    if(gameStarted===null)return;
    let frame=0,lastScore=-1;
    const tick=(now:number)=>{
      const score=Math.min(journey.ready?100:99,loadingScore(now-gameStarted,run));
      if(score!==lastScore){
        lastScore=score;setProgress(score);
        game.current?.contentWindow?.postMessage({type:"runner-progress",score},"*");
      }
      if(score===100&&completedAt.current===null)completedAt.current=now;
      if(journey.ready&&now-gameStarted>=run.duration&&completedAt.current!==null&&now-completedAt.current>=180){setMinimumPassed(true);return;}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return()=>cancelAnimationFrame(frame);
  },[gameStarted,journey.ready,run]);
  const begin=()=>{
    if(!canBegin||leaving.current)return;
    leaving.current=true;
    // Begin is the audio-unlock gesture. Keep the camera held until uncovered.
    const audioReady=journey.destination==="world"?worldSound.unlock():Promise.resolve();
    const audioDeadline=new Promise<void>(resolve=>{audioTimer.current=setTimeout(resolve,1200);});
    const primed=Promise.race([audioReady,audioDeadline]).finally(()=>{if(audioTimer.current)clearTimeout(audioTimer.current);});
    setFading(true);
    leaveTimer.current=setTimeout(()=>{void primed.then(()=>{if(!root.current)return;worldSound.hold(false);finishJourney();});},matchMedia("(prefers-reduced-motion: reduce)").matches?0:480);
  };
  useEffect(()=>{
    worldSound.hold(true);void worldSound.prepare();
    const element=root.current;
    const original=new Map<HTMLElement,boolean>();
    // The world portal owns its own inert state; don't restore its warming value.
    const shield=()=>{for(const el of Array.from(document.body.children))if(el instanceof HTMLElement&&!el.contains(element)&&!el.querySelector(".portfolio-room")&&!original.has(el)){original.set(el,el.inert);el.inert=true;}};
    shield();const observer=new MutationObserver(shield);observer.observe(document.body,{childList:true});element?.focus();
    const key=(event:KeyboardEvent)=>{
      if(game.current&&[" ","ArrowUp","ArrowDown","Enter"].includes(event.key)){
        event.preventDefault();event.stopImmediatePropagation();
        game.current?.contentWindow?.postMessage({type:"runner-key",key:event.key,down:event.type==="keydown"},"*");
      }
      if(event.type==="keydown"&&event.key==="Tab"){
        event.preventDefault();
        if(button.current)button.current.focus();else game.current?.focus();
      }
    };
    document.addEventListener("keydown",key,true);document.addEventListener("keyup",key,true);
    return()=>{observer.disconnect();original.forEach((inert,el)=>{if(!el.querySelector(".portfolio-room"))el.inert=inert;});document.removeEventListener("keydown",key,true);document.removeEventListener("keyup",key,true);worldSound.hold(false);if(leaveTimer.current)clearTimeout(leaveTimer.current);if(audioTimer.current)clearTimeout(audioTimer.current);};
  },[]);
  useEffect(()=>{if(canBegin)button.current?.focus({preventScroll:true});},[canBegin]);
  return <div ref={root} className={`${styles.cover} ${fading?styles.leaving:""}`} role="dialog" aria-modal="true" aria-label={canBegin?`Ready to ${actionLabel.toLowerCase()}`:"Loading"} tabIndex={-1}>
    {canBegin
      ?<button ref={button} className={styles.begin} type="button" aria-label={actionLabel} disabled={fading} onClick={begin}><span aria-hidden="true" className={styles.word}>{Array.from(actionLabel).map((letter,index)=><span key={index}>{letter}</span>)}</span></button>
      :<div className={styles.loadingGame}>
        <iframe ref={game} className={styles.game} src="/vendor/chromium-dino/index.html" onLoad={gameLoaded} title="Chrome dinosaur game — Space or tap to jump, Down to duck" sandbox="allow-scripts"/>
        <div className={styles.loadingTrack} role="progressbar" aria-label="Loading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{transform:`scaleX(${progress/100})`}}/></div>
      </div>}
    {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- A failed route must reset the persistent journey store via a full navigation. */}
    {!journey.ready&&journey.slow&&<a className={styles.recovery} href="/">Back to desktop</a>}
  </div>;
}
