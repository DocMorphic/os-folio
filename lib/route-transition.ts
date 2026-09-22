/** Persistent handoff state; never imports Three.js or mounts a second world. */
export type JourneyState={destination:"world"|"desktop";started:number;ready:boolean;slow:boolean};
let state:JourneyState|null=null;
let pending:{presented:Promise<void>;present():void;game:Promise<void>;gameReady():void;timeout:ReturnType<typeof setTimeout>}|null=null;
const listeners=new Set<()=>void>();
const emit=()=>listeners.forEach(fn=>fn());
export const journeyStore={subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},snapshot:()=>state,serverSnapshot:()=>null};
export const isReturningToDesktop=()=>state?.destination==="desktop";
export const journeyPresented=()=>pending?.presented??Promise.resolve();
export function journeyGameReady(){pending?.gameReady();}
export function journeyGamePainted():Promise<void>{
  if(!pending)return Promise.resolve();
  const game=pending.game;
  // A blocked iframe must never block the portfolio itself.
  return new Promise(resolve=>{const timer=setTimeout(resolve,1200);void game.then(()=>{clearTimeout(timer);resolve();});});
}
function begin(destination:JourneyState["destination"]){
  if(pending)return false;
  let present!:()=>void;
  const presented=new Promise<void>(resolve=>{present=resolve;});
  let gameReady!:()=>void;const game=new Promise<void>(resolve=>{gameReady=resolve;});
  state={destination,started:Date.now(),ready:false,slow:false};
  pending={presented,present,game,gameReady,timeout:setTimeout(()=>{if(state){state={...state,slow:true};emit();}},15000)};
  emit();return true;
}
export function beginWorldVisit(){begin("world");}
export function routeReady(destination:JourneyState["destination"]){
  if(state?.destination!==destination)return;
  if(pending)clearTimeout(pending.timeout);
  state={...state,ready:true};emit();
}
export function finishJourney(){
  if(!state?.ready||!pending)return;
  const {present,gameReady,timeout}=pending;clearTimeout(timeout);pending=null;state=null;emit();gameReady();present();
}
export function navigateImmersive(path:"/v2"|"/#about",push:(path:string)=>void){
  if(!begin(path==="/v2"?"world":"desktop"))return;
  // Paint the game before mounting OR tearing down an expensive route tree.
  const current=pending;
  void journeyGamePainted().then(()=>{if(pending===current)push(path);});
}
