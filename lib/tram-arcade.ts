/** Original NES artwork, not a redrawn Mario lookalike. See the asset manifest
 * in public/assets/arcade/SOURCES.md for Nintendo/source attribution. */
export const ARCADE_SPRITES={
  mario:"mario-walk-atlas.png",jump:"jump.png",goomba:"goomba-atlas.png",
  ground:"ground.png",brick:"brick.png",question:"question-atlas.png",
  pipe:"pipe.png",cloud:"cloud.png",hill:"hill.png",bush:"bush.png",hud:"screenshot.png",
} as const;
export type ArcadeSprites=Record<keyof typeof ARCADE_SPRITES,CanvasImageSource>;
export const ARCADE_RENDER_SCALE=4;

// A scripted attract loop, not an emulator or playable Mario game.
// Coordinates use the original 256 × 240 raster and 16px tile grid.
export const ARCADE_JUMPS=[{start:380,width:156,height:76},{start:552,width:160,height:92},{start:736,width:176,height:104},{start:928,width:176,height:104}];
export function arcadeEvents(from:number,to:number):("marioJump"|"marioCoin")[]{
  if(to<=from||to-from>.3)return []; // Never replay missed events on tab / view return.
  const events:("marioJump"|"marioCoin")[]=[];
  for(let cycle=Math.floor(from/26);cycle<=Math.floor(to/26);cycle++)for(const jump of ARCADE_JUMPS){
    const start=cycle*26+(jump.start-40)/44,coin=start+jump.width/88;
    if(from<start&&to>=start)events.push("marioJump");
    if(from<coin&&to>=coin)events.push("marioCoin");
  }
  return events;
}
export function arcadePose(seconds:number){
  const x=40+(Math.max(0,seconds)%26)*44;
  const jump=ARCADE_JUMPS.find(j=>x>=j.start&&x<=j.start+j.width);
  const t=jump?(x-jump.start)/jump.width:0;
  return {x,scroll:Math.max(0,Math.floor(x-88)),height:jump?4*jump.height*t*(1-t):0,frame:Math.floor(seconds*10)%3};
}

export function drawMarioArcade(ctx:CanvasRenderingContext2D,seconds:number,images:ArcadeSprites){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);
  const pose=arcadePose(seconds),scroll=pose.scroll,ground=208;
  ctx.imageSmoothingEnabled=false;ctx.fillStyle="#9290ff";ctx.fillRect(0,0,256,240);
  const sprite=(name:keyof ArcadeSprites,x:number,y:number,w:number,h:number)=>ctx.drawImage(images[name],Math.round(x-scroll),Math.round(y),w,h);
  for(let x=0;x<1400;x+=384){
    sprite("hill",x,ground-40,80,40);sprite("hill",x+248,ground-24,48,24);
    sprite("bush",x+176,ground-32,64,32);
    sprite("cloud",x+136,48,32,24);sprite("cloud",x+304,64,32,24);
  }
  for(let x=Math.floor(scroll/16)*16;x<scroll+272;x+=16){
    sprite("ground",x,ground,16,16);sprite("ground",x,ground+16,16,16);
  }
  const blocks=[{x:256,y:144,q:true},{x:320,y:144,q:false},{x:336,y:144,q:true},{x:352,y:144,q:false},{x:368,y:144,q:true},{x:384,y:144,q:false},{x:352,y:80,q:true}];
  const phase=seconds%.9,questionFrame=phase<.6?Math.floor(phase/.15):4;
  for(const block of blocks){
    if(block.q)ctx.drawImage(images.question,questionFrame*16,0,16,16,block.x-scroll,block.y,16,16);
    else sprite("brick",block.x,block.y,16,16);
  }
  for(const [x,height] of [[448,32],[608,48],[800,64],[992,64]]){
    // Preserve the original pipe rim; extend only its repeatable stem tile.
    ctx.drawImage(images.pipe,0,0,32,16,x-scroll,ground-height,32,16);
    for(let y=ground-height+16;y<ground;y+=16)ctx.drawImage(images.pipe,0,16,32,16,x-scroll,y,32,16);
  }
  for(const start of [416,778,970]){
    const x=start-Math.sin(seconds*.7)*4;
    ctx.drawImage(images.goomba,Math.floor(seconds*5)%2*16,0,16,16,Math.round(x-scroll),ground-16,16,16);
  }
  const mx=Math.round(pose.x-scroll),my=Math.round(ground-16-pose.height);
  // Coins sit at the jump apex; the same coordinate drives collection audio.
  for(const jump of ARCADE_JUMPS){
    const x=jump.start+jump.width*.5,age=(pose.x-x)/44,cx=Math.round(x-scroll),cy=ground-8-jump.height;
    if(age<0){ctx.fillStyle="#d87800";ctx.fillRect(cx-4,cy-6,8,12);ctx.fillStyle="#fff09a";ctx.fillRect(cx-2,cy-5,3,9);}
    else if(age<.35){ctx.fillStyle="#fff5be";ctx.fillRect(cx-8,cy-age*36,3,2);ctx.fillRect(cx+7,cy-age*36,3,2);}
  }
  if(pose.height>0)ctx.drawImage(images.jump,mx,my,16,16);
  else ctx.drawImage(images.mario,pose.frame*16,0,16,16,mx,my,16,16);
  // Original game HUD retains the exact 8-bit lettering, spacing and palette.
  ctx.drawImage(images.hud,0,0,256,32,0,0,256,32);
  ctx.restore();
}

