"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./TramTelevision.module.css";
import { worldSound } from "@/lib/world-sound";

type Player = {
  playVideo():void; pauseVideo():void; mute():void; unMute():void;
  isMuted():boolean; destroy():void; getIframe():HTMLIFrameElement;
  setVolume(volume:number):void;
};
type YouTube = { Player:new (host:HTMLElement, options:Record<string,unknown>)=>Player };
type YouTubeWindow = Window & { YT?:YouTube; onYouTubeIframeAPIReady?:()=>void };
let apiPromise:Promise<YouTube>|undefined;
function loadPlayer(){
  const browser=window as YouTubeWindow;
  if(browser.YT?.Player)return Promise.resolve(browser.YT);
  if(!apiPromise)apiPromise=new Promise<YouTube>((resolve,reject)=>{
    const previous=browser.onYouTubeIframeAPIReady;
    browser.onYouTubeIframeAPIReady=()=>{
      previous?.();
      if(browser.YT)resolve(browser.YT);
    };
    const script=document.createElement("script");
    script.src="https://www.youtube.com/iframe_api";
    script.async=true;
    script.onerror=()=>{script.remove();apiPromise=undefined;reject(new Error("YouTube unavailable"));};
    document.head.append(script);
  });
  return apiPromise;
}

/** One persistent player: hovering must never reload the film or reset its time. */
export function TramTelevision(){
  const host=useRef<HTMLDivElement>(null),player=useRef<Player|null>(null);
  const wantsAudio=useRef(false);
  const [ready,setReady]=useState(false),[playing,setPlaying]=useState(true),[muted,setMuted]=useState(true),[failed,setFailed]=useState(false);
  useEffect(()=>{
    worldSound.media(playing&&!muted);
    return()=>worldSound.media(false);
  },[playing,muted]);
  useEffect(()=>{
    if(!ready)return;
    return worldSound.bindMedia(volume=>{
      const p=player.current;if(!p)return;
      p.setVolume(Math.round(volume*100));
      const silent=volume===0||!wantsAudio.current;
      if(silent)p.mute();else p.unMute();
      setMuted(silent);
    });
  },[ready]);
  useEffect(()=>{
    let cancelled=false,instance:Player|undefined;
    loadPlayer().then(api=>{
      if(cancelled||!host.current)return;
      // The API owns this child; React owns only its surrounding mount.
      const mount=document.createElement("div");host.current.append(mount);
      instance=new api.Player(mount,{
        host:"https://www.youtube-nocookie.com",width:640,height:360,videoId:"MPiILYNStd8",
        playerVars:{origin:window.location.origin,playsinline:1,rel:0,autoplay:1,mute:1,loop:1,playlist:"MPiILYNStd8",controls:0,disablekb:1},
        events:{
          onReady:({target}:{target:Player})=>{
            if(cancelled)return;
            player.current=target;
            const frame=target.getIframe();frame.title='"Hog Hunt" — animation by SAD-ist';frame.tabIndex=-1;
            target.setVolume(Math.round(worldSound.snapshot().volume*100));target.mute();target.playVideo();setReady(true);
          },
          onStateChange:({data}:{data:number})=>{if(!cancelled)setPlaying(data===1||data===3);},
          onError:()=>{if(!cancelled)setFailed(true);},
        },
      });
    }).catch(()=>{if(!cancelled)setFailed(true);});
    return()=>{cancelled=true;player.current=null;instance?.destroy();};
  },[]);
  return <div className={styles.player}>
    <div ref={host} className={styles.video}/>
    <div className={styles.controls} role="group" aria-label="Television playback">
      {failed?<a href="https://www.youtube.com/watch?v=MPiILYNStd8" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>:<>
        <button disabled={!ready} onClick={()=>{if(playing)player.current?.pauseVideo();else player.current?.playVideo();}}>{playing?"Pause":"Play"}</button>
        <button disabled={!ready} onClick={()=>{const p=player.current;if(!p)return;wantsAudio.current=muted;if(wantsAudio.current){if(worldSound.snapshot().volume===0)worldSound.volume(.45);worldSound.enable();p.setVolume(Math.round(worldSound.snapshot().volume*100));p.unMute();}else p.mute();setMuted(!wantsAudio.current);}}>{muted?"Sound on":"Mute"}</button>
      </>}
    </div>
  </div>;
}
