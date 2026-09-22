/** Only the 3D cottage is pixelated. Never resize portfolio photos or terminal UI. */
export function roomRenderSize(width:number,height:number) {
  const scale=Math.min(1/1.5,960/Math.max(1,width),600/Math.max(1,height));
  return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))};
}
