import {dvdPosition,DVD_WIDTH,DVD_HEIGHT} from "./dvd-screensaver";

/** The same CRT screensaver as the desktop toy, painted into the real screen. */
export function drawTramDVD(ctx:CanvasRenderingContext2D,time:number,ink:{left:number;right:number;top:number;bottom:number}){
  const logo=dvdPosition(time);
  ctx.fillStyle="#06100e";ctx.fillRect(0,0,512,352);
  ctx.save();ctx.translate(logo.x,logo.y);
  ctx.scale(DVD_WIDTH/(ink.right-ink.left),DVD_HEIGHT/(ink.bottom-ink.top));ctx.translate(-ink.left,-ink.top);
  ctx.fillStyle=logo.color;ctx.shadowColor=logo.color;ctx.shadowBlur=5;
  ctx.font="italic 900 80px Arial, sans-serif";ctx.fillText("DVD",0,72);
  ctx.beginPath();ctx.ellipse(90,88,85,9,0,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;ctx.fillStyle="#06100e";ctx.beginPath();ctx.ellipse(90,88,26,3,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=logo.color;ctx.font="bold 14px Arial, sans-serif";ctx.fillText("V I D E O",59,111);ctx.restore();
  ctx.fillStyle="rgba(0,0,0,.12)";for(let y=0;y<352;y+=4)ctx.fillRect(0,y,512,1);
}