export function drawArcadeCredits(ctx:CanvasRenderingContext2D,seconds:number){
  ctx.save();ctx.setTransform(ARCADE_RENDER_SCALE,0,0,ARCADE_RENDER_SCALE,0,0);ctx.imageSmoothingEnabled=true;
  ctx.fillStyle="#100e27";ctx.fillRect(0,0,256,240);
  ctx.strokeStyle="#30204b";ctx.lineWidth=1;
  for(let x=0;x<256;x+=16){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,240);ctx.stroke();}
  for(let y=0;y<240;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
  ctx.textAlign="center";ctx.font="bold 18px monospace";ctx.fillStyle="#91f6df";ctx.fillText("CREDITS",128,31);
  const lines=[["MADE BY","DHARMAY DAVE"],["WORLD INSPIRATION","JESSE ZHOU"],["3D ENGINE","THREE.JS"],["MARIO CHARACTERS / ART","NINTENDO"]];
  lines.forEach(([role,name],i)=>{const y=58+i*38;ctx.font="9px monospace";ctx.fillStyle="#c3aedb";ctx.fillText(role,128,y);ctx.font="bold 14px monospace";ctx.fillStyle=i===1?"#ffda8f":"#f4eee4";ctx.fillText(name,128,y+17);});
  ctx.fillStyle=Math.sin(seconds*2)>.0?"#91f6df":"#68baa9";ctx.font="10px monospace";ctx.fillText("TAP SCREEN FOR MARIO",128,225);
  ctx.restore();
}

export function createMarioArcade(ctx:CanvasRenderingContext2D){
  let disposed=false,loaded=false,lastDraw:number|null=null,mode:"mario"|"credits"="mario";
  const resizeDisplay=()=>{if(typeof ctx.canvas?.width==="number"){const scale=mode==="credits"?ARCADE_RENDER_SCALE:1;ctx.canvas.width=256*scale;ctx.canvas.height=240*scale;}};
  const images={} as Record<keyof ArcadeSprites,HTMLImageElement>;
  ctx.fillStyle="#080808";ctx.fillRect(0,0,256,240);
  const ready=typeof Image==="undefined"?Promise.resolve():Promise.all(Object.entries(ARCADE_SPRITES).map(([key,file])=>new Promise<void>((resolve,reject)=>{
    const image=new Image();images[key as keyof ArcadeSprites]=image;
    image.onload=()=>resolve();image.onerror=()=>reject(new Error(`Arcade asset unavailable: ${file}`));
    image.src=`/assets/arcade/${file}`;
  }))).then(()=>{if(!disposed){loaded=true;if(mode==="credits")drawArcadeCredits(ctx,0);else drawMarioArcade(ctx,0,images);}});
  return {ready,getMode:()=>mode,toggle:()=>{mode=mode==="mario"?"credits":"mario";resizeDisplay();lastDraw=null;if(mode==="credits")drawArcadeCredits(ctx,0);else if(loaded)drawMarioArcade(ctx,0,images);return mode;},draw:(seconds:number)=>{if(disposed)return [];if(mode==="credits"){drawArcadeCredits(ctx,seconds);lastDraw=seconds;return [];}if(!loaded)return [];const events=lastDraw===null?[]:arcadeEvents(lastDraw,seconds);lastDraw=seconds;drawMarioArcade(ctx,seconds,images);return events;},dispose:()=>{
    disposed=true;for(const image of Object.values(images)){image.onload=null;image.onerror=null;}
  }};
}
