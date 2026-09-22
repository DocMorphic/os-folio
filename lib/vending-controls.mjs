// Shared face coordinates keep the DOM hit areas aligned with the physical keys.
export const VENDING_FACE={x:-.04,y:1.41,z:.743,width:.9,height:1.26};
export const VENDING_KEYS=[
  {id:'previous',label:'◀',x:-.235,y:.65,width:.25,height:.11},
  {id:'next',label:'▶',x:.155,y:.65,width:.25,height:.11},
];
export const BOTTLE_SLOTS=Array.from({length:9},(_,index)=>({id:`bottle-${index}`,x:-.32+(index%3)*.28,y:1.66-Math.floor(index/3)*.35,width:.24,height:.32}));
export const BOTTLE_PICKUP={x:-.06,y:.40,width:.72,height:.22};
export function vendingHitStyle(key){
  const f=VENDING_FACE;
  return {left:`${(key.x-f.x+f.width/2-key.width/2)/f.width*100}%`,top:`${(f.y+f.height/2-key.y-key.height/2)/f.height*100}%`,width:`${key.width/f.width*100}%`,height:`${key.height/f.height*100}%`};
}
export function vendingPage(entries,page){
  const pages=Math.max(1,Math.ceil(entries.length/9)),current=Math.max(0,Math.min(pages-1,page));
  return {page:current,pages,slots:Array.from({length:9},(_,index)=>entries[current*9+index]??null)};
}
